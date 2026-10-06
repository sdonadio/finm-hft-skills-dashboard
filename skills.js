window.SKILLS = {
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
    "companion_url": "https://sdonadio.github.io/low-latency-trading-arena/"
  },
  "categories": [
    {
      "id": "cpp",
      "name": "C++ language",
      "color": "#1D4F91"
    },
    {
      "id": "perf",
      "name": "Systems & performance",
      "color": "#C8102E"
    },
    {
      "id": "tools",
      "name": "Tooling & engineering",
      "color": "#2E8B57"
    },
    {
      "id": "trading",
      "name": "Trading & microstructure",
      "color": "#B8860B"
    }
  ],
  "sessions": [
    {
      "n": 1,
      "date": "2026-09-28",
      "title": "HFT Foundations & Market Microstructure",
      "decks": [
        "u1"
      ],
      "lab": {
        "label": "Lab — Session 1 (labs/session01.md)",
        "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session01.md"
      },
      "hw": {
        "label": "HW 1 — Order-book metrics in C++",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898723",
        "due": "2026-10-08"
      },
      "project": {
        "label": "Project — Phase 0: Connect & Baseline",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898733",
        "due": "2026-10-12"
      },
      "exam": null,
      "companion_url": "https://sdonadio.github.io/low-latency-trading-arena/week1.html",
      "skills": [
        "trading.lob",
        "trading.price-time-priority",
        "trading.tick-to-trade",
        "trading.fees-maker-taker",
        "trading.colocation",
        "tools.cmake-build",
        "tools.arena-client",
        "tools.replay-harness"
      ]
    },
    {
      "n": 2,
      "date": "2026-10-05",
      "title": "Pointers & the Cost of Memory · Object-Oriented C++ I — Encapsulation & Inheritance",
      "decks": [
        "u2"
      ],
      "lab": {
        "label": "Lab — Session 2 (labs/session02.md)",
        "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session02.md"
      },
      "hw": {
        "label": "HW 2 — Pointers, classes, the Rule of Five & RAII",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898724",
        "due": "2026-10-22"
      },
      "project": {
        "label": "Project — Phase 0: Connect & Baseline",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898733",
        "due": "2026-10-12"
      },
      "exam": null,
      "companion_url": "https://sdonadio.github.io/low-latency-trading-arena/week2.html",
      "skills": [
        "perf.memory-hierarchy",
        "cpp.pointers",
        "cpp.raw-allocation",
        "perf.data-layout",
        "tools.sanitizers",
        "tools.benchmarking",
        "cpp.classes-invariants",
        "cpp.rule-of-five",
        "cpp.raii",
        "cpp.inheritance"
      ]
    },
    {
      "n": 3,
      "date": "2026-10-12",
      "title": "Object-Oriented C++ II — Polymorphism & Smart Pointers",
      "decks": [
        "u3"
      ],
      "lab": {
        "label": "Lab — Session 3 (labs/session03.md)",
        "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session03.md"
      },
      "hw": {
        "label": "HW 3 — Polymorphism & smart ownership",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898725",
        "due": "2026-10-29"
      },
      "project": {
        "label": "Project — Phase 1: The Fast Hot Path",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898734",
        "due": "2026-10-26"
      },
      "exam": null,
      "companion_url": "https://sdonadio.github.io/low-latency-trading-arena/week5.html",
      "skills": [
        "cpp.virtual-dispatch",
        "perf.virtual-cost",
        "cpp.variant-visit",
        "cpp.smart-pointers",
        "cpp.ownership-contracts",
        "cpp.rule-of-five",
        "cpp.raii",
        "cpp.inheritance"
      ]
    },
    {
      "n": 4,
      "date": "2026-10-19",
      "title": "Templates, Compile-Time & CRTP",
      "decks": [
        "u4"
      ],
      "lab": {
        "label": "Lab — Session 4 (labs/session04.md)",
        "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session04.md"
      },
      "hw": {
        "label": "HW 4 — Templates & CRTP",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898726",
        "due": "2026-11-05"
      },
      "project": {
        "label": "Project — Phase 2: The Local Order Book",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898735",
        "due": "2026-11-05"
      },
      "exam": null,
      "companion_url": "https://sdonadio.github.io/low-latency-trading-arena/week6.html",
      "skills": [
        "cpp.templates",
        "cpp.variadic-templates",
        "cpp.type-traits-constraints",
        "cpp.constexpr",
        "cpp.crtp-policies",
        "perf.virtual-cost",
        "cpp.variant-visit"
      ]
    },
    {
      "n": 5,
      "date": "2026-10-26",
      "title": "Memory Pools & the Order Book · Midterm (remote)",
      "decks": [
        "u5"
      ],
      "lab": {
        "label": "Lab — Session 5 (labs/session05.md)",
        "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session05.md"
      },
      "hw": {
        "label": "HW 5 — A memory pool & a fast order book",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898727",
        "due": "2026-11-12"
      },
      "project": {
        "label": "Project — Phase 2: The Local Order Book",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898735",
        "due": "2026-11-05"
      },
      "exam": "midterm",
      "companion_url": "https://sdonadio.github.io/low-latency-trading-arena/week7.html",
      "skills": [
        "perf.object-pool",
        "cpp.placement-new",
        "perf.arena-allocator",
        "cpp.stl-containers",
        "perf.open-addressing-hash",
        "trading.flat-order-book",
        "trading.queue-position",
        "perf.complexity-in-cache-terms",
        "perf.incremental-computation",
        "cpp.templates"
      ]
    },
    {
      "n": 6,
      "date": "2026-11-02",
      "title": "Concurrency — From Atomics to Lock-Free",
      "decks": [
        "u6"
      ],
      "lab": {
        "label": "Lab — Session 6 (labs/session06.md)",
        "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session06.md"
      },
      "hw": {
        "label": "HW 6 — An SPSC lock-free ring buffer",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898728",
        "due": "2026-11-19"
      },
      "project": {
        "label": "Project — Phase 3: Threading to Accelerate",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898736",
        "due": "2026-11-12"
      },
      "exam": null,
      "companion_url": "https://sdonadio.github.io/low-latency-trading-arena/week9.html",
      "skills": [
        "cpp.data-races",
        "cpp.atomics-memory-order",
        "perf.lock-tail-cost",
        "cpp.compare-and-swap",
        "perf.spsc-ring",
        "perf.back-pressure",
        "perf.shared-memory-ring",
        "cpp.cpp20-coordination",
        "perf.data-layout",
        "tools.sanitizers"
      ]
    },
    {
      "n": 7,
      "date": "2026-11-09",
      "title": "The Wire & the Machine — Protocols, Async I/O, SIMD & Kernel Bypass",
      "decks": [
        "u7"
      ],
      "lab": {
        "label": "Lab — Session 7 (labs/session07.md)",
        "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session07.md"
      },
      "hw": {
        "label": "HW 7 — Fast FIX parser + uint64→text",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898729",
        "due": "2026-12-01"
      },
      "project": {
        "label": "Project — Phase 5: Wire & Hardware Tuning",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898738",
        "due": "2026-12-01"
      },
      "exam": null,
      "companion_url": "https://sdonadio.github.io/low-latency-trading-arena/week11.html",
      "skills": [
        "trading.fix-protocol",
        "trading.binary-market-data",
        "trading.feed-sequencing",
        "tools.message-framing",
        "perf.nonblocking-io",
        "perf.zero-copy-parse",
        "perf.simd",
        "perf.kernel-bypass",
        "perf.cpu-pinning-numa",
        "perf.hardware-timestamping"
      ]
    },
    {
      "n": 8,
      "date": "2026-11-16",
      "title": "The Tail & the Tournament — Profiling & Latency Arbitrage",
      "decks": [
        "u8"
      ],
      "lab": {
        "label": "Lab — Session 8 (labs/session08.md)",
        "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session08.md"
      },
      "hw": {
        "label": "HW 8 — Cross-venue stale-quote detector",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898730",
        "due": "2026-12-03"
      },
      "project": {
        "label": "Project — Phase 7: The Tournament",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898740",
        "due": "2026-12-11"
      },
      "exam": null,
      "companion_url": "https://sdonadio.github.io/low-latency-trading-arena/week14.html",
      "skills": [
        "tools.perf-profiler",
        "perf.tail-diagnosis",
        "tools.compiler-flags",
        "trading.nbbo-latency-arb",
        "trading.smart-order-routing",
        "trading.market-making",
        "trading.adverse-selection",
        "trading.hft-ethics",
        "trading.price-time-priority",
        "trading.queue-position"
      ]
    },
    {
      "n": 9,
      "date": "2026-11-30",
      "title": "Pre-trade Risk & Controls · Final (Dec 8–11)",
      "decks": [
        "u9"
      ],
      "lab": {
        "label": "Lab — Session 9 (labs/session09.md)",
        "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session09.md"
      },
      "hw": {
        "label": "HW 9 — A pre-trade risk gate",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898731",
        "due": "2026-12-10"
      },
      "project": {
        "label": "Project — Phase 7: The Tournament",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898740",
        "due": "2026-12-11"
      },
      "exam": "final",
      "companion_url": "https://sdonadio.github.io/low-latency-trading-arena/week14.html",
      "skills": [
        "trading.order-size-notional-collar",
        "trading.position-exposure-limits",
        "perf.token-bucket-throttle",
        "cpp.atomic-kill-switch",
        "trading.self-trade-prevention",
        "perf.risk-check-cost",
        "trading.risk-regulation",
        "trading.price-time-priority",
        "cpp.atomics-memory-order"
      ]
    }
  ],
  "skills": [
    {
      "id": "trading.lob",
      "category": "trading",
      "name": "The central limit order book",
      "can": "You can read a two-sided limit order book and compute the spread, mid, microprice and order-book imbalance from the top-of-book prices and sizes.",
      "introduced": 1,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 1,
          "label": "Deck U1 · slides 10–12"
        },
        {
          "type": "lab",
          "session": 1,
          "label": "Lab session 1 · step 4 and the hand-computed book in Your turn",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session01.md"
        },
        {
          "type": "hw",
          "label": "HW 1 — Order-book metrics in C++",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898723"
        },
        {
          "type": "exam",
          "label": "Final · group: Low-Latency System Design: Allocators, Order Books & Timing"
        }
      ],
      "interview": true
    },
    {
      "id": "trading.price-time-priority",
      "category": "trading",
      "name": "Price-time priority & the FIFO queue",
      "can": "You can apply price-then-time priority to say which resting order fills first, and explain why a cancel-and-repost sends you to the back of the queue.",
      "introduced": 1,
      "practised": [
        8,
        9
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 1,
          "label": "Deck U1 · slide 11"
        },
        {
          "type": "deck",
          "session": 8,
          "label": "Deck U8 · slide 17"
        },
        {
          "type": "lab",
          "session": 9,
          "label": "Lab session 9 · Step 3 — self-cross bound and duplicate check",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session09.md"
        },
        {
          "type": "hw",
          "label": "HW 1 — Order-book metrics in C++",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898723"
        },
        {
          "type": "exam",
          "label": "Final · group: Low-Latency System Design: Allocators, Order Books & Timing"
        }
      ],
      "interview": true
    },
    {
      "id": "trading.tick-to-trade",
      "category": "trading",
      "name": "Tick-to-trade latency & the tail",
      "can": "You can define tick-to-trade latency, report it as p50/p99/p99.9 instead of a mean, and explain why the tail is what decides an HFT race.",
      "introduced": 1,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 1,
          "label": "Deck U1 · slides 13, 19"
        },
        {
          "type": "lab",
          "session": 1,
          "label": "Lab session 1 · step 3 — the tick->order latency print",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session01.md"
        },
        {
          "type": "project",
          "label": "Project — Phase 0: Connect & Baseline",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898733"
        },
        {
          "type": "exam",
          "label": "Final · group: Measurement, Tail Latency & Production Practice"
        }
      ],
      "interview": true
    },
    {
      "id": "trading.fees-maker-taker",
      "category": "trading",
      "name": "Maker/taker fees & rebates",
      "can": "You can work out whether a fill was actually profitable once the taker fee or maker rebate is applied to the notional.",
      "introduced": 1,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 1,
          "label": "Deck U1 · slide 12"
        },
        {
          "type": "lab",
          "session": 1,
          "label": "Lab session 1 · step 3 — the FEE_SCHEDULE line",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session01.md"
        }
      ],
      "interview": false
    },
    {
      "id": "trading.colocation",
      "category": "trading",
      "name": "Colocation & the latency arms race",
      "can": "You can explain what colocation buys and weigh a reduced venue latency tier against its cost using measured percentiles.",
      "introduced": 1,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 1,
          "label": "Deck U1 · slides 8, 14"
        },
        {
          "type": "project",
          "label": "Project — Phase 0: Connect & Baseline",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898733"
        }
      ],
      "interview": false
    },
    {
      "id": "tools.cmake-build",
      "category": "tools",
      "name": "Building a C++ project with CMake",
      "can": "You can configure and build a C++ target with CMake and keep one build directory per flag set, so a cached flag never lies to you about what you measured.",
      "introduced": 1,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 1,
          "label": "Deck U1 · slide 20"
        },
        {
          "type": "lab",
          "session": 1,
          "label": "Lab session 1 · step 2 — build the arena C++ client",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session01.md"
        },
        {
          "type": "project",
          "label": "Project — Phase 0: Connect & Baseline",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898733"
        }
      ],
      "interview": false
    },
    {
      "id": "tools.arena-client",
      "category": "tools",
      "name": "Writing a bot on the arena C++ client",
      "can": "You can subclass the arena WebSocket bot client, override on_book/on_fill/on_ack, and place or cancel orders from the hot path.",
      "introduced": 1,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 1,
          "label": "Deck U1 · slides 17–18"
        },
        {
          "type": "lab",
          "session": 1,
          "label": "Lab session 1 · step 3 — connect and get on the board",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session01.md"
        },
        {
          "type": "project",
          "label": "Project — Phase 0: Connect & Baseline",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898733"
        }
      ],
      "interview": false
    },
    {
      "id": "tools.replay-harness",
      "category": "tools",
      "name": "Offline replay & percentile reporting",
      "can": "You can replay a recorded tape through your bot offline and read the p50/p99/p99.9 table it prints, so an A/B change is measured rather than guessed.",
      "introduced": 1,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 1,
          "label": "Deck U1 · slide 19"
        },
        {
          "type": "project",
          "label": "Project — Phase 0: Connect & Baseline",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898733"
        },
        {
          "type": "exam",
          "label": "Final · group: Measurement, Tail Latency & Production Practice"
        }
      ],
      "interview": false
    },
    {
      "id": "perf.memory-hierarchy",
      "category": "perf",
      "name": "The memory hierarchy, stack vs heap & storage duration",
      "can": "You can put rough numbers on a register, L1, L2, L3 and DRAM access, explain why the stack is a nearly free bump pointer while the heap is a call into a service, and say which of the four storage durations a variable has.",
      "introduced": 2,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck U2 · slides 5–7"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab session 2 · Lab A — stack vs heap, sink the pointer",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session02.md"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Complexity, Cache & Performance Basics"
        },
        {
          "type": "exam",
          "label": "Final · group: Cache Effects, False Sharing & Data Layout"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.pointers",
      "category": "cpp",
      "name": "Pointers, references & the cost of a copy",
      "can": "You can walk an array with a raw pointer, read a const-qualified declaration right to left, explain where array decay loses the length, choose between a pointer and a reference by asking whether 'absent' is a legal answer, and default to const& for anything bigger than two words so a large struct is not copied on every call.",
      "introduced": 2,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck U2 · slides 9–15"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab session 2 · Lab A — pointers, const and decay: read the errors; run starters/hw02 as shipped",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session02.md"
        },
        {
          "type": "hw",
          "label": "HW 2 — Pointers, classes, the Rule of Five & RAII",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898724"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Pointers, References & Memory Layout"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.raw-allocation",
      "category": "cpp",
      "name": "malloc / calloc / new / delete, the classic bugs & allocator non-determinism",
      "can": "You can pair every malloc/calloc with free, every new with delete and every new[] with delete[], name the five classic heap bugs, and explain why the same allocation can take 12 ns or microseconds and land in p99.9.",
      "introduced": 2,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck U2 · slides 17–19, 23, 25–26, 46–47"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab session 2 · Lab A — memory bugs under a sanitizer",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session02.md"
        },
        {
          "type": "hw",
          "label": "HW 2 — Pointers, classes, the Rule of Five & RAII",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898724"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Allocation, RAII & Smart Pointers"
        },
        {
          "type": "exam",
          "label": "Final · group: Low-Latency System Design: Allocators, Order Books & Timing"
        }
      ],
      "interview": true
    },
    {
      "id": "perf.data-layout",
      "category": "perf",
      "name": "Data layout & locality: contiguous blocks, SoA, padding, the 64-byte line & false sharing",
      "can": "You can replace a double** matrix with one contiguous block and keep the inner loop on the contiguous axis, choose a struct-of-arrays layout so a hot scan streams whole cache lines, predict sizeof and alignof and reorder fields widest-first, and use alignas(64) so two cores never fight over one line.",
      "introduced": 2,
      "practised": [
        6
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck U2 · slides 20–22, 28–30, 54, 57"
        },
        {
          "type": "deck",
          "session": 6,
          "label": "Deck U6 · slide 20"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab session 2 · Lab A — contiguous vs pointer chase, false sharing and alignas(64); Lab B — layout: sizeof, padding, static_assert",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session02.md"
        },
        {
          "type": "hw",
          "label": "HW 2 — Pointers, classes, the Rule of Five & RAII",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898724"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Complexity, Cache & Performance Basics"
        },
        {
          "type": "exam",
          "label": "Final · group: Cache Effects, False Sharing & Data Layout"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.sanitizers",
      "category": "tools",
      "name": "Finding bugs with ASan, UBSan, leaks & ThreadSanitizer",
      "can": "You can build a -O0 -g binary with AddressSanitizer (and UBSan, or ThreadSanitizer for a threaded one), read the report down to the offending line, find a leak with LSan on Linux or leaks --atExit on macOS, and treat a clean run as evidence about one input rather than proof.",
      "introduced": 2,
      "practised": [
        6
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck U2 · slides 23–24"
        },
        {
          "type": "deck",
          "session": 6,
          "label": "Deck U6 · slide 6"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab session 2 · Lab A — memory bugs under a sanitizer",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session02.md"
        },
        {
          "type": "lab",
          "session": 6,
          "label": "Lab session 6 · part A — the race under TSan",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session06.md"
        },
        {
          "type": "exam",
          "label": "Final · group: Measurement, Tail Latency & Production Practice"
        }
      ],
      "interview": false
    },
    {
      "id": "tools.benchmarking",
      "category": "tools",
      "name": "Honest micro-benchmarking & percentiles",
      "can": "You can time a hot function with steady_clock in a -O2 build, warm up first, sink the result so the optimiser cannot delete the work, batch tiny operations, and report p50/p99/p99.9 with your machine stated rather than one mean.",
      "introduced": 2,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck U2 · slides 32–34"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab session 2 · Lab A — an honest micro-benchmark, and a dishonest one",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session02.md"
        },
        {
          "type": "hw",
          "label": "HW 2 — Pointers, classes, the Rule of Five & RAII",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898724"
        },
        {
          "type": "project",
          "label": "Project — Phase 0: Connect & Baseline",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898733"
        },
        {
          "type": "exam",
          "label": "Final · group: Measurement, Tail Latency & Production Practice"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.classes-invariants",
      "category": "cpp",
      "name": "Classes, access control, invariants & operators",
      "can": "You can write a class whose private data is checked once in the constructor, initialise members in declaration order with explicit one-argument constructors and const observers, and overload only the operators whose meaning is obvious.",
      "introduced": 2,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck U2 · slides 39–44, 53"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab session 2 · Lab B — Order: an invariant, const, private data",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session02.md"
        },
        {
          "type": "hw",
          "label": "HW 2 — Pointers, classes, the Rule of Five & RAII",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898724"
        },
        {
          "type": "exam",
          "label": "Midterm · group: OOP, Virtual Dispatch & Object Model"
        },
        {
          "type": "exam",
          "label": "Final · group: Core C++: Memory, RAII & Object Model"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.rule-of-five",
      "category": "cpp",
      "name": "Copy & move semantics: the Rule of Three, Five and Zero",
      "can": "You can say when the compiler's member-by-member copy is right and when it is a double free, write a deep-copying, self-assignment-safe copy and a noexcept move that steals and blanks the source, explain why vector copies every element on growth when the move can throw, and pick between the Rule of Zero, the Rule of Five and = delete.",
      "introduced": 2,
      "practised": [
        3
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck U2 · slides 46–51"
        },
        {
          "type": "deck",
          "session": 3,
          "label": "Deck U3 · slide 25"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab session 2 · Lab B — PxBuf: the Rule of Three and the double free under ASan; Rule of Five: noexcept and vector growth",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session02.md"
        },
        {
          "type": "hw",
          "label": "HW 2 — Pointers, classes, the Rule of Five & RAII",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898724"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Allocation, RAII & Smart Pointers"
        },
        {
          "type": "exam",
          "label": "Final · group: Core C++: Memory, RAII & Object Model"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.raii",
      "category": "cpp",
      "name": "RAII — scope-bound resource management",
      "can": "You can wrap a resource in a type that acquires in its constructor and releases in its destructor, delete its copies so it has one owner, and rely on reverse-order destruction for cleanup on every exit path including a throw.",
      "introduced": 2,
      "practised": [
        3
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck U2 · slides 43, 55–56"
        },
        {
          "type": "deck",
          "session": 3,
          "label": "Deck U3 · slide 23"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab session 2 · Lab B — ScopedTimer: RAII on every exit path",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session02.md"
        },
        {
          "type": "hw",
          "label": "HW 2 — Pointers, classes, the Rule of Five & RAII",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898724"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Allocation, RAII & Smart Pointers"
        },
        {
          "type": "exam",
          "label": "Final · group: Core C++: Memory, RAII & Object Model"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.inheritance",
      "category": "cpp",
      "name": "Inheritance without virtual: access, construction order, slicing & hiding",
      "can": "You can state the construction and destruction order of a derived object with members, choose public inheritance only for a true is-a and composition otherwise, spot slicing when a derived object is copied into a base by value, and explain how a derived name hides every base overload.",
      "introduced": 2,
      "practised": [
        3
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck U2 · slides 59–65"
        },
        {
          "type": "deck",
          "session": 3,
          "label": "Deck U3 · slides 5, 7"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab session 2 · Lab B — construction order; slicing, name hiding, static binding",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session02.md"
        },
        {
          "type": "hw",
          "label": "HW 2 — Pointers, classes, the Rule of Five & RAII",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898724"
        },
        {
          "type": "exam",
          "label": "Midterm · group: OOP, Virtual Dispatch & Object Model"
        },
        {
          "type": "exam",
          "label": "Final · group: Core C++: Memory, RAII & Object Model"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.virtual-dispatch",
      "category": "cpp",
      "name": "Virtual functions, override/final & abstract interfaces",
      "can": "You can make a call through a Base& run the derived body with virtual and override, give every polymorphic base a virtual destructor, write an abstract interface of pure virtuals, and name the three things dynamic dispatch does not change: default arguments, overload sets and name lookup.",
      "introduced": 3,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck U3 · slides 5–8, 11"
        },
        {
          "type": "lab",
          "session": 3,
          "label": "Lab session 3 · steps 1–3 — an IStrategy interface and a broken override, delete through a base, the vptr in a constructor",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session03.md"
        },
        {
          "type": "hw",
          "label": "HW 3 — Polymorphism & smart ownership",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898725"
        },
        {
          "type": "exam",
          "label": "Midterm · group: OOP, Virtual Dispatch & Object Model"
        },
        {
          "type": "exam",
          "label": "Final · group: Core C++: Memory, RAII & Object Model"
        }
      ],
      "interview": true
    },
    {
      "id": "perf.virtual-cost",
      "category": "perf",
      "name": "The vptr, the vtable & what a virtual call costs",
      "can": "You can explain a virtual call as two dependent loads and an indirect branch, quote its measured cost when predicted and when mispredicted, and say why the inlining it blocks is the bigger bill.",
      "introduced": 3,
      "practised": [
        4
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck U3 · slides 10, 12–14"
        },
        {
          "type": "deck",
          "session": 4,
          "label": "Deck U4 · slide 17"
        },
        {
          "type": "lab",
          "session": 3,
          "label": "Lab session 3 · step 4 — make dispatch, your table next to slide 13",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session03.md"
        },
        {
          "type": "hw",
          "label": "HW 3 — Polymorphism & smart ownership",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898725"
        },
        {
          "type": "exam",
          "label": "Midterm · group: OOP, Virtual Dispatch & Object Model"
        },
        {
          "type": "exam",
          "label": "Final · group: Branch Prediction, SIMD & Compiler Optimisation"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.variant-visit",
      "category": "cpp",
      "name": "A closed set: std::variant + std::visit",
      "can": "You can model a closed set of message types as a std::variant stored by value, dispatch it with an exhaustive std::visit visitor, and say when that beats a virtual hierarchy and when it does not.",
      "introduced": 3,
      "practised": [
        4
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck U3 · slides 14–15"
        },
        {
          "type": "deck",
          "session": 4,
          "label": "Deck U4 · slide 10"
        },
        {
          "type": "hw",
          "label": "HW 3 — Polymorphism & smart ownership",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898725"
        },
        {
          "type": "project",
          "label": "Project — Phase 1: The Fast Hot Path",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898734"
        },
        {
          "type": "exam",
          "label": "Final · group: Templates, STL & Complexity"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.smart-pointers",
      "category": "cpp",
      "name": "unique_ptr, shared_ptr, weak_ptr",
      "can": "You can own an object with unique_ptr by default, justify shared_ptr only for genuinely shared lifetime, explain why its tax is the atomic copy and not the dereference, and break an ownership cycle with weak_ptr.",
      "introduced": 3,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck U3 · slides 18–22"
        },
        {
          "type": "lab",
          "session": 3,
          "label": "Lab session 3 · steps 5–6 — sizes and allocation counts, the shared_ptr tax, contention and a weak_ptr cycle",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session03.md"
        },
        {
          "type": "hw",
          "label": "HW 3 — Polymorphism & smart ownership",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898725"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Allocation, RAII & Smart Pointers"
        },
        {
          "type": "exam",
          "label": "Final · group: Core C++: Memory, RAII & Object Model"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.ownership-contracts",
      "category": "cpp",
      "name": "Custom deleters & ownership as an API contract",
      "can": "You can wrap any resource with a close in a unique_ptr with a stateless custom deleter, state ownership in a signature (sink by value, borrow by reference, source by return), and build polymorphic parts once at startup so on_book only ever borrows.",
      "introduced": 3,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck U3 · slides 19, 23, 25–28"
        },
        {
          "type": "lab",
          "session": 3,
          "label": "Lab session 3 · steps 7–8 — count your on_book allocations with tick_alloc, then own an ISignal chosen at startup",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session03.md"
        },
        {
          "type": "hw",
          "label": "HW 3 — Polymorphism & smart ownership",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898725"
        },
        {
          "type": "project",
          "label": "Project — Phase 1: The Fast Hot Path",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898734"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Allocation, RAII & Smart Pointers"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.templates",
      "category": "cpp",
      "name": "Function & class templates",
      "can": "You can write a function or class template with a type and a non-type parameter, let the compiler deduce its arguments, specialise the one type that deserves hand-tuning, and say why templates live in headers and what every extra instantiation costs in code size.",
      "introduced": 4,
      "practised": [
        5
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 4,
          "label": "Deck U4 · slides 5–7"
        },
        {
          "type": "deck",
          "session": 5,
          "label": "Deck U5 · slide 10"
        },
        {
          "type": "lab",
          "session": 4,
          "label": "Lab session 4 · steps 1–2 — Ring<T, N>, two deliberate compile errors, Wire<T> specializations",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session04.md"
        },
        {
          "type": "hw",
          "label": "HW 4 — Templates & CRTP",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898726"
        },
        {
          "type": "exam",
          "label": "Final · group: Templates, STL & Complexity"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Templates, CRTP & Compile-Time"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.variadic-templates",
      "category": "cpp",
      "name": "Parameter packs, folds & perfect forwarding",
      "can": "You can write a variadic template that folds over its pack in one line, forward every argument unchanged with std::forward, and build the overload{} visitor from a pack of lambdas.",
      "introduced": 4,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 4,
          "label": "Deck U4 · slides 9–10"
        },
        {
          "type": "lab",
          "session": 4,
          "label": "Lab session 4 · step 3 — folds, if constexpr and the overload{} visitor",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session04.md"
        },
        {
          "type": "hw",
          "label": "HW 4 — Templates & CRTP",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898726"
        },
        {
          "type": "exam",
          "label": "Final · group: Templates, STL & Complexity"
        }
      ],
      "interview": false
    },
    {
      "id": "cpp.type-traits-constraints",
      "category": "cpp",
      "name": "Type traits, concepts & if constexpr",
      "can": "You can ask the compiler questions about a type with <type_traits>, constrain a template with a C++20 concept instead of SFINAE so the error names the failed requirement, and give one template a separate code path per type with if constexpr.",
      "introduced": 4,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 4,
          "label": "Deck U4 · slides 11–13"
        },
        {
          "type": "lab",
          "session": 4,
          "label": "Lab session 4 · steps 3–4 — if constexpr, then SFINAE next to a concept",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session04.md"
        },
        {
          "type": "hw",
          "label": "HW 4 — Templates & CRTP",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898726"
        },
        {
          "type": "exam",
          "label": "Final · group: Templates, STL & Complexity"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Templates, CRTP & Compile-Time"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.constexpr",
      "category": "cpp",
      "name": "constexpr, consteval & static_assert",
      "can": "You can move a table or a constant into the compiler with constexpr, force compile-time evaluation with consteval, and park every size, fee and layout assumption in a static_assert so a violation fails the build instead of the market.",
      "introduced": 4,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 4,
          "label": "Deck U4 · slide 15"
        },
        {
          "type": "lab",
          "session": 4,
          "label": "Lab session 4 · step 5 — consteval fees and a compile-time tick table",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session04.md"
        },
        {
          "type": "hw",
          "label": "HW 4 — Templates & CRTP",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898726"
        },
        {
          "type": "exam",
          "label": "Final · group: Templates, STL & Complexity"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Templates, CRTP & Compile-Time"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.crtp-policies",
      "category": "cpp",
      "name": "CRTP & policy-based design",
      "can": "You can replace a virtual hook with a CRTP base that calls down through static_cast, show with dispatch_bench and the -O2 assembly that the indirect branch is gone, and assemble a class from policy template parameters.",
      "introduced": 4,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 4,
          "label": "Deck U4 · slides 16–18"
        },
        {
          "type": "lab",
          "session": 4,
          "label": "Lab session 4 · steps 6–7 — the CRTP row in dispatch_bench, then a policy-based Quoter",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session04.md"
        },
        {
          "type": "hw",
          "label": "HW 4 — Templates & CRTP",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898726"
        },
        {
          "type": "exam",
          "label": "Final · group: Templates, STL & Complexity"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Templates, CRTP & Compile-Time"
        }
      ],
      "interview": true
    },
    {
      "id": "perf.object-pool",
      "category": "perf",
      "name": "Fixed-size object pools",
      "can": "You can implement a fixed-size object pool whose free slots hold the free-list, so allocate and free are O(1) pointer swaps that never call the system allocator, and defend its number as stable rather than merely small.",
      "introduced": 5,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck U5 · slides 6–7, 9–11, 14"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab session 5 · Part A — steps A2–A6, all four pool tests green",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session05.md"
        },
        {
          "type": "hw",
          "label": "HW 5 — A memory pool & a fast order book",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898727"
        },
        {
          "type": "project",
          "label": "Project — Phase 2: The Local Order Book",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898735"
        },
        {
          "type": "exam",
          "label": "Final · group: Low-Latency System Design: Allocators, Order Books & Timing"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.placement-new",
      "category": "cpp",
      "name": "Placement new & explicit destruction",
      "can": "You can construct an object into aligned storage you already own with placement new, end its life with an explicit destructor call, and hand the slot back to the pool — never to delete.",
      "introduced": 5,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck U5 · slides 8, 10"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab session 5 · step A5 — placement new + explicit destructor through your pool",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session05.md"
        },
        {
          "type": "hw",
          "label": "HW 5 — A memory pool & a fast order book",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898727"
        },
        {
          "type": "exam",
          "label": "Final · group: Core C++: Memory, RAII & Object Model"
        }
      ],
      "interview": true
    },
    {
      "id": "perf.arena-allocator",
      "category": "perf",
      "name": "Arena (bump) allocation & std::pmr",
      "can": "You can allocate a tick's scratch from a bump pointer over a pre-owned slab, align each request, reclaim everything with one O(1) reset, and get the same from std::pmr::monotonic_buffer_resource with a null upstream.",
      "introduced": 5,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck U5 · slides 12–13, 35"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab session 5 · step D1 — a bump allocator with reset(), timed against the pool",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session05.md"
        },
        {
          "type": "exam",
          "label": "Final · group: Low-Latency System Design: Allocators, Order Books & Timing"
        }
      ],
      "interview": false
    },
    {
      "id": "cpp.stl-containers",
      "category": "cpp",
      "name": "Choosing a container for an access pattern",
      "can": "You can match ordered traversal, best-element access and point lookup to a tree, a heap and a hash table, and say what each costs in allocations and cache misses rather than only in big-O.",
      "introduced": 5,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck U5 · slides 16, 18"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab session 5 · step B1 — why not std::map<double, Level>?",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session05.md"
        },
        {
          "type": "exam",
          "label": "Final · group: Templates, STL & Complexity"
        }
      ],
      "interview": false
    },
    {
      "id": "perf.open-addressing-hash",
      "category": "perf",
      "name": "Open-addressing hash maps",
      "can": "You can implement a linear-probing hash map in one flat power-of-two array, keep its load factor under about 0.7, and explain why it beats std::unordered_map's chained heap nodes on a hot path.",
      "introduced": 5,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck U5 · slides 17, 24"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab session 5 · step B7 — SymMap: open addressing, no per-lookup allocation",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session05.md"
        },
        {
          "type": "hw",
          "label": "HW 5 — A memory pool & a fast order book",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898727"
        },
        {
          "type": "project",
          "label": "Project — Phase 2: The Local Order Book",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898735"
        },
        {
          "type": "exam",
          "label": "Final · group: Low-Latency System Design: Allocators, Order Books & Timing"
        }
      ],
      "interview": true
    },
    {
      "id": "trading.flat-order-book",
      "category": "trading",
      "name": "A flat, price-indexed local order book",
      "can": "You can hold a book as a price-indexed band of tick slots against a base tick with a cached touch, bounds-check both ends, and explain why an absolute index silently corrupts the other side for a $720 name.",
      "introduced": 5,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck U5 · slides 18–21, 24"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab session 5 · steps B2–B6, then the NFLX band test in step D2",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session05.md"
        },
        {
          "type": "hw",
          "label": "HW 5 — A memory pool & a fast order book",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898727"
        },
        {
          "type": "project",
          "label": "Project — Phase 2: The Local Order Book",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898735"
        },
        {
          "type": "exam",
          "label": "Final · group: Low-Latency System Design: Allocators, Order Books & Timing"
        }
      ],
      "interview": true
    },
    {
      "id": "trading.queue-position",
      "category": "trading",
      "name": "FIFO per level & your queue position",
      "can": "You can keep each price level as an O(1) intrusive FIFO of pooled orders, track your queue_ahead from on_ack / on_queue, and explain why a reprice sends you to the back.",
      "introduced": 5,
      "practised": [
        8
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck U5 · slides 22–23"
        },
        {
          "type": "deck",
          "session": 8,
          "label": "Deck U8 · slide 17"
        },
        {
          "type": "project",
          "label": "Project — Phase 2: The Local Order Book",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898735"
        },
        {
          "type": "exam",
          "label": "Final · group: Low-Latency System Design: Allocators, Order Books & Timing"
        }
      ],
      "interview": true
    },
    {
      "id": "perf.complexity-in-cache-terms",
      "category": "perf",
      "name": "Complexity counted in cache misses",
      "can": "You can explain why an O(n) scan of a small contiguous array beats an O(log n) tree, treat amortized O(1) as a worst-case tail event that reserve() removes, and measure the crossover on your own machine.",
      "introduced": 5,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck U5 · slides 26, 38"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab session 5 · Part C — make bench-alloc and make bench-book on your machine",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session05.md"
        },
        {
          "type": "exam",
          "label": "Final · group: Templates, STL & Complexity"
        }
      ],
      "interview": true
    },
    {
      "id": "perf.incremental-computation",
      "category": "perf",
      "name": "Ring buffers & O(1) online statistics",
      "can": "You can keep the recent tape in a power-of-two ring buffer and fold each tick into a running mean, Welford variance and EMA in O(1), so the signal costs the same on every tick.",
      "introduced": 5,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck U5 · slides 27–28, 36"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab session 5 · step D3 — the ring buffer and Welford, checked by hand",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session05.md"
        },
        {
          "type": "project",
          "label": "Project — Phase 2: The Local Order Book",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898735"
        },
        {
          "type": "exam",
          "label": "Final · group: Low-Latency System Design: Allocators, Order Books & Timing"
        }
      ],
      "interview": false
    },
    {
      "id": "cpp.data-races",
      "category": "cpp",
      "name": "std::thread, data races & happens-before",
      "can": "You can start and join threads, identify a data race as undefined behaviour rather than merely a wrong value, and name the happens-before edge — a mutex, an atomic, or thread start and join — that would make the access legal.",
      "introduced": 6,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 6,
          "label": "Deck U6 · slides 5–7"
        },
        {
          "type": "lab",
          "session": 6,
          "label": "Lab session 6 · Part A, steps A1–A4 — the race at -O0 and -O2, TSan, the volatile non-fix, the atomic fix",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session06.md"
        },
        {
          "type": "exam",
          "label": "Final · group: Threads, Mutexes & Condition Variables"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.atomics-memory-order",
      "category": "cpp",
      "name": "std::atomic & memory ordering",
      "can": "You can choose relaxed, acquire/release or seq_cst for each atomic operation, justify it with the happens-before edge you actually need, and explain why the store-buffer litmus test needs seq_cst.",
      "introduced": 6,
      "practised": [
        9
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 6,
          "label": "Deck U6 · slides 9–12"
        },
        {
          "type": "lab",
          "session": 6,
          "label": "Lab session 6 · Part B, steps B1–B3 — the release/acquire handoff, -DBROKEN under TSan, the litmus test",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session06.md"
        },
        {
          "type": "lab",
          "session": 9,
          "label": "Lab session 9 · Step 5 — the kill switch, with its automatic trips",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session09.md"
        },
        {
          "type": "hw",
          "label": "HW 6 — An SPSC lock-free ring buffer",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898728"
        },
        {
          "type": "exam",
          "label": "Final · group: Atomics, Memory Ordering & Lock-Free Queues"
        }
      ],
      "interview": true
    },
    {
      "id": "perf.lock-tail-cost",
      "category": "perf",
      "name": "Why a lock on the hot path is a tail bomb",
      "can": "You can take a mutex correctly through a lock_guard, then show from a measured p50/p99.9 table how a contended one wins the median and loses the tail to a futex wait, a context switch or a priority inversion.",
      "introduced": 6,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 6,
          "label": "Deck U6 · slides 14–15"
        },
        {
          "type": "lab",
          "session": 6,
          "label": "Lab session 6 · step A5 — mutex vs atomic vs private in lock_tail.cpp",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session06.md"
        },
        {
          "type": "exam",
          "label": "Final · group: Threads, Mutexes & Condition Variables"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.compare-and-swap",
      "category": "cpp",
      "name": "Compare-and-swap, ABA & progress guarantees",
      "can": "You can write a compare_exchange retry loop that recomputes the desired value on every attempt, explain the ABA problem as a memory-reclamation problem, and place a structure on the wait-free / lock-free / obstruction-free ladder.",
      "introduced": 6,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 6,
          "label": "Deck U6 · slides 16–17, 35"
        },
        {
          "type": "exam",
          "label": "Final · group: Atomics, Memory Ordering & Lock-Free Queues"
        }
      ],
      "interview": true
    },
    {
      "id": "perf.spsc-ring",
      "category": "perf",
      "name": "A lock-free SPSC ring buffer",
      "can": "You can build a bounded single-producer/single-consumer ring with monotonic head and tail counters, a power-of-two mask, a release store that publishes each slot and the two indices on separate cache lines — and say which two lines make it correct.",
      "introduced": 6,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 6,
          "label": "Deck U6 · slides 19–20, 22"
        },
        {
          "type": "lab",
          "session": 6,
          "label": "Lab session 6 · Part C, steps C1–C6 — push(), then pop()/empty()/full() yourself, make spsc-conc and spsc-tsan",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session06.md"
        },
        {
          "type": "hw",
          "label": "HW 6 — An SPSC lock-free ring buffer",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898728"
        },
        {
          "type": "project",
          "label": "Project — Phase 3: Threading to Accelerate",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898736"
        },
        {
          "type": "exam",
          "label": "Final · group: Atomics, Memory Ordering & Lock-Free Queues"
        }
      ],
      "interview": true
    },
    {
      "id": "perf.back-pressure",
      "category": "perf",
      "name": "Bounded queues & back-pressure",
      "can": "You can make a full queue a decision — drop, coalesce or shed, and count it — instead of a stall on the socket thread, and explain how head-of-line blocking turns one fat message into a tail.",
      "introduced": 6,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 6,
          "label": "Deck U6 · slides 21, 28"
        },
        {
          "type": "lab",
          "session": 6,
          "label": "Lab session 6 · step E2 — wire the ring into your bot, drop and count",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session06.md"
        },
        {
          "type": "project",
          "label": "Project — Phase 3: Threading to Accelerate",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898736"
        },
        {
          "type": "exam",
          "label": "Final · group: Atomics, Memory Ordering & Lock-Free Queues"
        }
      ],
      "interview": false
    },
    {
      "id": "perf.shared-memory-ring",
      "category": "perf",
      "name": "A shared-memory ring across processes",
      "can": "You can put a lock-free POD ring in a shm_open/mmap region so two processes hand messages over without a syscall, and say why it may hold no pointers, no owning containers and only always-lock-free atomics.",
      "introduced": 6,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 6,
          "label": "Deck U6 · slides 24–25"
        },
        {
          "type": "lab",
          "session": 6,
          "label": "Lab session 6 · Part D, steps D1–D3 — ShmRing, the fork() test, shm_pipeline.cpp",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session06.md"
        },
        {
          "type": "project",
          "label": "Project — Phase 4: Multi-Process System with Shared-Memory Lock-Free IPC",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898737"
        },
        {
          "type": "exam",
          "label": "Final · group: Atomics, Memory Ordering & Lock-Free Queues"
        }
      ],
      "interview": false
    },
    {
      "id": "cpp.cpp20-coordination",
      "category": "cpp",
      "name": "C++20 coordination primitives",
      "can": "You can line threads up with a std::latch, park an idle thread on atomic::wait/notify instead of a condition variable, and shut a std::jthread down cooperatively with its stop_token.",
      "introduced": 6,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 6,
          "label": "Deck U6 · slide 26"
        },
        {
          "type": "exam",
          "label": "Final · group: Threads, Mutexes & Condition Variables"
        }
      ],
      "interview": false
    },
    {
      "id": "trading.fix-protocol",
      "category": "trading",
      "name": "Parsing FIX tag=value messages",
      "can": "You can pull the fields you need out of a SOH-delimited FIX message in one forward scan without allocating, keep the ClOrdID as a view, and reject the message on a bad mod-256 checksum.",
      "introduced": 7,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck U7 · slides 5, 29"
        },
        {
          "type": "lab",
          "session": 7,
          "label": "Lab session 7 · step 1 — the single-pass FIX parser (make fix)",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session07.md"
        },
        {
          "type": "hw",
          "label": "HW 7 — Fast FIX parser + uint64→text",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898729"
        },
        {
          "type": "exam",
          "label": "Final · group: Networking: Sockets, Kernel Bypass & Protocol Parsing"
        }
      ],
      "interview": true
    },
    {
      "id": "trading.binary-market-data",
      "category": "trading",
      "name": "Fixed-width binary market data",
      "can": "You can decode an ITCH/OUCH-style fixed-width message by memcpy-ing fields from known offsets, byte-swapping from network order and keeping prices as scaled integers, with a bounds check first and no digit parsing.",
      "introduced": 7,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck U7 · slides 6, 27"
        },
        {
          "type": "exam",
          "label": "Final · group: Networking: Sockets, Kernel Bypass & Protocol Parsing"
        }
      ],
      "interview": false
    },
    {
      "id": "trading.feed-sequencing",
      "category": "trading",
      "name": "TCP vs UDP multicast, sequence numbers & gap fill",
      "can": "You can say why order entry runs over TCP and market data over UDP multicast, track the next expected sequence number to drop A/B duplicates and detect a gap, and keep a symbol untradeable until snapshot-plus-increment recovery completes.",
      "introduced": 7,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck U7 · slides 7–8"
        },
        {
          "type": "exam",
          "label": "Final · group: Networking: Sockets, Kernel Bypass & Protocol Parsing"
        }
      ],
      "interview": false
    },
    {
      "id": "tools.message-framing",
      "category": "tools",
      "name": "Framing a byte stream into messages",
      "can": "You can recover message boundaries from a TCP byte stream with a length prefix or FIX BodyLength, dispatch complete frames as views, keep the partial remainder, and validate a length against a maximum before you trust it.",
      "introduced": 7,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck U7 · slide 9"
        },
        {
          "type": "lab",
          "session": 7,
          "label": "Lab session 7 · step 3 — frame a FIX stream by BodyLength and verify the checksum",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session07.md"
        },
        {
          "type": "hw",
          "label": "HW 7 — Fast FIX parser + uint64→text",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898729"
        },
        {
          "type": "exam",
          "label": "Final · group: Networking: Sockets, Kernel Bypass & Protocol Parsing"
        }
      ],
      "interview": false
    },
    {
      "id": "perf.nonblocking-io",
      "category": "perf",
      "name": "Non-blocking I/O, readiness loops & batching vs latency",
      "can": "You can drain a non-blocking socket until EAGAIN inside a poll/epoll/kqueue readiness loop, say what edge-triggered mode obliges you to do, and explain why batching and Nagle buy throughput at the cost of the tail — hence TCP_NODELAY on the order path.",
      "introduced": 7,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck U7 · slides 11–12, 15, 28"
        },
        {
          "type": "lab",
          "session": 7,
          "label": "Lab session 7 · step 3 — the O_NONBLOCK + poll() reader in frame_demo.cpp",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session07.md"
        },
        {
          "type": "exam",
          "label": "Final · group: Networking: Sockets, Kernel Bypass & Protocol Parsing"
        }
      ],
      "interview": false
    },
    {
      "id": "perf.zero-copy-parse",
      "category": "perf",
      "name": "Zero-copy parse & hand-rolled serialization",
      "can": "You can extract only the three fields you need from a frame with a string_view instead of building a DOM, write digits into a reused buffer with no snprintf or std::string on the send path, and show the win on a replay tape.",
      "introduced": 7,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck U7 · slides 13–14, 16"
        },
        {
          "type": "lab",
          "session": 7,
          "label": "Lab session 7 · step 2 and take-home step 3 — u64toa, then the targeted extract in your bot",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session07.md"
        },
        {
          "type": "hw",
          "label": "HW 7 — Fast FIX parser + uint64→text",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898729"
        },
        {
          "type": "project",
          "label": "Project — Phase 5: Wire & Hardware Tuning",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898738"
        },
        {
          "type": "exam",
          "label": "Final · group: Networking: Sockets, Kernel Bypass & Protocol Parsing"
        }
      ],
      "interview": true
    },
    {
      "id": "perf.simd",
      "category": "perf",
      "name": "The memory wall, SIMD & prefetch",
      "can": "You can explain why a hot loop is memory-bound, let the compiler vectorize a reduction with -O3 -march=native and read its vectorization report to see why it refused, and issue a prefetch hint whose distance you tune by measurement.",
      "introduced": 7,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck U7 · slides 18–19"
        },
        {
          "type": "lab",
          "session": 7,
          "label": "Lab session 7 · step 4 and take-home step 2 — -O0 vs -O3, why 'not vectorized', AVX2 by hand",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session07.md"
        },
        {
          "type": "project",
          "label": "Project — Phase 5: Wire & Hardware Tuning",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898738"
        },
        {
          "type": "exam",
          "label": "Final · group: Branch Prediction, SIMD & Compiler Optimisation"
        }
      ],
      "interview": true
    },
    {
      "id": "perf.kernel-bypass",
      "category": "perf",
      "name": "Syscalls, busy-poll & kernel bypass",
      "can": "You can explain what a trip into the kernel costs on a hot path, when busy-polling a dedicated core beats being woken, and what DPDK, Onload/ef_vi, AF_XDP and io_uring each remove from the per-packet path.",
      "introduced": 7,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck U7 · slides 20, 28"
        },
        {
          "type": "project",
          "label": "Project — Phase 5: Wire & Hardware Tuning",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898738"
        },
        {
          "type": "exam",
          "label": "Final · group: Networking: Sockets, Kernel Bypass & Protocol Parsing"
        }
      ],
      "interview": true
    },
    {
      "id": "perf.cpu-pinning-numa",
      "category": "perf",
      "name": "Pinning, isolation, NUMA & huge pages",
      "can": "You can pin a hot thread to an isolated core, explain that pinning buys variance rather than speed, keep memory on the NIC's NUMA node, and pre-fault and lock hot memory at startup so no page fault lands mid-race.",
      "introduced": 7,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck U7 · slides 21, 30"
        },
        {
          "type": "lab",
          "session": 7,
          "label": "Lab session 7 · take-home step 4 — pin the hot thread and compare the p99.9 spread",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session07.md"
        },
        {
          "type": "project",
          "label": "Project — Phase 5: Wire & Hardware Tuning",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898738"
        },
        {
          "type": "exam",
          "label": "Final · group: Low-Latency System Design: Allocators, Order Books & Timing"
        }
      ],
      "interview": false
    },
    {
      "id": "perf.hardware-timestamping",
      "category": "perf",
      "name": "PTP, hardware timestamps, NICs & FPGAs",
      "can": "You can explain why NTP is too coarse for microsecond work, what a NIC hardware timestamp measures that a user-space clock read cannot, and where an FPGA takes over from your C++.",
      "introduced": 7,
      "practised": [],
      "depth": 1,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck U7 · slide 22"
        },
        {
          "type": "exam",
          "label": "Final · group: Measurement, Tail Latency & Production Practice"
        }
      ],
      "interview": false
    },
    {
      "id": "tools.perf-profiler",
      "category": "tools",
      "name": "perf, flame graphs & hardware counters",
      "can": "You can go from perf stat to perf record -g to perf report, fold the sampled stacks into a flame graph and read it by width, then use IPC, cache/TLB-miss and branch-miss counters to say why the widest frame is hot.",
      "introduced": 8,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck U8 · slides 6–7"
        },
        {
          "type": "lab",
          "session": 8,
          "label": "Lab session 8 · A2 — profile before you fix (perf, or Instruments on macOS)",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session08.md"
        },
        {
          "type": "project",
          "label": "Project — Phase 6: Profile & Kill the Tail",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898739"
        },
        {
          "type": "exam",
          "label": "Final · group: Measurement, Tail Latency & Production Practice"
        }
      ],
      "interview": true
    },
    {
      "id": "perf.tail-diagnosis",
      "category": "perf",
      "name": "Where the tail comes from: allocation, faults & jitter",
      "can": "You can read a latency distribution as a fast body plus rare stalls, attribute a spike to allocation, a page fault, a cache/TLB/NUMA miss, hidden O(n) work or scheduler jitter, fix it without changing the answer, and prove p99.9 moved on the same tape.",
      "introduced": 8,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck U8 · slides 5, 8–9, 12"
        },
        {
          "type": "lab",
          "session": 8,
          "label": "Lab session 8 · A0–A3 — run tail.cpp, hypothesise, fix it in tail_fixed.cpp with the same sink",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session08.md"
        },
        {
          "type": "project",
          "label": "Project — Phase 6: Profile & Kill the Tail",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898739"
        },
        {
          "type": "exam",
          "label": "Final · group: Measurement, Tail Latency & Production Practice"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.compiler-flags",
      "category": "tools",
      "name": "Release flags, PGO, LTO & sanitizer builds",
      "can": "You can justify -O3, -march=native, -flto and -DNDEBUG on a graded binary, keep -g for the profiler, run a two-pass profile-guided build, and keep ASan/UBSan and TSan as separate, never-shipped correctness builds.",
      "introduced": 8,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck U8 · slides 10–11"
        },
        {
          "type": "lab",
          "session": 8,
          "label": "Lab session 8 · A4–A5 — sanitizers on the fixed copy, then PGO and LTO on kernel.cpp",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session08.md"
        },
        {
          "type": "project",
          "label": "Project — Phase 6: Profile & Kill the Tail",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898739"
        },
        {
          "type": "exam",
          "label": "Final · group: Branch Prediction, SIMD & Compiler Optimisation"
        }
      ],
      "interview": false
    },
    {
      "id": "trading.nbbo-latency-arb",
      "category": "trading",
      "name": "The NBBO & picking off a stale quote",
      "can": "You can consolidate two venues into an NBBO, recognise the locked and crossed states, and decide whether picking off the stale quote survives two taker fees before you send anything.",
      "introduced": 8,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck U8 · slides 14–15, 20"
        },
        {
          "type": "lab",
          "session": 8,
          "label": "Lab session 8 · B — the HW 8 stale-quote detector and its ten-row test table",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session08.md"
        },
        {
          "type": "hw",
          "label": "HW 8 — Cross-venue stale-quote detector",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898730"
        },
        {
          "type": "project",
          "label": "Project — Phase 7: The Tournament",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898740"
        },
        {
          "type": "exam",
          "label": "Final · group: Low-Latency System Design: Allocators, Order Books & Timing"
        }
      ],
      "interview": true
    },
    {
      "id": "trading.smart-order-routing",
      "category": "trading",
      "name": "The race & smart order routing",
      "can": "You can explain why only the first order to reach a stale venue is paid, size an arbitrage to the thin side, route across venues net of fees and latency, and manage the leg risk of a one-sided fill.",
      "introduced": 8,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck U8 · slides 16, 24"
        },
        {
          "type": "lab",
          "session": 8,
          "label": "Lab session 8 · C — tournament pre-flight: fee-aware thresholds, two processes per venue",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session08.md"
        },
        {
          "type": "hw",
          "label": "HW 8 — Cross-venue stale-quote detector",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898730"
        },
        {
          "type": "project",
          "label": "Project — Phase 7: The Tournament",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898740"
        },
        {
          "type": "exam",
          "label": "Final · group: Low-Latency System Design: Allocators, Order Books & Timing"
        }
      ],
      "interview": false
    },
    {
      "id": "trading.market-making",
      "category": "trading",
      "name": "Market making at speed: queue, skew, hold",
      "can": "You can quote around a microprice fair value, lean both quotes against your inventory, and decide between HOLD, REQUOTE and CANCEL from queue_ahead and level_qty under a tight message quota.",
      "introduced": 8,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck U8 · slides 17, 22"
        },
        {
          "type": "lab",
          "session": 8,
          "label": "Lab session 8 · C — stay under the 6-message order quota",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session08.md"
        },
        {
          "type": "project",
          "label": "Project — Phase 7: The Tournament",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898740"
        },
        {
          "type": "exam",
          "label": "Final · group: Low-Latency System Design: Allocators, Order Books & Timing"
        }
      ],
      "interview": true
    },
    {
      "id": "trading.adverse-selection",
      "category": "trading",
      "name": "Adverse selection & markouts",
      "can": "You can mark a fill out against the mid a moment later, signed by side, read a persistently negative markout as toxic flow, and explain how the 1-second markout enters the tournament's MM SCORE.",
      "introduced": 8,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck U8 · slides 18, 23"
        },
        {
          "type": "lab",
          "session": 8,
          "label": "Lab session 8 · B — README question 2: what makes the signal false",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session08.md"
        },
        {
          "type": "hw",
          "label": "HW 8 — Cross-venue stale-quote detector",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898730"
        },
        {
          "type": "project",
          "label": "Project — Phase 7: The Tournament",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898740"
        },
        {
          "type": "exam",
          "label": "Final · group: Low-Latency System Design: Allocators, Order Books & Timing"
        }
      ],
      "interview": true
    },
    {
      "id": "trading.hft-ethics",
      "category": "trading",
      "name": "Market fairness & the ethics of speed",
      "can": "You can argue both sides of paid speed — tighter spreads and deeper books against a pay-to-win arms race — and name the market-design tools (circuit breakers, LULD bands, speed bumps, batch auctions) that shape it.",
      "introduced": 8,
      "practised": [],
      "depth": 1,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck U8 · slide 19"
        }
      ],
      "interview": false
    },
    {
      "id": "trading.order-size-notional-collar",
      "category": "trading",
      "name": "Pre-trade checks: max size, notional & the price collar",
      "can": "You can reject an order before it leaves the process when its quantity breaks a max-order size, its price times quantity breaks a notional cap, or its price sits outside a collar around a reference price, and say why the collar is what catches a fat-finger limit order.",
      "introduced": 9,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 9,
          "label": "Deck U9 · slides 10, 19"
        },
        {
          "type": "lab",
          "session": 9,
          "label": "Lab session 9 · Step 1 — size, notional, sanity, collar",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session09.md"
        },
        {
          "type": "hw",
          "label": "HW 9 — A pre-trade risk gate",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898731"
        },
        {
          "type": "project",
          "label": "Project — Phase 7: The Tournament",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898740"
        },
        {
          "type": "exam",
          "label": "Final · group: Low-Latency System Design: Allocators, Order Books & Timing"
        }
      ],
      "interview": true
    },
    {
      "id": "trading.position-exposure-limits",
      "category": "trading",
      "name": "Position & exposure limits: net, gross & resting orders",
      "can": "You can track a signed net position and the gross exposure per symbol, count what is still resting as potential position, and reject the order whose worst-case fill would breach the limit rather than the one that already has.",
      "introduced": 9,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 9,
          "label": "Deck U9 · slide 11"
        },
        {
          "type": "lab",
          "session": 9,
          "label": "Lab session 9 · Step 2 — position with open orders (on_fill / on_done)",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session09.md"
        },
        {
          "type": "hw",
          "label": "HW 9 — A pre-trade risk gate",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898731"
        },
        {
          "type": "project",
          "label": "Project — Phase 7: The Tournament",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898740"
        },
        {
          "type": "exam",
          "label": "Final · group: Low-Latency System Design: Allocators, Order Books & Timing"
        }
      ],
      "interview": true
    },
    {
      "id": "perf.token-bucket-throttle",
      "category": "perf",
      "name": "Rate limits: the token bucket",
      "can": "You can write a token bucket that refills from a monotonic clock, allows a burst up to its capacity and a sustained rate beyond which orders are rejected, and keep the check to a few arithmetic operations with no clock read of its own, so it costs a few nanoseconds.",
      "introduced": 9,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 9,
          "label": "Deck U9 · slide 12"
        },
        {
          "type": "lab",
          "session": 9,
          "label": "Lab session 9 · Step 4 — the token bucket",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session09.md"
        },
        {
          "type": "hw",
          "label": "HW 9 — A pre-trade risk gate",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898731"
        },
        {
          "type": "project",
          "label": "Project — Phase 7: The Tournament",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898740"
        },
        {
          "type": "exam",
          "label": "Final · group: Low-Latency System Design: Allocators, Order Books & Timing"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.atomic-kill-switch",
      "category": "cpp",
      "name": "An atomic kill switch on the hot path",
      "can": "You can gate every outbound order on one std::atomic<bool> loaded with a relaxed or acquire load, flip it from another thread or a signal handler, and say why a flag rather than a lock or a message is what makes a kill switch both instant and nearly free.",
      "introduced": 9,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 9,
          "label": "Deck U9 · slides 15, 21"
        },
        {
          "type": "lab",
          "session": 9,
          "label": "Lab session 9 · Step 5 — the kill switch, with its automatic trips",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session09.md"
        },
        {
          "type": "hw",
          "label": "HW 9 — A pre-trade risk gate",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898731"
        },
        {
          "type": "project",
          "label": "Project — Phase 7: The Tournament",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898740"
        },
        {
          "type": "exam",
          "label": "Final · group: Atomics, Memory Ordering & Lock-Free Queues"
        }
      ],
      "interview": true
    },
    {
      "id": "trading.self-trade-prevention",
      "category": "trading",
      "name": "Self-trade prevention",
      "can": "You can detect that an incoming order would cross your own resting order, choose between cancel-newest, cancel-resting and reject, and explain why a wash trade is a compliance problem and not just wasted fees.",
      "introduced": 9,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 9,
          "label": "Deck U9 · slides 13–14"
        },
        {
          "type": "lab",
          "session": 9,
          "label": "Lab session 9 · Step 3 — self-cross bound and duplicate check",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session09.md"
        },
        {
          "type": "hw",
          "label": "HW 9 — A pre-trade risk gate",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898731"
        },
        {
          "type": "exam",
          "label": "Final · group: Low-Latency System Design: Allocators, Order Books & Timing"
        }
      ],
      "interview": true
    },
    {
      "id": "perf.risk-check-cost",
      "category": "perf",
      "name": "What a risk check costs: nanoseconds, branches & cache",
      "can": "You can order the checks cheapest and most likely to fail first, keep every limit in one cache-resident struct, measure the whole gate in nanoseconds per order with a sink and percentiles, and decide what a check is worth against the latency budget.",
      "introduced": 9,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 9,
          "label": "Deck U9 · slides 18–20, 22"
        },
        {
          "type": "lab",
          "session": 9,
          "label": "Lab session 9 · Step 6 — what does it cost? (make risk-bench)",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/session09.md"
        },
        {
          "type": "hw",
          "label": "HW 9 — A pre-trade risk gate",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898731"
        },
        {
          "type": "project",
          "label": "Project — Phase 7: The Tournament",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898740"
        },
        {
          "type": "exam",
          "label": "Final · group: Measurement, Tail Latency & Production Practice"
        }
      ],
      "interview": true
    },
    {
      "id": "trading.risk-regulation",
      "category": "trading",
      "name": "SEC Rule 15c3-5 & the Knight Capital lesson",
      "can": "You can say what the SEC's market access rule requires of a firm that routes orders to an exchange — automated pre-trade controls under the firm's own control — and tell the Knight Capital 2012 story as a failure of deployment and of controls.",
      "introduced": 9,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 9,
          "label": "Deck U9 · slides 5–8, 16, 23"
        },
        {
          "type": "hw",
          "label": "HW 9 — A pre-trade risk gate",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898731"
        },
        {
          "type": "exam",
          "label": "Final · group: Low-Latency System Design: Allocators, Order Books & Timing"
        }
      ],
      "interview": true
    }
  ]
};
