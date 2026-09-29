# -*- coding: utf-8 -*-
"""Session 6 focus — memory pools & the order book (deck U6, labs/session06.md,
speaker guide session6_talking_points.md).

Pool / placement-new / pmr / hash / flat-book / ring / Welford wording reused from
the pre-resequence site where the topic only moved; every slide re-cited to U6.
Every `code` snippet is compiled and run by tools/validate_focus.py.
"""

FILE_SCOPE = {}   # "v_s6_cK": number of leading lines that go at file scope

S = {
"n": 6,
"focus": "Memory pools & the order book",
"tagline": "Allocation that costs the same every tick, and a book whose top is one load away — the two structures the rest of your hot path stands on.",
"concepts": [
 {"title": "The fixed-size object pool",
  "text": "malloc is not slow — it is fast on average and unpredictable: a shared, thread-safe heap that takes locks, calls the kernel for pages when it runs dry, and fragments over a session, so the same new+delete of a 64-byte order is about 11–21 ns on average and 0.5–0.9 µs in its worst batch. Flip every property and you have the pool: one block size, one slab owned since startup, and a singly linked free list threaded through the *unused* slots, so the free slots are the list and cost no extra memory. Allocation pops the head, free pushes it back, both O(1) with no search, no lock and no syscall — and LIFO reuse hands back a slot that is still hot in L1. Measured in the lab, the pool's mean is several times lower, but the sentence HW 6 asks you to defend is that its number is stable.",
  "code": r'''struct Slot { Slot* next; };
Slot slab[4]; Slot* free_ = nullptr;                   // ONE pre-owned block
for (auto& s : slab) { s.next = free_; free_ = &s; }   // thread the free-list
Slot* a = free_; free_ = a->next;                      // alloc: O(1) pop
Slot* b = free_; free_ = b->next;                      // alloc: O(1) pop
b->next = free_; free_ = b;                            // free:  O(1) push
Slot* c = free_; free_ = c->next;                      // alloc again
std::printf("%d %d %d\n", a != b, c == b, free_ != nullptr);
// 1 1 1   -- the freed slot is handed straight back, still hot in L1''',
  "deck": "Deck U6 · slides 5–6, 8, 13"},
 {"title": "Storage versus lifetime: placement new",
  "text": "In C++ getting bytes and starting an object's life are two separate steps. A pool does the first once, at startup; new (ptr) T{...} does the second per object — it runs only the constructor, in memory you already own, and allocates nothing. The obligation is symmetry: nobody will run the destructor for you, so you call p->~T() before the slot goes back to the pool (delete would free memory the heap never gave you), and the storage must be sized and aligned for T, which is why slots are declared alignas(T). The explicit destructor call ends the object's life; it does not free anything. ObjectPool<T, N> wraps exactly this: a variadic alloc(Args&&...) forwards into placement new, and exhaustion returns nullptr rather than crashing.",
  "code": r'''struct Order {
  double px; int qty;
  Order(double p, int q) : px(p), qty(q) { std::printf("ctor "); }
  ~Order()                               { std::printf("dtor "); }
};
alignas(Order) std::byte slot[sizeof(Order)];      // bytes, no object yet
Order* o = new (slot) Order(101.5, 200);           // construct IN the slot
std::printf("%.1f %d ", o->px, o->qty);
o->~Order();                                       // YOU end its life
std::puts("");
// ctor 101.5 200 dtor''',
  "deck": "Deck U6 · slides 7, 9–10"},
 {"title": "The arena that resets, and std::pmr",
  "text": "When a batch of objects dies together — one tick's scratch — do not free them one by one. A bump (arena) allocator keeps one offset into a slab: round it up to the request's alignment, hand out that address, advance, and reclaim everything at once by setting the offset back to zero. An alloc is an add, a mask and a compare, cheaper than a free-list pop; the prices are that you cannot free one object, reset() runs no destructors, and no pointer may survive the reset. C++17 ships the same idea as std::pmr::monotonic_buffer_resource over a buffer you supply, with release() as the reset — give it null_memory_resource() as upstream so overflow throws instead of silently falling back to the heap, and destroy every pmr container on it before you release.",
  "code": r'''alignas(64) std::byte slab[256]; std::size_t off = 0;
auto alloc = [&](std::size_t n, std::size_t a) -> void* {  // a = 2^k
  std::size_t p = (off + a - 1) & ~(a - 1);                 // round up
  if (p + n > sizeof slab) return nullptr;                  // full: loud
  off = p + n; return slab + p; };                          // bump
auto* s = alloc(3, 1);
auto* d = static_cast<std::byte*>(alloc(sizeof(double), alignof(double)));
std::printf("%td %zu ", d - slab, off);
off = 0;                                   // reset(): the whole tick, O(1)
std::printf("%d\n", alloc(3, 1) == s);
// 8 16 1   -- the double was aligned to 8; after reset the slab is reused''',
  "deck": "Deck U6 · slides 11–12"},
 {"title": "Hash tables: open addressing, not chaining",
  "text": "Pick the container for the access pattern: ordered traversal favours a tree, the best element a heap, point lookup a hash — and each carries a cache cost big-O does not show. Order-ID and symbol lookups are the workhorse, and both collision strategies are O(1) on average; the constant is decided by memory layout. Chaining (std::unordered_map) makes each bucket a linked list of heap nodes, so every collision is a pointer chase and a likely miss, and a rehash is an unbounded O(n) event at a moment you did not choose. Open addressing probes the next slot of one flat array; a power-of-two size turns the modulo into an AND, and the probe usually stays in one cache line — size it once and keep the load factor under about 0.7. In the lab's bench-book, the std::string-keyed unordered_map is about 3.5× slower than an open-addressing SymMap, mostly from building and hashing a string per call.",
  "code": r'''struct Slot { uint64_t key = 0; uint32_t val = 0; bool used = false; };
std::array<Slot, 8> t{}; const uint64_t mask = 7;      // power of two -> AND, not %
auto put = [&](uint64_t k, uint32_t v) {
  uint64_t i = k & mask;
  while (t[i].used && t[i].key != k) i = (i + 1) & mask;   // walk the NEXT slot
  t[i] = {k, v, true};
};
put(1, 100); put(9, 900);                     // 9 & 7 == 1: they collide
std::cout << t[1].key << ' ' << t[2].key << ' ' << t[2].val << '\n';
// 1 9 900     -- the collision landed in the adjacent slot, same cache line''',
  "deck": "Deck U6 · slides 15–16, 23"},
 {"title": "The flat, price-indexed book — and the band it really is",
  "text": "Prices live on a fixed tick grid, so an integer index is exact and you never needed a general ordered map: convert the price to a tick once, at decode, and slot = tick - base_tick makes each level a slot in one contiguous array. Add and cancel index straight to the level, the touch is a cached best_bid / best_ask slot read with a single load, and matching walks adjacent slots in the direction the prefetcher expects; the only scan is a cancel that empties the touch. The trap is that a flat array covers a band, not all prices — 65,536 one-cent slots indexed absolutely from $0.00 only reach $655.35, and the arena's NFLX near $720 writes past the end of bid_ into ask_, the adjacent member. That is an intra-object overflow, so AddressSanitizer does not see it and a test suite that quotes near $100 stays green. Index against a base, bounds-check both ends, and re-base when the market walks out of the band.",
  "code": r'''const double base = 99.00, tick = 0.01;        // index against a BASE tick
std::array<uint32_t, 256> bid_qty{}; int best = -1;
auto idx = [&](double px) { return int((px - base) / tick + 0.5); };
auto add = [&](double px, uint32_t q) {
  const int i = idx(px);
  if (i < 0 || i >= 256) return false;         // the BAND check ASan cannot see
  bid_qty[i] += q; if (i > best) best = i;     // O(1), one cache line
  return true; };
bool in  = add(100.00, 800);
bool oob = add(720.00, 500);                   // $720 is off a $99.00-$101.55 band
std::printf("%d %d %.2f %u\n", in, oob, base + best * tick, bid_qty[best]);
// 1 0 100.00 800''',
  "deck": "Deck U6 · slides 17–20"},
 {"title": "FIFO per level, and your place in it",
  "text": "Price-time priority means better price first, then earlier arrival, and within one price the arena's engine holds a strict FIFO keyed on a monotonic sequence number, so ties are impossible. Model each level as an intrusive doubly linked FIFO whose nodes come from the pool: the links live inside the order, so push_back on arrival and erase on cancel are O(1) with no allocation, and an open-addressing id → node index gives cancel its O(1) lookup. Your fill chance is set by the quantity ahead of you; the arena hands it to you as queue_ahead in on_ack / on_queue (zero means you are next), and walking the level to recompute it is O(k) — do it on an ack, not per tick. Repricing forfeits all of it: cancel and re-post puts you at the tail, so move a quote only when the edge is worth your place in line.",
  "code": r'''struct Node { std::uint32_t qty; Node *prev = nullptr, *next = nullptr; };
struct Level { Node *head = nullptr, *tail = nullptr; std::uint32_t total = 0;
  void push_back(Node* o) { o->prev = tail; (tail ? tail->next : head) = o; tail = o; total += o->qty; }
  void erase(Node* o) { (o->prev ? o->prev->next : head) = o->next;
                        (o->next ? o->next->prev : tail) = o->prev; total -= o->qty; }
  std::uint32_t ahead(const Node* me) const { std::uint32_t q = 0;
    for (auto* o = head; o != me; o = o->next) q += o->qty; return q; } };
int main() { Node a{300}, b{200}, me{100}; Level L;
  L.push_back(&a); L.push_back(&b); L.push_back(&me);    // arrival order
  std::printf("%u ", L.ahead(&me)); L.erase(&a);         // a cancels ahead of us
  std::printf("%u %u\n", L.ahead(&me), L.total); }
// 500 200 300''',
  "deck": "Deck U6 · slides 21–22"},
 {"title": "Complexity that matters: rings and O(1) statistics",
  "text": "Big-O hides the constant, and on the small N of a hot book the constant — memory accesses — is the whole story: finding a value among 64 elements, a red-black tree's six pointer hops can lose to a prefetched linear scan. Amortized is not worst case either: push_back's occasional O(n) regrow is a tail event, and reserve() removes it. The signal on top of the book follows the same rule. Keep the recent tape in a fixed ring buffer — power-of-two capacity, index with & (N - 1), static_assert it, because the unsigned head - count + i only wraps correctly when N divides 2^64 — and fold each tick into a running mean, Welford's variance and an EMA in O(1). Welford matters on prices near 100 with tiny variance, where sum(x²) - n·mean² cancels catastrophically.",
  "code": r'''struct Online {                                    // O(1) time, O(1) space
  long n = 0; double mean = 0, m2 = 0, ema = 0, a = 0.2;
  void update(double x) { ++n; double d = x - mean;
    mean += d / n;                                 // running mean
    m2   += d * (x - mean);                        // Welford's M2
    ema   = (n == 1) ? x : a * x + (1 - a) * ema; }
  double var() const { return n > 1 ? m2 / (n - 1) : 0.0; }
};
Online o; for (double x : {2., 4., 4., 4., 5., 5., 7., 9.}) o.update(x);
std::printf("%ld %.2f %.4f %.4f\n", o.n, o.mean, o.var(), o.ema);
// 8 5.00 4.5714 5.2910''',
  "deck": "Deck U6 · slides 25–27"}
],
"hft": {
 "text": "Session 6 makes on_book cost the same every tick: pooled memory, a mirrored flat book, and signals updated in O(1) — the session Project Phase 2 rests on.",
 "paragraphs": [
  "on_book runs on the client's receive thread for every snapshot, and everything in this session is about making that call cost the same every time. Start by finding the hidden new: every std::string you build, map node you insert or vector you grow inside on_book or on_ack is an allocation, and each one is usually fast and occasionally a lock, a page fault or a walk of a fragmented free list. That list is your Phase 2 target.",
  "The properties you buy with a pool are the mirror image of malloc's — no lock because it is per-thread, no syscall because the memory was reserved before the session opened, O(1) because allocation is a free-list pop, bounded because you sized it for the worst tick — and the lab's bench-alloc shows the result as a distribution: the heap has a tail that appears in every run; the pool's is flat unless a timer interrupt lands in the batch. Two operational details bite every year. An ObjectPool<Order, 4096> is on the order of 128 KB, so it is a member or a static, never a local on a 512 KB thread stack. And every alloc needs its free: forget one and alloc() returns null a few thousand ticks in and the bot goes quiet without crashing — log exhaustion loudly.",
  "Then mirror the book locally so on_book can go decode → update → decide in cache. Turn the symbol into a small integer once, with an open-addressing SymMap filled at startup, and from there every access is into fixed per-symbol arrays: the touch as integer ticks, your own resting orders from a pool, their queue_ahead from on_ack and on_queue. The engine is a price-time CLOB keyed on a monotonic sequence, so the local model can be exact rather than approximate.",
  "The flat book's failure mode deserves its own sentence in your write-up. A band indexed absolutely from $0.00 corrupts the other side of your own book for any name above $655.35 — green CI, clean sanitizer, and a book showing size nobody quoted, so your bot crosses a spread that does not exist. Index against a base, bounds-check both ends on the write path, and say how you re-base when the market walks out of the band; do not just make the array bigger, because megabytes of empty slots throw away the small working set you built this for.",
  "Signals ride on the same discipline: fold microprice into an Online state per symbol, keep the recent tape in a Ring, and never loop a window on the hot path — an O(k) recompute costs nothing most of the time and blows out exactly when volatility raises the message rate. Measure everything the way HW 6 grades it: pool against new/delete and the flat book against std::map, warm-up in, machine stated, and read the tail rather than the median, because that is where a rehash or a node allocation lands."
 ],
 "example": {
  "title": "In the arena",
  "code": r'''// include/order_book.hpp
// HW 6, part 2 (Session 6) — a fast order book (flat, price-indexed) + a fast symbol->id map.
// side 'B'=bid, 'S'=ask.  SymMap::get returns (uint64_t)-1 if absent.
//
// Range warning (see labs/session06.md, step B2): a flat array of N one-cent slots
// is a BAND, not "all prices". 1<<16 slots indexed absolutely from $0.00 covers
// only $0.00-$655.35, and the arena lists NFLX near $720 and META near $580 —
// an absolute index walks off the end and, because the two side arrays are
// adjacent members, silently corrupts the OTHER side of your own book.
struct Book {
    void add(uint64_t id, char side, double px, uint32_t qty);
    void cancel(uint64_t id);
    double best_bid() const { return 0.0;   /* TODO(student): O(1) */ }
    double best_ask() const { return 0.0;   /* TODO(student): O(1) */ }
};''',
  "text": "include/order_book.hpp in your starter repo — the HW 6 order-book stub, band warning included (bodies of add/cancel and the SymMap half elided here). The graded contract is four functions on Book plus put/get on SymMap; include/pool.hpp is its twin for part 1, and starters/session06/bench_book.cpp times your book against std::map and std::unordered_map."
 }
},
"interview": [
 {"q": "Why is the general-purpose allocator a problem on a low-latency path?",
  "a": "Because its cost is unpredictable rather than merely large. It may take a lock on a shared structure, search or split blocks, coalesce on free, or fall through to brk/mmap and a first-touch page fault in the kernel. The median call is around ten nanoseconds, which is why the mean looks fine, but the occasional slow call — hundreds of nanoseconds to microseconds — lands on a busy tick and becomes your p99.9, and you do not control when it happens.",
  "level": "warm-up", "skill": "cpp.raw-allocation"},
 {"q": "What does “amortized O(1)” mean for vector::push_back, and why might that not be good enough?",
  "a": "Most pushes are a single store; when capacity runs out the vector allocates a larger buffer and moves every element, which is O(n), and averaging that over the whole sequence gives constant cost per push. On a latency path you are graded on the worst operation, not the average: that one reallocation is an allocation plus an O(n) copy landing on an arbitrary tick. reserve() the capacity up front and the spikes disappear.",
  "level": "warm-up", "skill": "perf.complexity-in-cache-terms"},
 {"q": "Sketch a fixed-size object pool and state the complexity of alloc and free.",
  "a": "One contiguous slab of N slots, each big enough and aligned for T and at least one pointer wide, plus a head pointer to a singly linked free list threaded through the unused slots — so the list costs no extra memory. alloc pops the head, free pushes the slot back; both O(1), no search, no lock, no syscall, and LIFO reuse keeps slots cache-warm. Exhaustion returns null, which the caller must handle and should log loudly. Practically the pool is a member or a static, because a few thousand slots is well over 100 KB.",
  "level": "core", "skill": "perf.object-pool"},
 {"q": "What does placement new do, and what obligation does it create?",
  "a": "new (ptr) T{args...} constructs a T in storage you already own: it runs the constructor and allocates nothing. The obligation is symmetry — no delete will ever be called for it, so you must call p->~T() explicitly before returning the slot to the pool, and calling delete instead would free memory the heap never handed out. You are also responsible for the storage being correctly sized and aligned for T, which is why slots are declared alignas(T). The explicit destructor ends the object's life; it frees nothing.",
  "level": "core", "skill": "cpp.placement-new"},
 {"q": "Why size an open-addressing hash table to a power of two, and what is the worst thing std::unordered_map can do to you on a hot path?",
  "a": "A power-of-two capacity makes the wrap hash & (size - 1) instead of a modulo — one AND instead of an integer division — and the probe advance i = (i + 1) & mask. Keep the load factor under roughly 0.7 and size it once, because probe runs lengthen sharply past that. The worst thing unordered_map does is rehash: an unbounded O(n) reallocation at a moment you did not choose. The second is chaining — each bucket is a list of separately allocated nodes, so a collision is a pointer chase and a likely miss — and keyed on std::string, every lookup builds and hashes a string first.",
  "level": "core", "skill": "perf.open-addressing-hash"},
 {"q": "Why can a flat price-indexed array beat std::map for an order book even though the map is O(log n)?",
  "a": "Because prices sit on a tick grid, so tick - base_tick is an exact integer index and the lookup is arithmetic instead of a search. The map's pointer hops are each a potential cache miss at around 100 ns; the array is one indexed load into a small, dense working set. Add and cancel are O(1), the touch is a cached slot read with zero traversal, and matching walks adjacent slots sequentially. The only scan is a cancel that empties the touch — rare, and cache-friendly.",
  "level": "core", "skill": "trading.flat-order-book"},
 {"q": "How do you track your own queue position, and why does it matter?",
  "a": "At each price the venue holds a FIFO keyed on a monotonic sequence number, so your position is the remaining quantity of every order that arrived before yours. The arena hands it to you: on_ack carries queue_ahead and level_qty when your order rests, and on_queue updates them as fills and cancels ahead of you land; queue_ahead == 0 means you are next. It matters because fill probability is a function of the size in front of you, and because a reprice resets it — cancel and re-post puts you at the back — so a quote adjustment is a real, measurable cost.",
  "level": "core", "skill": "trading.queue-position"},
 {"q": "Your flat book is indexed absolutely from $0.00 with 65,536 one-cent slots. A name lists at $720, nothing crashes, sanitizers are clean and CI is green. What is happening, and how do you find it?",
  "a": "The array is a $655.35-wide band, so $720 indexes past the end. Because the bid and ask arrays are adjacent members of one object, the write lands on your own other side — a bid at $719.98 is tick 71,998, 6,462 slots past bid_'s end, so it adds size to the ask side at $64.62. The book then shows resting size no venue sent, and the bot crosses a spread that does not exist. ASan cannot see it because it instruments boundaries between allocations, not between two members of one object, and tests that quote near $100 never reach the edge. Fix: index against a base tick set from the first price seen, bounds-check both ends on every write, and re-base or reject-and-log out-of-band prices. To catch it, diff against a slow map-based shadow book on a replayed tape and stop at the first divergence.",
  "level": "senior", "skill": "trading.flat-order-book"},
 {"q": "You put a pmr::vector on a monotonic_buffer_resource inside on_book and call release() at the end of the tick. Where are the traps?",
  "a": "Lifetime order first: release() reclaims the whole slab, so every container that borrowed from it must be destroyed before the reset — otherwise its destructor touches memory the resource has already handed back and a later tick overwrites live data. The idiom is to scope the scratch container in an inner block and release after it closes. Second, overflow: with the default upstream, a working set bigger than the buffer silently falls back to the heap, so you are allocating on the hot path again with nothing in the source to show it; pass null_memory_resource() as upstream so overflow throws instead.",
  "level": "senior", "skill": "perf.arena-allocator"}
]
}
