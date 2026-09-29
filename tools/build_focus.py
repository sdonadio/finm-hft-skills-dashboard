# -*- coding: utf-8 -*-
"""Build focus.js (window.FOCUS) for UChicago FINM 32700.

The focus of session N (one main technical focus, grounded in deck uN, the
speaker guide sessionN_talking_points.md and labs/sessionNN.md) is authored in
tools/fpN.py as a dict `S`; this script stitches fp1..fp9 into one
window.FOCUS assignment and prepends the `meta` block the UChicago site expects.

Run tools/validate_focus.py afterwards: it re-parses the output as strict JSON,
range-checks every "Deck U<n> · slide(s) ..." label against the real slide
counts, compiles (clang++ -std=c++20) and runs every concept snippet, and
refuses any arena address or "Week N" wording.
"""
import importlib, io, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

META = {"link_title": "Why this matters in HFT",
        "interview_title": "Interview questions"}

sessions = [importlib.import_module("fp%d" % n).S for n in range(1, 10)]
assert [s["n"] for s in sessions] == list(range(1, 10)), [s["n"] for s in sessions]

out = "window.FOCUS = " + json.dumps(
    {"meta": META, "sessions": sessions}, indent=2, ensure_ascii=False) + ";\n"
path = os.path.join(ROOT, "focus.js")
io.open(path, "w", encoding="utf-8").write(out)
print("wrote", path, os.path.getsize(path), "bytes,", len(sessions), "sessions")
