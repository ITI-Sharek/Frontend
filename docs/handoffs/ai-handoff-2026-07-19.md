# AI Service Handoff — SK-108 / TASK-1-06 (from the client repo)

> **From**: client (`Sharek/client`)
> **To**: AI agent working in the FastAPI AI repository (`Sharek/ai`)
> **Date**: 2026-07-19
> **Jira**: SK-108 / TASK-1-06 — "AI, RAG, and Pinecone contracts". Board is auth-gated; scope below comes from `server/docs/handoffs/sprint-1-external-verification-handoff.md` §"AI Agent Scope".

## Boundary — read first

The client **never** calls the AI service or a model provider directly. Client → NestJS backend → FastAPI AI service. The AI service returns **recommendations only**; the backend owns authorization, business state, DB writes, and audit snapshots. Nothing in this document asks the AI service to make a final decision.

Work only in the AI repository. Do not change the backend. If a backend change is genuinely required, describe the exact route, schema version, DTO field, compatibility impact, and acceptance test needed — do not just request it.

---

## 1 · The contract you must stay compatible with

The backend already defines the skill-profile contract at `server/src/modules/ai/dto/skill-profile-ai.dto.ts`. This is the authority — your FastAPI response must deserialize into it without coercion.

**Request** (`SkillProfileInput`):

```ts
{ contributorId, githubLogin, generationId, requestedAt,
  selectedRepositories: RepositoryEvidenceCapsule[] }
```

Each `RepositoryEvidenceCapsule` carries: `evidenceId`, `fullName`, `htmlUrl`, `private`, `fork`, `archived`, `defaultBranch`, `owner`, `description`, `topics[]`, `primaryLanguage`, `languages` (bytes map), `technologies[]`, `statistics`, `readmeExcerpt`, `contributionActivity`, `commitSignals`, `authorship { githubLogin, repositoryOwned, recentCommitCount, totalCommits, additions, deletions, contributionDetected, matchedRecentCommitShas[] }`, `evidenceFailures[]`.

**Response** (`SkillProfileResult`):

```ts
{ skills: GeneratedSkillCandidate[], fraudSignals: FraudSignal[],
  evidenceQuality: 'strong' | 'medium' | 'weak',
  recommendation: 'pending_review' | 'needs_more_evidence' }

GeneratedSkillCandidate = { name, proficiency: 'beginner'|'intermediate'|'advanced',
  confidence: number, evidenceIds: string[], evidenceSummary?, limitations? }

FraudSignal = { code, severity: 'low'|'medium'|'high', message, repositoryFullName? }
```

**Hard rule on `evidenceIds`**: every id you emit must be an `evidenceId` that appeared in the request. An unknown citation is a contract violation, not a warning — the backend cannot render an attribution it cannot resolve, and the product principle is that every AI output carries its reason.

Note the `recommendation` enum has **no approval value**. AI cannot approve a skill; a human admin does. Keep it that way.

---

## 2 · What the client renders — why the fields matter

Two client surfaces consume this (both currently mock-backed, both built and demo-able):

**Onboarding preview step** (`modules/contributors/components/onboarding/profile-preview-step.tsx`) shows generated skills as: name (mono, LTR) + proficiency + a **confidence band**, plus a per-row "report an obvious error" flag. Per DEC-010 the UI shows buckets — قوي / جزئي / منخفض / غير معروف — never a bare numeric score. Your `confidence` is a number; the client buckets it. **Tell us the bucket thresholds you intend**, so the client's mapping matches your calibration rather than guessing at 0.33/0.66.

**Task eligibility validation** (`modules/tasks/components/validation-result.tsx`) renders three outcomes — eligible / ineligible / review_needed — each with a justification line, matched/missing requirement chips, and evidence references. The ineligible screen must offer a next step, never a dead end (Principle 5). So: a decision without a human-readable justification and resolvable evidence refs is unusable to the UI, regardless of how accurate it is.

---

## 3 · Sprint 1 deliverables (verification scope)

1. **Configuration-driven choices, explicit**: selected LLM, embedding model, orchestration approach, vector store. No hardcoded provider names scattered through call sites. State which of these are Sprint 1 foundation vs later implementation.
2. **Versioned contracts**: request/response schemas carry a schema version and prompt version name. Version them before there is a consumer to break, not after.
3. **Skill-profile output**: skill, proficiency, confidence, and exact source attribution, compatible with §1 above.
4. **Failure paths, all five**: timeout · malformed model output · low confidence · missing evidence · unknown evidence citation. Each must produce a typed, deserializable error the backend can map — never a 500 with a stack trace, never a partially-valid body.
5. **Auth**: the internal bearer token (`AI_SERVICE_AUTH_TOKEN`, shared with the backend) is required on generation endpoints. `/health` stays unauthenticated for operational checks.
6. **Contract tests**: assert compatibility against `server/docs/api-contracts.md` and `skill-profile-ai.dto.ts`. A round-trip fixture test is the deliverable that actually prevents drift — prioritize it over broader model-quality tests this sprint.

---

## 4 · Open questions the client needs answered

1. **Confidence bucket thresholds** — see §2. Blocks the client's band mapping.
2. **Latency envelope** for one skill-profile generation over ~5–15 repos. The onboarding UI polls the backend generation endpoint (`GET /skill-profiles/me/generations/:generationId`) and shows a staged progress list; the stage labels and the "you can leave, we'll notify you" copy depend on whether this is ~20s or ~5min.
3. **Do you emit progress stages?** The client's DEC-015 contract allows a graceful fallback to 4 coarse statuses with `stage`/`progress` null. If you cannot report intermediate stages, say so — the UI will not invent numbers.
4. **Eligibility validation**: is it in Sprint 1 scope, or is Sprint 1 skill-profiling only? The client's apply flow is built against a mock with three deterministic outcomes and can wait, but the answer changes the sprint plan.

## 5 · What to return

- Configuration and contract files inspected or changed.
- AI tests executed, with results.
- Compatibility result against the NestJS DTO — explicitly pass/fail per field.
- Answers to §4.
- Remaining RAG / vector-store work, labelled Sprint 1 foundation vs later implementation.
