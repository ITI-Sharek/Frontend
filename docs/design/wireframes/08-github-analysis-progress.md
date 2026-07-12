# 08 · GitHub analysis progress (onboarding step 2 / re-analysis)

**Job**: turn a multi-minute async black box (`ingestion_status: pending → in_progress → completed|failed` [Confirmed] + AI profiling) into a narrated, leaveable process. This is the user's first experience of Share-k's AI — it sets the explainability tone for everything after.

```
┌────────────────────────────────────────────────────────────────────┐
│  ● Connect ── ● Analyze ── ○ Preview ── ○ Review    (stepper)      │
│                                                                    │
│              Analyzing github.com/sara-dev                         │
│                                                                    │
│   ✓ Connected to GitHub                                            │
│   ✓ Found 12 public repositories                                   │
│   ● Reading repositories…                       ▓▓▓▓▓▓░░░░  7/12   │
│       └ currently: dashboard-ui (README, languages, commits)       │
│   ○ Extracting skills with evidence                                │
│   ○ Preparing your profile for human review                        │
│                                                                    │
│   Usually takes 2–5 minutes.                                       │
│   You can leave — we'll notify you when it's ready.                │
│   [Explore projects meanwhile]                                     │
│                                                                    │
│   ⓘ What we read: public repos, READMEs, languages, commit         │
│     activity. What we never do: write to your repos.               │
└────────────────────────────────────────────────────────────────────┘
```

**Stage narration rules**
- Stages are *real pipeline phases* (fetch → read → extract → queue-for-review), each with concrete artifacts (repo names, counts) — proof of work, not a fake progress bar. If granular progress isn't available from the backend [UX-Required: progress events endpoint — OQ-T4], degrade to stage-level checkmarks without percentages; never invent numbers.
- The final stage pre-frames the human review gate ("preparing for human review") so the pending-review wait that follows feels like part of the plan, not a stall.
- The "what we read / never do" reassurance repeats the consent promise at the moment of maximum sensitivity.

**States**
| State | Treatment |
|---|---|
| Queued (`pending`) | "In line to start… usually seconds." |
| Running (`in_progress`) | narrated stages above |
| Completed | auto-advance to profile preview (WF stepper step 3) with a brief "found N skills" beat |
| Failed (`failed`) | honest cause when known (GitHub rate limit / token expired / service error) → **[Try again]** primary; "connect a different account"; support link. Never loops silently. |
| Empty result | completed-but-zero-skills → guidance state (public repos advice) — treated as an outcome, not an error |
| Re-analysis variant | same component embedded in `/skills`; adds "your current verified skills stay active until review completes" [Confirmed re-profiling rule] |

**Reduced motion**: stage checkmarks appear without animation; progress bar becomes textual "7 of 12".
**Mobile**: identical, single column; stepper compresses to "step 2 of 4".
**RTL**: stepper + progress direction mirror; repo names LTR.
