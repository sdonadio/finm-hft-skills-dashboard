window.FOCUS = {
  "meta": {
    "link_title": "Why this matters in HFT",
    "interview_title": "Interview questions"
  },
  "sessions": [
    {
      "n": 1,
      "focus": "Market microstructure & the limit order book",
      "tagline": "Learn the game before you optimise it: two sorted sides, a FIFO queue at every price, and one number that grades you — p99.9 tick-to-trade.",
      "concepts": [
        {
          "title": "The CLOB is two sorted sides",
          "text": "Every modern venue runs one matching engine over a central limit order book: resting buy orders on the bid side, resting sell orders on the ask side, each side sorted by price. The best bid and the best ask are \"the touch\", the resting size at each price is the depth, and a snapshot of exactly that is what your on_book hook is handed every tick.",
          "code": "struct Lvl { double px; int qty; };\nLvl bids[] = {{100.02, 500}, {100.01, 800}, {100.00, 200}};   // best first\nLvl asks[] = {{100.04, 300}, {100.05, 900}, {100.06, 400}};   // best first\nstd::printf(\"touch %.2f x %d / %.2f x %d spread=%.2f bid_depth=%d\\n\",\n            bids[0].px, bids[0].qty, asks[0].px, asks[0].qty,\n            asks[0].px - bids[0].px,\n            bids[0].qty + bids[1].qty + bids[2].qty);\n// touch 100.02 x 500 / 100.04 x 300 spread=0.02 bid_depth=1500",
          "deck": "Deck U1 · slide 10"
        },
        {
          "title": "Mid, spread, microprice and OBI",
          "text": "Four numbers summarise a book and all four are one line of arithmetic. The mid is the average of the touch; the spread is what it costs to cross; the microprice weights each side's price by the *other* side's size, so it leans toward the side that is about to win; the order-book imbalance is a signed number in [-1, +1] that is positive when the bids are heavy. Your on_book hook is handed the last two already computed — HW 1 is proving you can compute them yourself.",
          "code": "double bp = 100.02, ba = 100.04; int bq = 500, aq = 300;   // the slide's touch\ndouble mid = (bp + ba) / 2, spread = ba - bp;\ndouble micro = (ba * bq + bp * aq) / (bq + aq);  // weighted by the OTHER side\ndouble obi   = double(bq - aq) / (bq + aq);\nstd::printf(\"%.4f %.4f %.4f %+.2f\\n\", mid, spread, micro, obi);\n// 100.0300 0.0200 100.0325 +0.25   -- bid-heavy, so the microprice sits above the mid",
          "deck": "Deck U1 · slide 10"
        },
        {
          "title": "Price first, then time",
          "text": "A more aggressive price always executes ahead of a worse one; at the same price, the order that arrived earlier fills first — a strict FIFO queue per level. That second rule is why speed is money: sitting near the front of the queue means you fill before the price moves, and a cancel-and-repost throws all of that accumulated time priority away and restarts you at the tail. Queue position, not cleverness, is what latency actually buys.",
          "deck": "Deck U1 · slide 11"
        },
        {
          "title": "A trade prints at the RESTING order's price",
          "text": "A limit order joins the queue and waits; a market order crosses immediately and never rests, so any unfilled remainder is cancelled rather than queued. When the two meet, the trade executes at the price of the order that was already in the book — so an aggressive order that sweeps two levels gets a blended average price, not its own limit.",
          "code": "struct Lvl { double px; int qty; };\nLvl asks[] = {{100.04, 300}, {100.05, 900}};   // the RESTING side, from the slide\nint want = 500; double cost = 0;               // incoming BUY 500, limit 100.05\nfor (auto& l : asks) {\n  int take = std::min(want, l.qty);\n  cost += take * l.px;                        // each slice prints at the RESTING price\n  want -= take; if (!want) break;\n}\nstd::printf(\"filled=%d avg=%.4f left=%d\\n\", 500 - want, cost / 500, want);\n// filled=500 avg=100.0440 left=0   -- worse than the touch it saw when it decided",
          "deck": "Deck U1 · slide 12"
        },
        {
          "title": "Maker/taker: who pays and who gets paid",
          "text": "Under a maker/taker schedule the aggressive side pays a fee and the passive side often earns a rebate, both as a fraction of notional. The arena prints its schedule on connect — taker 30 bps, maker rebate 5 bps in the session-1 lab — and the sign of that number is a real part of a market maker's P&L, not an accounting detail: your edge is trade edge minus fees plus rebates.",
          "code": "double px = 182.50; int qty = 200;\ndouble notional = px * qty;\ndouble taker = 0.0030 * notional;   // cross the spread: you pay\ndouble maker = 0.0005 * notional;   // rest in the queue: you are paid\nstd::printf(\"%.2f -%.2f +%.2f\\n\", notional, taker, maker);\n// 36500.00 -109.50 +18.25   -- a 127.75 swing (109.50 + 18.25) on one 200-share clip",
          "deck": "Deck U1 · slide 12"
        },
        {
          "title": "Tick-to-trade, and why the grade is p99.9",
          "text": "Tick-to-trade is the time from market data hitting your socket to your order leaving it: parse, decide, serialise, send. We report p50, p99 and p99.9 and grade the last one, because the races that matter are the volatile ticks when everybody fires at once — exactly when a bad tail shows up. A 40 µs mean with a 5 ms p99.9 is a losing bot, and the mean is the one number that will never tell you so.",
          "code": "std::vector<long> ns;                                   // one sample per tick, in µs\nfor (int i = 0; i < 1000; ++i) ns.push_back(38 + i % 4); // a tight, fast body\nns[997] = 71; ns[998] = 210; ns[999] = 5200;            // and three ugly ticks\nstd::sort(ns.begin(), ns.end());\nauto pct = [&](double p) { return ns[(std::size_t)(p / 100.0 * (ns.size() - 1))]; };\ndouble mean = std::accumulate(ns.begin(), ns.end(), 0.0) / ns.size();\nstd::printf(\"mean=%.1f p50=%ld p99=%ld p99.9=%ld max=%ld\\n\",\n            mean, pct(50), pct(99), pct(99.9), ns.back());\n// mean=44.9 p50=40 p99=41 p99.9=210 max=5200   -- the mean describes no tick that happened",
          "deck": "Deck U1 · slide 13"
        }
      ],
      "hft": {
        "text": "Every session in this course shortens one path — market data in, order out — and session 1 fixes both ends of it: what the book actually is, and the p99.9 number that grades how fast you cross it.",
        "paragraphs": [
          "Everything in the next eight sessions shortens one path. A book_snapshot lands on your socket; you decode it, decide, serialise an order and put it on the wire. That is tick-to-trade, and the arena client stamps it for you: hft/cpp_client/src/arena_client.cpp records the instant a snapshot is decoded, and hft/cpp_client/include/hft_bot.hpp times every order you send from inside on_book against that stamp.",
          "The book is not a loose abstraction here — it is a data structure with a layout. Prices live on a discrete tick grid, which is why from session 6 onward you hold your local book as a flat array of one-cent slots indexed by arithmetic (slot = tick - base_tick) instead of a tree you have to search. The microstructure fact (ticks are discrete) is what licenses the performance decision (index, don't chase).",
          "Queue position is the alpha that latency actually buys. The engine keys each price level on arrival order, so your standing is a real quantity you can read rather than guess: the ack and queue-update messages carry queue_ahead and level_qty, and queue_ahead == 0 means you are at the front and about to fill. Repricing costs you that spot, which is why sessions 6 and 9 spend time on when *not* to requote.",
          "We grade the tail, not the mean, and you can measure it before you ever go live. scripts/latency_replay.py feeds a recorded tape into your bot over stdin and prints p50 / p99 / p99.9 plus a tail histogram — deterministic, same tape every run, no network noise; scripts/latency_report.py is its live counterpart and reads the LAT lines from a real session. Same instrument that ranks you on the dashboard's LATENCY tab.",
          "Some of the last microseconds are bought rather than coded. The exchange adds an outbound delay per team, and colocation in the shop moves you to a cheaper tier. That is the arena's model of the real arms race — rack space, then microwave, then kernel bypass, then FPGAs — each rung a smaller slice of latency at a steeper price. Session 1 is the on-ramp: connect, appear on the board, read your percentiles, and write the baseline number down."
        ],
        "example": {
          "title": "In the arena",
          "code": "// hft/cpp_client/src/main.cpp\nvoid on_book(const std::string& symbol, double bid, double ask, double mid,\n             double microprice, double obi) override {\n  if (bid <= 0.0 || ask <= 0.0) return;          // need a two-sided book\n  const double spread   = ask - bid;\n  const double last_mid = last_mid_.count(symbol) ? last_mid_[symbol] : mid;\n  last_mid_[symbol]     = mid;\n  if (spread < kEdge) return;                    // too tight to bother\n  if (mid > last_mid && pos < kMaxPos)       buy_limit (symbol, kClip, ask);\n  else if (mid < last_mid && pos > -kMaxPos) sell_limit(symbol, kClip, bid);\n}",
          "text": "hft/cpp_client/src/main.cpp — the SpreadCaptureBot that ships working: this on_book body is the edge you replace, and orders sent from here are the ones that get latency-stamped."
        }
      },
      "interview": [
        {
          "q": "What is the difference between a limit order and a market order?",
          "a": "A limit order carries a price and rests in the book until it is filled or cancelled — it joins the FIFO queue at that price and provides liquidity. A market order carries no price: it crosses immediately against the best available resting orders and never rests, so any unfilled remainder is cancelled rather than queued. The limit order is the maker's tool, the market order is the taker's.",
          "level": "warm-up",
          "skill": "trading.lob"
        },
        {
          "q": "A book shows 100.02 × 500 on the bid and 100.04 × 300 on the ask. Give the mid, the spread, the microprice and the order-book imbalance.",
          "a": "Mid = (100.02 + 100.04)/2 = 100.03 and spread = 0.02. The microprice weights each price by the opposite side's size: (100.04·500 + 100.02·300)/800 = 100.0325, i.e. pulled up toward the ask because the bid is heavy. OBI = (500 - 300)/(500 + 300) = +0.25, positive meaning bid-heavy. Both of the last two are signals precisely because they move before the mid does.",
          "level": "warm-up",
          "skill": "trading.lob"
        },
        {
          "q": "Two orders rest at the same price. What decides which fills first, and what happens to your priority if you move your price?",
          "a": "At equal price it is strict time priority: the order that arrived earlier fills first, and real engines key the queue on a monotonic sequence number rather than a wall-clock timestamp so ties cannot happen. Moving your price is a cancel plus a new order, so you lose all accumulated time priority and join at the back of the queue at the new level. That is why a good maker only requotes when the expected edge exceeds the queue position it is giving up.",
          "level": "core",
          "skill": "trading.price-time-priority"
        },
        {
          "q": "At what price does a trade execute when an aggressive order crosses the book?",
          "a": "At the resting order's price, not the incoming order's limit. A buy limit at 100.05 hitting an ask of 100.04 trades at 100.04, and if it sweeps several levels each slice prints at that level's price, giving a blended average. This is also why a taker's realised cost is the average fill price plus fees, not the touch it saw when it decided to cross.",
          "level": "core",
          "skill": "trading.lob"
        },
        {
          "q": "You are quoting two sides and your bids fill almost instantly, every time. Why might that be bad news?",
          "a": "Instant fills usually mean you are being adversely selected: someone with fresher information is hitting a quote you have not updated yet, so your fastest fills are systematically your worst. The diagnostic is a markout — compare the mid a second after each fill against your fill price; persistently negative markouts mean you are being picked off. The responses are to widen, to skew away from the toxic side, or to requote faster so the stale quote never exists.",
          "level": "core",
          "skill": "trading.adverse-selection"
        },
        {
          "q": "Why does the industry quote latency as p99.9 rather than as a mean?",
          "a": "Latency distributions are heavy-tailed and often bimodal: a tight fast body plus rare catastrophic stalls from allocation, page faults or preemption. The mean lands in the valley between the two and describes no tick anyone actually experienced. The races that decide P&L are the busy ticks when everyone fires at once, which is exactly when the tail fires, so the tail percentile is the number that predicts whether you win.",
          "level": "core",
          "skill": "trading.tick-to-trade"
        },
        {
          "q": "Under a maker/taker schedule, when is it rational to cross the spread and pay the taker fee instead of posting passively?",
          "a": "When the expected adverse move over your expected queue wait exceeds the round-trip cost of crossing, which is the spread you give up plus the taker fee plus the forgone maker rebate. A stale quote you can pick off, or a signal with a short half-life, is worth taking immediately; a slow mean-reversion view is worth posting. Concretely, at 30 bps taker and a 5 bps rebate, a fill worth 3 bps of edge can only ever be profitable passively.",
          "level": "senior",
          "skill": "trading.fees-maker-taker"
        },
        {
          "q": "Your bot reports a 40 µs mean and a 5 ms p99.9. Where do you look first, and what do you measure?",
          "a": "A three-orders-of-magnitude gap is a stall, not slow arithmetic, so I look for things that are usually free and occasionally enormous: a heap allocation on the hot path, a first-touch page fault, a contended lock, or the scheduler preempting the hot thread. First I reproduce it deterministically on a recorded tape so network noise cannot hide it, then I profile that run and check hardware counters and fault counts rather than guessing. The fix is judged only by whether p99.9 moves on the same tape.",
          "level": "senior",
          "skill": "perf.tail-diagnosis"
        }
      ]
    },
    {
      "n": 2,
      "focus": "Pointers, memory & object-oriented C++ I",
      "tagline": "Microseconds hide in where a value lives, how you pass it and who frees it — then you write the types that make those bugs impossible to write.",
      "concepts": [
        {
          "title": "Where memory lives: the hierarchy, stack vs heap, storage duration",
          "text": "The CPU is fast and memory is far: a register is effectively free, an L1 hit is about a nanosecond, and a miss out to DRAM is about a hundred — one miss costs what a hundred L1 hits cost, so a 10 µs budget is roughly a hundred misses. The stack is a bump pointer whose top is almost always hot in L1 (about 0.3 ns in the lab); the heap is a call into a general-purpose allocator (about 12 ns, and occasionally far worse). Every variable also has a storage duration — static for the whole run, automatic for one frame, dynamic until delete, thread_local per thread — decided by how it was created, not by where the braces are. Measure all of it honestly: -O2, warm up, sink the result so the optimiser cannot delete the work, and report p50 / p99 / p99.9 rather than one mean.",
          "code": "auto on_tick = [] {\n  static int calls = 0;       // STATIC: lives for the whole run, despite the braces\n  int local = 0;              // AUTOMATIC: reborn in every frame\n  return ++calls * 10 + ++local;\n};\nint a = on_tick(), b = on_tick(), c = on_tick();\nstd::printf(\"%d %d %d\\n\", a, b, c);\n// 11 21 31   -- the static survives every call; the automatic starts at 0 each time",
          "deck": "Deck U2 · slides 5–7, 32–34"
        },
        {
          "title": "Pointers, references and the cost of a copy",
          "text": "A pointer is just an address — 8 bytes on a 64-bit machine whatever it points at: & makes one, * follows it, nullptr means nowhere, and dereferencing nullptr is undefined behaviour. A reference is an alias fixed at birth: never null, never reseated; both compile to the same machine code, so pick a pointer only when 'absent' is a legal answer. Read const right to left, and remember that arithmetic counts elements, not bytes: p + 1 advances sizeof(*p), and a C array decays to a pointer and loses its length the moment you pass it. The same discipline decides how you pass a big struct: by value copies sizeof(T) bytes before the body runs (a 4 KB book is 38 ns by value against 0.7 ns by const&, about 50x), while small types stay by value.",
          "code": "int a[5] = {10, 20, 30, 40, 50};\nint* p = a;                      // DECAY: p == &a[0]\nconst int* view = p + 2;         // read-only view of a[2]; *view = 1 would not compile\nint& r = a[4]; r = 99;           // alias: writes a[4] itself\nstruct Book { double px[256]; long qty[256]; };         // 4 KB\nauto by_val = [](Book b)        { return b.px[0]; };    // copies 4096 bytes first\nauto by_ref = [](const Book& b) { return b.px[0]; };    // passes one 8-byte address\nstatic Book bk{}; bk.px[0] = 101.5;\nstd::printf(\"%d %d %zu %.1f %.1f\\n\", *view, p[4], sizeof(Book), by_val(bk), by_ref(bk));\n// 30 99 4096 101.5 101.5   -- same answers; one call moved 512x the bytes",
          "deck": "Deck U2 · slides 9–15"
        },
        {
          "title": "The heap by hand: the pairing rule, the classic bugs, the tail",
          "text": "malloc hands you uninitialised bytes; calloc zeroes them and checks the n*size multiplication; new allocates and constructs, throws bad_alloc instead of returning null, and must be matched shape for shape — new/delete, new[]/delete[], malloc or calloc/free, never crossed. Manual memory produces the same five bugs in every codebase — leak, dangling pointer, use-after-free, double free and a new[]/delete mismatch — all of which compile cleanly, and which a sanitizer (ASan, UBSan, leaks --atExit on macOS) reports down to the line. Even correct new/delete is non-deterministic: the allocator may walk free lists, take a lock or fault in a fresh page, so the call that costs 12 ns on a quiet tick is your p99.9 on a busy one. The rest of this session removes the bugs by construction; Session 6 builds the pools that remove the tail.",
          "code": "int* z = static_cast<int*>(std::calloc(4, sizeof(int)));  // zeroed, checked n*size\ndouble* b = new double[4]();                              // typed, value-initialised\nauto* huge = new (std::nothrow) double[1ull << 50];       // opt out of bad_alloc\nstd::printf(\"%d %.1f %s\\n\", z[3], b[3], huge ? \"got it\" : \"nullptr\");\nstd::free(z); delete[] b; delete[] huge;                  // match the shape exactly\n// 0 0.0 nullptr   -- delete[] of a null pointer is a defined no-op",
          "deck": "Deck U2 · slides 17–19, 23–26"
        },
        {
          "title": "Layout beats cleverness: contiguous, SoA, padding and the 64-byte line",
          "text": "Memory moves in 64-byte lines, so a scan costs the lines it touches, not the adds it does. One block of rows*cols doubles indexed r*cols + c replaces rows + 1 scattered allocations (the same sum over 128 MB is about 10 ms row-major and 48 ms column-major); a struct of arrays packs the hot field so every byte of every line is useful; and declaring members widest-first removes padding (the deck's Order goes from 40 to 32 bytes, two per line). Two writer cores sharing a line ping-pong it between them — about 4x slower on the slide — and alignas(64) gives each hot variable its own line. Assert the size of hot types with static_assert so a stray member breaks the build, not the tail.",
          "code": "struct Quote  { double px; int qty; char tag[36]; };   // array-of-structs, 48 B\nstruct Loose  { char a; double b; char c; };           // padded to 24\nstruct Packed { double b; char a; char c; };           // widest first: 16\nstruct Shared { std::atomic<long> a, b; };             // two counters, ONE line\nstruct Padded { alignas(64) std::atomic<long> a; alignas(64) std::atomic<long> b; };\nstd::printf(\"%zu %zu %zu %zu %zu %zu\\n\", sizeof(Quote), sizeof(Loose),\n            sizeof(Packed), sizeof(Shared), sizeof(Padded), alignof(Padded));\n// 48 24 16 16 128 64   -- Shared fits one line and two writer cores fight over it",
          "deck": "Deck U2 · slides 20–22, 28–30, 54, 57"
        },
        {
          "title": "A class guards an invariant: constructors, const, access",
          "text": "An invariant is a fact true of every live object — an Order has a positive price and a quantity that never wraps. Make the data private, check it once in the constructor, and throw rather than let a half-built object escape; every member function may then rely on it. Build members in the initialiser list (the body only assigns), remember they are initialised in declaration order whatever order you write the list in, and mark one-argument constructors explicit so a bare double never silently becomes an Order. struct and class differ only in default access, member functions cost no extra bytes, and const on a member function is a promise the compiler enforces. Expose operations that keep the invariant (fill, reprice), not a setter for every field, and overload only the operators whose meaning is obvious.",
          "code": "class Order {\n  double px_; unsigned qty_;                         // private: the guarded state\n public:\n  explicit Order(double px, unsigned q) : px_(px), qty_(q) {\n    if (px <= 0 || q == 0) throw std::invalid_argument(\"bad order\"); }\n  void fill(unsigned q) { qty_ -= std::min(q, qty_); }   // never wraps\n  double notional() const { return px_ * qty_; }         // const: no writes\n};\nOrder o(101.5, 200); o.fill(50);\ntry { Order bad(101.5, 0); } catch (const std::exception& e) { std::printf(\"%s \", e.what()); }\nstd::printf(\"%.0f\\n\", o.notional());\n// bad order 15225",
          "deck": "Deck U2 · slides 39–44, 53"
        },
        {
          "title": "RAII and the Rule of Five: one owner, released on every exit path",
          "text": "~T() runs by itself — at scope exit, on delete, or while a throw unwinds the stack — in the reverse order of construction. That is RAII: acquire in the constructor, release in the destructor, and cleanup cannot be forgotten on an early return (a file, a std::lock_guard, a ScopedTimer). The compiler's member-by-member copy of an owning raw pointer is a double free, so a class that needs a destructor needs the other four special members too: a deep copy, a move that steals the pointer and blanks the source, and noexcept on that move — a growing vector copies every element unless the move cannot throw (16,383 4 KB copies against 16,383 pointer steals on the slide). Rule of Zero for value members, all five for a raw owner, = delete where copying is meaningless.",
          "code": "struct PxBuf {\n  std::size_t n; double* p;\n  explicit PxBuf(std::size_t k) : n(k), p(new double[k]()) {}                  // acquire\n  PxBuf(const PxBuf& o) : n(o.n), p(new double[o.n]) { std::copy(o.p, o.p + n, p); }\n  PxBuf(PxBuf&& o) noexcept : n(o.n), p(o.p) { o.n = 0; o.p = nullptr; }       // steal, blank\n  ~PxBuf() { if (p) std::printf(\"free \"); delete[] p; }                        // release\n};\ntry { PxBuf a(8); a.p[0] = 101.5; PxBuf b = a; PxBuf c = std::move(a); throw 1; }\ncatch (int) { std::printf(\"caught\\n\"); }\n// free free caught   -- b and c are released by the throw; the moved-from a owned nothing",
          "deck": "Deck U2 · slides 43, 46–51, 55–56"
        },
        {
          "title": "Inheritance without virtual: order, slicing, hiding",
          "text": "Public inheritance is an is-a claim: every Derived contains a Base subobject, built first and destroyed last — bases, then members in declaration order, then the body, and exactly the reverse on the way out. Without virtual, the call is bound at compile time by the static type: copy a derived object into a base by value and the derived part is sliced off, and a call through a Base& runs the base's function. A derived name hides every base overload with that name (using Base::name brings them back), final closes a class, and when you merely use something — a fee policy, a vector of levels — contain it rather than inherit from it.",
          "code": "struct B { B() { std::printf(\"B\"); } ~B() { std::printf(\"~B \"); } int n() const { return 1; } };\nstruct M { M() { std::printf(\"M\"); } ~M() { std::printf(\"~M\"); } };\nstruct D : B { M m; D() { std::printf(\"D \"); } ~D() { std::printf(\"~D\"); }\n               int n() const { return 2; } };                  // hides B::n\nint main() {\n  { D d; B sliced = d; const B& ref = d;                       // copy slices; ref does not\n    std::printf(\"%d%d%d \", sliced.n(), ref.n(), d.n()); }      // static type picks n()\n  std::printf(\"\\n\");\n}\n// BMD 112 ~B ~D~M~B",
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
    },
    {
      "n": 3,
      "focus": "Polymorphism & smart pointers",
      "tagline": "Know exactly what a virtual call and a smart pointer cost — in nanoseconds, measured — and put both where they belong: at the edges, never inside tick-to-trade.",
      "concepts": [
        {
          "title": "Virtual functions: the object decides",
          "text": "Mark a member function virtual in the base, override it in the derived class, and a call through a Base& or Base* runs the derived body: the call is late-bound, so the object decides, not the static type of the reference. override asks the compiler to check that you really are overriding something — a missing const or a wrong parameter type becomes a compile error instead of a silent new function — and final forbids further overriding, which also lets the optimiser devirtualise. Almost everything else is still static: a default argument comes from the static type (Base's default, Derived's body), and overriding one overload hides the others until you write using Base::name. Rule: override on every override, and never give a virtual a default argument.",
          "code": "struct Venue {\n  virtual double fee(double n) const { return 0.0015 * n; }  // taker fee\n  virtual ~Venue() = default;\n};\nstruct Maker final : Venue {                                  // final: no further\n  double fee(double n) const override { return -0.0010 * n; } // a rebate\n};\nvoid charge(const Venue& v) { std::cout << v.fee(1000.0) << ' '; }  // ONE function\nint main() { Venue v; Maker m; charge(v); charge(m); std::cout << '\\n'; }\n// 1.5 -1     -- one call site, two bodies",
          "deck": "Deck U3 · slides 5–6"
        },
        {
          "title": "Virtual destructors and abstract interfaces",
          "text": "A base you delete through needs a virtual destructor, or the delete is undefined behaviour: delete p on a Base* whose destructor is not virtual runs only ~Base, so the derived part — its vector, its buffer — is never released (the deck's measurement leaks the whole 800 KB vector, and it still builds and runs). The rule is mechanical: a class with any virtual function gets a virtual destructor, which costs one more table entry, not one more byte per object. = 0 makes a function pure and the class abstract — it cannot be instantiated — so an interface is pure virtuals plus a virtual destructor and no state. The arena client is exactly this design: ArenaClient → HFTBot → your bot, a non-virtual run() that owns the control flow and virtual hooks you override.",
          "code": "struct IStrategy {                                          // an interface: no state\n  virtual double signal(double mid, double obi) const = 0;  // pure: a contract\n  virtual ~IStrategy() { std::printf(\"~IStrategy \"); }      // deleted via the base\n};\nstruct Momentum final : IStrategy {\n  double signal(double, double obi) const override { return 0.5 * obi; }\n  ~Momentum() override { std::printf(\"~Momentum \"); }\n};\nint main() { std::unique_ptr<IStrategy> s = std::make_unique<Momentum>();\n  std::printf(\"%+.2f \", s->signal(100.0, 0.4));\n}   // s dies here: through the base, and BOTH destructors run\n// +0.20 ~Momentum ~IStrategy",
          "deck": "Deck U3 · slides 7–8"
        },
        {
          "title": "How it works: the vptr and the vtable",
          "text": "A polymorphic object carries one hidden pointer, the vptr, to a read-only per-class table of function addresses, so sizeof grows by eight the moment the first virtual appears. A virtual call is two dependent loads — the vptr out of the object, then the slot out of the table — and an indirect branch to whatever address came back. On a final type or an exact known type the compiler can prove the target, call it directly and inline it. The vptr is rewritten as each constructor layer runs, so a virtual call made inside Base's constructor (or destructor) never reaches the derived override; and dynamic_cast is a hierarchy walk measured at around 20 ns against about 1.5 ns for the virtual call on the same objects.",
          "code": "struct P { int a; };  struct V { int a; virtual ~V() = default; };\nstruct Base {\n  Base() { hello(); }                   // vptr still points at Base's table\n  virtual void hello() const { std::printf(\"Base \"); }\n  virtual ~Base() = default;\n};\nstruct Derived : Base { void hello() const override { std::printf(\"Derived \"); } };\nint main() {\n  Derived d; d.hello();\n  std::printf(\"%zu %zu\\n\", sizeof(P), sizeof(V));\n}\n// Base Derived 4 16   -- 8-byte vptr + 4-byte int + 4 bytes padding",
          "deck": "Deck U3 · slides 10–11"
        },
        {
          "title": "What a virtual call costs — measured",
          "text": "The lab's dispatch_bench runs the same one-instruction body through six dispatch mechanisms over 4,096 objects, in three orders. On the deck's machine a predicted virtual call is about 0.8 ns against 0.24 ns for a direct, inlined call on a final type; over four types in random order it is about 4.8 ns — roughly 20 cycles of mispredicted indirect branch, every time the target changes — and sorting the same objects by type brings it straight back to 0.8 ns. std::variant, a function pointer and std::function land in the same place, because over random types they are the same indirect jump. So “virtual is slow” and “virtual is free” are both wrong: it is about a nanosecond when predictable, about five when not, and an optimisation barrier always — and the inlining you lose shows up in your own code, not in this micro-benchmark.",
          "deck": "Deck U3 · slides 12–14"
        },
        {
          "title": "A closed set: std::variant + std::visit",
          "text": "Dynamic dispatch answers one question — how do I call code I do not know yet? — so it belongs to an open type set, like the client calling a bot it has never seen. The messages off the wire are a closed set, known at build time: store them by value in a std::variant (the largest alternative plus a tag, no heap), and let std::visit generate the dispatch. The compiler checks the visitor handles every alternative, so adding a message type and forgetting its handler breaks the build rather than the session, and every handler is an ordinary function it can inline. Project Phase 1 asks for exactly this on your inbound path; Session 4 adds the one-line overload{} helper.",
          "code": "struct BookUpdate { double mid, obi; };\nstruct Fill { double px; int qty; };  struct Cancel { unsigned long id; };\nusing Msg = std::variant<BookUpdate, Fill, Cancel>;     // by value, no heap\nstruct Router {                                          // one overload per type\n  int pos = 0;\n  void operator()(const BookUpdate&) {}\n  void operator()(const Fill& f) { pos += f.qty; }\n  void operator()(const Cancel&) {}                       // delete it: build fails\n};\nint main() { Router r; Msg m = Fill{100.02, 5}; std::visit(r, m);\n             std::cout << r.pos << ' ' << sizeof(Msg) << '\\n'; }\n// 5 24",
          "deck": "Deck U3 · slides 14–15"
        },
        {
          "title": "unique_ptr by default, shared_ptr at a price",
          "text": "unique_ptr is sole ownership in the type system: move-only, the same size as a raw pointer, and its dereference is the same load (0.23 ns for both in the lab). make_unique forwards constructor arguments so the object is built once, in place, and a moved-from unique_ptr is guaranteed null. shared_ptr keeps the object alive until the last owner lets go: two pointers per handle, a separate control block (make_shared saves one of the two allocations), and a strong count that is atomic. Its tax is the copy, not the dereference — a copy plus destroy is about 3.2 ns on one core and tens of nanoseconds when threads fight over one control block — so pass the object by const& and never copy a shared_ptr inside on_book. weak_ptr observes without owning, which is how you break the cycle two shared_ptrs make.",
          "code": "struct Quote { double px; int qty; Quote(double p, int q) : px(p), qty(q) {} };\nauto u  = std::make_unique<Quote>(100.25, 5);       // built once, in place\nauto u2 = std::move(u);                             // ownership moves; u is null\nauto s1 = std::make_shared<Quote>(100.00, 5);       // ONE allocation\n{ auto c = s1; std::printf(\"%ld \", s1.use_count()); }   // atomic ++ then --\nstd::weak_ptr<Quote> w = s1;                        // observes, does not own\nstd::printf(\"%ld %d %zu %zu \", s1.use_count(), u == nullptr, sizeof(u2), sizeof(s1));\ns1.reset();                                         // last owner lets go\nstd::printf(\"%s\\n\", w.lock() ? \"alive\" : \"gone\");\n// 2 1 1 8 16 gone",
          "deck": "Deck U3 · slides 18–22"
        },
        {
          "title": "Custom deleters, and ownership as an API contract",
          "text": "unique_ptr<T, D> calls D instead of delete, so it is RAII for anything with a close — a FILE*, a socket, an mmap'd region, a pool slot that goes back to its pool in Session 6 — and a stateless deleter keeps the handle at 8 bytes (a function-pointer deleter doubles it). The signature is the ownership documentation: a by-value unique_ptr parameter is a sink and forces std::move at the call site, a const T& borrows, a by-value shared_ptr is only for a callee that really extends the lifetime, and a function returning unique_ptr is a source. The session's bot puts it together: the signal is chosen and built once in the constructor, owned by a unique_ptr, and on_book only ever borrows it — one predictable virtual call per tick, no allocation.",
          "code": "struct FileCloser { void operator()(std::FILE* f) const { if (f) std::fclose(f); } };\nusing File = std::unique_ptr<std::FILE, FileCloser>;            // stateless: 8 bytes\nstruct ISignal { virtual ~ISignal() = default; virtual double value(double) const = 0; };\nstruct Obi final : ISignal { double value(double obi) const override { return 0.5 * obi; } };\nstruct Engine {\n  std::vector<std::unique_ptr<ISignal>> sigs;\n  void add(std::unique_ptr<ISignal> s) { sigs.push_back(std::move(s)); }     // sink\n  double run(const ISignal& s, double obi) const { return s.value(obi); }  // borrow\n};\nint main() { File f(std::fopen(\"/dev/null\", \"w\")); Engine e; auto m = std::make_unique<Obi>();\n  e.add(std::move(m)); std::printf(\"%zu %zu %d %+.1f\\n\", sizeof(File), e.sigs.size(), m == nullptr, e.run(*e.sigs[0], 0.4)); }\n// 8 1 1 +0.2",
          "deck": "Deck U3 · slides 23, 25–26"
        }
      ],
      "hft": {
        "text": "Session 3 prices every runtime decision about a type — the virtual call and the smart pointer — so you can keep them at the edges of the bot and out of tick-to-trade.",
        "paragraphs": [
          "You have been writing a polymorphic class since Session 1. The arena client is a three-level hierarchy: ArenaClient owns the socket and the JSON and declares one virtual handler per event, HFTBot stamps latency and bridges the book snapshot into your on_book hook, and your bot overrides the hooks. run() is deliberately not virtual — the non-virtual interface pattern: the base owns the control flow, you own the hooks. That is virtual doing the one job it is uniquely good at, because the client must call a bot it has never seen.",
          "The price of that boundary is two virtual calls per tick, on the order of a nanosecond and a half, against tick-to-order stamps measured in microseconds. It is not your problem. Your problem is what you do inside on_book, and the rule the whole session builds toward is that inside on_book the type set is closed: you know every strategy and every message type at build time, so every virtual call, dynamic_cast or std::function you leave in there is a runtime decision about something you already knew.",
          "The dispatch table is the argument, in numbers. Predicted, a virtual call is cheap; mispredicted, it is six times the cost, and a hot loop over mixed strategy objects in random order is exactly the mispredicting shape. Batch work by type and it is cheap again. The larger cost never shows up in the micro-benchmark: an indirect call is an inlining barrier, so constant folding, register allocation and vectorisation stop at it. That is why Session 4 takes the same “override a hook” design and moves the decision to compile time with CRTP.",
          "Ownership follows the same shape. Build everything polymorphic once, at startup — a factory that names the concrete types, a unique_ptr that owns the result, a constructor that throws on a bad configuration before the socket opens — and let the hot path borrow through a reference. A by-value shared_ptr parameter pays an atomic increment and decrement per call, and from several threads the control block's cache line ping-pongs between cores; that is the tail you meet properly in Session 7.",
          "Then count. The lab's tick_alloc header counts heap allocations while on_book runs: the stock bot does ten in two thousand ticks in its own code, all first-tick unordered_map inserts, and about 48 per order inside the send path, where the order is built as JSON and the latency is logged. Every one of those is a malloc that is usually fast and occasionally not. Project Phase 1 asks for zero in steady state, variant dispatch on the inbound path, and before/after percentiles against your Phase 0 baseline."
        ],
        "example": {
          "title": "In the arena",
          "code": "// hft/cpp_client/include/hft_bot.hpp\nclass HFTBot : public ArenaClient {\npublic:\n    explicit HFTBot(ClientConfig cfg) : ArenaClient(std::move(cfg)) {}\n\n    // Non-virtual entry point: connect and run forever (reconnecting on drop).\n    // Do not override — override the hooks below instead.\n    void run() { ArenaClient::run(); }\n\nprotected:\n    virtual void on_book(const std::string& symbol, double bid, double ask,\n                         double mid, double microprice, double obi) {\n        (void)symbol; (void)bid; (void)ask; (void)mid; (void)microprice; (void)obi;\n    }",
          "text": "hft/cpp_client/include/hft_bot.hpp — the non-virtual interface in the client you already use: run() is not virtual, so the base owns the control flow; on_book (and on_fill, on_ack, on_queue) are the virtual hooks your bot overrides. hft/cpp_client/include/arena_client.hpp is the level above, with a virtual destructor and one virtual handler per protocol event."
        }
      },
      "interview": [
        {
          "q": "What does the virtual keyword change about a call, and what does override add?",
          "a": "virtual makes the call late-bound: through a Base& or Base*, the dynamic type of the object picks which body runs, instead of the static type of the reference. override does not make anything virtual — it asks the compiler to check that this function really overrides a virtual in a base, so a signature typo (a missing const, a different parameter type) is a compile error instead of a silently new, never-called function. final additionally forbids further overriding, which lets the optimiser devirtualise the call.",
          "level": "warm-up",
          "skill": "cpp.virtual-dispatch"
        },
        {
          "q": "Which smart pointer do you reach for first, and why?",
          "a": "unique_ptr. It encodes “exactly one owner” in the type — it is move-only, so the compiler refuses an accidental copy — it is the same size as a raw pointer, its dereference is the same load, and it deletes on every exit path. shared_ptr is for lifetimes that are genuinely shared and unknowable, and it costs a control block and an atomic reference count on every copy. “I don't know who owns this” is a design bug that shared_ptr hides rather than fixes.",
          "level": "warm-up",
          "skill": "cpp.smart-pointers"
        },
        {
          "q": "Why does a base class with virtual functions need a virtual destructor?",
          "a": "Because deleting a derived object through a pointer to a base whose destructor is not virtual is undefined behaviour: in practice only ~Base runs, so the derived part's members are never destroyed and whatever they own leaks — the deck's version leaks a whole vector, and it compiles, runs and “works”. With a virtual destructor, delete dispatches through the vtable to ~Derived, which then runs ~Base. It is not an overhead you save by leaving it out: the class already has a vptr, and the destructor is one more table entry. unique_ptr<Base> deletes through the base, so it needs this too.",
          "level": "core",
          "skill": "cpp.virtual-dispatch"
        },
        {
          "q": "What does this print, and why?\n```\nstruct Base { virtual int depth(int n = 5) const { return n; }\n              virtual ~Base() = default; };\nstruct Bot final : Base { int depth(int n = 10) const override { return 100 * n; } };\nBot b; const Base& r = b;\nstd::cout << r.depth() << ' ' << b.depth();\n```",
          "a": "500 1000. Dispatch picks the body at run time — r refers to a Bot, so Bot::depth runs — but default arguments are substituted at compile time from the static type of the expression. r.depth() is therefore Bot's body with Base's default, 100 × 5 = 500, while b.depth() uses Bot's own default, 100 × 10 = 1000. Two different moments, one line of code — which is why the rule is never to give a virtual function a default argument.",
          "level": "core",
          "skill": "cpp.virtual-dispatch"
        },
        {
          "q": "Precisely what does a virtual call cost, and when does it actually hurt?",
          "a": "Mechanically: load the vptr out of the object, load the slot out of the vtable, then an indirect branch whose target is unknown until the loads return. When one target dominates, the predictor learns it and the call costs a fraction of a nanosecond more than a direct one; when several targets alternate at random — mixed strategy objects in one loop — every change is a mispredict of roughly 15–20 cycles, about six times the predicted cost in the lab's table, and sorting the objects by type recovers it. The bigger cost is indirect: the compiler cannot inline through the call, so constant folding, register allocation and vectorisation stop there. final, or an exact known type, lets it devirtualise.",
          "level": "core",
          "skill": "perf.virtual-cost"
        },
        {
          "q": "Why is copying a shared_ptr on the hot path a problem when dereferencing one is not?",
          "a": "Dereferencing a shared_ptr is a plain load, the same as a raw pointer. Copying one is an atomic increment of the strong count, and destroying the copy is an atomic decrement — a read-modify-write that costs several nanoseconds on one core, and far more when several threads copy the same shared_ptr, because the control block's cache line ping-pongs between cores. A by-value shared_ptr parameter pays that twice per call. So pass the object itself by const& (or the shared_ptr by const& if the callee might keep it), and never copy one inside on_book.",
          "level": "core",
          "skill": "cpp.smart-pointers"
        },
        {
          "q": "The inbound wire carries five message types, all known at build time. Virtual hierarchy, std::variant, or a switch — and how do you prove the choice?",
          "a": "It is a closed set, so not a virtual hierarchy: that would mean a heap object per message and an open-set mechanism for a closed-set problem. Turn the tag into a type once at the parse boundary — a switch on the discriminator — then carry a std::variant by value and dispatch with std::visit: no allocation, the compiler proves every alternative is handled, and each handler can inline. Over random message types a visit is still an indirect jump, so it is not magically faster than a virtual call in a micro-benchmark; the wins are value semantics, exhaustiveness and inlining. Proof is empirical: read the disassembly of the hot function, and compare p50 and p99.9 on the same recorded tape.",
          "level": "senior",
          "skill": "cpp.variant-visit"
        },
        {
          "q": "Your bot chooses its signal from configuration. Design the ownership so that nothing on the hot path allocates or can dangle.",
          "a": "A factory maps the configuration name to a concrete type and returns std::unique_ptr<ISignal>, returning null for an unknown name; the bot's constructor calls it once and throws if it got null, so a bad configuration fails before the socket opens rather than mid-session. The bot holds the unique_ptr as a member — ISignal has a virtual destructor because it is deleted through the base — and on_book borrows it: signal_->value(...) is one virtual call with the same target every tick, so it predicts perfectly, and nothing is allocated. Any resource with a close gets a unique_ptr with a stateless custom deleter, signatures say sink / borrow / source explicitly, and tick_alloc over the replay tape proves zero steady-state allocations. The next step, when the set is closed at build time, is to make the signal a template parameter so even that one call disappears.",
          "level": "senior",
          "skill": "cpp.ownership-contracts"
        }
      ]
    },
    {
      "n": 4,
      "focus": "Templates, compile-time & CRTP",
      "tagline": "Session 3 priced every decision made at run time; tonight you make it at build time instead — one definition, one fully inlined function per type, and the vtable row of the benchmark disappears.",
      "concepts": [
        {
          "title": "A template is a recipe, not code",
          "text": "template <class T> is a blueprint: the compiler instantiates it — generates a real function or class — the first time you use it with concrete arguments, and each instantiation is as visible to the optimiser as hand-written code. A non-type parameter puts a value in the type: Ring<double, 8> knows its capacity at compile time, so the wrap mask N - 1 is a constant, the storage is inline with no heap and no size field, and a static_assert on N rejects Ring<int, 6> at build time. The prices are real too: definitions live in headers, and every distinct instantiation is separate machine code that grows the binary and competes for the instruction cache.",
          "code": "template <class T, std::size_t N> class Ring {\n  static_assert(N > 0 && (N & (N - 1)) == 0, \"N must be a power of two\");\n  std::array<T, N> buf_{};  std::size_t head_ = 0;      // inline: no heap\npublic:\n  void push(const T& x) { buf_[head_++ & (N - 1)] = x; }\n  std::size_t size() const { return head_ < N ? head_ : N; }\n  const T& back() const { return buf_[(head_ - 1) & (N - 1)]; }\n};\nRing<double, 8> mids;                                   // capacity is in the TYPE\nfor (int i = 0; i < 10; ++i) mids.push(100.0 + i * 0.01);\nstd::printf(\"%zu %.2f %zu\\n\", mids.size(), mids.back(), sizeof(mids));\n// 8 100.09 72",
          "deck": "Deck U4 · slides 5–6"
        },
        {
          "title": "Deduction, and specialising the type that deserves it",
          "text": "You rarely spell template arguments: the compiler deduces them from the call by matching each argument to its parameter, and it tries no conversions, so max_of(3, 4.5) is a conflict rather than a silent promotion. When one type deserves hand-tuning it gets its own full specialization; a partial specialization covers a whole family (every pointer, every Ring<T, 8>) and is allowed for class templates only — functions overload instead. The most specialised match always wins.",
          "code": "struct Price { std::int64_t ticks; };\ntemplate <class T> struct Wire    { static const char* fmt() { return \"generic\"; } };\ntemplate <> struct Wire<Price>    { static const char* fmt() { return \"fixed-point\"; } };\ntemplate <class T> struct Wire<T*> { static const char* fmt() { return \"pointer\"; } };\ntemplate <class T> T max_of(T a, T b) { return a < b ? b : a; }\nstd::printf(\"%s %s %s %.1f\\n\", Wire<int>::fmt(), Wire<Price>::fmt(),\n            Wire<Price*>::fmt(), max_of<double>(3, 4.5));   // explicit: no conflict\n// generic fixed-point pointer 4.5",
          "deck": "Deck U4 · slide 7"
        },
        {
          "title": "Packs, folds and the overload{} visitor",
          "text": "typename... binds any number of types; a C++17 fold collapses the pack over an operator in one line — no recursion, no base case — and sizeof... is its length as a compile-time constant. A pack of base classes is just as legal: overload inherits from every lambda you hand it and pulls all their call operators into one overload set, which is Session 3's variant visitor in two lines. Delete one lambda and std::visit refuses to compile because the visitor is no longer exhaustive — the missing message type is a build error, not a production surprise.",
          "code": "template <class... Ts> constexpr auto sum(Ts... xs) { return (xs + ...); }\ntemplate <class... Fs> struct overload : Fs... { using Fs::operator()...; };\nstruct Book { double mid; };  struct Fill { int qty; };\nusing Msg = std::variant<Book, Fill>;\nconst char* route(const Msg& m) {\n  return std::visit(overload{[](const Book&) { return \"book\"; },\n                             [](const Fill&) { return \"fill\"; }}, m); }\nstatic_assert(sum(1, 2, 3, 4) == 10);            // the compiler did the addition\nstd::printf(\"%s %s %.2f\\n\", route(Book{100.01}), route(Fill{5}), sum(0.5, 0.25));\n// book fill 0.75",
          "deck": "Deck U4 · slides 9–10"
        },
        {
          "title": "Traits, concepts and if constexpr",
          "text": "A type trait is a question the compiler answers about T — is_integral_v, is_trivially_copyable_v, your own is_wire_msg — and the answer costs nothing at run time. A C++20 concept names a requirement and replaces the SFINAE trick of making a signature fail to substitute: the error moves to the call site and says which requirement was not met. if constexpr then gives one template a separate path per type: the untaken arm is discarded, never instantiated, so an arm that would be ill-formed for the other types is fine, and a final static_assert turns a forgotten type into a build error.",
          "code": "template <class T> concept Arithmetic = std::is_arithmetic_v<T>;\ntemplate <Arithmetic T> std::size_t wire_size(T) {\n  if constexpr (std::is_same_v<T, bool>)       return 1;   // bool first: it is integral\n  else if constexpr (std::is_integral_v<T>)    return sizeof(T);\n  else                                         return 8;   // price as int64 ticks\n}\nstruct Fill { int qty; };\nstd::printf(\"%zu %zu %zu %d\\n\", wire_size(true), wire_size(42), wire_size(100.25),\n            (int)std::is_trivially_copyable_v<Fill>);   // wire_size(\"x\"): not Arithmetic\n// 1 4 8 1",
          "deck": "Deck U4 · slides 11–13"
        },
        {
          "title": "constexpr, consteval and static_assert",
          "text": "Let the compiler compute whatever does not depend on the market. A constexpr function can run at compile time and is an ordinary function when its inputs are not constant; consteval must run at compile time, so calling it with a runtime value is a build error. A tick table built that way ships as read-only data — no startup code, one load per lookup — and static_assert is where every assumption lives (fee rates, table values, sizeof(Level) == 16 so four levels share a cache line) so that a violation fails the build rather than the market.",
          "code": "consteval std::int64_t bps(double r) { return std::int64_t(r * 10'000 + 0.5); }\nstruct TickTable { std::array<std::int64_t, 256> px{};\n  constexpr TickTable() { for (int i = 0; i < 256; ++i) px[i] = 1'000'000 + i * 100; } };\nconstexpr TickTable kTicks{};                    // built BY THE COMPILER\nstruct Level { std::int64_t px; std::int32_t qty, orders; };\nstatic_assert(kTicks.px[50] == 1'005'000 && sizeof(Level) == 16);\nconstexpr auto taker = bps(0.0015), maker = bps(0.0010);\nstd::printf(\"%lld %lld %lld\\n\", (long long)taker, (long long)maker, (long long)kTicks.px[50]);\n// 15 10 1005000",
          "deck": "Deck U4 · slide 15"
        },
        {
          "title": "CRTP: the override hook without the vtable",
          "text": "The Curiously Recurring Template Pattern templates a base on the class that derives from it, so the base can static_cast down and call the derived hook: the target is known from the type, the body inlines, and there is no vptr and no indirect branch. It keeps Session 3's design — shared logic in the base, the strategy fills in one hook — and in dispatch_bench the CRTP row lands on the direct-call row (0.23 ns against 0.22 ns on the deck's M4) instead of the virtual row (0.70 ns, 4.32 ns on a mixed stream). The price: Strategy<Momentum> and Strategy<MeanRevert> share no base type, so a set chosen at run time needs a variant or grouping by type at the edge.",
          "code": "struct Book { double obi; };\ntemplate <class D> struct Strategy {                    // no virtual anywhere\n  double signal(const Book& b) const { return static_cast<const D*>(this)->signal_impl(b); }\n  int side(const Book& b) const { double s = signal(b); return s > 0.1 ? 1 : s < -0.1 ? -1 : 0; }\n};\nstruct Momentum : Strategy<Momentum> {\n  double signal_impl(const Book& b) const { return 0.5 * b.obi; } };\ntemplate <class S> int decide(const Strategy<S>& s, const Book& b) { return s.side(b); }\nMomentum m;\nstd::printf(\"%d %d %zu\\n\", decide(m, Book{0.6}), decide(m, Book{-0.1}), sizeof(Momentum));\n// 1 0 1",
          "deck": "Deck U4 · slides 16–17"
        },
        {
          "title": "Policy-based design: behaviour as template parameters",
          "text": "Compose a class from small policy types, one decision each, and changing a policy is changing a type: the compiler generates a fresh, fully inlined class instead of a flag you test every tick. The arithmetic here is worth doing once: at $100 a 15 bps taker fee is $0.15 a share against the $0.01 half-spread you are chasing, while posting earns the 10 bps rebate — the fee policy is worth more than most signals, and a static_assert can prove at build time that posting beats crossing. Anything an operator must change without a rebuild (risk limits, kill switches) is never a policy.",
          "code": "struct TakerFees { static constexpr double rate = +0.0015; };\nstruct MakerFees { static constexpr double rate = -0.0010; };\nstruct NoSkew  { static constexpr double skew(int) { return 0.0; } };\ntemplate <class Fee, class Skew> struct Quoter {\n  static constexpr double edge(double half, double px, int pos)\n  { return half - Fee::rate * px + Skew::skew(pos); } };\nusing Aggressive = Quoter<TakerFees, NoSkew>;  using Passive = Quoter<MakerFees, NoSkew>;\nstatic_assert(Passive::edge(0.01, 100.0, 0) > Aggressive::edge(0.01, 100.0, 0));\nstd::printf(\"%+.4f %+.4f\\n\", Aggressive::edge(0.01, 100.0, 0), Passive::edge(0.01, 100.0, 0));\n// -0.1400 +0.1100",
          "deck": "Deck U4 · slide 18"
        }
      ],
      "hft": {
        "text": "Why this matters in HFT",
        "paragraphs": [
          "Inside on_book the set of types is closed. You ship two or three strategies and a handful of message types, not a plugin system, so every runtime question about a type the programmer already knew — a virtual call, a variant visit, a std::function — is a cost you chose to pay. Session 3 measured those rows; Session 4 moves the decision into the compiler, where it costs nothing per tick.",
          "The benchmark understates the win. In dispatch_bench the body is one multiply, so CRTP saves about half a nanosecond per call. In a real on_book the win is what inlining unlocks: the compiler folds your constants, keeps the book in registers and drops checks it can prove dead — and none of that survives an indirect call. The HFT rule is short: if the type set is closed and known, template it; keep virtual for the genuinely open set at the client boundary.",
          "Compile time is also where correctness goes. A static_assert on a struct size, a fee rate or a tick table turns an assumption into a build failure; a concept rejects the wrong type with one readable line; std::is_trivially_copyable_v<Msg> is the licence to memcpy a message into a ring or onto the wire, which is exactly what Sessions 7 and 8 do. The market never gets to find those bugs for you.",
          "The outbound path is the practical target. The stock client builds every order as a JSON object and dumps it to a std::string — dozens of heap allocations per send. A variadic, if-constexpr encoder that folds over the fields and writes numbers with std::to_chars into a reused buffer does the same job with none (measured in the lab: about 56 ns and 0 allocations against about 1.3 µs and 41 allocations for the JSON library). Phase 1 is due the night of Session 5 (Oct 26), so you submit what works and carry the encoder into Project Phase 2 as the outbound half of a no-allocation hot path; Session 3's variant router is the inbound half.",
          "Templates come back immediately. Session 6's typed pool is ObjectPool<T, N> and its book is sized at compile time with static_assert on its layout; Session 7's SPSC ring is a Ring<T, N> with the power-of-two mask you wrote tonight. What you pay for them is code size and compile time, so instantiate for the types you actually ship. Templates and CRTP are on the Oct 26 midterm, which covers Sessions 1–4."
        ],
        "example": {
          "title": "In the arena",
          "code": "// hft/cpp_client/src/arena_client.cpp — the send path the encoder replaces\nvoid ArenaClient::place_limit(const std::string& symbol, const std::string& side,\n                              int quantity, double price) {\n    // Mirrors shared.messages.PlaceOrder (order_type=\"limit\"). stop_price is\n    // optional in the schema, so we omit it for wire compatibility.\n    json o = {\n        {\"type\",       \"place_order\"},\n        {\"team_id\",    cfg_.team_id},\n        {\"symbol\",     symbol},\n        {\"side\",       side},\n        {\"order_type\", \"limit\"},\n        {\"price\",      price},\n        {\"quantity\",   quantity},\n    };\n    send_raw(o.dump());\n}",
          "text": "hft/cpp_client/src/arena_client.cpp — every limit order your bot sends is built here as a JSON object and dumped to a fresh std::string. Step 8 of the Session 4 lab writes the same bytes with a variadic encoder, if constexpr per field type and std::to_chars into a reused buffer, and a counting operator new prints allocations: 0; wiring it into this function is work you carry into Project Phase 2."
        }
      },
      "interview": [
        {
          "q": "Why must a template's definition usually live in a header?",
          "a": "Because a template is not code until it is instantiated, and the compiler can only instantiate it where it can see the definition. With the body in a separate .cpp, each translation unit that uses it emits a call to a function nobody generated, and you get a link error. The alternatives are to keep the definition in the header (the normal choice) or to explicitly instantiate the specific types you need in one .cpp — which is also a way to contain code bloat.",
          "level": "warm-up",
          "skill": "cpp.templates"
        },
        {
          "q": "What is the difference between constexpr and consteval, and what does static_assert add?",
          "a": "constexpr says a function or variable can be evaluated during compilation when its inputs are constant expressions, and it remains an ordinary function when they are not — so a constexpr function called with a runtime argument gives you no compile-time guarantee at all. consteval makes it an immediate function that must be evaluated at compile time; calling it with a runtime value is a hard error, so no runtime path exists. static_assert is the third leg: it checks a compile-time predicate and turns a violated assumption — a tick grid, a struct size, a fee rate — into a failed build.",
          "level": "warm-up",
          "skill": "cpp.constexpr"
        },
        {
          "q": "What is the difference between if and if constexpr, and why can't a plain if do the job inside a template?",
          "a": "A plain if is a run-time test: both branches are compiled for every instantiation and the CPU evaluates the condition. if constexpr is evaluated during compilation and the untaken branch is discarded — never instantiated — so it only has to parse, not to be valid for that T. That is why one template can memcpy an integer, scale a double into ticks and reject a pointer: with a plain if, v * 100.0 would have to compile for the pointer too. It costs nothing at run time, and a final else with static_assert turns an unsupported type into a build error.",
          "level": "core",
          "skill": "cpp.type-traits-constraints"
        },
        {
          "q": "What does SFINAE mean, and what do C++20 concepts improve on it?",
          "a": "Substitution Failure Is Not An Error: when substituting template arguments into a signature produces something ill-formed, that candidate is silently removed from overload resolution rather than failing the build — so enable_if_t<is_arithmetic_v<T>, int> = 0 makes a function disappear for non-arithmetic types. It works, but the intent is buried in the signature and a misuse produces a wall of notes. A concept names the requirement — template <Arithmetic T> — or states it as a requires-expression ('s.signal(m) must compile and convert to double'), and the error says exactly which requirement failed at the call site. It also checks shape, not inheritance: any type with the right members qualifies, with no base class and no vtable.",
          "level": "core",
          "skill": "cpp.type-traits-constraints"
        },
        {
          "q": "Explain the overload{} idiom line by line.",
          "a": "template <class... Fs> struct overload : Fs... { using Fs::operator()...; }; — the struct inherits from every lambda type in the pack (variadic inheritance), and the using-declaration pack expansion brings every lambda's call operator into one overload set, so overload resolution picks the lambda whose parameter matches. A deduction guide (implicit for aggregates in C++20) lets you write overload{...} without naming lambda types. Passed to std::visit over a variant, it is a visitor built inline, and because std::visit requires the visitor to handle every alternative, removing a lambda is a compile error — exhaustiveness checked by the build.",
          "level": "core",
          "skill": "cpp.variadic-templates"
        },
        {
          "q": "Compare CRTP with virtual dispatch. When would you still choose virtual?",
          "a": "CRTP binds the call at compile time — the base static_casts to its derived type — so it inlines completely, adds no vptr and no indirect branch; in the lab's dispatch_bench the CRTP row matches the direct-call row, not the virtual row. A virtual call is a load of the vptr, a load of the slot and an indirect branch, but the real bill is the inlining barrier. The catch with CRTP is that the concrete type must be known at compile time and the instantiations share no base, so I still use virtual where the type set is genuinely open or flexibility is worth more than nanoseconds — configuration, logging, the client boundary — never in the tick-to-trade body.",
          "level": "core",
          "skill": "cpp.crtp-policies"
        },
        {
          "q": "How would you prove that a \"zero-overhead\" template abstraction really is zero overhead compared with the virtual version?",
          "a": "Two ways, both empirical. Read the generated code: build both at -O2 and compare the disassembly of the hot function — the virtual version shows the vptr load, the slot load and an indirect branch (br x2 on arm64), the CRTP version shows the inlined body and nothing else. Then confirm behaviourally on a fixed input: the same dispatch_bench or the same recorded tape, comparing p50 and p99.9, because an inlining failure shows up as a tail change long before it shows up in a mean. Claiming zero overhead from the language rules alone is how people ship an accidental indirect call.",
          "level": "senior",
          "skill": "perf.virtual-cost"
        },
        {
          "q": "Templates are \"zero-cost\". When can they make a latency-critical binary slower?",
          "a": "When instantiations multiply. Each distinct set of arguments is separate machine code, so templating a fat function over every integer width, every container and every policy combination grows the binary and can push the hot path out of the instruction cache — the program becomes front-end bound, which shows up in counters as i-cache and iTLB misses rather than in the source. Deep inlining can have the same effect. The remedies are to instantiate only the types you ship, keep the templated layer thin over a non-template core, explicitly instantiate in one translation unit, and measure the tail rather than assume the abstraction is free.",
          "level": "senior",
          "skill": "cpp.templates"
        }
      ]
    },
    {
      "n": 5,
      "focus": "Midterm — what to revise",
      "tagline": "No lecture tonight: a 140-minute remote exam on Sessions 1–4, templates included — then Project Phase 1 is due before midnight.",
      "concepts": [
        {
          "title": "Revise Session 1 — the limit order book and its arithmetic",
          "text": "Read a book snapshot and compute the touch, the spread, the mid and the microprice; say why price-time priority makes your place in the queue an asset; work a maker/taker fee example through to the per-share result, both legs. The exam is mostly C++, but expect the vocabulary: tick-to-trade, colocation, what a crossed or locked book means. Re-read labs/session01.md and redo HW 1's metrics by hand on one snapshot.",
          "deck": "Deck U5 · slide 4"
        },
        {
          "title": "Revise Session 2 — pointers, the cost of memory, classes and RAII",
          "text": "Pointers versus references, pointer arithmetic, const in every position, and which line of a snippet is undefined behaviour (dangling, double delete, out-of-bounds, use after move). The memory hierarchy in numbers: a cache line is 64 bytes, a miss costs about 100 ns, so struct layout, padding and AoS versus SoA show up in the timings. Then the class: invariants, constructors and the Rule of Zero / Three / Five, what the compiler generates and when it stops, move semantics, and RAII as the reason a destructor runs on every exit path. Inheritance and the order of construction and destruction close it.",
          "deck": "Deck U5 · slide 4"
        },
        {
          "title": "Revise Session 3 — polymorphism, the vtable and smart pointers",
          "text": "Virtual dispatch: what the vptr and the vtable are, why a base class needs a virtual destructor, slicing, override and final, and why a virtual call costs an indirect branch plus a lost inlining opportunity rather than a fixed number of nanoseconds. std::variant with std::visit as the closed-set alternative. Ownership: unique_ptr (move-only, zero overhead with a stateless deleter), shared_ptr (a control block and atomic counts), weak_ptr to break a cycle, make_unique / make_shared, and how a function signature states who owns what.",
          "deck": "Deck U5 · slide 4"
        },
        {
          "title": "Revise Session 4 — templates, compile-time and CRTP",
          "text": "Function and class templates with type and non-type parameters, deduction, specialisation, and why templates live in headers. Parameter packs, fold expressions and std::forward. Type traits, C++20 concepts and requires-clauses, if constexpr. constexpr versus consteval and static_assert. CRTP — a base that static_casts to its Derived, so the hook is resolved at compile time and the indirect branch is gone — and policy-based design. Expect what-does-this-print and is-this-well-formed questions on short template snippets.",
          "deck": "Deck U5 · slide 4"
        }
      ],
      "hft": {
        "text": "Exam night: no lecture; the midterm covers Sessions 1–4, templates and CRTP included.",
        "paragraphs": [
          "Tonight is the exam and nothing else. The quiz unlocks on Canvas at 6:00 pm CT inside this Zoom session; begin by 6:10, when the access code is read aloud and posted once in chat. You get one attempt, a 140-minute timer from the moment you open it, closed book, camera on, one browser tab, and the lock at 8:40 pm does not move — open it late and you get less time, not a later deadline. If your connection drops, rejoin and re-open the quiz: the timer kept running and your saved answers are there.",
          "The questions are multiple choice, one point each, drawn at random from one group per topic — pointers and memory layout; allocation, RAII and smart pointers; OOP, virtual dispatch and the object model; templates, CRTP and compile-time; complexity, cache and performance basics — so every paper covers every topic. Most show a short C++ snippet and ask what it prints, whether it is well-formed, or which line is undefined behaviour; assume a 64-bit target, a 64-byte cache line and little-endian. There is no penalty for a wrong answer, so answer everything. Memory pools, order-book data structures and concurrency are not on it: they are Sessions 6 and 7.",
          "After the exam: Project Phase 1 — The Fast Hot Path is due tonight, Mon Oct 26 at 10:59 pm CT (submit what works; this is not the night to refactor), and HW 4 — Templates & CRTP stays due Thu Nov 5. Session 6 on Mon Nov 2 opens with malloc against a pool, then puts vector, list, map, hash and heap against the three questions an order book must answer; pre-read labs/session06.md in the starter repo. The checklist below is your revision list: tick a line only when you could explain it to someone else without notes."
        ]
      },
      "interview": []
    },
    {
      "n": 6,
      "focus": "Choosing the data structure for each order-book question",
      "tagline": "A book answers three questions (an order by id, a level by price, the best prices). Pick the structure for each, pay for it in cache misses rather than big-O, and allocate nothing on the hot path.",
      "concepts": [
        {
          "title": "Before the containers: the fixed-size pool and placement new",
          "text": "Every container below allocates, so start with the allocator. malloc is not slow: it is fast on average and unpredictable. It is a shared, thread-safe heap that takes locks, asks the kernel for pages when it runs dry and fragments over a session, so the same new+delete of a 64-byte order costs about 11–21 ns on average and 0.5–0.9 µs in its worst batch. The pool reverses each of those properties. It has one block size and one slab owned since startup, and a singly linked free list threaded through the unused slots, so the free list costs no extra memory. Allocation pops the head and free pushes it back: O(1), no lock, no syscall, and LIFO reuse hands back a slot still hot in L1. Getting bytes and starting an object's life are separate steps. new (slot) T{...} runs only the constructor, in memory you already own, and p->~T() ends the object's life before the slot goes back to the pool (never delete). HW 5 asks you to show the pool's number is stable, not merely small. When a whole tick's scratch dies at once, an arena (or std::pmr::monotonic_buffer_resource) frees it all with one reset.",
          "code": "struct Slot { Slot* next; };\nSlot slab[4]; Slot* free_ = nullptr;                   // ONE pre-owned block\nfor (auto& s : slab) { s.next = free_; free_ = &s; }   // thread the free-list\nSlot* a = free_; free_ = a->next;                      // alloc: O(1) pop\nSlot* b = free_; free_ = b->next;                      // alloc: O(1) pop\nb->next = free_; free_ = b;                            // free:  O(1) push\nSlot* c = free_; free_ = c->next;                      // alloc again\nstd::printf(\"%d %d %d\\n\", a != b, c == b, free_ != nullptr);\n// 1 1 1   -- the freed slot is handed straight back, still hot in L1",
          "deck": "Deck U6 · slides 5–10"
        },
        {
          "title": "std::vector — contiguous, the default, and one sort order",
          "text": "The book must answer three questions: Q1, find an order by id (cancel, modify, fill); Q2, find a level by price (add, match); Q3, read the best bid and ask, thousands of times a tick. Start with the default container. A vector is one block: element i sits at base + i·sizeof(T), so indexing is O(1) and a scan streams through the prefetcher. push_back is amortized O(1), but the push that outgrows the capacity reallocates and copies all n, which is a tail spike on whichever tick it lands. reserve() removes it. Inserting or erasing in the middle shifts every later element, O(n). Kept sorted by price, a vector of levels answers Q2 with a binary search (std::lower_bound, O(log n)) and Q3 with front(), but a new level is an O(n) insert. And an array has only one sort order: sorted by price, Q1 by id is a linear scan. Iterators are not stable either, since a reallocation or a middle insert invalidates them, so you cannot keep one per order.",
          "code": "std::vector<int> v; int moves = 0; const int* where = nullptr;\nfor (int i = 0; i < 1000; ++i) { v.push_back(i);              // amortized O(1)...\n  if (v.data() != where) { ++moves; where = v.data(); } }     // ...but each regrow copies all n\nstd::vector<int> w; w.reserve(1000); const int* fixed = w.data();\nfor (int i = 0; i < 1000; ++i) w.push_back(i);                 // reserve(): no regrow at all\nstd::vector<int> px{9990, 9995, 10000, 10005};                 // ask levels in ticks, sorted\nauto k = std::lower_bound(px.begin(), px.end(), 10000) - px.begin();   // Q2: O(log n)\npx.insert(px.begin() + 1, 9993);                               // a NEW level: O(n) shift\nstd::printf(\"%d %d %td %d\\n\", moves > 5, w.data() == fixed, k, px.front());   // Q3: front()\n// 1 1 2 9990",
          "deck": "Deck U6 · slides 14–15"
        },
        {
          "title": "std::list and std::forward_list — stable iterators, paid in cache misses",
          "text": "A std::list makes every element its own heap node with prev and next pointers. Nothing ever moves, so iterators stay valid, and that is the one thing it is good for. Keep an id → iterator map, and Q1 (cancel) becomes an O(1) unlink once you hold the iterator. Everything else costs a pointer chase. Any search is O(n), each hop a likely cache miss of about 100 ns because the nodes are scattered, and every push_back is a malloc plus 16 bytes of links. std::forward_list keeps one pointer per node: 8 bytes smaller, but there is no size(), no back(), no push_back() and no --it, only insert_after and erase_after. Erasing therefore needs the node before the target, which is O(n) to find unless you track it. You can still build a FIFO by keeping the tail yourself. The verdict on sequences: each answers one question well and none answers all three, so the book uses one structure per question.",
          "code": "struct Order { std::uint64_t id; std::uint32_t qty; };\nstd::list<Order> fifo;                                          // one price level\nstd::unordered_map<std::uint64_t, std::list<Order>::iterator> where;   // Q1: id -> node\nfor (std::uint64_t id : {7, 8, 9}) where[id] = fifo.insert(fifo.end(), {id, 100});\nfifo.erase(where[8]); where.erase(8);                           // cancel: O(1), no search\nfifo.push_back({10, 50});                                       // other iterators stay valid\nstd::forward_list<Order> q{{1, 5}, {2, 6}, {3, 7}};             // one pointer per node\nauto prev = q.before_begin();                                   // erase needs the node BEFORE\nfor (auto it = q.begin(); it != q.end(); prev = it++)\n  if (it->id == 2) { q.erase_after(prev); break; }             // finding it: a pointer chase\nstd::printf(\"%zu %llu %llu\\n\", fifo.size(), (unsigned long long)where[9]->id,\n            (unsigned long long)std::next(q.begin())->id);\n// 3 9 3",
          "deck": "Deck U6 · slides 16–18"
        },
        {
          "title": "std::map / std::set — sorted levels for Q2 and Q3",
          "text": "A red-black tree keeps its keys sorted, which is exactly the order a book needs. Key it on integer ticks, with std::greater<> on the bid side so begin() is the best bid. find is O(log n) for Q2. begin() and rbegin() are O(1) for Q3, because implementations cache the leftmost node. In-order iteration is price order, so a marketable order walks the opposite side level by level. The cost is not in the big-O. Each level is a separately allocated node, a new price allocates, and each of the ~log n comparisons lands on a different cache line. At n = 64 that is six comparisons, which sounds like nothing, until each one is a potential miss. std::set is the same tree with no mapped value. A map answers Q2 and Q3 correctly everywhere, and it is the correctness reference (a shadow book) you diff the fast book against.",
          "code": "struct Level { std::uint32_t qty = 0, orders = 0; };\nstd::map<std::int64_t, Level, std::greater<>> bids;             // best (highest) first\nstd::map<std::int64_t, Level> asks;                             // best (lowest) first\nbids[9998].qty += 300; bids[10000].qty += 200; bids[9999].qty += 100;   // a node per new level\nasks[10003].qty += 400; asks[10002].qty += 150;\nauto it = bids.find(9999);                                      // Q2: O(log n) pointer hops\nstd::uint32_t need = 500, filled = 0;\nfor (auto& [px, lvl] : asks) {                                  // match: walk in price order\n  filled += std::min(need - filled, lvl.qty);\n  if (filled == need) break; }\nstd::printf(\"%lld %lld %u %u\\n\", (long long)bids.begin()->first,   // Q3: begin()\n            (long long)asks.begin()->first, it->second.qty, filled);\n// 10000 10002 100 500",
          "deck": "Deck U6 · slide 20"
        },
        {
          "title": "std::unordered_map vs open addressing — Q1 in O(1)",
          "text": "Order id → order is a hash lookup, O(1) on average either way. Memory layout sets the constant. The standard requires references to elements to survive inserts and rehashes, which in practice forces chaining: every element is its own node, a bucket is a linked list, and a collision is a pointer chase. Once the load factor passes max_load_factor, the table rebuilds in O(n) at a moment you did not choose. That rebuild is a p99.9 event, which reserve() up front avoids. The HFT version is open addressing on one flat array. With a power-of-two capacity, hash & mask replaces %. A collision probes the next slot, usually in the same cache line. Keep the load factor under about 0.7, and delete with a tombstone, because emptying a slot would break every probe chain that runs through it. In the lab's bench-book, a std::string-keyed unordered_map is about 3.5× slower than an open-addressing SymMap, mostly from building and hashing a string per call.",
          "code": "std::unordered_map<std::uint64_t, std::uint32_t> by_id;         // chained nodes, stable refs\nstd::size_t b0 = by_id.bucket_count(), rehashes = 0;\nfor (std::uint64_t id = 0; id < 1000; ++id) { by_id[id] = 1;    // no reserve(): it rebuilds\n  if (by_id.bucket_count() != b0) { ++rehashes; b0 = by_id.bucket_count(); } }\nstruct Slot { std::uint64_t key = 0; std::uint8_t st = 0; };    // 0 empty, 1 used, 2 tombstone\nstd::array<Slot, 8> t{}; const std::uint64_t mask = 7;          // power of two: AND, not %\nauto put = [&](std::uint64_t k) { std::uint64_t i = k & mask;\n  while (t[i].st == 1) i = (i + 1) & mask; t[i] = {k, 1}; };    // linear probing\nauto find = [&](std::uint64_t k) { std::uint64_t i = k & mask;\n  for (; t[i].st != 0; i = (i + 1) & mask) if (t[i].st == 1 && t[i].key == k) return int(i);\n  return -1; };\nput(1); put(9); put(17); t[find(9)].st = 2;    // all hash to slot 1; delete 9 = a tombstone\nstd::printf(\"%d %d %d\\n\", rehashes > 3, find(17), find(9));\n// 1 3 -1",
          "deck": "Deck U6 · slides 21–22"
        },
        {
          "title": "std::priority_queue / make_heap — Q3 alone, and lazy deletion",
          "text": "A binary heap lives in a vector, with the best element always at index 0. top() is O(1) for Q3, and push and pop are an O(log n) sift through contiguous memory (std::make_heap, push_heap and pop_heap underneath). Order the entries on price, then on a monotonic sequence number, and equal prices come out first in, first out. The heap is blind to everything else: it cannot find order 42 or remove it in less than O(n). The standard fix is lazy deletion. Mark cancelled ids dead in a side set and discard them only when they reach the top. That keeps the heap valid, but it grows with dead entries until they surface, and it still needs an id map for Q1. The arena's matching engine pairs heaps keyed on (price, seq, id) with exactly such a map.",
          "code": "struct E { std::int64_t px; std::uint64_t seq, id; };\nauto worse = [](const E& a, const E& b) { return a.px != b.px ? a.px < b.px : a.seq > b.seq; };\nstd::priority_queue<E, std::vector<E>, decltype(worse)> bids(worse);   // best bid on top\nstd::uint64_t seq = 0;\nbids.push({9999, seq++, 1}); bids.push({10000, seq++, 2});      // push: O(log n)\nbids.push({10000, seq++, 3});\nstd::uint64_t first = bids.top().id;                             // Q3: O(1), earlier seq wins\nstd::unordered_set<std::uint64_t> dead{2};                       // cancel 2: no erase -- mark it\nwhile (!bids.empty() && dead.count(bids.top().id)) bids.pop();   // lazy deletion at the top\nstd::printf(\"%llu %llu %zu\\n\", (unsigned long long)first,\n            (unsigned long long)bids.top().id, bids.size());\n// 2 3 2",
          "deck": "Deck U6 · slide 23"
        },
        {
          "title": "The production book: a flat, price-indexed vector<Level> with a FIFO per level",
          "text": "The HFT answer relies on two facts: ids are integers and prices sit on a tick grid. Convert the price to ticks once, at decode. Then slot = (price − base) / tick indexes one contiguous vector<Level>, so Q2 is arithmetic, not a search, and a cached best index makes Q3 one load. The only scan is a cancel that empties the touch. Each level is an intrusive, doubly linked FIFO of pooled order nodes. The links live inside the order, so arrival is push_back and cancel is an O(1) unlink with no allocation, and price-time priority holds. Q1 is an open-addressing id → node index. Your queue position (queue_ahead from on_ack / on_queue) is the quantity in front of your node, and a reprice sends you to the back. The trap is that the array covers a band, not all prices. 65,536 one-cent slots indexed absolutely from $0.00 reach only $655.35, so the arena's NFLX near $720 writes past bid_ into ask_, the adjacent member. That is an intra-object overflow AddressSanitizer cannot see. Index against a base, bounds-check both ends, and re-base when the market walks out of the band.",
          "code": "struct Node { std::uint64_t id; std::uint32_t qty; Node *prev = nullptr, *next = nullptr; };\nstruct Level { Node *head = nullptr, *tail = nullptr; std::uint32_t total = 0;   // intrusive FIFO\n  void push(Node* o) { o->prev = tail; (tail ? tail->next : head) = o; tail = o; total += o->qty; }\n  void erase(Node* o) { (o->prev ? o->prev->next : head) = o->next;\n                        (o->next ? o->next->prev : tail) = o->prev; total -= o->qty; } };\nconst std::int64_t base = 9'900; std::vector<Level> bid(256); int best = -1;  // a BAND of ticks\nauto add = [&](Node* o, std::int64_t px) { std::int64_t i = px - base;     // (price - base) / tick\n  if (i < 0 || i >= 256) return false;                         // the band check ASan cannot see\n  bid[i].push(o); if (i > best) best = int(i); return true; };  // cached best: Q3 is one load\nNode a{1, 300}, b{2, 200}, c{3, 100};\nbool in = add(&a, 10'000) && add(&b, 10'000) && add(&c, 9'990), oob = add(&c, 72'000);\nbid[best].erase(&a);                                           // cancel by node: O(1), FIFO kept\nstd::printf(\"%d %d %lld %u %llu\\n\", in, oob, (long long)(base + best), bid[best].total, (unsigned long long)bid[best].head->id);\n// 1 0 10000 200 2",
          "deck": "Deck U6 · slides 25–30"
        },
        {
          "title": "Complexity that matters: cache misses, rings and O(1) statistics",
          "text": "Big-O hides the constant, and on the small n of a hot book the constant (memory accesses) is the whole story. When finding a value among 64 elements, a tree's six pointer hops can lose to a prefetched linear scan, and the crossover is a number to measure on your machine (bench_containers prints it for every structure above). Amortized is not bounded: push_back and rehash are O(1) amortized with an O(n) worst case, and p99.9 lives in the worst case. reserve(), pool and size tables once. The signal on top of the book follows the same rule. Keep the recent tape in a fixed ring, a vector used circularly. Give it a power-of-two capacity, index with & (N − 1) and static_assert the size, because the unsigned head − 1 − k only wraps correctly when N divides 2^64. Fold each tick into a running mean, Welford's variance and an EMA in O(1). Welford matters on prices near 100 with tiny variance, where sum(x²) − n·mean² cancels catastrophically.",
          "code": "template <class T, std::size_t N> struct Ring {                 // fixed capacity, never grown\n  static_assert((N & (N - 1)) == 0, \"N must be a power of two\");\n  std::array<T, N> a{}; std::uint64_t head = 0;\n  void push(T x) { a[head++ & (N - 1)] = x; }                   // & (N - 1), not %\n  T back(std::size_t k) const { return a[(head - 1 - k) & (N - 1)]; } };\nstruct Online { long n = 0; double mean = 0, m2 = 0, ema = 0, a = 0.2;   // O(1) per tick\n  void update(double x) { ++n; double d = x - mean; mean += d / n; m2 += d * (x - mean);\n                          ema = (n == 1) ? x : a * x + (1 - a) * ema; }\n  double var() const { return n > 1 ? m2 / (n - 1) : 0.0; } };\nRing<double, 4> r; Online o;\nfor (double x : {2., 4., 4., 4., 5., 5., 7., 9.}) { r.push(x); o.update(x); }\nstd::printf(\"%.0f %.0f %.2f %.4f %.4f\\n\", r.back(0), r.back(3), o.mean, o.var(), o.ema);\n// 9 5 5.00 4.5714 5.2910",
          "deck": "Deck U6 · slides 33–35"
        }
      ],
      "hft": {
        "text": "Session 6 makes on_book cost the same every tick: pooled memory, one structure per order-book question, and signals updated in O(1). Project Phase 2 rests on it.",
        "paragraphs": [
          "on_book runs on the client's receive thread for every snapshot, and everything in this session is about making that call cost the same every time. Start by finding the hidden new. Every std::string you build, map node you insert or vector you grow inside on_book or on_ack is an allocation: usually fast, occasionally a lock, a page fault or a walk of a fragmented free list. That list is your Phase 2 target (Project Phase 2 is due Thu Nov 5, HW 5 on Thu Nov 12). The rest of the session answers one design question: which structure answers Q1, Q2 and Q3, and what it costs on the tail.",
          "The properties you buy with a pool are the mirror image of malloc's — no lock because it is per-thread, no syscall because the memory was reserved before the session opened, O(1) because allocation is a free-list pop, bounded because you sized it for the worst tick — and the lab's bench-alloc shows the result as a distribution: the heap has a tail that appears in every run; the pool's is flat unless a timer interrupt lands in the batch. Two operational details bite every year. An ObjectPool<Order, 4096> is on the order of 128 KB, so it is a member or a static, never a local on a 512 KB thread stack. And every alloc needs its free: forget one and alloc() returns null a few thousand ticks in and the bot goes quiet without crashing — log exhaustion loudly.",
          "Then mirror the book locally so on_book can go decode → update → decide in cache. Turn the symbol into a small integer once, with an open-addressing SymMap filled at startup, and from there every access is into fixed per-symbol arrays: the touch as integer ticks, your own resting orders from a pool, their queue_ahead from on_ack and on_queue. The engine is a price-time CLOB keyed on a monotonic sequence, so the local model can be exact rather than approximate.",
          "The flat book's failure mode deserves its own sentence in your write-up. A band indexed absolutely from $0.00 corrupts the other side of your own book for any name above $655.35 — green CI, clean sanitizer, and a book showing size nobody quoted, so your bot crosses a spread that does not exist. Index against a base, bounds-check both ends on the write path, and say how you re-base when the market walks out of the band; do not just make the array bigger, because megabytes of empty slots throw away the small working set you built this for.",
          "Signals ride on the same discipline: fold microprice into an Online state per symbol, keep the recent tape in a Ring, and never loop a window on the hot path — an O(k) recompute costs nothing most of the time and blows out exactly when volatility raises the message rate. Measure everything the way HW 5 grades it: pool against new/delete and the flat book against std::map, warm-up in, machine stated, and read the tail rather than the median, because that is where a rehash or a node allocation lands."
        ],
        "example": {
          "title": "In the arena",
          "code": "// include/order_book.hpp\n// HW 5, part 2 — a fast order book (flat, price-indexed) + a fast symbol->id map.\n// side 'B'=bid, 'S'=ask.  SymMap::get returns (uint64_t)-1 if absent.\n//\n// Range warning: a flat array of N one-cent slots\n// is a BAND, not \"all prices\". 1<<16 slots indexed absolutely from $0.00 covers\n// only $0.00-$655.35, and the arena lists NFLX near $720 and META near $580 —\n// an absolute index walks off the end and, because the two side arrays are\n// adjacent members, silently corrupts the OTHER side of your own book.\nstruct Book {\n    void add(uint64_t id, char side, double px, uint32_t qty);\n    void cancel(uint64_t id);\n    double best_bid() const { return 0.0;   /* TODO(student): O(1) */ }\n    double best_ask() const { return 0.0;   /* TODO(student): O(1) */ }\n};",
          "text": "include/order_book.hpp in your starter repo is the HW 5 order-book stub, band warning included (excerpt; the bodies of add/cancel and the SymMap half are elided here). The graded contract is four functions on Book plus put/get on SymMap, and include/pool.hpp is its twin for part 1. starters/session06/bench_containers.cpp times a vector book, a list with an iterator per order, map + unordered_map, and the flat book against each other for add, cancel-by-id and best_bid. starters/session05/bench_book.cpp (make bench-book) then times YOUR book against std::map and std::unordered_map. Note: the header comments in include/ and tests/ still say \"Session 5\" and \"labs/session05.md\"; the lab is now labs/session06.md."
        }
      },
      "interview": [
        {
          "q": "Why is the general-purpose allocator a problem on a low-latency path?",
          "a": "Because its cost is unpredictable rather than merely large. It may take a lock on a shared structure, search or split blocks, coalesce on free, or fall through to brk/mmap and a first-touch page fault in the kernel. The median call is around ten nanoseconds, which is why the mean looks fine, but the occasional slow call — hundreds of nanoseconds to microseconds — lands on a busy tick and becomes your p99.9, and you do not control when it happens.",
          "level": "warm-up",
          "skill": "cpp.raw-allocation"
        },
        {
          "q": "What does “amortized O(1)” mean for vector::push_back, and why might that not be good enough?",
          "a": "Most pushes are a single store; when capacity runs out the vector allocates a larger buffer and moves every element, which is O(n), and averaging that over the whole sequence gives constant cost per push. On a latency path you are graded on the worst operation, not the average: that one reallocation is an allocation plus an O(n) copy landing on an arbitrary tick. reserve() the capacity up front and the spikes disappear.",
          "level": "warm-up",
          "skill": "perf.complexity-in-cache-terms"
        },
        {
          "q": "Sketch a fixed-size object pool and state the complexity of alloc and free.",
          "a": "One contiguous slab of N slots, each big enough and aligned for T and at least one pointer wide, plus a head pointer to a singly linked free list threaded through the unused slots — so the list costs no extra memory. alloc pops the head, free pushes the slot back; both O(1), no search, no lock, no syscall, and LIFO reuse keeps slots cache-warm. Exhaustion returns null, which the caller must handle and should log loudly. Practically the pool is a member or a static, because a few thousand slots is well over 100 KB.",
          "level": "core",
          "skill": "perf.object-pool"
        },
        {
          "q": "What does placement new do, and what obligation does it create?",
          "a": "new (ptr) T{args...} constructs a T in storage you already own: it runs the constructor and allocates nothing. The obligation is symmetry — no delete will ever be called for it, so you must call p->~T() explicitly before returning the slot to the pool, and calling delete instead would free memory the heap never handed out. You are also responsible for the storage being correctly sized and aligned for T, which is why slots are declared alignas(T). The explicit destructor ends the object's life; it frees nothing.",
          "level": "core",
          "skill": "cpp.placement-new"
        },
        {
          "q": "Your book must answer Q1 (an order by id), Q2 (a level by price) and Q3 (the best price). What does a std::vector, a std::list, a std::map and a std::priority_queue each give you, and what do you end up building?",
          "a": "A vector is contiguous and fast to scan. Kept sorted by price, it answers Q2 by binary search and Q3 with front(), but a new level is an O(n) insert, Q1 is a linear scan because the array is sorted by price and not by id, and its iterators die on reallocation. A list has stable iterators, so with an id → iterator map Q1 becomes an O(1) unlink, but every search is a pointer chase and every insert a malloc. A map keyed on price answers Q2 in O(log n) and Q3 with begin()/rbegin(), at the cost of a node allocation per level and a cache miss per hop. A heap answers Q3 with top() but cannot find or erase an arbitrary order, so you delete lazily. No single sequence has both sort orders, so you build one structure per question: a flat price-indexed array of levels with a cached best index (Q2, Q3), an intrusive FIFO per level for price-time priority, and an open-addressing id → node table (Q1), all fed from a pool.",
          "level": "core",
          "skill": "cpp.stl-containers"
        },
        {
          "q": "Why size an open-addressing hash table to a power of two, and what is the worst thing std::unordered_map can do to you on a hot path?",
          "a": "A power-of-two capacity makes the wrap hash & (size - 1) instead of a modulo — one AND instead of an integer division — and the probe advance i = (i + 1) & mask. Keep the load factor under roughly 0.7 and size it once, because probe runs lengthen sharply past that. The worst thing unordered_map does is rehash: an unbounded O(n) reallocation at a moment you did not choose. The second is chaining — each bucket is a list of separately allocated nodes, so a collision is a pointer chase and a likely miss — and keyed on std::string, every lookup builds and hashes a string first.",
          "level": "core",
          "skill": "perf.open-addressing-hash"
        },
        {
          "q": "Why can a flat price-indexed array beat std::map for an order book even though the map is O(log n)?",
          "a": "Because prices sit on a tick grid, so tick - base_tick is an exact integer index and the lookup is arithmetic instead of a search. The map's pointer hops are each a potential cache miss at around 100 ns; the array is one indexed load into a small, dense working set. Add and cancel are O(1), the touch is a cached slot read with zero traversal, and matching walks adjacent slots sequentially. The only scan is a cancel that empties the touch — rare, and cache-friendly.",
          "level": "core",
          "skill": "trading.flat-order-book"
        },
        {
          "q": "How do you track your own queue position, and why does it matter?",
          "a": "At each price the venue holds a FIFO keyed on a monotonic sequence number, so your position is the remaining quantity of every order that arrived before yours. The arena hands it to you: on_ack carries queue_ahead and level_qty when your order rests, and on_queue updates them as fills and cancels ahead of you land; queue_ahead == 0 means you are next. It matters because fill probability is a function of the size in front of you, and because a reprice resets it — cancel and re-post puts you at the back — so a quote adjustment is a real, measurable cost.",
          "level": "core",
          "skill": "trading.queue-position"
        },
        {
          "q": "Your flat book is indexed absolutely from $0.00 with 65,536 one-cent slots. A name lists at $720, nothing crashes, sanitizers are clean and CI is green. What is happening, and how do you find it?",
          "a": "The array is a $655.35-wide band, so $720 indexes past the end. Because the bid and ask arrays are adjacent members of one object, the write lands on your own other side — a bid at $719.98 is tick 71,998, 6,462 slots past bid_'s end, so it adds size to the ask side at $64.62. The book then shows resting size no venue sent, and the bot crosses a spread that does not exist. ASan cannot see it because it instruments boundaries between allocations, not between two members of one object, and tests that quote near $100 never reach the edge. Fix: index against a base tick set from the first price seen, bounds-check both ends on every write, and re-base or reject-and-log out-of-band prices. To catch it, diff against a slow map-based shadow book on a replayed tape and stop at the first divergence.",
          "level": "senior",
          "skill": "trading.flat-order-book"
        },
        {
          "q": "You put a pmr::vector on a monotonic_buffer_resource inside on_book and call release() at the end of the tick. Where are the traps?",
          "a": "Lifetime order first: release() reclaims the whole slab, so every container that borrowed from it must be destroyed before the reset — otherwise its destructor touches memory the resource has already handed back and a later tick overwrites live data. The idiom is to scope the scratch container in an inner block and release after it closes. Second, overflow: with the default upstream, a working set bigger than the buffer silently falls back to the heap, so you are allocating on the hot path again with nothing in the source to show it; pass null_memory_resource() as upstream so overflow throws instead.",
          "level": "senior",
          "skill": "perf.arena-allocator"
        }
      ]
    },
    {
      "n": 7,
      "focus": "Concurrency: atomics to lock-free",
      "tagline": "Hand every tick from the socket thread to the strategy with two atomic operations and no lock — and prove it with a happens-before argument and a clean ThreadSanitizer run.",
      "concepts": [
        {
          "title": "Threads share memory, and a data race is undefined behaviour",
          "text": "A std::thread is an independent instruction stream in the same address space: stacks are private, the heap and globals are shared, and the OS interleaves threads however it likes. When two threads touch the same location, at least one writes, and nothing orders them, that is a data race and the standard promises nothing at all. ++counter is load, add, store: at -O0 two threads of a million increments lose updates differently every run, and at -O2 the same code prints exactly 2,000,000 because the optimiser, assuming no race, folded each loop into one add. The right answer from a racy program is the scariest outcome. std::atomic fixes the count, and volatile does not: it stops the compiler caching a value and creates no ordering at all.",
          "code": "long racy = 0; std::atomic<long> safe{0};\nauto work = [&] { for (int i = 0; i < 100000; ++i) {\n    ++racy;                                                    // DATA RACE -> UB\n    safe.fetch_add(1, std::memory_order_relaxed); } };         // atomic, unordered\nstd::thread t1(work), t2(work); t1.join(); t2.join();\nstd::cout << safe.load() << ' ' << (racy <= 200000) << ' '\n          << safe.is_lock_free() << '\\n';\n// 200000 1 1     -- safe is exact; racy is not even well-defined",
          "deck": "Deck U7 · slides 5–6, 9"
        },
        {
          "title": "Happens-before, and the acquire/release handoff",
          "text": "Correctness is not about time, it is about the happens-before relation: if A happens-before B, B sees A's writes, and otherwise there is no guarantee. Program order gives sequenced-before inside a thread; a release store synchronizes-with an acquire load that reads its value; thread start, join and a mutex unlock/lock pair make edges too; and the relation is transitive. Nothing else makes an edge — not volatile, not sleep(). The pattern behind every lock-free handoff is four numbered steps: write the payload, release-store a flag, acquire-load the flag, read the payload. (2) synchronizes-with (3), so (1) happens-before (4), with no lock anywhere. Make both orders relaxed and ThreadSanitizer reports the race.",
          "code": "int payload = 0; std::atomic<bool> ready{false};\nstd::thread prod([&] { payload = 42;                            // (1) write the data\n  ready.store(true, std::memory_order_release); });             // (2) release: publishes (1)\nstd::thread cons([&] {\n  while (!ready.load(std::memory_order_acquire)) { }            // (3) acquire\n  std::printf(\"%d\\n\", payload); });                             // (4) guaranteed to see (1)\nprod.join(); cons.join();\n// 42",
          "deck": "Deck U7 · slides 7, 12"
        },
        {
          "title": "memory_order: pay only for what you can prove",
          "text": "Every atomic operation takes an ordering. relaxed is atomic but orders nothing else — right for a free-running counter, never for handing data over. acquire/release is the workhorse pair. seq_cst, the default, adds one global order over all seq_cst operations and costs the strongest fences. The store-buffer litmus test shows why the choice is not academic: each thread stores its flag then loads the other's, and with relaxed the Apple M4 saw both loads return 0 in 199,793 of 200,000 trials, because a core's store waits in its buffer while its later load runs ahead. acquire/release does not forbid that outcome — only seq_cst does. Not seeing a reordering on one CPU proves nothing; reason from the model.",
          "code": "int both = 0;\nfor (int t = 0; t < 2000; ++t) {\n  std::atomic<int> x{0}, y{0}; int r1 = -1, r2 = -1;\n  std::thread a([&] { x.store(1); r1 = y.load(); });   // seq_cst: the default\n  std::thread b([&] { y.store(1); r2 = x.load(); });\n  a.join(); b.join(); both += (r1 == 0 && r2 == 0);\n}\nstd::printf(\"both zero under seq_cst: %d of 2000\\n\", both);\n// both zero under seq_cst: 0 of 2000   -- relaxed on an M4: 199,793 of 200,000",
          "deck": "Deck U7 · slides 10–11"
        },
        {
          "title": "A lock on the hot path is a tail bomb; CAS is the lock-free atom",
          "text": "Locks are the easy, correct way to get mutual exclusion — lock_guard or scoped_lock, never lock()/unlock() by hand — and a mutex barely dents the median: in the deck's four-thread counter it even beats an atomic at p50 (4.6 ns against 37). It detonates p99.9, 3–13x worse over five runs, because a contended loser sleeps on a futex and the scheduler decides when it wakes; a descheduled holder is a priority inversion with no bound. Every general lock-free structure sits instead on compare-and-swap: swap only if the value still equals what you expected, and on failure expected is refreshed so you recompute and retry — nobody is parked by the kernel. CAS compares bits, not history, so a recycled node can fool it (ABA), and the fixes (version tags, hazard pointers, epochs) are all memory-reclamation schemes.",
          "code": "std::atomic<int> v{7}; int tries = 0;\nint expected = v.load(), desired;\ndo { desired = expected * 2; ++tries; }        // recompute INSIDE the loop\nwhile (!v.compare_exchange_weak(expected, desired));   // swap only if unchanged\nint stale = 99;                                // a CAS with a stale expected FAILS\nbool ok = v.compare_exchange_strong(stale, 0); // ...and refreshes `stale`\nstd::cout << v.load() << ' ' << tries << ' ' << ok << ' ' << stale << '\\n';\n// 14 1 0 14",
          "deck": "Deck U7 · slides 14–17"
        },
        {
          "title": "The SPSC ring: one writer per index, two lines that make it correct",
          "text": "Single producer, single consumer: the producer is the only writer of tail_ and the consumer the only writer of head_, so no CAS is needed at all — push has no loop and no retry, which makes it wait-free, and nothing is recycled, so there is no ABA. The counters are monotonic and the capacity a power of two, so the slot is pos & mask and tail - head stays right across unsigned wrap. The producer loads its own tail_ relaxed, acquire-loads head_ to see the slots the consumer freed, writes the payload first, then release-stores tail_ + 1. Those last two lines are the whole correctness argument. And each index owns a 64-byte line, because the two cores write them on every operation: sharing a line is correct but silently slow, and it is 2 of the 10 HW 6 points.",
          "code": "struct Ring { explicit Ring(std::size_t cap) : mask_(cap - 1), buf_(cap) {}\n  bool push(std::uint64_t v) {                          // PRODUCER thread only\n    auto t = tail_.load(std::memory_order_relaxed);     // mine: nobody else writes it\n    if (t - head_.load(std::memory_order_acquire) == buf_.size()) return false;\n    buf_[t & mask_] = v;                                // (1) payload first\n    tail_.store(t + 1, std::memory_order_release); return true; }  // (2) publish\n  alignas(64) std::atomic<std::size_t> tail_{0}, head_{0};\n  std::size_t mask_; std::vector<std::uint64_t> buf_;\n};\nRing r(4); int n = 0; for (int i = 0; i < 6; ++i) n += r.push(i);\nstd::printf(\"%d accepted, 2 refused: full\\n\", n);  // pop() is yours in the lab\n// 4 accepted, 2 refused: full",
          "deck": "Deck U7 · slides 19–20"
        },
        {
          "title": "Bounded is a feature: back-pressure",
          "text": "When the ring is full, push returns false — and that is not an error path, it is the one place in the design where you choose what to sacrifice: drop the newest, drop the oldest, or coalesce. For book snapshots, coalesce, since only the latest touch per symbol matters. Never spin on a full ring in the socket thread: you stop reading the wire, which is a lock's worst property back again. Unbounded queues are a trap that turns a slow consumer into a memory-and-latency blowout, and head-of-line blocking means one fat message delays every tick behind it, so keep items small, fixed-size and POD. Count the rejected pushes in a relaxed atomic: that counter is your storm detector for the Phase 3 report.",
          "code": "std::array<int, 4> q{}; std::size_t head = 0, tail = 0; int latest = 0;\nstd::atomic<std::uint64_t> dropped{0};\nauto push = [&](int v) {                            // bounded: false when full\n  if (tail - head == q.size()) { latest = v;        // coalesce: keep the newest\n    dropped.fetch_add(1, std::memory_order_relaxed); return false; }\n  q[tail++ & 3] = v; return true; };\nint accepted = 0;\nfor (int tick = 1; tick <= 7; ++tick) accepted += push(tick);\nstd::printf(\"%d %d %d dropped=%llu\\n\", accepted, latest, q[head & 3],\n            (unsigned long long)dropped.load());\n// 4 7 1 dropped=3     -- 4 queued, 3 rejected and counted, tick 7 kept as the latest",
          "deck": "Deck U7 · slides 21–22"
        },
        {
          "title": "Across processes: the shared-memory ring, and C++20 coordination",
          "text": "The same ring works between two processes if it lives in a mapping both see: shm_open plus ftruncate plus mmap(MAP_SHARED) gives two page tables over one set of physical pages, and lock-free atomics obey the same memory model across them — one release store, one acquire load, no kernel in the fast path. That is Project Phase 4's feed/strategy split: a crash in the feed cannot take the strategy down, and each process pins its own core. Three rules change: no pointers (an address means something in one process only — store indices), no std::string or vector inside (they own heap memory in one process), and only always-lock-free atomics, because a hidden lock lives in one address space. Off the hot path, C++20 ships the coordination you used to hand-roll: a std::latch start gate, atomic::wait/notify to sleep without a condition variable, and std::jthread with a stop_token for clean shutdown.",
          "code": "struct ShmRing {                                      // POD: no pointers, no heap\n  static constexpr std::uint32_t CAPACITY = 1024;     // power of two\n  static_assert(std::atomic<std::uint32_t>::is_always_lock_free);\n  void init() { head.store(0); tail.store(0); }       // creator, once\n  bool push(std::uint64_t v) { std::uint32_t t = tail.load(std::memory_order_relaxed);\n    if (t - head.load(std::memory_order_acquire) == CAPACITY) return false;\n    buf[t & (CAPACITY - 1)] = v; tail.store(t + 1, std::memory_order_release); return true; }\n  alignas(64) std::atomic<std::uint32_t> head, tail;  // consumer | producer writes\n  alignas(64) std::uint64_t buf[CAPACITY];            // inline data\n};\nstatic ShmRing r; r.init(); std::printf(\"%zu %d\\n\", sizeof r, int(r.push(42)));\n// 8320 1",
          "deck": "Deck U7 · slides 24–26"
        }
      ],
      "hft": {
        "text": "Your bot already has two threads; this session makes the handoff between them correct, lock-free and bounded — first across threads (Phase 3), then across processes (Phase 4).",
        "paragraphs": [
          "You already have two threads whether you planned it or not. IXWebSocket reads the socket and decodes on its own background receive thread, then calls on_book there; Project Phase 3 moves your strategy onto its own std::jthread. The moment a tick crosses that boundary you are in the C++ memory model, and “it worked on my laptop” is not evidence: races are timing-dependent, so they pass on a quiet machine and fail under load — precisely when the arena is grading you.",
          "The Session 7 pipeline is fixed in shape. The receive thread copies the tick into a small POD — a symbol id from your symbol map, never a std::string — pushes it into your HW 6 ring and returns. The strategy thread drains the ring, keeps only the latest tick per symbol, and decides. A full ring drops and counts; it never blocks the wire. One gotcha from the deck: the client's latency helpers only time orders sent inside on_book, so decide() must record now - t.recv itself.",
          "Lock-free is not “faster locks”, it is a different guarantee: no thread can be stalled by another thread's scheduling. That is why it fixes the tail rather than the mean. The deck's queue benchmark makes it concrete on a laptop with no pinning: the SPSC ring sits at 83–125 ns p50 against 0.2–1.3 µs for a mutex-plus-deque, and its p99.9 stays far below the mutex queue's even when scheduler noise hits both.",
          "Audit the client too, not only your code. The reference client's book cache and latency histogram each take a std::mutex — the receive thread locks one on every book_snapshot, and anything else that reads the cache contends with it. Know every lock on your path, and keep the ones you cannot remove off the tick.",
          "The correctness bar is tool-enforced, not argued: one producer, one consumer, millions of items, nothing lost or reordered, and the same run silent under -fsanitize=thread in its own binary. If TSan flags a ring that passes every other test, you weakened a cross-thread acquire/release to relaxed or read the payload before checking the index — fix the pairing, never add a mutex or a suppression. And the ring is safe for exactly one producer and one consumer; a second pusher is undefined behaviour that can still give a clean run on a lucky day."
        ],
        "example": {
          "title": "In the arena",
          "code": "// hft/cpp_client/src/arena_client.cpp — dispatch(), on the receive thread\n        {\n            std::lock_guard<std::mutex> lk(book_mtx_);\n            books_[bv.symbol] = bv;\n        }\n        on_book_snapshot(bv, recv_time);",
          "text": "hft/cpp_client/src/arena_client.cpp — the reference client locks book_mtx_ on the receive thread for every book_snapshot before it calls your handler, and hft/cpp_client/include/arena_client.hpp declares that mutex next to the latency histogram's. Phase 3 is where you decide which locks stay on the path: push a POD tick into your ring from on_book and let the strategy thread do the rest."
        }
      },
      "interview": [
        {
          "q": "What is a data race, and why is “it printed the right number” not evidence that there isn't one?",
          "a": "A data race is two threads accessing the same memory location, at least one writing, with no happens-before edge ordering them. The standard makes that undefined behaviour, not “a stale value”: the compiler is allowed to transform the code as if the race cannot happen. The classic demonstration is two threads incrementing a plain long a million times each — at -O0 you lose updates and get a different total every run, at -O2 you get exactly 2,000,000 because the optimiser folded each loop into one add. The correct-looking answer is still a race; only a happens-before argument or ThreadSanitizer tells you otherwise.",
          "level": "warm-up",
          "skill": "cpp.data-races"
        },
        {
          "q": "What does compare_exchange do, why is it always written in a loop, and when do you use weak versus strong?",
          "a": "It atomically compares the object with an expected value and, only if they are equal, replaces it with the desired value; it returns whether it succeeded and, on failure, overwrites expected with the value actually seen. It lives in a loop because failure means someone else changed the object, so you recompute your update from the refreshed value and try again — the update must be recomputed inside the loop or you keep proposing a value derived from stale data. weak may fail spuriously (a load-linked/store-conditional interrupted on Arm), so it is the cheap choice inside a retry loop; strong fails only on a genuine mismatch and suits a one-shot attempt you branch on.",
          "level": "warm-up",
          "skill": "cpp.compare-and-swap"
        },
        {
          "q": "Explain the acquire/release pattern, and say when memory_order_relaxed is a bug.",
          "a": "The producer writes a plain payload and then release-stores an atomic flag; the consumer acquire-loads the flag and, once it observes the stored value, reads the payload. The release store synchronizes-with the acquire load, so everything sequenced before the store happens-before everything sequenced after the load, and the payload is guaranteed visible. relaxed is right when you need atomicity but no ordering — a free-running counter of dropped ticks whose total is read later. It is a bug whenever the atomic signals that other memory is ready, because relaxed creates no happens-before edge: the consumer can see the flag set while the payload writes are still invisible, and TSan will report it.",
          "level": "core",
          "skill": "cpp.atomics-memory-order"
        },
        {
          "q": "Why does an uncontended mutex look cheap in a benchmark and still ruin a latency tail in production?",
          "a": "Uncontended, lock and unlock are a couple of atomic operations — nanoseconds, which is what a naive benchmark measures; in a contended burst the holder can even win the median by running many uncontended acquisitions in a row. Contended, the loser blocks in the kernel on a futex: a context switch and a scheduler wake-up, microseconds, and unbounded if a descheduled thread holds the lock (priority inversion). Contention correlates with market activity, so the expensive case lands on exactly the ticks you needed to win. The lab's lock_tail measurement shows it: mutex p50 below the atomic's, p99.9 several times worse. Locks are correct; they belong off the tick path.",
          "level": "core",
          "skill": "perf.lock-tail-cost"
        },
        {
          "q": "In an SPSC ring's push, which memory orders go where, and why?",
          "a": "The producer loads its own tail_ relaxed — nobody else writes it, so relaxed is the correct order, not a shortcut. It acquire-loads head_, so it observes the consumer's release store and knows the slot it is about to overwrite has really been read. It writes the payload into buf_[t & mask], then release-stores tail_ + 1, so the slot write cannot be reordered after the publication — which is what guarantees the consumer never reads a slot before its data is visible. pop() is the mirror: own head_ relaxed, acquire tail_, read, release head_. Getting the release on the published index wrong is the classic bug, and it often still passes on x86.",
          "level": "core",
          "skill": "perf.spsc-ring"
        },
        {
          "q": "Why must the ring's capacity be a power of two, and why are the two indices alignas(64)?",
          "a": "A power-of-two capacity makes the wrap pos & (cap - 1) instead of pos % cap, replacing an integer division with a one-cycle AND on the hottest line of the queue; and with monotonic unsigned counters, tail - head stays correct across wraparound because the difference never exceeds the capacity. The alignment is about false sharing: the producer writes tail_ on every push and the consumer writes head_ on every pop, so if they share a 64-byte line the two cores invalidate each other's copy on every operation and the queue slows down the harder you drive it — correct, but silently serialised. A third aligned group keeps the read-only capacity, mask and buffer pointer off both hot lines.",
          "level": "core",
          "skill": "perf.data-layout"
        },
        {
          "q": "The ring is full during a message storm. What are your options, and which one fits market data?",
          "a": "Spin until there is room, grow the buffer, drop the newest, drop the oldest, or coalesce. Spinning is the worst on the socket thread: you stop reading the wire, which reintroduces a lock's blocking behaviour. Growing without bound turns a latency problem into a memory problem and hides the slow consumer until the machine swaps. For top-of-book snapshots coalescing is right — a newer snapshot supersedes an older one, so keeping only the latest per symbol stays current and bounded. Fills and acks are not idempotent, so they cannot be dropped; they belong on a separately sized queue where full is an alert. Either way, count the rejects in a relaxed atomic and report them.",
          "level": "core",
          "skill": "perf.back-pressure"
        },
        {
          "q": "You want the same lock-free ring between two processes rather than two threads. What changes, and what does not?",
          "a": "The synchronisation does not change: you create the region with shm_open, size it with ftruncate and mmap it MAP_SHARED into both processes, and the atomics work across it because cache coherence is a hardware property, not a process property — one release store and one acquire load give the same happens-before edge spanning two address spaces. What changes is the layout contract. No pointers, because an address is only meaningful in one process, so you store indices; no std::string or std::vector, because they own heap memory in one process; and only always-lock-free atomics, which is why the ring static_asserts is_always_lock_free — a lock-based atomic's hidden lock lives in one address space. The creator calls init() exactly once, before the other side attaches.",
          "level": "senior",
          "skill": "perf.shared-memory-ring"
        },
        {
          "q": "What is the ABA problem, and does it affect an SPSC ring buffer? Which progress guarantee does its push give?",
          "a": "ABA is when a CAS succeeds because the value it compares has returned to its original bit pattern while the structure changed underneath — classically a lock-free stack whose popped node was freed and pushed back, so the old head pointer looks valid but its next field is stale. The fixes (a version tag CAS'd with the pointer, hazard pointers, epochs) are memory-reclamation schemes. It does not affect an SPSC ring: the ring does no CAS, and its indices are monotonic counters rather than recycled pointers. And because push has no retry loop — a bounded number of its own steps, always — it is wait-free, not merely lock-free; lock-free only promises that some thread progresses.",
          "level": "senior",
          "skill": "cpp.compare-and-swap"
        }
      ]
    },
    {
      "n": 8,
      "focus": "The wire & the machine",
      "tagline": "Parse a wire message in tens of nanoseconds without allocating, never block on a socket, and know which machine-level knobs buy the last microseconds.",
      "concepts": [
        {
          "title": "FIX: tag=value, the lingua franca of order entry",
          "text": "FIX is text: an integer tag, '=', the value, then the SOH byte (0x01), with a session layer of logon, heartbeats, sequence numbers and resends on top. BeginString (8=) and BodyLength (9=) come first on purpose, so a reader knows exactly where the message ends, and CheckSum (10=) is the byte sum of everything before it, mod 256. It is ubiquitous for orders and rare for fast market data, because reading it means scanning every byte and converting ASCII digits to numbers. HW 7 part 1 is that loop done properly: one forward pass over tags 11/55/54/38/44, no allocation, the ClOrdID kept as a view into the buffer, and false on malformed input — and no assumption about the order of body tags.",
          "code": "const char* msg = \"35=D\\00155=NVDA\\00154=1\\00138=200\\00144=182.50\\001\";\nfor (const char* p = msg; *p; ) {\n  int tag = 0;\n  while (*p != '=') tag = tag * 10 + (*p++ - '0');    // digit math, per byte\n  const char* v = ++p;                                // skip '='\n  while (*p && *p != '\\001') ++p;                     // scan to the SOH\n  if (tag == 55 || tag == 44) std::printf(\"%d=%.*s \", tag, int(p - v), v);\n  if (*p) ++p;                                        // skip the SOH\n}\nstd::puts(\"\");\n// 55=NVDA 44=182.50",
          "deck": "Deck U8 · slides 5, 29"
        },
        {
          "title": "Binary feeds: decode is a load and a byte swap",
          "text": "Fast venues abandon text. ITCH/OUCH-style messages are fixed-width — an 18-byte add-order is type, id, side, quantity and price at known offsets — prices are scaled integers (1825000 means 182.50), and the wire is big-endian. So decoding is a bounds-and-type check, then a memcpy and a byte swap per field: no delimiter scan, no atoi, no allocation. Use memcpy, not reinterpret_cast of a packed struct onto the buffer: the cast is alignment and strict-aliasing undefined behaviour, and an 8-byte memcpy compiles to one load anyway. When you want a schema instead of hand-rolled offsets, SBE is this same layout with codegen; FlatBuffers reads fields in place; Protobuf must decode into objects first.",
          "code": "inline std::uint32_t be32(const std::uint8_t* p) {\n  std::uint32_t v; std::memcpy(&v, p, 4); return __builtin_bswap32(v); }\nint main() {       // wire: [type 1][id 8][side 1][qty 4][px 4] = 18 bytes, big-endian\n  std::uint8_t w[18]{}; w[0] = 'A'; w[9] = 'B'; std::size_t n = sizeof w;\n  std::uint32_t q = __builtin_bswap32(100), px = __builtin_bswap32(1825000);\n  std::memcpy(w + 10, &q, 4); std::memcpy(w + 14, &px, 4);   // as the venue sent it\n  if (n < 18 || w[0] != 'A') return 1;                       // bounds + type FIRST\n  std::printf(\"%c qty=%u px=%.2f\\n\", char(w[9]), be32(w + 10), be32(w + 14) / 10000.0);\n}\n// B qty=100 px=182.50     -- no delimiter scan, no atoi, no allocation",
          "deck": "Deck U8 · slides 6, 27"
        },
        {
          "title": "TCP for orders, UDP multicast for data — and the sequence number",
          "text": "Orders and market data make opposite transport choices. Order entry uses TCP because an order must never be lost — and TCP's failure mode is delay: one lost segment stalls every byte behind it (head-of-line blocking), and Nagle coalesces small writes unless you set TCP_NODELAY. Market data is UDP multicast: the venue sends each packet once and the switches fan it out, whole datagrams or nothing, and UDP's failure mode is loss, which shows up as a sequence gap. Venues publish identical A/B feeds on separate paths; you take whichever copy lands first. Track the next expected sequence number: lower is a duplicate (the slower A/B copy), higher is a gap, and until snapshot-plus-increment recovery completes the book is stale — stop quoting that symbol.",
          "code": "struct SeqTracker { enum Verdict { APPLY, DUP, GAP };\n  std::uint64_t next = 1; bool stale = false;\n  Verdict on_msg(std::uint64_t seq) {\n    if (seq < next) return DUP;                      // the slower A/B copy\n    if (seq > next) { stale = true; return GAP; }    // loss: stop quoting\n    ++next; return APPLY; } };\nSeqTracker t; const char* v[] = {\"APPLY\", \"DUP\", \"GAP\"};\nfor (std::uint64_t s : {1, 2, 2, 3, 5}) std::printf(\"%s \", v[t.on_msg(s)]);\nstd::printf(\"| next=%llu stale=%d\\n\", (unsigned long long)t.next, int(t.stale));\n// APPLY APPLY DUP APPLY GAP | next=4 stale=1",
          "deck": "Deck U8 · slides 7–8"
        },
        {
          "title": "Framing inside a non-blocking read loop",
          "text": "A TCP socket delivers bytes, not messages: one recv can return half a message or three, and assuming otherwise is the most common networking bug in student code. Length-prefix framing reads the header, waits for the whole body, dispatches a view (no copy), and returns how much it consumed so the caller keeps the partial tail — and it validates the length against a maximum before trusting it, because a corrupt length is a buffer overrun. The framer runs inside a readiness loop: the fd is O_NONBLOCK, poll/epoll/kqueue says it is readable, and the handler drains into one buffer allocated once until recv returns EAGAIN, which means “drained”, not an error. Edge-triggered mode fires once, so stopping early strands the rest of the bytes with no new wake-up.",
          "code": "using Handler = void (*)(const std::uint8_t*, std::size_t);\nstd::size_t drain_frames(const std::uint8_t* buf, std::size_t len, Handler on_msg) {\n  std::size_t off = 0; while (len - off >= 2) {     // [u16 big-endian len][payload]\n    std::size_t n = std::size_t(buf[off]) << 8 | buf[off + 1];\n    if (len - off - 2 < n) break;                   // partial: wait for more\n    on_msg(buf + off + 2, n); off += 2 + n; }       // a view, no copy\n  return off; }                                     // caller keeps [off, len)\nconst std::uint8_t in[] = {0,3,'a','b','c', 0,4,'d','e'};   // one recv: 1.5 frames\nauto used = drain_frames(in, sizeof in, [](const std::uint8_t* p, std::size_t n) {\n  std::printf(\"%.*s \", int(n), (const char*)p); });\nstd::printf(\"| used=%zu leftover=%zu\\n\", used, sizeof in - used);\n// abc | used=5 leftover=4     -- the partial second frame waits for the next read",
          "deck": "Deck U8 · slides 9, 11–12"
        },
        {
          "title": "Read three fields, not thirty — and a send path with no snprintf",
          "text": "A general JSON parser reads every field, builds a heap tree and copies strings; the hot path needs three numbers. The arena's book_snapshot carries bids and asks as arrays of [price, qty] with the touch at index 0, plus mid_price — there is no bid or ask key — so the targeted extract finds \"bids\":[[ and strtods what follows, over a string_view of the socket buffer. It assumes the venue's compact, well-formed JSON, so validate the shape once at connect. The send side is the mirror: you only ever emit a few shapes, so write them straight into a reused buffer — no snprintf parsing its format string on every call, no std::string. The number-to-text step is HW 7 part 2 (u64toa, correct on 0 and UINT64_MAX, faster than std::to_string). And do not batch the hot path: every message held to batch is latency you added.",
          "code": "std::string_view f = R\"({\"type\":\"book_snapshot\",\"symbol\":\"AAPL\",)\"\n  R\"(\"bids\":[[309.90,4.0],[309.80,7.0]],\"asks\":[[310.30,9.0]],\"mid_price\":310.10})\";\nauto num_after = [f](std::string_view key) {          // no DOM, no allocation\n  std::size_t k = f.find(key);\n  if (k == f.npos) return 0.0;                        // absent or empty side\n  return std::strtod(f.data() + k + key.size(), nullptr); };   // parse in place\nstd::printf(\"%.2f %.2f %.2f\\n\", num_after(\"\\\"bids\\\":[[\"),\n            num_after(\"\\\"asks\\\":[[\"), num_after(\"\\\"mid_price\\\":\"));\n// 309.90 310.30 310.10     -- the touch on each side and the mid; the rest skipped",
          "deck": "Deck U8 · slides 13–15"
        },
        {
          "title": "The memory wall, SIMD and prefetch: let the compiler go first",
          "text": "On the hot path you are memory-bound: an L1 hit is about four cycles, a DRAM miss 200 or more, memory moves in 64-byte lines, and a TLB miss walks the page table. Linear access lets the hardware prefetcher run ahead; pointer chasing defeats it. An AVX2 register holds eight floats, and the right order is: build -O3 -march=native, read the vectorization report (clang -Rpass-missed=loop-vectorize, GCC -fopt-info-vec), and hand-write intrinsics only when it refuses. The lab's punchline: -O3 makes the kernel 6x faster and the report still says “loop not vectorized”, because an in-order float sum cannot be split across lanes without changing the answer — -ffast-math vectorizes it and moves the checksum. __builtin_prefetch is a hint: no fault, no stall, a distance you tune by measurement.",
          "code": "std::vector<float> x(1 << 16);\nfor (std::size_t i = 0; i < x.size(); ++i) x[i] = 1.0f / float(i + 1);\nfloat in_order = 0;                                   // what -O3 must preserve\nfor (float v : x) in_order += v;\nfloat lane[8] = {};                                   // what 8 SIMD lanes would compute\nfor (std::size_t i = 0; i < x.size(); ++i) lane[i % 8] += x[i];\nfloat lanes = 0; for (float l : lane) lanes += l;\nstd::printf(\"%s\\n\", in_order == lanes ? \"same\" : \"different: FP + is not associative\");\n// different: FP + is not associative",
          "deck": "Deck U8 · slides 18–19"
        },
        {
          "title": "Get the kernel out of the way, own the core, and stamp the wire",
          "text": "A syscall is a mode switch — typically hundreds of nanoseconds, more under load — so the cheapest one on the hot path is the one you never make: pre-allocate, reuse buffers, never log from on_book. Sleeping in epoll_wait adds a wake-up and jitter, so HFT busy-polls a dedicated core. Kernel bypass skips the generic stack: DPDK owns the NIC from user space, Onload/ef_vi accelerates ordinary sockets via LD_PRELOAD, AF_XDP is an in-kernel fast path, and io_uring batches syscalls without bypassing anything. Then take control of the machine: pin the hot thread to an isolated core (pinning buys variance, not speed — macOS has no affinity API, so skip it and say so), keep memory on the NIC's NUMA node, and pre-fault and mlock hot memory so no first-touch fault lands mid-race. Cross-box latency needs PTP-synchronised clocks and NIC hardware timestamps; past that, FPGAs.",
          "code": "constexpr std::size_t kBytes = 1 << 20, kPage = 4096;   // at startup, not in on_book\nchar* hot = static_cast<char*>(std::malloc(kBytes));\nstd::size_t touched = 0;\nfor (std::size_t off = 0; off < kBytes; off += kPage) {  // first touch = page fault\n  hot[off] = 0; ++touched; }                             // ...paid now, before the open\nstd::printf(\"pre-faulted %zu x 4 KiB before SESSION_OPEN\\n\", touched);\nstd::free(hot);\n// pre-faulted 256 x 4 KiB before SESSION_OPEN",
          "deck": "Deck U8 · slides 20–22, 30"
        }
      ],
      "hft": {
        "text": "Your Session 7 ring is the seam between the wire and the strategy; this session makes the wire side of it cheap, then tunes the machine it runs on.",
        "paragraphs": [
          "The wire you actually speak in this arena is JSON over WebSocket — convenient, and the opposite of what fast venues do. Every message is a discriminated union keyed on a \"type\" field (book_snapshot, order_ack, place_order, cancel_order…), carried by IXWebSocket and decoded in the reference client by nlohmann/json: json::parse on the whole frame, then field lookups and m[\"bids\"][0][0] for the touch. That is your baseline, and beating it offline is Project Phase 5.",
          "Codec cost is not a footnote in tick-to-trade, it is a large slice of it. The deck's reference measurement on an Apple M4 over 4,057 replayed snapshots is p50 33.4 µs, p99 52.7 µs, p99.9 72.9 µs for the reference client; your numbers will differ, so your baseline is whatever your machine prints first on your tape. Swap on_book's decode for the targeted extract, hand-roll place_order and cancel_order into a reused buffer with your u64toa, and re-run the same tape.",
          "Correctness on the wire is worth as much as speed, because a silently wrong book loses money quietly. Track the next expected sequence number and treat a jump as loss; verify FIX's mod-256 checksum and reject on mismatch; bounds-check every length before you index with it. On a gap or a bad frame, stop trading that symbol and recover — fail loud and fast.",
          "The machine knobs compete for the same budget as the code. Phase 5 asks for faster decode or SIMD/prefetch on the hot loop, a pinning attempt, syscalls out of on_book, and the colocation economics — all as before/after percentiles on one tape. Pinning is Linux-only (pthread_setaffinity_np or taskset); report the p99.9 spread with and without, and on a Mac skip the pin, keep the measurement and say so. Spending on colocation while a per-tick allocation sits in on_book is buying nanoseconds to hide microseconds.",
          "Prove every win offline. scripts/latency_replay.py feeds a recorded tape to hft_bot --replay on stdin and prints p50/p99/p99.9 — deterministic, same input every run — so a change is attributed rather than guessed. A faster build that prints a different checksum (the -ffast-math trap from the lab) changed the math, and it does not count."
        ],
        "example": {
          "title": "In the arena",
          "code": "// hft/cpp_client/src/arena_client.cpp — dispatch(): the DOM you are asked to beat\n    json m;\n    try {\n        m = json::parse(raw);\n    // ...\n        if (m.contains(\"bids\") && m[\"bids\"].is_array() && !m[\"bids\"].empty())\n            bv.best_bid = m[\"bids\"][0][0].get<double>();\n        if (m.contains(\"asks\") && m[\"asks\"].is_array() && !m[\"asks\"].empty())\n            bv.best_ask = m[\"asks\"][0][0].get<double>();",
          "text": "hft/cpp_client/src/arena_client.cpp — the reference client parses every book_snapshot into a full nlohmann/json tree and then reads the touch from the first [price, qty] level of each side. The Session 8 take-home replaces this path with a targeted extract over the frame and measures the before/after with scripts/latency_replay.py on the same tape."
        }
      },
      "interview": [
        {
          "q": "Why do venues ship market data over UDP multicast but take orders over TCP?",
          "a": "Multicast lets the venue send each update once while the switches replicate it to every subscriber — the only cheap way to fan a firehose out to hundreds of consumers — and UDP does not retransmit, so one lost packet does not stall the ones behind it. Order entry is a single stream where losing a message is unacceptable, so TCP's reliability and ordering are worth its head-of-line blocking (plus TCP_NODELAY so Nagle does not batch your orders). The price of the data choice is that you detect loss yourself from sequence numbers, arbitrate the A/B feeds, and recover.",
          "level": "warm-up",
          "skill": "trading.feed-sequencing"
        },
        {
          "q": "Why is fixed-width binary faster to decode than tag=value text, and why memcpy rather than reinterpret_cast?",
          "a": "Every field sits at a known offset in a known-length message, so there is no delimiter scan and no ASCII-to-number conversion: you copy the bytes and byte-swap from network order, and prices are scaled integers, so there is no floating-point parse either. memcpy because casting a packed struct pointer onto a byte buffer is undefined behaviour — misaligned access and a strict-aliasing violation — while a fixed-size memcpy is well-defined and compiles to the same single load.",
          "level": "warm-up",
          "skill": "trading.binary-market-data"
        },
        {
          "q": "What is wrong with assuming one recv() returns one message?",
          "a": "TCP is a byte stream and does not preserve send boundaries, so a read can deliver half a message, one and a half, or several — the most common networking bug there is. The correct structure is to append into a persistent buffer allocated once, loop while a complete frame is present (length prefix or FIX BodyLength), dispatch each as a view, and memmove the partial remainder to the front so the next read continues it. And validate the length against a maximum before trusting it, because a corrupt length is a buffer overrun.",
          "level": "core",
          "skill": "tools.message-framing"
        },
        {
          "q": "FIX is text and slow to parse. Why is it still everywhere, and what does its session layer buy you?",
          "a": "Because it is a session protocol as much as a message format: sequence numbers, heartbeats, logon and resend requests plus a mod-256 checksum in tag 10 give an auditable, recoverable conversation with a counterparty, and it is self-describing so two firms can add a tag without breaking each other. That is exactly what order entry, drop copies and allocations need, where a few hundred nanoseconds of parsing is irrelevant next to never losing an order. Fast market data went binary because none of that is worth a per-byte scan at millions of messages a second.",
          "level": "core",
          "skill": "trading.fix-protocol"
        },
        {
          "q": "Concretely, what does a DOM-style JSON parser do that a targeted extractor does not?",
          "a": "It parses the entire document, including every level and field you will never read; it builds a tree of heap-allocated nodes — maps, vectors, std::strings — which is dozens of allocations per message; it copies keys and values out of the receive buffer; and it dispatches on types generically. A targeted extractor scans once for the keys it needs (for the arena, \"bids\":[[, \"asks\":[[ and \"mid_price\":), converts each number in place over a string_view of the buffer, and allocates nothing. The trade is that you now own schema assumptions the library would have checked, so you validate the shape once at connect.",
          "level": "core",
          "skill": "perf.zero-copy-parse"
        },
        {
          "q": "What is the difference between level-triggered and edge-triggered readiness, and what must you do differently?",
          "a": "Level-triggered keeps reporting the descriptor while data remains, so a partial read is safe — you will be told again. Edge-triggered reports only the transition to readable: fewer wake-ups, but you must drain the socket in a loop until recv returns EAGAIN, otherwise the remaining bytes sit there and no new notification ever comes — the stall nobody can reproduce. EAGAIN is therefore not an error in that loop; it is the signal that readiness is exhausted and you return to the event loop.",
          "level": "core",
          "skill": "perf.nonblocking-io"
        },
        {
          "q": "Your -O3 build is 6x faster than -O0, but the vectorization report says the hot loop was not vectorized. How is that possible, and what do you do?",
          "a": "The 6x is inlining, register allocation and scheduling, not SIMD. The loop accumulates a floating-point sum in order, and FP addition is not associative, so splitting it across eight lanes would change the result — the compiler is not allowed to. -ffast-math grants permission to reassociate: it vectorizes and the checksum moves, which means the math changed, so it is not a free win in a pricing kernel. Other common refusals are possible aliasing (fix with __restrict), data-dependent branches, odd strides and unknown trip counts. Ask the compiler first with -Rpass-missed=loop-vectorize or -fopt-info-vec, fix the obstacle, and write intrinsics only as a last resort.",
          "level": "core",
          "skill": "perf.simd"
        },
        {
          "q": "What does kernel bypass actually change, and what does it cost you?",
          "a": "It removes the kernel's generic network stack from the per-packet path: no copies through protocol layers, no syscall per receive, packets read straight from the NIC's rings in user space — which is also why the thread busy-polls a dedicated core instead of sleeping. DPDK gives the most control but you write driver-level code and often your own protocol handling; Onload/ef_vi accelerates the ordinary sockets API via LD_PRELOAD with almost no code change but ties you to that vendor's NIC; io_uring only batches syscalls through shared rings and is not bypass. The costs: vendor lock-in, a core burned at 100%, and losing the kernel's tooling and protection.",
          "level": "senior",
          "skill": "perf.kernel-bypass"
        },
        {
          "q": "You pinned the hot thread and the median did not move. Was it a waste? What else belongs in the same change?",
          "a": "No — pinning buys variance, not speed. What it removes is the rare 1–3 ms preemption or migration that lands in p99.9, so you judge it by the p99.9 spread across repeated runs of the same tape, not by p50. It only works fully with the rest of the recipe: isolate the core (isolcpus, nohz_full, rcu_nocbs) so nothing else is scheduled there, allocate on the NIC's NUMA node, and pre-fault and mlock hot memory — ideally on huge pages — at startup so no first-touch page fault or TLB storm happens mid-race. On macOS there is no affinity API, so you skip the pin and report that honestly.",
          "level": "senior",
          "skill": "perf.cpu-pinning-numa"
        }
      ]
    },
    {
      "n": 9,
      "focus": "The tail & the tournament",
      "tagline": "Find where the microseconds go, kill the spikes without changing the answer — then race a fee-aware, tail-tight bot on one scoreboard, behind a risk gate you can switch off in one store.",
      "concepts": [
        {
          "title": "Why the mean lies",
          "text": "Latency distributions are not Gaussian: they are heavy-tailed and usually bimodal, a tight fast body plus rare stalls from a fault, a miss cascade or a preemption. The mean lands in the valley between the two populations and describes no tick anyone experienced, so report p50 / p99 / p99.9 / max. Two traps: coordinated omission, where timing request-to-request under-samples exactly the slow periods (the replay tape feeds a fixed schedule, which is why it is the grading harness), and too few samples — p99.9 needs thousands of points, and one run is one draw.",
          "code": "std::vector<long> us(1000, 38);                       // the fast body\nfor (int i = 990; i < 996; ++i) us[i] = 71;\nfor (int i = 996; i < 999; ++i) us[i] = 210;\nus[999] = 5200;                                       // the tick you lost\nstd::sort(us.begin(), us.end());\ndouble mean = std::accumulate(us.begin(), us.end(), 0.0) / us.size();\nauto p = [&](double q) { return us[std::size_t(q * us.size())]; };\nstd::printf(\"mean=%.2f p50=%ld p99=%ld p99.9=%ld max=%ld\\n\",\n            mean, p(.50), p(.99), p(.999), us.back());\n// mean=43.88 p50=38 p99=71 p99.9=5200 max=5200",
          "deck": "Deck U9 · slide 5"
        },
        {
          "title": "perf, flame graphs — and counters that say why",
          "text": "Linux perf is the low-overhead sampling profiler, and three verbs carry you: perf stat for totals (cycles, IPC, cache and branch misses) as the cheap first move, perf record -g --call-graph dwarf to sample stacks, perf report to rank them — then fold the stacks into a flame graph where width is time on CPU, so wide plateaus are the targets and tall thin towers are merely deep. It is on-CPU only: a sleep, a lock wait or a blocked syscall does not show. The profile says where; the counters say why. Low IPC on a hot loop means stalls, not work; a DRAM miss is 200-plus cycles; a branch mispredict flushes the pipeline for 15 to 20 — rare-but-expensive, the exact shape of a tail. Your bot profiles the same way: hft_bot --replay reads snapshots on stdin.",
          "code": "uint32_t s = 2463534242u; long branchy = 0, branchless = 0;\nfor (int i = 0; i < 1000; ++i) {\n  s ^= s << 13; s ^= s >> 17; s ^= s << 5;        // deterministic pseudo-noise\n  int x = int(s & 0xff);\n  if (x > 127) branchy += x; else branchy -= x;   // ~50% mispredict: a flush\n  branchless += (x > 127) ? x : -x;               // same value, no jump\n}\nstd::printf(\"%ld %ld %s\\n\", branchy, branchless,\n            branchy == branchless ? \"identical\" : \"differ\");\n// 52160 52160 identical     -- a mispredict costs 15-20 cycles; a select cannot",
          "deck": "Deck U9 · slides 6–7"
        },
        {
          "title": "Every spike has a physical cause",
          "text": "Name the cause and the fix is targeted and permanent: allocation on the hot path (malloc usually fast, occasionally locking or calling mmap — pools and reserved buffers), page faults (pre-fault and mlock at startup), cache, TLB and NUMA misses (compact hot data, huge pages, node-local memory), and hidden O(n) or I/O (a resize, a rehash, a window recompute, a log line). Lab A's tail.cpp builds a fresh vector and re-sums 257 prices every tick; the fix is a ring sized once plus a running sum, and the proof is the same sink to the last digit with p99.9 collapsed. What is left in max after that is the OS itself — the jitter probe on an idle loop still sees gaps of 100-plus µs — which is what core isolation, IRQ routing and pinning exist to shrink.",
          "code": "struct RollingMean {                 // allocated ONCE, O(1) per tick\n  std::vector<double> buf; std::size_t cap, count = 0, head = 0; double sum = 0;\n  explicit RollingMean(std::size_t n) : buf(n, 0.0), cap(n) {}\n  double push(double px) {\n    if (count == cap) sum -= buf[head]; else ++count;\n    sum += px; buf[head] = px; head = (head + 1 == cap) ? 0 : head + 1;\n    return sum / double(count); } };\nstd::vector<double> px(5000); for (int i = 0; i < 5000; ++i) px[i] = 100 + (i % 97) * 0.01;\nRollingMean roll(256 + 1); double naive = 0, fast = 0;   // window is INCLUSIVE: 257\nfor (int k = 4999 - 256; k <= 4999; ++k) naive += px[k];  // tail.cpp's re-sum\nfor (double p : px) fast = roll.push(p);   std::printf(\"%.6f %.6f\\n\", naive / 257, fast);\n// 100.451556 100.451556   -- same answer, zero allocations per tick",
          "deck": "Deck U9 · slides 8–9, 12"
        },
        {
          "title": "Ship the release build; keep correctness and logging off the hot path",
          "text": "Once the algorithm is right, let the toolchain finish: -O3, -march=native for this CPU, -flto to optimise across .cpp files, -DNDEBUG to strip asserts, -g kept because symbols cost no speed and perf needs them, and a two-pass PGO build on a representative input so the compiler sees real branch data — one CMake build directory per flag set, --fresh, or the cache silently ignores your flags. Correctness is its own build: ASan + UBSan together, TSan separately, both clean on the replay, never shipped. And the hot thread does no I/O: it pushes a 32-byte POD record into your Session 7 ring, counts a drop if the ring is full, and moves on; a logger thread formats and writes.",
          "code": "struct LogRec { uint64_t ts_ns; uint32_t code, sym; double px; int64_t qty; };\nstatic_assert(sizeof(LogRec) == 32);                       // one POD copy per event\nstd::array<LogRec, 4> ring{}; std::size_t head = 0, tail = 0; long dropped = 0;\nfor (int i = 0; i < 6; ++i) {                              // 6 fills, nobody draining yet\n  if (head - tail == ring.size()) { ++dropped; continue; } // full: count it, never block\n  ring[head++ % ring.size()] = LogRec{uint64_t(i), 1, 7, 100.0 + i, 100};\n}\nstd::printf(\"queued=%zu dropped=%ld\\n\", head - tail, dropped);\n// queued=4 dropped=2   -- the hot thread never waits on I/O",
          "deck": "Deck U9 · slides 10–11"
        },
        {
          "title": "Picking off a stale quote — after fees",
          "text": "The same name trades on many venues, news reaches them at different times, and for microseconds they disagree. Consolidate the touches into the NBBO: locked means best bid equals best ask across venues, crossed means somebody's quote is stale. Picking it off takes both legs aggressively, so both pay the taker fee — at the arena's 30 bps a one-cent cross loses 59 cents a share, and only a shock-sized dislocation pays. Then it is a race: everyone sees the same public quote, the first order to reach that venue gets the fill, colocation is the tiebreaker, size is the thin side, and the real risk is a one-legged fill that turns a riskless arb into a directional position. Smart order routing picks the venue net of fees, rebates and per-venue latency.",
          "code": "struct Top { double bid, ask; int bid_sz, ask_sz; };\ndouble edge(const Top& A, const Top& B, double bps) {   // buy B's ask, sell A's bid\n  return A.bid - B.ask - (A.bid + B.ask) * bps * 1e-4;   // a taker fee on BOTH legs\n}\nTop A{100.05, 100.07, 300, 300}, B{100.02, 100.04, 200, 200};   // B has not caught up\nstd::printf(\"1c cross: %+.4f\\n\", edge(A, B, 30));\nTop S{101.00, 101.02, 300, 300};                                // a shock-sized gap\nstd::printf(\"96c cross: %+.4f  qty=%d\\n\", edge(S, B, 30), std::min(S.bid_sz, B.ask_sz));\n// 1c cross: -0.5903\n// 96c cross: +0.3569  qty=200",
          "deck": "Deck U9 · slides 14–16"
        },
        {
          "title": "Market making at speed: queue, skew, hold",
          "text": "A maker earns the spread and the rebate, anchors fair value on the microprice rather than the mid, and leans both quotes against inventory — fair = microprice − k × position — so risk comes off through flow the market pays for. Cancel-and-repost sends you to the back of the FIFO, so most ticks the right move is HOLD: cancel if the price moved against you, requote only if you are off the best price or buried behind more than half the level. With the tournament's quota of six messages a tick, a needless requote costs a message and the queue spot. The arena hands you queue_ahead and level_qty in on_ack / on_queue; real venues do not.",
          "code": "enum Action { HOLD, REQUOTE, CANCEL };\nAction decide(double my_px, double best_px, int ahead, int level, bool against) {\n  if (against)           return CANCEL;    // stale: pull it\n  if (my_px != best_px)  return REQUOTE;   // off the best price\n  if (ahead > level / 2) return REQUOTE;   // buried in the queue\n  return HOLD; }                           // good spot: save the message\nconst char* nm[] = {\"HOLD\", \"REQUOTE\", \"CANCEL\"};\ndouble fair = 100.016 - 0.002 * 3;         // microprice - k * inventory (long 3)\nstd::printf(\"%s %s fair=%.3f\\n\", nm[decide(100.00, 100.00, 200, 1000, false)],\n            nm[decide(100.00, 100.00, 800, 1000, false)], fair);\n// HOLD REQUOTE fair=100.010",
          "deck": "Deck U9 · slide 17"
        },
        {
          "title": "Markouts, and the grade that has four axes",
          "text": "A fast fill can be a bad fill: when an informed trader hits your quote right before the move, you were the stale quote. The markout is the truth — mark each fill against the mid a moment later, signed by side; persistently negative on a symbol is toxic flow, so widen, skew away or stop quoting it. The arena computes it server-side at 100 ms, 1 s and 5 s, and the tournament's MM SCORE is realized P&L + rebates + 1-second markout − carry, in dollars. The board also ranks p99.9, OTR (messages per trade, lower wins) and passive share — optimise one axis and you wreck another. Tonight's rank is bragging rights; Canvas Phase 7 grades the tagged commit and the write-up.",
          "code": "auto markout = [](bool bought, double fill, double later) {\n  return bought ? later - fill : fill - later;           // + good fill, - picked off\n};\ndouble a = markout(true, 100.04, 100.01);                // bought the top\ndouble b = markout(false, 100.06, 100.03);               // sold before the drop\ndouble mm = 14.00 + 1.00 + 100 * (a + b) - 0.50;         // realized + rebates + markout*qty - carry\nstd::printf(\"%+.2f %+.2f MM=%.2f\\n\", a, b, mm);\n// -0.03 +0.03 MM=14.50",
          "deck": "Deck U9 · slides 18, 23"
        },
        {
          "title": "Part 4 · The risk gate: max size, max notional and the price collar",
          "text": "Speed is only worth having behind a gate that can say no. SEC Rule 15c3-5 requires automated pre-trade controls for anyone with market access, and Knight Capital's 45 minutes in August 2012 (~$460M) is what their absence costs. Three comparisons stop most fat fingers: a maximum quantity (shares), a maximum notional (price times quantity, in money), and a collar — the order's price may sit no further than some number of basis points from a reference such as the mid. Keep prices as integer ticks, cross-multiply instead of dividing, make the edge explicit (exactly 8% is allowed, one tick past it is refused), and return a reason rather than a bool so a refusal can be logged and counted. Checked cheapest-first with no allocation, no lock and no clock read, the whole gate costs a few nanoseconds of your tick-to-trade.",
          "code": "enum class Risk : uint8_t { Ok, MaxQty, MaxNotional, PriceCollar };\nstruct Lim { int32_t max_qty = 500; int64_t max_notional = 5'000'000; int32_t collar_bps = 800; };\nRisk check(const Lim& l, int32_t qty, int64_t px, int64_t ref) {     // integer ticks, $0.01\n  if (qty > l.max_qty) return Risk::MaxQty;                           // fat finger: shares\n  if (int64_t(qty) * px > l.max_notional) return Risk::MaxNotional;   // fat finger: money\n  if (std::llabs(px - ref) * 10000 > l.collar_bps * ref) return Risk::PriceCollar;\n  return Risk::Ok; }\nLim l; int64_t ref = 10'000;                                          // reference: $100.00\nstd::printf(\"%d %d %d %d %d\\n\", (int)check(l, 100, 10'000, ref), (int)check(l, 501, 10'000, ref),\n            (int)check(l, 500, 10'001, ref), (int)check(l, 100, 10'800, ref), (int)check(l, 100, 10'801, ref));\n// 0 1 2 0 3   -- ok, too big, too much money, on the 8% collar edge, one tick past it",
          "deck": "Deck U9 · slides 28–29"
        },
        {
          "title": "Part 4 · The kill switch: one atomic flag, read first",
          "text": "When something is wrong you need to stop all new orders now, from any thread, a signal handler or an operator, without waiting for the strategy thread to notice. The mechanism is one std::atomic<bool> read at the top of the gate: a relaxed load is a plain load on x86 and ARM, costs about a nanosecond and sits in a cache line that is almost never written. A flag beats a lock (the hot thread would wait for whoever holds it) and a message (the stop would queue behind the very traffic you want to stop). Relaxed is enough because the flag guards no other data; use release on the store and acquire on the load if it also publishes a reason. A lock-free atomic may be set from a signal handler. Cancels must still pass — the switch needs them — and the gate fails closed: a position it never approved trips it too.",
          "code": "std::atomic<bool> killed{false};                                      // one flag, shared\nint sent = 0;\nauto send = [&] { if (killed.load(std::memory_order_relaxed)) return false; ++sent; return true; };\nsend(); send();\nstd::thread([&] { killed.store(true, std::memory_order_release); }).join();   // any thread may trip it\nsend();                                                               // refused: the flag is read first\nstd::printf(\"%d %d\\n\", sent, (int)std::atomic<bool>::is_always_lock_free);\n// 2 1   -- two orders went out and the third was stopped; the flag is lock-free",
          "deck": "Deck U9 · slides 28–29"
        }
      ],
      "hft": {
        "text": "Why this matters in HFT",
        "paragraphs": [
          "Nine sessions, one number. A realistic colocated software path from wire in to wire out is roughly 7 to 17 µs — bypass, parse, book and signal, risk check, serialise, send — and every earlier session shaved one of those slices. Session 9 is where you prove it: the LATENCY tab ranks bots by p99.9 tick-to-order, timed with steady_clock from the moment a book_snapshot is decoded to the moment your order leaves, and scripts/latency_replay.py replays the same fixed tape into your bot on stdin so a before/after comparison means something.",
          "The tail work is a loop, not a trick: profile the replay, name the widest plateau or the physical cause of the spike, fix it without changing the answer, re-run the same tape, and write the before and after into a changelog. That changelog plus a flame graph is Project Phase 6, and Lab A is its template — including the honest bits, like a macOS clock that ticks in 42 ns steps and a max that stays in microseconds after the fix because the OS, not your code, took the time.",
          "Latency arbitrage is where speed turns directly into P&L, and the fee arithmetic decides it before the race does. Both legs are aggressive, so both pay the taker fee; a crossed NBBO is only worth taking when the dislocation survives two fees, which in the finale means the shocks — AAPL earnings at tick 250, the market-wide econ print at 850, NVDA earnings at 1150. Cross-venue in C++ has a concrete shape: on_book has no venue argument and one client speaks to one venue, so you run one process per venue and share the touch through your Phase 4 shared-memory structure — POD, no pointers, and no torn reads.",
          "Market making is the other half of the score, and it rewards discipline more than raw speed. The finale's binding constraint is messages, not size: order_quota is 6 per tick against a position limit of 1200, so every cancel-and-repost spends a message and forfeits queue position. MM SCORE adds realized P&L, rebates and the 1-second markout and subtracts carry, which is why the fastest p99.9 rarely wins it: fast is necessary, not sufficient.",
          "Speed also carries a responsibility. It tightens spreads and links venues; it is also an arms race for access that is openly for sale, which is why real markets add circuit breakers, LULD bands, speed bumps and batch auctions — the finale runs with LULD at 8% and the short-sale rule on. Bring a clean build from a fresh clone, a bot that respects its risk limits, and numbers you can defend; tonight's short Part 4 adds the gate that decides whether that bot is allowed to send at all — size, notional, collar and a kill switch, a few nanoseconds per order — and the cumulative final follows in its own remote window, Dec 8–11, with no session that week."
        ],
        "example": {
          "title": "In the arena",
          "code": "// starters/session08/stale_quote.cpp - HW 8's contract, in the header comment\n//   * The stale venue is the one of the crossing pair with the OLDER ts_ns.\n//   * Edge per share = |other venue's touch - stale price| - 2 * taker fee\n//     (fee = price * fee_bps * 1e-4 per leg; you pay to enter AND to exit).\n//   * No allocation, no I/O: this runs inside on_book.\nOrder detect_stale(const Top v[2], double fee_bps, int position, int limit);\n\n// hft/cpp_client/include/hft_bot.hpp - the REAL hook: NO venue argument,\n// so cross-venue means one process per venue and a shared touch cache.\nvirtual void on_book(const std::string& symbol, double bid, double ask,\n                     double mid, double microprice, double obi);\nvirtual void on_ack(const std::string& symbol, const std::string& order_id,\n                    int queue_ahead, int level_qty);",
          "text": "starters/session08/stale_quote.cpp is HW 8: finish detect_stale() until its ten-row table passes (the stub passes the four no-order rows), then argue in the README what latency would make it real and what makes the signal false. hft/cpp_client/include/hft_bot.hpp is why the tournament's cross-venue plan is two processes, and on_ack is where queue_ahead arrives for the hold-or-requote decision. The finale scenario itself is hft/scenarios/week10.json."
        }
      },
      "interview": [
        {
          "q": "What is the NBBO, and what does it mean for it to be crossed or locked?",
          "a": "The NBBO is the consolidated best bid and best offer across all venues trading the name: the maximum bid and the minimum ask. Locked means the best bid equals the best ask — someone is willing to buy at exactly the price someone is willing to sell. Crossed means the best ask is below the best bid, which cannot persist: it says one venue's quote has not caught up, and it is the signal a latency arbitrageur is looking for.",
          "level": "warm-up",
          "skill": "trading.nbbo-latency-arb"
        },
        {
          "q": "Why does a latency report give p50, p99 and p99.9 instead of the mean?",
          "a": "Because latency is heavy-tailed and usually bimodal: a fast common path plus rare stalls from allocation, page faults, cache misses or the scheduler. The mean sits between those populations and describes no real tick, and a handful of multi-millisecond stalls barely moves it. The races that matter happen on the busy, volatile ticks where the stalls show up, so the tail — p99.9 and max — is what decides whether you get filled.",
          "level": "warm-up",
          "skill": "perf.tail-diagnosis"
        },
        {
          "q": "Which perf command do you run first on a slow binary, and how do you read the flame graph afterwards?",
          "a": "perf stat first, because it is almost free and tells you what kind of problem you have: cycles and instructions give IPC, and the cache-miss, branch-miss and page-fault counters say whether you are memory-bound, mispredicting or faulting. Then perf record -g (with DWARF call graphs for -O2 code) to learn where. In the flame graph width is the total time attributed to a frame and its children, so wide plateaus are the targets; tall towers only mean a deep stack. Two traps: it is on-CPU only, so lock waits and blocking syscalls are invisible, and a build without symbols collapses the stacks into nonsense — which is why -g stays in the release build.",
          "level": "core",
          "skill": "tools.perf-profiler"
        },
        {
          "q": "Name the usual physical causes of a latency tail and how you tell them apart.",
          "a": "Allocation (malloc locking, refilling an arena or calling mmap), page faults on first touch, cache and TLB misses or a NUMA-remote load, hidden O(n) work such as a resize, rehash or window recompute, logging or other I/O, and OS preemption or interrupts. You distinguish them with evidence rather than intuition: allocator frames in the profile, fault counts from perf stat, cache/LLC/dTLB miss counters, and a jitter probe — a loop timing an empty body — for scheduler noise. Each has a different fix (pools, pre-faulting and mlock, layout and huge pages, bounded per-tick work, a lock-free log ring, isolation and pinning), which is why naming it comes first.",
          "level": "core",
          "skill": "perf.tail-diagnosis"
        },
        {
          "q": "You detect a crossed NBBO. Walk through what you do and what can go wrong.",
          "a": "First check that the edge survives both taker fees — at 30 bps a leg a one-cent cross is a loss of about 59 cents a share — and size to the thin side, min(bid size, ask size). Then take the stale side on the lagging venue and hedge on the venue that already moved. What goes wrong is leg risk: the stale quote is public, so if you lose the race on one leg you are left with an unhedged directional position at a worse price. And you may be wrong about who is stale — the fresh venue can be the one about to reverse — in which case you crossed the spread twice for nothing.",
          "level": "core",
          "skill": "trading.smart-order-routing"
        },
        {
          "q": "When should a market maker requote, given that repricing loses queue position, and where does inventory skew come in?",
          "a": "Cancel if the market moved against the quote, because a stale quote is a free option written to every taker. Requote if you are off the best price or buried deep in the level. Otherwise hold: near the front the fill is imminent, and restarting at the back of the FIFO throws away the time priority you paid for — under a quota of six messages per tick, a needless requote also burns a message. Skew enters the fair value itself: fair = microprice − k × position, so a long book shades both quotes down and sells its inventory through flow the market pays for, instead of paying the spread to hedge.",
          "level": "core",
          "skill": "trading.market-making"
        },
        {
          "q": "What is a markout, and how do you use it operationally?",
          "a": "A markout is the signed P&L of a fill against the mid some horizon later: for a buy, mid_later minus the fill price; for a sell, the reverse. It tells you whether the fill was good independently of how the position was later closed. You bucket markouts by symbol and time of day at several horizons — the arena uses 100 ms, 1 s and 5 s — and persistent negativity means adverse selection, so you widen, skew away from that side, or stop quoting the name. In the tournament the 1-second markout is added straight into MM SCORE, so picked-off fills cost points directly.",
          "level": "core",
          "skill": "trading.adverse-selection"
        },
        {
          "q": "Why do you keep -g in a release build, and what do -march=native, -flto and PGO buy you?",
          "a": "Debug symbols do not change the generated code; they only make perf, flame graphs and core dumps readable, so stripping them costs diagnosis for nothing. -march=native lets the compiler use this CPU's instruction set, a real win for vectorisable loops, at the price of a binary that may not run on another microarchitecture. -flto defers optimisation to link time so inlining crosses translation units, which matters when the codec and the strategy live in different files. PGO gives the compiler measured branch frequencies for layout and inlining — but only if the profiling input is representative, so you profile on the tape you will be measured on, and you re-measure, because an unrepresentative profile can make things slower.",
          "level": "senior",
          "skill": "tools.compiler-flags"
        },
        {
          "q": "Make the case for and against latency arbitrage as a business.",
          "a": "For: it is the mechanism that enforces one price across fragmented venues, and the firms doing it usually also quote two sides, so the result is tighter spreads, deeper books and lower costs for occasional traders. Against: the specific trade takes a quote from someone who has not yet been able to withdraw it, so the profit is a transfer from a slower participant rather than new information, and the resources spent to win it — microwave links, custom silicon, colocation — are real capital spent on a purely relative advantage that is openly for sale. Both arguments are genuine; the sensible response is market design — speed bumps, frequent batch auctions, circuit breakers and LULD bands — rather than banning speed, and as an engineer you owe the market fast code that respects its risk limits.",
          "level": "senior",
          "skill": "trading.hft-ethics"
        },
        {
          "q": "Design a kill switch for a trading process. Which thread sets it, how does the hot path read it, and which memory order do you use?",
          "a": "Any thread, an operator command or a signal handler sets one std::atomic<bool>; the hot path loads it at the very start of the gate and refuses every new order while it is set. The flag is in its own cache line so reads stay cheap, and it must be lock-free so a signal handler may legally store to it. A relaxed load and store are enough when the flag guards no other data; if the setter also publishes a reason or state the reader will use, store with release and load with acquire. It does not use a lock (the hot thread would wait) or a queue message (the stop would sit behind the traffic it is meant to stop). Cancels are still allowed through, since the switch needs them, and the gate also trips it itself on inconsistent state.",
          "level": "core",
          "skill": "cpp.atomic-kill-switch"
        }
      ]
    }
  ]
};
