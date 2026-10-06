# -*- coding: utf-8 -*-
"""Session 8 focus — The tail & the tournament (deck U8, labs/session08.md).

Two halves: profile and kill the latency tail (perf, flame graphs, counters,
jitter, PGO/LTO, sanitizers, quiet logging — Lab A), then latency arbitrage,
market making at speed and the live tournament, then Session 9 adds the pre-trade risk controls every one of these
fast paths needs, and the final exam follows (Dec 8-11).
Every `code` snippet is compiled and run by tools/validate_focus.py.
"""

FILE_SCOPE = {       # "v_s8_cK": number of leading lines that go at file scope
    "v_s8_c3": 7,
    "v_s8_c5": 4,
    "v_s8_c6": 7,
}

S = {
"n": 8,
"focus": "The tail & the tournament",
"tagline": "Find where the microseconds go, kill the spikes without changing the answer — then race a fee-aware, tail-tight bot on one scoreboard.",
"concepts": [
 {"title": "Why the mean lies",
  "text": "Latency distributions are not Gaussian: they are heavy-tailed and usually bimodal, a tight fast body plus rare stalls from a fault, a miss cascade or a preemption. The mean lands in the valley between the two populations and describes no tick anyone experienced, so report p50 / p99 / p99.9 / max. Two traps: coordinated omission, where timing request-to-request under-samples exactly the slow periods (the replay tape feeds a fixed schedule, which is why it is the grading harness), and too few samples — p99.9 needs thousands of points, and one run is one draw.",
  "code": """std::vector<long> us(1000, 38);                       // the fast body
for (int i = 990; i < 996; ++i) us[i] = 71;
for (int i = 996; i < 999; ++i) us[i] = 210;
us[999] = 5200;                                       // the tick you lost
std::sort(us.begin(), us.end());
double mean = std::accumulate(us.begin(), us.end(), 0.0) / us.size();
auto p = [&](double q) { return us[std::size_t(q * us.size())]; };
std::printf("mean=%.2f p50=%ld p99=%ld p99.9=%ld max=%ld\\n",
            mean, p(.50), p(.99), p(.999), us.back());
// mean=43.88 p50=38 p99=71 p99.9=5200 max=5200""",
  "deck": "Deck U8 · slide 5"},
 {"title": "perf, flame graphs — and counters that say why",
  "text": "Linux perf is the low-overhead sampling profiler, and three verbs carry you: perf stat for totals (cycles, IPC, cache and branch misses) as the cheap first move, perf record -g --call-graph dwarf to sample stacks, perf report to rank them — then fold the stacks into a flame graph where width is time on CPU, so wide plateaus are the targets and tall thin towers are merely deep. It is on-CPU only: a sleep, a lock wait or a blocked syscall does not show. The profile says where; the counters say why. Low IPC on a hot loop means stalls, not work; a DRAM miss is 200-plus cycles; a branch mispredict flushes the pipeline for 15 to 20 — rare-but-expensive, the exact shape of a tail. Your bot profiles the same way: hft_bot --replay reads snapshots on stdin.",
  "code": """uint32_t s = 2463534242u; long branchy = 0, branchless = 0;
for (int i = 0; i < 1000; ++i) {
  s ^= s << 13; s ^= s >> 17; s ^= s << 5;        // deterministic pseudo-noise
  int x = int(s & 0xff);
  if (x > 127) branchy += x; else branchy -= x;   // ~50% mispredict: a flush
  branchless += (x > 127) ? x : -x;               // same value, no jump
}
std::printf("%ld %ld %s\\n", branchy, branchless,
            branchy == branchless ? "identical" : "differ");
// 52160 52160 identical     -- a mispredict costs 15-20 cycles; a select cannot""",
  "deck": "Deck U8 · slides 6–7"},
 {"title": "Every spike has a physical cause",
  "text": "Name the cause and the fix is targeted and permanent: allocation on the hot path (malloc usually fast, occasionally locking or calling mmap — pools and reserved buffers), page faults (pre-fault and mlock at startup), cache, TLB and NUMA misses (compact hot data, huge pages, node-local memory), and hidden O(n) or I/O (a resize, a rehash, a window recompute, a log line). Lab A's tail.cpp builds a fresh vector and re-sums 257 prices every tick; the fix is a ring sized once plus a running sum, and the proof is the same sink to the last digit with p99.9 collapsed. What is left in max after that is the OS itself — the jitter probe on an idle loop still sees gaps of 100-plus µs — which is what core isolation, IRQ routing and pinning exist to shrink.",
  "code": """struct RollingMean {                 // allocated ONCE, O(1) per tick
  std::vector<double> buf; std::size_t cap, count = 0, head = 0; double sum = 0;
  explicit RollingMean(std::size_t n) : buf(n, 0.0), cap(n) {}
  double push(double px) {
    if (count == cap) sum -= buf[head]; else ++count;
    sum += px; buf[head] = px; head = (head + 1 == cap) ? 0 : head + 1;
    return sum / double(count); } };
std::vector<double> px(5000); for (int i = 0; i < 5000; ++i) px[i] = 100 + (i % 97) * 0.01;
RollingMean roll(256 + 1); double naive = 0, fast = 0;   // window is INCLUSIVE: 257
for (int k = 4999 - 256; k <= 4999; ++k) naive += px[k];  // tail.cpp's re-sum
for (double p : px) fast = roll.push(p);   std::printf("%.6f %.6f\\n", naive / 257, fast);
// 100.451556 100.451556   -- same answer, zero allocations per tick""",
  "deck": "Deck U8 · slides 8–9, 12"},
 {"title": "Ship the release build; keep correctness and logging off the hot path",
  "text": "Once the algorithm is right, let the toolchain finish: -O3, -march=native for this CPU, -flto to optimise across .cpp files, -DNDEBUG to strip asserts, -g kept because symbols cost no speed and perf needs them, and a two-pass PGO build on a representative input so the compiler sees real branch data — one CMake build directory per flag set, --fresh, or the cache silently ignores your flags. Correctness is its own build: ASan + UBSan together, TSan separately, both clean on the replay, never shipped. And the hot thread does no I/O: it pushes a 32-byte POD record into your Session 6 ring, counts a drop if the ring is full, and moves on; a logger thread formats and writes.",
  "code": """struct LogRec { uint64_t ts_ns; uint32_t code, sym; double px; int64_t qty; };
static_assert(sizeof(LogRec) == 32);                       // one POD copy per event
std::array<LogRec, 4> ring{}; std::size_t head = 0, tail = 0; long dropped = 0;
for (int i = 0; i < 6; ++i) {                              // 6 fills, nobody draining yet
  if (head - tail == ring.size()) { ++dropped; continue; } // full: count it, never block
  ring[head++ % ring.size()] = LogRec{uint64_t(i), 1, 7, 100.0 + i, 100};
}
std::printf("queued=%zu dropped=%ld\\n", head - tail, dropped);
// queued=4 dropped=2   -- the hot thread never waits on I/O""",
  "deck": "Deck U8 · slides 10–11"},
 {"title": "Picking off a stale quote — after fees",
  "text": "The same name trades on many venues, news reaches them at different times, and for microseconds they disagree. Consolidate the touches into the NBBO: locked means best bid equals best ask across venues, crossed means somebody's quote is stale. Picking it off takes both legs aggressively, so both pay the taker fee — at the arena's 30 bps a one-cent cross loses 59 cents a share, and only a shock-sized dislocation pays. Then it is a race: everyone sees the same public quote, the first order to reach that venue gets the fill, colocation is the tiebreaker, size is the thin side, and the real risk is a one-legged fill that turns a riskless arb into a directional position. Smart order routing picks the venue net of fees, rebates and per-venue latency.",
  "code": """struct Top { double bid, ask; int bid_sz, ask_sz; };
double edge(const Top& A, const Top& B, double bps) {   // buy B's ask, sell A's bid
  return A.bid - B.ask - (A.bid + B.ask) * bps * 1e-4;   // a taker fee on BOTH legs
}
Top A{100.05, 100.07, 300, 300}, B{100.02, 100.04, 200, 200};   // B has not caught up
std::printf("1c cross: %+.4f\\n", edge(A, B, 30));
Top S{101.00, 101.02, 300, 300};                                // a shock-sized gap
std::printf("96c cross: %+.4f  qty=%d\\n", edge(S, B, 30), std::min(S.bid_sz, B.ask_sz));
// 1c cross: -0.5903
// 96c cross: +0.3569  qty=200""",
  "deck": "Deck U8 · slides 14–16"},
 {"title": "Market making at speed: queue, skew, hold",
  "text": "A maker earns the spread and the rebate, anchors fair value on the microprice rather than the mid, and leans both quotes against inventory — fair = microprice − k × position — so risk comes off through flow the market pays for. Cancel-and-repost sends you to the back of the FIFO, so most ticks the right move is HOLD: cancel if the price moved against you, requote only if you are off the best price or buried behind more than half the level. With the tournament's quota of six messages a tick, a needless requote costs a message and the queue spot. The arena hands you queue_ahead and level_qty in on_ack / on_queue; real venues do not.",
  "code": """enum Action { HOLD, REQUOTE, CANCEL };
Action decide(double my_px, double best_px, int ahead, int level, bool against) {
  if (against)           return CANCEL;    // stale: pull it
  if (my_px != best_px)  return REQUOTE;   // off the best price
  if (ahead > level / 2) return REQUOTE;   // buried in the queue
  return HOLD; }                           // good spot: save the message
const char* nm[] = {"HOLD", "REQUOTE", "CANCEL"};
double fair = 100.016 - 0.002 * 3;         // microprice - k * inventory (long 3)
std::printf("%s %s fair=%.3f\\n", nm[decide(100.00, 100.00, 200, 1000, false)],
            nm[decide(100.00, 100.00, 800, 1000, false)], fair);
// HOLD REQUOTE fair=100.010""",
  "deck": "Deck U8 · slide 17"},
 {"title": "Markouts, and the grade that has four axes",
  "text": "A fast fill can be a bad fill: when an informed trader hits your quote right before the move, you were the stale quote. The markout is the truth — mark each fill against the mid a moment later, signed by side; persistently negative on a symbol is toxic flow, so widen, skew away or stop quoting it. The arena computes it server-side at 100 ms, 1 s and 5 s, and the tournament's MM SCORE is realized P&L + rebates + 1-second markout − carry, in dollars. The board also ranks p99.9, OTR (messages per trade, lower wins) and passive share — optimise one axis and you wreck another. Tonight's rank is bragging rights; Canvas Phase 7 grades the tagged commit and the write-up.",
  "code": """auto markout = [](bool bought, double fill, double later) {
  return bought ? later - fill : fill - later;           // + good fill, - picked off
};
double a = markout(true, 100.04, 100.01);                // bought the top
double b = markout(false, 100.06, 100.03);               // sold before the drop
double mm = 14.00 + 1.00 + 100 * (a + b) - 0.50;         // realized + rebates + markout*qty - carry
std::printf("%+.2f %+.2f MM=%.2f\\n", a, b, mm);
// -0.03 +0.03 MM=14.50""",
  "deck": "Deck U8 · slides 18, 23"}
],
"hft": {
 "text": "Why this matters in HFT",
 "paragraphs": [
  "Nine sessions, one number. A realistic colocated software path from wire in to wire out is roughly 7 to 17 µs — bypass, parse, book and signal, risk check, serialise, send — and every earlier session shaved one of those slices. Session 8 is where you prove it: the LATENCY tab ranks bots by p99.9 tick-to-order, timed with steady_clock from the moment a book_snapshot is decoded to the moment your order leaves, and scripts/latency_replay.py replays the same fixed tape into your bot on stdin so a before/after comparison means something.",
  "The tail work is a loop, not a trick: profile the replay, name the widest plateau or the physical cause of the spike, fix it without changing the answer, re-run the same tape, and write the before and after into a changelog. That changelog plus a flame graph is Project Phase 6, and Lab A is its template — including the honest bits, like a macOS clock that ticks in 42 ns steps and a max that stays in microseconds after the fix because the OS, not your code, took the time.",
  "Latency arbitrage is where speed turns directly into P&L, and the fee arithmetic decides it before the race does. Both legs are aggressive, so both pay the taker fee; a crossed NBBO is only worth taking when the dislocation survives two fees, which in the finale means the shocks — AAPL earnings at tick 250, the market-wide econ print at 850, NVDA earnings at 1150. Cross-venue in C++ has a concrete shape: on_book has no venue argument and one client speaks to one venue, so you run one process per venue and share the touch through your Phase 4 shared-memory structure — POD, no pointers, and no torn reads.",
  "Market making is the other half of the score, and it rewards discipline more than raw speed. The finale's binding constraint is messages, not size: order_quota is 6 per tick against a position limit of 1200, so every cancel-and-repost spends a message and forfeits queue position. MM SCORE adds realized P&L, rebates and the 1-second markout and subtracts carry, which is why the fastest p99.9 rarely wins it: fast is necessary, not sufficient.",
  "Speed also carries a responsibility. It tightens spreads and links venues; it is also an arms race for access that is openly for sale, which is why real markets add circuit breakers, LULD bands, speed bumps and batch auctions — the finale runs with LULD at 8% and the short-sale rule on. Bring a clean build from a fresh clone, a bot that respects its risk limits, and numbers you can defend; Session 9 adds the controls that decide whether that bot is allowed to send at all, and the cumulative final follows in its own remote window, Dec 8–11."
 ],
 "example": {
  "title": "In the arena",
  "code": """// starters/session08/stale_quote.cpp - HW 8's contract, in the header comment
//   * The stale venue is the one of the crossing pair with the OLDER ts_ns.
//   * Edge per share = |other venue's touch - stale price| - 2 * taker fee
//     (fee = price * fee_bps * 1e-4 per leg; you pay to enter AND to exit).
//   * No allocation, no I/O: this runs inside on_book.
Order detect_stale(const Top v[2], double fee_bps, int position, int limit);

// hft/cpp_client/include/hft_bot.hpp - the REAL hook: NO venue argument,
// so cross-venue means one process per venue and a shared touch cache.
virtual void on_book(const std::string& symbol, double bid, double ask,
                     double mid, double microprice, double obi);
virtual void on_ack(const std::string& symbol, const std::string& order_id,
                    int queue_ahead, int level_qty);""",
  "text": "starters/session08/stale_quote.cpp is HW 8: finish detect_stale() until its ten-row table passes (the stub passes the four no-order rows), then argue in the README what latency would make it real and what makes the signal false. hft/cpp_client/include/hft_bot.hpp is why the tournament's cross-venue plan is two processes, and on_ack is where queue_ahead arrives for the hold-or-requote decision. The finale scenario itself is hft/scenarios/week10.json."
 }
},
"interview": [
 {"q": "What is the NBBO, and what does it mean for it to be crossed or locked?",
  "a": "The NBBO is the consolidated best bid and best offer across all venues trading the name: the maximum bid and the minimum ask. Locked means the best bid equals the best ask — someone is willing to buy at exactly the price someone is willing to sell. Crossed means the best ask is below the best bid, which cannot persist: it says one venue's quote has not caught up, and it is the signal a latency arbitrageur is looking for.",
  "level": "warm-up", "skill": "trading.nbbo-latency-arb"},
 {"q": "Why does a latency report give p50, p99 and p99.9 instead of the mean?",
  "a": "Because latency is heavy-tailed and usually bimodal: a fast common path plus rare stalls from allocation, page faults, cache misses or the scheduler. The mean sits between those populations and describes no real tick, and a handful of multi-millisecond stalls barely moves it. The races that matter happen on the busy, volatile ticks where the stalls show up, so the tail — p99.9 and max — is what decides whether you get filled.",
  "level": "warm-up", "skill": "perf.tail-diagnosis"},
 {"q": "Which perf command do you run first on a slow binary, and how do you read the flame graph afterwards?",
  "a": "perf stat first, because it is almost free and tells you what kind of problem you have: cycles and instructions give IPC, and the cache-miss, branch-miss and page-fault counters say whether you are memory-bound, mispredicting or faulting. Then perf record -g (with DWARF call graphs for -O2 code) to learn where. In the flame graph width is the total time attributed to a frame and its children, so wide plateaus are the targets; tall towers only mean a deep stack. Two traps: it is on-CPU only, so lock waits and blocking syscalls are invisible, and a build without symbols collapses the stacks into nonsense — which is why -g stays in the release build.",
  "level": "core", "skill": "tools.perf-profiler"},
 {"q": "Name the usual physical causes of a latency tail and how you tell them apart.",
  "a": "Allocation (malloc locking, refilling an arena or calling mmap), page faults on first touch, cache and TLB misses or a NUMA-remote load, hidden O(n) work such as a resize, rehash or window recompute, logging or other I/O, and OS preemption or interrupts. You distinguish them with evidence rather than intuition: allocator frames in the profile, fault counts from perf stat, cache/LLC/dTLB miss counters, and a jitter probe — a loop timing an empty body — for scheduler noise. Each has a different fix (pools, pre-faulting and mlock, layout and huge pages, bounded per-tick work, a lock-free log ring, isolation and pinning), which is why naming it comes first.",
  "level": "core", "skill": "perf.tail-diagnosis"},
 {"q": "You detect a crossed NBBO. Walk through what you do and what can go wrong.",
  "a": "First check that the edge survives both taker fees — at 30 bps a leg a one-cent cross is a loss of about 59 cents a share — and size to the thin side, min(bid size, ask size). Then take the stale side on the lagging venue and hedge on the venue that already moved. What goes wrong is leg risk: the stale quote is public, so if you lose the race on one leg you are left with an unhedged directional position at a worse price. And you may be wrong about who is stale — the fresh venue can be the one about to reverse — in which case you crossed the spread twice for nothing.",
  "level": "core", "skill": "trading.smart-order-routing"},
 {"q": "When should a market maker requote, given that repricing loses queue position, and where does inventory skew come in?",
  "a": "Cancel if the market moved against the quote, because a stale quote is a free option written to every taker. Requote if you are off the best price or buried deep in the level. Otherwise hold: near the front the fill is imminent, and restarting at the back of the FIFO throws away the time priority you paid for — under a quota of six messages per tick, a needless requote also burns a message. Skew enters the fair value itself: fair = microprice − k × position, so a long book shades both quotes down and sells its inventory through flow the market pays for, instead of paying the spread to hedge.",
  "level": "core", "skill": "trading.market-making"},
 {"q": "What is a markout, and how do you use it operationally?",
  "a": "A markout is the signed P&L of a fill against the mid some horizon later: for a buy, mid_later minus the fill price; for a sell, the reverse. It tells you whether the fill was good independently of how the position was later closed. You bucket markouts by symbol and time of day at several horizons — the arena uses 100 ms, 1 s and 5 s — and persistent negativity means adverse selection, so you widen, skew away from that side, or stop quoting the name. In the tournament the 1-second markout is added straight into MM SCORE, so picked-off fills cost points directly.",
  "level": "core", "skill": "trading.adverse-selection"},
 {"q": "Why do you keep -g in a release build, and what do -march=native, -flto and PGO buy you?",
  "a": "Debug symbols do not change the generated code; they only make perf, flame graphs and core dumps readable, so stripping them costs diagnosis for nothing. -march=native lets the compiler use this CPU's instruction set, a real win for vectorisable loops, at the price of a binary that may not run on another microarchitecture. -flto defers optimisation to link time so inlining crosses translation units, which matters when the codec and the strategy live in different files. PGO gives the compiler measured branch frequencies for layout and inlining — but only if the profiling input is representative, so you profile on the tape you will be measured on, and you re-measure, because an unrepresentative profile can make things slower.",
  "level": "senior", "skill": "tools.compiler-flags"},
 {"q": "Make the case for and against latency arbitrage as a business.",
  "a": "For: it is the mechanism that enforces one price across fragmented venues, and the firms doing it usually also quote two sides, so the result is tighter spreads, deeper books and lower costs for occasional traders. Against: the specific trade takes a quote from someone who has not yet been able to withdraw it, so the profit is a transfer from a slower participant rather than new information, and the resources spent to win it — microwave links, custom silicon, colocation — are real capital spent on a purely relative advantage that is openly for sale. Both arguments are genuine; the sensible response is market design — speed bumps, frequent batch auctions, circuit breakers and LULD bands — rather than banning speed, and as an engineer you owe the market fast code that respects its risk limits.",
  "level": "senior", "skill": "trading.hft-ethics"}
]
}
