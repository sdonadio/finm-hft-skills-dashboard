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
        "label": "Lab — Week 1",
        "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week01.md"
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
      "title": "C++ Performance Foundations + Memory Management & Smart Pointers",
      "decks": [
        "u2"
      ],
      "lab": {
        "label": "Lab — Weeks 2 & 3 (run as one combined lab)",
        "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week02.md"
      },
      "hw": {
        "label": "HW 2 — Pointers, references, smart pointers & RAII",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898724",
        "due": "2026-10-15"
      },
      "project": {
        "label": "Project — Phase 0: Connect & Baseline",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898733",
        "due": "2026-10-12"
      },
      "exam": null,
      "companion_url": "https://sdonadio.github.io/low-latency-trading-arena/week2.html",
      "skills": [
        "cpp.pointers",
        "cpp.raw-allocation",
        "cpp.raii",
        "cpp.smart-pointers",
        "cpp.move-semantics",
        "perf.memory-hierarchy",
        "perf.branch-prediction",
        "perf.cache-line-alignment",
        "tools.benchmarking"
      ]
    },
    {
      "n": 3,
      "date": "2026-10-12",
      "title": "Custom Allocators & Pools + Templates & Generic Programming",
      "decks": [
        "u3"
      ],
      "lab": {
        "label": "Lab — Weeks 4 & 5 (week 4 in class, week 5 steps 3–4)",
        "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week04.md"
      },
      "hw": {
        "label": "HW 3 — A high-performance memory pool (placement new)",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898725",
        "due": "2026-10-22"
      },
      "project": {
        "label": "Project — Phase 1: The Fast Hot Path",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898734",
        "due": "2026-10-26"
      },
      "exam": null,
      "companion_url": "https://sdonadio.github.io/low-latency-trading-arena/week4.html",
      "skills": [
        "perf.object-pool",
        "cpp.placement-new",
        "perf.arena-allocator",
        "cpp.pmr",
        "cpp.templates",
        "cpp.variadic-templates",
        "cpp.type-traits-constraints",
        "cpp.virtual-dispatch",
        "perf.virtual-cost"
      ]
    },
    {
      "n": 4,
      "date": "2026-10-19",
      "title": "Compile-Time & CRTP + Data Structures — The Order Book",
      "decks": [
        "u4"
      ],
      "lab": {
        "label": "Lab — Weeks 6 & 7 (week 6 step 5, then week 7)",
        "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week07.md"
      },
      "hw": {
        "label": "HW 4 — A fast order book + CRTP",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898726",
        "due": "2026-10-29"
      },
      "project": {
        "label": "Project — Phase 1: The Fast Hot Path",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898734",
        "due": "2026-10-26"
      },
      "exam": null,
      "companion_url": "https://sdonadio.github.io/low-latency-trading-arena/week6.html",
      "skills": [
        "cpp.constexpr",
        "cpp.crtp-policies",
        "cpp.variant-visit",
        "perf.open-addressing-hash",
        "cpp.stl-containers",
        "trading.flat-order-book",
        "trading.queue-position",
        "cpp.type-traits-constraints",
        "perf.virtual-cost"
      ]
    },
    {
      "n": 5,
      "date": "2026-10-26",
      "title": "Complexity & Time-Series + Concurrency I · Midterm (remote)",
      "decks": [
        "u5"
      ],
      "lab": {
        "label": "Lab — Weeks 8 & 9 (week 9 steps 1–4 in class)",
        "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week09.md"
      },
      "hw": {
        "label": "HW 5 — Ring buffer & O(1) online stats",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898727",
        "due": "2026-11-05"
      },
      "project": {
        "label": "Project — Phase 2: The Local Order Book",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898735",
        "due": "2026-11-05"
      },
      "exam": "midterm",
      "companion_url": "https://sdonadio.github.io/low-latency-trading-arena/week8.html",
      "skills": [
        "perf.complexity-in-cache-terms",
        "perf.amortized-reserve",
        "cpp.ring-buffer",
        "perf.incremental-computation",
        "trading.obi-signal",
        "cpp.threads",
        "cpp.data-races",
        "cpp.atomics-memory-order",
        "perf.lock-tail-cost"
      ]
    },
    {
      "n": 6,
      "date": "2026-11-02",
      "title": "Concurrency II — Lock-Free & Multi-Process",
      "decks": [
        "u6"
      ],
      "lab": {
        "label": "Lab — Week 10",
        "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week10.md"
      },
      "hw": {
        "label": "HW 6 — An SPSC lock-free ring buffer",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898728",
        "due": "2026-11-12"
      },
      "project": {
        "label": "Project — Phase 3: Threading to Accelerate",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898736",
        "due": "2026-11-12"
      },
      "exam": null,
      "companion_url": "https://sdonadio.github.io/low-latency-trading-arena/week10.html",
      "skills": [
        "cpp.compare-and-swap",
        "cpp.lock-free-guarantees",
        "perf.spsc-ring",
        "perf.back-pressure",
        "perf.shared-memory-ring",
        "cpp.cpp20-coordination",
        "tools.sanitizers",
        "perf.cache-line-alignment",
        "cpp.atomics-memory-order"
      ]
    },
    {
      "n": 7,
      "date": "2026-11-09",
      "title": "Network Protocols, Market Data & Async I/O",
      "decks": [
        "u7"
      ],
      "lab": {
        "label": "Lab — Weeks 11 & 12 (run as one sitting)",
        "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week11.md"
      },
      "hw": {
        "label": "HW 7 — Fast FIX parser + uint64→text",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898729",
        "due": "2026-11-19"
      },
      "project": {
        "label": "Project — Phase 4: Multi-Process System with Shared-Memory Lock-Free IPC",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898737",
        "due": "2026-11-19"
      },
      "exam": null,
      "companion_url": "https://sdonadio.github.io/low-latency-trading-arena/week11.html",
      "skills": [
        "trading.fix-protocol",
        "trading.binary-market-data",
        "perf.transport-choice",
        "trading.feed-sequencing",
        "tools.message-framing",
        "perf.nonblocking-io",
        "perf.zero-copy-parse",
        "perf.batching-vs-latency",
        "perf.shared-memory-ring"
      ]
    },
    {
      "n": 8,
      "date": "2026-11-16",
      "title": "Low-Latency Design & Profiling the Tail",
      "decks": [
        "u8"
      ],
      "lab": {
        "label": "Lab — Weeks 13 & 14 (run as one sitting)",
        "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week13.md"
      },
      "hw": {
        "label": "HW 8 — Build optimization & killing the tail",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898730",
        "due": "2026-12-01"
      },
      "project": {
        "label": "Project — Phase 5: Wire & Hardware Tuning",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898738",
        "due": "2026-12-01"
      },
      "exam": null,
      "companion_url": "https://sdonadio.github.io/low-latency-trading-arena/week13.html",
      "skills": [
        "perf.prefetch",
        "perf.simd",
        "perf.syscall-cost",
        "perf.kernel-bypass",
        "perf.cpu-pinning-numa",
        "perf.hardware-timestamping",
        "tools.perf-profiler",
        "perf.tail-diagnosis",
        "tools.compiler-flags"
      ]
    },
    {
      "n": 9,
      "date": "2026-11-30",
      "title": "Latency Arbitrage, Multi-Venue & the Tournament · Final (Dec 8–11)",
      "decks": [
        "u9"
      ],
      "lab": {
        "label": "Lab — Week 15",
        "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week15.md"
      },
      "hw": {
        "label": "HW 9 — Cross-venue stale-quote detector",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898731",
        "due": "2026-12-10"
      },
      "project": {
        "label": "Project — Phase 7: The Tournament",
        "url": "https://canvas.uchicago.edu/courses/73835/assignments/898740",
        "due": "2026-12-11"
      },
      "exam": "final",
      "companion_url": "https://sdonadio.github.io/low-latency-trading-arena/week15.html",
      "skills": [
        "trading.nbbo-latency-arb",
        "trading.smart-order-routing",
        "trading.market-making",
        "trading.queue-aware-requoting",
        "trading.adverse-selection",
        "trading.hft-ethics",
        "trading.price-time-priority",
        "trading.queue-position"
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
          "label": "Lab week 1 · step 4 and the hand-computed book in Your turn",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week01.md"
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
          "session": 9,
          "label": "Deck U9 · slide 10"
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
          "label": "Lab week 1 · step 3 — the tick->order latency print",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week01.md"
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
          "label": "Lab week 1 · step 3 — the FEE_SCHEDULE line",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week01.md"
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
          "label": "Lab week 1 · step 2 — build the arena C++ client",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week01.md"
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
          "label": "Lab week 1 · step 3 — connect and get on the board",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week01.md"
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
      "id": "cpp.pointers",
      "category": "cpp",
      "name": "Pointers, references & pointer arithmetic",
      "can": "You can walk an array with a raw pointer, explain why p + 1 advances by sizeof(*p), and choose between a pointer and a reference by asking whether 'absent' is a legal answer.",
      "introduced": 2,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck U2 · slides 7–10"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab week 3 · steps 1 and 3 — the raw new/delete bug, then owning a raw buffer",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week03.md"
        },
        {
          "type": "hw",
          "label": "HW 2 — Pointers, references, smart pointers & RAII",
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
      "name": "new / delete, the classic bugs & allocator non-determinism",
      "can": "You can pair every new with its matching delete or delete[], name the four classic heap bugs, and explain why the same new call can take 20 ns or 20 µs and land in p99.9.",
      "introduced": 2,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck U2 · slides 11–12, 25–27, 49"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab week 3 · step 1 — the raw new/delete bug, found on your own OS",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week03.md"
        },
        {
          "type": "hw",
          "label": "HW 2 — Pointers, references, smart pointers & RAII",
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
      "id": "cpp.raii",
      "category": "cpp",
      "name": "RAII — scope-bound resource management",
      "can": "You can wrap a resource in a type that acquires in its constructor and releases in its destructor, so cleanup happens on every exit path including a throw.",
      "introduced": 2,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck U2 · slides 29–30, 35, 41"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab week 3 · step 4 — a small RAII guard",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week03.md"
        },
        {
          "type": "hw",
          "label": "HW 2 — Pointers, references, smart pointers & RAII",
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
      "id": "cpp.smart-pointers",
      "category": "cpp",
      "name": "unique_ptr, shared_ptr, weak_ptr",
      "can": "You can own an object with unique_ptr by default, justify shared_ptr only for genuinely shared lifetime, and say why its atomic refcount does not belong on a hot path.",
      "introduced": 2,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck U2 · slides 37–39"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab week 3 · steps 2 and 5 — unique_ptr and the refcount tax",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week03.md"
        },
        {
          "type": "hw",
          "label": "HW 2 — Pointers, references, smart pointers & RAII",
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
      "id": "cpp.move-semantics",
      "category": "cpp",
      "name": "Move semantics, std::move & the rule of five",
      "can": "You can write a noexcept move constructor that steals and then blanks the source, say what std::move actually does at the call site, and decide whether a type needs none or all five special members.",
      "introduced": 2,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck U2 · slides 31–33, 40"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab week 3 · step 3 — the Rule of Three (and Five)",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week03.md"
        },
        {
          "type": "hw",
          "label": "HW 2 — Pointers, references, smart pointers & RAII",
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
      "id": "perf.memory-hierarchy",
      "category": "perf",
      "name": "The memory hierarchy, stack vs heap & data layout",
      "can": "You can put rough numbers on a register, L1, L2, L3 and DRAM access, explain why the stack is a nearly free bump pointer, and choose a contiguous or SoA layout so a hot loop streams instead of pointer-chasing.",
      "introduced": 2,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck U2 · slides 5–6, 13–15"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab week 2 · steps 2–3 — stack vs heap, then cache-friendly vs pointer-chasing",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week02.md"
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
      "id": "perf.branch-prediction",
      "category": "perf",
      "name": "Branch prediction & the pipeline",
      "can": "You can explain what a mispredicted branch costs on a deep pipeline and name ways to make a hot branch predictable or remove it.",
      "introduced": 2,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck U2 · slide 16"
        },
        {
          "type": "exam",
          "label": "Final · group: Branch Prediction, SIMD & Compiler Optimisation"
        }
      ],
      "interview": true
    },
    {
      "id": "perf.cache-line-alignment",
      "category": "perf",
      "name": "The 64-byte cache line, alignment & false sharing",
      "can": "You can pack the fields a hot function reads onto one 64-byte cache line, use alignas to stop a hot object straddling two of them, and recognise false sharing from a threaded version being slower than a single-threaded one.",
      "introduced": 2,
      "practised": [
        6
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck U2 · slides 18–19, 51"
        },
        {
          "type": "deck",
          "session": 6,
          "label": "Deck U6 · slide 9"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab week 2 · step 4 — alignas(64) kills false sharing",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week02.md"
        },
        {
          "type": "exam",
          "label": "Final · group: Cache Effects, False Sharing & Data Layout"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.benchmarking",
      "category": "tools",
      "name": "Honest micro-benchmarking & percentiles",
      "can": "You can time a hot function with steady_clock in a release build, warm up first, keep the optimiser from deleting the work, and report percentiles rather than one mean.",
      "introduced": 2,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck U2 · slides 21–23"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab week 2 · step 1 — your first honest micro-benchmark",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week02.md"
        },
        {
          "type": "hw",
          "label": "HW 2 — Pointers, references, smart pointers & RAII",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898724"
        },
        {
          "type": "exam",
          "label": "Final · group: Measurement, Tail Latency & Production Practice"
        }
      ],
      "interview": true
    },
    {
      "id": "perf.object-pool",
      "category": "perf",
      "name": "Fixed-size object pools",
      "can": "You can implement a fixed-size object pool whose free slots hold the free-list, so allocate and free are O(1) pointer swaps that never call the system allocator.",
      "introduced": 3,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck U3 · slides 8, 10, 35"
        },
        {
          "type": "lab",
          "session": 3,
          "label": "Lab week 4 · steps 3–4 — alloc and free in O(1)",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week04.md"
        },
        {
          "type": "hw",
          "label": "HW 3 — A high-performance memory pool (placement new)",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898725"
        },
        {
          "type": "project",
          "label": "Project — Phase 1: The Fast Hot Path",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898734"
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
      "can": "You can construct an object into storage you already own with placement new, and destroy it by calling its destructor explicitly before reusing the slot.",
      "introduced": 3,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck U3 · slides 9–10"
        },
        {
          "type": "lab",
          "session": 3,
          "label": "Lab week 4 · step 5 — placement new + explicit dtor",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week04.md"
        },
        {
          "type": "hw",
          "label": "HW 3 — A high-performance memory pool (placement new)",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898725"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Allocation, RAII & Smart Pointers"
        }
      ],
      "interview": false
    },
    {
      "id": "perf.arena-allocator",
      "category": "perf",
      "name": "Arena / bump allocation and per-tick scratch",
      "can": "You can allocate a tick's scratch from a bump pointer over a pre-owned slab, align each request, and reclaim everything with one O(1) reset.",
      "introduced": 3,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck U3 · slides 9, 13, 34"
        },
        {
          "type": "hw",
          "label": "HW 3 — A high-performance memory pool (placement new)",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898725"
        },
        {
          "type": "project",
          "label": "Project — Phase 1: The Fast Hot Path",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898734"
        },
        {
          "type": "exam",
          "label": "Final · group: Low-Latency System Design: Allocators, Order Books & Timing"
        }
      ],
      "interview": false
    },
    {
      "id": "cpp.pmr",
      "category": "cpp",
      "name": "std::pmr memory resources",
      "can": "You can hand a standard container your own memory by constructing a pmr container over a monotonic_buffer_resource on a stack buffer.",
      "introduced": 3,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck U3 · slides 12–13"
        },
        {
          "type": "hw",
          "label": "HW 3 — A high-performance memory pool (placement new)",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898725"
        }
      ],
      "interview": false
    },
    {
      "id": "cpp.templates",
      "category": "cpp",
      "name": "Function & class templates",
      "can": "You can write a function or class template, let the compiler deduce its arguments, specialise the one type that deserves hand-tuning, and say why templates live in headers.",
      "introduced": 3,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck U3 · slides 15–17"
        },
        {
          "type": "lab",
          "session": 3,
          "label": "Lab week 5 · steps 1–2 — a code stamp and a generic container",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week05.md"
        },
        {
          "type": "hw",
          "label": "HW 3 — A high-performance memory pool (placement new)",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898725"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Templates, CRTP & Compile-Time"
        },
        {
          "type": "exam",
          "label": "Final · group: Templates, STL & Complexity"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.variadic-templates",
      "category": "cpp",
      "name": "Parameter packs, folds & perfect forwarding",
      "can": "You can take an arbitrary argument list with a parameter pack, collapse it with a fold expression, and forward each argument on without adding a copy.",
      "introduced": 3,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck U3 · slides 19–20, 36"
        },
        {
          "type": "lab",
          "session": 3,
          "label": "Lab week 5 · step 3 — variadic template + fold expression",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week05.md"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Templates, CRTP & Compile-Time"
        }
      ],
      "interview": false
    },
    {
      "id": "cpp.type-traits-constraints",
      "category": "cpp",
      "name": "Type traits, SFINAE, if constexpr & concepts",
      "can": "You can ask a question about a type at compile time and use the answer to select or reject an overload — with enable_if, if constexpr, or a named C++20 concept.",
      "introduced": 3,
      "practised": [
        4
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck U3 · slides 21–23"
        },
        {
          "type": "deck",
          "session": 4,
          "label": "Deck U4 · slides 8–9"
        },
        {
          "type": "lab",
          "session": 3,
          "label": "Lab week 5 · steps 4–5 — if constexpr and SFINAE",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week05.md"
        },
        {
          "type": "hw",
          "label": "HW 3 — A high-performance memory pool (placement new)",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898725"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Templates, CRTP & Compile-Time"
        }
      ],
      "interview": false
    },
    {
      "id": "cpp.virtual-dispatch",
      "category": "cpp",
      "name": "Inheritance, virtual functions & abstract interfaces",
      "can": "You can define an abstract interface with pure virtual functions and a virtual destructor, use override and final correctly, and spot the slicing and delete-through-a-non-virtual-base bugs.",
      "introduced": 3,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck U3 · slides 24–26, 29, 31"
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
      "name": "Virtual dispatch and what it costs",
      "can": "You can describe the vptr/vtable indirection behind a virtual call, explain that the real bill is the indirect branch and the inlining you lose, and say where a virtual still belongs in a trading system.",
      "introduced": 3,
      "practised": [
        4
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck U3 · slides 27–28, 30, 33"
        },
        {
          "type": "deck",
          "session": 4,
          "label": "Deck U4 · slide 11"
        },
        {
          "type": "lab",
          "session": 4,
          "label": "Lab week 6 · steps 1–2 — the virtual baseline, then CRTP against it",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week06.md"
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
      "id": "cpp.constexpr",
      "category": "cpp",
      "name": "constexpr, consteval & static_assert",
      "can": "You can compute a lookup table at compile time, check an assumption with static_assert so a violated invariant fails the build, and say what consteval forbids.",
      "introduced": 4,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 4,
          "label": "Deck U4 · slides 5–6"
        },
        {
          "type": "lab",
          "session": 4,
          "label": "Lab week 6 · step 3 — a constexpr lookup table",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week06.md"
        },
        {
          "type": "hw",
          "label": "HW 4 — A fast order book + CRTP",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898726"
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
      "can": "You can replace a virtual hierarchy with a base templated on its derived type, and compose behaviour from policy template parameters that cost nothing at run time.",
      "introduced": 4,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 4,
          "label": "Deck U4 · slides 11–12"
        },
        {
          "type": "lab",
          "session": 4,
          "label": "Lab week 6 · steps 2 and 4 — CRTP and policies",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week06.md"
        },
        {
          "type": "hw",
          "label": "HW 4 — A fast order book + CRTP",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898726"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Templates, CRTP & Compile-Time"
        },
        {
          "type": "exam",
          "label": "Final · group: Templates, STL & Complexity"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.variant-visit",
      "category": "cpp",
      "name": "std::variant + compile-time visitor dispatch",
      "can": "You can mirror a tagged wire union as a std::variant and dispatch it with a visitor whose dead branches are discarded at compile time — no vtable, no allocation.",
      "introduced": 4,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 4,
          "label": "Deck U4 · slides 21, 23"
        },
        {
          "type": "lab",
          "session": 4,
          "label": "Lab week 6 · step 5 — variant + visitor dispatch",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week06.md"
        },
        {
          "type": "project",
          "label": "Project — Phase 1: The Fast Hot Path",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898734"
        }
      ],
      "interview": false
    },
    {
      "id": "perf.open-addressing-hash",
      "category": "perf",
      "name": "Open-addressing hash maps",
      "can": "You can implement a flat open-addressing hash map with a power-of-two mask and linear probing, and explain why it beats a chaining map in cache.",
      "introduced": 4,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 4,
          "label": "Deck U4 · slides 14–15"
        },
        {
          "type": "lab",
          "session": 4,
          "label": "Lab week 7 · step 7 — SymMap, open addressing",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week07.md"
        },
        {
          "type": "hw",
          "label": "HW 4 — A fast order book + CRTP",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898726"
        },
        {
          "type": "exam",
          "label": "Final · group: Low-Latency System Design: Allocators, Order Books & Timing"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.stl-containers",
      "category": "cpp",
      "name": "Choosing an STL container for an access pattern",
      "can": "You can choose between std::map, std::unordered_map and a heap for ordered iteration, point lookup or best-element access, and state the cache cost of each.",
      "introduced": 4,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 4,
          "label": "Deck U4 · slide 16"
        },
        {
          "type": "lab",
          "session": 4,
          "label": "Lab week 7 · step 1 — why not just std::map",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week07.md"
        },
        {
          "type": "hw",
          "label": "HW 4 — A fast order book + CRTP",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898726"
        },
        {
          "type": "exam",
          "label": "Midterm · group: STL Containers & Algorithms"
        },
        {
          "type": "exam",
          "label": "Final · group: Templates, STL & Complexity"
        }
      ],
      "interview": false
    },
    {
      "id": "trading.flat-order-book",
      "category": "trading",
      "name": "A flat, price-indexed local order book",
      "can": "You can mirror an exchange book as a contiguous price-indexed level array with a cached top-of-book, so add, cancel and reading the touch stay O(1).",
      "introduced": 4,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 4,
          "label": "Deck U4 · slides 17–19, 24"
        },
        {
          "type": "lab",
          "session": 4,
          "label": "Lab week 7 · steps 2–6 — the level array, best_bid/best_ask, cancel",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week07.md"
        },
        {
          "type": "hw",
          "label": "HW 4 — A fast order book + CRTP",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898726"
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
      "id": "trading.queue-position",
      "category": "trading",
      "name": "Tracking your queue position",
      "can": "You can track how much size rests ahead of your order at a price level and use that queue_ahead to judge your fill probability.",
      "introduced": 4,
      "practised": [
        9
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 4,
          "label": "Deck U4 · slides 20, 22"
        },
        {
          "type": "deck",
          "session": 9,
          "label": "Deck U9 · slide 10"
        },
        {
          "type": "hw",
          "label": "HW 4 — A fast order book + CRTP",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898726"
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
      "id": "perf.complexity-in-cache-terms",
      "category": "perf",
      "name": "Complexity counted in cache misses",
      "can": "You can argue about cost in memory accesses rather than instructions, and show why a linear scan over a small contiguous array beats an O(log n) walk over heap nodes.",
      "introduced": 5,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck U5 · slides 5–7"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab week 8 · step 1 — the complexity framing",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week08.md"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Complexity, Cache & Performance Basics"
        },
        {
          "type": "exam",
          "label": "Final · group: Templates, STL & Complexity"
        }
      ],
      "interview": true
    },
    {
      "id": "perf.amortized-reserve",
      "category": "perf",
      "name": "Amortized cost & reserving up front",
      "can": "You can explain why vector push_back is O(1) amortized and why reserving up front removes the occasional reallocation from your tail.",
      "introduced": 5,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck U5 · slides 5, 7"
        },
        {
          "type": "exam",
          "label": "Midterm · group: STL Containers & Algorithms"
        },
        {
          "type": "exam",
          "label": "Final · group: Measurement, Tail Latency & Production Practice"
        }
      ],
      "interview": false
    },
    {
      "id": "cpp.ring-buffer",
      "category": "cpp",
      "name": "A fixed-capacity ring buffer",
      "can": "You can implement a fixed-capacity ring buffer over inline array storage with O(1) push, overwriting or expiring the oldest entry and never allocating.",
      "introduced": 5,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck U5 · slides 9–10"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab week 8 · steps 2–5 — a ring of timestamps",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week08.md"
        },
        {
          "type": "hw",
          "label": "HW 5 — Ring buffer & O(1) online stats",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898727"
        },
        {
          "type": "exam",
          "label": "Final · group: Low-Latency System Design: Allocators, Order Books & Timing"
        }
      ],
      "interview": false
    },
    {
      "id": "perf.incremental-computation",
      "category": "perf",
      "name": "Update, don't recompute",
      "can": "You can replace a windowed recompute with an online update — a running mean, Welford variance or EMA — so every tick costs the same O(1) and the tail stays flat.",
      "introduced": 5,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck U5 · slides 12–13"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab week 8 · step 7 — Welford's online mean/variance",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week08.md"
        },
        {
          "type": "hw",
          "label": "HW 5 — Ring buffer & O(1) online stats",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898727"
        },
        {
          "type": "exam",
          "label": "Final · group: Measurement, Tail Latency & Production Practice"
        }
      ],
      "interview": false
    },
    {
      "id": "trading.obi-signal",
      "category": "trading",
      "name": "Turning microprice and imbalance into a signal",
      "can": "You can fold microprice and order-book imbalance into online state and gate an order on a z-score, without looping a window on the hot path.",
      "introduced": 5,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck U5 · slides 22–23"
        },
        {
          "type": "hw",
          "label": "HW 5 — Ring buffer & O(1) online stats",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898727"
        },
        {
          "type": "project",
          "label": "Project — Phase 2: The Local Order Book",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898735"
        }
      ],
      "interview": false
    },
    {
      "id": "cpp.threads",
      "category": "cpp",
      "name": "std::thread and shared state",
      "can": "You can start and join a std::thread and say which state is private to a thread and which is shared through the address space.",
      "introduced": 5,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck U5 · slide 15"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab week 9 · step 1 — reproduce the race",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week09.md"
        },
        {
          "type": "exam",
          "label": "Final · group: Threads, Mutexes & Condition Variables"
        }
      ],
      "interview": false
    },
    {
      "id": "cpp.data-races",
      "category": "cpp",
      "name": "Data races & happens-before",
      "can": "You can identify a data race, explain that it is undefined behaviour rather than merely a wrong value, and name the happens-before edge that would make the access legal.",
      "introduced": 5,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck U5 · slides 16–17"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab week 9 · steps 1–3 — the race, TSan, and the volatile non-fix",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week09.md"
        },
        {
          "type": "hw",
          "label": "HW 5 — Ring buffer & O(1) online stats",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898727"
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
      "can": "You can choose relaxed, acquire/release or seq_cst for each atomic operation and justify it with the happens-before edge you actually need.",
      "introduced": 5,
      "practised": [
        6
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck U5 · slides 18–20, 24"
        },
        {
          "type": "deck",
          "session": 6,
          "label": "Deck U6 · slide 9"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab week 9 · steps 4–5 — atomic, then acquire/release",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week09.md"
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
      "can": "You can take a mutex correctly through a lock_guard, then trace how a contended one becomes a kernel wait or a priority inversion and show the damage in p99.9 rather than in the median.",
      "introduced": 5,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck U5 · slide 21"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab week 9 · step 6 — the mutex answer, correct but slow",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week09.md"
        },
        {
          "type": "exam",
          "label": "Final · group: Threads, Mutexes & Condition Variables"
        },
        {
          "type": "exam",
          "label": "Final · group: Atomics, Memory Ordering & Lock-Free Queues"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.compare-and-swap",
      "category": "cpp",
      "name": "Compare-and-swap retry loops",
      "can": "You can write a compare_exchange retry loop, explain why the expected value is refreshed on failure, and choose weak over strong inside a loop.",
      "introduced": 6,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 6,
          "label": "Deck U6 · slide 5"
        },
        {
          "type": "exam",
          "label": "Final · group: Atomics, Memory Ordering & Lock-Free Queues"
        }
      ],
      "interview": true
    },
    {
      "id": "cpp.lock-free-guarantees",
      "category": "cpp",
      "name": "ABA & progress guarantees",
      "can": "You can describe the ABA problem and distinguish wait-free, lock-free and obstruction-free progress guarantees.",
      "introduced": 6,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 6,
          "label": "Deck U6 · slide 6"
        },
        {
          "type": "exam",
          "label": "Final · group: Atomics, Memory Ordering & Lock-Free Queues"
        }
      ],
      "interview": false
    },
    {
      "id": "perf.spsc-ring",
      "category": "perf",
      "name": "A lock-free SPSC ring buffer",
      "can": "You can build a bounded single-producer/single-consumer ring with atomic head and tail, a power-of-two mask, release/acquire publication, and the two indices on separate cache lines.",
      "introduced": 6,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 6,
          "label": "Deck U6 · slides 8–9"
        },
        {
          "type": "lab",
          "session": 6,
          "label": "Lab week 10 · steps 2–6 — mask, alignas(64), push and pop",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week10.md"
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
      "can": "You can make a full queue a decision — drop, coalesce or shed — instead of a stall, and explain how head-of-line blocking turns one fat message into a tail.",
      "introduced": 6,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 6,
          "label": "Deck U6 · slide 10"
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
      "interview": false
    },
    {
      "id": "perf.shared-memory-ring",
      "category": "perf",
      "name": "A shared-memory ring across processes",
      "can": "You can put a lock-free ring in a shared-memory segment so two processes hand messages over without a syscall, and say which assumptions a ring loses once the reader is a separate process.",
      "introduced": 6,
      "practised": [
        7
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 6,
          "label": "Deck U6 · slides 12–13"
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
      "name": "C++20 coordination & execution policies",
      "can": "You can line threads up with a latch or barrier instead of a hand-rolled condition variable, and say when an execution policy on an STL algorithm is worth its overhead.",
      "introduced": 6,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 6,
          "label": "Deck U6 · slides 15–16"
        },
        {
          "type": "exam",
          "label": "Final · group: Threads, Mutexes & Condition Variables"
        }
      ],
      "interview": false
    },
    {
      "id": "tools.sanitizers",
      "category": "tools",
      "name": "Finding bugs with ASan, UBSan & ThreadSanitizer",
      "can": "You can build a target with -fsanitize=address,undefined or -fsanitize=thread, read the report back to the two offending accesses, and explain why a sanitizer build is never the one you ship.",
      "introduced": 6,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "lab",
          "session": 6,
          "label": "Lab week 10 · step 8 — two threads under ThreadSanitizer",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week10.md"
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
          "label": "Final · group: Measurement, Tail Latency & Production Practice"
        }
      ],
      "interview": false
    },
    {
      "id": "trading.fix-protocol",
      "category": "trading",
      "name": "Parsing FIX tag=value messages",
      "can": "You can pull the fields you need out of a SOH-delimited FIX message in one forward scan and reject the message on a bad mod-256 checksum.",
      "introduced": 7,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck U7 · slides 5, 12, 23"
        },
        {
          "type": "lab",
          "session": 7,
          "label": "Lab week 11 · steps 1–4 — one forward scan, dispatch on the tag",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week11.md"
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
      "id": "trading.binary-market-data",
      "category": "trading",
      "name": "Fixed-width binary market data",
      "can": "You can decode an ITCH/OUCH-style fixed-width message by reading fields at known offsets, byte-swapping from network order and scaling integer prices, with no digit parsing.",
      "introduced": 7,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck U7 · slides 6–7"
        },
        {
          "type": "lab",
          "session": 7,
          "label": "Lab week 11 · step 6 — why fixed-width binary beats text",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week11.md"
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
      "id": "perf.transport-choice",
      "category": "perf",
      "name": "TCP vs UDP multicast for market data",
      "can": "You can say why venues ship market data over UDP multicast and take order entry over TCP, and what head-of-line blocking and A/B feed arbitration mean for each.",
      "introduced": 7,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck U7 · slide 9"
        },
        {
          "type": "lab",
          "session": 7,
          "label": "Lab week 11 · step 5 — TCP vs UDP semantics",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week11.md"
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
      "name": "Sequence numbers, gaps & snapshot-plus-increment",
      "can": "You can rebuild a book from a snapshot plus increments, detect a sequence gap, and treat the book as untradeable until the feed has recovered.",
      "introduced": 7,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck U7 · slide 10"
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
      "can": "You can recover message boundaries from a stream with a length prefix or a delimiter, buffer a partial read, and bounds-check a length before you index with it.",
      "introduced": 7,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck U7 · slides 11–12"
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
      "name": "Non-blocking sockets & readiness event loops",
      "can": "You can drain a non-blocking socket until EAGAIN inside an epoll or kqueue readiness loop, and explain what edge-triggered mode obliges you to do.",
      "introduced": 7,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck U7 · slides 14–17"
        },
        {
          "type": "lab",
          "session": 7,
          "label": "Lab week 12 · step 5 — a non-blocking read loop",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week12.md"
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
      "can": "You can pull only the fields you use straight out of a frame with a view instead of building a DOM, write digits into a reused buffer on the send path, and show the p99.9 win on a replay tape.",
      "introduced": 7,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck U7 · slides 19–20, 24–25"
        },
        {
          "type": "lab",
          "session": 7,
          "label": "Lab week 12 · steps 1–4 and 6 — fast integer-to-decimal and targeted field extract",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week12.md"
        },
        {
          "type": "hw",
          "label": "HW 7 — Fast FIX parser + uint64→text",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898729"
        },
        {
          "type": "project",
          "label": "Project — Phase 4: Multi-Process System with Shared-Memory Lock-Free IPC",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898737"
        },
        {
          "type": "exam",
          "label": "Final · group: Networking: Sockets, Kernel Bypass & Protocol Parsing"
        }
      ],
      "interview": true
    },
    {
      "id": "perf.batching-vs-latency",
      "category": "perf",
      "name": "Batching vs latency",
      "can": "You can explain why batching buys throughput at the cost of the tail you are graded on, and why TCP_NODELAY belongs on an order path.",
      "introduced": 7,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck U7 · slide 21"
        },
        {
          "type": "exam",
          "label": "Final · group: Measurement, Tail Latency & Production Practice"
        }
      ],
      "interview": false
    },
    {
      "id": "perf.prefetch",
      "category": "perf",
      "name": "The memory wall, the TLB & software prefetching",
      "can": "You can issue a __builtin_prefetch hint ahead of an irregular walk, tune the distance by measurement, and say how huge pages cut TLB misses.",
      "introduced": 8,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck U8 · slides 5–6, 27"
        },
        {
          "type": "lab",
          "session": 8,
          "label": "Lab week 13 · step 6 — alignas and __builtin_prefetch",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week13.md"
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
      "interview": false
    },
    {
      "id": "perf.simd",
      "category": "perf",
      "name": "SIMD & vectorization",
      "can": "You can vectorize a hot reduction over aligned contiguous data, or get the compiler to do it with -O3 -march=native, and check that it really vectorized.",
      "introduced": 8,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck U8 · slides 7, 27"
        },
        {
          "type": "lab",
          "session": 8,
          "label": "Lab week 13 · steps 2 and 5 — the winning build, then the intrinsics by hand",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week13.md"
        },
        {
          "type": "hw",
          "label": "HW 8 — Build optimization & killing the tail",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898730"
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
      "id": "perf.syscall-cost",
      "category": "perf",
      "name": "Syscalls, busy-poll & interrupt jitter",
      "can": "You can explain what a trip into the kernel costs on a hot path and when busy-polling a queue beats waiting to be woken.",
      "introduced": 8,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck U8 · slide 9"
        },
        {
          "type": "exam",
          "label": "Final · group: Networking: Sockets, Kernel Bypass & Protocol Parsing"
        }
      ],
      "interview": false
    },
    {
      "id": "perf.kernel-bypass",
      "category": "perf",
      "name": "What kernel bypass changes",
      "can": "You can explain what kernel bypass changes — DPDK, an Onload-style shim, or io_uring's batched syscalls — and which per-packet kernel costs each one removes.",
      "introduced": 8,
      "practised": [],
      "depth": 1,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck U8 · slide 10"
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
      "name": "CPU pinning, core isolation & NUMA",
      "can": "You can pin a hot thread to a core, say what isolcpus and nohz_full add, and keep its memory node-local and pre-faulted so no page fault lands mid-race.",
      "introduced": 8,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck U8 · slides 11, 26"
        },
        {
          "type": "lab",
          "session": 8,
          "label": "Lab week 13 · step 7 — connect it to the arena",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week13.md"
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
      "name": "PTP, hardware timestamping & the hardware frontier",
      "can": "You can explain why NTP is too coarse for microsecond work, what a NIC hardware timestamp measures that a user-space clock read cannot, and where an FPGA takes over from your C++.",
      "introduced": 8,
      "practised": [],
      "depth": 1,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck U8 · slides 12–13"
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
      "name": "Profiling with perf & reading a flame graph",
      "can": "You can go from perf stat to perf record to perf report and annotate, fold sampled stacks into a flame graph and read it by width, so the wide plateaus rather than the tall spikes set your next fix.",
      "introduced": 8,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck U8 · slides 16–18"
        },
        {
          "type": "lab",
          "session": 8,
          "label": "Lab week 14 · step 3 — perf record then perf report",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week14.md"
        },
        {
          "type": "hw",
          "label": "HW 8 — Build optimization & killing the tail",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898730"
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
      "name": "Diagnosing a latency tail",
      "can": "You can attribute a tail spike to allocation, a page fault, a TLB miss, NUMA locality or scheduler preemption from its signature, keep logging off the hot path, then fix it and prove the p99.9 moved.",
      "introduced": 8,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck U8 · slides 15, 20–21, 25"
        },
        {
          "type": "lab",
          "session": 8,
          "label": "Lab week 14 · steps 1–5 — read the tail, hypothesise, fix, watch it collapse",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week14.md"
        },
        {
          "type": "hw",
          "label": "HW 8 — Build optimization & killing the tail",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898730"
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
      "name": "Release flags, LTO & PGO",
      "can": "You can justify -O3, -march=native, -flto and -DNDEBUG on a graded binary, keep -g for the profiler, and run the two-pass profile-guided build.",
      "introduced": 8,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck U8 · slides 22–23, 28"
        },
        {
          "type": "lab",
          "session": 8,
          "label": "Lab week 13 · steps 2–4 — the winning build and PGO",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week13.md"
        },
        {
          "type": "hw",
          "label": "HW 8 — Build optimization & killing the tail",
          "url": "https://canvas.uchicago.edu/courses/73835/assignments/898730"
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
      "can": "You can consolidate two venues into an NBBO, detect the crossed state that means one side is stale, and explain why only the first order to reach that venue is paid.",
      "introduced": 9,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 9,
          "label": "Deck U9 · slides 5–6, 18"
        },
        {
          "type": "lab",
          "session": 9,
          "label": "Lab week 15 · step 2 — sketch the cross-venue stale-quote detector",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week15.md"
        },
        {
          "type": "hw",
          "label": "HW 9 — Cross-venue stale-quote detector",
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
      "interview": false
    },
    {
      "id": "trading.smart-order-routing",
      "category": "trading",
      "name": "Smart order routing & sweeping",
      "can": "You can split or sweep an order across venues for displayed size and account for fees, rebates and per-venue latency in the route you pick.",
      "introduced": 9,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 9,
          "label": "Deck U9 · slide 7"
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
      "name": "Quoting two sides at speed",
      "can": "You can quote a bid and an ask around a fair value anchored on the microprice, and explain how spread plus rebates pay for the risk of a stale quote.",
      "introduced": 9,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 9,
          "label": "Deck U9 · slide 9"
        },
        {
          "type": "lab",
          "session": 9,
          "label": "Lab week 15 · step 4 — map strategy to the composite grade",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week15.md"
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
      "id": "trading.queue-aware-requoting",
      "category": "trading",
      "name": "Queue-aware requoting & inventory skew",
      "can": "You can decide when a requote is worth losing your place in the FIFO queue, and lean your quotes against the inventory you are carrying.",
      "introduced": 9,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 9,
          "label": "Deck U9 · slide 10"
        },
        {
          "type": "lab",
          "session": 9,
          "label": "Lab week 15 · step 3 — sketch the queue-aware requote",
          "url": "https://github.com/sdonadio/hft-cpp-starter-uchicago/blob/main/labs/week15.md"
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
      "id": "trading.adverse-selection",
      "category": "trading",
      "name": "Adverse selection & markouts",
      "can": "You can mark a fill out against the mid a moment later and use a persistently negative markout to widen, skew away from, or stop quoting a name.",
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
          "type": "hw",
          "label": "HW 9 — Cross-venue stale-quote detector",
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
      "interview": false
    },
    {
      "id": "trading.hft-ethics",
      "category": "trading",
      "name": "The frontier and the ethics of speed",
      "can": "You can argue both sides of paid speed — tighter spreads and deeper books against a pay-to-win arms race — and name the rules that shape it.",
      "introduced": 9,
      "practised": [],
      "depth": 1,
      "where": [
        {
          "type": "deck",
          "session": 9,
          "label": "Deck U9 · slides 13–14"
        }
      ],
      "interview": false
    }
  ]
};
