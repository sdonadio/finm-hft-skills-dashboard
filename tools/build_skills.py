#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build skills.js (window.SKILLS) for UChicago FINM 32700 from the real sources.

Sources, all verified 2026-09-15:
  * decks    course/hft-uchicago/u1.pptx .. u9.pptx  (slide numbers extracted from
             the real .pptx into ../raw/slides.json; the Columbia w* -> UChicago u*
             slide map is in ../BRIEF.md, computed by map_slides.py)
  * schedule course/hft-uchicago/SPEAKER_GUIDES.md + session1..9_talking_points.md,
             cross-checked against the Canvas 73835 module names
  * labs     github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/weekNN.md
             (week01..week15 all confirmed present; bodies byte-identical to
              course/hft-columbia/project-starter/labs/)
  * homework Canvas 73835 assignments API (ids + due dates, converted to
             America/Chicago)
  * exams    course/exams/hft_{midterm,final}_bank.json group names (labels only)

Skill/`can` wording is reused from the sister Columbia course
(/Users/sdonadio/PycharmProjects/HFTSkillsArena/skills.js) wherever the UChicago
deck teaches the same thing; every deck label, slide number, lab/HW/project URL
and date is re-derived for UChicago.

CONTENT RULE: no arena URL, hostname or IP appears anywhere in the output.
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), "skills.js")

CANVAS = "https://canvas.uchicago.edu/courses/73835/assignments/"
LABS = "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/"
COMP = "https://sdonadio.github.io/low-latency-trading-arena/"

# ---------------------------------------------------------------- assignments
# n -> (canvas assignment id, name, due date in America/Chicago)
HW = {
    1: (898723, "HW 1 — Order-book metrics in C++",                    "2026-10-08"),
    2: (898724, "HW 2 — Pointers, references, smart pointers & RAII",  "2026-10-15"),
    3: (898725, "HW 3 — A high-performance memory pool (placement new)", "2026-10-22"),
    4: (898726, "HW 4 — A fast order book + CRTP",                     "2026-10-29"),
    5: (898727, "HW 5 — Ring buffer & O(1) online stats",              "2026-11-05"),
    6: (898728, "HW 6 — An SPSC lock-free ring buffer",                "2026-11-12"),
    7: (898729, "HW 7 — Fast FIX parser + uint64→text",           "2026-11-19"),
    8: (898730, "HW 8 — Build optimization & killing the tail",        "2026-12-01"),
    9: (898731, "HW 9 — Cross-venue stale-quote detector",             "2026-12-10"),
}
PH = {
    0: (898733, "Project — Phase 0: Connect & Baseline",               "2026-10-12"),
    1: (898734, "Project — Phase 1: The Fast Hot Path",                "2026-10-26"),
    2: (898735, "Project — Phase 2: The Local Order Book",             "2026-11-05"),
    3: (898736, "Project — Phase 3: Threading to Accelerate",          "2026-11-12"),
    4: (898737, "Project — Phase 4: Multi-Process System with Shared-Memory Lock-Free IPC", "2026-11-19"),
    5: (898738, "Project — Phase 5: Wire & Hardware Tuning",           "2026-12-01"),
    6: (898739, "Project — Phase 6: Profile & Kill the Tail",          "2026-12-04"),
    7: (898740, "Project — Phase 7: The Tournament",                   "2026-12-11"),
}
MID = {
    "ptr":  "Pointers, References & Memory Layout",
    "raii": "Allocation, RAII & Smart Pointers",
    "oop":  "OOP, Virtual Dispatch & Object Model",
    "tpl":  "Templates, CRTP & Compile-Time",
    "stl":  "STL Containers & Algorithms",
    "cx":   "Complexity, Cache & Performance Basics",
}
FIN = {
    "core":  "Core C++: Memory, RAII & Object Model",
    "tpl":   "Templates, STL & Complexity",
    "thr":   "Threads, Mutexes & Condition Variables",
    "atom":  "Atomics, Memory Ordering & Lock-Free Queues",
    "cache": "Cache Effects, False Sharing & Data Layout",
    "simd":  "Branch Prediction, SIMD & Compiler Optimisation",
    "net":   "Networking: Sockets, Kernel Bypass & Protocol Parsing",
    "sys":   "Low-Latency System Design: Allocators, Order Books & Timing",
    "meas":  "Measurement, Tail Latency & Production Practice",
}

# session n -> (date, title, decks, lab files run, primary lab, hw n, phase, exam)
SESSIONS = [
    (1, "2026-09-28", "HFT Foundations & Market Microstructure",
     ["u1"], [1], 1, "Lab — Week 1", 1, 0, None),
    (2, "2026-10-05", "C++ Performance Foundations + Memory Management & Smart Pointers",
     ["u2"], [2, 3], 2, "Lab — Weeks 2 & 3 (run as one combined lab)", 2, 0, None),
    (3, "2026-10-12", "Custom Allocators & Pools + Templates & Generic Programming",
     ["u3"], [4, 5], 4, "Lab — Weeks 4 & 5 (week 4 in class, week 5 steps 3–4)", 3, 1, None),
    (4, "2026-10-19", "Compile-Time & CRTP + Data Structures — The Order Book",
     ["u4"], [6, 7], 7, "Lab — Weeks 6 & 7 (week 6 step 5, then week 7)", 4, 1, None),
    (5, "2026-10-26", "Complexity & Time-Series + Concurrency I · Midterm (remote)",
     ["u5"], [8, 9], 9, "Lab — Weeks 8 & 9 (week 9 steps 1–4 in class)", 5, 2, "midterm"),
    (6, "2026-11-02", "Concurrency II — Lock-Free & Multi-Process",
     ["u6"], [10], 10, "Lab — Week 10", 6, 3, None),
    (7, "2026-11-09", "Network Protocols, Market Data & Async I/O",
     ["u7"], [11, 12], 11, "Lab — Weeks 11 & 12 (run as one sitting)", 7, 4, None),
    (8, "2026-11-16", "Low-Latency Design & Profiling the Tail",
     ["u8"], [13, 14], 13, "Lab — Weeks 13 & 14 (run as one sitting)", 8, 5, None),
    (9, "2026-11-30", "Latency Arbitrage, Multi-Venue & the Tournament · Final (Dec 8–11)",
     ["u9"], [15], 15, "Lab — Week 15", 9, 7, "final"),
]
# the interactive companion page each session's material corresponds to.
# Merged sessions cover two Columbia weeks; we link the first of the pair, which
# is what the Canvas module lists first.
COMPANION_WEEK = {1: 1, 2: 2, 3: 4, 4: 6, 5: 8, 6: 10, 7: 11, 8: 13, 9: 15}
DECK_OF = {n: s[3][0] for n, s in ((r[0], r) for r in SESSIONS)}


# ------------------------------------------------------------------- helpers
def deck(session, slides):
    """Deck evidence. The deck is implied by the session (one merged deck each)."""
    return {"type": "deck", "session": session,
            "label": "Deck %s · %s" % (DECK_OF[session].upper(), slides)}

def lab(session, n, part):
    return {"type": "lab", "session": session,
            "label": "Lab week %d · %s" % (n, part),
            "url": "%sweek%02d.md" % (LABS, n)}

def hw(n):
    i, name, _ = HW[n]
    return {"type": "hw", "label": name, "url": CANVAS + str(i)}

def proj(p):
    i, name, _ = PH[p]
    return {"type": "project", "label": name, "url": CANVAS + str(i)}

def midterm(key):
    return {"type": "exam", "label": "Midterm · group: " + MID[key]}

def final(key):
    return {"type": "exam", "label": "Final · group: " + FIN[key]}

def S(sid, cat, name, can, intro, practised, depth, where, interview=False):
    return {"id": sid, "category": cat, "name": name, "can": can,
            "introduced": intro, "practised": practised, "depth": depth,
            "where": where, "interview": interview}


# ---------------------------------------------------------------- the skills
SKILLS = [
    # ===================================================== session 1 (u1, w1)
    S("trading.lob", "trading", "The central limit order book",
      "You can read a two-sided limit order book and compute the spread, mid, microprice and order-book imbalance from the top-of-book prices and sizes.",
      1, [], 3,
      [deck(1, "slides 10–12"),
       lab(1, 1, "step 4 and the hand-computed book in Your turn"),
       hw(1), final("sys")], True),
    S("trading.price-time-priority", "trading", "Price-time priority & the FIFO queue",
      "You can apply price-then-time priority to say which resting order fills first, and explain why a cancel-and-repost sends you to the back of the queue.",
      1, [9], 3,
      [deck(1, "slide 11"), deck(9, "slide 10"),
       hw(1), final("sys")], True),
    S("trading.tick-to-trade", "trading", "Tick-to-trade latency & the tail",
      "You can define tick-to-trade latency, report it as p50/p99/p99.9 instead of a mean, and explain why the tail is what decides an HFT race.",
      1, [], 3,
      [deck(1, "slides 13, 19"),
       lab(1, 1, "step 3 — the tick->order latency print"),
       proj(0), final("meas")], True),
    S("trading.fees-maker-taker", "trading", "Maker/taker fees & rebates",
      "You can work out whether a fill was actually profitable once the taker fee or maker rebate is applied to the notional.",
      1, [], 2,
      [deck(1, "slide 12"),
       lab(1, 1, "step 3 — the FEE_SCHEDULE line")]),
    S("trading.colocation", "trading", "Colocation & the latency arms race",
      "You can explain what colocation buys and weigh a reduced venue latency tier against its cost using measured percentiles.",
      1, [], 2,
      [deck(1, "slides 8, 14"), proj(0)]),
    S("tools.cmake-build", "tools", "Building a C++ project with CMake",
      "You can configure and build a C++ target with CMake and keep one build directory per flag set, so a cached flag never lies to you about what you measured.",
      1, [], 2,
      [deck(1, "slide 20"),
       lab(1, 1, "step 2 — build the arena C++ client"), proj(0)]),
    S("tools.arena-client", "tools", "Writing a bot on the arena C++ client",
      "You can subclass the arena WebSocket bot client, override on_book/on_fill/on_ack, and place or cancel orders from the hot path.",
      1, [], 2,
      [deck(1, "slides 17–18"),
       lab(1, 1, "step 3 — connect and get on the board"), proj(0)]),
    S("tools.replay-harness", "tools", "Offline replay & percentile reporting",
      "You can replay a recorded tape through your bot offline and read the p50/p99/p99.9 table it prints, so an A/B change is measured rather than guessed.",
      1, [], 3,
      [deck(1, "slide 19"),
       proj(0), final("meas")]),

    # ================================================== session 2 (u2, w2+w3)
    S("cpp.pointers", "cpp", "Pointers, references & pointer arithmetic",
      "You can walk an array with a raw pointer, explain why p + 1 advances by sizeof(*p), and choose between a pointer and a reference by asking whether 'absent' is a legal answer.",
      2, [], 3,
      [deck(2, "slides 7–10"),
       lab(2, 3, "steps 1 and 3 — the raw new/delete bug, then owning a raw buffer"),
       hw(2), midterm("ptr")], True),
    S("cpp.raw-allocation", "cpp", "new / delete, the classic bugs & allocator non-determinism",
      "You can pair every new with its matching delete or delete[], name the four classic heap bugs, and explain why the same new call can take 20 ns or 20 µs and land in p99.9.",
      2, [], 3,
      [deck(2, "slides 11–12, 25–27, 49"),
       lab(2, 3, "step 1 — the raw new/delete bug, found on your own OS"),
       hw(2), midterm("raii"), final("sys")], True),
    S("cpp.raii", "cpp", "RAII — scope-bound resource management",
      "You can wrap a resource in a type that acquires in its constructor and releases in its destructor, so cleanup happens on every exit path including a throw.",
      2, [], 3,
      [deck(2, "slides 29–30, 35, 41"),
       lab(2, 3, "step 4 — a small RAII guard"),
       hw(2), midterm("raii"), final("core")], True),
    S("cpp.smart-pointers", "cpp", "unique_ptr, shared_ptr, weak_ptr",
      "You can own an object with unique_ptr by default, justify shared_ptr only for genuinely shared lifetime, and say why its atomic refcount does not belong on a hot path.",
      2, [], 3,
      [deck(2, "slides 37–39"),
       lab(2, 3, "steps 2 and 5 — unique_ptr and the refcount tax"),
       hw(2), midterm("raii"), final("core")], True),
    S("cpp.move-semantics", "cpp", "Move semantics, std::move & the rule of five",
      "You can write a noexcept move constructor that steals and then blanks the source, say what std::move actually does at the call site, and decide whether a type needs none or all five special members.",
      2, [], 3,
      [deck(2, "slides 31–33, 40"),
       lab(2, 3, "step 3 — the Rule of Three (and Five)"),
       hw(2), midterm("raii"), final("core")], True),
    S("perf.memory-hierarchy", "perf", "The memory hierarchy, stack vs heap & data layout",
      "You can put rough numbers on a register, L1, L2, L3 and DRAM access, explain why the stack is a nearly free bump pointer, and choose a contiguous or SoA layout so a hot loop streams instead of pointer-chasing.",
      2, [], 3,
      [deck(2, "slides 5–6, 13–15"),
       lab(2, 2, "steps 2–3 — stack vs heap, then cache-friendly vs pointer-chasing"),
       midterm("cx"), final("cache")], True),
    S("perf.branch-prediction", "perf", "Branch prediction & the pipeline",
      "You can explain what a mispredicted branch costs on a deep pipeline and name ways to make a hot branch predictable or remove it.",
      2, [], 2,
      [deck(2, "slide 16"), final("simd")], True),
    S("perf.cache-line-alignment", "perf", "The 64-byte cache line, alignment & false sharing",
      "You can pack the fields a hot function reads onto one 64-byte cache line, use alignas to stop a hot object straddling two of them, and recognise false sharing from a threaded version being slower than a single-threaded one.",
      2, [6], 3,
      [deck(2, "slides 18–19, 51"), deck(6, "slide 9"),
       lab(2, 2, "step 4 — alignas(64) kills false sharing"),
       final("cache")], True),
    S("tools.benchmarking", "tools", "Honest micro-benchmarking & percentiles",
      "You can time a hot function with steady_clock in a release build, warm up first, keep the optimiser from deleting the work, and report percentiles rather than one mean.",
      2, [], 3,
      [deck(2, "slides 21–23"),
       lab(2, 2, "step 1 — your first honest micro-benchmark"),
       hw(2), final("meas")], True),

    # ================================================== session 3 (u3, w4+w5)
    S("perf.object-pool", "perf", "Fixed-size object pools",
      "You can implement a fixed-size object pool whose free slots hold the free-list, so allocate and free are O(1) pointer swaps that never call the system allocator.",
      3, [], 3,
      [deck(3, "slides 8, 10, 35"),
       lab(3, 4, "steps 3–4 — alloc and free in O(1)"),
       hw(3), proj(1), final("sys")], True),
    S("cpp.placement-new", "cpp", "Placement new & explicit destruction",
      "You can construct an object into storage you already own with placement new, and destroy it by calling its destructor explicitly before reusing the slot.",
      3, [], 2,
      [deck(3, "slides 9–10"),
       lab(3, 4, "step 5 — placement new + explicit dtor"),
       hw(3), midterm("raii")]),
    S("perf.arena-allocator", "perf", "Arena / bump allocation and per-tick scratch",
      "You can allocate a tick's scratch from a bump pointer over a pre-owned slab, align each request, and reclaim everything with one O(1) reset.",
      3, [], 3,
      [deck(3, "slides 9, 13, 34"),
       hw(3), proj(1), final("sys")]),
    S("cpp.pmr", "cpp", "std::pmr memory resources",
      "You can hand a standard container your own memory by constructing a pmr container over a monotonic_buffer_resource on a stack buffer.",
      3, [], 2,
      [deck(3, "slides 12–13"), hw(3)]),
    S("cpp.templates", "cpp", "Function & class templates",
      "You can write a function or class template, let the compiler deduce its arguments, specialise the one type that deserves hand-tuning, and say why templates live in headers.",
      3, [], 3,
      [deck(3, "slides 15–17"),
       lab(3, 5, "steps 1–2 — a code stamp and a generic container"),
       hw(3), midterm("tpl"), final("tpl")], True),
    S("cpp.variadic-templates", "cpp", "Parameter packs, folds & perfect forwarding",
      "You can take an arbitrary argument list with a parameter pack, collapse it with a fold expression, and forward each argument on without adding a copy.",
      3, [], 3,
      [deck(3, "slides 19–20, 36"),
       lab(3, 5, "step 3 — variadic template + fold expression"),
       midterm("tpl")]),
    S("cpp.type-traits-constraints", "cpp", "Type traits, SFINAE, if constexpr & concepts",
      "You can ask a question about a type at compile time and use the answer to select or reject an overload — with enable_if, if constexpr, or a named C++20 concept.",
      3, [4], 3,
      [deck(3, "slides 21–23"), deck(4, "slides 8–9"),
       lab(3, 5, "steps 4–5 — if constexpr and SFINAE"),
       hw(3), midterm("tpl")]),
    S("cpp.virtual-dispatch", "cpp", "Inheritance, virtual functions & abstract interfaces",
      "You can define an abstract interface with pure virtual functions and a virtual destructor, use override and final correctly, and spot the slicing and delete-through-a-non-virtual-base bugs.",
      3, [], 3,
      [deck(3, "slides 24–26, 29, 31"),
       midterm("oop"), final("core")], True),
    S("perf.virtual-cost", "perf", "Virtual dispatch and what it costs",
      "You can describe the vptr/vtable indirection behind a virtual call, explain that the real bill is the indirect branch and the inlining you lose, and say where a virtual still belongs in a trading system.",
      3, [4], 3,
      [deck(3, "slides 27–28, 30, 33"), deck(4, "slide 11"),
       lab(4, 6, "steps 1–2 — the virtual baseline, then CRTP against it"),
       midterm("oop"), final("core")], True),

    # ================================================== session 4 (u4, w6+w7)
    S("cpp.constexpr", "cpp", "constexpr, consteval & static_assert",
      "You can compute a lookup table at compile time, check an assumption with static_assert so a violated invariant fails the build, and say what consteval forbids.",
      4, [], 3,
      [deck(4, "slides 5–6"),
       lab(4, 6, "step 3 — a constexpr lookup table"),
       hw(4), midterm("tpl")], True),
    S("cpp.crtp-policies", "cpp", "CRTP & policy-based design",
      "You can replace a virtual hierarchy with a base templated on its derived type, and compose behaviour from policy template parameters that cost nothing at run time.",
      4, [], 3,
      [deck(4, "slides 11–12"),
       lab(4, 6, "steps 2 and 4 — CRTP and policies"),
       hw(4), midterm("tpl"), final("tpl")], True),
    S("cpp.variant-visit", "cpp", "std::variant + compile-time visitor dispatch",
      "You can mirror a tagged wire union as a std::variant and dispatch it with a visitor whose dead branches are discarded at compile time — no vtable, no allocation.",
      4, [], 2,
      [deck(4, "slides 21, 23"),
       lab(4, 6, "step 5 — variant + visitor dispatch"),
       proj(1)]),
    S("perf.open-addressing-hash", "perf", "Open-addressing hash maps",
      "You can implement a flat open-addressing hash map with a power-of-two mask and linear probing, and explain why it beats a chaining map in cache.",
      4, [], 3,
      [deck(4, "slides 14–15"),
       lab(4, 7, "step 7 — SymMap, open addressing"),
       hw(4), final("sys")], True),
    S("cpp.stl-containers", "cpp", "Choosing an STL container for an access pattern",
      "You can choose between std::map, std::unordered_map and a heap for ordered iteration, point lookup or best-element access, and state the cache cost of each.",
      4, [], 2,
      [deck(4, "slide 16"),
       lab(4, 7, "step 1 — why not just std::map"),
       hw(4), midterm("stl"), final("tpl")]),
    S("trading.flat-order-book", "trading", "A flat, price-indexed local order book",
      "You can mirror an exchange book as a contiguous price-indexed level array with a cached top-of-book, so add, cancel and reading the touch stay O(1).",
      4, [], 3,
      [deck(4, "slides 17–19, 24"),
       lab(4, 7, "steps 2–6 — the level array, best_bid/best_ask, cancel"),
       hw(4), proj(2), final("sys")]),
    S("trading.queue-position", "trading", "Tracking your queue position",
      "You can track how much size rests ahead of your order at a price level and use that queue_ahead to judge your fill probability.",
      4, [9], 3,
      [deck(4, "slides 20, 22"), deck(9, "slide 10"),
       hw(4), proj(2), final("sys")]),

    # ================================================== session 5 (u5, w8+w9)
    S("perf.complexity-in-cache-terms", "perf", "Complexity counted in cache misses",
      "You can argue about cost in memory accesses rather than instructions, and show why a linear scan over a small contiguous array beats an O(log n) walk over heap nodes.",
      5, [], 3,
      [deck(5, "slides 5–7"),
       lab(5, 8, "step 1 — the complexity framing"),
       midterm("cx"), final("tpl")], True),
    S("perf.amortized-reserve", "perf", "Amortized cost & reserving up front",
      "You can explain why vector push_back is O(1) amortized and why reserving up front removes the occasional reallocation from your tail.",
      5, [], 2,
      [deck(5, "slides 5, 7"), midterm("stl"), final("meas")]),
    S("cpp.ring-buffer", "cpp", "A fixed-capacity ring buffer",
      "You can implement a fixed-capacity ring buffer over inline array storage with O(1) push, overwriting or expiring the oldest entry and never allocating.",
      5, [], 3,
      [deck(5, "slides 9–10"),
       lab(5, 8, "steps 2–5 — a ring of timestamps"),
       hw(5), final("sys")]),
    S("perf.incremental-computation", "perf", "Update, don't recompute",
      "You can replace a windowed recompute with an online update — a running mean, Welford variance or EMA — so every tick costs the same O(1) and the tail stays flat.",
      5, [], 3,
      [deck(5, "slides 12–13"),
       lab(5, 8, "step 7 — Welford's online mean/variance"),
       hw(5), final("meas")]),
    S("trading.obi-signal", "trading", "Turning microprice and imbalance into a signal",
      "You can fold microprice and order-book imbalance into online state and gate an order on a z-score, without looping a window on the hot path.",
      5, [], 2,
      [deck(5, "slides 22–23"), hw(5), proj(2)]),
    S("cpp.threads", "cpp", "std::thread and shared state",
      "You can start and join a std::thread and say which state is private to a thread and which is shared through the address space.",
      5, [], 2,
      [deck(5, "slide 15"),
       lab(5, 9, "step 1 — reproduce the race"),
       final("thr")]),
    S("cpp.data-races", "cpp", "Data races & happens-before",
      "You can identify a data race, explain that it is undefined behaviour rather than merely a wrong value, and name the happens-before edge that would make the access legal.",
      5, [], 3,
      [deck(5, "slides 16–17"),
       lab(5, 9, "steps 1–3 — the race, TSan, and the volatile non-fix"),
       hw(5), final("thr")], True),
    S("cpp.atomics-memory-order", "cpp", "std::atomic & memory ordering",
      "You can choose relaxed, acquire/release or seq_cst for each atomic operation and justify it with the happens-before edge you actually need.",
      5, [6], 3,
      [deck(5, "slides 18–20, 24"), deck(6, "slide 9"),
       lab(5, 9, "steps 4–5 — atomic, then acquire/release"),
       hw(6), final("atom")], True),
    S("perf.lock-tail-cost", "perf", "Why a lock on the hot path is a tail bomb",
      "You can take a mutex correctly through a lock_guard, then trace how a contended one becomes a kernel wait or a priority inversion and show the damage in p99.9 rather than in the median.",
      5, [], 3,
      [deck(5, "slide 21"),
       lab(5, 9, "step 6 — the mutex answer, correct but slow"),
       final("thr"), final("atom")], True),

    # ===================================================== session 6 (u6, w10)
    S("cpp.compare-and-swap", "cpp", "Compare-and-swap retry loops",
      "You can write a compare_exchange retry loop, explain why the expected value is refreshed on failure, and choose weak over strong inside a loop.",
      6, [], 3,
      [deck(6, "slide 5"), final("atom")], True),
    S("cpp.lock-free-guarantees", "cpp", "ABA & progress guarantees",
      "You can describe the ABA problem and distinguish wait-free, lock-free and obstruction-free progress guarantees.",
      6, [], 2,
      [deck(6, "slide 6"), final("atom")]),
    S("perf.spsc-ring", "perf", "A lock-free SPSC ring buffer",
      "You can build a bounded single-producer/single-consumer ring with atomic head and tail, a power-of-two mask, release/acquire publication, and the two indices on separate cache lines.",
      6, [], 3,
      [deck(6, "slides 8–9"),
       lab(6, 10, "steps 2–6 — mask, alignas(64), push and pop"),
       hw(6), proj(3), final("atom")], True),
    S("perf.back-pressure", "perf", "Bounded queues & back-pressure",
      "You can make a full queue a decision — drop, coalesce or shed — instead of a stall, and explain how head-of-line blocking turns one fat message into a tail.",
      6, [], 3,
      [deck(6, "slide 10"),
       hw(6), proj(3), final("atom")]),
    S("perf.shared-memory-ring", "perf", "A shared-memory ring across processes",
      "You can put a lock-free ring in a shared-memory segment so two processes hand messages over without a syscall, and say which assumptions a ring loses once the reader is a separate process.",
      6, [7], 3,
      [deck(6, "slides 12–13"), proj(4), final("atom")]),
    S("cpp.cpp20-coordination", "cpp", "C++20 coordination & execution policies",
      "You can line threads up with a latch or barrier instead of a hand-rolled condition variable, and say when an execution policy on an STL algorithm is worth its overhead.",
      6, [], 2,
      [deck(6, "slides 15–16"), final("thr")]),
    S("tools.sanitizers", "tools", "Finding bugs with ASan, UBSan & ThreadSanitizer",
      "You can build a target with -fsanitize=address,undefined or -fsanitize=thread, read the report back to the two offending accesses, and explain why a sanitizer build is never the one you ship.",
      6, [], 3,
      [lab(6, 10, "step 8 — two threads under ThreadSanitizer"),
       hw(6), proj(3), final("meas")]),

    # ================================================== session 7 (u7, w11+w12)
    S("trading.fix-protocol", "trading", "Parsing FIX tag=value messages",
      "You can pull the fields you need out of a SOH-delimited FIX message in one forward scan and reject the message on a bad mod-256 checksum.",
      7, [], 3,
      [deck(7, "slides 5, 12, 23"),
       lab(7, 11, "steps 1–4 — one forward scan, dispatch on the tag"),
       hw(7), final("net")]),
    S("trading.binary-market-data", "trading", "Fixed-width binary market data",
      "You can decode an ITCH/OUCH-style fixed-width message by reading fields at known offsets, byte-swapping from network order and scaling integer prices, with no digit parsing.",
      7, [], 3,
      [deck(7, "slides 6–7"),
       lab(7, 11, "step 6 — why fixed-width binary beats text"),
       hw(7), final("net")]),
    S("perf.transport-choice", "perf", "TCP vs UDP multicast for market data",
      "You can say why venues ship market data over UDP multicast and take order entry over TCP, and what head-of-line blocking and A/B feed arbitration mean for each.",
      7, [], 2,
      [deck(7, "slide 9"),
       lab(7, 11, "step 5 — TCP vs UDP semantics"),
       final("net")]),
    S("trading.feed-sequencing", "trading", "Sequence numbers, gaps & snapshot-plus-increment",
      "You can rebuild a book from a snapshot plus increments, detect a sequence gap, and treat the book as untradeable until the feed has recovered.",
      7, [], 2,
      [deck(7, "slide 10"), final("net")]),
    S("tools.message-framing", "tools", "Framing a byte stream into messages",
      "You can recover message boundaries from a stream with a length prefix or a delimiter, buffer a partial read, and bounds-check a length before you index with it.",
      7, [], 3,
      [deck(7, "slides 11–12"), hw(7), final("net")]),
    S("perf.nonblocking-io", "perf", "Non-blocking sockets & readiness event loops",
      "You can drain a non-blocking socket until EAGAIN inside an epoll or kqueue readiness loop, and explain what edge-triggered mode obliges you to do.",
      7, [], 2,
      [deck(7, "slides 14–17"),
       lab(7, 12, "step 5 — a non-blocking read loop"),
       final("net")]),
    S("perf.zero-copy-parse", "perf", "Zero-copy parse & hand-rolled serialization",
      "You can pull only the fields you use straight out of a frame with a view instead of building a DOM, write digits into a reused buffer on the send path, and show the p99.9 win on a replay tape.",
      7, [], 3,
      [deck(7, "slides 19–20, 24–25"),
       lab(7, 12, "steps 1–4 and 6 — fast integer-to-decimal and targeted field extract"),
       hw(7), proj(4), final("net")], True),
    S("perf.batching-vs-latency", "perf", "Batching vs latency",
      "You can explain why batching buys throughput at the cost of the tail you are graded on, and why TCP_NODELAY belongs on an order path.",
      7, [], 2,
      [deck(7, "slide 21"), final("meas")]),

    # ================================================== session 8 (u8, w13+w14)
    S("perf.prefetch", "perf", "The memory wall, the TLB & software prefetching",
      "You can issue a __builtin_prefetch hint ahead of an irregular walk, tune the distance by measurement, and say how huge pages cut TLB misses.",
      8, [], 2,
      [deck(8, "slides 5–6, 27"),
       lab(8, 13, "step 6 — alignas and __builtin_prefetch"),
       proj(5), final("simd")]),
    S("perf.simd", "perf", "SIMD & vectorization",
      "You can vectorize a hot reduction over aligned contiguous data, or get the compiler to do it with -O3 -march=native, and check that it really vectorized.",
      8, [], 3,
      [deck(8, "slides 7, 27"),
       lab(8, 13, "steps 2 and 5 — the winning build, then the intrinsics by hand"),
       hw(8), proj(5), final("simd")], True),
    S("perf.syscall-cost", "perf", "Syscalls, busy-poll & interrupt jitter",
      "You can explain what a trip into the kernel costs on a hot path and when busy-polling a queue beats waiting to be woken.",
      8, [], 2,
      [deck(8, "slide 9"), final("net")]),
    S("perf.kernel-bypass", "perf", "What kernel bypass changes",
      "You can explain what kernel bypass changes — DPDK, an Onload-style shim, or io_uring's batched syscalls — and which per-packet kernel costs each one removes.",
      8, [], 1,
      [deck(8, "slide 10"), final("net")], True),
    S("perf.cpu-pinning-numa", "perf", "CPU pinning, core isolation & NUMA",
      "You can pin a hot thread to a core, say what isolcpus and nohz_full add, and keep its memory node-local and pre-faulted so no page fault lands mid-race.",
      8, [], 2,
      [deck(8, "slides 11, 26"),
       lab(8, 13, "step 7 — connect it to the arena"),
       proj(5), final("sys")]),
    S("perf.hardware-timestamping", "perf", "PTP, hardware timestamping & the hardware frontier",
      "You can explain why NTP is too coarse for microsecond work, what a NIC hardware timestamp measures that a user-space clock read cannot, and where an FPGA takes over from your C++.",
      8, [], 1,
      [deck(8, "slides 12–13"), final("meas")]),
    S("tools.perf-profiler", "tools", "Profiling with perf & reading a flame graph",
      "You can go from perf stat to perf record to perf report and annotate, fold sampled stacks into a flame graph and read it by width, so the wide plateaus rather than the tall spikes set your next fix.",
      8, [], 3,
      [deck(8, "slides 16–18"),
       lab(8, 14, "step 3 — perf record then perf report"),
       hw(8), proj(6), final("meas")], True),
    S("perf.tail-diagnosis", "perf", "Diagnosing a latency tail",
      "You can attribute a tail spike to allocation, a page fault, a TLB miss, NUMA locality or scheduler preemption from its signature, keep logging off the hot path, then fix it and prove the p99.9 moved.",
      8, [], 3,
      [deck(8, "slides 15, 20–21, 25"),
       lab(8, 14, "steps 1–5 — read the tail, hypothesise, fix, watch it collapse"),
       hw(8), proj(6), final("meas")], True),
    S("tools.compiler-flags", "tools", "Release flags, LTO & PGO",
      "You can justify -O3, -march=native, -flto and -DNDEBUG on a graded binary, keep -g for the profiler, and run the two-pass profile-guided build.",
      8, [], 3,
      [deck(8, "slides 22–23, 28"),
       lab(8, 13, "steps 2–4 — the winning build and PGO"),
       hw(8), final("simd")]),

    # ===================================================== session 9 (u9, w15)
    S("trading.nbbo-latency-arb", "trading", "The NBBO & picking off a stale quote",
      "You can consolidate two venues into an NBBO, detect the crossed state that means one side is stale, and explain why only the first order to reach that venue is paid.",
      9, [], 3,
      [deck(9, "slides 5–6, 18"),
       lab(9, 15, "step 2 — sketch the cross-venue stale-quote detector"),
       hw(9), proj(7), final("sys")]),
    S("trading.smart-order-routing", "trading", "Smart order routing & sweeping",
      "You can split or sweep an order across venues for displayed size and account for fees, rebates and per-venue latency in the route you pick.",
      9, [], 2,
      [deck(9, "slide 7"), proj(7), final("sys")]),
    S("trading.market-making", "trading", "Quoting two sides at speed",
      "You can quote a bid and an ask around a fair value anchored on the microprice, and explain how spread plus rebates pay for the risk of a stale quote.",
      9, [], 3,
      [deck(9, "slide 9"),
       lab(9, 15, "step 4 — map strategy to the composite grade"),
       proj(7), final("sys")]),
    S("trading.queue-aware-requoting", "trading", "Queue-aware requoting & inventory skew",
      "You can decide when a requote is worth losing your place in the FIFO queue, and lean your quotes against the inventory you are carrying.",
      9, [], 2,
      [deck(9, "slide 10"),
       lab(9, 15, "step 3 — sketch the queue-aware requote"),
       proj(7), final("sys")]),
    S("trading.adverse-selection", "trading", "Adverse selection & markouts",
      "You can mark a fill out against the mid a moment later and use a persistently negative markout to widen, skew away from, or stop quoting a name.",
      9, [], 3,
      [deck(9, "slide 11"), hw(9), proj(7), final("sys")]),
    S("trading.hft-ethics", "trading", "The frontier and the ethics of speed",
      "You can argue both sides of paid speed — tighter spreads and deeper books against a pay-to-win arms race — and name the rules that shape it.",
      9, [], 1,
      [deck(9, "slides 13–14")]),
]


# ------------------------------------------------------------------- assemble
def build():
    order = {s["id"]: i for i, s in enumerate(SKILLS)}
    sessions = []
    for n, date, title, decks, labs, plab, lab_label, hwn, phase, exam in SESSIONS:
        intro = sorted([s["id"] for s in SKILLS if s["introduced"] == n], key=order.get)
        prac = sorted([s["id"] for s in SKILLS if n in s["practised"]], key=order.get)
        hid, hname, hdue = HW[hwn]
        pid, pname, pdue = PH[phase]
        sessions.append({
            "n": n, "date": date, "title": title, "decks": decks,
            "lab": {"label": lab_label, "url": "%sweek%02d.md" % (LABS, plab)},
            "hw": {"label": hname, "url": CANVAS + str(hid), "due": hdue},
            "project": {"label": pname, "url": CANVAS + str(pid), "due": pdue},
            "exam": exam,
            "companion_url": "%sweek%d.html" % (COMP, COMPANION_WEEK[n]),
            "skills": intro + prac,
        })
    return {
        "course": {
            "code": "FINM 32700",
            "title": "Low-Latency Trading Systems",
            "institution": "University of Chicago",
            "term": "Autumn 2026",
            "lms": "Canvas",
            "accent": "#800000",
            "accent_2": "#d6d6ce",
            "storage_prefix": "finm-hft-skills",
            "sessions_url": "https://canvas.uchicago.edu/courses/73835",
            "starter_url": "https://github.com/sdonadio/hft-cpp-starter-uchicago",
            "companion_url": COMP,
        },
        "categories": [
            {"id": "cpp", "name": "C++ language", "color": "#1D4F91"},
            {"id": "perf", "name": "Systems & performance", "color": "#C8102E"},
            {"id": "tools", "name": "Tooling & engineering", "color": "#2E8B57"},
            {"id": "trading", "name": "Trading & microstructure", "color": "#B8860B"},
        ],
        "sessions": sessions,
        "skills": SKILLS,
    }


if __name__ == "__main__":
    data = build()
    with open(OUT, "w") as f:
        f.write("window.SKILLS = ")
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write(";\n")
    print("wrote", OUT, len(SKILLS), "skills,", len(data["sessions"]), "sessions")
