# -*- coding: utf-8 -*-
"""Session 9 focus — Pre-trade risk & controls (labs/session09.md, HW 9 — A pre-trade
risk gate, due Thu Dec 10). NEW material added in the 2026-10-05 re-schedule;
no deck yet, so no card cites a slide. The design follows include/risk_gate.hpp
and tests/risk_gate_test.cpp in the starter repo (integer ticks, checks in a fixed
order, kill switch the only cross-thread member).

Every `code` snippet is compiled and run by tools/validate_focus.py.
"""

# "v_s9_cK": number of leading display lines that are file-scope declarations
FILE_SCOPE = {"v_s9_c1": 7, "v_s9_c3": 4, "v_s9_c6": 4}

S = {
  "n": 9,
  "focus": "Pre-trade risk & controls",
  "tagline": "Before an order leaves your process it must pass a gate you wrote, can switch off in one store, and can run in a few nanoseconds.",
  "concepts": [
    {
      "title": "Fat-finger checks: max size, max notional and the price collar",
      "text": "The cheapest bug to prevent is the one that sends a thousand times too much, or at a price a thousand times too far. Three comparisons stop most of them: a maximum quantity (shares), a maximum notional (price times quantity, in money), and a collar — the order's price may sit no further than some number of basis points from a reference such as the mid. Keep prices as integer ticks so the limits never meet floating-point rounding, cross-multiply instead of dividing, and make the edge explicit: here exactly 8% is allowed and one tick past it is refused. Return a reason, not a bool, so a refusal can be logged and counted.",
      "code": r"""enum class Risk : uint8_t { Ok, MaxQty, MaxNotional, PriceCollar };
struct Lim { int32_t max_qty = 500; int64_t max_notional = 5'000'000; int32_t collar_bps = 800; };
Risk check(const Lim& l, int32_t qty, int64_t px, int64_t ref) {     // integer ticks, $0.01
  if (qty > l.max_qty) return Risk::MaxQty;                           // fat finger: shares
  if (int64_t(qty) * px > l.max_notional) return Risk::MaxNotional;   // fat finger: money
  if (std::llabs(px - ref) * 10000 > l.collar_bps * ref) return Risk::PriceCollar;
  return Risk::Ok; }
Lim l; int64_t ref = 10'000;                                          // reference: $100.00
std::printf("%d %d %d %d %d\n", (int)check(l, 100, 10'000, ref), (int)check(l, 501, 10'000, ref),
            (int)check(l, 500, 10'001, ref), (int)check(l, 100, 10'800, ref), (int)check(l, 100, 10'801, ref));
// 0 1 2 0 3   -- ok, too big, too much money, on the 8% collar edge, one tick past it""",
      "deck": "Deck U9 · slides 10, 19"
    },
    {
      "title": "Position and exposure limits: count what is still resting",
      "text": "A position limit is only useful if it is checked against the position you could have, not the one you have. Track a signed net position per symbol and the quantity still resting on each side; an order is safe only if filling every resting order and then this one stays inside the limit — the worst case. Checking just the current position lets ten orders that each look fine breach it together. Fills move the position and release open quantity, a cancel or reject releases open quantity without moving the position, and a position beyond the limit that the gate never approved is a sign something bypassed it: fail closed and trip the kill switch.",
      "code": r"""long pos = 900, open_buy = 200, open_sell = 0, max_pos = 1200;     // net + resting
auto buy_ok  = [&](long q) { return std::labs(pos + open_buy + q) <= max_pos; };    // worst case
auto sell_ok = [&](long q) { return std::labs(pos - open_sell - q) <= max_pos; };
std::printf("%d %d %d %d\n", buy_ok(100), buy_ok(101), sell_ok(2100), sell_ok(2101));
// 1 0 1 0   -- 900 + 200 + 100 is exactly the limit; resting quantity counts before it fills""",
      "deck": "Deck U9 · slide 11"
    },
    {
      "title": "Throttling: the token bucket",
      "text": "Venues meter messages, and a bot that exceeds its quota is refused or disconnected at the worst moment, so you meter yourself first. A token bucket holds up to a capacity of tokens and refills at a steady rate; each message spends one, and an empty bucket means wait or refuse. The capacity is the burst you may send at once and the rate is the sustained speed, which is exactly how the finale's quota reads: a few messages per tick. The refill is arithmetic on the timestamp you were handed — no timer, no thread, no clock call inside the check — so the bucket costs a multiply and a compare. A refused order must not spend a token, and cancels spend one too.",
      "code": r"""struct Bucket { double tokens, cap, rate; uint64_t last_ns;
  bool take(uint64_t now) {                                           // one call per message
    tokens = std::min(cap, tokens + (now - last_ns) * 1e-9 * rate); last_ns = now;
    if (tokens < 1.0) return false; tokens -= 1.0; return true; } };
Bucket b{6, 6, 6, 0}; int ok = 0;                                     // 6 msgs/s, burst 6, starts full
for (int i = 0; i < 10; ++i) ok += b.take(0);                         // ten orders in one instant
std::printf("%d %d\n", ok, b.take(500'000'000));                      // half a second later
// 6 1   -- the burst passes six; 0.5 s refills three tokens, so the next one is allowed""",
      "deck": "Deck U9 · slide 12"
    },
    {
      "title": "The kill switch: one atomic flag, read first",
      "text": "When something is wrong you need to stop all new orders now, from any thread, a signal handler or an operator, without waiting for the strategy thread to notice. The mechanism is one std::atomic<bool> read at the top of the gate: a relaxed load is a plain load on x86 and ARM, costs about a nanosecond and sits in a cache line that is almost never written. A flag beats a lock (the hot thread would wait for whoever holds it) and a message (the stop would queue behind the very traffic you want to stop). Relaxed is enough because the flag guards no other data; use release on the store and acquire on the load if it also publishes a reason. A lock-free atomic may be set from a signal handler. Cancels must still pass — the switch needs them — and the gate fails closed: a position it never approved trips it too.",
      "code": r"""std::atomic<bool> killed{false};                                      // one flag, shared
int sent = 0;
auto send = [&] { if (killed.load(std::memory_order_relaxed)) return false; ++sent; return true; };
send(); send();
std::thread([&] { killed.store(true, std::memory_order_release); }).join();   // any thread may trip it
send();                                                               // refused: the flag is read first
std::printf("%d %d\n", sent, (int)std::atomic<bool>::is_always_lock_free);
// 2 1   -- two orders went out and the third was stopped; the flag is lock-free""",
      "deck": "Deck U9 · slides 15, 21"
    },
    {
      "title": "Self-trade prevention: do not cross your own book",
      "text": "If you quote both sides and also send aggressive orders, one day your buy meets your own resting sell. Nothing economic happened, you paid fees on both legs, and in a real market a pattern of self-matches looks like a wash trade, which is a compliance problem and not just a cost. Prevention is a local check: keep the lowest price of your own resting asks and the highest of your own resting bids, and refuse (or cancel the resting side, a policy choice you document) any order that would reach them. It uses only your own state, so it is O(1) with no book lookup, and it must be updated on every ack, fill and cancel or it will refuse good orders or miss bad ones.",
      "code": r"""long my_best_ask = 10'005, my_best_bid = 9'995;                       // OUR resting quotes only
auto buy_hits_me  = [&](long px) { return my_best_ask > 0 && px >= my_best_ask; };
auto sell_hits_me = [&](long px) { return my_best_bid > 0 && px <= my_best_bid; };
std::printf("%d %d %d %d\n", buy_hits_me(10'004), buy_hits_me(10'005), sell_hits_me(9'996), sell_hits_me(9'995));
// 0 1 0 1   -- a buy at or through our own ask, or a sell at or through our own bid, would trade with ourselves""",
      "deck": "Deck U9 · slides 13–14"
    },
    {
      "title": "What a check costs: nanoseconds, in the latency budget",
      "text": "A gate is on every order, so it is part of your tick-to-trade number: a few nanoseconds against a budget of microseconds is cheap insurance, a lock or a system call in it is not. The recipe is the one from the whole course: no allocation, no clock read, no lock; limits and per-symbol state in one flat, cache-resident struct; the cheapest and most likely rejections first; branches the predictor can learn. Then measure it the honest way — a function the optimiser cannot inline away, inputs it cannot predict, a sink, percentiles. On the instructor's machine this three-check gate runs in about 2–3 ns per order; treat that as a typical figure, not a promise, and measure yours. If it ever shows up in a flame graph, the answer is a cheaper check, never removing it.",
      "code": r"""struct Lim { int32_t max_qty = 500; int64_t max_notional = 5'000'000, collar = 800; };
__attribute__((noinline)) int check(const Lim& l, int32_t q, int64_t px, int64_t ref) {
  return q > l.max_qty ? 1 : int64_t(q) * px > l.max_notional ? 2
       : std::llabs(px - ref) * 10000 > l.collar * ref ? 3 : 0; }     // three compares, no allocation
std::vector<int32_t> qty(4096); std::vector<int64_t> px(4096); unsigned s = 1;
for (int i = 0; i < 4096; ++i) { s = s * 1664525u + 1013904223u; qty[i] = 1 + (s >> 8) % 400; px[i] = 9700 + (s >> 4) % 600; }
auto t0 = std::chrono::steady_clock::now(); long sink = 0;
for (int r = 0; r < 200; ++r) for (int i = 0; i < 4096; ++i) sink += check(Lim{}, qty[i], px[i], 10'000);
double ns = std::chrono::duration<double, std::nano>(std::chrono::steady_clock::now() - t0).count() / (200 * 4096.0);
asm volatile("" : : "r"(sink) : "memory");                            // the sink: keep the work
std::printf("%ld %s\n", sink, ns < 100 ? "under 100 ns" : "slow");
// 0 under 100 ns   -- every order passes; the whole gate costs a few ns""",
      "deck": "Deck U9 · slides 18–20, 22"
    }
  ],
  "hft": {
    "text": "Why this matters in HFT",
    "paragraphs": [
      "Speed without controls is how firms disappear. The faster your path from wire to wire, the faster a bug becomes a position: a stuck loop, a wrong sign, a stale reference price or a test flag left on can send thousands of orders before a human reads the first alert. That is why the last piece of the hot path is the one that says no.",
      "It is also the law. SEC Rule 15c3-5, the market access rule, requires a broker-dealer that gives itself or a client access to an exchange to run risk management controls under its own direct and exclusive control, applied before the order reaches the market: credit and capital limits, checks that block erroneous orders by price and size, and regulatory checks. Unfiltered 'naked access' through a broker's name is exactly what it ended. The checks in this session are the engineering shape of those words.",
      "Knight Capital is the case study. On 1 August 2012 the firm deployed new order-routing code to seven of its eight servers; the eighth kept the old code. The new code reused a flag that years earlier had switched on an obsolete function called Power Peg, so on the one un-updated server the same flag woke it up. For about 45 minutes the server sent orders at the market and nothing stopped it; the firm lost roughly $460 million and needed an emergency rescue within days. The SEC later fined Knight $12 million for violating 15c3-5. The lessons are ones you now have code for: deploy identically everywhere, never repurpose a flag, put a hard cumulative limit and a kill switch outside the strategy, and alert on what you did not expect.",
      "In the arena the same limits are enforced on you. The venue refuses an order above its maximum size, outside the 8% LULD band, past the position limit of 1200 or beyond the quota of six messages per tick, and each refusal costs you a message and a place in the queue. A client-side gate that refuses first costs nanoseconds and keeps the venue's rejects at zero; and a bot that is flattened by the maintenance check is a bot that stopped trading. HW 9 is that gate: ten checks in a fixed order with a reason code for each, one atomic kill switch, flat per-symbol state, and a latency number for the whole thing.",
      "Design the gate as the last stage of your pipeline, owned by the one hot thread, with exactly one member any other thread may touch: the kill switch. Everything else is plain arithmetic on state you already hold, so it stays inside the latency budget and inside your test table. Fail closed: when state is inconsistent, such as a position beyond a limit you never approved, stop sending and let a human decide."
    ],
    "example": {
      "title": "In the arena",
      "code": "// include/risk_gate.hpp (HW 9) - the reasons check() can return, in the order it tests them\nenum class Risk : uint8_t {\n    Ok = 0,\n    Killed,       // kill switch is on: no new orders (cancels still go through)\n    BadOrder,     // qty <= 0, px <= 0, or sym >= kMaxSymbols\n    MaxQty,       // qty > max_qty                                  (fat finger, shares)\n    MaxNotional,  // int64(qty) * px > max_notional                 (fat finger, money)\n    NoReference,  // no reference price set for this symbol yet (ref <= 0)\n    PriceCollar,  // |px - ref| * 10000 > collar_bps * ref          (edge = allowed)",
      "text": "include/risk_gate.hpp in your starter repo is HW 9: implement RiskGate so tests/risk_gate_test.cpp passes. The order of the enum is part of the contract, because check() returns the first failure. Prices are integer ticks, time arrives in Order::ts_ns so the gate never reads a clock, state is a flat per-symbol array, and the kill switch is the only std::atomic member."
    }
  },
  "interview": [
    {
      "q": "What is a pre-trade risk check, and why does it run in the client before the order is sent when the exchange has its own checks?",
      "a": "It is a test an order must pass before it leaves your process — size, notional, price against a reference, position, rate, self-match. The exchange's checks are the last line and they are not yours: a refusal there costs a round trip, a message from your quota and your queue position, and a check you do not control cannot satisfy a rule that says the firm itself must hold the controls. A client-side gate refuses in nanoseconds, keeps the reject count near zero, and is the layer you can test, log and tune.",
      "level": "warm-up",
      "skill": "trading.order-size-notional-collar"
    },
    {
      "q": "What is a price collar, and why compare |px - ref| * 10000 against collar_bps * ref instead of dividing?",
      "a": "A collar refuses a limit order whose price is more than a set number of basis points from a reference such as the mid — it is what catches a misplaced decimal point that a size check cannot. Cross-multiplying keeps everything in integers: no division, no floating-point rounding at the edge, and no divide-by-zero if the reference is missing (which you test separately). With integer ticks the edge is exact, so you can state and test that exactly 8% passes and one tick beyond fails.",
      "level": "warm-up",
      "skill": "trading.order-size-notional-collar"
    },
    {
      "q": "Why must a position limit count orders that are still resting, and what do a fill and a cancel each do to the gate's state?",
      "a": "Because the limit applies to the position you could end up with, and every resting order may fill before the next one is checked. Checking only the current position lets several individually acceptable orders breach it together. The gate checks the worst case — position plus all resting buy quantity plus this order, or position minus resting sell quantity minus this order. A fill moves the position and releases that quantity from the open total; a cancel, reject or expiry releases the open quantity without moving the position. Both must clamp at zero so a late or duplicated message cannot make the open count negative.",
      "level": "core",
      "skill": "trading.position-exposure-limits"
    },
    {
      "q": "Describe a token bucket. What do its capacity and its rate mean, and why does it need no timer?",
      "a": "It holds up to capacity tokens and gains rate tokens per second; every message spends one, and with less than one token the message is refused or delayed. Capacity is the burst allowed at once, rate is the sustained throughput. It needs no timer because the refill is computed lazily on each call from the time elapsed since the last call: tokens = min(cap, tokens + elapsed * rate). Using the timestamp the caller already has keeps the check free of clock reads, locks and threads, so it is a multiply and a compare. A refused order should not spend a token.",
      "level": "core",
      "skill": "perf.token-bucket-throttle"
    },
    {
      "q": "Design a kill switch for a trading process. Which thread sets it, how does the hot path read it, and which memory order do you use?",
      "a": "Any thread, an operator command or a signal handler sets one std::atomic<bool>; the hot path loads it at the very start of the gate and refuses every new order while it is set. The flag is in its own cache line so reads stay cheap, and it must be lock-free so a signal handler may legally store to it. A relaxed load and store are enough when the flag guards no other data; if the setter also publishes a reason or state the reader will use, store with release and load with acquire. It does not use a lock (the hot thread would wait) or a queue message (the stop would sit behind the traffic it is meant to stop). Cancels are still allowed through, since the switch needs them, and the gate also trips it itself on inconsistent state.",
      "level": "core",
      "skill": "cpp.atomic-kill-switch"
    },
    {
      "q": "What is a self-trade, why is it a problem beyond the fees, and how do you prevent it cheaply?",
      "a": "It is your own aggressive order matching your own resting order on the other side. Economically nothing changes, but you pay fees on both legs, you print volume that never existed, and a pattern of them looks like wash trading, which regulators treat as manipulation. The prevention uses only your own state: keep the lowest price of your resting asks and the highest of your resting bids, and refuse (or cancel the resting order, depending on the documented policy) any order that would reach them. It is O(1), needs no book lookup, and has to be updated on every ack, fill and cancel.",
      "level": "core",
      "skill": "trading.self-trade-prevention"
    },
    {
      "q": "Walk through Knight Capital in August 2012. What failed, and which controls would have limited the damage?",
      "a": "The firm deployed new routing code to seven of eight servers; the eighth kept the old code. The new release reused a flag that had once switched on an obsolete function, Power Peg, so on the un-updated server the flag reactivated it, and that server sent orders into the market for about 45 minutes. The loss was roughly $460 million and the firm needed an emergency rescue within days; the SEC later fined it $12 million under Rule 15c3-5. Failures: a manual, inconsistent deployment; dead code left in production and a flag repurposed; alerts that were ignored. Controls that would have capped it: a pre-trade limit on cumulative orders or position per symbol and in total, a kill switch outside the strategy that an operator can trip, and automated checks that the version is the same on every server before the market opens.",
      "level": "senior",
      "skill": "trading.risk-regulation"
    },
    {
      "q": "Your gate adds latency on every order. How do you decide what it is allowed to cost, and how do you keep it cheap?",
      "a": "It is a stage in the tick-to-trade budget, so it gets a share and is measured like every other stage: a function the optimiser cannot inline away, unpredictable inputs, a sink, and p50 / p99 / p99.9 rather than a mean. Then keep it structurally cheap: no allocation, no lock, no clock read (time is passed in); limits and per-symbol state in one flat struct that stays in cache; the most likely and cheapest rejections first; integer arithmetic; branches the predictor can learn. A few nanoseconds against a microsecond budget is the right price for the insurance; the answer to a gate that shows up in a profile is a cheaper check, not deleting it, because the regulator and the next bad deploy will not accept either.",
      "level": "senior",
      "skill": "perf.risk-check-cost"
    }
  ]
}
