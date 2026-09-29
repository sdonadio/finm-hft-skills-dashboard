# -*- coding: utf-8 -*-
"""Session 2 focus — Pointers & the cost of memory (deck U2, labs/session02.md,
speaker guide session2_talking_points.md).

Every `code` snippet is compiled and run by tools/validate_focus.py.
"""

FILE_SCOPE = {}   # "v_s2_cK": number of leading lines that go at file scope

S = {
  "n": 2,
  "focus": "Pointers & the cost of memory",
  "tagline": "Microseconds do not hide in your algebra — they hide in where a value lives, in how you pass it, and in who frees it.",
  "concepts": [
    {
      "title": "Where memory lives: the hierarchy, stack vs heap, storage duration",
      "text": "The CPU is fast and memory is far: a register is effectively free, an L1 hit is about a nanosecond, and a miss out to DRAM is about a hundred — one miss costs what a hundred L1 hits cost, so a 10 µs budget is roughly a hundred misses. The stack is a bump pointer whose top is almost always hot in L1 (about 0.3 ns in the lab); the heap is a call into a general-purpose allocator (about 12 ns, and occasionally far worse). Every variable also has a storage duration — static for the whole run, automatic for one frame, dynamic until delete, thread_local per thread — and that lifetime is decided by how it was created, not by where the braces are.",
      "code": r"""auto on_tick = [] {
  static int calls = 0;       // STATIC: lives for the whole run, despite the braces
  int local = 0;              // AUTOMATIC: reborn in every frame
  return ++calls * 10 + ++local;
};
int a = on_tick(), b = on_tick(), c = on_tick();
std::printf("%d %d %d\n", a, b, c);
// 11 21 31   -- the static survives every call; the automatic starts at 0 each time""",
      "deck": "Deck U2 · slides 5–7"
    },
    {
      "title": "Pointers and references: an address, and an alias",
      "text": "A pointer is just an address — 8 bytes on a 64-bit machine whatever it points at: & makes one, * follows it, nullptr means nowhere, and dereferencing nullptr is undefined behaviour rather than a crash you can count on. A reference is an alias fixed at birth: never null, never reseated. Both compile to the same machine code; the difference is the contract, so pick a pointer only when 'absent' is a legal answer. Read const right to left (const int* is a read-only view; int* const is a fixed address), and remember that arithmetic counts elements, not bytes: p + 1 advances sizeof(*p), p[i] is *(p + i), and a C array silently decays to a pointer and loses its length the moment you pass it.",
      "code": r"""int a[5] = {10, 20, 30, 40, 50};
int* p = a;                      // DECAY: p == &a[0]
const int* view = p + 2;         // read-only view of a[2]; *view = 1 would not compile
int& r = a[4]; r = 99;           // alias: writes a[4] itself
std::printf("%d %d %td %zu %zu\n", *view, p[4], (a + 5) - a, sizeof(a), sizeof(p));
// 30 99 5 20 8   -- units are elements; the array knows its size, the pointer does not""",
      "deck": "Deck U2 · slides 9–14"
    },
    {
      "title": "The cost of a copy: by value vs const&",
      "text": "Pass a big struct by value and every call copies sizeof(T) bytes before the first line of the body runs; a const& passes an 8-byte address with no copy, no null and no permission to write. On the slide a 4 KB book costs 38 ns by value and 0.7 ns by const& — about 50x for the copy alone. Small types (an int, a double, a 16-byte price) stay by value, because registers beat an indirection. And watch the optimiser: when it can see both sides it elides the copy and your benchmark reports 1.0x, which is why HW 2's harness calls through a function pointer.",
      "code": r"""struct Book { double px[256]; long qty[256]; };      // 4 KB, as on the slide
auto by_val = [](Book b)        { return b.px[0]; };  // copies 4096 bytes first
auto by_ref = [](const Book& b) { return b.px[0]; };  // passes one 8-byte address
static Book bk{}; bk.px[0] = 101.5;
std::printf("%zu %.1f %.1f %zu\n", sizeof(Book), by_val(bk), by_ref(bk),
            sizeof(const Book*));
// 4096 101.5 101.5 8   -- same answer, 512x the bytes moved on every by-value call""",
      "deck": "Deck U2 · slide 15"
    },
    {
      "title": "The heap by hand: the pairing rule, the classic bugs, the tail",
      "text": "malloc hands you uninitialised bytes and a void*; calloc zeroes them and checks the n*size multiplication; new allocates and constructs, throws bad_alloc instead of returning null, and must be matched shape for shape — new/delete, new[]/delete[], malloc or calloc/free, never crossed. Manual memory produces the same five bugs in every codebase: leak, dangling pointer, use-after-free, double free and a new[]/delete mismatch, all of which compile cleanly. And even correct new/delete is non-deterministic: the allocator may walk free lists, take a lock or fault in a fresh page, so the call that costs 12 ns on a quiet tick is your p99.9 on a busy one. Rule for now: allocate and touch everything before the session; Session 6 builds the pools that make it O(1).",
      "code": r"""int* z = static_cast<int*>(std::calloc(4, sizeof(int)));  // zeroed, checked n*size
double* b = new double[4]();                              // typed, value-initialised
auto* huge = new (std::nothrow) double[1ull << 50];       // opt out of bad_alloc
std::printf("%d %.1f %s\n", z[3], b[3], huge ? "got it" : "nullptr");
std::free(z); delete[] b; delete[] huge;                  // match the shape exactly
// 0 0.0 nullptr   -- delete[] of a null pointer is a defined no-op""",
      "deck": "Deck U2 · slides 17–19, 23, 25–26"
    },
    {
      "title": "Contiguous beats scattered: one block, row-major, SoA",
      "text": "The textbook double** matrix is rows + 1 allocations scattered across the heap and two dependent loads per element; one block of rows*cols doubles indexed r*cols + c is one allocation, one free and pure arithmetic. Row-major means c is the contiguous axis, so the inner loop must run over c — on the slide the same sum over 128 MB takes about 10 ms row-major and 48 ms column-major, 5x from access order alone. The same logic decides struct layout: an array of fat structs drags cold bytes through the cache on every scan, while a struct of arrays packs the hot field so every byte of every 64-byte line is useful.",
      "code": r"""struct Quote { double px; int qty; char tag[36]; };   // AoS, as on slide 29
std::printf("%zu %zu %zu\n", sizeof(Quote),
            (1024 * sizeof(Quote) + 63) / 64,         // lines to scan 1024 px, AoS
            (1024 * sizeof(double) + 63) / 64);       // lines to scan 1024 px, SoA
int rows = 1000, cols = 1000;
std::vector<double> m(rows * cols);                   // ONE allocation, one free
m[3 * cols + 7] = 1.0;                                // at(3, 7): arithmetic, no 2nd load
std::printf("%.1f\n", m[3007]);
// 48 768 128
// 1.0""",
      "deck": "Deck U2 · slides 20–22, 29"
    },
    {
      "title": "The 64-byte cache line, alignment and false sharing",
      "text": "Memory moves in lines, not bytes — 64 B on x86 and most ARM cores — so touching one byte pays for the line, and a struct straddling two lines costs two fetches. alignof(T) is the boundary T must start on, and alignas(64) puts a type on its own line. That matters most with threads: two variables written by two cores that happen to share a line ping-pong it between them, and on the slide identical work runs about 4x slower (312 ms vs 80 ms). The symptom is that adding a thread makes it slower; the fix is alignas(64) so each hot variable owns its line — the SPSC ring in Session 7 depends on it.",
      "code": r"""struct Shared { std::atomic<long> a, b; };           // two counters, ONE line
struct Padded { alignas(64) std::atomic<long> a;      // each owns its own line
                alignas(64) std::atomic<long> b; };
std::printf("%zu %zu %zu %zu\n", sizeof(Shared), alignof(Shared),
                                 sizeof(Padded), alignof(Padded));
// 16 8 128 64   -- Shared fits in one line and two writer cores fight over it""",
      "deck": "Deck U2 · slides 28, 30"
    },
    {
      "title": "Measure, don't guess — and most benchmarks lie",
      "text": "Intuition about performance is usually wrong, and so is an unguarded measurement. Time a -O2 build with steady_clock, warm up first so caches and the branch predictor are primed, batch tiny operations (steady_clock::now() itself costs about 13 ns), and sink the result so dead-code elimination cannot delete the work — a reading faster than an L1 hit is not a number. Then report the sorted distribution as p50 / p99 / p99.9 with your machine stated, and collect enough samples: with 1,000 of them, p99.9 is just your single worst one.",
      "code": r"""long long acc = 0;                                  // -O2, warm up, THEN time
for (int i = 0; i < 1000; ++i) acc += (long long)i * i;
asm volatile("" : : "r"(acc) : "memory");           // the doNotOptimize sink
std::printf("sum=%lld\n", acc);                     // leave acc unused and the
// sum=332833500                                    -- whole loop simply vanishes""",
      "deck": "Deck U2 · slides 32–34"
    }
  ],
  "hft": {
    "text": "Session 2 is where you stop writing faster code and start moving fewer bytes: where a value lives, how it is passed and who frees it decide your p99.9 long before the arithmetic does.",
    "paragraphs": [
      "Microseconds do not hide in your algebra, they hide in memory access. On the tick-to-trade path the arithmetic of a signal costs a nanosecond or two; one cache miss to DRAM costs about a hundred, one first-touch page fault costs microseconds. That is why this session is about the hierarchy, pointers and layout rather than clever code: the decisions that move your p99.9 are where the bytes are and how many times you copy them.",
      "Your bot already speaks pointers. on_book takes const std::string& symbol — a borrow, 8 bytes, no copy — and the moment one of those becomes a by-value std::string you have put a copy, and possibly an allocation, on every tick. Session 2's audit list for your own on_book is exactly three items: a copy on the path, a miss on the path (anything reached through two pointers), and an allocation on the path (new, push_back past capacity, string concatenation).",
      "The rule for the hot path is blunt: on_book must not allocate. Even correct new/delete fragments the heap over a session and its timing is unpredictable — the allocator may walk a free list, split a block, take a lock or ask the kernel for a fresh page — so the same call that costs 12 ns on a quiet tick costs microseconds on a busy one. That variance is your p99.9, and the busy tick is precisely the one you needed to win. Allocate and pre-fault everything before the session opens; Session 3 gives the memory an owner and Session 6 replaces the allocator outright.",
      "Layout is a choice you make before you profile. Books and price grids are flat contiguous arrays because contiguous access streams whole lines and gives the prefetcher a stride; a node-based container is a potential miss per hop. And false sharing is not hypothetical in this client: the transport runs its own receive thread and your strategy runs inside on_book, so any two counters the two sides write will share a line unless you alignas(64) them apart.",
      "None of it counts until you measure it honestly. The offline replay (scripts/latency_replay.py, one fixed tape for everyone) gives your Project Phase 0 baseline as p50 / p99 / p99.9, and every later phase is judged against those three numbers. Pair it with the correctness build — -O0 -g -fsanitize=address, or leaks --atExit on macOS — because a planted use-after-free is found by a tool, not by staring, and a clean run only proves that this input did not hit it."
    ],
    "example": {
      "title": "In the arena",
      "code": "// tests/bench.hpp\ntemplate <class T>\ninline void doNotOptimize(T&& v) {\n    asm volatile(\"\" : : \"g\"(v) : \"memory\");\n}\ninline void clobber() { asm volatile(\"\" : : : \"memory\"); }",
      "text": "tests/bench.hpp in the starter repo — the sink every Session 2 timing goes through, next to ns_per_op (warm-up of iters/10, then steady_clock around the loop). starters/hw02/hw2.cpp builds HW 2's by-value vs const& table on it and calls through a volatile function pointer so the compiler cannot elide the copy it is trying to measure."
    }
  },
  "interview": [
    {
      "q": "Roughly what does an L1 hit cost compared with a miss out to main memory, and what does that ratio imply for how you write a hot path?",
      "a": "An L1 hit is on the order of a nanosecond (about four cycles) and a miss to DRAM is on the order of a hundred nanoseconds, so one miss costs what roughly a hundred L1 hits cost. The implication is that the unit of optimisation is the memory access, not the instruction: reuse what is already hot (temporal locality), touch neighbours (spatial locality), and give the prefetcher a sequential stride to follow. Random access defeats both the cache and the prefetcher, which is why a pointer-chasing container loses to a contiguous one even when the algorithm is theoretically better.",
      "level": "warm-up",
      "skill": "perf.memory-hierarchy"
    },
    {
      "q": "What is the difference between a pointer and a reference, and how do you choose between them for a parameter?",
      "a": "A pointer is an address held in an object of its own: it can be null, can be reseated to point elsewhere, and supports arithmetic. A reference is an alias bound once at initialisation: it cannot be null, cannot be rebound (assigning through it assigns the referred-to object), and has no arithmetic. Both are passed as an 8-byte address, so the machine code is the same — the difference is the contract. My default for a read-only parameter is const T&; I use a pointer only when 'no object' is a legal answer, and neither one owns anything.",
      "level": "warm-up",
      "skill": "cpp.pointers"
    },
    {
      "q": "A scan over std::vector<Quote> is several times slower than the same scan over a std::vector<double> of just the prices, with identical arithmetic. Explain.",
      "a": "Memory moves in 64-byte lines, so the cost of a scan is the number of lines touched, not the number of adds. With a 48-byte Quote you pull 48 bytes to use 8, so 1024 prices cost 768 lines; a packed array of doubles gives 8 useful prices per line and the same scan costs 128. Splitting the hot field into its own contiguous array — struct of arrays — also gives the hardware prefetcher a regular stride to run ahead on.",
      "level": "core",
      "skill": "perf.contiguous-layout"
    },
    {
      "q": "When would you pass by value rather than by const reference, and how would you prove the difference with a benchmark?",
      "a": "By value for small, cheap-to-copy types — an int, a double, a 16-byte price struct — because they travel in registers and a reference would add an indirection; const& for anything larger than about two words, because by value copies sizeof(T) bytes on every call before the body starts. To measure it, put the two functions in a separate translation unit or call them through a volatile function pointer so the optimiser cannot inline and elide the copy, sink the results, warm up, and report p50/p99/p99.9 at -O2 — if both callee and caller are visible, clang removes the copy and you measure 1.0x, which is a lie about the real call.",
      "level": "core",
      "skill": "cpp.pass-by-reference"
    },
    {
      "q": "Name the classic manual-memory bugs. Which of them is not undefined behaviour, and why is that the dangerous one?",
      "a": "Leak (the last pointer is lost before delete, typically on an early return), dangling pointer (it outlives its object, like returning the address of a local), use-after-free, double free, and a shape mismatch such as new[] released with delete or malloc released with delete. All compile cleanly and all but the leak are undefined behaviour — they corrupt data or the allocator's bookkeeping and crash far from the cause. The leak is defined, silent and cumulative: memory grows all session until the process swaps or dies, and nobody notices until it matters.",
      "level": "core",
      "skill": "cpp.raw-allocation"
    },
    {
      "q": "What is false sharing, how would you recognise it, and how do you fix it?",
      "a": "Two threads writing different variables that happen to occupy the same 64-byte cache line: each write invalidates the other core's copy, so the line ping-pongs over the coherence protocol. The signature is a multithreaded version that is slower than single-threaded, with no logical contention anywhere in the source. The fix is to give each hot variable its own line with alignas(64) — or better, to stop sharing at all and keep per-thread state that is merged off the hot path.",
      "level": "core",
      "skill": "perf.cache-line-alignment"
    },
    {
      "q": "Your ASan build ran the whole test suite clean. What have you proved?",
      "a": "That these inputs, on this build, did not trigger a use-after-free, double free, out-of-bounds access or stack-use-after-return that ASan instruments — nothing more. It is a dynamic tool: code paths the tests never reach are unchecked, an overflow inside one object (between two adjacent members) is invisible to it, and on macOS ASan does not include LeakSanitizer, so you need leaks --atExit or a Linux run for leaks. Hunt at -O0 -g, since the optimiser can delete the very allocation you are chasing, and trust a positive report rather than a clean run.",
      "level": "core",
      "skill": "tools.sanitizers"
    },
    {
      "q": "A colleague's micro-benchmark reports that a function takes 0 ns. What went wrong, and how would you fix the measurement?",
      "a": "The result was unused, so dead-code elimination deleted the work — you timed nothing. Consume the result with a sink the compiler cannot see through (an empty asm volatile with a \"memory\" clobber, like doNotOptimize), and sink the right thing: keeping p[0] alive does not keep the allocation alive, so sink the pointer itself. Then fix the other classic errors: measure a -O2 build, warm up so caches and the branch predictor are primed, batch operations shorter than the clock's own cost, and report a sorted sample as p50 / p99 / p99.9 with the machine stated — steady_clock, not system_clock — instead of a single mean.",
      "level": "senior",
      "skill": "tools.benchmarking"
    },
    {
      "q": "Your code checks if (p) after it has already dereferenced p, and in the -O2 build the check has disappeared. Is that a compiler bug?",
      "a": "No. Dereferencing a null pointer is undefined behaviour, so once *p has executed the compiler may assume p is non-null and delete the later check as dead code — the same reasoning that lets it remove overflow checks written after the overflow. UB is not 'it crashes' or 'it wraps'; it is a licence for the optimiser to assume the case never happens. The fix is to test before the first dereference, prefer a reference when null is not a legal value, and run UBSan and ASan in the correctness build so the bad path is reported rather than optimised into something stranger.",
      "level": "senior",
      "skill": "cpp.pointers"
    }
  ]
}
