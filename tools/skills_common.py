# -*- coding: utf-8 -*-
"""Shared constants + helpers for the FINM 32700 skills.js build.

Each session's skills live in tools/skN.py (``from skills_common import *`` and
define ``SKILLS = [...]``); tools/build_skills.py stitches sk1..sk9 together.

Session map: course/hft-uchicago/RESEQUENCE_PLAN.md (2026-09-29) — one deck
(uN), one lab (labs/sessionNN.md) and one homework per session.

CONTENT RULE: no arena URL, hostname or IP appears anywhere in the output.
"""

CANVAS = "https://canvas.uchicago.edu/courses/73835/assignments/"
LABS = "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/"
COMP = "https://sdonadio.github.io/low-latency-trading-arena/"

# n -> (canvas assignment id, name, due date in America/Chicago)
HW = {
    1: (898723, "HW 1 — Order-book metrics in C++",                    "2026-10-08"),
    2: (898724, "HW 2 — Pointers, references & the cost of a copy",     "2026-10-15"),
    3: (898725, "HW 3 — Classes, the Rule of Five & RAII",              "2026-10-22"),
    4: (898726, "HW 4 — Polymorphism & smart ownership",                "2026-10-29"),
    5: (898727, "HW 5 — Templates & CRTP",                              "2026-11-05"),
    6: (898728, "HW 6 — A memory pool & a fast order book",             "2026-11-12"),
    7: (898729, "HW 7 — An SPSC lock-free ring buffer",                 "2026-11-19"),
    8: (898730, "HW 8 — Fast FIX parser + uint64→text",                 "2026-12-01"),
    9: (898731, "HW 9 — Cross-venue stale-quote detector",              "2026-12-10"),
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
# The midterm (Session 5) covers Sessions 1-4 only: use ptr / raii / oop / cx.
MID = {
    "ptr":  "Pointers, References & Memory Layout",
    "raii": "Allocation, RAII & Smart Pointers",
    "oop":  "OOP, Virtual Dispatch & Object Model",
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

# n, date, title, hw n, project phase, exam
SESSIONS = [
    (1, "2026-09-28", "HFT Foundations & Market Microstructure", 1, 0, None),
    (2, "2026-10-05", "Pointers & the Cost of Memory", 2, 0, None),
    (3, "2026-10-12", "Object-Oriented C++ I — Encapsulation & Inheritance", 3, 1, None),
    (4, "2026-10-19", "Object-Oriented C++ II — Polymorphism & Smart Pointers", 4, 1, None),
    (5, "2026-10-26", "Templates, Compile-Time & CRTP · Midterm (remote)", 5, 2, "midterm"),
    (6, "2026-11-02", "Memory Pools & the Order Book", 6, 2, None),
    (7, "2026-11-09", "Concurrency — From Atomics to Lock-Free", 7, 3, None),
    (8, "2026-11-16", "The Wire & the Machine — Protocols, Async I/O, SIMD & Kernel Bypass", 8, 5, None),
    (9, "2026-11-30", "The Tail & the Tournament — Profiling, Latency Arbitrage · Final (Dec 8–11)", 9, 7, "final"),
]
# the interactive companion page closest to each session's material
COMPANION_WEEK = {1: 1, 2: 2, 3: 3, 4: 5, 5: 6, 6: 7, 7: 9, 8: 11, 9: 14}


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
