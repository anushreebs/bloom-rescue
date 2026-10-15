# 90-second demonstration

**0–10 seconds.** “Bloom already provides matching, applications and tracking. I did not observe a broken recovery case. I built this independent fictional prototype to explore how an interrupted application could recover safely.” Show deterministic mode and fictional labels.

**10–30 seconds.** Open Fable Labs. Generate a REST draft. Show its complete evidence quote, edit field, approval and separate resume action. Explain that exact provenance is narrower than semantic truth. Optional reuse consent starts unchecked.

**30–45 seconds.** Open Paper Orbit. Generate: no cloud evidence, no invented qualifications, approval blocked. Open Moss Studio: authorization stays blank until the human supplies and confirms it.

**45–60 seconds.** Open Copper Finch. Show consented prior answer as a source; approval is still required. Mention that reuse permission can be revoked and persists across restart.

**60–80 seconds.** Open Lantern Demo, generate and approve. Resume causes timeout-after-accept. Show verification_required, then Check submission status. Receipt reports one local mock acceptance; changing a retry key does not create another.

**80–90 seconds.** Show tests and evaluation report: initial 27/35, final 35/35 on the same frozen deterministic cases. “Live model evaluation is incomplete; the provider adapter is tested with doubles. I would validate real user need and compare model benefit against this simpler baseline before expanding.”

## Reset and reproducibility
Stop the backend before removing only its synthetic SQLite database (`backend/data/bloom-rescue.sqlite3` by default), then restart to reseed. Do not remove arbitrary databases. Browser tests use their own isolated test database and run setup automatically.

## What to understand personally
Trace one API request and revision check; explain why approval and submission are separate; explain timeout ambiguity and durable idempotency; inspect the strict JSON schema and verifier; rerun a failing evaluation case; explain the model's unproven incremental benefit. Do not claim authorship of unaided implementation or production impact.
