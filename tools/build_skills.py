#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build skills.js (window.SKILLS) for UChicago FINM 32700.

Session map (authoritative): re-scheduled 2026-10-05 (old S2+S3 merged into S2).
  S1 microstructure & the LOB · S2 pointers & the cost of memory + OOP I
  (encapsulation & inheritance) · S3 OOP II (polymorphism & smart pointers) ·
  S4 templates, compile-time & CRTP · S5 memory pools & the order book (+ the
  midterm, Sessions 1-4) · S6 concurrency, atomics to lock-free · S7 the wire &
  the machine · S8 the tail & the tournament · S9 pre-trade risk & controls
  (+ the final).

Sources: decks course/hft-uchicago/uN.pptx (slide numbers extracted from the real
.pptx into ../raw/slides.json), speaker guides sessionN_talking_points.md, labs
labs/sessionNN.md in the hft-cpp-starter-uchicago repo, Canvas 73835 assignment
ids. Shared constants/helpers: tools/skills_common.py; the skills of session N
live in tools/skN.py, in teaching order.

Run tools/validate_skills.py afterwards.
CONTENT RULE: no arena URL, hostname or IP appears anywhere in the output.
"""
import importlib, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from skills_common import (SESSIONS, HW, PH, CANVAS, LABS, COMP,   # noqa: E402
                           COMPANION_WEEK)

OUT = os.path.join(os.path.dirname(HERE), "skills.js")

SKILLS = []
for n in range(1, 10):
    SKILLS.extend(importlib.import_module("sk%d" % n).SKILLS)


def build():
    order = {s["id"]: i for i, s in enumerate(SKILLS)}
    sessions = []
    for n, date, title, hwn, phase, exam in SESSIONS:
        intro = sorted([s["id"] for s in SKILLS if s["introduced"] == n], key=order.get)
        prac = sorted([s["id"] for s in SKILLS if n in s["practised"]], key=order.get)
        hid, hname, hdue = HW[hwn]
        pid, pname, pdue = PH[phase]
        sessions.append({
            "n": n, "date": date, "title": title, "decks": ["u%d" % n],
            "lab": {"label": "Lab — Session %d (labs/session%02d.md)" % (n, n),
                    "url": "%ssession%02d.md" % (LABS, n)},
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
