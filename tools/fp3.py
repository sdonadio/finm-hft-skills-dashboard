# -*- coding: utf-8 -*-
"""Session 3 focus — Object-Oriented C++ I: encapsulation, RAII & inheritance
(deck U3, labs/session03.md, speaker guide session3_talking_points.md).

Every `code` snippet is compiled and run by tools/validate_focus.py.
"""

# "v_s3_cK": number of leading display lines that go at file scope
FILE_SCOPE = {"v_s3_c1": 8, "v_s3_c2": 5, "v_s3_c3": 7, "v_s3_c4": 7, "v_s3_c5": 8}

S = {
  "n": 3,
  "focus": "Encapsulation, RAII & inheritance",
  "tagline": "Write a type that cannot be built invalid, cannot leak and cannot be copied by accident — and know exactly what inheritance does and does not give you.",
  "concepts": [
    {
      "title": "A class guards an invariant",
      "text": "An invariant is a fact that is true of every live object — an Order has a positive price and a quantity that never wraps. Make the data private, check it once in the constructor, and throw rather than let a half-built object escape; after that every member function may rely on it without re-checking. struct and class differ only in default access, member functions cost nothing extra (o.notional() compiles like notional(&o), with this as the hidden pointer), and const on a member function is a promise the compiler enforces: only const functions may be called through a const Book&. Expose operations that keep the invariant (fill, reprice), not a setter for every field.",
      "code": r"""class Order {
  double px_; unsigned qty_;                         // private: the guarded state
 public:
  Order(double px, unsigned q) : px_(px), qty_(q) {
    if (px <= 0 || q == 0) throw std::invalid_argument("bad order"); }
  void fill(unsigned q) { qty_ -= std::min(q, qty_); }   // never wraps
  double notional() const { return px_ * qty_; }         // const: no writes
};
Order o(101.5, 200); o.fill(50);
try { Order bad(101.5, 0); } catch (const std::exception& e) { std::printf("%s ", e.what()); }
std::printf("%.0f\n", o.notional());
// bad order 15225""",
      "deck": "Deck U3 · slides 5–6, 10"
    },
    {
      "title": "Constructors: initialise once, in declaration order",
      "text": "A constructor's job is to hand back a valid object, so build the members in the member-initialiser list — the body runs after they already exist and can only assign. Members are initialised in declaration order whatever order you write the list in, so declare in dependency order (spread_ after bid_ and ask_) or you read uninitialised memory. Mark one-argument constructors explicit so a bare double never silently becomes an Order, delegate so the invariant lives in one place, and prefer braces: they refuse to narrow and can never parse as a function declaration.",
      "code": r"""struct Quote {
  double bid_, ask_, spread_;                          // declaration order = init order
  Quote(double b, double a) : bid_(b), ask_(a), spread_(a - b) {}
  explicit Quote(double mid) : Quote(mid - 0.01, mid + 0.01) {}   // delegating
};
Quote q{100.00, 100.04}, m{50.0};
// Quote bad = 50.0;                                   // ERROR: the ctor is explicit
std::printf("%.2f %.2f\n", q.spread_, m.spread_);
// 0.04 0.02""",
      "deck": "Deck U3 · slides 7–8"
    },
    {
      "title": "Destructors and RAII: give it back on every exit path",
      "text": "~T() runs by itself — at scope exit, on delete, or while a throw unwinds the stack — and objects die in the reverse order they were built, so a later object may safely depend on an earlier one. That is the whole of RAII: acquire in the constructor, release in the destructor, and cleanup can no longer be forgotten on an early return. It works for anything with an acquire/release pair — a file handle, a mutex (std::lock_guard), a latency stamp (a ScopedTimer) — and the early return that leaked in Session 2 now unlocks and stamps correctly. Delete the copies of such a type, or two owners release it twice.",
      "code": r"""struct Tag { const char* n; explicit Tag(const char* s) : n(s) { std::printf("+%s ", n); }
             ~Tag() { std::printf("-%s ", n); } };
void on_fill(bool early) {
  Tag lock{"lock"}, timer{"timer"};                 // acquire, acquire
  if (early) return;                                // both still released
  std::printf("work ");
}
on_fill(true); std::printf("| "); on_fill(false); std::printf("| ");
try { Tag t{"t"}; throw 1; } catch (int) { std::printf("caught\n"); }
// +lock +timer -timer -lock | +lock +timer work -timer -lock | +t -t caught""",
      "deck": "Deck U3 · slides 9, 21–22"
    },
    {
      "title": "Copy semantics and the Rule of Three",
      "text": "The compiler writes a copy constructor and a copy assignment that copy member by member — exactly right for doubles and fixed arrays, and a double free for an owning raw pointer, because the copy shares the address and both destructors free it. So if a class needs a destructor it needs both copies too: a deep copy (new buffer, then copy the elements), a copy assignment that survives a = a, and — for the strong guarantee — allocate the new buffer before freeing the old one, so a throwing new leaves the object intact. Copy-and-swap gets all three right in three lines. If copying is meaningless (a pool, a socket, a book), = delete the pair instead.",
      "code": r"""struct PxBuf {
  std::size_t n; double* p;
  explicit PxBuf(std::size_t k) : n(k), p(new double[k]()) {}
  PxBuf(const PxBuf& o) : n(o.n), p(new double[o.n]) { std::copy(o.p, o.p + n, p); }
  PxBuf& operator=(const PxBuf&) = delete;          // or write it: slide 13
  ~PxBuf() { delete[] p; }
};
PxBuf a(8); a.p[0] = 101.5;
PxBuf b = a; b.p[0] = 99.0;                         // DEEP copy: two buffers
std::printf("%.1f %.1f %s\n", a.p[0], b.p[0], a.p != b.p ? "distinct" : "shared");
// 101.5 99.0 distinct""",
      "deck": "Deck U3 · slides 12–13"
    },
    {
      "title": "Move semantics, noexcept, and the Rule of Five / Zero",
      "text": "An rvalue is a temporary about to die, and std::move moves nothing — it is a cast that says 'treat this as one'; the move constructor does the work by stealing the pointer and blanking the source, O(1) whatever the buffer size. Mark it noexcept: a vector that grows must keep its strong guarantee, so it moves your elements only if the move cannot throw and otherwise copies every one — on the slide 16,383 4 KB copies versus 16,383 pointer steals, about 3.5x. The five special members travel together (a lone destructor silently kills the implicit moves), so the ladder is: Rule of Zero for value members, all five for a raw owner, = delete where copying is meaningless.",
      "code": r"""static int copies = 0, moves = 0;
template <bool NX> struct Buf {
  Buf() = default;
  Buf(const Buf&) { ++copies; }
  Buf(Buf&&) noexcept(NX) { ++moves; }
};
template <bool NX> void grow() { copies = moves = 0; std::vector<Buf<NX>> v;
  for (int i = 0; i < 1000; ++i) v.emplace_back(); std::printf("%d/%d ", copies, moves); }
grow<false>(); grow<true>(); std::printf("\n");
// 1023/0 0/1023   -- same growth; only a noexcept move lets vector move""",
      "deck": "Deck U3 · slides 14–17"
    },
    {
      "title": "Object layout, and value types for the hot path",
      "text": "Every member lands on a multiple of its own alignment, so declaration order changes sizeof: the same five Order fields take 40 bytes declared carelessly and 32 declared widest-first — two orders per 64-byte line instead of one and a half. Member functions add zero bytes; a virtual function adds an 8-byte vptr (Session 4). The types on_book touches should be flat, trivially copyable values — a Level, a TopOfBook — copied with a memcpy and asserted with static_assert, so a future std::string member breaks the build instead of your tail. Operators follow the same discipline: overload ==, < (or default <=>), () and << where the meaning is obvious, and name a function everywhere else.",
      "code": r"""struct Naive { char side; std::uint64_t id; double px; std::uint32_t qty; char sym[8]; };
struct Order { std::uint64_t id; double px; char sym[8]; std::uint32_t qty; char side; };
static_assert(std::is_trivially_copyable_v<Order>);   // a std::string member breaks this
std::printf("%zu %zu %zu\n", sizeof(Naive), sizeof(Order), 64 / sizeof(Order));
// 40 32 2   -- same five fields, widest first: two orders per cache line""",
      "deck": "Deck U3 · slides 19–20, 23"
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
      "deck": "Deck U3 · slides 25–31"
    }
  ],
  "hft": {
    "text": "Session 3 turns Session 2's bugs into types that cannot have them — and fixes the rule that decides your tail: on the hot path, flat values; off it, owners built once.",
    "paragraphs": [
      "Session 2 ended on five memory bugs that compile cleanly. A class removes three of them by construction: the invariant is checked once at birth so a zero-quantity order cannot exist, the destructor gives back what the constructor took on every exit path, and deleted or hand-written copies decide what b = a means for a type that owns memory. That is not style; it is how you make a leak on an early return, and the double free that follows a shallow copy, impossible to write in your bot.",
      "The deck's hot-path rule sorts every type into three kinds. Level and TopOfBook are Rule of Zero, trivially copyable and static_asserted — copying one per tick is a memcpy with no allocation. PxBuf is Rule of Five and owns heap memory, so it is a member sized at startup, never created inside on_book. Strategy is Rule of Zero again, because its members already know how to copy, move and die. Pass const&, store by value: one fixed-size copy per tick and nothing for the allocator to do.",
      "noexcept is a semantic switch, not an optimisation hint. Without it a growing vector copies every element to keep its strong guarantee — 16,383 deep copies of a 4 KB buffer on the slide — and each of those is an allocation that can land on a busy tick. Mark every move that steals a pointer noexcept, and on the hot path reserve up front so the reallocations never happen at all.",
      "Bytes are latency. Reordering the same Order fields widest-first takes it from 40 to 32 bytes, two orders per cache line, and a static_assert on the size turns an innocent new member into a failed build rather than an unexplained p99.9 regression. Member functions are free; a virtual function adds an 8-byte vptr and an indirect call — which is exactly the bill Session 4 itemises.",
      "Your bot already uses inheritance: HFTBot publicly derives from ArenaClient, and your bot derives from HFTBot. Without virtual, a call through a base reference is bound at compile time and can be inlined; that static binding is the default and it is the fast path. Keep inheritance for a genuine is-a, compose the parts you merely use (a FeePolicy, a book) so you can swap and test them alone, and pass bases by const& so nothing is sliced. Session 3 is also midterm material: construction order, slicing and name hiding are read-the-snippet questions."
    ],
    "example": {
      "title": "In the arena",
      "code": "// hft/cpp_client/include/arena_client.hpp\nclass ArenaClient {\npublic:\n    using clock      = std::chrono::steady_clock;\n    using time_point = clock::time_point;\n\n    explicit ArenaClient(ClientConfig cfg);\n    virtual ~ArenaClient();\n\n    ArenaClient(const ArenaClient&)            = delete;\n    ArenaClient& operator=(const ArenaClient&) = delete;",
      "text": "hft/cpp_client/include/arena_client.hpp — the transport is a Session 3 class: an explicit one-argument constructor, and deleted copies because it owns a live socket and exactly one object may close it. The virtual destructor is Session 4's topic. In the same header, BookView holds two std::string members, so it is not trivially copyable — fine at the transport boundary, but not the shape for state you copy every tick in your own on_book."
    }
  },
  "interview": [
    {
      "q": "What is a class invariant, and why is a setter for every private field not encapsulation?",
      "a": "An invariant is a property true of every live object — price positive, side 'B' or 'S', quantity never wraps. You establish it once in the constructor (throwing if the arguments violate it) and then every member function may rely on it without re-checking. A setter that writes any value is a public field with extra typing: it lets callers break the invariant. Encapsulation means exposing operations that preserve it — fill(q) that clamps, reprice(px) that validates — and keeping the data private.",
      "level": "warm-up",
      "skill": "cpp.classes-invariants"
    },
    {
      "q": "What is RAII, and name two things in the standard library that are examples of it.",
      "a": "RAII means a resource is acquired in a constructor and released in the matching destructor, so its lifetime is tied to a scope and the compiler guarantees the release on every exit path — including during exception unwinding. std::lock_guard (acquires a mutex, unlocks in its destructor) and std::vector (owns its heap buffer and frees it) are canonical examples; std::fstream and std::unique_ptr are two more. The payoff is deterministic cleanup at the closing brace with no garbage collector and nothing to forget.",
      "level": "warm-up",
      "skill": "cpp.raii"
    },
    {
      "q": "A class owns a raw new[] buffer and declares only a destructor. What has the compiler silently done to you?",
      "a": "It has generated member-by-member copy operations, which copy the pointer rather than the buffer, so a copy leaves two objects whose destructors free one allocation: a double free, usually crashing far from the cause. And declaring a destructor suppresses the implicit move operations, so every would-be move falls back to that broken copy. Either write all five special members — deep copy, self-assignment-safe copy assignment, noexcept moves that blank the source — or hold the buffer in a std::vector and write none of them.",
      "level": "core",
      "skill": "cpp.rule-of-five"
    },
    {
      "q": "What does std::move actually do, and what state is the source in afterwards?",
      "a": "Nothing at run time: it is static_cast<T&&>, a cast that makes an lvalue eligible to bind to an rvalue reference, so overload resolution picks the move constructor or move assignment. Those functions do the work — typically stealing a pointer and leaving the source empty. Afterwards the source is valid but unspecified: you may destroy it or assign to it, not read it and rely on the value. And never write return std::move(local); a plain return already moves or elides, and the cast can block copy elision.",
      "level": "core",
      "skill": "cpp.move-semantics"
    },
    {
      "q": "Why does it matter whether a move constructor is noexcept when you push_back into a std::vector?",
      "a": "When a vector reallocates it must preserve the strong exception guarantee: if relocating an element throws halfway, the original buffer must still be intact. It can only guarantee that by moving if the move cannot throw, so it uses std::move_if_noexcept and falls back to copying every element when the move is not noexcept. For a buffer-owning type that turns each growth step into a deep copy and an allocation per element — on the deck's run, 16,383 copies instead of 16,383 moves. Stealing a pointer cannot throw, so mark it noexcept, and on a hot path reserve up front so growth never happens.",
      "level": "core",
      "skill": "cpp.move-semantics"
    },
    {
      "q": "Two structs hold the same five fields but have different sizeof. How is that possible, and what do you do about it on a hot path?",
      "a": "Each member must start at a multiple of its own alignment, so a char followed by a uint64_t leaves 7 bytes of padding, and the struct's size is rounded up to a multiple of its largest alignment, adding tail padding. Declaring fields widest-first minimises the holes — the deck's Order goes from 40 to 32 bytes, two per 64-byte line. On a hot path I order the fields that way, keep the type trivially copyable, and static_assert both sizeof and is_trivially_copyable so a later change breaks the build instead of silently widening every cache line the book touches.",
      "level": "core",
      "skill": "perf.object-layout"
    },
    {
      "q": "struct D : B has a member M m. In what order do the constructors and destructors run, and why is it that order?",
      "a": "Construction runs outside-in: the base B first, then the members in declaration order (m), then D's constructor body; destruction is the exact reverse — D's body, then ~M, then ~B — so the output is B M D, ~D ~M ~B. The base must be complete before members that may use it are built, the body sees a fully built object, and reversing on the way out guarantees nothing is destroyed while something built after it still depends on it. The initialiser-list order you write does not change any of this; only declaration order does.",
      "level": "core",
      "skill": "cpp.inheritance"
    },
    {
      "q": "struct R : Q redefines int n() const without virtual. R r; Q q = r; Q& rf = r; — what do q.n(), rf.n() and r.n() return, and what two mechanisms are at work?",
      "a": "1, 1 and 2. Q q = r slices: it copy-constructs a Q from the Q subobject of r, so q is simply a Q and nothing remembers it came from an R. rf does refer to the whole R object, but n() is not virtual, so the call is bound at compile time by the static type Q& and runs Q::n. Only r.n() sees R::n, which hides Q::n. The practical lessons: pass bases by const& so nothing is sliced, a container of base values slices every element, and without virtual the static type decides — which Session 4 changes and prices.",
      "level": "senior",
      "skill": "cpp.inheritance"
    },
    {
      "q": "Write the copy assignment for a class that owns a raw buffer. What does 'strong exception guarantee' require of it, and how does copy-and-swap deliver it?",
      "a": "It must handle self-assignment, deep-copy the other object's buffer and free the old one — and the strong guarantee says that if anything throws, *this is left unchanged. So you allocate and fill the new buffer first, and only then delete[] the old pointer and install the new one; freeing first would leave a dangling pointer if new throws. Copy-and-swap packages that: take the parameter by value (the copy constructor does the allocating, and may throw before *this is touched), then swap the members with the parameter, whose destructor frees the old buffer. It is correct for self-assignment too, at the cost of always copying, and with a noexcept move constructor the same operator serves as move assignment.",
      "level": "senior",
      "skill": "cpp.rule-of-five"
    }
  ]
}
