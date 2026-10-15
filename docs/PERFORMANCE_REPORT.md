# Performance review

## Scope and reproducibility

Measured on 14 October 2026 in the provided Linux x86_64 environment, Python 3.12.14. Run from repository root:

```sh
.venv/bin/python scripts/benchmark.py --samples 30
```

The script starts its own loopback Uvicorn server on an available ephemeral port, uses a disposable SQLite database, forces deterministic mode, warms the list endpoint five times, then executes sequential HTTP requests. It does not touch the normal demonstration database or any external service. Raw machine-readable results are in `performance-results.json`. Re-run after implementation changes; machine scheduling and filesystem conditions affect these small timings. Nearest-rank p95 with 30 samples is only a small descriptive sample, not a service-level guarantee.

## Initial measured baseline

| Operation | Samples | Median | p95 | Maximum |
|---|---:|---:|---:|---:|
| GET applications | 30 | 1.519 ms | 1.858 ms | 1.926 ms |
| GET empty event history | 30 | 1.097 ms | 1.478 ms | 3.376 ms |
| POST resolve, deterministic, persistence included | 30 | 1.989 ms | 3.340 ms | 11.060 ms |
| Direct deterministic evidence service | 300 | 0.100 ms | 0.198 ms | 0.864 ms |

The response-reported draft time during resolve had median 0.115 ms and p95 0.214 ms. This separates local draft computation from HTTP, schema validation and SQLite writes; it is not LLM latency. The events measurement intentionally covers an empty history because it runs before resolves, so it says nothing about a long audit trail.

**Live LLM latency: not tested.** No provider credential is available, and the benchmark explicitly disables external calls. Mock speed is not evidence of acceptable API-backed latency, token cost or provider reliability.

## Database findings

Tracing the list implementation produced 11 SELECT statements for five applications: one ID query, then one application lookup and one evidence lookup for each item. SQLite's application-ID index serves the current ordering/filter scan; a candidate-specific index is absent. This is acceptable for the bounded five-item local demonstration, but not evidence of scalable query behavior. Before expanding the queue, load candidate evidence once and fetch applications in one query, then compare query counts and latency under a larger synthetic fixture. There was no such optimization or before/after test in this review.

## Frontend inspection

Source inspection found the startup application, saved-answer and health requests launched with `Promise.all`, avoiding a serial startup waterfall among those three requests. Event history is fetched after selecting an application. After actions, activity and saved answers refresh in parallel. These are code observations, not browser network-trace measurements.

The global busy state provides visible feedback while requests are pending, but also disables queue controls. The initial `api.ts` fetch wrapper had no browser timeout/cancellation. Recommendation sent to the lead: add a bounded request timeout, retain uncertainty-safe status checks, and never blindly replay a submission. The provider implementation has bounded attempts and per-request HTTP timeouts, so slow model work does not hold a SQLite transaction. Frontend responsiveness during a slow provider call, React render duration and browser long tasks were **not measured** by this script. Keyboard/axe checks belong to the separate QA review and do not establish performance.

The application is a single bounded workspace. Route-level splitting is not automatically useful without additional routes or significant optional dependencies. No premature code splitting recommendation is justified by the present evidence.

## Budgets to validate, not production promises

| Budget | Proposed target | Evidence/next step |
|---|---|---|
| Local warmed list/event endpoints | p95 below 50 ms on this setup | Initial sample meets target; no concurrency/load claim |
| Local deterministic resolve endpoint | p95 below 100 ms | Initial sample meets target; provider mode excluded |
| First-party production JS, offline gzip | below 100 KiB | Pending successful production build in this initial review |
| Main-thread long tasks during interaction | no task above 50 ms attributable to the app in a recorded representative flow | Not measured; browser performance trace needed |
| Live drafting latency | collect p50/p95 and failures before setting a promise; show progress throughout | Live gate incomplete |
| Network recovery | bounded wait and refreshed state without automatic replay | Must be tested by QA with delayed/dropped responses |

## Limitations and approval

No Lighthouse, production deployment, CPU-throttled mobile trace, React profiler, concurrent-user load test, production database or live provider benchmark was run. No speedup is claimed. These measurements establish that the deterministic local workflow is inexpensive on this machine and expose a small-queue query pattern for future work. They do not establish adoption, capacity or responsiveness under real network/provider conditions.

Specialist deliverables: benchmark script, raw results and this report. Lead approval requested only for implementation changes (frontend timeout and future batching); no other owner's source was modified.

## Integrated build checkpoint

The lead reran the same script after integration and production build. Raw `performance-results.json` now corresponds to this later run, not the initial table. List median/p95: **1.268/1.573ms**; empty events **0.918/1.159ms**; deterministic resolve **1.826/2.211ms**, each30 sequential samples. Direct deterministic service median/p95 **0.154/0.225ms**,300samples. Differences between short runs are not an optimization effect; no controlled speedup is claimed.

Built JS:235,797bytes, offline Python gzip72,697bytes (about71KiB); CSS9,077bytes, gzip2,847bytes. This meets the proposed sub100KiB JS budget on this build. Vite's displayed gzip estimate differs slightly because compression settings differ. These are artifact sizes, not measured network transfer.

Frontend now uses a30-second AbortController timeout and clears pending state. Browser QA tested an initial network failure and retry, not a full30-second hung mutation or live provider responsiveness. The earlier timeout finding is resolved in code, with that testing limit retained. SQLite's11reads for5applications remains unchanged.
