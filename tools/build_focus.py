# -*- coding: utf-8 -*-
"""Build focus.js (window.FOCUS) for UChicago FINM 32700.

Stitches the three authored parts (parts/focus_s1_s3.json, focus_s4_s6.json,
focus_s7_s9.json — one main technical focus per session, grounded in the real
u1..u9 decks) into a single window.FOCUS assignment, and prepends the `meta`
block the UChicago site expects.

Run tools/validate_focus.py afterwards: it re-parses the output as strict JSON,
range-checks every "Deck U<n> · slide(s) ..." label against the real slide
counts, compiles and runs every concept snippet, and refuses any arena address.
"""
import io, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PARTS = ("focus_s1_s3.json", "focus_s4_s6.json", "focus_s7_s9.json")

META = {"link_title": "Why this matters in HFT",
        "interview_title": "Interview questions"}

sessions = []
for p in PARTS:
    with io.open(os.path.join(ROOT, "parts", p), encoding="utf-8") as f:
        sessions.extend(json.load(f))

assert [s["n"] for s in sessions] == list(range(1, 10)), [s["n"] for s in sessions]

out = "window.FOCUS = " + json.dumps(
    {"meta": META, "sessions": sessions}, indent=2, ensure_ascii=False) + ";\n"
path = os.path.join(ROOT, "focus.js")
io.open(path, "w", encoding="utf-8").write(out)
print("wrote", path, os.path.getsize(path), "bytes,", len(sessions), "sessions")
