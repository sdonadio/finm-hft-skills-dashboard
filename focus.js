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
          "code": "double px = 182.50; int qty = 200;\ndouble notional = px * qty;\ndouble taker = 0.0030 * notional;   // cross the spread: you pay\ndouble maker = 0.0005 * notional;   // rest in the queue: you are paid\nstd::printf(\"%.2f -%.2f +%.2f\\n\", notional, taker, maker);\n// 36500.00 -109.50 +18.25   -- a 128.75 swing on one 200-share clip",
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
          "The book is not a loose abstraction here — it is a data structure with a layout. Prices live on a discrete tick grid, which is why from session 4 onward you hold your local book as a flat array of one-cent slots indexed by arithmetic (slot = tick - base_tick) instead of a tree you have to search. The microstructure fact (ticks are discrete) is what licenses the performance decision (index, don't chase).",
          "Queue position is the alpha that latency actually buys. The engine keys each price level on arrival order, so your standing is a real quantity you can read rather than guess: the ack and queue-update messages carry queue_ahead and level_qty, and queue_ahead == 0 means you are at the front and about to fill. Repricing costs you that spot, which is why sessions 4 and 9 spend time on when *not* to requote.",
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
      "focus": "Memory, cache & ownership",
      "tagline": "Microseconds do not hide in your algebra — they hide in the memory hierarchy, in a 64-byte line, and in the one heap touch you left on the hot path.",
      "concepts": [
        {
          "title": "The memory hierarchy, and stack versus heap",
          "text": "The CPU is fast and memory is far: a register is effectively free, an L1 hit is about a nanosecond, and a miss out to DRAM is about a hundred — one miss costs what a hundred L1 hits cost. The stack is a bump pointer whose top is almost always hot in L1, with automatic lifetime and no bookkeeping; the heap is a shared service that may lock, walk a free list and touch a cold page, with objects scattered so that following a pointer between two of them is a fresh miss. That asymmetry, not instruction count, is where your tail lives.",
          "deck": "Deck U2 · slides 5–6"
        },
        {
          "title": "Layout is a latency decision: AoS vs SoA",
          "text": "Memory moves in 64-byte lines, so the cost of a scan is the number of lines it touches, not the number of adds it does. An array of fat structs drags cold bytes along for the ride — and the compiler's padding makes the struct wider than the fields you declared. Packing the hot field into its own contiguous array (struct of arrays) turns the same arithmetic into a fraction of the cache lines and gives the hardware prefetcher a regular stride to run ahead on.",
          "code": "struct Quote { double px; int qty; char t[40]; };   // AoS, exactly as on the slide\nstd::printf(\"%zu %zu \", sizeof(Quote),          // 52 bytes declared, padded to 8\n            64 / sizeof(double));               // useful prices per line, SoA\nstd::printf(\"%zu %zu\\n\", (1024 * sizeof(Quote) + 63) / 64,   // lines: 1024 px, AoS\n                         (1024 * sizeof(double) + 63) / 64); // lines: 1024 px, SoA\n// 56 8 896 128   -- 7x fewer cache lines for identical arithmetic",
          "deck": "Deck U2 · slides 13–15"
        },
        {
          "title": "The pipeline, and a branch it cannot guess",
          "text": "A modern core decodes and executes far ahead of itself and guesses which way each branch will go; a mispredict on the hot path throws the speculated work away and refills the pipeline, roughly 15–20 cycles. So make branches predictable — sort or partition the data so they go the same way, and hoist rare cases out of the hot loop — and go branchless with arithmetic or a conditional move only where you have measured that the predictor is losing.",
          "code": "int px[6] = {3, -1, 4, -1, 5, -9};\nint a = 0, b = 0;\nfor (int v : px) if (v > 0) a += v;       // one data-dependent branch per element\nfor (int v : px) b += v & ~(v >> 31);     // branchless: the sign bit IS the mask\nstd::printf(\"%d %d\\n\", a, b);\n// 12 12   -- same answer, and the second loop has nothing to mispredict",
          "deck": "Deck U2 · slide 16"
        },
        {
          "title": "The 64-byte cache line and false sharing",
          "text": "Because the line is the unit of transfer, two variables written by two different threads that happen to share one line make the cores invalidate each other's copy and ping-pong it between them. The symptom is a threaded version that is slower than the single-threaded one, the cause is invisible in the source, and the fix is alignas(64) so each hot variable owns its line — padding is not waste when it buys you a clean line and kills a stall.",
          "code": "struct Bad  { std::atomic<long> a, b; };         // two counters, ONE 64B line\nstruct Good { alignas(64) std::atomic<long> a;   // each owns its own line\n              alignas(64) std::atomic<long> b; };\nstd::printf(\"%zu %zu %zu %zu\\n\", sizeof(Bad), alignof(Bad),\n                                 sizeof(Good), alignof(Good));\n// 16 8 128 64   -- Bad fits in one line and the cores fight over it",
          "deck": "Deck U2 · slides 18–19"
        },
        {
          "title": "Most benchmarks lie",
          "text": "Intuition about performance is almost always wrong, and so is an unguarded measurement. If the result is unused the optimiser deletes the work you meant to time, so consume it with a sink the compiler cannot see through; then measure a release build, warm up so the caches and the branch predictor are primed, and report a sorted sample as p50 / p99 / p99.9 with the machine stated rather than a single mean. Profile before you optimise — perf record tells you where the cycles and the misses actually land.",
          "code": "long long acc = 0;                                  // -O2, warm up, THEN time\nfor (int i = 0; i < 1000; ++i) acc += (long long)i * i;\nasm volatile(\"\" : : \"r\"(acc) : \"memory\");           // a sink DCE cannot see through\nstd::printf(\"sum=%lld\\n\", acc);                     // leave acc unused and the\n// sum=332833500                                    -- whole loop simply vanishes",
          "deck": "Deck U2 · slides 21–23"
        },
        {
          "title": "RAII, and unique_ptr over shared_ptr",
          "text": "Tie a resource's lifetime to an object's scope — acquire in the constructor, release in the destructor — and the compiler guarantees the cleanup on every exit path, including an exception unwinding the stack. Destructors run last-built-first and you never call them yourself. unique_ptr is that idea for heap memory: sole ownership, move-only, the same size and speed as a raw pointer, and the default you reach for. shared_ptr is reference-counted and the count is atomic, so every copy and destroy is a synchronising read-modify-write that bounces a cache line between cores; weak_ptr observes without owning and is how you break a cycle.",
          "code": "struct Guard { const char* n; ~Guard() { std::printf(\"-%s \", n); } };   // RELEASE\n{ Guard a{\"book\"}, b{\"pool\"}; std::printf(\"+book +pool \"); }  // reverse order\nauto u = std::make_unique<int>(7);         // sole owner, move-only, 1 pointer\nauto s = std::make_shared<int>(7);         // refcounted, and the count is ATOMIC\n{ auto s2 = s; std::printf(\"use=%ld \", s.use_count()); }\nstd::printf(\"use=%ld sizeof %zu %zu\\n\", s.use_count(), sizeof(u), sizeof(s));\n// +book +pool -pool -book use=2 use=1 sizeof 8 16",
          "deck": "Deck U2 · slides 29–30, 35 · Deck U2 · slides 37–39"
        }
      ],
      "hft": {
        "text": "This session is where you stop writing faster code and start moving bytes less: layout, cache lines and honest measurement buy the microseconds, and ownership discipline is what keeps a single heap touch out of your p99.9.",
        "paragraphs": [
          "Microseconds do not hide in your algebra, they hide in memory access. On the tick-to-trade path the arithmetic of a signal costs a nanosecond or two; one cache miss to DRAM costs about a hundred, and one first-touch page fault costs microseconds. That is why this session is about the hierarchy and about layout rather than about clever code: the decisions that move your p99.9 are where the bytes are, not how many instructions you executed.",
          "The rule for the hot path is blunt: on_book must not allocate. No new, no make_shared, no growing a vector, no string concatenation. Even correct new/delete fragments the heap over a session and its timing is unpredictable — the allocator may walk a free list, split a block, take a lock or call the kernel for a fresh page, so the same call that costs 20 ns on a quiet tick costs 20 µs on a busy one. That variance *is* your p99.9, and the busy tick is precisely the one you needed to win. Session 3 replaces the allocator outright.",
          "Own state off the path and borrow it on the path. Build the book cache, the pools and the buffers at startup as plain members or with unique_ptr, then pass non-owning references into on_book. Specifically avoid shared_ptr there: its atomic refcount is a hidden cross-core cost on every copy, and it is one of the few overheads you can watch disappear from the tail histogram after you remove it. Make the signature say what it does — unique_ptr by value takes ownership, const& borrows, and the type is the documentation.",
          "False sharing is not hypothetical in this client. The transport runs its own receive thread and your strategy runs inside on_book, so any counter or flag the two of them write will share a line unless you say otherwise — the client's own session_open_ and running_ atomics sit adjacent in exactly that way. From session 6 onward your SPSC ring's head and tail indices are alignas(64) for the same reason, and the symptom you are avoiding is a threaded version that is slower than the single-threaded one.",
          "None of this counts until you measure it honestly: a release build, a warm-up, a sink the optimiser cannot delete, and a sorted sample reported as p50 / p99 / p99.9 rather than a mean. This session also brings the correctness tools — a planted leak or use-after-free is found with ASan/LSan on a debug build, not by staring — and a shared_ptr-versus-unique_ptr copy benchmark turns the atomic refcount from an opinion into a number. Establish the p99.9 baseline here; every later session is judged against it."
        ],
        "example": {
          "title": "In the arena",
          "code": "// hft/cpp_client/include/arena_client.hpp\n//   All handlers are invoked on IXWebSocket's receive thread; keep them fast\n//   and do not block. The send helpers are thread-safe.\nprivate:\n    ClientConfig      cfg_;\n    ix::WebSocket     ws_;\n    std::atomic<bool> session_open_{false};\n    std::atomic<bool> running_{false};\n\n    mutable std::mutex              book_mtx_;\n    std::map<std::string, BookView> books_;   // owned once, not per tick",
          "text": "hft/cpp_client/include/arena_client.hpp — the transport owns its book cache once, behind a mutex, and every handler runs on the receive thread: correct plumbing, and exactly the shape (node-based map, a lock, two adjacent atomics) you must not copy into your own on_book."
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
          "a": "RAII means a resource is acquired in a constructor and released in the matching destructor, so its lifetime is tied to a scope and the compiler guarantees the release on every exit path — including during exception unwinding. std::lock_guard (acquires a mutex, unlocks in its destructor) and std::unique_ptr (owns heap memory, deletes it in its destructor) are the canonical examples; std::fstream and std::vector are two more. The payoff is deterministic cleanup at the closing brace with no garbage collector and nothing to forget.",
          "level": "warm-up",
          "skill": "cpp.raii"
        },
        {
          "q": "A scan over std::vector<Quote> is several times slower than the same scan over a std::vector<double> of just the prices, with identical arithmetic. Explain.",
          "a": "Memory moves in 64-byte lines, so the cost of a scan is the number of lines touched, not the number of adds. With a 56-byte Quote you pull 56 bytes to use 8, so 1024 prices cost about 896 lines; with a packed array of doubles you get 8 useful prices per line and the same scan costs 128. Splitting the hot fields into their own contiguous array also gives the hardware prefetcher a regular stride to run ahead on, which the strided AoS access does not.",
          "level": "core",
          "skill": "perf.memory-hierarchy"
        },
        {
          "q": "What is false sharing, how would you recognise it, and how do you fix it?",
          "a": "Two threads writing *different* variables that happen to occupy the same 64-byte cache line: each write invalidates the other core's copy, so the line ping-pongs over the coherence protocol. The signature is a multithreaded version that is slower than single-threaded, with high cache-coherence traffic and no logical contention anywhere in the source. The fix is to give each hot variable its own line with alignas(64) — or better, to stop sharing at all and keep per-thread state that is merged off the hot path.",
          "level": "core",
          "skill": "perf.cache-line-alignment"
        },
        {
          "q": "What does a branch mispredict cost, and what do you actually do about an unpredictable branch on the hot path?",
          "a": "The core speculates down one path; on a mispredict it discards that work and refills a deep pipeline, roughly 15–20 cycles. The first move is to make the branch predictable rather than to remove it: sort or partition the input so it resolves the same way, and hoist rare cases (halts, error paths, session events) out of the loop body. Only then consider branchless arithmetic or a conditional move, and only with a measurement — a well-predicted branch is nearly free, so branchless code that adds dependent arithmetic can easily be slower.",
          "level": "core",
          "skill": "perf.branch-prediction"
        },
        {
          "q": "Why would you avoid shared_ptr on a microsecond-scale hot path?",
          "a": "The reference count is atomic, so each copy or destruction is a read-modify-write that must be coherent across cores; under sharing that bounces the control block's cache line between them, and the cost is variable rather than fixed. It also adds an extra indirection and, with shared_ptr(new T) rather than make_shared, a second allocation. On the hot path I own with unique_ptr off the path and pass a plain reference in — the reference cannot be null, cannot be reseated and costs nothing.",
          "level": "core",
          "skill": "cpp.smart-pointers"
        },
        {
          "q": "A colleague's micro-benchmark reports that a function takes 0 ns. What went wrong, and how would you fix the measurement?",
          "a": "The result was unused, so dead-code elimination deleted the work — you timed nothing. Consume the result with a sink the compiler cannot see through (an empty asm volatile with a \"memory\" clobber, or a benchmark library's DoNotOptimize). While you are there, fix the other three classic errors: measure a release build, warm up so caches and the branch predictor are primed, and report a sorted sample as p50 / p99 / p99.9 with the machine and the clock stated — steady_clock, not system_clock — instead of a single mean.",
          "level": "senior",
          "skill": "tools.benchmarking"
        },
        {
          "q": "A class owns a raw new[] buffer and declares only a destructor. What has the compiler silently done to you?",
          "a": "Declaring a destructor suppresses the implicit move constructor and move assignment, so every \"move\" of the type falls back to the copy operations — and the implicit copies are member-by-member, meaning they copy the pointer, not the buffer. The result is two destructors freeing one allocation: a double free, usually somewhere far from the cause. Either write all five special members with a self-assignment guard, or hold the buffer in a vector/unique_ptr and write none of them — and mark your moves noexcept, or vector will quietly deep-copy on every reallocation.",
          "level": "senior",
          "skill": "cpp.move-semantics"
        }
      ]
    },
    {
      "n": 3,
      "focus": "Allocators, pools & templates",
      "tagline": "\"Don't allocate\" is not enough — pre-own the memory, hand it out in O(1), and write the machinery once so the compiler specialises it per type for free.",
      "concepts": [
        {
          "title": "What new really costs, and what the hot path needs",
          "text": "The default allocator is a general-purpose, thread-safe service, and every one of those properties is wrong for a microsecond path: it guards its free lists with a lock, it calls brk or mmap into the kernel when it runs out, variable-size requests fragment it over a session, and so the same call is 20 ns on one tick and 20 µs on the next. Flip every property and you have the specification — no locks because there is one pool per thread, no syscalls because the memory is reserved before the session opens, O(1) always because allocation is a pointer bump or a free-list pop, and bounded because you sized it at startup for the worst tick. Same cost every time is what collapses the tail toward the median.",
          "deck": "Deck U3 · slides 5–6"
        },
        {
          "title": "The fixed-size object pool",
          "text": "Give up flexibility and buy determinism: one block size, one pre-owned slab, and a singly linked free list threaded through the *unused* slots so the free slots are the list and cost no extra memory. Allocation pops the head, deallocation pushes it back, both O(1) with no search and no coalescing — and because slots get handed straight back out they stay hot in L1 instead of scattering across the heap.",
          "code": "struct Slot { Slot* next; };\nSlot slab[4]; Slot* free_ = nullptr;                   // ONE pre-owned block\nfor (auto& s : slab) { s.next = free_; free_ = &s; }   // thread the free-list\nSlot* a = free_; free_ = a->next;                      // alloc: O(1) pop\nSlot* b = free_; free_ = b->next;                      // alloc: O(1) pop\nb->next = free_; free_ = b;                            // free:  O(1) push\nSlot* c = free_; free_ = c->next;                      // alloc again\nstd::printf(\"%d %d %d\\n\", a != b, c == b, free_ != nullptr);\n// 1 1 1   -- the freed slot is handed straight back, still hot in L1",
          "deck": "Deck U3 · slides 8, 10"
        },
        {
          "title": "Placement new, and the arena that resets",
          "text": "C++ separates \"get raw bytes\" from \"construct an object\". new (ptr) T{...} runs a constructor in memory you already own and allocates nothing; the price is that nobody will run the destructor for you, so you call p->~T() yourself before you hand the slot back, and the storage being correctly sized and aligned for T is your problem — which is why pool slots are declared alignas(T). The same mechanism powers the bump allocator: keep one offset into a slab, return it and advance by the aligned size, and reclaim everything at once with a single reset. You cannot free one object, which is exactly right for a tick's working set.",
          "code": "struct Order {\n  double px; int qty;\n  Order(double p, int q) : px(p), qty(q) { std::printf(\"ctor \"); }\n  ~Order()                               { std::printf(\"dtor \"); }\n};\nalignas(Order) char buf[sizeof(Order)];     // memory you already own\nOrder* o = new (buf) Order(101.5, 200);     // placement new: construct only\nstd::printf(\"%.1f %d \", o->px, o->qty);\no->~Order();                                // YOU destroy it. Nobody else will.\nstd::puts(\"\");\n// ctor 101.5 200 dtor",
          "deck": "Deck U3 · slide 9"
        },
        {
          "title": "std::pmr: the standard version of all this",
          "text": "C++17 standardises the pattern. A memory_resource is an abstract source of bytes; monotonic_buffer_resource is a bump allocator over a buffer you supply, with release() as its O(1) reset; unsynchronized_pool_resource is a pooled, lock-free resource for fixed-size blocks; and a polymorphic_allocator lets std::pmr::vector and friends take a resource pointer at construction. Same container type, your memory underneath — and the trap is lifetime order: the container must die before you release().",
          "code": "std::byte buf[1024];                                   // stack scratch slab\nstd::pmr::monotonic_buffer_resource rsrc{buf, sizeof buf};\n{\n  std::pmr::vector<int> v{&rsrc};                      // std container, YOUR memory\n  v.reserve(8); v.push_back(1); v.push_back(2);\n  auto* d = reinterpret_cast<const std::byte*>(v.data());\n  std::printf(\"%zu %d\\n\", v.size(), d >= buf && d < buf + sizeof buf);\n}                                                      // v dies HERE, then:\nrsrc.release();                                        // O(1) reset, per tick\n// 2 1   -- the vector's storage really is inside buf; the heap was never touched",
          "deck": "Deck U3 · slides 12–13"
        },
        {
          "title": "A template is a recipe, not code",
          "text": "template<typename T> is a blueprint; the compiler instantiates it — generates real machine code — the first time you use it with a concrete type, and then inlines it. That is why a ring<T,N> or an ObjectPool<T,N> costs the same as the version you would have hand-written for that exact type, and why the template call beats a virtual one on the hot path: nothing is left to indirect through. You rarely spell the arguments out because they are deduced from the call, and you can hand-tune one type that deserves it with a full or partial specialisation. The prices are real: definitions must live in headers, and every distinct instantiation is separate machine code that grows the binary and can thrash the instruction cache.",
          "code": "template <class T> struct Serializer {              // primary: the generic recipe\n  static const char* wire() { return \"generic\"; }\n};\ntemplate <> struct Serializer<long> {               // full spec for the hot type\n  static const char* wire() { return \"fast_itoa\"; }\n};\ntemplate <class T> T smaller(T a, T b) { return a < b ? a : b; }\nint main() {\n  std::printf(\"%s %s %d %.2f\\n\", Serializer<double>::wire(), Serializer<long>::wire(),\n              smaller(3, 4), smaller(0.5, 0.25));   // T deduced: int, then double\n}\n// generic fast_itoa 3 0.25",
          "deck": "Deck U3 · slides 15–17 · Deck U3 · slides 28, 33"
        },
        {
          "title": "Packs, folds and compile-time branches",
          "text": "typename... lets one template take any number of arguments of any types; sizeof...(Ts) gives the count at compile time, and Ts&&... plus std::forward<Ts>(args)... passes each one on preserving its value category, which is how a pool's alloc() or make_unique forwards a constructor's arguments untouched. A C++17 fold collapses the pack over a binary operator in one line — no recursion, no base case — and unrolls away. Feed a type trait into if constexpr and the untaken arm is discarded before code generation, so each instantiation contains exactly one path with nothing to test and nothing to mispredict; prefer that to raw SFINAE and enable_if in new code.",
          "code": "template <class... Ts> constexpr auto sum(Ts... xs) { return (xs + ...); }  // fold\ntemplate <class... Ts> void log(const Ts&... xs) { (std::printf(\"%s \", xs), ...); }\ntemplate <class T> const char* kind(const T&) {\n  if constexpr (std::is_integral_v<T>) return \"int\";    // only ONE arm compiles\n  else if constexpr (std::is_floating_point_v<T>) return \"float\"; else return \"other\";\n}\nint main() {\n  static_assert(sum(1, 2, 3, 4) == 10);      // the compiler did the addition\n  log(kind(3), kind(3.0), kind(\"x\"));        // comma fold over the pack\n  std::printf(\"%d %.2f\\n\", sum(1, 2, 3, 4), sum(0.5, 0.25));\n}\n// int float other 10 0.75",
          "deck": "Deck U3 · slides 19–23"
        }
      ],
      "hft": {
        "text": "Session 2 gave you the rule — do not allocate on the hot path — and this session gives you the machinery to obey it at full speed, then makes that machinery generic so one allocator and one codec serve every type your bot touches.",
        "paragraphs": [
          "The targets are concrete: anywhere on_book or on_fill creates an order, a message or a book node is a hidden new. Pre-size a pool per struct type at startup, put the per-tick working set on a monotonic buffer, and the p99.9 in the harness histogram drops against your session-2 baseline. That drop is the entire point — determinism, not throughput, is the deliverable, and the honest way to report it is pool alloc/free versus new/delete with both the median and the tail, because the median improves a little and the tail improves a lot.",
          "The properties you are buying are the mirror image of malloc's: no lock because the pool is per-thread, no syscall because the memory is reserved before the session opens, O(1) because allocation is a free-list pop or a pointer bump, and bounded because you sized the slab for the worst tick. Nothing in the path can decide, on its own schedule, to walk a free list or fault in a page — and \"the same cost every time\" is precisely what a tail percentile rewards.",
          "Two operational details bite people every year. First, a pool is big — an ObjectPool<Order, 4096> is on the order of 128 KB, so it must be a member or a static, never a local, or you blow a worker thread's stack. Second, every alloc needs its free: forget one and the pool is silently exhausted a few thousand ticks in, alloc() starts returning null, and your bot goes quiet without ever crashing. Log exhaustion loudly, and prefer an RAII handle that returns the slot from a destructor on every exit path.",
          "Ordering matters with a bump allocator. release() reclaims the whole slab, so any pmr container that borrowed from it must be destroyed *before* the reset — in practice, scope the scratch container in an inner block and release after that block closes. Getting it backwards is a use-after-reset that no test will reliably catch. The second trap is silent overflow: if the working set exceeds the buffer, monotonic_buffer_resource quietly falls back to the upstream heap resource, and you are allocating again without noticing.",
          "Templates are the other half because the choice between a template and a virtual is not a style question on the tick-to-trade path. A virtual call is two dependent loads plus an indirect branch the CPU can mispredict, and it is an inlining barrier: constant folding and register allocation stop there. A template call compiles to the machine code you would have hand-written for that exact type. So the deciding question is whether the type set is open or closed: open — the client boundary, where hft_bot.hpp deliberately declares on_book virtual — stays virtual; closed, like the handful of message and strategy types you actually ship, gets templated into one allocation-free codec with no per-type copy-paste. Watch the bloat, keep the generic layer thin, and confirm it inlined by reading the asm or by watching p99.9 on the same tape."
        ],
        "example": {
          "title": "In the arena",
          "code": "// course/hft-columbia/project-starter/include/pool.hpp\n// a high-performance fixed-size object pool (O(1) alloc/free, placement new).\nstruct Pool {\n    Pool(std::size_t obj_size, std::size_t capacity) {\n        // TODO(student): back this with ONE pre-allocated buffer + a free-list.\n    }\n    void* alloc() { return nullptr;               // TODO(student): pop a free slot, O(1)\n    }\n    void  free(void* p) {                         // TODO(student): return the slot, O(1)\n    }\n};",
          "text": "course/hft-columbia/project-starter/include/pool.hpp — the stub behind this session's homework: the whole contract is in the comments (one pre-allocated buffer, a free list, O(1) in both directions), and course/hft-columbia/project-starter/tests/pool_test.cpp is the grader that has to go green."
        }
      },
      "interview": [
        {
          "q": "Why is the general-purpose allocator a problem on a low-latency path?",
          "a": "Because its cost is unbounded and unpredictable rather than merely large. It may take a lock on a shared free list, search or split blocks, coalesce on free, or fall through to brk/mmap and a page fault in the kernel. The median call is fast, which is why the mean looks fine, but the occasional slow call lands on a busy tick and becomes your p99.9 — and you do not control when it happens, which is the definition of non-deterministic.",
          "level": "warm-up",
          "skill": "cpp.raw-allocation"
        },
        {
          "q": "Why must a template's definition live in a header?",
          "a": "Because a template is not code until it is instantiated, and the compiler can only instantiate it where it can see the definition. With the body in a separate .cpp, each translation unit that uses it emits a call to a function nobody generated, and you get a link error. The alternatives are to keep the definition in the header (the normal choice) or to explicitly instantiate the specific types you need in one .cpp — which is also a way to contain code bloat.",
          "level": "warm-up",
          "skill": "cpp.templates"
        },
        {
          "q": "Sketch a fixed-size object pool and state the complexity of alloc and free.",
          "a": "One contiguous slab of N slots, each slot big enough and aligned for T, plus a head pointer to a singly linked free list threaded through the *unused* slots — so the list costs no extra memory. alloc pops the head and returns it; free pushes the slot back on the head. Both are O(1) with no search and no coalescing, and reusing slots in cycles keeps them cache-warm. Practically the pool is a member or a static, because a 4096-slot pool of 32-byte objects is well over 100 KB of storage.",
          "level": "core",
          "skill": "perf.object-pool"
        },
        {
          "q": "What does placement new do, and what obligation does it create?",
          "a": "new (ptr) T{args...} constructs a T in storage you already own: it runs the constructor and allocates nothing. The obligation is symmetry — no operator delete will ever be called for it, so you must invoke p->~T() explicitly before reusing or releasing the storage. You are also responsible for that storage being correctly sized and aligned for T, which is why pool slots are declared with alignas(T) and sized with sizeof(T). Hide the pair behind an RAII handle and neither half can be forgotten.",
          "level": "core",
          "skill": "cpp.placement-new"
        },
        {
          "q": "What does std::pmr add over writing your own allocator, and which resource fits a per-tick scratch buffer?",
          "a": "pmr makes the allocator a run-time value instead of part of the container's type, so std::pmr::vector<T> is one type whose memory comes from whatever memory_resource you hand it — no allocator template parameter plumbed through your whole call graph, and no two incompatible vector types. For per-tick scratch the fit is monotonic_buffer_resource over a stack or member byte array: pure bump allocation with no heap traffic, then release() to reclaim the whole thing at tick end. For recycled fixed-size objects, unsynchronized_pool_resource.",
          "level": "core",
          "skill": "cpp.pmr"
        },
        {
          "q": "Your pool hands out raw slots but callers need to construct T with arbitrary constructor arguments. Write the signature, and say what each piece buys you.",
          "a": "template <class... A> T* alloc(A&&... a) { ... return new (slot) T{std::forward<A>(a)...}; } — a variadic pack takes any number of arguments of any types, A&&... in a deduced context binds to lvalues and rvalues alike, and std::forward preserves each argument's value category so an rvalue is still moved rather than copied. std::move would be wrong here: a pass-through must forward, not unconditionally steal. The result is a factory that adds no copies and inlines to the constructor call you would have written by hand.",
          "level": "core",
          "skill": "cpp.variadic-templates"
        },
        {
          "q": "You put a pmr::vector on a monotonic_buffer_resource inside on_book and call release() at the end of the tick. Where is the trap?",
          "a": "Lifetime order. release() reclaims the whole slab, so the container that borrowed from it must be destroyed *before* the reset — otherwise its destructor touches memory the resource has already handed back, and a later tick overwrites live data. The idiom is to scope the scratch container in an inner block and call release() after that block closes. The second trap is overflow: if the working set exceeds the buffer, monotonic_buffer_resource quietly falls back to the upstream heap resource, so you are allocating on the hot path again with nothing in the source to show it.",
          "level": "senior",
          "skill": "perf.arena-allocator"
        },
        {
          "q": "How would you prove that a \"zero-overhead\" template abstraction really is zero overhead compared with the virtual version?",
          "a": "Two ways, both empirical. Read the generated code: build the templated version and a hand-written version at the same optimisation level and compare the disassembly of the hot function — if the abstraction vanished, the instruction sequences match and there is no call left. Then confirm behaviourally on a fixed input: run both through the same recorded tape and compare p50 and p99.9, because an inlining failure shows up as a tail change long before it shows up in a mean. Claiming zero overhead from the language rules alone is how people ship an accidental indirect call — and a fourth instantiation of a fat template can make you front-end bound, which is the opposite failure and only visible in instruction-cache counters.",
          "level": "senior",
          "skill": "perf.virtual-cost"
        }
      ]
    },
    {
      "n": 4,
      "focus": "Compile-time dispatch & the order book",
      "tagline": "Move every decision the compiler can make out of the tick, then put what is left on a flat, cache-resident book.",
      "concepts": [
        {
          "title": "constexpr: make the compiler do the work",
          "text": "A constexpr function can run during compilation when its inputs are constants, and still works at run time; consteval must run then, so calling it with a runtime value is a compile error. Build a tick-size or fee table that way and the loop runs inside the compiler, the result ships as read-only data in the binary, and the hot path is one indexed load with no initialisation code and no branch. static_assert is where you park the assumptions — tick grids, struct sizes, alignments — so a violated one fails the build rather than the market.",
          "code": "constexpr std::array<double, 8> make_ticks() {\n  std::array<double, 8> t{};\n  for (int i = 0; i < 8; ++i) t[i] = (i < 4) ? 0.01 : 0.05;  // the loop runs in the COMPILER\n  return t;\n}\nconstexpr auto TICKS = make_ticks();              // read-only data in the binary\nstatic_assert(TICKS[0] == 0.01 && TICKS[7] == 0.05, \"tick grid drifted\");\nint main() { std::printf(\"%.2f %.2f\\n\", TICKS[3], TICKS[4]); }\n// 0.01 0.05",
          "deck": "Deck U4 · slides 5–6"
        },
        {
          "title": "Traits, tag dispatch and if constexpr",
          "text": "A type trait is a compile-time question about T — is_integral_v, is_same_v, your own is_order_message — answered during compilation and costing nothing at run time. Feed one into if constexpr and the untaken arm is discarded before code generation, so each instantiation contains exactly one path: nothing to test, nothing to mispredict, and an arm that would be ill-formed for the other type is never compiled. Tag dispatch does the same job through overload resolution, and the else arm is where you put an exhaustiveness static_assert so forgetting a message type becomes a build error.",
          "code": "struct PlaceOrder {}; struct BookSnapshot {};\ntemplate <class> constexpr bool always_false = false;       // the exhaustiveness trick\ntemplate <class T> const char* handle(const T&) {\n  if constexpr (std::is_same_v<T, PlaceOrder>)        return \"route\";   // only arm compiled\n  else if constexpr (std::is_same_v<T, BookSnapshot>) return \"decide\";\n  else static_assert(always_false<T>, \"unhandled message type\");        // fails the BUILD\n}\nint main() {\n  std::cout << handle(PlaceOrder{}) << ' ' << handle(BookSnapshot{}) << '\\n';\n}\n// route decide",
          "deck": "Deck U4 · slides 8–9"
        },
        {
          "title": "What a virtual call actually costs",
          "text": "A polymorphic object carries one hidden vptr to a per-class table of function addresses, so sizeof grows by eight the moment the first virtual appears. The call is two dependent loads plus an indirect branch — but the real bill is the inlining you lose and the branch mispredicts when a loop sees several targets. final or an exact known type lets the compiler devirtualise and inline through it. This is the run-time dispatch that the rest of the session replaces: CRTP and policies bind the call at compile time, so the vptr, the table and the indirect branch all disappear.",
          "code": "struct P { int a; };                              // plain\nstruct V { int a; virtual ~V() = default; };      // polymorphic: hidden vptr\nstd::cout << sizeof(P) << ' ' << sizeof(V) << ' ' << alignof(V) << ' '\n          << std::is_polymorphic_v<V> << '\\n';\n// 4 16 8 1     -- 8B vptr + 4B int + 4B padding",
          "deck": "Deck U4 · slide 11"
        },
        {
          "title": "CRTP and policy-based design",
          "text": "The Curiously Recurring Template Pattern templates a base on its own derived type, so the base can static_cast down and call the derived method: dispatch bound at compile time, fully inlinable, and no vptr, so an empty strategy really is one byte. Policy-based design is the same idea composed — pass SignalPolicy, RiskPolicy and ExecPolicy as template parameters and swapping a component is swapping a type, which means the compiler generates a fresh, fully inlined class rather than a flag you test per tick. The expensive part of a virtual call is not the vtable load, it is the inlining you lose behind it.",
          "code": "template <class D> struct Strategy {                 // base templated on its derived type\n  void on_book(double mid) { static_cast<D*>(this)->signal(mid); }   // no vtable\n};\nstruct Momentum : Strategy<Momentum> {\n  void signal(double mid) { std::printf(\"buy %.2f \", mid); }         // inlined\n};\nint main() {\n  Momentum m; m.on_book(100.01);\n  std::printf(\"%zu\\n\", sizeof(Momentum));            // no vptr at all\n}\n// buy 100.01 1",
          "deck": "Deck U4 · slides 11–12"
        },
        {
          "title": "Hash tables: chaining versus open addressing",
          "text": "Order-ID and symbol lookups are the workhorse, and both collision strategies are O(1) on average — the constant factor is decided by memory layout. Chaining (what std::unordered_map does) makes each bucket a linked list of heap nodes, so every collision is a pointer chase and a likely cache miss, and a rehash is an unbounded O(n) event at an unpredictable moment. Open addressing probes the next slot of one flat array, a power-of-two size turns the modulo into an AND, and the whole probe usually lives in one cache line — so reserve up front and keep the load factor under about 0.7.",
          "code": "struct Slot { uint64_t key = 0; uint32_t val = 0; bool used = false; };\nstd::array<Slot, 8> t{}; const uint64_t mask = 7;      // power of two -> AND, not %\nauto put = [&](uint64_t k, uint32_t v) {\n  uint64_t i = k & mask;\n  while (t[i].used && t[i].key != k) i = (i + 1) & mask;   // walk the NEXT slot\n  t[i] = {k, v, true};\n};\nput(1, 100); put(9, 900);                     // 9 & 7 == 1: they collide\nstd::cout << t[1].key << ' ' << t[2].key << ' ' << t[2].val << '\\n';\n// 1 9 900     -- the collision landed in the adjacent slot, same cache line",
          "deck": "Deck U4 · slides 14–16"
        },
        {
          "title": "The flat, price-indexed book — and the band it really is",
          "text": "Prices live on a fixed tick grid, so an integer index is exact and you never needed a general ordered map: index = (price - base) / tick makes each level a slot in one contiguous array, add and cancel index straight to the level, the touch is a cached index read with a single load, and matching walks adjacent slots in the direction the prefetcher expects. The trap is that a flat array covers a band, not all prices — 65,536 one-cent slots indexed absolutely from $0.00 only reach $655.35, and a $720 name indexes past the end into whatever member sits next to it, which is your own other side. That is an intra-object overflow, so AddressSanitizer does not see it and a test suite that only quotes near $100 stays green.",
          "code": "const double base = 99.00, tick = 0.01;        // index against a BASE tick\nstd::array<uint32_t, 256> bid_qty{}; int best = -1;\nauto idx = [&](double px) { return int((px - base) / tick + 0.5); };\nauto add = [&](double px, uint32_t q) {\n  const int i = idx(px);\n  if (i < 0 || i >= 256) return false;         // the BAND check ASan cannot see\n  bid_qty[i] += q; if (i > best) best = i;     // O(1), one cache line\n  return true; };\nbool in  = add(100.00, 800);\nbool oob = add(720.00, 500);                   // $720 is off a $99.00-$101.55 band\nstd::printf(\"%d %d %.2f %u\\n\", in, oob, base + best * tick, bid_qty[best]);\n// 1 0 100.00 800",
          "deck": "Deck U4 · slides 17–19"
        },
        {
          "title": "FIFO per level, and knowing your position in it",
          "text": "Price-time priority means better price first, then earliest arrival, and within one price the exchange holds a strict FIFO keyed on a monotonic sequence number rather than a timestamp, so ties are impossible. Your fill probability is set by how much size rests ahead of you, which is why queue_ahead is worth modelling locally: zero means you are at the front and about to trade. Repricing forfeits all of it — cancel and re-post puts you at the tail — so churning quotes is expensive even when sending is cheap, and half of market making is deciding whether the new price is worth the spot you just threw away.",
          "deck": "Deck U4 · slide 20"
        }
      ],
      "hft": {
        "text": "Compile-time dispatch removes the decisions; the flat book removes the cache misses — together they are the tick-to-trade path you are graded on.",
        "paragraphs": [
          "The two halves of this session look unrelated and are one idea: stop doing work during the race that you could have done at build time, or in a cache line you already own. A cache miss is around 100 ns and the arithmetic on a book update is a nanosecond or two, so that hundred-to-one ratio buys every design choice here — and the fastest instruction is still the one you never run.",
          "The wire gives you the closed type set that makes compile-time dispatch legitimate. The exchange's message schema is a pydantic discriminated union keyed on a \"type\" field — Handshake, PlaceOrder, OrderAck, BookSnapshot, CancelOrder — so the tag is the only run-time decision on the parse path, and it should be the last one you make. Mirror the union as a std::variant, dispatch with a visitor built out of if constexpr, and everything downstream of the parse boundary is static: no vtable, no std::function, no allocation.",
          "Virtual still has exactly one honest place in this design. The client base declares virtual void on_book(...) because it has to work with a bot it has never seen; CRTP and policies belong inside your on_book, not at that boundary. The rule is that an open type set is virtual's job and a closed one is the compiler's.",
          "On the data side, your job is to mirror the venue's book locally so on_book can go decode → update → decide entirely in cache. The engine is a CLOB with price-time priority keyed on a monotonic sequence, so your local model can be exact rather than approximate — same add/cancel/match rules, same FIFO per level — and reading the touch is one load off a cached best_bid / best_ask index rather than a traversal.",
          "Do not take any of it on faith. Benchmark the flat book and the open-addressing symbol map against std::map and std::unordered_map, warm up first, state your machine, and read p99.9 rather than the median: the std:: containers usually look acceptable on p50 and fall apart in the tail, because that is where a rehash or a node allocation lands."
        ],
        "example": {
          "title": "In the arena",
          "text": "course/hft-columbia/project-starter/include/order_book.hpp — the order-book stub exactly as the starter ships it, band warning included. The graded contract is four functions on Book plus two on SymMap, and SymMap::get returns (uint64_t)-1 when absent.",
          "code": "// project-starter/include/order_book.hpp\n// A fast order book (flat, price-indexed) + a fast symbol->id map.\n// side 'B'=bid, 'S'=ask.  SymMap::get returns (uint64_t)-1 if absent.\n//\n// Range warning: a flat array of N one-cent slots is a BAND, not \"all prices\".\n// 1<<16 slots indexed absolutely from $0.00 covers only $0.00-$655.35, and the\n// venue lists names near $720 - an absolute index walks off the end and,\n// because the two side arrays are adjacent members, silently corrupts the\n// OTHER side of your own book. ASan cannot see that (it is an intra-object\n// overflow) and these tests only use prices near $100, so CI will not catch it\n// for you. Index against a base tick (slot = tick - base_tick_) and\n// bounds-check both ends.\nstruct Book {\n    void add(uint64_t id, char side, double px, uint32_t qty);\n    void cancel(uint64_t id);\n    double best_bid() const;   // TODO(student): O(1)\n    double best_ask() const;   // TODO(student): O(1)\n};"
        }
      },
      "interview": [
        {
          "q": "What is the difference between constexpr and consteval, and what does static_assert add?",
          "a": "constexpr says a function or variable *can* be evaluated during compilation when its inputs are constant expressions, and it remains an ordinary function when they are not — so a constexpr function called with a runtime argument gives you no compile-time guarantee at all. consteval makes it an immediate function that *must* be evaluated at compile time; calling it with a runtime value is a hard error, so no runtime path exists. static_assert is the third leg: it checks a compile-time predicate and turns a violated assumption — a tick grid, a struct size, an alignment — into a failed build. If I want a guarantee with constexpr I either use consteval or assign the result to a constexpr variable.",
          "level": "warm-up",
          "skill": "cpp.constexpr"
        },
        {
          "q": "What is the difference between if and if constexpr?",
          "a": "A plain if is a run-time test: both branches are compiled and the CPU evaluates the condition and can mispredict it. if constexpr is evaluated during compilation and the untaken branch is discarded before code generation, so it is not even required to be valid for that instantiation — which is exactly why you cannot just write if (std::is_same_v<Msg, PlaceOrder>) and expect route(m) to compile for a BookSnapshot. So if constexpr costs nothing at run time and lets you write a branch that would otherwise be ill-formed. It is not #ifdef: the discarded branch still has to parse.",
          "level": "warm-up",
          "skill": "cpp.type-traits-constraints"
        },
        {
          "q": "Precisely what does a virtual call cost, and when does it actually hurt?",
          "a": "Mechanically: load the vptr out of the object, load the slot out of the vtable, then an indirect call — two dependent loads and a branch whose target is not known until the first load returns. On a loop with one hot target the predictor learns it and the marginal cost is a couple of nanoseconds; with several targets in the same loop you get mispredicts at roughly 15–20 cycles each. The larger cost is usually indirect: the compiler cannot inline through it, so constant folding stops at the call, and a fan-out of tiny virtuals scatters your instruction cache.",
          "level": "core",
          "skill": "perf.virtual-cost"
        },
        {
          "q": "Why size an open-addressing hash table to a power of two, and what is the worst thing std::unordered_map can do to you on a hot path?",
          "a": "A power-of-two capacity lets the wrap be hash & (size - 1) instead of a modulo, replacing an integer division of tens of cycles with one AND on the hottest line of the probe loop, and it makes the probe advance free: i = (i + 1) & mask. The discipline that goes with it is to reserve up front and keep the load factor below roughly 0.7, because probe chains lengthen sharply past that and average O(1) rots quietly toward O(n) in the tail. The worst thing unordered_map does is rehash: an unbounded O(n) reallocation at a moment you did not choose. Chaining is the second thing — a bucket is a linked list of separately allocated nodes, so a collision is a pointer chase and a likely miss.",
          "level": "core",
          "skill": "perf.open-addressing-hash"
        },
        {
          "q": "Why can a flat price-indexed array beat std::map for an order book even though the map is O(log n)?",
          "a": "Because prices are not arbitrary doubles: they sit on a tick grid, so (price - base) / tick is an exact integer index and the lookup is arithmetic instead of a search. The map's six or so pointer hops are six likely cache misses at roughly 100 ns each; the array is one indexed load into a line the prefetcher probably already has. Add and cancel become O(1), the touch is a cached best index read with zero traversal, and matching walks adjacent slots sequentially. The one operation that is not O(1) is a cancel that empties the inside level — then you scan inward for the next non-empty slot, which is rare and cache-friendly.",
          "level": "core",
          "skill": "trading.flat-order-book"
        },
        {
          "q": "Compare CRTP with virtual dispatch. When would you still choose virtual?",
          "a": "CRTP binds the call at compile time — the base static_casts to its derived type — so it inlines completely, adds no vptr and no indirect branch, and an empty policy costs one byte. A virtual call is two dependent loads plus an indirect branch, and the second load waits on the first; but the real bill is the inlining barrier, because constant folding, register allocation and dead-store elimination all stop at the call. The catch with CRTP is that the concrete type must be known at compile time, so I still use virtual where the type set is genuinely open or where flexibility is worth more than nanoseconds — configuration, logging, and the client boundary — never in the tick-to-trade body.",
          "level": "core",
          "skill": "cpp.crtp-policies"
        },
        {
          "q": "How do you track your own queue position, and why does it matter?",
          "a": "Per price level the venue holds a FIFO keyed on a monotonic sequence number rather than a timestamp, so ties are impossible and your position is the total remaining size of orders that arrived before yours. In this arena it is handed to you: the order ack carries queue_ahead and level_qty when your order rests, so you keep a per-order record and decrement it as fills and cancels ahead of you land. It matters because fill probability is a function of the size in front of you, and because a reprice resets it to the back — cancel and re-post forfeits every bit of time priority you earned, which makes a quote adjustment a real, measurable cost rather than a free action.",
          "level": "core",
          "skill": "trading.queue-position"
        },
        {
          "q": "You are given a wire protocol with five message types, all known at build time. How do you dispatch on the hot path — and how would you prove the abstraction really cost nothing?",
          "a": "Turn the tag into a type once, at the parse boundary — a switch on the discriminator is a single well-predicted compare and jump — then stay static. Model the union as std::variant<A,B,C,D,E> and dispatch with std::visit over a generic visitor that uses if constexpr per type, with the else arm holding a static_assert so a forgotten type is a build error rather than a silent drop: no vtable, no allocation, handlers inline. Proving it is empirical, twice. Read the generated code: build the templated version and a hand-written one at the same optimisation level and compare the disassembly of the hot function — if the abstraction vanished there is no call left. Then confirm behaviourally on a fixed recorded tape and compare p50 and p99.9, because an inlining failure shows up in the tail long before it shows up in a mean.",
          "level": "senior",
          "skill": "cpp.variant-visit"
        },
        {
          "q": "Your flat book is indexed absolutely from $0.00 with 65,536 one-cent slots. A name lists at $720, nothing crashes, sanitizers are clean and CI is green. What is happening, and how do you find it?",
          "a": "The array is a $655.35-wide band, so $720 indexes about 6,500 slots past the end. Because the bid and ask arrays are adjacent members of one object, the write lands inside your own struct on the other side — a bid at $719.98 is tick 71,998, which is 6,462 past the end, so it adds its size to the ask side at $64.62. The book then reports resting size no venue ever sent, on the wrong side, at a price nobody quoted, and the bot crosses a spread that does not exist. ASan cannot see it because it instruments boundaries *between* allocations, not between two members inside one object, and a test suite that only quotes near $100 never reaches the edge. The fix is structural: index relative to a base tick placed on the first price you ever see, bounds-check both ends on the write path, and decide an explicit policy for an out-of-band price — re-base the window, or reject and log. To catch it, diff against a slow, obviously-correct map-based shadow book on a replayed tape and stop at the first divergence.",
          "level": "senior",
          "skill": "trading.flat-order-book"
        }
      ]
    },
    {
      "n": 5,
      "focus": "Complexity, the cache & atomics",
      "tagline": "Big-O hides the constant, so count cache misses, update instead of recomputing — then reason about what one thread's writes another can actually see.",
      "concepts": [
        {
          "title": "Big-O is asymptotic; the constant is your grade",
          "text": "O(1), O(log n) and O(n) describe growth as n goes to infinity and say nothing about the constant that dominates when n is small — and a hot book is small. Finding a value among 64 elements, a red-black tree is O(log n), about six pointer hops, each a likely cache miss: call it 600 ns. A linear scan of 64 contiguous elements is O(n) but touches roughly eight cache lines, is prefetched, and predicts almost perfectly — tens of nanoseconds. The honest unit of complexity at this scale is memory accesses, not instructions, and the crossover n is something you measure on your machine rather than assume.",
          "deck": "Deck U5 · slides 5–6"
        },
        {
          "title": "Amortized is not worst case",
          "text": "vector::push_back is O(1) amortized: most pushes are a store, and occasionally the vector reallocates and copies everything, which is O(n). Averaged over the sequence that is constant — but p99.9 lives in the worst case, and one reallocation mid-race is the tail. reserve() converts a handful of O(n) spikes into zero, and that is the shape of every optimisation that actually moves the tail: pre-allocate and pool up front, prefer contiguity to pointers, do less work, then profile and re-measure the percentile you claim to be optimising.",
          "code": "std::vector<int> grow, pre; pre.reserve(1000);\nauto count = [](std::vector<int>& v) {\n  std::size_t n = 0, cap = v.capacity();\n  for (int i = 0; i < 1000; ++i) { v.push_back(i);\n    if (v.capacity() != cap) { ++n; cap = v.capacity(); } }\n  return n;                                    // how many O(n) reallocations\n};\nstd::cout << count(grow) << ' ' << count(pre) << '\\n';\n// 11 0     -- eleven copy-everything events, or none",
          "deck": "Deck U5 · slides 5, 7"
        },
        {
          "title": "The ring buffer is the rolling window",
          "text": "A market feed is an unbounded stream but you only need the recent past, so store it in a fixed-capacity circular array: allocated once, never grows, O(1) push that overwrites the oldest slot, contiguous storage the cache likes. Make the capacity a power of two and index with & (N - 1): a modulo on a non-power-of-two N is an integer division of 20–40 cycles, and the oldest-element expression head - count + i is unsigned, so it wraps — the wrap only still gives the right answer when N divides 2^64. One static_assert fixes a performance bug and a correctness bug at once. The ring *is* the window; the only remaining question is how you compute over it as it slides.",
          "code": "template <class T, std::size_t N> struct Ring {              // the tape\n  static_assert((N & (N - 1)) == 0, \"N must be a power of two\");\n  std::array<T, N> buf{}; std::size_t head = 0, count = 0;\n  void push(T x) { buf[head] = x; head = (head + 1) & (N - 1);   // O(1), no alloc\n                   if (count < N) ++count; }\n  T operator[](std::size_t i) const { return buf[(head - count + i) & (N - 1)]; }\n};\nint main() {\n  Ring<int, 4> r; for (int i = 1; i <= 6; ++i) r.push(i);   // 1 and 2 overwritten\n  std::cout << r.count << ' ' << r[0] << ' ' << r[3] << '\\n';   // r[0] is the OLDEST\n}\n// 4 3 6",
          "deck": "Deck U5 · slides 9–10"
        },
        {
          "title": "Update, don't recompute",
          "text": "Looping the whole window every tick to get a mean or a standard deviation is O(k) work you repeat needlessly — and O(k) per tick across millions of ticks, spiking in the volatile moments that decide the race, is a blown tail. An online algorithm folds each new observation into a few scalars in constant time: a running mean, Welford's numerically stable variance, and an EMA that needs no buffer at all. Three scalars is 24 bytes, half a cache line, against 512 bytes and a loop for a 64-deep window of doubles — same statistic, a fortieth of the footprint, and a flat cost on every tick.",
          "code": "struct Online {                                    // O(1) time, O(1) space\n  long n = 0; double mean = 0, m2 = 0, ema = 0, a = 0.2;\n  void update(double x) { ++n; double d = x - mean;\n    mean += d / n;                                 // running mean\n    m2   += d * (x - mean);                        // Welford's M2\n    ema   = (n == 1) ? x : a * x + (1 - a) * ema; }\n  double var() const { return n > 1 ? m2 / (n - 1) : 0.0; }\n};\nOnline o; for (double x : {2., 4., 4., 4., 5., 5., 7., 9.}) o.update(x);\nstd::printf(\"%ld %.2f %.4f %.4f\\n\", o.n, o.mean, o.var(), o.ema);\n// 8 5.00 4.5714 5.2910",
          "deck": "Deck U5 · slides 12–13"
        },
        {
          "title": "Threads share memory, and a data race is undefined behaviour",
          "text": "A std::thread is an independent instruction stream in the same address space — stacks are private, the heap and globals are shared — and the OS interleaves them arbitrarily, so never assume an ordering you did not enforce. When two threads touch the same location, at least one writes, and nothing synchronises them, that is a data race and the standard makes no guarantee at all: not “a stale value” but torn reads, lost updates, or the optimiser caching the variable in a register and deleting your check. ++counter is load, add, store. std::atomic then does two separate jobs — an indivisible operation *and* a knob for ordering — and conflating them is where the bugs come from.",
          "code": "long racy = 0; std::atomic<long> safe{0};\nauto work = [&] { for (int i = 0; i < 100000; ++i) {\n    ++racy;                                                    // DATA RACE -> UB\n    safe.fetch_add(1, std::memory_order_relaxed); } };         // atomic, unordered\nstd::thread t1(work), t2(work); t1.join(); t2.join();\nstd::cout << safe.load() << ' ' << (racy <= 200000) << ' '\n          << safe.is_lock_free() << '\\n';\n// 200000 1 1     -- safe is exact; racy is not even well-defined",
          "deck": "Deck U5 · slides 15–16 · Deck U5 · slide 18"
        },
        {
          "title": "Happens-before, acquire/release, and why a lock on the hot path is a tail bomb",
          "text": "Correctness is not about time, it is about the happens-before relation: if A happens-before B then B sees A's writes, and otherwise there is no guarantee whatsoever. Program order gives sequenced-before within a thread, a release store synchronises-with an acquire load that observes it across threads, and the relation is transitive — so you chain edges to prove visibility. Think in edges, not clocks: a 5 GHz core's write does not “land first”. Pick the weakest order you can prove correct — relaxed for a free-running counter, acquire/release to hand data over, seq_cst when you want one global order and will pay for it. And keep mutexes off the tick path: uncontended they are tens of nanoseconds, contended they block in the kernel on a futex, and a low-priority holder can stall your hot thread without bound. p50 barely moves; p99.9 detonates.",
          "code": "int payload = 0; std::atomic<bool> ready{false};\nstd::thread prod([&] { payload = 42;                            // (1) write the data\n  ready.store(true, std::memory_order_release); });             // (2) release: publishes (1)\nstd::thread cons([&] {\n  while (!ready.load(std::memory_order_acquire)) { }            // (3) acquire\n  std::printf(\"%d\\n\", payload); });                             // (4) guaranteed to see (1)\nprod.join(); cons.join();\n// 42",
          "deck": "Deck U5 · slide 17 · Deck U5 · slides 19–21"
        }
      ],
      "hft": {
        "text": "Choose storage and computation that survive the tail, then reason correctly about the thread boundary you already have.",
        "paragraphs": [
          "on_book hands you microprice and order-book imbalance already computed, which makes the trade-off explicit: the signal inputs are free, but every microsecond you spend on top of them costs queue position. An incremental estimator costs the same tiny amount on every tick; a windowed recompute costs nothing most of the time and blows out exactly when volatility raises the message rate.",
          "So the shape of a hot-path signal is fixed: ring-buffer the recent tape (allocated once, overwritten in place), fold each tick into scalar online state, and act on the result. A z-score against an EMA and a Welford standard deviation is a few multiply-adds on cache-resident data — no window loop, no allocation, a flat cost distribution. The classic mistake in that code is keying the per-symbol state on a std::string, which hashes the string and chases a node every tick; map the symbol to a small integer once with the previous session's symbol map, then index flat arrays.",
          "You already have two threads whether you thought about it or not. The WebSocket transport reads the socket and decodes on its own background receive thread, then calls your handlers, and your strategy logic runs inside on_book. The moment data crosses that boundary you are in the C++ memory model, and “it worked on my laptop” is not evidence: races are timing-dependent, so they pass on a quiet machine and fail under load — which is precisely when you are being graded.",
          "What you do instead of locking is publish. Write the book payload, then release-store a sequence number; the consumer acquire-loads the sequence, copies the payload, and re-reads the sequence to check it did not change mid-copy, retrying if it did. That is a correct, lock-free, single-writer handoff with no kernel involvement, and it is the direct ancestor of the SPSC ring in the next session.",
          "Reason from the model and treat the run as a check, not a proof. A missing barrier often “works” on x86, whose model is strong enough to hide the bug, and then fails on ARM; and the optimiser reorders non-atomic accesses regardless of the hardware. Build a separate binary with -fsanitize=thread and drive it with a recorded tape, because a tool that reasons about happens-before finds what a test cannot."
        ],
        "example": {
          "title": "In the arena",
          "text": "course/hft-columbia/project-starter/include/rolling_counter.hpp — the sliding-window event counter, including the unsigned-clock edge case that costs most people a test. Amortized O(1) behaviour and correctness at that edge are both part of the grade.",
          "code": "// project-starter/include/rolling_counter.hpp\n// Sliding-window event counter. count() is called with a non-decreasing clock.\n//\n// Edge case that costs most people a test: ts_ns and now_ns are UNSIGNED. Early\n// on, now_ns <= window_ns and the mathematical cutoff (now - window) is\n// negative - there is no uint64_t that means that, and there is no safe value\n// to clamp it to. Only compute the subtraction when it is meaningful; do not\n// expire anything before then.\nstruct RollingCounter {\n    explicit RollingCounter(uint64_t window_ns);  // ring/deque; amortized O(1)\n    void add(uint64_t ts_ns);\n    uint64_t count(uint64_t now_ns);   // events with ts > now - window\n};"
        }
      },
      "interview": [
        {
          "q": "What does “amortized O(1)” mean for vector::push_back, and why might that not be good enough?",
          "a": "Most pushes are a single store; when capacity is exhausted the vector allocates a larger buffer and moves every element, which is O(n), and averaging that over the whole sequence gives constant cost per push. It is not good enough on a latency path because you are graded on the worst operation, not the average: that one reallocation is an allocation plus an O(n) copy landing on an arbitrary tick. reserve() the capacity up front and the spikes disappear — amortized O(1) is really “O(1) usually and O(n) once in a while”, and once in a while is the tick you lose the race on.",
          "level": "warm-up",
          "skill": "perf.amortized-reserve"
        },
        {
          "q": "Give the recurrence for an exponential moving average and say why it is attractive on a hot path.",
          "a": "ema = alpha * x + (1 - alpha) * ema, with alpha in (0,1] setting how fast old observations decay. It is one multiply-add, it needs O(1) state and no history buffer at all, and there is no window boundary to handle. So the cost is identical on every tick, which is exactly the property a tail-sensitive path wants, unlike a windowed mean whose cost depends on the window length. The honest caveat is that an EMA never forgets an outlier completely, so it is not the same statistic as a mean over the last k ticks.",
          "level": "warm-up",
          "skill": "perf.incremental-computation"
        },
        {
          "q": "A linear scan of a 64-element array beats a balanced tree lookup on the same data. Explain why, and say how you would find the crossover.",
          "a": "The tree is O(log n) — about six comparisons — but each step dereferences a separately allocated node, so it is six probable cache misses at roughly 100 ns each, and the comparison branch is data-dependent and mispredicts. The array scan is O(n) in comparisons but touches only about eight 64-byte lines, the prefetcher streams ahead of it, and the loop branch predicts almost perfectly. To find the crossover I measure both on the real element type across a range of n on the target machine and report percentiles rather than means — it is a hardware property, not a theorem, so quoting someone else's number for your hardware is meaningless.",
          "level": "core",
          "skill": "perf.complexity-in-cache-terms"
        },
        {
          "q": "You are writing a fixed-capacity ring buffer for the last N prices. Why insist on a power-of-two N, and where does the index arithmetic bite people?",
          "a": "Two reasons that happen to be the same rule. Performance: index & (N - 1) is one cycle where index % N is an integer division of 20–40 cycles, and you do it twice per tick. Correctness: the natural expression for the oldest element, head - count + i, is unsigned, so when it goes “negative” it wraps modulo 2^64 — and taking the modulo afterwards only still gives the right slot when N divides 2^64, which means N must be a power of two. So I write static_assert((N & (N - 1)) == 0) and index with the mask. The related unsigned trap is a sliding-window cutoff computed as now - window before now exceeds window: there is no unsigned value that means a negative cutoff and nothing safe to clamp to, so you only compute the subtraction when it is meaningful.",
          "level": "core",
          "skill": "cpp.ring-buffer"
        },
        {
          "q": "Explain the acquire/release pattern, and say when memory_order_relaxed is a bug.",
          "a": "The producer writes a plain payload and then performs a release store on an atomic flag; the consumer performs an acquire load of that flag and, if it observes the stored value, reads the payload. The release store synchronises-with the acquire load, which makes everything sequenced before the store happen-before everything sequenced after the load, so the payload write is guaranteed visible. It is cheaper than seq_cst because it only forbids the reorderings that would break that one handoff. relaxed is right when you need atomicity but no ordering — a free-running fill or statistics counter whose total someone reads later. It is a bug whenever the atomic signals that *other* memory is ready, because relaxed creates no happens-before edge and the consumer can see the flag set while the payload writes are still invisible.",
          "level": "core",
          "skill": "cpp.atomics-memory-order"
        },
        {
          "q": "Why does an uncontended mutex look cheap in a benchmark and still ruin a latency tail in production?",
          "a": "Uncontended, lock and unlock are an atomic exchange and a store — tens of nanoseconds, which is what the benchmark measures. Contended, the loser may block in the kernel on a futex, which means a context switch and a scheduler wake-up: hundreds of nanoseconds to microseconds, and unbounded if a lower-priority thread holds the lock and is not currently scheduled. Contention correlates with market activity, so the expensive case lands exactly on the ticks you needed to win, and the blocking time depends on the scheduler rather than on your code — the opposite of the determinism the whole exercise is chasing. Locks are correct; they just belong off the tick path.",
          "level": "core",
          "skill": "perf.lock-tail-cost"
        },
        {
          "q": "Design a single-writer, single-reader handoff of the latest book snapshot with no locks, and say how the reader detects a torn read.",
          "a": "Use a sequence counter alongside a plain payload: the writer increments the sequence with a release store after writing the payload, and the reader acquire-loads the sequence, copies the payload, then acquire-loads the sequence again and accepts the copy only if the two reads agree. A mismatch means the writer was mid-update, so the reader retries — it never blocks and the writer never waits. The stricter version is the seqlock, where the writer makes the sequence odd before writing and even after, so a reader can also reject while a write is in flight. The trade-off is that the reader can starve under a very hot writer, which is acceptable here because staleness, not blocking, is the failure mode you want on a market-data path.",
          "level": "senior",
          "skill": "cpp.atomics-memory-order"
        },
        {
          "q": "Your per-tick signal is O(1) and p50 is excellent, but p99.9 is ten times p50. Where do you look?",
          "a": "O(1) arithmetic cannot produce that spread, so the cost is not in the algorithm — it is something rare and expensive on the same path. The usual suspects, in order: an allocation or container growth I did not notice, a first-touch page fault on state that is only used occasionally, a std::string hash or node lookup keyed on a symbol, a lock I forgot was there, and the OS preempting the thread. I reproduce it on a fixed recorded tape so it is deterministic, then use the profiler and the fault and cache-miss counters instead of reasoning, and I accept the fix only if p99.9 moves on that same tape.",
          "level": "senior",
          "skill": "perf.tail-diagnosis"
        }
      ]
    },
    {
      "n": 6,
      "focus": "Lock-free pipelines & shared memory",
      "tagline": "Assemble atomics into a real structure — one writer, one reader, a bounded ring — and then push the same ring across a process boundary.",
      "concepts": [
        {
          "title": "Compare-and-swap is the atom of lock-free",
          "text": "Every lock-free structure sits on one hardware primitive: an atomic read-modify-write that succeeds only if the value still equals what you expected. You read, compute your update, and retry in a loop if someone changed it underneath you — no thread ever blocks and nothing is ever parked by the kernel, which is the whole reason it fixes the tail. On failure the expected variable is refreshed with the value actually seen, which is what makes the retry loop work and why you must recompute the desired value *inside* the loop; compare_exchange_weak may fail spuriously and is the cheap choice there.",
          "code": "std::atomic<int> v{7}; int tries = 0;\nint expected = v.load(), desired;\ndo { desired = expected * 2; ++tries; }        // recompute INSIDE the loop\nwhile (!v.compare_exchange_weak(expected, desired));   // swap only if unchanged\nint stale = 99;                                // a CAS with a stale expected FAILS\nbool ok = v.compare_exchange_strong(stale, 0); // ...and refreshes `stale`\nstd::cout << v.load() << ' ' << tries << ' ' << ok << ' ' << stale << '\\n';\n// 14 1 0 14",
          "deck": "Deck U6 · slide 5"
        },
        {
          "title": "ABA, and what “lock-free” actually promises",
          "text": "CAS compares a value, not a history: if another thread changes A to B and back to A, your CAS succeeds although the world moved — classically a freed and recycled node in a lock-free stack. The fixes are a version counter next to the value, hazard pointers, or epoch-based reclamation, and notice what they all are: memory-reclamation schemes. ABA is not really a CAS problem, it is a “who is allowed to free this” problem, and reclamation is where most real lock-free bugs live. The guarantees are also a hierarchy, not one property: wait-free means every thread finishes in a bounded number of steps, lock-free means at least one thread always progresses (yours may starve), obstruction-free means a thread run in isolation completes.",
          "code": "std::atomic<uint64_t> bare{0xA};               // the value a reader saw as \"A\"\nuint64_t exp1 = bare.load();\nbare.store(0xB); bare.store(0xA);              // another thread: A -> B -> A\nbool fooled = bare.compare_exchange_strong(exp1, 0xC);     // succeeds anyway\nstd::atomic<uint64_t> tagged{(1ull << 32) | 0xA};          // version | value\nuint64_t exp2 = tagged.load();\ntagged.store((2ull << 32) | 0xB); tagged.store((3ull << 32) | 0xA);\nbool caught = !tagged.compare_exchange_strong(exp2, 0xC);  // version moved: rejected\nstd::cout << fooled << ' ' << caught << '\\n';\n// 1 1     -- a bare CAS cannot see A->B->A; a version counter can",
          "deck": "Deck U6 · slide 6"
        },
        {
          "title": "The SPSC ring buffer — and why alignas(64) is not decoration",
          "text": "Single-producer/single-consumer is the sweet spot because with exactly one writer per index you need no CAS at all, just an atomic head and tail with acquire/release. The producer loads its own index relaxed (nobody else writes it), acquire-loads the other index to see slots the consumer has freed, writes the slot, then release-stores its index so the payload cannot be reordered after the publication; the consumer mirrors it. Capacity is a power of two so the wrap is a mask, the counters are monotonic and the storage is allocated once. And each index gets its own cache line: the producer writes one on every push and the consumer writes the other on every pop, so sharing a 64-byte line makes the two cores invalidate each other on every operation — still correct, just silently serialised in a way no profiler labels.",
          "code": "template <class T, std::size_t N> struct Spsc {   // N a power of two; pop() mirrors push()\n  std::array<T, N> b_{};\n  alignas(64) std::atomic<std::size_t> h_{0}; alignas(64) std::atomic<std::size_t> t_{0};\n  bool push(const T& v) {\n    auto h = h_.load(std::memory_order_relaxed);                    // we own h_\n    if (h - t_.load(std::memory_order_acquire) == N) return false;  // full\n    b_[h & (N - 1)] = v;                                            // slot FIRST...\n    h_.store(h + 1, std::memory_order_release); return true; }      // ...then publish\n};\nint main() { Spsc<int, 4> q; int n = 0; for (int i = 1; i <= 6; ++i) n += q.push(i);\n  std::printf(\"%d %zu\\n\", n, sizeof q); }       // 4 fit, 2 refused; 3 cache lines\n// 4 192",
          "deck": "Deck U6 · slides 8–9"
        },
        {
          "title": "Bounded is a feature: back-pressure",
          "text": "When head catches tail the buffer is full and push fails fast, which forces you to make a decision instead of blocking: drop the oldest, drop the newest, or coalesce stale book snapshots into the latest one. That returning false is not an error path — it is the only place in the design where you get to choose what to sacrifice, and a system that skips the choice makes it anyway, badly, at the worst moment. An unbounded queue hides a slow consumer until it converts a throughput problem into a memory-and-latency blowout, and blocking the producer puts a lock's worst property back on the socket thread. The related tail-killer is head-of-line blocking: one fat item delays every tick behind it, so keep messages small and fixed-size and do the heavy work off the queue.",
          "code": "std::array<int, 4> q{}; std::size_t head = 0, tail = 0; int latest = 0;\nauto push = [&](int v) {                            // bounded: false when full\n  if (head - tail == q.size()) { latest = v; return false; }  // coalesce: keep newest\n  q[head++ & 3] = v; return true; };\nint accepted = 0;\nfor (int tick = 1; tick <= 7; ++tick) accepted += push(tick);\nstd::printf(\"%d %d %d\\n\", accepted, latest, q[tail & 3]);\n// 4 7 1     -- 4 queued, ticks 5-6 discarded, tick 7 kept as the latest snapshot",
          "deck": "Deck U6 · slide 10"
        },
        {
          "title": "Across processes: the shared-memory ring",
          "text": "The same lock-free ring works between two *processes* if it lives in a region both map — shm_open plus mmap gives you the same bytes behind two page tables, and cross-process atomics obey the same memory model, so the release/acquire happens-before edge holds across the boundary unchanged. Splitting the feed handler from the strategy buys isolation: a crash in one process cannot take the other down, and each pins its own core. Two rules change, and they are the whole design. No pointers in the region, because a pointer is only valid in one address space — store indices or offsets, so the structure is position-independent. And plain-old-data with a fixed layout: no std::string, no std::vector, no virtuals, because a heap pointer and a vptr are both addresses that mean nothing to the other process. The creator calls init() exactly once, before fork().",
          "code": "struct ShmRing {                                  // POD: no pointers, no vtable\n  static constexpr uint32_t CAPACITY = 1024;      // power of two\n  std::atomic<uint32_t> head, tail; uint64_t buf[CAPACITY];    // inline storage\n  void init() { head.store(0); tail.store(0); }   // once, by the creator, before fork()\n  bool push(uint64_t v) { uint32_t h = head.load(std::memory_order_relaxed);\n    if (h - tail.load(std::memory_order_acquire) == CAPACITY) return false;\n    buf[h & (CAPACITY - 1)] = v;                  // indices only: offset-safe\n    head.store(h + 1, std::memory_order_release); return true; }\n};\nint main() { static ShmRing r; r.init();          // as if placed in an mmap'd region\n  std::printf(\"%zu %d %d\\n\", sizeof r, (int)std::is_standard_layout<ShmRing>::value, (int)r.push(42)); }\n// 8200 1 1",
          "deck": "Deck U6 · slides 12–13"
        },
        {
          "title": "The standard coordination primitives",
          "text": "C++20 ships what people used to hand-roll: std::latch is a one-shot gate you count down to zero, std::barrier is a reusable rendezvous for looping workers, and counting_semaphore bounds how many threads hold a resource — all preferable to an ad-hoc condition variable because they are tested, portable and lock-free where the platform allows. You need exactly one of them here: a latch or barrier to line the producer and consumer up before a timed run, so your throughput number measures the ring rather than thread startup. Separately, since C++17 the STL algorithms take an execution policy — seq, par, par_unseq — which moves a loop to many cores or to SIMD lanes; but par is a thread pool you did not configure making scheduling decisions you cannot see, so it belongs in the tooling (sorting a tape, batch analytics, the replay harness) and essentially never in a single tick.",
          "deck": "Deck U6 · slides 15–16"
        }
      ],
      "hft": {
        "text": "Take the lock off the hot path: connect the socket reader to the strategy with a bounded lock-free ring that holds its p99.9 as the rate climbs — in one process or across two.",
        "paragraphs": [
          "The producer and the consumer already exist in your bot. The WebSocket transport runs a background receive thread that decodes each inbound frame, and your strategy runs in on_book. The previous session made a single-slot handoff correct; this one makes it a queue, so a burst of updates does not have to be consumed at exactly the rate it arrives — with no lock anywhere on the path. Lock-free is not “faster locks”: it is a different guarantee, that no thread can be blocked by another thread's scheduling, and that is why it fixes the tail rather than the mean.",
          "SPSC is chosen deliberately, not for simplicity. With one writer per index there is no contention on either index and therefore no CAS, so push and pop are a relaxed load, an acquire load, a slot access and a release store — four atomic operations per item, zero syscalls, zero retries. It also sidesteps ABA entirely, because nothing is freed and recycled and the indices are monotonic counters rather than reused pointers. MPSC needs CAS on the producer side, so pay for that only when you genuinely have several writers.",
          "Bounded capacity is what protects the tail under a storm. Some scenarios deliberately spike the message rate, and a fixed ring with a coalescing policy holds its percentiles as the rate climbs, while a lock or an unbounded queue converts the storm into head-of-line blocking and a p99.9 blowup. For top-of-book data, dropping is usually better than queueing — a stale snapshot has no value once a fresher one exists — but fills and acks are not idempotent, so they belong on a separately sized queue where a full ring is an alertable incident rather than a policy choice. Coalescing lives in your bot, above the ring, not inside the graded queue contract.",
          "Then the same structure crosses a process boundary. The shared-memory ring is a POD of atomics plus an inline fixed array, initialised once by the creator before fork, containing no pointers at all — and the surprising part is how little changes: one release store, one acquire load, now spanning two address spaces, with no kernel in the fast path. Shared memory is not messaging; it is the same memory, and every rule you learned about threads applies verbatim.",
          "The correctness bar is tool-enforced, not argued: one producer, one consumer, millions of items, assert nothing is lost or reordered, and the same test clean under ThreadSanitizer. If TSan flags a race you almost certainly weakened an ordering to relaxed where acquire/release was required — fix the pairing, not the symptom. And the ring is safe for exactly one producer and one consumer: two threads calling push is undefined behaviour that can still give you a clean TSan run on a lucky day."
        ],
        "example": {
          "title": "In the arena",
          "text": "course/hft-columbia/project-starter/include/shm_ring.hpp — the cross-process phase of the project: a POD ring that lives entirely inside a shared-memory region, with the single-process version in course/hft-columbia/project-starter/include/spsc_ring.hpp and the cross-thread stress and ThreadSanitizer run driven by course/hft-columbia/project-starter/tests/spsc_concurrency.cpp.",
          "code": "// project-starter/include/shm_ring.hpp\n// POD ring living entirely in a shared-memory region (NO pointers),\n// usable across processes. init() is called once by the creator before fork().\nstruct ShmRing {\n    static constexpr uint32_t CAPACITY = 1024;   // power of two\n    void init() {\n        // TODO(student): initialize head/tail (atomics) to 0.\n    }\n    bool push(uint64_t v);      // producer; false if full\n    bool pop(uint64_t& out);    // consumer; false if empty\n    std::atomic<uint32_t> head, tail; uint64_t buf[CAPACITY];\n};"
        }
      },
      "interview": [
        {
          "q": "What does compare_exchange do, why is it always written in a loop, and when do you use weak versus strong?",
          "a": "It atomically compares the object with an expected value and, only if they are equal, replaces it with the desired value; it returns whether it succeeded and, on failure, updates expected with the value actually seen. It lives in a loop because failure means someone else modified the object, so you recompute your update from the refreshed value and try again — and the update must be recomputed inside the loop, or you keep re-proposing a value derived from data that has moved. weak is allowed to fail spuriously, typically because the underlying load-linked/store-conditional was interrupted, so it is the cheap choice inside a retry loop you were writing anyway; strong only fails on a genuine mismatch and suits a one-shot attempt you want to branch on.",
          "level": "warm-up",
          "skill": "cpp.compare-and-swap"
        },
        {
          "q": "What is std::latch for, how does it differ from std::barrier, and where would you actually use one?",
          "a": "Both are C++20 coordination primitives. A latch is a one-shot gate: threads count it down and waiters are released when it reaches zero, and it cannot be reset. A barrier is the reusable version — arrive_and_wait rendezvouses a fixed set of threads once per phase, so it suits looping workers. The concrete use in a latency benchmark is to line the producer and consumer up before the timed section, so the number you report measures the queue in steady state rather than thread startup; without it the first microseconds of the measurement are scheduler noise. Both are preferable to a hand-rolled condition variable: tested, portable, and lock-free where the platform allows.",
          "level": "warm-up",
          "skill": "cpp.cpp20-coordination"
        },
        {
          "q": "In an SPSC ring's push, which memory orders go where, and why?",
          "a": "The producer loads its own write index relaxed — nobody else writes it, so relaxed is not a shortcut, it is the correct order, and program order within the thread already gives what you need. It acquire-loads the consumer's index, so that it observes the consumer's release store and therefore knows the slot it is about to overwrite has really been read. It writes the slot, then release-stores its index incremented, so the slot write cannot be reordered after the index publication — which is exactly what guarantees the consumer never reads a slot before its data is visible. pop is the mirror image. Getting the release on the published index wrong is the classic bug, and it usually still passes on x86.",
          "level": "core",
          "skill": "perf.spsc-ring"
        },
        {
          "q": "Why must the ring's capacity be a power of two, and why are the two indices alignas(64)?",
          "a": "A power-of-two capacity lets the wrap be pos & (capacity - 1) instead of pos % capacity, replacing an integer division of 20–40 cycles with a single-cycle AND on the hottest line of the queue, twice per item. The alignment is about false sharing: one index is written by the producer on every push and the other by the consumer on every pop, so if they share a 64-byte line the two cores invalidate each other's copy on every operation and the queue degrades the harder you drive it. Padding each index onto its own line removes the coherence traffic. Worth noting that padding the indices from each other is not enough if the backing array is declared immediately before them — the tail of the array can still land on the first index's line.",
          "level": "core",
          "skill": "perf.cache-line-alignment"
        },
        {
          "q": "The queue is full. What are your options, and which one fits market data?",
          "a": "Block the producer, grow without bound, drop the newest, drop the oldest, or coalesce. Blocking is the worst: you have just put a lock's blocking behaviour back on the socket thread, so now you are not reading the wire either. Growing without bound converts a latency failure into a memory failure and hides the slow consumer until the machine swaps. For top-of-book snapshots coalescing is right — a newer snapshot supersedes an older one, so keeping only the latest pending entry stays current and bounded at the same time. For fills and acks, which are not idempotent, you cannot drop, so those go on a separately sized queue and a full one is an incident to alert on rather than a policy decision.",
          "level": "core",
          "skill": "perf.back-pressure"
        },
        {
          "q": "You want the same lock-free ring between two processes rather than two threads. What changes, and what does not?",
          "a": "What does not change is the synchronisation: you place the structure in a region created with shm_open and mapped into both processes with mmap, and the atomics work across it because cache coherence is a hardware property, not a process property — one release store and one acquire load give you the same happens-before edge spanning two address spaces, with no kernel in the fast path. What changes is the layout contract. No pointers may live in the region, because a pointer is only meaningful in one address space, so you store indices or offsets and the structure is position-independent; and it must be plain-old-data with a fixed layout — no std::string, no std::vector, no virtual functions, since a heap pointer and a vptr are both addresses. The creator initialises the region exactly once before forking, or the two sides race on the counters before either has started.",
          "level": "core",
          "skill": "perf.shared-memory-ring"
        },
        {
          "q": "What is the ABA problem, and does it affect an SPSC ring buffer?",
          "a": "ABA is when a CAS succeeds because the value it compares has returned to its original bit pattern even though the structure changed underneath — classically a freed and recycled node in a lock-free stack, where the old head pointer looks valid but no longer means the same thing. It does not affect an SPSC ring, for two reasons: the ring performs no CAS at all, and its indices are monotonically increasing counters rather than recycled pointers, so a stale index is detectably stale rather than accidentally equal. That is a strong argument for preferring index-based bounded structures to pointer-based unbounded ones — you avoid the whole memory-reclamation problem, hazard pointers and epochs and tagged pointers, which is where most real lock-free bugs live. It is also worth being precise that a push with no retry loop is wait-free, not merely lock-free: a bounded number of steps, always.",
          "level": "senior",
          "skill": "cpp.lock-free-guarantees"
        },
        {
          "q": "How do you convince yourself the ring is actually race-free, and what does a clean sanitizer run not prove?",
          "a": "Not by testing harder — by using a tool that reasons about happens-before rather than timing. I build a separate binary with -fsanitize=thread and drive it with one producer and one consumer over millions of items, asserting nothing is lost or reordered, and I treat any ThreadSanitizer report as a missing acquire/release pairing rather than something to paper over with a stronger order on the wrong variable. Because TSan is roughly 2–20x slower it lives in CI on a debug build and never ships. What it does not prove: it is evidence about one class of bug on the interleavings it observed, so it says nothing about a violated single-producer assumption — two threads calling push can produce a clean run on a lucky day — nothing about false sharing, which is a performance defect and not a race, and nothing about the ordering being weaker than your design needs on a weaker hardware model such as ARM.",
          "level": "senior",
          "skill": "tools.sanitizers"
        }
      ]
    },
    {
      "n": 7,
      "focus": "Networking, market data & serialization",
      "tagline": "Something put those bytes on your socket: know the format, the transport, where a message ends — and stop paying full price to read it.",
      "concepts": [
        {
          "title": "FIX: tag=value, the readable ancestor",
          "text": "FIX is a stream of integer-tagged fields separated by the SOH byte (0x01), with a session layer of sequence numbers, heartbeats and resends on top. It is self-describing and still ubiquitous for order entry — and it is text, so reading it means scanning every byte and converting ASCII digits to numbers. The deck shows that loop and labels it honestly: per-byte scan plus digit math is the slow path this session is about escaping.",
          "code": "const char* msg = \"35=D\\00155=NVDA\\00154=1\\00138=200\\00144=182.50\\001\";\nfor (const char* p = msg; *p; ) {\n  int tag = 0;\n  while (*p != '=') tag = tag * 10 + (*p++ - '0');    // digit math, per byte\n  const char* v = ++p;                                // skip '='\n  while (*p && *p != '\\001') ++p;                     // scan to the SOH\n  if (tag == 55 || tag == 44) std::printf(\"%d=%.*s \", tag, int(p - v), v);\n  if (*p) ++p;                                        // skip the SOH\n}\nstd::puts(\"\");\n// 55=NVDA 44=182.50",
          "deck": "Deck U7 · slides 5, 23"
        },
        {
          "title": "Fixed-width binary: decode is a copy, not a parse",
          "text": "Fast venues abandon text. ITCH/OUCH-style messages have a known length and known field offsets, prices are scaled integers rather than ASCII, and the wire is big-endian — so decoding is a memcpy plus a byte swap, with no delimiter scan, no atoi and no allocation. When you want a schema and codegen instead of hand-rolled structs the two families trade off oppositely: Protobuf's varints are compact but you must deserialise into objects before reading a field, while FlatBuffers costs a few more bytes and reads fields in place from the received buffer. On the hot path you optimise for access, not size.",
          "code": "#pragma pack(push, 1)\nstruct AddOrder { uint8_t type; uint64_t id; uint8_t side; uint32_t qty, px; };\n#pragma pack(pop)\nstatic_assert(sizeof(AddOrder) == 18, \"fixed width, no padding\");\nint main() {                                    // decode is a copy, not a parse\n  unsigned char w[18]{}; w[0] = 'A'; w[9] = 'B';          // fields at KNOWN offsets\n  uint32_t q = __builtin_bswap32(200), p = __builtin_bswap32(1825000);\n  std::memcpy(w + 10, &q, 4); std::memcpy(w + 14, &p, 4);  // big-endian, scaled int\n  AddOrder m; std::memcpy(&m, w, sizeof m);\n  std::printf(\"%c%c %u %.2f\\n\", m.type, m.side, __builtin_bswap32(m.qty), __builtin_bswap32(m.px) / 10000.0);\n}\n// AB 200 182.50     -- no delimiter scan, no atoi, no allocation",
          "deck": "Deck U7 · slides 6–7"
        },
        {
          "title": "TCP for orders, UDP multicast for data",
          "text": "The two directions make opposite choices for good reasons. Order entry uses TCP: one stream to the engine, reliable and ordered, because you must not lose an order — and TCP's ordering is also its weakness, since one lost packet stalls everything behind it. Market data ships as UDP multicast: the exchange sends each update once and the network fans it out, fast but lossy, so venues send two identical A/B streams on separate paths and you take whichever packet arrives first. Whatever the transport — including the WebSocket-over-TCP feeds retail APIs use — you rebuild the book from one snapshot plus a stream of increments, track the next-expected sequence number, and on a gap request a resend or a fresh snapshot. Until you have recovered, the book is stale: do not trade it.",
          "deck": "Deck U7 · slides 9–10"
        },
        {
          "title": "Framing: a socket is a byte stream, not a message stream",
          "text": "TCP does not preserve your send boundaries, so recv can return half a message or two and a half. The single most common networking bug is assuming one read equals one message; the correct shape is to accumulate into a reusable buffer, dispatch only complete frames, and keep the partial tail. A length prefix makes the boundary unambiguous and is the venue standard; a delimiter like FIX's SOH means scanning every byte and escaping the delimiter in payloads. And validate before you trust: bounds-check every length and offset before you index, verify the checksum, and fail loud — a silently wrong book loses money quietly.",
          "code": "// one recv() delivered 1.5 messages: [len][payload] frames\nunsigned char in[] = {3,'a','b','c', 4,'d','e','f'};      // the 2nd frame is short\nstd::size_t len = sizeof in, off = 0, done = 0;\nwhile (off + 1 <= len && off + 1 + in[off] <= len) {      // a FULL frame present?\n  std::printf(\"%.*s \", int(in[off]), (const char*)&in[off + 1]);\n  off += 1 + in[off]; ++done;\n}\nstd::printf(\"| framed=%zu leftover=%zu\\n\", done, len - off);\n// abc | framed=1 leftover=4     -- the partial tail waits for the next read",
          "deck": "Deck U7 · slides 11–12"
        },
        {
          "title": "What a general DOM parser costs you",
          "text": "A library like nlohmann/json is correct and lovely and does far more work than the hot path can afford: it parses the whole frame including fields you never read, builds a tree of heap nodes (maps, vectors, std::strings) — dozens of allocations per message — and copies keys and values out of the wire buffer into owned strings. You control both ends of a handful of message shapes, so scan once for the keys you need, read the number in place, point string_views at the wire bytes instead of copying, reuse one recv and one send buffer per connection, and hand-roll the send path since you only ever emit PlaceOrder and CancelOrder.",
          "code": "std::string_view f =\n  R\"({\"type\":\"book_snapshot\",\"bid\":100.00,\"ask\":100.02,\"mid_price\":100.01})\";\nauto num = [f](const char* key) {                     // no DOM, no allocation\n  auto k = f.find(key);\n  if (k == std::string_view::npos) return 0.0;\n  return std::strtod(f.data() + k + std::strlen(key), nullptr);   // parse in place\n};\nstd::printf(\"%.2f %.2f %.2f\\n\", num(\"\\\"bid\\\":\"), num(\"\\\"ask\\\":\"), num(\"\\\"mid_price\\\":\"));\n// 100.00 100.02 100.01     -- three fields read, the rest of the frame skipped",
          "deck": "Deck U7 · slides 19–20 · Deck U7 · slide 24"
        },
        {
          "title": "Non-blocking I/O, and batching versus latency",
          "text": "A blocking read parks your thread until bytes arrive, which on the hot path is death. Set O_NONBLOCK and read returns EAGAIN immediately when nothing is ready; epoll (Linux) or kqueue (BSD/macOS) then tells you exactly which descriptors became readable, so one thread multiplexes many sockets with no context-switch tax — and with edge-triggered notification you must drain the socket fully. You rarely call it by hand: a reactor (epoll, kqueue) tells you a socket is ready and you do the I/O, a proactor (IOCP, Boost.Asio's async_read, io_uring) completes the operation and hands you the buffer. The related trade-off is batching, which amortises per-message cost and lifts throughput — but every batch you hold is latency you added, which is why TCP_NODELAY belongs on the order path and batching belongs on the cold path.",
          "code": "// 8 messages arrive 1 us apart; a batch of 4 waits for the 4th before it sends\nlong added = 0;\nfor (int i = 0; i < 8; ++i) added += ((i / 4) * 4 + 3) - i;   // wait for the flush\nstd::printf(\"batch4 added_us=%ld mean=%.2f | immediate=0\\n\", added, added / 8.0);\n// batch4 added_us=12 mean=1.50 | immediate=0",
          "deck": "Deck U7 · slides 14–16 · Deck U7 · slide 21"
        }
      ],
      "hft": {
        "text": "Why this matters in HFT",
        "paragraphs": [
          "The wire you actually speak in this arena is JSON over WebSocket, which is convenient and the exact opposite of what fast venues do. shared/messages.py is a pydantic discriminated union keyed on a \"type\" field — handshake, place_order, order_ack, book_snapshot, cancel_order — carried by IXWebSocket and decoded today by nlohmann/json. Knowing that is the point: the reference codec is your baseline, and beating it is the assignment.",
          "Codec cost is not a footnote in tick-to-trade, it is a big slice of it. Parse-in plus serialise-out sits between the packet arriving and the order leaving, and a DOM parser touches every byte, allocates a tree and copies strings you will discard. The fast path pulls best bid, best ask and mid straight out of the book_snapshot frame with a single scan, and hand-rolls the send side — a handful of fields written as digits straight into a reused buffer.",
          "Buffer reuse is the other half. One recv buffer and one send buffer per connection, allocated at startup and refilled every wakeup, amortises allocation to zero on the hot path — which is session 3's discipline arriving at the socket. Frame in place and dispatch views rather than copies, and the only memory traffic left is the bytes themselves.",
          "Correctness on the wire is worth as much as speed, because a silently wrong book loses money quietly. Track the next-expected sequence number and treat a jump as loss; verify FIX's mod-256 checksum in tag 10 and reject on mismatch; bounds-check every length and offset before you index, because a malformed length prefix is a buffer overrun waiting to happen. On a gap or a bad frame, stop trading that symbol and recover — fail loud and fast.",
          "And prove the win offline. Race your fast path against the nlohmann baseline on the same recorded tape with scripts/latency_replay.py, which feeds book snapshots to your bot on stdin and prints both percentile tables; scripts/latency_report.py is the other tool, and it parses the LAT lines your bot logs during a live session. This is where the gap between a mean and a tail is most visible: a DOM parser's median can look tolerable while its allocating slow path owns the p99.9."
        ],
        "example": {
          "title": "In the arena",
          "text": "course/hft-columbia/project-starter/include/fix_parser.hpp and course/hft-columbia/project-starter/include/u64toa.hpp — the two halves of HW 7, as stubs: a single-pass parser with no per-message allocation on the way in, and a hand-rolled integer-to-text writer that has to beat snprintf on the way out.",
          "code": "// course/hft-columbia/project-starter/include/fix_parser.hpp\n// HW 7a - a high-performance FIX parser (SOH-delimited tag=value;\n//         tags 11/55/54/38/44).\nstruct NewOrder {\n    const char* clordid; int clordid_len;   // tag 11 - a VIEW, not a copy\n    char symbol[16]; char side;             // tags 55, 54\n    uint32_t qty; double price;              // tags 38, 44\n};\n// Single pass, no per-message allocation. Return false on a malformed message.\ninline bool parse_new_order(const char* buf, int len, NewOrder& out);\n\n// course/hft-columbia/project-starter/include/u64toa.hpp\n// HW 7b - fast uint64 -> decimal text. Write the digits into out; return length.\n//         Beat snprintf/std::to_string; handle 0 and UINT64_MAX.\ninline int u64toa(std::uint64_t v, char* out);"
        }
      },
      "interview": [
        {
          "q": "Why do venues ship market data over UDP multicast but take orders over TCP?",
          "a": "Multicast means the exchange sends each update once and the network replicates it to every subscriber, which is the only way to fan a firehose out to hundreds of consumers cheaply — and UDP does not retransmit, so one lost packet does not stall the ones behind it. Order entry is a single stream to the engine where losing a message is unacceptable, so TCP's reliability and ordering are worth its head-of-line blocking. The cost of the data choice is that you must detect loss yourself from sequence numbers and recover.",
          "level": "warm-up",
          "skill": "perf.transport-choice"
        },
        {
          "q": "Why is fixed-width binary faster to decode than tag=value text?",
          "a": "Every field is at a known offset in a known-length message, so there is no delimiter to scan for and no ASCII-to-number conversion: you copy the bytes into a packed struct and byte-swap the integers. Prices are scaled integers rather than decimal strings, so there is no atof and no floating-point parse. It is also far fewer bytes on the wire, which matters for a feed measured in millions of messages per second.",
          "level": "warm-up",
          "skill": "trading.binary-market-data"
        },
        {
          "q": "What is wrong with assuming one recv() returns one message?",
          "a": "TCP is a byte stream and does not preserve send boundaries, so a read can deliver half a message, one and a half, or several — it is the most common networking bug there is. The correct structure is to append into a persistent buffer, loop while a complete frame is present, dispatch each one, and compact the partial remainder so the next read continues it. With a length prefix “complete” is a cheap arithmetic check; with a delimiter you must scan every byte, and you must bounds-check the length before you index either way.",
          "level": "core",
          "skill": "tools.message-framing"
        },
        {
          "q": "FIX is text and slow to parse. Why is it still everywhere, and what does its session layer buy you?",
          "a": "Because it is a session protocol as much as a message format: sequence numbers, heartbeats, logon/logout, resend requests and a mod-256 checksum in tag 10 give you an auditable, recoverable conversation with a counterparty, and it is self-describing so two firms can add a tag without breaking each other. That is exactly what order entry, allocations and post-trade need, where a few microseconds of parse cost is irrelevant next to not losing an order. Fast market data went binary precisely because none of those properties are worth a per-byte scan at millions of messages a second.",
          "level": "core",
          "skill": "trading.fix-protocol"
        },
        {
          "q": "Concretely, what does a DOM-style JSON parser do that a targeted extractor does not?",
          "a": "It parses the entire document, including every field you will never read; it materialises a tree of heap-allocated nodes — maps, vectors, std::strings — which is dozens of allocations per message; and it copies keys and values out of the receive buffer into owned storage. A targeted extractor scans once for the specific keys it wants, converts the number in place, and hands back a string_view aliasing the wire bytes, so it allocates nothing. The trade you accept is that you now own schema assumptions the library would have checked.",
          "level": "core",
          "skill": "perf.zero-copy-parse"
        },
        {
          "q": "What is the difference between level-triggered and edge-triggered readiness, and what must you do differently?",
          "a": "Level-triggered means the event loop keeps reporting the descriptor while data remains, so a partial read is safe and you will simply be told again. Edge-triggered reports only the transition to readable, which means far fewer wakeups but you must drain the socket in a loop until read returns EAGAIN — if you stop early, the remaining bytes sit there and you are never notified again. EAGAIN is therefore not an error in that loop; it is the signal that readiness is exhausted.",
          "level": "core",
          "skill": "perf.nonblocking-io"
        },
        {
          "q": "Your feed's sequence number jumps from 1000 to 1005. What do you do?",
          "a": "Treat the book as untrustworthy immediately and stop trading that instrument — a silently stale book is far more expensive than a missed opportunity. Then recover by the venue's mechanism: request a retransmission of 1001–1004 if the feed supports it, or take a fresh snapshot and replay increments from its sequence onward. If the venue publishes A/B streams, check the other path first, since the packet is often simply not lost on both. Only resume once the next-expected sequence is contiguous again, and count the event so a rising gap rate becomes visible.",
          "level": "senior",
          "skill": "trading.feed-sequencing"
        },
        {
          "q": "You are told to improve throughput by batching outbound orders. What do you say?",
          "a": "That it is the right optimisation applied to the wrong path. Batching amortises the per-message fixed cost — one syscall, one pass — which is exactly right for logging, telemetry and anything nobody is timing, but every message held to form a batch is queueing latency you added, and on the order path that is the number I am graded on. Nagle's algorithm is the same trade made for me by the kernel, which is why TCP_NODELAY goes on the order socket. So: batch the cold path, send the hot path immediately, and if throughput is genuinely the constraint, fix it by shrinking per-message work rather than by grouping.",
          "level": "senior",
          "skill": "perf.batching-vs-latency"
        }
      ]
    },
    {
      "n": 8,
      "focus": "SIMD, kernel bypass & the latency tail",
      "tagline": "The wire is tight, so the machine is the bottleneck: do more per cycle, get the OS out of the way, then measure where the tail really comes from and kill it.",
      "concepts": [
        {
          "title": "The memory wall, and the prefetch hint",
          "text": "An L1 hit is about four cycles and a main-memory miss is 200 or more, so on the hot path you are memory-bound, not compute-bound. Memory moves in 64-byte lines, so pack the fields you read together and split hot from cold; linear access lets the hardware prefetcher run ahead while pointer-chasing defeats it, and address translations are cached too, so a TLB miss walks the page table. Where the access is irregular the prefetcher cannot see it coming, and __builtin_prefetch(addr, rw, locality) pulls a line toward the cache now: no fault, no stall, no effect on correctness — only on timing. The distance is a tuning knob you validate with cache-miss counters rather than by guessing.",
          "code": "constexpr int N = 1 << 16;\nstd::vector<int> v(N, 1);\nlong s = 0;\nfor (int i = 0; i < N; ++i) {\n  if (i + 64 < N) __builtin_prefetch(&v[i + 64], 0, 0);   // a hint, not a load\n  s += v[i];\n}\nstd::printf(\"%ld %zu %d\\n\", s, 64 / sizeof(int), 64 * int(sizeof(int)));\n// 65536 16 256     -- 16 ints per 64B line; this hint runs 256B ahead",
          "deck": "Deck U8 · slides 5–6"
        },
        {
          "title": "SIMD: one instruction, many lanes",
          "text": "A vector register holds several values at once — an AVX2 register is 256 bits, so eight floats or four doubles per operation, and a single fmadd does a multiply and an add across all lanes. At -O3 -march=native the compiler auto-vectorises clean loops for free and fails on branches, aliasing and unknown trip counts; intrinsics such as _mm256_load_ps and _mm256_fmadd_ps give explicit control when it will not, and aligned loads need genuinely aligned data, which is what alignas(32) is for. The portable version below is the same reduction written so the compiler can vectorise it.",
          "code": "alignas(32) float obi[8] = {.6f, -.2f, .1f, .4f, -.5f, .3f, .0f, .2f};\nalignas(32) float w[8]   = { 1,   1,    1,   1,  .5f, .5f, .5f, .5f};\nfloat acc = 0;\nfor (int i = 0; i < 8; ++i) acc += obi[i] * w[i];  // -O3 -march=native: 8 lanes\nstd::printf(\"%.3f %d %zu\\n\", acc, int((uintptr_t)obi % 32), sizeof(obi));\n// 0.900 0 32     -- the 0 proves the buffer really is 32-byte aligned",
          "deck": "Deck U8 · slides 7, 27"
        },
        {
          "title": "Get the OS out of the way",
          "text": "A syscall is a mode switch that flushes pipelines and pollutes caches — hundreds of nanoseconds, sometimes microseconds under load — so the cheapest syscall on the hot path is the one you never make, and an IRQ arriving mid-race preempts you at the worst possible moment. That is why HFT spins: a dedicated core polling the receive queue flat-out is the lowest and most deterministic latency, at the cost of 100% CPU. Kernel bypass goes further and maps the NIC into user space so packets never touch the stack (DPDK's poll-mode driver, Solarflare/Onload's LD_PRELOAD shim over ordinary sockets, or io_uring's shared submit/complete rings for fewer mode switches). Then take the core: pin the hot thread, isolate that core with isolcpus and nohz_full, allocate NUMA-local to the socket that owns the NIC, use huge pages to shrink TLB pressure, and pre-fault plus mlock so no page fault lands mid-race. Pinning is Linux-only — macOS has no CPU-affinity API, so on a Mac you skip the pin, keep the measurement, and say so.",
          "deck": "Deck U8 · slides 9–11"
        },
        {
          "title": "Why the mean lies",
          "text": "Latency distributions are not Gaussian — they are heavy-tailed and usually bimodal: a tight fast body plus rare catastrophic stalls from a fault, a miss or a preemption. The mean lands in the valley between the two clusters and describes no tick anyone experienced. Report the distribution; and beware coordinated omission, where a naive timer under-samples slow events and hides the tail it was supposed to find.",
          "code": "std::vector<long> us(1000, 38);                       // the fast body\nfor (int i = 990; i < 996; ++i) us[i] = 71;\nfor (int i = 996; i < 999; ++i) us[i] = 210;\nus[999] = 5200;                                       // the tick you lost\nstd::sort(us.begin(), us.end());\ndouble mean = std::accumulate(us.begin(), us.end(), 0.0) / us.size();\nauto p = [&](double q) { return us[std::size_t(q * us.size())]; };\nstd::printf(\"mean=%.2f p50=%ld p99=%ld p99.9=%ld max=%ld\\n\",\n            mean, p(.50), p(.99), p(.999), us.back());\n// mean=43.88 p50=38 p99=71 p99.9=5200 max=5200",
          "deck": "Deck U8 · slide 15"
        },
        {
          "title": "perf, flame graphs and hardware counters",
          "text": "Linux perf is the free, low-overhead sampling profiler and you should know four verbs cold: perf stat for totals (cycles, IPC, cache and branch misses) as the cheap first move, perf record to sample call stacks, perf report to rank hot symbols, and perf annotate for cost per source line. A flame graph folds thousands of stacks into one picture where width is time spent, so wide plateaus are the targets and tall spikes are merely deep. Counters then tell you why a frame is hot: a DRAM miss is 200-plus cycles, a branch mispredict flushes the pipeline for 15 to 20, and an unpredictable hot branch is a candidate to make branchless. When perf says where but not why, VTune's top-down split — retiring, bad speculation, front-end bound, back-end bound — attributes the stall to the microarchitecture.",
          "code": "uint32_t s = 2463534242u; long branchy = 0, branchless = 0;\nfor (int i = 0; i < 1000; ++i) {\n  s ^= s << 13; s ^= s >> 17; s ^= s << 5;        // deterministic pseudo-noise\n  int x = int(s & 0xff);\n  if (x > 127) branchy += x; else branchy -= x;   // ~50% mispredict: a flush\n  branchless += (x > 127) ? x : -x;               // same value, no jump\n}\nstd::printf(\"%ld %ld %s\\n\", branchy, branchless,\n            branchy == branchless ? \"identical\" : \"differ\");\n// 52160 52160 identical     -- a mispredict costs 15-20 cycles; a select cannot",
          "deck": "Deck U8 · slides 16–18"
        },
        {
          "title": "Every tail spike has a physical cause — then build for the tail",
          "text": "Learn the signatures and each fix becomes targeted and permanent. Allocation stalls: malloc locks, walks free lists or calls the kernel — pre-allocate and pool, and never new or delete in on_book. Page faults: a first-touch or swapped page traps into the kernel for microseconds — pre-fault and mlock. NUMA-remote loads and TLB misses have their own fixes (node-local allocation, huge pages), and the ugliest spikes are jitter: the scheduler parking your thread, so pin, isolate, poll instead of blocking, and warm everything before the session opens. Once the cause is gone, let the toolchain finish: -O3, -march=native for this CPU, -flto for whole-program optimisation, -DNDEBUG to strip asserts, -g kept because symbols cost nothing at run time, and PGO's second pass to give the compiler real branch data.",
          "code": "// the hw14 pathology vs the fix: same answer, one allocates on every tick\nstd::vector<double> px(2000); for (int i = 0; i < 2000; ++i) px[i] = 100.0 + i * 0.01;\nconst int W = 64; double slow = 0, fast = 0, sum = 0; long allocs = 0;\nfor (int i = 0; i < 2000; ++i) {\n  std::vector<double> scratch(px.begin() + std::max(0, i - W + 1), px.begin() + i + 1);\n  ++allocs;                                            // <- a malloc EVERY tick\n  slow = std::accumulate(scratch.begin(), scratch.end(), 0.0) / scratch.size();\n  sum += px[i]; if (i >= W) sum -= px[i - W];           // O(1) incremental update\n  fast = sum / std::min(i + 1, W);\n}\nstd::printf(\"%.4f %.4f allocs=%ld->0\\n\", slow, fast, allocs);\n// 119.6750 119.6750 allocs=2000->0     -- same number, zero heap traffic",
          "deck": "Deck U8 · slides 20–23"
        }
      ],
      "hft": {
        "text": "Why this matters in HFT",
        "paragraphs": [
          "This session is where three layers meet: SIMD and prefetch on the compute, bypass and pinning on the system, and colocation on the wire. They all move the same percentiles, which means they compete for the same budget — and the honest way to choose between them is to A/B each one on the same recorded tape and keep whatever moves p99.9. In the arena colocation is explicitly a purchase rather than a code change: the shop moves you from the default outbound-delay tier to the colocated tier, so there is a real economics question on the table and running that comparison with numbers is part of the grade.",
          "On the compute side the targets are specific. on_book decodes and computes on every tick, so align the buffers it reads, vectorise the reductions, and prefetch the next price level while you consume the current one. Prefetching an order-book walk is the textbook case: you know the next slot's address before you need it, which is precisely the situation the hardware prefetcher cannot always anticipate. On the system side, minimise syscalls — pre-allocate, reuse buffers, and do no logging on the hot path, because every one of those is a mode switch waiting to become a tail event.",
          "The tail is not a proxy for the grade, it is the grade: the LATENCY tab ranks bots by p99.9 tick-to-order, not by the mean, and what is timed is concrete — steady_clock in microseconds from the moment a book_snapshot is decoded, through your decision and serialisation, to the order leaving. Profile offline first, because a deterministic input is the only way to attribute a change: scripts/latency_replay.py feeds a recorded tape into your bot on stdin and prints p50/p99/p99.9 and throughput, while scripts/latency_report.py parses the LAT lines your bot logs live. Work the loop and keep a changelog — flame-graph the replay, fix the widest plateau or the top tail cause, re-run the same tape, record the before and after.",
          "You also cannot measure across machines without a shared clock. NTP is milliseconds and useless here; PTP (IEEE 1588) synchronises to sub-microsecond with hardware assist in switches and NICs, and NIC hardware timestamping (SO_TIMESTAMPING) stamps the packet on the wire before any software jitter is added. A steady_clock read in user space already includes scheduling and cache noise the packet never experienced, so wire-in to wire-out honesty needs hardware stamps at both ends — and beyond the NIC the last rungs are FPGAs and custom silicon, each buying a smaller slice of latency at a steeply higher price.",
          "Correctness is a precondition, not a parallel track, because the bugs sanitizers find are frequently the same bugs that become tails: a use-after-free that happens to work today, or an unsynchronised handoff that makes you trade a book that never existed. So the shipping rule is two debug builds — ASan/UBSan, and TSan in its own binary — both clean on the replay, then the graded release binary at -O3 -march=native -flto. One CMake trap costs people an afternoon: -DCMAKE_CXX_FLAGS on an existing build directory is ignored because the cache wins and cmake --build never re-reads -D flags, so use one directory per flag set and --fresh when you change them. And keep logging off the hot path: the hot thread pushes a fixed-size binary record into a lock-free SPSC ring and a separate thread formats and writes it."
        ],
        "example": {
          "title": "In the arena",
          "text": "HW 8's two halves. course/hft-columbia/starters/hw13/kernel.cpp is frozen — you may not touch the source, only find the flags that make it fast and explain with perf stat why each one helped; course/hft-columbia/starters/hw14/tail.cpp has a fine median and an ugly tail, with the pathology sitting in plain sight.",
          "code": "// course/hft-columbia/starters/hw13/kernel.cpp  >>> DO NOT MODIFY. <<<\n//  Find the COMPILER FLAGS that make it run fastest: -O2/-O3, -march=native\n//  (SIMD), -funroll-loops, -flto, and PGO on the data-dependent branch.\nstatic double kernel(const std::vector<float>& a, const std::vector<float>& b) {\n    double acc = 0.0;\n    for (int iter = 0; iter < 3000; ++iter)\n        for (std::size_t i = 0; i < a.size(); ++i) {\n            float x = a[i] * b[i] + 0.5f * a[i];\n            if (x > 0.0f) acc += std::sqrt(x);   // branch a profile can predict\n            else          acc -= x;\n        }\n    return acc;\n}\n\n// course/hft-columbia/starters/hw14/tail.cpp - median fine, p99.9 ugly. PROFILE, do not just\n// crank flags: there is an avoidable pathology on the hot path.\nstatic double signal(const std::vector<double>& prices,\n                     std::size_t i, std::size_t window) {\n    std::size_t lo = i >= window ? i - window : 0;\n    std::vector<double> scratch;            // <-- allocates every single tick\n    for (std::size_t k = lo; k <= i; ++k) scratch.push_back(prices[k]);\n    double s = 0.0;\n    for (double v : scratch) s += v;        // <-- O(window) recompute per tick\n    return s / scratch.size();\n}"
        }
      },
      "interview": [
        {
          "q": "Roughly what does an L1 hit cost versus a main-memory miss, and what follows from that?",
          "a": "An L1 hit is a handful of cycles — about a nanosecond — and a miss all the way to DRAM is on the order of 100 ns, or 200-plus cycles, during which the core stalls. Each level of the hierarchy is roughly an order of magnitude slower than the one above. What follows is that on a hot path you are memory-bound: the layout that decides how many 64-byte lines you touch matters more than the instruction count, and one avoidable miss costs more than a hundred arithmetic operations.",
          "level": "warm-up",
          "skill": "perf.memory-hierarchy"
        },
        {
          "q": "What does __builtin_prefetch do, and can it change your program's behaviour?",
          "a": "It emits a hint asking the hardware to start bringing a cache line toward the cache now, so the data is closer by the time you actually load it. It cannot fault, does not stall, and has no semantic effect at all — only a timing effect, which is why a wrong hint merely wastes memory bandwidth rather than breaking correctness. The distance you prefetch ahead is the tuning parameter, and you validate it with cache-miss counters rather than by reasoning.",
          "level": "warm-up",
          "skill": "perf.prefetch"
        },
        {
          "q": "Why does the compiler fail to auto-vectorise a loop, and what do you do about it?",
          "a": "Usually because it cannot prove the transformation is safe or profitable: data-dependent branches in the body, possible pointer aliasing between input and output, a trip count it cannot reason about, a floating-point reduction where reassociation changes the result, or non-contiguous access. The first step is to ask it why — -Rpass-analysis=loop-vectorize on clang, -fopt-info-vec-missed on gcc — and then remove the obstacle: __restrict, a known multiple-of-width trip count, hoisting the branch out, or splitting the loop. Writing intrinsics is the last resort, because then you own the layout and the alignment forever.",
          "level": "core",
          "skill": "perf.simd"
        },
        {
          "q": "What does kernel bypass actually change, and what does it cost you?",
          "a": "It maps the NIC's queues into user space so packets skip the kernel's generic network stack entirely — no per-packet copies, no protocol layers, no syscall on the receive path, which is also why the thread has to busy-poll rather than block. DPDK gives the most control and the highest throughput but you own the driver-level code and often the protocol handling; an Onload-style LD_PRELOAD shim accelerates the ordinary sockets API with almost no code change but ties you to that vendor's NIC. The costs are vendor lock-in, a core burned at 100%, losing the kernel's tooling and protection, and a much larger surface you have to get right yourself.",
          "level": "core",
          "skill": "perf.kernel-bypass"
        },
        {
          "q": "Which perf command do you run first on a slow binary, and how do you read the flame graph afterwards?",
          "a": "perf stat first, because it is almost free and immediately tells you what kind of problem you have: cycles and instructions give you IPC, and the cache-miss, branch-miss and page-fault counters say whether you are memory-bound, mispredicting, or faulting. Only then do I sample with perf record -g, because counters tell me why while sampling tells me where. In the flame graph the x-axis is not time but aggregated sample count sorted for merging, so width is the total time attributed to a frame and its children and the wide plateaus are the targets; the classic misreading is chasing tall towers, since depth only means a deep stack. The second trap is profiling a build without frame pointers or symbols, which silently collapses stacks into nonsense.",
          "level": "core",
          "skill": "tools.perf-profiler"
        },
        {
          "q": "Name the usual physical causes of a latency tail and how you distinguish them.",
          "a": "Allocation (malloc locking, walking free lists or calling the kernel), page faults on first touch or swapped memory, NUMA-remote loads, TLB misses over a big working set, and OS preemption or interrupts. You distinguish them with counters rather than intuition: minor and major fault counts for faults, cache and LLC miss counters plus NUMA-local versus remote for memory, dTLB-load-misses for the TLB, and a jitter probe — a tight loop timing an empty section — for scheduler noise. Each one has a different fix, which is why naming it first matters.",
          "level": "core",
          "skill": "perf.tail-diagnosis"
        },
        {
          "q": "Why do you keep -g in a release build, and what do -march=native and -flto buy you?",
          "a": "Debug symbols do not change the generated code or slow it down; they just make perf, flame graphs and core dumps readable, so stripping them costs you diagnosis for nothing. -march=native lets the compiler emit this CPU's instruction set — AVX2 and friends — which is a real win for vectorisable loops, at the price of a binary that may illegal-instruction on a different microarchitecture, so you build on the target. -flto defers optimisation to link time so inlining and constant propagation cross translation-unit boundaries, which typically helps the hot path where the codec and the strategy live in different files.",
          "level": "senior",
          "skill": "tools.compiler-flags"
        },
        {
          "q": "You have a fixed budget and can either vectorise the hot loop or buy colocation. How do you decide?",
          "a": "By measuring what each one is worth on the same input, in the same units, before spending anything. The code change I can A/B offline: same recorded tape, release build with and without the SIMD path, and compare p99.9 — if the tail does not move, the change did not matter, however elegant it is. Colocation's value is a wire delay the venue applies, so it is an expected p99.9 reduction I can quote from the tier difference, and the question becomes cost per microsecond of tail for each option. Usually the code is cheaper first and the hardware is the tiebreaker once the software path is already lean — spending on colocation while a per-tick allocation sits in on_book is buying nanoseconds to hide microseconds.",
          "level": "senior",
          "skill": "trading.colocation"
        }
      ]
    },
    {
      "n": 9,
      "focus": "Latency arbitrage & multi-venue",
      "tagline": "The finale: one name on many venues, a quote that has not caught up, and a live tournament that scores your whole term at once.",
      "concepts": [
        {
          "title": "One name, many venues",
          "text": "The same instrument trades on a dozen exchanges simultaneously, each with its own book, its own touch and its own queue. A trade or cancel on one venue takes time to be reflected on another, so for microseconds they genuinely disagree — and that gap is the trade. The consolidated best bid and offer across all venues, the NBBO, is the reference every participant is measured against.",
          "deck": "Deck U9 · slide 5"
        },
        {
          "title": "Picking off a stale quote",
          "text": "Consolidate the venues and look for the one whose price has not updated. When the NBBO computes as crossed — one venue's ask below another's bid — the lagging side is stale and a fast bot can lift or hit it before it reprices. The window is microseconds wide and the quote is public, so everybody sees it: this is a pure reaction-time race, not a forecast.",
          "code": "struct Touch { double bid, ask; };\nTouch a{100.05, 100.07}, b{100.02, 100.04};     // B has not caught up\ndouble nbbo_bid = std::max(a.bid, b.bid);\ndouble nbbo_ask = std::min(a.ask, b.ask);\nstd::printf(\"%.2f %.2f %s\\n\", nbbo_bid, nbbo_ask,\n            nbbo_ask < nbbo_bid ? \"CROSSED: lift B, sell A\" : \"ok\");\n// 100.05 100.04 CROSSED: lift B, sell A",
          "deck": "Deck U9 · slide 6"
        },
        {
          "title": "The race and smart order routing",
          "text": "Seeing the opportunity is not winning it: the order that arrives first at that venue gets the fill and everyone else gets nothing, so tick-to-trade decides the race and colocation is the tiebreaker between two bots running the same code on the same signal. Smart order routing then decides where the order goes — split or sweep across venues to capture displayed size at the best net price, taking the stale venue and the next-best levels in one shot before they fade. Net price means fees, rebates and per-venue latency, which can flip which route actually wins.",
          "code": "// same stale name on two venues: the taker fee decides which route wins\nconst char* v[2] = {\"A\", \"B\"};\ndouble ask[2] = {100.040, 100.038}, fee[2] = {0.00003, 0.00009};  // rate on notional\nint best = 0; double bestnet = 1e18;\nfor (int i = 0; i < 2; ++i) {\n  double net = ask[i] * (1.0 + fee[i]);         // displayed price PLUS the fee\n  std::printf(\"%s net=%.4f \", v[i], net);\n  if (net < bestnet) { bestnet = net; best = i; }\n}\nstd::printf(\"| route=%s edge=%+.4f\\n\", v[best], 100.05 - bestnet);\n// A net=100.0430 B net=100.0470 | route=A edge=+0.0070",
          "deck": "Deck U9 · slide 7"
        },
        {
          "title": "Queue-aware requoting and inventory skew",
          "text": "A market maker posts a bid below and an ask above fair value, anchors that fair value on the microprice rather than the mid, and earns the spread plus maker rebates over many round trips — and a stale quote is a gift to takers, so speed is what keeps the quotes honest. Two decisions then dominate maker P&L. Inventory skew leans your quotes against your position, so long inventory shades both sides down and risk management happens in the quote rather than in a separate hedge. Queue awareness decides whether to act at all: cancel-and-repost sends you to the back of the FIFO, so if you are already near the front, or the price change is small, holding your spot beats chasing.",
          "code": "const double half = 0.02, kSkew = 0.01;\nint pos = 3;                                  // long 3: lean the quotes DOWN\ndouble fair = 100.010 - kSkew * pos;\nstd::printf(\"fair=%.3f bid=%.3f ask=%.3f \", fair, fair - half, fair + half);\nint queue_ahead = 4;                          // near the front: keep the spot\nstd::printf(\"reprice=%s\\n\", queue_ahead < 10 ? \"no\" : \"yes\");\n// fair=99.980 bid=99.960 ask=100.000 reprice=no",
          "deck": "Deck U9 · slides 9–10"
        },
        {
          "title": "Adverse selection and markouts",
          "text": "A fast fill can be a bad fill. When an informed trader hits your quote just before the price moves, you did not capture the spread — you bought the top. The measurement is the markout: compare the mid some interval after each fill against your fill price, signed by your side. Persistently negative markouts on a symbol or a counterparty is toxic flow, and the responses are to widen, skew away, or stop quoting it.",
          "code": "double fill_px = 100.04, mid_1s = 100.01;     // the mid one second after the fill\nbool bought = true;\ndouble markout = bought ? mid_1s - fill_px : fill_px - mid_1s;\nstd::printf(\"%+.3f %s\\n\", markout, markout < 0 ? \"picked off\" : \"good fill\");\n// -0.030 picked off",
          "deck": "Deck U9 · slide 11"
        },
        {
          "title": "The frontier, and the ethics of speed",
          "text": "When software is exhausted the race moves into silicon: kernel bypass first, then FPGAs with the feed handler and risk checks burned into gates for tick-to-trade in nanoseconds, then GPUs for parallel research and ASICs for a firm's exact strategy — each rung a smaller slice of latency at a steeper price, so knowing when to stop is part of the engineering. The honest framing matters too. Speed is legal and it tightens spreads, deepens books and spreads price discovery across venues; it is also an arms race that spends real capital to move wealth microseconds earlier, on access — colocation, proprietary feeds — that is openly for sale. You should be able to argue both sides, and to write fast code that respects its risk limits, because destabilising a book is an engineering failure regardless of the P&L.",
          "deck": "Deck U9 · slides 13–14"
        }
      ],
      "hft": {
        "text": "Why this matters in HFT",
        "paragraphs": [
          "The finale is a live tournament, and its scenario turns every market-structure flag on at once: multi-venue with cross-venue latency arbitrage, futures enabled, the longest opening and closing auctions, the scarcest short locates, the tightest order quota per tick and the widest position limit. There is also an FPGA-maker IPO listing mid-session, so the primary market lands under full speed pressure. Everything from the term is scored simultaneously, on your own tournament-ready bot.",
          "Cross-venue in C++ has a concrete shape here, and it is not the Python one. The bot's hook is on_book(symbol, bid, ask, mid, microprice, obi) — there is no venue argument, and the exchange URL is one per process — so you run one client per venue and the two processes share a touch cache. That is what the project's Phase 4 shared-memory ring is for: a POD structure with no pointers, living in a shared region, initialised once before fork. Each process writes its own venue's touch and reads the other's, and when the NBBO crosses each trades the side it owns.",
          "The grade is a composite, not just the median: tick-to-trade p50/p99/p99.9 carries the most weight on the LATENCY tab, plus throughput under load (can your pipeline keep up when the whole class fires at once), how often you sat near the front of the FIFO, and fill rate — did your fast quotes actually trade. Colocation matters precisely because it decides who lands first: the deck puts the numbers on it, cutting the venue's outbound delay from 200 ms at the default tier to 20 ms colocated. Milliseconds, in this arena — which is exactly why it dominates fill rate.",
          "Queue position, which arrived earlier in the term as a data-structure problem, is now a P&L problem. Requoting is the most expensive cheap operation in the system: sending is a few microseconds, and losing your place in a large queue can be the whole edge. So the requote rule is explicit — only move when the expected gain exceeds the queue position you forfeit, and never on a move smaller than your tolerance. The same discipline applies to the order quota, which in the finale is tight enough that a message you spend chasing a tick is a message you cannot spend on the race.",
          "Finally, this is a demo, not the exam. You race whatever compiles from a fresh clone of your own repo, and the graded artefacts are the tail-reduction changelog and flame graph from the profiling phase plus the tagged tournament commit and its performance write-up; the final itself is a separate, later Canvas window. Bring a clean build, a bot that respects its risk limits, and numbers you can defend."
        ],
        "example": {
          "title": "In the arena",
          "text": "The cross-venue pickoff, as the repo actually shapes it: hft/cpp_client/include/hft_bot.hpp declares the real hook with no venue argument, so hft/cpp_client/src/main.cpp runs one client per venue and the processes share the touch cache from course/hft-columbia/project-starter/include/shm_ring.hpp — whose constraint is the one in the comment: no pointers, because the same bytes are mapped at different addresses in each process. The tournament scenario itself is hft/scenarios/week10.json.",
          "code": "// hft/cpp_client/include/hft_bot.hpp - the REAL hook. NO venue argument.\nvirtual void on_book(const std::string& symbol, double bid, double ask,\n                     double mid, double microprice, double obi);\n\n// course/hft-columbia/project-starter/include/shm_ring.hpp\n// Project Phase 4 - POD ring living entirely in a shared-memory region\n// (NO pointers), usable across processes. init() is called once by the\n// creator before fork().\nstruct ShmRing {\n    static constexpr uint32_t CAPACITY = 1024;   // power of two\n    void init();                       // head/tail (atomics) to 0\n    bool push(uint64_t v);             // producer; false if full\n    bool pop(uint64_t& out);           // consumer; false if empty\n    std::atomic<uint32_t> head, tail;  // offsets, never addresses\n    uint64_t buf[CAPACITY];\n};"
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
          "q": "Why do prices on two venues disagree at all?",
          "a": "Because information propagates at finite speed. A trade or cancel executes on venue A, and the update has to travel to every participant and be acted on before venue B's resting quotes are pulled or repriced — that round trip is tens to hundreds of microseconds depending on distance and technology. During that window venue B's book is genuinely stale, and the gap is not a mispricing anyone believes in, just a queue of events that has not finished.",
          "level": "warm-up",
          "skill": "trading.nbbo-latency-arb"
        },
        {
          "q": "You detect a crossed NBBO. Walk through what you do and what can go wrong.",
          "a": "Take the stale side — lift the low ask on the lagging venue — and simultaneously hedge on the venue that already moved, because holding the position unhedged is directional risk you were not paid for. What goes wrong is leg risk: the stale quote is public, so if you lose the race on the first leg you may still get filled on the second and end up with unwanted inventory at a worse price. Net-of-fees matters too, because a two-cent gross edge can be negative after taker fees on both legs, and displayed size may be smaller than it looks.",
          "level": "core",
          "skill": "trading.smart-order-routing"
        },
        {
          "q": "What is inventory skew and why do market makers do it in the quote rather than by hedging?",
          "a": "Skew means shifting your quoted fair value against your position: if you are long, you lower both your bid and your ask so the ask is more attractive and you are more likely to sell than buy. It pushes your inventory back toward flat using flow you are being paid for, instead of paying the spread to hedge out of it. Mechanically it is one term — fair = microprice - k * position — and k is the knob that trades inventory risk against captured spread.",
          "level": "core",
          "skill": "trading.market-making"
        },
        {
          "q": "What is a markout, and how do you use it operationally?",
          "a": "A markout is the signed P&L of a fill measured against the mid some horizon later: for a buy it is mid_later minus your fill price, for a sell the reverse. It answers whether the fill was actually good, independently of whether the position was later closed well. Operationally you bucket markouts by symbol, counterparty class and time of day, at several horizons — a few hundred milliseconds to a few seconds — and persistent negativity means you are being adversely selected, so you widen, skew away from that side, or stop quoting that name.",
          "level": "core",
          "skill": "trading.adverse-selection"
        },
        {
          "q": "When should a maker requote, given that repricing loses queue position?",
          "a": "When the expected gain from the new price exceeds the option value of the queue spot you are giving up. Concretely that means holding when you are near the front — the fill is imminent and probably profitable — and holding when the price move is inside your tolerance, because a tick of improvement is not worth restarting behind a thousand shares. You requote when fair value has moved enough that your current quote is now the wrong side of the market, since a stale quote is worse than no quote: it is a free option you have written to every taker.",
          "level": "core",
          "skill": "trading.queue-aware-requoting"
        },
        {
          "q": "Two venues, two processes, one shared touch cache. What must the shared structure not contain, and why?",
          "a": "No pointers, and nothing whose representation depends on the process — so no std::string, no vector, no virtual functions, and no references. The same physical pages are mapped at different virtual addresses in each process, so a pointer written by one is meaningless to the other; the structure has to be a POD of scalars, atomics and fixed arrays, with any linkage expressed as offsets or indices. It also has to be initialised exactly once by the creator before the fork, and you still need the same acquire/release discipline as an in-process ring, because the memory model applies across processes just as it does across threads.",
          "level": "senior",
          "skill": "perf.shared-memory-ring"
        },
        {
          "q": "Make the case for and against latency arbitrage as a business.",
          "a": "For: it is the mechanism that enforces one price across fragmented venues, and the participants doing it are usually also the ones quoting two sides, so the result is tighter spreads, deeper books and lower costs for everyone who trades once a month. Against: the specific trade consists of taking a quote from someone who has not yet been able to withdraw it, so the profit is a transfer from a slower participant rather than new information being priced, and the resources spent to win it — microwave towers, hollow-core fibre, custom silicon — are real capital spent on a purely relative advantage. The fairness question is sharpest about access: colocation and proprietary feeds are openly for sale, so speed is a purchased edge, which is why venues experiment with speed bumps and auction mechanics. My own line is that the liquidity argument is genuine and the arms-race critique is also genuine, and the sensible policy response is about market design rather than about banning speed.",
          "level": "senior",
          "skill": "trading.hft-ethics"
        }
      ]
    }
  ]
};
