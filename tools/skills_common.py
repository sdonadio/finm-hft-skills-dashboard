# -*- coding: utf-8 -*-
"""Shared constants + helpers for the FINM 32700 skills.js build.

Each session's skills live in tools/skN.py (``from skills_common import *`` and
define ``SKILLS = [...]``); tools/build_skills.py stitches sk1..sk9 together.

Session map: re-scheduled 2026-10-05 (old Sessions 2+3 merged into Session 2), then
2026-10-14: exam sessions carry NO lecture, so Session 5 is the midterm alone (no
lab, HW 4 + Phase 1 hang on it), pools & the order book move to Session 6 and every
later session one up; the standalone pre-trade-risk session is folded into Session 9
as a short part (HW 9 dropped / optional). One deck (uN) per session; one lab
(labs/sessionNN.md) per teaching session.

CONTENT RULE: no arena URL, hostname or IP appears anywhere in the output.
"""

CANVAS = "https://canvas.uchicago.edu/courses/73835/assignments/"
LABS = "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/"
COMP = "https://sdonadio.github.io/low-latency-trading-arena/"

# n -> (canvas assignment id, name, due date in America/Chicago)
# Re-scheduled 2026-10-05: HW 2 merges the old HW 2 + HW 3, every later HW moves
# up one number (Canvas ids stay by position), and HW 9 is new.
# 2026-10-14: numbers/names unchanged; HW 8 proposed due Dec 10 (was Dec 3 — to be
# moved on Canvas), HW 9 dropped / optional (no session carries it).
HW = {
    1: (898723, "HW 1 — Order-book metrics in C++",                          "2026-10-08"),
    2: (898724, "HW 2 — Pointers, classes, the Rule of Five & RAII",         "2026-10-22"),
    3: (898725, "HW 3 — Polymorphism & smart ownership",                     "2026-10-29"),
    4: (898726, "HW 4 — Templates & CRTP",                                   "2026-11-05"),
    5: (898727, "HW 5 — A memory pool & a fast order book",                  "2026-11-12"),
    6: (898728, "HW 6 — An SPSC lock-free ring buffer",                      "2026-11-19"),
    7: (898729, "HW 7 — Fast FIX parser + uint64→text",                      "2026-12-01"),
    8: (898730, "HW 8 — Cross-venue stale-quote detector",                   "2026-12-10"),
    9: (898731, "HW 9 — A pre-trade risk gate (optional, ungraded)",          "2026-12-10"),
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
# exam group labels: must match course/exams/hft_{midterm,final}_bank.json.
# The midterm (Session 5, Oct 26, remote, 2h20, no lecture) covers Sessions 1-4,
# which INCLUDES templates & CRTP: use ptr / raii / oop / tpl / cx.
MID = {
    "ptr":  "Pointers, References & Memory Layout",
    "raii": "Allocation, RAII & Smart Pointers",
    "oop":  "OOP, Virtual Dispatch & Object Model",
    "tpl":  "Templates, CRTP & Compile-Time",
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

# n, date, title, hw n, project phase, exam, has lab
SESSIONS = [
    (1, "2026-09-28", "HFT Foundations & Market Microstructure", 1, 0, None, True),
    (2, "2026-10-05", "Pointers & the Cost of Memory · Object-Oriented C++ I — Encapsulation & Inheritance", 2, 0, None, True),
    (3, "2026-10-12", "Object-Oriented C++ II — Polymorphism & Smart Pointers", 3, 1, None, True),
    (4, "2026-10-19", "Templates, Compile-Time & CRTP", 4, 2, None, True),
    (5, "2026-10-26", "Midterm (remote, 2h20) — no lecture", 4, 1, "midterm", False),
    (6, "2026-11-02", "Memory Pools & the Order Book", 5, 2, None, True),
    (7, "2026-11-09", "Concurrency — From Atomics to Lock-Free", 6, 3, None, True),
    (8, "2026-11-16", "The Wire & the Machine — Protocols, Async I/O, SIMD & Kernel Bypass", 7, 5, None, True),
    (9, "2026-11-30", "The Tail & the Tournament — Profiling, Latency Arbitrage & Pre-trade Risk · Final (Dec 8–11)", 8, 6, "final", True),
]
# the interactive companion page closest to each session's material
COMPANION_WEEK = {1: 1, 2: 2, 3: 5, 4: 6, 5: 2, 6: 7, 7: 9, 8: 11, 9: 14}


def deck(session, slides):
    """Deck evidence: 'slide 7' or 'slides 5–6, 9' of deck uN (N = session)."""
    return {"type": "deck", "session": session,
            "label": "Deck U%d · %s" % (session, slides)}

def lab(session, part):
    """The session's lab, labs/sessionNN.md; `part` names the steps."""
    return {"type": "lab", "session": session,
            "label": "Lab session %d · %s" % (session, part),
            "url": "%ssession%02d.md" % (LABS, session)}

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
    """One skill. `where` order must be deck, lab, hw, project, exam."""
    return {"id": sid, "category": cat, "name": name, "can": can,
            "introduced": intro, "practised": practised, "depth": depth,
            "where": where, "interview": interview}
