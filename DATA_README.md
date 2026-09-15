# Drop the two data files in here

This directory is the **shell** of the skills dashboard, copied by
`tools/new_course.py`. It has every page, the stylesheet, `app.js` and `tools/`,
but no course content. Two files are missing, and nothing renders until they are
here:

| File | Global | What it holds |
|---|---|---|
| `skills.js` | `window.SKILLS` | `course`, `categories`, `sessions`, `skills` |
| `focus.js`  | `window.FOCUS`  | optional `meta`, plus one entry per session: the main technical focus, its concepts, the "why it matters" link, the interview questions |

`README.md` (next to this file) documents the exact shape of both. `focus.js` is
optional — with only `skills.js` the site still works, and any session without a
focus entry says "focus content coming".

## 1 · `skills.js` → `course`

Required: `code`, `title`, `institution`, `term`, `sessions_url`, `starter_url`,
`companion_url`.

Optional, and the reason this shell is reusable:

| Field | Default | Effect |
|---|---|---|
| `storage_prefix` | `"hft-skills"` | localStorage namespace, `<prefix>:<skill id>`. **Set this.** Sibling course sites published under the same `*.github.io` origin share one localStorage; two courses with the same prefix would overwrite each other's ticks. |
| `accent` | `#2e6db4` | Theme colour: bars, fills, the nav rule |
| `accent_2` | derived from `accent` (`#b9d9eb` by default) | Link and label ink on the dark background |
| `accent_3`, `accent_deep` | derived | Pale ink on code, deep shade |
| `lms` | `"CourseWorks"` | Named in the "Course site" and "Deck (on …)" labels |
| `lang` | `"C++"` | The chip on a code block that names no deck |

`categories` may use any ids and there may be any number of them; each carries
its own `color`. `sessions` may be numbered from 0 (or anything else), in any
count, with any ISO dates.

## 2 · `focus.js` → `meta` (all optional)

| Field | Default |
|---|---|
| `link_title` | `"Why this matters in HFT"` |
| `link_kicker` | `"The link with HFT"` |
| `link_phrase` | `"why it matters in an HFT system"` (used in the overview lead) |
| `link_short` | `"HFT link"` (used when a session has no focus entry yet) |
| `interview_title` | `"Interview questions"` |
| `interview_kicker` | `"Interview"` |

## 3 · Generate the session wrappers

```sh
python3 tools/make_session_pages.py
```

One `session-N.html` per `n` in `skills.js` (including `n = 0`); wrappers for
sessions that no longer exist are removed.

## 4 · Preview

```sh
python3 -m http.server 8080   # then open http://localhost:8080/
```

## Note on `tools/`

`tools/make_session_pages.py` and `tools/new_course.py` are part of the shell and
work for any course. The other scripts in `tools/` were written against one
specific course's data (paths, deck names, session counts) — adapt or delete
them rather than trusting them here.
