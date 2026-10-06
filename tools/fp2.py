# -*- coding: utf-8 -*-
"""Session 2 focus — Pointers & the cost of memory + Object-Oriented C++ I
(encapsulation & inheritance). Deck U2 (69 slides), labs/session02.md, speaker
guide session2_talking_points.md. This is the old Sessions 2 and 3 MERGED
(re-scheduled 2026-10-05): 7 cards cover both halves; the standalone
'Measure, don't guess' card and the standalone operators/constructors cards were
folded into neighbours (the benchmarking and operator material stays in the
skills checklist and the interview questions).

Every `code` snippet is compiled and run by tools/validate_focus.py.
"""

FILE_SCOPE = {"v_s2_c5": 8, "v_s2_c6": 7}   # "v_s2_cK": leading lines at file scope

S = {
  "n": 2,
  "focus": "Pointers, memory & object-oriented C++ I",
  "tagline": "Microseconds hide in where a value lives, how you pass it and who frees it — then you write the types that make those bugs impossible to write.",
  "concepts": [
    {
      "title": "Where memory lives: the hierarchy, stack vs heap, storage duration",
      "text": "The CPU is fast and memory is far: a register is effectively free, an L1 hit is about a nanosecond, and a miss out to DRAM is about a hundred — one miss costs what a hundred L1 hits cost, so a 10 µs budget is roughly a hundred misses. The stack is a bump pointer whose top is almost always hot in L1 (about 0.3 ns in the lab); the heap is a call into a general-purpose allocator (about 12 ns, and occasionally far worse). Every variable also has a storage duration — static for the whole run, automatic for one frame, dynamic until delete, thread_local per thread — decided by how it was created, not by where the braces are. Measure all of it honestly: -O2, warm up, sink the result so the optimiser cannot delete the work, and report p50 / p99 / p99.9 rather than one mean.",
      "code": r"""auto on_tick = [] {
  static int calls = 0;       // STATIC: lives for the whole run, despite the braces
  int local = 0;              // AUTOMATIC: reborn in every frame
  return ++calls * 10 + ++local;
};
int a = on_tick(), b = on_tick(), c = on_tick();
std::printf("%d %d %d\n", a, b, c);
// 11 21 31   -- the static survives every call; the automatic starts at 0 each time""",
      "deck": "Deck U2 · slides 5–7, 32–34"
    },
    {
      "title": "Pointers, references and the cost of a copy",
      "text": "A pointer is just an address — 8 bytes on a 64-bit machine whatever it points at: & makes one, * follows it, nullptr means nowhere, and dereferencing nullptr is undefined behaviour. A reference is an alias fixed at birth: never null, never reseated; both compile to the same machine code, so pick a pointer only when 'absent' is a legal answer. Read const right to left, and remember that arithmetic counts elements, not bytes: p + 1 advances sizeof(*p), and a C array decays to a pointer and loses its length the moment you pass it. The same discipline decides how you pass a big struct: by value copies sizeof(T) bytes before the body runs (a 4 KB book is 38 ns by value against 0.7 ns by const&, about 50x), while small types stay by value.",
      "code": r"""int a[5] = {10, 20, 30, 40, 50};
int* p = a;                      // DECAY: p == &a[0]
const int* view = p + 2;         // read-only view of a[2]; *view = 1 would not compile
int& r = a[4]; r = 99;           // alias: writes a[4] itself
struct Book { double px[256]; long qty[256]; };         // 4 KB
auto by_val = [](Book b)        { return b.px[0]; };    // copies 4096 bytes first
auto by_ref = [](const Book& b) { return b.px[0]; };    // passes one 8-byte address
static Book bk{}; bk.px[0] = 101.5;
std::printf("%d %d %zu %.1f %.1f\n", *view, p[4], sizeof(Book), by_val(bk), by_ref(bk));
// 30 99 4096 101.5 101.5   -- same answers; one call moved 512x the bytes""",
      "deck": "Deck U2 · slides 9–15"
    },
    {
      "title": "The heap by hand: the pairing rule, the classic bugs, the tail",
      "text": "malloc hands you uninitialised bytes; calloc zeroes them and checks the n*size multiplication; new allocates and constructs, throws bad_alloc instead of returning null, and must be matched shape for shape — new/delete, new[]/delete[], malloc or calloc/free, never crossed. Manual memory produces the same five bugs in every codebase — leak, dangling pointer, use-after-free, double free and a new[]/delete mismatch — all of which compile cleanly, and which a sanitizer (ASan, UBSan, leaks --atExit on macOS) reports down to the line. Even correct new/delete is non-deterministic: the allocator may walk free lists, take a lock or fault in a fresh page, so the call that costs 12 ns on a quiet tick is your p99.9 on a busy one. The rest of this session removes the bugs by construction; Session 5 builds the pools that remove the tail.",
      "code": r"""int* z = static_cast<int*>(std::calloc(4, sizeof(int)));  // zeroed, checked n*size
double* b = new double[4]();                              // typed, value-initialised
auto* huge = new (std::nothrow) double[1ull << 50];       // opt out of bad_alloc
std::printf("%d %.1f %s\n", z[3], b[3], huge ? "got it" : "nullptr");
std::free(z); delete[] b; delete[] huge;                  // match the shape exactly
// 0 0.0 nullptr   -- delete[] of a null pointer is a defined no-op""",
      "deck": "Deck U2 · slides 17–19, 23–26"
    },
    {
      "title": "Layout beats cleverness: contiguous, SoA, padding and the 64-byte line",
      "text": "Memory moves in 64-byte lines, so a scan costs the lines it touches, not the adds it does. One block of rows*cols doubles indexed r*cols + c replaces rows + 1 scattered allocations (the same sum over 128 MB is about 10 ms row-major and 48 ms column-major); a struct of arrays packs the hot field so every byte of every line is useful; and declaring members widest-first removes padding (the deck's Order goes from 40 to 32 bytes, two per line). Two writer cores sharing a line ping-pong it between them — about 4x slower on the slide — and alignas(64) gives each hot variable its own line. Assert the size of hot types with static_assert so a stray member breaks the build, not the tail.",
      "code": r"""struct Quote  { double px; int qty; char tag[36]; };   // array-of-structs, 48 B
struct Loose  { char a; double b; char c; };           // padded to 24
struct Packed { double b; char a; char c; };           // widest first: 16
struct Shared { std::atomic<long> a, b; };             // two counters, ONE line
struct Padded { alignas(64) std::atomic<long> a; alignas(64) std::atomic<long> b; };
std::printf("%zu %zu %zu %zu %zu %zu\n", sizeof(Quote), sizeof(Loose),
            sizeof(Packed), sizeof(Shared), sizeof(Padded), alignof(Padded));
// 48 24 16 16 128 64   -- Shared fits one line and two writer cores fight over it""",
      "deck": "Deck U2 · slides 20–22, 28–30, 54, 57"
    },
    {
      "title": "A class guards an invariant: constructors, const, access",
      "text": "An invariant is a fact true of every live object — an Order has a positive price and a quantity that never wraps. Make the data private, check it once in the constructor, and throw rather than let a half-built object escape; every member function may then rely on it. Build members in the initialiser list (the body only assigns), remember they are initialised in declaration order whatever order you write the list in, and mark one-argument constructors explicit so a bare double never silently becomes an Order. struct and class differ only in default access, member functions cost no extra bytes, and const on a member function is a promise the compiler enforces. Expose operations that keep the invariant (fill, reprice), not a setter for every field, and overload only the operators whose meaning is obvious.",
      "code": r"""class Order {
  double px_; unsigned qty_;                         // private: the guarded state
 public:
  explicit Order(double px, unsigned q) : px_(px), qty_(q) {
    if (px <= 0 || q == 0) throw std::invalid_argument("bad order"); }
  void fill(unsigned q) { qty_ -= std::min(q, qty_); }   // never wraps
  double notional() const { return px_ * qty_; }         // const: no writes
};
Order o(101.5, 200); o.fill(50);
try { Order bad(101.5, 0); } catch (const std::exception& e) { std::printf("%s ", e.what()); }
std::printf("%.0f\n", o.notional());
// bad order 15225""",
      "deck": "Deck U2 · slides 39–44, 53"
    },
    {
      "title": "RAII and the Rule of Five: one owner, released on every exit path",
      "text": "~T() runs by itself — at scope exit, on delete, or while a throw unwinds the stack — in the reverse order of construction. That is RAII: acquire in the constructor, release in the destructor, and cleanup cannot be forgotten on an early return (a file, a std::lock_guard, a ScopedTimer). The compiler's member-by-member copy of an owning raw pointer is a double free, so a class that needs a destructor needs the other four special members too: a deep copy, a move that steals the pointer and blanks the source, and noexcept on that move — a growing vector copies every element unless the move cannot throw (16,383 4 KB copies against 16,383 pointer steals on the slide). Rule of Zero for value members, all five for a raw owner, = delete where copying is meaningless.",
      "code": r"""struct PxBuf {
  std::size_t n; double* p;
  explicit PxBuf(std::size_t k) : n(k), p(new double[k]()) {}                  // acquire
  PxBuf(const PxBuf& o) : n(o.n), p(new double[o.n]) { std::copy(o.p, o.p + n, p); }
  PxBuf(PxBuf&& o) noexcept : n(o.n), p(o.p) { o.n = 0; o.p = nullptr; }       // steal, blank
  ~PxBuf() { if (p) std::printf("free "); delete[] p; }                        // release
};
try { PxBuf a(8); a.p[0] = 101.5; PxBuf b = a; PxBuf c = std::move(a); throw 1; }
catch (int) { std::printf("caught\n"); }
// free free caught   -- b and c are released by the throw; the moved-from a owned nothing""",
      "deck": "Deck U2 · slides 43, 46–51, 55–56"
    },
    {
      "title": "Inheritance without virtual: order, slicing, hiding",
      "text": "Public inheritance is an is-a claim: every Derived contains a Base subobject, built first and destroyed last — bases, then members in declaration order, then the body, and exactly the reverse on the way out. Without virtual, the call is bound at compile time by the static type: copy a derived object into a base by value and the derived part is sliced off, and a call through a Base& runs the base's function. A derived name hides every base overload with that name (using Base::name brings them back), final closes a class, and when you merely use something — a fee policy, a vector of levels — contain it rather than inherit from it.",
      "code": r"""struct B { B() { std::printf("B"); } ~B() { std::printf("~B "); } int n() const { return 1; } };
struct M { M() { std::printf("M"); } ~M() { std::printf("~M"); } };
struct D : B { M m; D() { std::printf("D "); } ~D() { std::printf("~D"); }
               int n() const { return 2; } };                  // hides B::n
int main() {
  { D d; B sliced = d; const B& ref = d;                       // copy slices; ref does not
    std::printf("%d%d%d ", sliced.n(), ref.n(), d.n()); }      // static type picks n()
  std::printf("\n");
}
// BMD 112 ~B ~D~M~B""",
      "deck": "Deck U2 · slides 59–65"
    }
  ],
  "hft": {
    "text": "Why this matters in HFT",
    "paragraphs": [
      "Microseconds do not hide in your algebra, they hide in memory access. On the tick-to-trade path the arithmetic of a signal costs a nanosecond or two; one cache miss to DRAM costs about a hundred, one first-touch page fault costs microseconds. That is why this session starts with the hierarchy, pointers and layout rather than clever code: the decisions that move your p99.9 are where the bytes are and how many times you copy them.",
      "Your bot already speaks pointers. on_book takes const std::string& symbol — a borrow, 8 bytes, no copy — and the moment one of those becomes a by-value std::string you have put a copy, and possibly an allocation, on every tick. The audit list for your own on_book is three items: a copy on the path, a miss on the path (anything reached through two pointers), and an allocation on the path (new, push_back past capacity, string concatenation).",
      "The rule for the hot path is blunt: on_book must not allocate, because even correct new/delete has an unpredictable tail. The second half of the session is how you make that rule enforceable in types: a class checks its invariant once at birth, a destructor gives back what the constructor took on every exit path, and the Rule of Five decides what b = a means for a type that owns memory. Mark every move that steals a pointer noexcept — otherwise a growing vector deep-copies every element, an allocation per element on a busy tick.",
      "Bytes are latency. Books and price grids are flat contiguous arrays because contiguous access streams whole lines; reordering the same Order fields widest-first takes it from 40 to 32 bytes, two per line; a static_assert on the size turns an innocent new member into a failed build rather than a p99.9 regression; and any two counters your receive thread and your strategy both write will false-share unless you alignas(64) them apart. The types on_book touches should be flat, trivially copyable values; owners are built once, off the path.",
      "Your bot also uses inheritance: HFTBot publicly derives from ArenaClient, and your bot derives from HFTBot. Without virtual, a call through a base reference is bound at compile time and can be inlined; keep inheritance for a genuine is-a, compose what you merely use, and pass bases by const& so nothing is sliced. Measure all of it honestly (the offline replay gives your Project Phase 0 baseline as p50 / p99 / p99.9) and run the correctness build under a sanitizer. Everything in this session is on the Oct 26 midterm, which covers Sessions 1–4."
    ],
    "example": {
      "title": "In the arena",
      "code": "// hft/cpp_client/include/arena_client.hpp\nclass ArenaClient {\npublic:\n    using clock      = std::chrono::steady_clock;\n    using time_point = clock::time_point;\n\n    explicit ArenaClient(ClientConfig cfg);\n    virtual ~ArenaClient();\n\n    ArenaClient(const ArenaClient&)            = delete;\n    ArenaClient& operator=(const ArenaClient&) = delete;",
      "text": "hft/cpp_client/include/arena_client.hpp — the transport is a Session 2 class: an explicit one-argument constructor, and deleted copies because it owns a live socket and exactly one object may close it. The virtual destructor is Session 3's topic. In the same header, BookView holds two std::string members, so it is not trivially copyable — fine at the transport boundary, but not the shape for state you copy every tick in your own on_book."
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
      "q": "What is RAII, and name two things in the standard library that are examples of it.",
      "a": "RAII means a resource is acquired in a constructor and released in the matching destructor, so its lifetime is tied to a scope and the compiler guarantees the release on every exit path — including during exception unwinding. std::lock_guard (acquires a mutex, unlocks in its destructor) and std::vector (owns its heap buffer and frees it) are canonical examples; std::fstream and std::unique_ptr are two more. The payoff is deterministic cleanup at the closing brace with no garbage collector and nothing to forget.",
      "level": "warm-up",
      "skill": "cpp.raii"
    },
    {
      "q": "A scan over std::vector<Quote> is several times slower than the same scan over a std::vector<double> of just the prices, with identical arithmetic. Explain.",
      "a": "Memory moves in 64-byte lines, so the cost of a scan is the number of lines touched, not the number of adds. With a 48-byte Quote you pull 48 bytes to use 8, so 1024 prices cost 768 lines; a packed array of doubles gives 8 useful prices per line and the same scan costs 128. Splitting the hot field into its own contiguous array — struct of arrays — also gives the hardware prefetcher a regular stride to run ahead on.",
      "level": "core",
      "skill": "perf.data-layout"
    },
    {
      "q": "Name the classic manual-memory bugs. Which of them is not undefined behaviour, and why is that the dangerous one?",
      "a": "Leak (the last pointer is lost before delete, typically on an early return), dangling pointer (it outlives its object, like returning the address of a local), use-after-free, double free, and a shape mismatch such as new[] released with delete or malloc released with delete. All compile cleanly and all but the leak are undefined behaviour — they corrupt data or the allocator's bookkeeping and crash far from the cause. The leak is defined, silent and cumulative: memory grows all session until the process swaps or dies, and nobody notices until it matters.",
      "level": "core",
      "skill": "cpp.raw-allocation"
    },
    {
      "q": "A class owns a raw new[] buffer and declares only a destructor. What has the compiler silently done to you?",
      "a": "It has generated member-by-member copy operations, which copy the pointer rather than the buffer, so a copy leaves two objects whose destructors free one allocation: a double free, usually crashing far from the cause. And declaring a destructor suppresses the implicit move operations, so every would-be move falls back to that broken copy. Either write all five special members — deep copy, self-assignment-safe copy assignment, noexcept moves that blank the source — or hold the buffer in a std::vector and write none of them.",
      "level": "core",
      "skill": "cpp.rule-of-five"
    },
    {
      "q": "Why does it matter whether a move constructor is noexcept when you push_back into a std::vector?",
      "a": "When a vector reallocates it must preserve the strong exception guarantee: if relocating an element throws halfway, the original buffer must still be intact. It can only guarantee that by moving if the move cannot throw, so it uses std::move_if_noexcept and falls back to copying every element when the move is not noexcept. For a buffer-owning type that turns each growth step into a deep copy and an allocation per element — on the deck's run, 16,383 copies instead of 16,383 moves. Stealing a pointer cannot throw, so mark it noexcept, and on a hot path reserve up front so growth never happens.",
      "level": "core",
      "skill": "cpp.rule-of-five"
    },
    {
      "q": "struct D : B has a member M m. In what order do the constructors and destructors run, and why is it that order?",
      "a": "Construction runs outside-in: the base B first, then the members in declaration order (m), then D's constructor body; destruction is the exact reverse — D's body, then ~M, then ~B — so the output is B M D, ~D ~M ~B. The base must be complete before members that may use it are built, the body sees a fully built object, and reversing on the way out guarantees nothing is destroyed while something built after it still depends on it. The initialiser-list order you write does not change any of this; only declaration order does.",
      "level": "core",
      "skill": "cpp.inheritance"
    },
    {
      "q": "A colleague's micro-benchmark reports that a function takes 0 ns. What went wrong, and how would you fix the measurement?",
      "a": "The result was unused, so dead-code elimination deleted the work — you timed nothing. Consume the result with a sink the compiler cannot see through (an empty asm volatile with a \"memory\" clobber, like doNotOptimize), and sink the right thing: keeping p[0] alive does not keep the allocation alive, so sink the pointer itself. Then fix the other classic errors: measure a -O2 build, warm up so caches and the branch predictor are primed, batch operations shorter than the clock's own cost, and report a sorted sample as p50 / p99 / p99.9 with the machine stated — steady_clock, not system_clock — instead of a single mean.",
      "level": "senior",
      "skill": "tools.benchmarking"
    },
    {
      "q": "struct R : Q redefines int n() const without virtual. R r; Q q = r; Q& rf = r; — what do q.n(), rf.n() and r.n() return, and what two mechanisms are at work?",
      "a": "1, 1 and 2. Q q = r slices: it copy-constructs a Q from the Q subobject of r, so q is simply a Q and nothing remembers it came from an R. rf does refer to the whole R object, but n() is not virtual, so the call is bound at compile time by the static type Q& and runs Q::n. Only r.n() sees R::n, which hides Q::n. The practical lessons: pass bases by const& so nothing is sliced, a container of base values slices every element, and without virtual the static type decides — which Session 3 changes and prices.",
      "level": "senior",
      "skill": "cpp.inheritance"
    }
  ]
}
