# -*- coding: utf-8 -*-
"""Session 3 focus — OOP II: polymorphism & smart pointers (deck U3, labs/session03.md,
speaker guide session3_talking_points.md).

Every `code` snippet is compiled and run by tools/validate_focus.py.
"""

FILE_SCOPE = {"v_s3_c6": 1}   # "v_s3_cK": number of leading lines that go at file scope

S = {
"n": 3,
"focus": "Polymorphism & smart pointers",
"tagline": "Know exactly what a virtual call and a smart pointer cost — in nanoseconds, measured — and put both where they belong: at the edges, never inside tick-to-trade.",
"concepts": [
 {"title": "Virtual functions: the object decides",
  "text": "Mark a member function virtual in the base, override it in the derived class, and a call through a Base& or Base* runs the derived body: the call is late-bound, so the object decides, not the static type of the reference. override asks the compiler to check that you really are overriding something — a missing const or a wrong parameter type becomes a compile error instead of a silent new function — and final forbids further overriding, which also lets the optimiser devirtualise. Almost everything else is still static: a default argument comes from the static type (Base's default, Derived's body), and overriding one overload hides the others until you write using Base::name. Rule: override on every override, and never give a virtual a default argument.",
  "code": r'''struct Venue {
  virtual double fee(double n) const { return 0.0015 * n; }  // taker fee
  virtual ~Venue() = default;
};
struct Maker final : Venue {                                  // final: no further
  double fee(double n) const override { return -0.0010 * n; } // a rebate
};
void charge(const Venue& v) { std::cout << v.fee(1000.0) << ' '; }  // ONE function
int main() { Venue v; Maker m; charge(v); charge(m); std::cout << '\n'; }
// 1.5 -1     -- one call site, two bodies''',
  "deck": "Deck U3 · slides 5–6"},
 {"title": "Virtual destructors and abstract interfaces",
  "text": "A base you delete through needs a virtual destructor, or the delete is undefined behaviour: delete p on a Base* whose destructor is not virtual runs only ~Base, so the derived part — its vector, its buffer — is never released (the deck's measurement leaks the whole 800 KB vector, and it still builds and runs). The rule is mechanical: a class with any virtual function gets a virtual destructor, which costs one more table entry, not one more byte per object. = 0 makes a function pure and the class abstract — it cannot be instantiated — so an interface is pure virtuals plus a virtual destructor and no state. The arena client is exactly this design: ArenaClient → HFTBot → your bot, a non-virtual run() that owns the control flow and virtual hooks you override.",
  "code": r'''struct IStrategy {                                          // an interface: no state
  virtual double signal(double mid, double obi) const = 0;  // pure: a contract
  virtual ~IStrategy() { std::printf("~IStrategy "); }      // deleted via the base
};
struct Momentum final : IStrategy {
  double signal(double, double obi) const override { return 0.5 * obi; }
  ~Momentum() override { std::printf("~Momentum "); }
};
int main() { std::unique_ptr<IStrategy> s = std::make_unique<Momentum>();
  std::printf("%+.2f ", s->signal(100.0, 0.4));
}   // s dies here: through the base, and BOTH destructors run
// +0.20 ~Momentum ~IStrategy''',
  "deck": "Deck U3 · slides 7–8"},
 {"title": "How it works: the vptr and the vtable",
  "text": "A polymorphic object carries one hidden pointer, the vptr, to a read-only per-class table of function addresses, so sizeof grows by eight the moment the first virtual appears. A virtual call is two dependent loads — the vptr out of the object, then the slot out of the table — and an indirect branch to whatever address came back. On a final type or an exact known type the compiler can prove the target, call it directly and inline it. The vptr is rewritten as each constructor layer runs, so a virtual call made inside Base's constructor (or destructor) never reaches the derived override; and dynamic_cast is a hierarchy walk measured at around 20 ns against about 1.5 ns for the virtual call on the same objects.",
  "code": r'''struct P { int a; };  struct V { int a; virtual ~V() = default; };
struct Base {
  Base() { hello(); }                   // vptr still points at Base's table
  virtual void hello() const { std::printf("Base "); }
  virtual ~Base() = default;
};
struct Derived : Base { void hello() const override { std::printf("Derived "); } };
int main() {
  Derived d; d.hello();
  std::printf("%zu %zu\n", sizeof(P), sizeof(V));
}
// Base Derived 4 16   -- 8-byte vptr + 4-byte int + 4 bytes padding''',
  "deck": "Deck U3 · slides 10–11"},
 {"title": "What a virtual call costs — measured",
  "text": "The lab's dispatch_bench runs the same one-instruction body through six dispatch mechanisms over 4,096 objects, in three orders. On the deck's machine a predicted virtual call is about 0.8 ns against 0.24 ns for a direct, inlined call on a final type; over four types in random order it is about 4.8 ns — roughly 20 cycles of mispredicted indirect branch, every time the target changes — and sorting the same objects by type brings it straight back to 0.8 ns. std::variant, a function pointer and std::function land in the same place, because over random types they are the same indirect jump. So “virtual is slow” and “virtual is free” are both wrong: it is about a nanosecond when predictable, about five when not, and an optimisation barrier always — and the inlining you lose shows up in your own code, not in this micro-benchmark.",
  "deck": "Deck U3 · slides 12–14"},
 {"title": "A closed set: std::variant + std::visit",
  "text": "Dynamic dispatch answers one question — how do I call code I do not know yet? — so it belongs to an open type set, like the client calling a bot it has never seen. The messages off the wire are a closed set, known at build time: store them by value in a std::variant (the largest alternative plus a tag, no heap), and let std::visit generate the dispatch. The compiler checks the visitor handles every alternative, so adding a message type and forgetting its handler breaks the build rather than the session, and every handler is an ordinary function it can inline. Project Phase 1 asks for exactly this on your inbound path; Session 4 adds the one-line overload{} helper.",
  "code": r'''struct BookUpdate { double mid, obi; };
struct Fill { double px; int qty; };  struct Cancel { unsigned long id; };
using Msg = std::variant<BookUpdate, Fill, Cancel>;     // by value, no heap
struct Router {                                          // one overload per type
  int pos = 0;
  void operator()(const BookUpdate&) {}
  void operator()(const Fill& f) { pos += f.qty; }
  void operator()(const Cancel&) {}                       // delete it: build fails
};
int main() { Router r; Msg m = Fill{100.02, 5}; std::visit(r, m);
             std::cout << r.pos << ' ' << sizeof(Msg) << '\n'; }
// 5 24''',
  "deck": "Deck U3 · slides 14–15"},
 {"title": "unique_ptr by default, shared_ptr at a price",
  "text": "unique_ptr is sole ownership in the type system: move-only, the same size as a raw pointer, and its dereference is the same load (0.23 ns for both in the lab). make_unique forwards constructor arguments so the object is built once, in place, and a moved-from unique_ptr is guaranteed null. shared_ptr keeps the object alive until the last owner lets go: two pointers per handle, a separate control block (make_shared saves one of the two allocations), and a strong count that is atomic. Its tax is the copy, not the dereference — a copy plus destroy is about 3.2 ns on one core and tens of nanoseconds when threads fight over one control block — so pass the object by const& and never copy a shared_ptr inside on_book. weak_ptr observes without owning, which is how you break the cycle two shared_ptrs make.",
  "code": r'''struct Quote { double px; int qty; Quote(double p, int q) : px(p), qty(q) {} };
auto u  = std::make_unique<Quote>(100.25, 5);       // built once, in place
auto u2 = std::move(u);                             // ownership moves; u is null
auto s1 = std::make_shared<Quote>(100.00, 5);       // ONE allocation
{ auto c = s1; std::printf("%ld ", s1.use_count()); }   // atomic ++ then --
std::weak_ptr<Quote> w = s1;                        // observes, does not own
std::printf("%ld %d %zu %zu ", s1.use_count(), u == nullptr, sizeof(u2), sizeof(s1));
s1.reset();                                         // last owner lets go
std::printf("%s\n", w.lock() ? "alive" : "gone");
// 2 1 1 8 16 gone''',
  "deck": "Deck U3 · slides 18–22"},
 {"title": "Custom deleters, and ownership as an API contract",
  "text": "unique_ptr<T, D> calls D instead of delete, so it is RAII for anything with a close — a FILE*, a socket, an mmap'd region, a pool slot that goes back to its pool in Session 5 — and a stateless deleter keeps the handle at 8 bytes (a function-pointer deleter doubles it). The signature is the ownership documentation: a by-value unique_ptr parameter is a sink and forces std::move at the call site, a const T& borrows, a by-value shared_ptr is only for a callee that really extends the lifetime, and a function returning unique_ptr is a source. The session's bot puts it together: the signal is chosen and built once in the constructor, owned by a unique_ptr, and on_book only ever borrows it — one predictable virtual call per tick, no allocation.",
  "code": r'''struct FileCloser { void operator()(std::FILE* f) const { if (f) std::fclose(f); } };
using File = std::unique_ptr<std::FILE, FileCloser>;            // stateless: 8 bytes
struct ISignal { virtual ~ISignal() = default; virtual double value(double) const = 0; };
struct Obi final : ISignal { double value(double obi) const override { return 0.5 * obi; } };
struct Engine {
  std::vector<std::unique_ptr<ISignal>> sigs;
  void add(std::unique_ptr<ISignal> s) { sigs.push_back(std::move(s)); }     // sink
  double run(const ISignal& s, double obi) const { return s.value(obi); }  // borrow
};
int main() { File f(std::fopen("/dev/null", "w")); Engine e; auto m = std::make_unique<Obi>();
  e.add(std::move(m)); std::printf("%zu %zu %d %+.1f\n", sizeof(File), e.sigs.size(), m == nullptr, e.run(*e.sigs[0], 0.4)); }
// 8 1 1 +0.2''',
  "deck": "Deck U3 · slides 23, 25–26"}
],
"hft": {
 "text": "Session 3 prices every runtime decision about a type — the virtual call and the smart pointer — so you can keep them at the edges of the bot and out of tick-to-trade.",
 "paragraphs": [
  "You have been writing a polymorphic class since Session 1. The arena client is a three-level hierarchy: ArenaClient owns the socket and the JSON and declares one virtual handler per event, HFTBot stamps latency and bridges the book snapshot into your on_book hook, and your bot overrides the hooks. run() is deliberately not virtual — the non-virtual interface pattern: the base owns the control flow, you own the hooks. That is virtual doing the one job it is uniquely good at, because the client must call a bot it has never seen.",
  "The price of that boundary is two virtual calls per tick, on the order of a nanosecond and a half, against tick-to-order stamps measured in microseconds. It is not your problem. Your problem is what you do inside on_book, and the rule the whole session builds toward is that inside on_book the type set is closed: you know every strategy and every message type at build time, so every virtual call, dynamic_cast or std::function you leave in there is a runtime decision about something you already knew.",
  "The dispatch table is the argument, in numbers. Predicted, a virtual call is cheap; mispredicted, it is six times the cost, and a hot loop over mixed strategy objects in random order is exactly the mispredicting shape. Batch work by type and it is cheap again. The larger cost never shows up in the micro-benchmark: an indirect call is an inlining barrier, so constant folding, register allocation and vectorisation stop at it. That is why Session 4 takes the same “override a hook” design and moves the decision to compile time with CRTP.",
  "Ownership follows the same shape. Build everything polymorphic once, at startup — a factory that names the concrete types, a unique_ptr that owns the result, a constructor that throws on a bad configuration before the socket opens — and let the hot path borrow through a reference. A by-value shared_ptr parameter pays an atomic increment and decrement per call, and from several threads the control block's cache line ping-pongs between cores; that is the tail you meet properly in Session 6.",
  "Then count. The lab's tick_alloc header counts heap allocations while on_book runs: the stock bot does ten in two thousand ticks in its own code, all first-tick unordered_map inserts, and about 48 per order inside the send path, where the order is built as JSON and the latency is logged. Every one of those is a malloc that is usually fast and occasionally not. Project Phase 1 asks for zero in steady state, variant dispatch on the inbound path, and before/after percentiles against your Phase 0 baseline."
 ],
 "example": {
  "title": "In the arena",
  "code": r'''// hft/cpp_client/include/hft_bot.hpp
class HFTBot : public ArenaClient {
public:
    explicit HFTBot(ClientConfig cfg) : ArenaClient(std::move(cfg)) {}

    // Non-virtual entry point: connect and run forever (reconnecting on drop).
    // Do not override — override the hooks below instead.
    void run() { ArenaClient::run(); }

protected:
    virtual void on_book(const std::string& symbol, double bid, double ask,
                         double mid, double microprice, double obi) {
        (void)symbol; (void)bid; (void)ask; (void)mid; (void)microprice; (void)obi;
    }''',
  "text": "hft/cpp_client/include/hft_bot.hpp — the non-virtual interface in the client you already use: run() is not virtual, so the base owns the control flow; on_book (and on_fill, on_ack, on_queue) are the virtual hooks your bot overrides. hft/cpp_client/include/arena_client.hpp is the level above, with a virtual destructor and one virtual handler per protocol event."
 }
},
"interview": [
 {"q": "What does the virtual keyword change about a call, and what does override add?",
  "a": "virtual makes the call late-bound: through a Base& or Base*, the dynamic type of the object picks which body runs, instead of the static type of the reference. override does not make anything virtual — it asks the compiler to check that this function really overrides a virtual in a base, so a signature typo (a missing const, a different parameter type) is a compile error instead of a silently new, never-called function. final additionally forbids further overriding, which lets the optimiser devirtualise the call.",
  "level": "warm-up", "skill": "cpp.virtual-dispatch"},
 {"q": "Which smart pointer do you reach for first, and why?",
  "a": "unique_ptr. It encodes “exactly one owner” in the type — it is move-only, so the compiler refuses an accidental copy — it is the same size as a raw pointer, its dereference is the same load, and it deletes on every exit path. shared_ptr is for lifetimes that are genuinely shared and unknowable, and it costs a control block and an atomic reference count on every copy. “I don't know who owns this” is a design bug that shared_ptr hides rather than fixes.",
  "level": "warm-up", "skill": "cpp.smart-pointers"},
 {"q": "Why does a base class with virtual functions need a virtual destructor?",
  "a": "Because deleting a derived object through a pointer to a base whose destructor is not virtual is undefined behaviour: in practice only ~Base runs, so the derived part's members are never destroyed and whatever they own leaks — the deck's version leaks a whole vector, and it compiles, runs and “works”. With a virtual destructor, delete dispatches through the vtable to ~Derived, which then runs ~Base. It is not an overhead you save by leaving it out: the class already has a vptr, and the destructor is one more table entry. unique_ptr<Base> deletes through the base, so it needs this too.",
  "level": "core", "skill": "cpp.virtual-dispatch"},
 {"q": "What does this print, and why?\n```\nstruct Base { virtual int depth(int n = 5) const { return n; }\n              virtual ~Base() = default; };\nstruct Bot final : Base { int depth(int n = 10) const override { return 100 * n; } };\nBot b; const Base& r = b;\nstd::cout << r.depth() << ' ' << b.depth();\n```",
  "a": "500 1000. Dispatch picks the body at run time — r refers to a Bot, so Bot::depth runs — but default arguments are substituted at compile time from the static type of the expression. r.depth() is therefore Bot's body with Base's default, 100 × 5 = 500, while b.depth() uses Bot's own default, 100 × 10 = 1000. Two different moments, one line of code — which is why the rule is never to give a virtual function a default argument.",
  "level": "core", "skill": "cpp.virtual-dispatch"},
 {"q": "Precisely what does a virtual call cost, and when does it actually hurt?",
  "a": "Mechanically: load the vptr out of the object, load the slot out of the vtable, then an indirect branch whose target is unknown until the loads return. When one target dominates, the predictor learns it and the call costs a fraction of a nanosecond more than a direct one; when several targets alternate at random — mixed strategy objects in one loop — every change is a mispredict of roughly 15–20 cycles, about six times the predicted cost in the lab's table, and sorting the objects by type recovers it. The bigger cost is indirect: the compiler cannot inline through the call, so constant folding, register allocation and vectorisation stop there. final, or an exact known type, lets it devirtualise.",
  "level": "core", "skill": "perf.virtual-cost"},
 {"q": "Why is copying a shared_ptr on the hot path a problem when dereferencing one is not?",
  "a": "Dereferencing a shared_ptr is a plain load, the same as a raw pointer. Copying one is an atomic increment of the strong count, and destroying the copy is an atomic decrement — a read-modify-write that costs several nanoseconds on one core, and far more when several threads copy the same shared_ptr, because the control block's cache line ping-pongs between cores. A by-value shared_ptr parameter pays that twice per call. So pass the object itself by const& (or the shared_ptr by const& if the callee might keep it), and never copy one inside on_book.",
  "level": "core", "skill": "cpp.smart-pointers"},
 {"q": "The inbound wire carries five message types, all known at build time. Virtual hierarchy, std::variant, or a switch — and how do you prove the choice?",
  "a": "It is a closed set, so not a virtual hierarchy: that would mean a heap object per message and an open-set mechanism for a closed-set problem. Turn the tag into a type once at the parse boundary — a switch on the discriminator — then carry a std::variant by value and dispatch with std::visit: no allocation, the compiler proves every alternative is handled, and each handler can inline. Over random message types a visit is still an indirect jump, so it is not magically faster than a virtual call in a micro-benchmark; the wins are value semantics, exhaustiveness and inlining. Proof is empirical: read the disassembly of the hot function, and compare p50 and p99.9 on the same recorded tape.",
  "level": "senior", "skill": "cpp.variant-visit"},
 {"q": "Your bot chooses its signal from configuration. Design the ownership so that nothing on the hot path allocates or can dangle.",
  "a": "A factory maps the configuration name to a concrete type and returns std::unique_ptr<ISignal>, returning null for an unknown name; the bot's constructor calls it once and throws if it got null, so a bad configuration fails before the socket opens rather than mid-session. The bot holds the unique_ptr as a member — ISignal has a virtual destructor because it is deleted through the base — and on_book borrows it: signal_->value(...) is one virtual call with the same target every tick, so it predicts perfectly, and nothing is allocated. Any resource with a close gets a unique_ptr with a stateless custom deleter, signatures say sink / borrow / source explicitly, and tick_alloc over the replay tape proves zero steady-state allocations. The next step, when the set is closed at build time, is to make the signal a template parameter so even that one call disappears.",
  "level": "senior", "skill": "cpp.ownership-contracts"}
]
}
