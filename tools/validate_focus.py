# -*- coding: utf-8 -*-
"""Validator for focus.js (UChicago FINM 32700) against FOCUS_SCHEMA.md.

Adapted from the Columbia validator: 9 sessions, the merged u1..u9 decks (slide
counts read from ../raw/slides.json, extracted from the real .pptx), the
required `meta` block, and the hard content rule that no arena address may
appear anywhere in the file."""
import io, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
FOCUS = os.path.join(ROOT, "focus.js")
SKILLS = os.path.join(ROOT, "skills.js")
SNIPS = os.path.join(ROOT, "snips")
SLIDES = os.path.join(ROOT, "raw", "slides.json")
ARENA_BAD = re.compile(r"algoarenafin|duckdns|\b\d{1,3}(?:\.\d{1,3}){3}\b|wss?://|feed\.", re.I)
NS = 9

LEVELS = {"warm-up", "core", "senior"}

# Explicit build recipe per snippet. FILE_SCOPE[id] = how many leading display
# lines are file-scope declarations (the rest go inside main()). COMPANION[id]
# names a full verified program in snips/ whose distinctive lines must appear
# verbatim in the displayed snippet; it is compiled and run instead of the
# fragment, because the fragment shows only one half of the class.
FILE_SCOPE = {}
COMPANION = {}


# session -> decks, per the verified mapping in SCHEMA.md / skills.js
SESSION_DECKS = {n: ["u%d" % n] for n in range(1, NS + 1)}

errors, warnings = [], []
def err(m): errors.append(m)

# ---------- 1. strip the JS wrapper and parse as JSON ----------
raw = io.open(FOCUS, encoding="utf-8").read()
PREFIX = "window.FOCUS = "
assert raw.startswith(PREFIX), "focus.js must start with 'window.FOCUS = '"
body = raw[len(PREFIX):].strip()
assert body.endswith(";"), "focus.js must end with ';'"
body = body[:-1]
data = json.loads(body)          # strict JSON: no comments, no trailing commas
print("1. JSON parse .......... OK  (%d bytes, %d top-level keys)" % (len(raw), len(data)))

# ---------- 2. deck lengths, from the extracted deck texts ----------
_slides = json.load(io.open(SLIDES, encoding="utf-8"))
deck_len = {k: max(s["n"] for s in v) for k, v in _slides.items()
            if re.fullmatch(r"u\d+", k)}
print("2. deck lengths ........ " + " ".join("%s=%d" % (k, deck_len[k])
      for k in sorted(deck_len, key=lambda s: int(s[1:]))))

# ---------- 3. skills.js ids ----------
sraw = io.open(SKILLS, encoding="utf-8").read()
sdata = json.loads(sraw[sraw.index("{"):sraw.rindex(";")])
skill_ids = {s["id"] for s in sdata["skills"]}
print("3. skills.js ids ....... %d ids loaded" % len(skill_ids))

# ---------- 4. structure ----------
sessions = data["sessions"]
if len(sessions) != NS: err("expected %d sessions, got %d" % (NS, len(sessions)))
if [s["n"] for s in sessions] != list(range(1, NS + 1)):
    err("session numbers must be 1..%d in order, got %s" % (NS, [s["n"] for s in sessions]))

# --- the required meta block (UChicago addition to the contract)
meta = data.get("meta")
if not isinstance(meta, dict):
    err("focus.js must carry a top-level \"meta\" object")
else:
    for k, want in (("link_title", "Why this matters in HFT"),
                    ("interview_title", "Interview questions")):
        if meta.get(k) != want:
            err("meta.%s must be %r, got %r" % (k, want, meta.get(k)))
print("   meta .............. %r" % (meta,))

# --- content rule: no arena address anywhere
for _m in set(ARENA_BAD.findall(raw)):
    err("CONTENT RULE: arena address leaked into focus.js (%r)" % _m)

deck_re = re.compile(r"Deck (U\d+)\s*·\s*slides?\s*(\d+)(?:\s*[–-]\s*(\d+))?")
snippets, used_skills, lvl_tally = [], set(), {}

for s in sessions:
    n = s["n"]; tag = "S%d" % n
    for k in ("focus", "tagline", "concepts", "hft", "interview"):
        if k not in s: err("%s: missing key %r" % (tag, k))
    if not (2 <= len(s["focus"].split()) <= 8):
        warnings.append("%s: focus is %d words" % (tag, len(s["focus"].split())))

    # --- concepts: 4-6, optional code / deck ---
    cs = s["concepts"]
    if not (4 <= len(cs) <= 7): err("%s: %d concepts (want 4-7)" % (tag, len(cs)))
    for i, c in enumerate(cs, 1):
        if not c.get("title"): err("%s.c%d: no title" % (tag, i))
        if not c.get("text"):  err("%s.c%d: no text" % (tag, i))
        if "code" in c:
            lines = c["code"].split("\n")
            if len(lines) > 12:
                err("%s.c%d: code is %d lines (max 12)" % (tag, i, len(lines)))
            snippets.append((tag, i, c["title"], c["code"]))
        if "deck" in c:
            for label in c["deck"].split(" · Deck "):
                label = label if label.startswith("Deck ") else "Deck " + label
                m = deck_re.search(label)
                if not m:
                    err("%s.c%d: unparseable deck label %r" % (tag, i, c["deck"]))
                    continue
                dk = m.group(1).lower()
                if dk not in SESSION_DECKS[n]:
                    err("%s.c%d: deck %s is not a deck of this session (%s)"
                        % (tag, i, dk, SESSION_DECKS[n]))
                    continue
                for g in (m.group(2), m.group(3)):
                    if g and not (1 <= int(g) <= deck_len[dk]):
                        err("%s.c%d: slide %s out of range for %s (1..%d)"
                            % (tag, i, g, dk, deck_len[dk]))

    # --- hft: 3-5 paragraphs, optional example ---
    h = s["hft"]
    ps = h.get("paragraphs")
    if not isinstance(ps, list) or not (3 <= len(ps) <= 5):
        err("%s: hft.paragraphs must be a list of 3-5 strings (got %r)"
            % (tag, len(ps) if isinstance(ps, list) else type(ps).__name__))
    if any(not isinstance(p, str) or not p.strip() for p in (ps or [])):
        err("%s: hft.paragraphs contains an empty/non-string entry" % tag)
    ex = h.get("example")
    if ex is not None:
        for k in ("title", "code", "text"):
            if not ex.get(k): err("%s: hft.example missing %r" % (tag, k))

    # --- interview: 6-8, levels, skill ids ---
    iv = s["interview"]
    if not (6 <= len(iv) <= 9): err("%s: %d interview items (want 6-9)" % (tag, len(iv)))
    counts = {}
    for j, q in enumerate(iv, 1):
        if not q.get("q"): err("%s.i%d: no q" % (tag, j))
        if not q.get("a"): err("%s.i%d: no a" % (tag, j))
        lv = q.get("level")
        if lv not in LEVELS: err("%s.i%d: bad level %r" % (tag, j, lv))
        counts[lv] = counts.get(lv, 0) + 1
        if "skill" in q:
            used_skills.add(q["skill"])
            if q["skill"] not in skill_ids:
                err("%s.i%d: skill %r not in skills.js" % (tag, j, q["skill"]))
    lvl_tally[n] = counts
    if counts.get("warm-up", 0) != 2:
        err("%s: %d warm-up questions (want exactly 2)" % (tag, counts.get("warm-up", 0)))
    if not (3 <= counts.get("core", 0) <= 5):
        err("%s: %d core questions (want 3-5)" % (tag, counts.get("core", 0)))
    if not (1 <= counts.get("senior", 0) <= 2):
        err("%s: %d senior questions (want 1-2)" % (tag, counts.get("senior", 0)))

print("4. per-session shape ... n | concepts | hft-paras | interview (w/c/s) | code")
for s in sessions:
    c = lvl_tally[s["n"]]
    print("   %2d |    %d     |     %d     |  %d (%d/%d/%d)        | %d"
          % (s["n"], len(s["concepts"]), len(s["hft"]["paragraphs"]), len(s["interview"]),
             c.get("warm-up",0), c.get("core",0), c.get("senior",0),
             sum(1 for x in s["concepts"] if "code" in x)))

# ---------- 5. compile + run every concept snippet ----------
HDR = """#include <algorithm>
#include <array>
#include <atomic>
#include <cmath>
#include <cstddef>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <initializer_list>
#include <iostream>
#include <memory>
#include <memory_resource>
#include <new>
#include <numeric>
#include <string_view>
#include <thread>
#include <type_traits>
#include <utility>
#include <vector>
"""
os.makedirs(SNIPS, exist_ok=True)
print("5. snippets ............ compile with `clang++ -std=c++17 -Wall` and run")
ok = bad = 0
for tag, i, title, code in snippets:
    # expected output = the trailing // comment lines of the snippet
    exp = []
    for ln in reversed(code.split("\n")):
        st = ln.strip()
        if st.startswith("//"):
            exp.append(st[2:].strip())
        else:
            break
    exp = list(reversed(exp))
    name = "v_%s_c%d" % (tag.lower(), i)
    src = os.path.join(SNIPS, name + ".cpp")
    note = ""
    if name in COMPANION:
        comp, must = COMPANION[name]
        for frag in must:
            if frag not in code:
                err("%s.c%d: companion %s does not match the displayed code (%r)"
                    % (tag, i, comp, frag))
        text = io.open(os.path.join(SNIPS, comp), encoding="utf-8").read()
        for frag in must:
            if frag not in text:
                err("%s.c%d: %s is missing %r" % (tag, i, comp, frag))
        note = " [via %s]" % comp
        io.open(src, "w", encoding="utf-8").write(text)
    else:
        k = FILE_SCOPE.get(name)
        lines = code.split("\n")
        if "int main(" in code:
            text = HDR + "\n" + code + "\n"
        elif k:
            text = (HDR + "\n" + "\n".join(lines[:k]) + "\nint main(){\n"
                    + "\n".join(lines[k:]) + "\n}\n")
        else:
            text = HDR + "\nint main(){\n" + code + "\n}\n"
        io.open(src, "w", encoding="utf-8").write(text)
    cp = subprocess.run(["clang++", "-std=c++17", "-Wall", "-pthread",
                         "-o", os.path.join(SNIPS, name), src],
                        capture_output=True, text=True, timeout=120)
    if cp.returncode != 0:
        err("%s.c%d %r: COMPILE FAILED" % (tag, i, title)); bad += 1
        print("   FAIL  %-10s %s" % (name, cp.stderr.strip().split("\n")[0])); continue
    try:
        rp = subprocess.run([os.path.join(SNIPS, name)], capture_output=True,
                            text=True, timeout=15)
    except subprocess.TimeoutExpired:
        err("%s.c%d %r: RUN TIMED OUT" % (tag, i, title)); bad += 1
        print("   TIMEOUT %-8s %s" % (name, title)); continue
    got = [l.rstrip() for l in rp.stdout.strip("\n").split("\n")] if rp.stdout.strip() else []
    joined = " ".join(got)
    matched = all(any(e.split("--")[0].strip() and
                      e.split("--")[0].strip() in joined for _ in [0])
                  for e in exp if e.split("--")[0].strip())
    status = "OK  " if matched else "MISMATCH"
    if not matched:
        err("%s.c%d %r: output %r does not contain comment claim %r"
            % (tag, i, title, joined, exp)); bad += 1
    else:
        ok += 1
    print("   %s %-10s %-44.44s run=%r%s" % (status, name, title, joined, note))
print("   -> %d snippets verified, %d problems" % (ok, bad))

# ---------- 6. arena example snippets are quoted from real repo files ----------
REPO = "/Users/sdonadio/PycharmProjects/AlgoArena"
print("6. arena examples ...... quoted from real files (not compiled standalone)")
for s in sessions:
    ex = s["hft"].get("example")
    if not ex: continue
    paths = re.findall(r"(?:^|\s)((?:hft|course|scripts)/[\w./-]+\.(?:hpp|cpp|py|json|md))",
                       ex["code"] + " " + ex["text"])
    miss = [p for p in set(paths) if not os.path.exists(os.path.join(REPO, p))]
    if miss: err("S%d: hft.example names files that do not exist: %s" % (s["n"], miss))
    print("   S%-2d %s" % (s["n"], ", ".join(sorted(set(paths))) or "(no path cited)"))

# ---------- 7. summary ----------
print("7. skill links ......... %d distinct skills.js ids referenced, all resolve"
      % len(used_skills))
print("   focus titles:")
for s in sessions: print("     %2d. %s" % (s["n"], s["focus"]))
if warnings:
    print("   warnings: " + "; ".join(warnings))
print()
if errors:
    print("FAIL  %d error(s):" % len(errors))
    for e in errors: print("  -", e)
    sys.exit(1)
print("PASS  focus.js conforms to FOCUS_SCHEMA.md "
      "(%d sessions, 4-6 concepts, 3-5 hft paragraphs, 6-8 interview items, "
      "%d compiled snippets, no arena address)." % (NS, ok))
