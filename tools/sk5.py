# -*- coding: utf-8 -*-
"""Session 5 skills — Templates, Compile-Time & CRTP (deck U5, labs/session05.md).

The midterm runs first that night (scope Sessions 1-4), so nothing here carries a
midterm tag; templates are examined on the final ("Templates, STL & Complexity").
Practised here but defined in sk4.py: perf.virtual-cost (the CRTP row of
dispatch_bench), cpp.variant-visit (the overload{} visitor).
"""
from skills_common import *  # noqa: F401,F403

SKILLS = [
    S("cpp.templates", "cpp", "Function & class templates",
      "You can write a function or class template with a type and a non-type parameter, let the compiler deduce its arguments, specialise the one type that deserves hand-tuning, and say why templates live in headers and what every extra instantiation costs in code size.",
      5, [6], 3,
      [deck(5, "slides 6–8"), deck(6, "slide 9"),
       lab(5, "steps 1–2 — Ring<T, N>, two deliberate compile errors, Wire<T> specializations"),
       hw(5), final("tpl")], True),
    S("cpp.variadic-templates", "cpp", "Parameter packs, folds & perfect forwarding",
      "You can write a variadic template that folds over its pack in one line, forward every argument unchanged with std::forward, and build the overload{} visitor from a pack of lambdas.",
      5, [], 3,
      [deck(5, "slides 10–11"),
       lab(5, "step 3 — folds, if constexpr and the overload{} visitor"),
       hw(5), final("tpl")]),
    S("cpp.type-traits-constraints", "cpp", "Type traits, concepts & if constexpr",
      "You can ask the compiler questions about a type with <type_traits>, constrain a template with a C++20 concept instead of SFINAE so the error names the failed requirement, and give one template a separate code path per type with if constexpr.",
      5, [], 3,
      [deck(5, "slides 12–14"),
       lab(5, "steps 3–4 — if constexpr, then SFINAE next to a concept"),
       hw(5), final("tpl")], True),
    S("cpp.constexpr", "cpp", "constexpr, consteval & static_assert",
      "You can move a table or a constant into the compiler with constexpr, force compile-time evaluation with consteval, and park every size, fee and layout assumption in a static_assert so a violation fails the build instead of the market.",
      5, [], 3,
      [deck(5, "slide 16"),
       lab(5, "step 5 — consteval fees and a compile-time tick table"),
       hw(5), final("tpl")], True),
    S("cpp.crtp-policies", "cpp", "CRTP & policy-based design",
      "You can replace a virtual hook with a CRTP base that calls down through static_cast, show with dispatch_bench and the -O2 assembly that the indirect branch is gone, and assemble a class from policy template parameters.",
      5, [], 3,
      [deck(5, "slides 17–19"),
       lab(5, "steps 6–7 — the CRTP row in dispatch_bench, then a policy-based Quoter"),
       hw(5), final("tpl")], True),
]
