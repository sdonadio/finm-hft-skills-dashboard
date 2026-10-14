# -*- coding: utf-8 -*-
"""Session 5 focus — the Midterm (Mon Oct 26, remote on Canvas, 2h20; deck U5 = the
5-slide exam deck). Re-scheduled 2026-10-14: exam sessions carry NO lecture
content, so this page is exam-only: four "what to revise" cards (one per session
in scope), the logistics, and no interview questions (validate_focus.py treats
Session 5 as EXAM_ONLY). The checklist is the revision list built in sk2-sk4.
"""

FILE_SCOPE = {}

S = {
"n": 5,
"focus": "Midterm — what to revise",
"tagline": "No lecture tonight: a 140-minute remote exam on Sessions 1–4, templates included — then Project Phase 1 is due before midnight.",
"concepts": [
 {"title": "Revise Session 1 — the limit order book and its arithmetic",
  "text": "Read a book snapshot and compute the touch, the spread, the mid and the microprice; say why price-time priority makes your place in the queue an asset; work a maker/taker fee example through to the per-share result, both legs. The exam is mostly C++, but expect the vocabulary: tick-to-trade, colocation, what a crossed or locked book means. Re-read labs/session01.md and redo HW 1's metrics by hand on one snapshot.",
  "deck": "Deck U5 · slide 4"},
 {"title": "Revise Session 2 — pointers, the cost of memory, classes and RAII",
  "text": "Pointers versus references, pointer arithmetic, const in every position, and which line of a snippet is undefined behaviour (dangling, double delete, out-of-bounds, use after move). The memory hierarchy in numbers: a cache line is 64 bytes, a miss costs about 100 ns, so struct layout, padding and AoS versus SoA show up in the timings. Then the class: invariants, constructors and the Rule of Zero / Three / Five, what the compiler generates and when it stops, move semantics, and RAII as the reason a destructor runs on every exit path. Inheritance and the order of construction and destruction close it.",
  "deck": "Deck U5 · slide 4"},
 {"title": "Revise Session 3 — polymorphism, the vtable and smart pointers",
  "text": "Virtual dispatch: what the vptr and the vtable are, why a base class needs a virtual destructor, slicing, override and final, and why a virtual call costs an indirect branch plus a lost inlining opportunity rather than a fixed number of nanoseconds. std::variant with std::visit as the closed-set alternative. Ownership: unique_ptr (move-only, zero overhead with a stateless deleter), shared_ptr (a control block and atomic counts), weak_ptr to break a cycle, make_unique / make_shared, and how a function signature states who owns what.",
  "deck": "Deck U5 · slide 4"},
 {"title": "Revise Session 4 — templates, compile-time and CRTP",
  "text": "Function and class templates with type and non-type parameters, deduction, specialisation, and why templates live in headers. Parameter packs, fold expressions and std::forward. Type traits, C++20 concepts and requires-clauses, if constexpr. constexpr versus consteval and static_assert. CRTP — a base that static_casts to its Derived, so the hook is resolved at compile time and the indirect branch is gone — and policy-based design. Expect what-does-this-print and is-this-well-formed questions on short template snippets.",
  "deck": "Deck U5 · slide 4"}
],
"hft": {
 "text": "Exam night: no lecture; the midterm covers Sessions 1–4, templates and CRTP included.",
 "paragraphs": [
  "Tonight is the exam and nothing else. The quiz unlocks on Canvas at 6:00 pm CT inside this Zoom session; begin by 6:10, when the access code is read aloud and posted once in chat. You get one attempt, a 140-minute timer from the moment you open it, closed book, camera on, one browser tab, and the lock at 8:40 pm does not move — open it late and you get less time, not a later deadline. If your connection drops, rejoin and re-open the quiz: the timer kept running and your saved answers are there.",
  "The questions are multiple choice, one point each, drawn at random from one group per topic — pointers and memory layout; allocation, RAII and smart pointers; OOP, virtual dispatch and the object model; templates, CRTP and compile-time; complexity, cache and performance basics — so every paper covers every topic. Most show a short C++ snippet and ask what it prints, whether it is well-formed, or which line is undefined behaviour; assume a 64-bit target, a 64-byte cache line and little-endian. There is no penalty for a wrong answer, so answer everything. Memory pools, order-book data structures and concurrency are not on it: they are Sessions 6 and 7.",
  "After the exam: Project Phase 1 — The Fast Hot Path is due tonight, Mon Oct 26 at 10:59 pm CT (submit what works; this is not the night to refactor), and HW 4 — Templates & CRTP stays due Thu Nov 5. Session 6 on Mon Nov 2 opens with malloc against a pool, then puts vector, list, map, hash and heap against the three questions an order book must answer; pre-read labs/session06.md in the starter repo. The checklist below is your revision list: tick a line only when you could explain it to someone else without notes."
 ]
},
"interview": []
}
