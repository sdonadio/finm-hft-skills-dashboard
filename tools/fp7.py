# -*- coding: utf-8 -*-
"""Session 7 focus — Concurrency: from atomics to lock-free (deck U7, labs/session07.md).

Sources: u7.pptx (slides cited from its real numbering), session7_talking_points.md,
labs/session07.md (Parts A-E). Ring convention as in the deck, the lab and the grader:
the producer writes tail_, the consumer writes head_.
Every `code` snippet is compiled and run by tools/validate_focus.py.
"""

FILE_SCOPE = {"v_s7_c5": 9, "v_s7_c7": 10}   # "v_s7_cK": leading lines at file scope

S = {
"n": 7,
"focus": "Concurrency: atomics to lock-free",
"tagline": "Hand every tick from the socket thread to the strategy with two atomic operations and no lock — and prove it with a happens-before argument and a clean ThreadSanitizer run.",
"concepts": [
 {"title": "Threads share memory, and a data race is undefined behaviour",
  "text": "A std::thread is an independent instruction stream in the same address space: stacks are private, the heap and globals are shared, and the OS interleaves threads however it likes. When two threads touch the same location, at least one writes, and nothing orders them, that is a data race and the standard promises nothing at all. ++counter is load, add, store: at -O0 two threads of a million increments lose updates differently every run, and at -O2 the same code prints exactly 2,000,000 because the optimiser, assuming no race, folded each loop into one add. The right answer from a racy program is the scariest outcome. std::atomic fixes the count, and volatile does not: it stops the compiler caching a value and creates no ordering at all.",
  "code": """long racy = 0; std::atomic<long> safe{0};
auto work = [&] { for (int i = 0; i < 100000; ++i) {
    ++racy;                                                    // DATA RACE -> UB
    safe.fetch_add(1, std::memory_order_relaxed); } };         // atomic, unordered
std::thread t1(work), t2(work); t1.join(); t2.join();
std::cout << safe.load() << ' ' << (racy <= 200000) << ' '
          << safe.is_lock_free() << '\\n';
// 200000 1 1     -- safe is exact; racy is not even well-defined""",
  "deck": "Deck U7 · slides 5–6, 9"},
 {"title": "Happens-before, and the acquire/release handoff",
  "text": "Correctness is not about time, it is about the happens-before relation: if A happens-before B, B sees A's writes, and otherwise there is no guarantee. Program order gives sequenced-before inside a thread; a release store synchronizes-with an acquire load that reads its value; thread start, join and a mutex unlock/lock pair make edges too; and the relation is transitive. Nothing else makes an edge — not volatile, not sleep(). The pattern behind every lock-free handoff is four numbered steps: write the payload, release-store a flag, acquire-load the flag, read the payload. (2) synchronizes-with (3), so (1) happens-before (4), with no lock anywhere. Make both orders relaxed and ThreadSanitizer reports the race.",
  "code": """int payload = 0; std::atomic<bool> ready{false};
std::thread prod([&] { payload = 42;                            // (1) write the data
  ready.store(true, std::memory_order_release); });             // (2) release: publishes (1)
std::thread cons([&] {
  while (!ready.load(std::memory_order_acquire)) { }            // (3) acquire
  std::printf("%d\\n", payload); });                             // (4) guaranteed to see (1)
prod.join(); cons.join();
// 42""",
  "deck": "Deck U7 · slides 7, 12"},
 {"title": "memory_order: pay only for what you can prove",
  "text": "Every atomic operation takes an ordering. relaxed is atomic but orders nothing else — right for a free-running counter, never for handing data over. acquire/release is the workhorse pair. seq_cst, the default, adds one global order over all seq_cst operations and costs the strongest fences. The store-buffer litmus test shows why the choice is not academic: each thread stores its flag then loads the other's, and with relaxed the Apple M4 saw both loads return 0 in 199,793 of 200,000 trials, because a core's store waits in its buffer while its later load runs ahead. acquire/release does not forbid that outcome — only seq_cst does. Not seeing a reordering on one CPU proves nothing; reason from the model.",
  "code": """int both = 0;
for (int t = 0; t < 2000; ++t) {
  std::atomic<int> x{0}, y{0}; int r1 = -1, r2 = -1;
  std::thread a([&] { x.store(1); r1 = y.load(); });   // seq_cst: the default
  std::thread b([&] { y.store(1); r2 = x.load(); });
  a.join(); b.join(); both += (r1 == 0 && r2 == 0);
}
std::printf("both zero under seq_cst: %d of 2000\\n", both);
// both zero under seq_cst: 0 of 2000   -- relaxed on an M4: 199,793 of 200,000""",
  "deck": "Deck U7 · slides 10–11"},
 {"title": "A lock on the hot path is a tail bomb; CAS is the lock-free atom",
  "text": "Locks are the easy, correct way to get mutual exclusion — lock_guard or scoped_lock, never lock()/unlock() by hand — and a mutex barely dents the median: in the deck's four-thread counter it even beats an atomic at p50 (4.6 ns against 37). It detonates p99.9, 3–13x worse over five runs, because a contended loser sleeps on a futex and the scheduler decides when it wakes; a descheduled holder is a priority inversion with no bound. Every general lock-free structure sits instead on compare-and-swap: swap only if the value still equals what you expected, and on failure expected is refreshed so you recompute and retry — nobody is parked by the kernel. CAS compares bits, not history, so a recycled node can fool it (ABA), and the fixes (version tags, hazard pointers, epochs) are all memory-reclamation schemes.",
  "code": """std::atomic<int> v{7}; int tries = 0;
int expected = v.load(), desired;
do { desired = expected * 2; ++tries; }        // recompute INSIDE the loop
while (!v.compare_exchange_weak(expected, desired));   // swap only if unchanged
int stale = 99;                                // a CAS with a stale expected FAILS
bool ok = v.compare_exchange_strong(stale, 0); // ...and refreshes `stale`
std::cout << v.load() << ' ' << tries << ' ' << ok << ' ' << stale << '\\n';
// 14 1 0 14""",
  "deck": "Deck U7 · slides 14–17"},
 {"title": "The SPSC ring: one writer per index, two lines that make it correct",
  "text": "Single producer, single consumer: the producer is the only writer of tail_ and the consumer the only writer of head_, so no CAS is needed at all — push has no loop and no retry, which makes it wait-free, and nothing is recycled, so there is no ABA. The counters are monotonic and the capacity a power of two, so the slot is pos & mask and tail - head stays right across unsigned wrap. The producer loads its own tail_ relaxed, acquire-loads head_ to see the slots the consumer freed, writes the payload first, then release-stores tail_ + 1. Those last two lines are the whole correctness argument. And each index owns a 64-byte line, because the two cores write them on every operation: sharing a line is correct but silently slow, and it is 2 of the 10 HW 7 points.",
  "code": """struct Ring { explicit Ring(std::size_t cap) : mask_(cap - 1), buf_(cap) {}
  bool push(std::uint64_t v) {                          // PRODUCER thread only
    auto t = tail_.load(std::memory_order_relaxed);     // mine: nobody else writes it
    if (t - head_.load(std::memory_order_acquire) == buf_.size()) return false;
    buf_[t & mask_] = v;                                // (1) payload first
    tail_.store(t + 1, std::memory_order_release); return true; }  // (2) publish
  alignas(64) std::atomic<std::size_t> tail_{0}, head_{0};
  std::size_t mask_; std::vector<std::uint64_t> buf_;
};
Ring r(4); int n = 0; for (int i = 0; i < 6; ++i) n += r.push(i);
std::printf("%d accepted, 2 refused: full\\n", n);  // pop() is yours in the lab
// 4 accepted, 2 refused: full""",
  "deck": "Deck U7 · slides 19–20"},
 {"title": "Bounded is a feature: back-pressure",
  "text": "When the ring is full, push returns false — and that is not an error path, it is the one place in the design where you choose what to sacrifice: drop the newest, drop the oldest, or coalesce. For book snapshots, coalesce, since only the latest touch per symbol matters. Never spin on a full ring in the socket thread: you stop reading the wire, which is a lock's worst property back again. Unbounded queues are a trap that turns a slow consumer into a memory-and-latency blowout, and head-of-line blocking means one fat message delays every tick behind it, so keep items small, fixed-size and POD. Count the rejected pushes in a relaxed atomic: that counter is your storm detector for the Phase 3 report.",
  "code": """std::array<int, 4> q{}; std::size_t head = 0, tail = 0; int latest = 0;
std::atomic<std::uint64_t> dropped{0};
auto push = [&](int v) {                            // bounded: false when full
  if (tail - head == q.size()) { latest = v;        // coalesce: keep the newest
    dropped.fetch_add(1, std::memory_order_relaxed); return false; }
  q[tail++ & 3] = v; return true; };
int accepted = 0;
for (int tick = 1; tick <= 7; ++tick) accepted += push(tick);
std::printf("%d %d %d dropped=%llu\\n", accepted, latest, q[head & 3],
            (unsigned long long)dropped.load());
// 4 7 1 dropped=3     -- 4 queued, 3 rejected and counted, tick 7 kept as the latest""",
  "deck": "Deck U7 · slides 21–22"},
 {"title": "Across processes: the shared-memory ring, and C++20 coordination",
  "text": "The same ring works between two processes if it lives in a mapping both see: shm_open plus ftruncate plus mmap(MAP_SHARED) gives two page tables over one set of physical pages, and lock-free atomics obey the same memory model across them — one release store, one acquire load, no kernel in the fast path. That is Project Phase 4's feed/strategy split: a crash in the feed cannot take the strategy down, and each process pins its own core. Three rules change: no pointers (an address means something in one process only — store indices), no std::string or vector inside (they own heap memory in one process), and only always-lock-free atomics, because a hidden lock lives in one address space. Off the hot path, C++20 ships the coordination you used to hand-roll: a std::latch start gate, atomic::wait/notify to sleep without a condition variable, and std::jthread with a stop_token for clean shutdown.",
  "code": """struct ShmRing {                                      // POD: no pointers, no heap
  static constexpr std::uint32_t CAPACITY = 1024;     // power of two
  static_assert(std::atomic<std::uint32_t>::is_always_lock_free);
  void init() { head.store(0); tail.store(0); }       // creator, once
  bool push(std::uint64_t v) { std::uint32_t t = tail.load(std::memory_order_relaxed);
    if (t - head.load(std::memory_order_acquire) == CAPACITY) return false;
    buf[t & (CAPACITY - 1)] = v; tail.store(t + 1, std::memory_order_release); return true; }
  alignas(64) std::atomic<std::uint32_t> head, tail;  // consumer | producer writes
  alignas(64) std::uint64_t buf[CAPACITY];            // inline data
};
static ShmRing r; r.init(); std::printf("%zu %d\\n", sizeof r, int(r.push(42)));
// 8320 1""",
  "deck": "Deck U7 · slides 24–26"}
],
"hft": {
 "text": "Your bot already has two threads; this session makes the handoff between them correct, lock-free and bounded — first across threads (Phase 3), then across processes (Phase 4).",
 "paragraphs": [
  "You already have two threads whether you planned it or not. IXWebSocket reads the socket and decodes on its own background receive thread, then calls on_book there; Project Phase 3 moves your strategy onto its own std::jthread. The moment a tick crosses that boundary you are in the C++ memory model, and “it worked on my laptop” is not evidence: races are timing-dependent, so they pass on a quiet machine and fail under load — precisely when the arena is grading you.",
  "The Session 7 pipeline is fixed in shape. The receive thread copies the tick into a small POD — a symbol id from your symbol map, never a std::string — pushes it into your HW 7 ring and returns. The strategy thread drains the ring, keeps only the latest tick per symbol, and decides. A full ring drops and counts; it never blocks the wire. One gotcha from the deck: the client's latency helpers only time orders sent inside on_book, so decide() must record now - t.recv itself.",
  "Lock-free is not “faster locks”, it is a different guarantee: no thread can be stalled by another thread's scheduling. That is why it fixes the tail rather than the mean. The deck's queue benchmark makes it concrete on a laptop with no pinning: the SPSC ring sits at 83–125 ns p50 against 0.2–1.3 µs for a mutex-plus-deque, and its p99.9 stays far below the mutex queue's even when scheduler noise hits both.",
  "Audit the client too, not only your code. The reference client's book cache and latency histogram each take a std::mutex — the receive thread locks one on every book_snapshot, and anything else that reads the cache contends with it. Know every lock on your path, and keep the ones you cannot remove off the tick.",
  "The correctness bar is tool-enforced, not argued: one producer, one consumer, millions of items, nothing lost or reordered, and the same run silent under -fsanitize=thread in its own binary. If TSan flags a ring that passes every other test, you weakened a cross-thread acquire/release to relaxed or read the payload before checking the index — fix the pairing, never add a mutex or a suppression. And the ring is safe for exactly one producer and one consumer; a second pusher is undefined behaviour that can still give a clean run on a lucky day."
 ],
 "example": {
  "title": "In the arena",
  "code": """// hft/cpp_client/src/arena_client.cpp — dispatch(), on the receive thread
        {
            std::lock_guard<std::mutex> lk(book_mtx_);
            books_[bv.symbol] = bv;
        }
        on_book_snapshot(bv, recv_time);""",
  "text": "hft/cpp_client/src/arena_client.cpp — the reference client locks book_mtx_ on the receive thread for every book_snapshot before it calls your handler, and hft/cpp_client/include/arena_client.hpp declares that mutex next to the latency histogram's. Phase 3 is where you decide which locks stay on the path: push a POD tick into your ring from on_book and let the strategy thread do the rest."
 }
},
"interview": [
 {"q": "What is a data race, and why is “it printed the right number” not evidence that there isn't one?",
  "a": "A data race is two threads accessing the same memory location, at least one writing, with no happens-before edge ordering them. The standard makes that undefined behaviour, not “a stale value”: the compiler is allowed to transform the code as if the race cannot happen. The classic demonstration is two threads incrementing a plain long a million times each — at -O0 you lose updates and get a different total every run, at -O2 you get exactly 2,000,000 because the optimiser folded each loop into one add. The correct-looking answer is still a race; only a happens-before argument or ThreadSanitizer tells you otherwise.",
  "level": "warm-up", "skill": "cpp.data-races"},
 {"q": "What does compare_exchange do, why is it always written in a loop, and when do you use weak versus strong?",
  "a": "It atomically compares the object with an expected value and, only if they are equal, replaces it with the desired value; it returns whether it succeeded and, on failure, overwrites expected with the value actually seen. It lives in a loop because failure means someone else changed the object, so you recompute your update from the refreshed value and try again — the update must be recomputed inside the loop or you keep proposing a value derived from stale data. weak may fail spuriously (a load-linked/store-conditional interrupted on Arm), so it is the cheap choice inside a retry loop; strong fails only on a genuine mismatch and suits a one-shot attempt you branch on.",
  "level": "warm-up", "skill": "cpp.compare-and-swap"},
 {"q": "Explain the acquire/release pattern, and say when memory_order_relaxed is a bug.",
  "a": "The producer writes a plain payload and then release-stores an atomic flag; the consumer acquire-loads the flag and, once it observes the stored value, reads the payload. The release store synchronizes-with the acquire load, so everything sequenced before the store happens-before everything sequenced after the load, and the payload is guaranteed visible. relaxed is right when you need atomicity but no ordering — a free-running counter of dropped ticks whose total is read later. It is a bug whenever the atomic signals that other memory is ready, because relaxed creates no happens-before edge: the consumer can see the flag set while the payload writes are still invisible, and TSan will report it.",
  "level": "core", "skill": "cpp.atomics-memory-order"},
 {"q": "Why does an uncontended mutex look cheap in a benchmark and still ruin a latency tail in production?",
  "a": "Uncontended, lock and unlock are a couple of atomic operations — nanoseconds, which is what a naive benchmark measures; in a contended burst the holder can even win the median by running many uncontended acquisitions in a row. Contended, the loser blocks in the kernel on a futex: a context switch and a scheduler wake-up, microseconds, and unbounded if a descheduled thread holds the lock (priority inversion). Contention correlates with market activity, so the expensive case lands on exactly the ticks you needed to win. The lab's lock_tail measurement shows it: mutex p50 below the atomic's, p99.9 several times worse. Locks are correct; they belong off the tick path.",
  "level": "core", "skill": "perf.lock-tail-cost"},
 {"q": "In an SPSC ring's push, which memory orders go where, and why?",
  "a": "The producer loads its own tail_ relaxed — nobody else writes it, so relaxed is the correct order, not a shortcut. It acquire-loads head_, so it observes the consumer's release store and knows the slot it is about to overwrite has really been read. It writes the payload into buf_[t & mask], then release-stores tail_ + 1, so the slot write cannot be reordered after the publication — which is what guarantees the consumer never reads a slot before its data is visible. pop() is the mirror: own head_ relaxed, acquire tail_, read, release head_. Getting the release on the published index wrong is the classic bug, and it often still passes on x86.",
  "level": "core", "skill": "perf.spsc-ring"},
 {"q": "Why must the ring's capacity be a power of two, and why are the two indices alignas(64)?",
  "a": "A power-of-two capacity makes the wrap pos & (cap - 1) instead of pos % cap, replacing an integer division with a one-cycle AND on the hottest line of the queue; and with monotonic unsigned counters, tail - head stays correct across wraparound because the difference never exceeds the capacity. The alignment is about false sharing: the producer writes tail_ on every push and the consumer writes head_ on every pop, so if they share a 64-byte line the two cores invalidate each other's copy on every operation and the queue slows down the harder you drive it — correct, but silently serialised. A third aligned group keeps the read-only capacity, mask and buffer pointer off both hot lines.",
  "level": "core", "skill": "perf.cache-line-alignment"},
 {"q": "The ring is full during a message storm. What are your options, and which one fits market data?",
  "a": "Spin until there is room, grow the buffer, drop the newest, drop the oldest, or coalesce. Spinning is the worst on the socket thread: you stop reading the wire, which reintroduces a lock's blocking behaviour. Growing without bound turns a latency problem into a memory problem and hides the slow consumer until the machine swaps. For top-of-book snapshots coalescing is right — a newer snapshot supersedes an older one, so keeping only the latest per symbol stays current and bounded. Fills and acks are not idempotent, so they cannot be dropped; they belong on a separately sized queue where full is an alert. Either way, count the rejects in a relaxed atomic and report them.",
  "level": "core", "skill": "perf.back-pressure"},
 {"q": "You want the same lock-free ring between two processes rather than two threads. What changes, and what does not?",
  "a": "The synchronisation does not change: you create the region with shm_open, size it with ftruncate and mmap it MAP_SHARED into both processes, and the atomics work across it because cache coherence is a hardware property, not a process property — one release store and one acquire load give the same happens-before edge spanning two address spaces. What changes is the layout contract. No pointers, because an address is only meaningful in one process, so you store indices; no std::string or std::vector, because they own heap memory in one process; and only always-lock-free atomics, which is why the ring static_asserts is_always_lock_free — a lock-based atomic's hidden lock lives in one address space. The creator calls init() exactly once, before the other side attaches.",
  "level": "senior", "skill": "perf.shared-memory-ring"},
 {"q": "What is the ABA problem, and does it affect an SPSC ring buffer? Which progress guarantee does its push give?",
  "a": "ABA is when a CAS succeeds because the value it compares has returned to its original bit pattern while the structure changed underneath — classically a lock-free stack whose popped node was freed and pushed back, so the old head pointer looks valid but its next field is stale. The fixes (a version tag CAS'd with the pointer, hazard pointers, epochs) are memory-reclamation schemes. It does not affect an SPSC ring: the ring does no CAS, and its indices are monotonic counters rather than recycled pointers. And because push has no retry loop — a bounded number of its own steps, always — it is wait-free, not merely lock-free; lock-free only promises that some thread progresses.",
  "level": "senior", "skill": "cpp.compare-and-swap"}
]
}
