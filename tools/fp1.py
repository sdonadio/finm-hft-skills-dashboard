# -*- coding: utf-8 -*-
"""Session 1 focus — market microstructure & the LOB (deck U1, labs/session01.md).

Unchanged by the 2026-09-29 resequence except for forward references to the
sessions that now teach the flat book and requoting (6 and 9).
Every `code` snippet is compiled and run by tools/validate_focus.py.
"""

FILE_SCOPE = {}   # "v_s1_cK": number of leading lines that go at file scope

S = {
  "n": 1,
  "focus": "Market microstructure & the limit order book",
  "tagline": "Learn the game before you optimise it: two sorted sides, a FIFO queue at every price, and one number that grades you — p99.9 tick-to-trade.",
  "concepts": [
    {
      "title": "The CLOB is two sorted sides",
      "text": "Every modern venue runs one matching engine over a central limit order book: resting buy orders on the bid side, resting sell orders on the ask side, each side sorted by price. The best bid and the best ask are \"the touch\", the resting size at each price is the depth, and a snapshot of exactly that is what your on_book hook is handed every tick.",
      "code": """struct Lvl { double px; int qty; };
Lvl bids[] = {{100.02, 500}, {100.01, 800}, {100.00, 200}};   // best first
Lvl asks[] = {{100.04, 300}, {100.05, 900}, {100.06, 400}};   // best first
std::printf("touch %.2f x %d / %.2f x %d spread=%.2f bid_depth=%d\\n",
            bids[0].px, bids[0].qty, asks[0].px, asks[0].qty,
            asks[0].px - bids[0].px,
            bids[0].qty + bids[1].qty + bids[2].qty);
// touch 100.02 x 500 / 100.04 x 300 spread=0.02 bid_depth=1500""",
      "deck": "Deck U1 · slide 10"
    },
    {
      "title": "Mid, spread, microprice and OBI",
      "text": "Four numbers summarise a book and all four are one line of arithmetic. The mid is the average of the touch; the spread is what it costs to cross; the microprice weights each side's price by the *other* side's size, so it leans toward the side that is about to win; the order-book imbalance is a signed number in [-1, +1] that is positive when the bids are heavy. Your on_book hook is handed the last two already computed — HW 1 is proving you can compute them yourself.",
      "code": """double bp = 100.02, ba = 100.04; int bq = 500, aq = 300;   // the slide's touch
double mid = (bp + ba) / 2, spread = ba - bp;
double micro = (ba * bq + bp * aq) / (bq + aq);  // weighted by the OTHER side
double obi   = double(bq - aq) / (bq + aq);
std::printf("%.4f %.4f %.4f %+.2f\\n", mid, spread, micro, obi);
// 100.0300 0.0200 100.0325 +0.25   -- bid-heavy, so the microprice sits above the mid""",
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
      "code": """struct Lvl { double px; int qty; };
Lvl asks[] = {{100.04, 300}, {100.05, 900}};   // the RESTING side, from the slide
int want = 500; double cost = 0;               // incoming BUY 500, limit 100.05
for (auto& l : asks) {
  int take = std::min(want, l.qty);
  cost += take * l.px;                        // each slice prints at the RESTING price
  want -= take; if (!want) break;
}
std::printf("filled=%d avg=%.4f left=%d\\n", 500 - want, cost / 500, want);
// filled=500 avg=100.0440 left=0   -- worse than the touch it saw when it decided""",
      "deck": "Deck U1 · slide 12"
    },
    {
      "title": "Maker/taker: who pays and who gets paid",
      "text": "Under a maker/taker schedule the aggressive side pays a fee and the passive side often earns a rebate, both as a fraction of notional. The arena prints its schedule on connect — taker 30 bps, maker rebate 5 bps in the session-1 lab — and the sign of that number is a real part of a market maker's P&L, not an accounting detail: your edge is trade edge minus fees plus rebates.",
      "code": """double px = 182.50; int qty = 200;
double notional = px * qty;
double taker = 0.0030 * notional;   // cross the spread: you pay
double maker = 0.0005 * notional;   // rest in the queue: you are paid
std::printf("%.2f -%.2f +%.2f\\n", notional, taker, maker);
// 36500.00 -109.50 +18.25   -- a 127.75 swing (109.50 + 18.25) on one 200-share clip""",
      "deck": "Deck U1 · slide 12"
    },
    {
      "title": "Tick-to-trade, and why the grade is p99.9",
      "text": "Tick-to-trade is the time from market data hitting your socket to your order leaving it: parse, decide, serialise, send. We report p50, p99 and p99.9 and grade the last one, because the races that matter are the volatile ticks when everybody fires at once — exactly when a bad tail shows up. A 40 µs mean with a 5 ms p99.9 is a losing bot, and the mean is the one number that will never tell you so.",
      "code": """std::vector<long> ns;                                   // one sample per tick, in µs
for (int i = 0; i < 1000; ++i) ns.push_back(38 + i % 4); // a tight, fast body
ns[997] = 71; ns[998] = 210; ns[999] = 5200;            // and three ugly ticks
std::sort(ns.begin(), ns.end());
auto pct = [&](double p) { return ns[(std::size_t)(p / 100.0 * (ns.size() - 1))]; };
double mean = std::accumulate(ns.begin(), ns.end(), 0.0) / ns.size();
std::printf("mean=%.1f p50=%ld p99=%ld p99.9=%ld max=%ld\\n",
            mean, pct(50), pct(99), pct(99.9), ns.back());
// mean=44.9 p50=40 p99=41 p99.9=210 max=5200   -- the mean describes no tick that happened""",
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
      "code": """// hft/cpp_client/src/main.cpp
void on_book(const std::string& symbol, double bid, double ask, double mid,
             double microprice, double obi) override {
  if (bid <= 0.0 || ask <= 0.0) return;          // need a two-sided book
  const double spread   = ask - bid;
  const double last_mid = last_mid_.count(symbol) ? last_mid_[symbol] : mid;
  last_mid_[symbol]     = mid;
  if (spread < kEdge) return;                    // too tight to bother
  if (mid > last_mid && pos < kMaxPos)       buy_limit (symbol, kClip, ask);
  else if (mid < last_mid && pos > -kMaxPos) sell_limit(symbol, kClip, bid);
}""",
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
}
