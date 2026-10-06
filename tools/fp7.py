# -*- coding: utf-8 -*-
"""Session 7 focus — The wire & the machine (deck U7, labs/session07.md).

Sources: u8.pptx (slides cited from its real numbering; 26-30 are the self-study
appendix), session7_talking_points.md, labs/session07.md (steps 1-5).
Every `code` snippet is compiled and run by tools/validate_focus.py.
"""

FILE_SCOPE = {"v_s7_c3": 6, "v_s7_c4": 7}   # "v_s7_cK": leading lines at file scope

S = {
"n": 7,
"focus": "The wire & the machine",
"tagline": "Parse a wire message in tens of nanoseconds without allocating, never block on a socket, and know which machine-level knobs buy the last microseconds.",
"concepts": [
 {"title": "FIX: tag=value, the lingua franca of order entry",
  "text": "FIX is text: an integer tag, '=', the value, then the SOH byte (0x01), with a session layer of logon, heartbeats, sequence numbers and resends on top. BeginString (8=) and BodyLength (9=) come first on purpose, so a reader knows exactly where the message ends, and CheckSum (10=) is the byte sum of everything before it, mod 256. It is ubiquitous for orders and rare for fast market data, because reading it means scanning every byte and converting ASCII digits to numbers. HW 7 part 1 is that loop done properly: one forward pass over tags 11/55/54/38/44, no allocation, the ClOrdID kept as a view into the buffer, and false on malformed input — and no assumption about the order of body tags.",
  "code": """const char* msg = "35=D\\00155=NVDA\\00154=1\\00138=200\\00144=182.50\\001";
for (const char* p = msg; *p; ) {
  int tag = 0;
  while (*p != '=') tag = tag * 10 + (*p++ - '0');    // digit math, per byte
  const char* v = ++p;                                // skip '='
  while (*p && *p != '\\001') ++p;                     // scan to the SOH
  if (tag == 55 || tag == 44) std::printf("%d=%.*s ", tag, int(p - v), v);
  if (*p) ++p;                                        // skip the SOH
}
std::puts("");
// 55=NVDA 44=182.50""",
  "deck": "Deck U7 · slides 5, 29"},
 {"title": "Binary feeds: decode is a load and a byte swap",
  "text": "Fast venues abandon text. ITCH/OUCH-style messages are fixed-width — an 18-byte add-order is type, id, side, quantity and price at known offsets — prices are scaled integers (1825000 means 182.50), and the wire is big-endian. So decoding is a bounds-and-type check, then a memcpy and a byte swap per field: no delimiter scan, no atoi, no allocation. Use memcpy, not reinterpret_cast of a packed struct onto the buffer: the cast is alignment and strict-aliasing undefined behaviour, and an 8-byte memcpy compiles to one load anyway. When you want a schema instead of hand-rolled offsets, SBE is this same layout with codegen; FlatBuffers reads fields in place; Protobuf must decode into objects first.",
  "code": """inline std::uint32_t be32(const std::uint8_t* p) {
  std::uint32_t v; std::memcpy(&v, p, 4); return __builtin_bswap32(v); }
int main() {       // wire: [type 1][id 8][side 1][qty 4][px 4] = 18 bytes, big-endian
  std::uint8_t w[18]{}; w[0] = 'A'; w[9] = 'B'; std::size_t n = sizeof w;
  std::uint32_t q = __builtin_bswap32(100), px = __builtin_bswap32(1825000);
  std::memcpy(w + 10, &q, 4); std::memcpy(w + 14, &px, 4);   // as the venue sent it
  if (n < 18 || w[0] != 'A') return 1;                       // bounds + type FIRST
  std::printf("%c qty=%u px=%.2f\\n", char(w[9]), be32(w + 10), be32(w + 14) / 10000.0);
}
// B qty=100 px=182.50     -- no delimiter scan, no atoi, no allocation""",
  "deck": "Deck U7 · slides 6, 27"},
 {"title": "TCP for orders, UDP multicast for data — and the sequence number",
  "text": "Orders and market data make opposite transport choices. Order entry uses TCP because an order must never be lost — and TCP's failure mode is delay: one lost segment stalls every byte behind it (head-of-line blocking), and Nagle coalesces small writes unless you set TCP_NODELAY. Market data is UDP multicast: the venue sends each packet once and the switches fan it out, whole datagrams or nothing, and UDP's failure mode is loss, which shows up as a sequence gap. Venues publish identical A/B feeds on separate paths; you take whichever copy lands first. Track the next expected sequence number: lower is a duplicate (the slower A/B copy), higher is a gap, and until snapshot-plus-increment recovery completes the book is stale — stop quoting that symbol.",
  "code": """struct SeqTracker { enum Verdict { APPLY, DUP, GAP };
  std::uint64_t next = 1; bool stale = false;
  Verdict on_msg(std::uint64_t seq) {
    if (seq < next) return DUP;                      // the slower A/B copy
    if (seq > next) { stale = true; return GAP; }    // loss: stop quoting
    ++next; return APPLY; } };
SeqTracker t; const char* v[] = {"APPLY", "DUP", "GAP"};
for (std::uint64_t s : {1, 2, 2, 3, 5}) std::printf("%s ", v[t.on_msg(s)]);
std::printf("| next=%llu stale=%d\\n", (unsigned long long)t.next, int(t.stale));
// APPLY APPLY DUP APPLY GAP | next=4 stale=1""",
  "deck": "Deck U7 · slides 7–8"},
 {"title": "Framing inside a non-blocking read loop",
  "text": "A TCP socket delivers bytes, not messages: one recv can return half a message or three, and assuming otherwise is the most common networking bug in student code. Length-prefix framing reads the header, waits for the whole body, dispatches a view (no copy), and returns how much it consumed so the caller keeps the partial tail — and it validates the length against a maximum before trusting it, because a corrupt length is a buffer overrun. The framer runs inside a readiness loop: the fd is O_NONBLOCK, poll/epoll/kqueue says it is readable, and the handler drains into one buffer allocated once until recv returns EAGAIN, which means “drained”, not an error. Edge-triggered mode fires once, so stopping early strands the rest of the bytes with no new wake-up.",
  "code": """using Handler = void (*)(const std::uint8_t*, std::size_t);
std::size_t drain_frames(const std::uint8_t* buf, std::size_t len, Handler on_msg) {
  std::size_t off = 0; while (len - off >= 2) {     // [u16 big-endian len][payload]
    std::size_t n = std::size_t(buf[off]) << 8 | buf[off + 1];
    if (len - off - 2 < n) break;                   // partial: wait for more
    on_msg(buf + off + 2, n); off += 2 + n; }       // a view, no copy
  return off; }                                     // caller keeps [off, len)
const std::uint8_t in[] = {0,3,'a','b','c', 0,4,'d','e'};   // one recv: 1.5 frames
auto used = drain_frames(in, sizeof in, [](const std::uint8_t* p, std::size_t n) {
  std::printf("%.*s ", int(n), (const char*)p); });
std::printf("| used=%zu leftover=%zu\\n", used, sizeof in - used);
// abc | used=5 leftover=4     -- the partial second frame waits for the next read""",
  "deck": "Deck U7 · slides 9, 11–12"},
 {"title": "Read three fields, not thirty — and a send path with no snprintf",
  "text": "A general JSON parser reads every field, builds a heap tree and copies strings; the hot path needs three numbers. The arena's book_snapshot carries bids and asks as arrays of [price, qty] with the touch at index 0, plus mid_price — there is no bid or ask key — so the targeted extract finds \"bids\":[[ and strtods what follows, over a string_view of the socket buffer. It assumes the venue's compact, well-formed JSON, so validate the shape once at connect. The send side is the mirror: you only ever emit a few shapes, so write them straight into a reused buffer — no snprintf parsing its format string on every call, no std::string. The number-to-text step is HW 7 part 2 (u64toa, correct on 0 and UINT64_MAX, faster than std::to_string). And do not batch the hot path: every message held to batch is latency you added.",
  "code": """std::string_view f = R"({"type":"book_snapshot","symbol":"AAPL",)"
  R"("bids":[[309.90,4.0],[309.80,7.0]],"asks":[[310.30,9.0]],"mid_price":310.10})";
auto num_after = [f](std::string_view key) {          // no DOM, no allocation
  std::size_t k = f.find(key);
  if (k == f.npos) return 0.0;                        // absent or empty side
  return std::strtod(f.data() + k + key.size(), nullptr); };   // parse in place
std::printf("%.2f %.2f %.2f\\n", num_after("\\"bids\\":[["),
            num_after("\\"asks\\":[["), num_after("\\"mid_price\\":"));
// 309.90 310.30 310.10     -- the touch on each side and the mid; the rest skipped""",
  "deck": "Deck U7 · slides 13–15"},
 {"title": "The memory wall, SIMD and prefetch: let the compiler go first",
  "text": "On the hot path you are memory-bound: an L1 hit is about four cycles, a DRAM miss 200 or more, memory moves in 64-byte lines, and a TLB miss walks the page table. Linear access lets the hardware prefetcher run ahead; pointer chasing defeats it. An AVX2 register holds eight floats, and the right order is: build -O3 -march=native, read the vectorization report (clang -Rpass-missed=loop-vectorize, GCC -fopt-info-vec), and hand-write intrinsics only when it refuses. The lab's punchline: -O3 makes the kernel 6x faster and the report still says “loop not vectorized”, because an in-order float sum cannot be split across lanes without changing the answer — -ffast-math vectorizes it and moves the checksum. __builtin_prefetch is a hint: no fault, no stall, a distance you tune by measurement.",
  "code": """std::vector<float> x(1 << 16);
for (std::size_t i = 0; i < x.size(); ++i) x[i] = 1.0f / float(i + 1);
float in_order = 0;                                   // what -O3 must preserve
for (float v : x) in_order += v;
float lane[8] = {};                                   // what 8 SIMD lanes would compute
for (std::size_t i = 0; i < x.size(); ++i) lane[i % 8] += x[i];
float lanes = 0; for (float l : lane) lanes += l;
std::printf("%s\\n", in_order == lanes ? "same" : "different: FP + is not associative");
// different: FP + is not associative""",
  "deck": "Deck U7 · slides 18–19"},
 {"title": "Get the kernel out of the way, own the core, and stamp the wire",
  "text": "A syscall is a mode switch — typically hundreds of nanoseconds, more under load — so the cheapest one on the hot path is the one you never make: pre-allocate, reuse buffers, never log from on_book. Sleeping in epoll_wait adds a wake-up and jitter, so HFT busy-polls a dedicated core. Kernel bypass skips the generic stack: DPDK owns the NIC from user space, Onload/ef_vi accelerates ordinary sockets via LD_PRELOAD, AF_XDP is an in-kernel fast path, and io_uring batches syscalls without bypassing anything. Then take control of the machine: pin the hot thread to an isolated core (pinning buys variance, not speed — macOS has no affinity API, so skip it and say so), keep memory on the NIC's NUMA node, and pre-fault and mlock hot memory so no first-touch fault lands mid-race. Cross-box latency needs PTP-synchronised clocks and NIC hardware timestamps; past that, FPGAs.",
  "code": """constexpr std::size_t kBytes = 1 << 20, kPage = 4096;   // at startup, not in on_book
char* hot = static_cast<char*>(std::malloc(kBytes));
std::size_t touched = 0;
for (std::size_t off = 0; off < kBytes; off += kPage) {  // first touch = page fault
  hot[off] = 0; ++touched; }                             // ...paid now, before the open
std::printf("pre-faulted %zu x 4 KiB before SESSION_OPEN\\n", touched);
std::free(hot);
// pre-faulted 256 x 4 KiB before SESSION_OPEN""",
  "deck": "Deck U7 · slides 20–22, 30"}
],
"hft": {
 "text": "Your Session 6 ring is the seam between the wire and the strategy; this session makes the wire side of it cheap, then tunes the machine it runs on.",
 "paragraphs": [
  "The wire you actually speak in this arena is JSON over WebSocket — convenient, and the opposite of what fast venues do. Every message is a discriminated union keyed on a \"type\" field (book_snapshot, order_ack, place_order, cancel_order…), carried by IXWebSocket and decoded in the reference client by nlohmann/json: json::parse on the whole frame, then field lookups and m[\"bids\"][0][0] for the touch. That is your baseline, and beating it offline is Project Phase 5.",
  "Codec cost is not a footnote in tick-to-trade, it is a large slice of it. The deck's reference measurement on an Apple M4 over 4,057 replayed snapshots is p50 33.4 µs, p99 52.7 µs, p99.9 72.9 µs for the reference client; your numbers will differ, so your baseline is whatever your machine prints first on your tape. Swap on_book's decode for the targeted extract, hand-roll place_order and cancel_order into a reused buffer with your u64toa, and re-run the same tape.",
  "Correctness on the wire is worth as much as speed, because a silently wrong book loses money quietly. Track the next expected sequence number and treat a jump as loss; verify FIX's mod-256 checksum and reject on mismatch; bounds-check every length before you index with it. On a gap or a bad frame, stop trading that symbol and recover — fail loud and fast.",
  "The machine knobs compete for the same budget as the code. Phase 5 asks for faster decode or SIMD/prefetch on the hot loop, a pinning attempt, syscalls out of on_book, and the colocation economics — all as before/after percentiles on one tape. Pinning is Linux-only (pthread_setaffinity_np or taskset); report the p99.9 spread with and without, and on a Mac skip the pin, keep the measurement and say so. Spending on colocation while a per-tick allocation sits in on_book is buying nanoseconds to hide microseconds.",
  "Prove every win offline. scripts/latency_replay.py feeds a recorded tape to hft_bot --replay on stdin and prints p50/p99/p99.9 — deterministic, same input every run — so a change is attributed rather than guessed. A faster build that prints a different checksum (the -ffast-math trap from the lab) changed the math, and it does not count."
 ],
 "example": {
  "title": "In the arena",
  "code": """// hft/cpp_client/src/arena_client.cpp — dispatch(): the DOM you are asked to beat
    json m;
    try {
        m = json::parse(raw);
    // ...
        if (m.contains("bids") && m["bids"].is_array() && !m["bids"].empty())
            bv.best_bid = m["bids"][0][0].get<double>();
        if (m.contains("asks") && m["asks"].is_array() && !m["asks"].empty())
            bv.best_ask = m["asks"][0][0].get<double>();""",
  "text": "hft/cpp_client/src/arena_client.cpp — the reference client parses every book_snapshot into a full nlohmann/json tree and then reads the touch from the first [price, qty] level of each side. The Session 7 take-home replaces this path with a targeted extract over the frame and measures the before/after with scripts/latency_replay.py on the same tape."
 }
},
"interview": [
 {"q": "Why do venues ship market data over UDP multicast but take orders over TCP?",
  "a": "Multicast lets the venue send each update once while the switches replicate it to every subscriber — the only cheap way to fan a firehose out to hundreds of consumers — and UDP does not retransmit, so one lost packet does not stall the ones behind it. Order entry is a single stream where losing a message is unacceptable, so TCP's reliability and ordering are worth its head-of-line blocking (plus TCP_NODELAY so Nagle does not batch your orders). The price of the data choice is that you detect loss yourself from sequence numbers, arbitrate the A/B feeds, and recover.",
  "level": "warm-up", "skill": "trading.feed-sequencing"},
 {"q": "Why is fixed-width binary faster to decode than tag=value text, and why memcpy rather than reinterpret_cast?",
  "a": "Every field sits at a known offset in a known-length message, so there is no delimiter scan and no ASCII-to-number conversion: you copy the bytes and byte-swap from network order, and prices are scaled integers, so there is no floating-point parse either. memcpy because casting a packed struct pointer onto a byte buffer is undefined behaviour — misaligned access and a strict-aliasing violation — while a fixed-size memcpy is well-defined and compiles to the same single load.",
  "level": "warm-up", "skill": "trading.binary-market-data"},
 {"q": "What is wrong with assuming one recv() returns one message?",
  "a": "TCP is a byte stream and does not preserve send boundaries, so a read can deliver half a message, one and a half, or several — the most common networking bug there is. The correct structure is to append into a persistent buffer allocated once, loop while a complete frame is present (length prefix or FIX BodyLength), dispatch each as a view, and memmove the partial remainder to the front so the next read continues it. And validate the length against a maximum before trusting it, because a corrupt length is a buffer overrun.",
  "level": "core", "skill": "tools.message-framing"},
 {"q": "FIX is text and slow to parse. Why is it still everywhere, and what does its session layer buy you?",
  "a": "Because it is a session protocol as much as a message format: sequence numbers, heartbeats, logon and resend requests plus a mod-256 checksum in tag 10 give an auditable, recoverable conversation with a counterparty, and it is self-describing so two firms can add a tag without breaking each other. That is exactly what order entry, drop copies and allocations need, where a few hundred nanoseconds of parsing is irrelevant next to never losing an order. Fast market data went binary because none of that is worth a per-byte scan at millions of messages a second.",
  "level": "core", "skill": "trading.fix-protocol"},
 {"q": "Concretely, what does a DOM-style JSON parser do that a targeted extractor does not?",
  "a": "It parses the entire document, including every level and field you will never read; it builds a tree of heap-allocated nodes — maps, vectors, std::strings — which is dozens of allocations per message; it copies keys and values out of the receive buffer; and it dispatches on types generically. A targeted extractor scans once for the keys it needs (for the arena, \"bids\":[[, \"asks\":[[ and \"mid_price\":), converts each number in place over a string_view of the buffer, and allocates nothing. The trade is that you now own schema assumptions the library would have checked, so you validate the shape once at connect.",
  "level": "core", "skill": "perf.zero-copy-parse"},
 {"q": "What is the difference between level-triggered and edge-triggered readiness, and what must you do differently?",
  "a": "Level-triggered keeps reporting the descriptor while data remains, so a partial read is safe — you will be told again. Edge-triggered reports only the transition to readable: fewer wake-ups, but you must drain the socket in a loop until recv returns EAGAIN, otherwise the remaining bytes sit there and no new notification ever comes — the stall nobody can reproduce. EAGAIN is therefore not an error in that loop; it is the signal that readiness is exhausted and you return to the event loop.",
  "level": "core", "skill": "perf.nonblocking-io"},
 {"q": "Your -O3 build is 6x faster than -O0, but the vectorization report says the hot loop was not vectorized. How is that possible, and what do you do?",
  "a": "The 6x is inlining, register allocation and scheduling, not SIMD. The loop accumulates a floating-point sum in order, and FP addition is not associative, so splitting it across eight lanes would change the result — the compiler is not allowed to. -ffast-math grants permission to reassociate: it vectorizes and the checksum moves, which means the math changed, so it is not a free win in a pricing kernel. Other common refusals are possible aliasing (fix with __restrict), data-dependent branches, odd strides and unknown trip counts. Ask the compiler first with -Rpass-missed=loop-vectorize or -fopt-info-vec, fix the obstacle, and write intrinsics only as a last resort.",
  "level": "core", "skill": "perf.simd"},
 {"q": "What does kernel bypass actually change, and what does it cost you?",
  "a": "It removes the kernel's generic network stack from the per-packet path: no copies through protocol layers, no syscall per receive, packets read straight from the NIC's rings in user space — which is also why the thread busy-polls a dedicated core instead of sleeping. DPDK gives the most control but you write driver-level code and often your own protocol handling; Onload/ef_vi accelerates the ordinary sockets API via LD_PRELOAD with almost no code change but ties you to that vendor's NIC; io_uring only batches syscalls through shared rings and is not bypass. The costs: vendor lock-in, a core burned at 100%, and losing the kernel's tooling and protection.",
  "level": "senior", "skill": "perf.kernel-bypass"},
 {"q": "You pinned the hot thread and the median did not move. Was it a waste? What else belongs in the same change?",
  "a": "No — pinning buys variance, not speed. What it removes is the rare 1–3 ms preemption or migration that lands in p99.9, so you judge it by the p99.9 spread across repeated runs of the same tape, not by p50. It only works fully with the rest of the recipe: isolate the core (isolcpus, nohz_full, rcu_nocbs) so nothing else is scheduled there, allocate on the NIC's NUMA node, and pre-fault and mlock hot memory — ideally on huge pages — at startup so no first-touch page fault or TLB storm happens mid-race. On macOS there is no affinity API, so you skip the pin and report that honestly.",
  "level": "senior", "skill": "perf.cpu-pinning-numa"}
]
}
