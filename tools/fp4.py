# -*- coding: utf-8 -*-
"""Session 4 focus — Templates, compile-time & CRTP (deck U4, labs/session04.md,
session4_talking_points.md). The midterm (Mon Oct 26, Session 5) covers Sessions 1-4,
so this session's templates and CRTP are on it; the lab finishes at home.

Every `code` snippet is compiled and run by tools/validate_focus.py.
"""

# "v_s4_cK": number of leading display lines that are file-scope declarations
FILE_SCOPE = {
    "v_s4_c1": 8,
    "v_s4_c2": 5,
    "v_s4_c3": 7,
    "v_s4_c4": 7,
    "v_s4_c5": 5,
    "v_s4_c6": 8,
    "v_s4_c7": 7,
}

S = {
"n": 4,
"focus": "Templates, compile-time & CRTP",
"tagline": "Session 3 priced every decision made at run time; tonight you make it at build time instead — one definition, one fully inlined function per type, and the vtable row of the benchmark disappears.",
"concepts": [
 {"title": "A template is a recipe, not code",
  "text": "template <class T> is a blueprint: the compiler instantiates it — generates a real function or class — the first time you use it with concrete arguments, and each instantiation is as visible to the optimiser as hand-written code. A non-type parameter puts a value in the type: Ring<double, 8> knows its capacity at compile time, so the wrap mask N - 1 is a constant, the storage is inline with no heap and no size field, and a static_assert on N rejects Ring<int, 6> at build time. The prices are real too: definitions live in headers, and every distinct instantiation is separate machine code that grows the binary and competes for the instruction cache.",
  "code": """template <class T, std::size_t N> class Ring {
  static_assert(N > 0 && (N & (N - 1)) == 0, "N must be a power of two");
  std::array<T, N> buf_{};  std::size_t head_ = 0;      // inline: no heap
public:
  void push(const T& x) { buf_[head_++ & (N - 1)] = x; }
  std::size_t size() const { return head_ < N ? head_ : N; }
  const T& back() const { return buf_[(head_ - 1) & (N - 1)]; }
};
Ring<double, 8> mids;                                   // capacity is in the TYPE
for (int i = 0; i < 10; ++i) mids.push(100.0 + i * 0.01);
std::printf("%zu %.2f %zu\\n", mids.size(), mids.back(), sizeof(mids));
// 8 100.09 72""",
  "deck": "Deck U4 · slides 5–6"},
 {"title": "Deduction, and specialising the type that deserves it",
  "text": "You rarely spell template arguments: the compiler deduces them from the call by matching each argument to its parameter, and it tries no conversions, so max_of(3, 4.5) is a conflict rather than a silent promotion. When one type deserves hand-tuning it gets its own full specialization; a partial specialization covers a whole family (every pointer, every Ring<T, 8>) and is allowed for class templates only — functions overload instead. The most specialised match always wins.",
  "code": """struct Price { std::int64_t ticks; };
template <class T> struct Wire    { static const char* fmt() { return "generic"; } };
template <> struct Wire<Price>    { static const char* fmt() { return "fixed-point"; } };
template <class T> struct Wire<T*> { static const char* fmt() { return "pointer"; } };
template <class T> T max_of(T a, T b) { return a < b ? b : a; }
std::printf("%s %s %s %.1f\\n", Wire<int>::fmt(), Wire<Price>::fmt(),
            Wire<Price*>::fmt(), max_of<double>(3, 4.5));   // explicit: no conflict
// generic fixed-point pointer 4.5""",
  "deck": "Deck U4 · slide 7"},
 {"title": "Packs, folds and the overload{} visitor",
  "text": "typename... binds any number of types; a C++17 fold collapses the pack over an operator in one line — no recursion, no base case — and sizeof... is its length as a compile-time constant. A pack of base classes is just as legal: overload inherits from every lambda you hand it and pulls all their call operators into one overload set, which is Session 3's variant visitor in two lines. Delete one lambda and std::visit refuses to compile because the visitor is no longer exhaustive — the missing message type is a build error, not a production surprise.",
  "code": """template <class... Ts> constexpr auto sum(Ts... xs) { return (xs + ...); }
template <class... Fs> struct overload : Fs... { using Fs::operator()...; };
struct Book { double mid; };  struct Fill { int qty; };
using Msg = std::variant<Book, Fill>;
const char* route(const Msg& m) {
  return std::visit(overload{[](const Book&) { return "book"; },
                             [](const Fill&) { return "fill"; }}, m); }
static_assert(sum(1, 2, 3, 4) == 10);            // the compiler did the addition
std::printf("%s %s %.2f\\n", route(Book{100.01}), route(Fill{5}), sum(0.5, 0.25));
// book fill 0.75""",
  "deck": "Deck U4 · slides 9–10"},
 {"title": "Traits, concepts and if constexpr",
  "text": "A type trait is a question the compiler answers about T — is_integral_v, is_trivially_copyable_v, your own is_wire_msg — and the answer costs nothing at run time. A C++20 concept names a requirement and replaces the SFINAE trick of making a signature fail to substitute: the error moves to the call site and says which requirement was not met. if constexpr then gives one template a separate path per type: the untaken arm is discarded, never instantiated, so an arm that would be ill-formed for the other types is fine, and a final static_assert turns a forgotten type into a build error.",
  "code": """template <class T> concept Arithmetic = std::is_arithmetic_v<T>;
template <Arithmetic T> std::size_t wire_size(T) {
  if constexpr (std::is_same_v<T, bool>)       return 1;   // bool first: it is integral
  else if constexpr (std::is_integral_v<T>)    return sizeof(T);
  else                                         return 8;   // price as int64 ticks
}
struct Fill { int qty; };
std::printf("%zu %zu %zu %d\\n", wire_size(true), wire_size(42), wire_size(100.25),
            (int)std::is_trivially_copyable_v<Fill>);   // wire_size("x"): not Arithmetic
// 1 4 8 1""",
  "deck": "Deck U4 · slides 11–13"},
 {"title": "constexpr, consteval and static_assert",
  "text": "Let the compiler compute whatever does not depend on the market. A constexpr function can run at compile time and is an ordinary function when its inputs are not constant; consteval must run at compile time, so calling it with a runtime value is a build error. A tick table built that way ships as read-only data — no startup code, one load per lookup — and static_assert is where every assumption lives (fee rates, table values, sizeof(Level) == 16 so four levels share a cache line) so that a violation fails the build rather than the market.",
  "code": """consteval std::int64_t bps(double r) { return std::int64_t(r * 10'000 + 0.5); }
struct TickTable { std::array<std::int64_t, 256> px{};
  constexpr TickTable() { for (int i = 0; i < 256; ++i) px[i] = 1'000'000 + i * 100; } };
constexpr TickTable kTicks{};                    // built BY THE COMPILER
struct Level { std::int64_t px; std::int32_t qty, orders; };
static_assert(kTicks.px[50] == 1'005'000 && sizeof(Level) == 16);
constexpr auto taker = bps(0.0015), maker = bps(0.0010);
std::printf("%lld %lld %lld\\n", (long long)taker, (long long)maker, (long long)kTicks.px[50]);
// 15 10 1005000""",
  "deck": "Deck U4 · slide 15"},
 {"title": "CRTP: the override hook without the vtable",
  "text": "The Curiously Recurring Template Pattern templates a base on the class that derives from it, so the base can static_cast down and call the derived hook: the target is known from the type, the body inlines, and there is no vptr and no indirect branch. It keeps Session 3's design — shared logic in the base, the strategy fills in one hook — and in dispatch_bench the CRTP row lands on the direct-call row (0.23 ns against 0.22 ns on the deck's M4) instead of the virtual row (0.70 ns, 4.32 ns on a mixed stream). The price: Strategy<Momentum> and Strategy<MeanRevert> share no base type, so a set chosen at run time needs a variant or grouping by type at the edge.",
  "code": """struct Book { double obi; };
template <class D> struct Strategy {                    // no virtual anywhere
  double signal(const Book& b) const { return static_cast<const D*>(this)->signal_impl(b); }
  int side(const Book& b) const { double s = signal(b); return s > 0.1 ? 1 : s < -0.1 ? -1 : 0; }
};
struct Momentum : Strategy<Momentum> {
  double signal_impl(const Book& b) const { return 0.5 * b.obi; } };
template <class S> int decide(const Strategy<S>& s, const Book& b) { return s.side(b); }
Momentum m;
std::printf("%d %d %zu\\n", decide(m, Book{0.6}), decide(m, Book{-0.1}), sizeof(Momentum));
// 1 0 1""",
  "deck": "Deck U4 · slides 16–17"},
 {"title": "Policy-based design: behaviour as template parameters",
  "text": "Compose a class from small policy types, one decision each, and changing a policy is changing a type: the compiler generates a fresh, fully inlined class instead of a flag you test every tick. The arithmetic here is worth doing once: at $100 a 15 bps taker fee is $0.15 a share against the $0.01 half-spread you are chasing, while posting earns the 10 bps rebate — the fee policy is worth more than most signals, and a static_assert can prove at build time that posting beats crossing. Anything an operator must change without a rebuild (risk limits, kill switches) is never a policy.",
  "code": """struct TakerFees { static constexpr double rate = +0.0015; };
struct MakerFees { static constexpr double rate = -0.0010; };
struct NoSkew  { static constexpr double skew(int) { return 0.0; } };
template <class Fee, class Skew> struct Quoter {
  static constexpr double edge(double half, double px, int pos)
  { return half - Fee::rate * px + Skew::skew(pos); } };
using Aggressive = Quoter<TakerFees, NoSkew>;  using Passive = Quoter<MakerFees, NoSkew>;
static_assert(Passive::edge(0.01, 100.0, 0) > Aggressive::edge(0.01, 100.0, 0));
std::printf("%+.4f %+.4f\\n", Aggressive::edge(0.01, 100.0, 0), Passive::edge(0.01, 100.0, 0));
// -0.1400 +0.1100""",
  "deck": "Deck U4 · slide 18"}
],
"hft": {
 "text": "Why this matters in HFT",
 "paragraphs": [
  "Inside on_book the set of types is closed. You ship two or three strategies and a handful of message types, not a plugin system, so every runtime question about a type the programmer already knew — a virtual call, a variant visit, a std::function — is a cost you chose to pay. Session 3 measured those rows; Session 4 moves the decision into the compiler, where it costs nothing per tick.",
  "The benchmark understates the win. In dispatch_bench the body is one multiply, so CRTP saves about half a nanosecond per call. In a real on_book the win is what inlining unlocks: the compiler folds your constants, keeps the book in registers and drops checks it can prove dead — and none of that survives an indirect call. The HFT rule is short: if the type set is closed and known, template it; keep virtual for the genuinely open set at the client boundary.",
  "Compile time is also where correctness goes. A static_assert on a struct size, a fee rate or a tick table turns an assumption into a build failure; a concept rejects the wrong type with one readable line; std::is_trivially_copyable_v<Msg> is the licence to memcpy a message into a ring or onto the wire, which is exactly what Sessions 7 and 8 do. The market never gets to find those bugs for you.",
  "The outbound path is the practical target. The stock client builds every order as a JSON object and dumps it to a std::string — dozens of heap allocations per send. A variadic, if-constexpr encoder that folds over the fields and writes numbers with std::to_chars into a reused buffer does the same job with none (measured in the lab: about 56 ns and 0 allocations against about 1.3 µs and 41 allocations for the JSON library). Phase 1 is due the night of Session 5 (Oct 26), so you submit what works and carry the encoder into Project Phase 2 as the outbound half of a no-allocation hot path; Session 3's variant router is the inbound half.",
  "Templates come back immediately. Session 5's typed pool is ObjectPool<T, N> and its book is sized at compile time with static_assert on its layout; Session 6's SPSC ring is a Ring<T, N> with the power-of-two mask you wrote tonight. What you pay for them is code size and compile time, so instantiate for the types you actually ship. Templates and CRTP are on the Oct 26 midterm, which covers Sessions 1–4."
 ],
 "example": {
  "title": "In the arena",
  "code": """// hft/cpp_client/src/arena_client.cpp — the send path the encoder replaces
void ArenaClient::place_limit(const std::string& symbol, const std::string& side,
                              int quantity, double price) {
    // Mirrors shared.messages.PlaceOrder (order_type="limit"). stop_price is
    // optional in the schema, so we omit it for wire compatibility.
    json o = {
        {"type",       "place_order"},
        {"team_id",    cfg_.team_id},
        {"symbol",     symbol},
        {"side",       side},
        {"order_type", "limit"},
        {"price",      price},
        {"quantity",   quantity},
    };
    send_raw(o.dump());
}""",
  "text": "hft/cpp_client/src/arena_client.cpp — every limit order your bot sends is built here as a JSON object and dumped to a fresh std::string. Step 8 of the Session 4 lab writes the same bytes with a variadic encoder, if constexpr per field type and std::to_chars into a reused buffer, and a counting operator new prints allocations: 0; wiring it into this function is work you carry into Project Phase 2."
 }
},
"interview": [
 {"q": "Why must a template's definition usually live in a header?",
  "a": "Because a template is not code until it is instantiated, and the compiler can only instantiate it where it can see the definition. With the body in a separate .cpp, each translation unit that uses it emits a call to a function nobody generated, and you get a link error. The alternatives are to keep the definition in the header (the normal choice) or to explicitly instantiate the specific types you need in one .cpp — which is also a way to contain code bloat.",
  "level": "warm-up", "skill": "cpp.templates"},
 {"q": "What is the difference between constexpr and consteval, and what does static_assert add?",
  "a": "constexpr says a function or variable can be evaluated during compilation when its inputs are constant expressions, and it remains an ordinary function when they are not — so a constexpr function called with a runtime argument gives you no compile-time guarantee at all. consteval makes it an immediate function that must be evaluated at compile time; calling it with a runtime value is a hard error, so no runtime path exists. static_assert is the third leg: it checks a compile-time predicate and turns a violated assumption — a tick grid, a struct size, a fee rate — into a failed build.",
  "level": "warm-up", "skill": "cpp.constexpr"},
 {"q": "What is the difference between if and if constexpr, and why can't a plain if do the job inside a template?",
  "a": "A plain if is a run-time test: both branches are compiled for every instantiation and the CPU evaluates the condition. if constexpr is evaluated during compilation and the untaken branch is discarded — never instantiated — so it only has to parse, not to be valid for that T. That is why one template can memcpy an integer, scale a double into ticks and reject a pointer: with a plain if, v * 100.0 would have to compile for the pointer too. It costs nothing at run time, and a final else with static_assert turns an unsupported type into a build error.",
  "level": "core", "skill": "cpp.type-traits-constraints"},
 {"q": "What does SFINAE mean, and what do C++20 concepts improve on it?",
  "a": "Substitution Failure Is Not An Error: when substituting template arguments into a signature produces something ill-formed, that candidate is silently removed from overload resolution rather than failing the build — so enable_if_t<is_arithmetic_v<T>, int> = 0 makes a function disappear for non-arithmetic types. It works, but the intent is buried in the signature and a misuse produces a wall of notes. A concept names the requirement — template <Arithmetic T> — or states it as a requires-expression ('s.signal(m) must compile and convert to double'), and the error says exactly which requirement failed at the call site. It also checks shape, not inheritance: any type with the right members qualifies, with no base class and no vtable.",
  "level": "core", "skill": "cpp.type-traits-constraints"},
 {"q": "Explain the overload{} idiom line by line.",
  "a": "template <class... Fs> struct overload : Fs... { using Fs::operator()...; }; — the struct inherits from every lambda type in the pack (variadic inheritance), and the using-declaration pack expansion brings every lambda's call operator into one overload set, so overload resolution picks the lambda whose parameter matches. A deduction guide (implicit for aggregates in C++20) lets you write overload{...} without naming lambda types. Passed to std::visit over a variant, it is a visitor built inline, and because std::visit requires the visitor to handle every alternative, removing a lambda is a compile error — exhaustiveness checked by the build.",
  "level": "core", "skill": "cpp.variadic-templates"},
 {"q": "Compare CRTP with virtual dispatch. When would you still choose virtual?",
  "a": "CRTP binds the call at compile time — the base static_casts to its derived type — so it inlines completely, adds no vptr and no indirect branch; in the lab's dispatch_bench the CRTP row matches the direct-call row, not the virtual row. A virtual call is a load of the vptr, a load of the slot and an indirect branch, but the real bill is the inlining barrier. The catch with CRTP is that the concrete type must be known at compile time and the instantiations share no base, so I still use virtual where the type set is genuinely open or flexibility is worth more than nanoseconds — configuration, logging, the client boundary — never in the tick-to-trade body.",
  "level": "core", "skill": "cpp.crtp-policies"},
 {"q": "How would you prove that a \"zero-overhead\" template abstraction really is zero overhead compared with the virtual version?",
  "a": "Two ways, both empirical. Read the generated code: build both at -O2 and compare the disassembly of the hot function — the virtual version shows the vptr load, the slot load and an indirect branch (br x2 on arm64), the CRTP version shows the inlined body and nothing else. Then confirm behaviourally on a fixed input: the same dispatch_bench or the same recorded tape, comparing p50 and p99.9, because an inlining failure shows up as a tail change long before it shows up in a mean. Claiming zero overhead from the language rules alone is how people ship an accidental indirect call.",
  "level": "senior", "skill": "perf.virtual-cost"},
 {"q": "Templates are \"zero-cost\". When can they make a latency-critical binary slower?",
  "a": "When instantiations multiply. Each distinct set of arguments is separate machine code, so templating a fat function over every integer width, every container and every policy combination grows the binary and can push the hot path out of the instruction cache — the program becomes front-end bound, which shows up in counters as i-cache and iTLB misses rather than in the source. Deep inlining can have the same effect. The remedies are to instantiate only the types you ship, keep the templated layer thin over a non-template core, explicitly instantiate in one translation unit, and measure the tail rather than assume the abstraction is free.",
  "level": "senior", "skill": "cpp.templates"}
]
}
