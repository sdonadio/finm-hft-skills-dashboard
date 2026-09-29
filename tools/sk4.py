# -*- coding: utf-8 -*-
"""Session 4 skills — OOP II: polymorphism & smart pointers (deck U4, labs/session04.md).

Practised here but defined where they are introduced (sk3.py): cpp.move-semantics,
cpp.raii, cpp.inheritance.
"""
from skills_common import *  # noqa: F401,F403

SKILLS = [
    S("cpp.virtual-dispatch", "cpp", "Virtual functions, override/final & abstract interfaces",
      "You can make a call through a Base& run the derived body with virtual and override, give every polymorphic base a virtual destructor, write an abstract interface of pure virtuals, and name the three things dynamic dispatch does not change: default arguments, overload sets and name lookup.",
      4, [], 3,
      [deck(4, "slides 5–8, 11"),
       lab(4, "steps 1–3 — an IStrategy interface and a broken override, delete through a base, the vptr in a constructor"),
       hw(4), midterm("oop"), final("core")], True),
    S("perf.virtual-cost", "perf", "The vptr, the vtable & what a virtual call costs",
      "You can explain a virtual call as two dependent loads and an indirect branch, quote its measured cost when predicted and when mispredicted, and say why the inlining it blocks is the bigger bill.",
      4, [5], 3,
      [deck(4, "slides 10, 12–14"), deck(5, "slide 18"),
       lab(4, "step 4 — make dispatch, your table next to slide 13"),
       hw(4), midterm("oop"), final("simd")], True),
    S("cpp.variant-visit", "cpp", "A closed set: std::variant + std::visit",
      "You can model a closed set of message types as a std::variant stored by value, dispatch it with an exhaustive std::visit visitor, and say when that beats a virtual hierarchy and when it does not.",
      4, [5], 3,
      [deck(4, "slides 14–15"), deck(5, "slide 11"),
       hw(4), proj(1), final("tpl")], True),
    S("cpp.smart-pointers", "cpp", "unique_ptr, shared_ptr, weak_ptr",
      "You can own an object with unique_ptr by default, justify shared_ptr only for genuinely shared lifetime, explain why its tax is the atomic copy and not the dereference, and break an ownership cycle with weak_ptr.",
      4, [], 3,
      [deck(4, "slides 18–22"),
       lab(4, "steps 5–6 — sizes and allocation counts, the shared_ptr tax, contention and a weak_ptr cycle"),
       hw(4), midterm("raii"), final("core")], True),
    S("cpp.ownership-contracts", "cpp", "Custom deleters & ownership as an API contract",
      "You can wrap any resource with a close in a unique_ptr with a stateless custom deleter, state ownership in a signature (sink by value, borrow by reference, source by return), and build polymorphic parts once at startup so on_book only ever borrows.",
      4, [], 3,
      [deck(4, "slides 19, 23, 25–28"),
       lab(4, "steps 7–8 — count your on_book allocations with tick_alloc, then own an ISignal chosen at startup"),
       hw(4), proj(1), midterm("raii")], True),
]
