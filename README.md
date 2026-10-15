# Bloom Rescue

Independent application-recovery prototype using **fictional candidates and companies**. This is not a Bloom integration or an endorsed product. It submits only to a local simulated ATS.

**Latest UI revision:** Calm Intelligence with light/dark themes, session draft retention, application URL/history context, clear provenance and native motion. See [current delivery and verification](docs/UI_V3_DELIVERY.md), [three editable concept boards](design/concepts.html) and [Mac upgrade instructions](UI_UPGRADE.md). The [earlier editable Figma checkpoint](https://www.figma.com/design/FdVpjwTERGzduBV2WTQ2fC?node-id=3-340) is not synchronized to this revision because connected-account quota prevented edits. Earlier reports remain historical checkpoints.

## Try it

Requirements: Python 3.12 and Node 24. From this directory:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements.txt
cd frontend
npm ci
cd ../backend
LLM_MODE=deterministic ../.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
```

In a second terminal, run `cd frontend && npm run dev`, then open http://127.0.0.1:5173. The public demo token is not authentication; keep the app local and do not enter real personal data. See [BUILD_AND_RUN.md](BUILD_AND_RUN.md) for checks and browser setup.

## What it demonstrates

An interrupted application moves through evidence retrieval, structured draft selection, constrained provenance verification, explicit human approval, optional answer reuse consent, and mock submission. Uncertain submission outcomes are reconciled before any retry. A durable logical identity prevents different client retry keys from creating duplicate acceptances.

Five scenarios cover REST experience, unsupported cloud information, human-confirmed authorization, prior approved answers and timeout after acceptance. Missing cloud evidence does not mean the candidate has no cloud experience; this case deliberately escalates rather than inventing either answer.

## AI boundary

Deterministic mode runs without credentials. Optional API mode uses OpenAI Responses strict JSON output to select evidence excerpts. Trusted Python validates source IDs, complete quotations, bounded topic coverage and sensitive-question policy. Neither mode can approve or submit. The API mode is implemented and tested with HTTP doubles, but **a live model call has not been demonstrated** because credentials were unavailable. This required release gate remains incomplete.

Extraction establishes constrained provenance, not source truth or general semantic entailment. Lexical retrieval and conflict checks have a deliberately limited vocabulary. Model utility beyond the deterministic selector is unproven.

## Evidence and review

| Topic | Artifact |
|---|---|
| Product hypothesis and scope | [Product specification](docs/PRODUCT_SPEC.md) |
| Architecture and interfaces | [Architecture](docs/ARCHITECTURE.md), [contracts](CONTRACTS.md), [API](docs/API.md) |
| Tradeoffs and decisions | [Engineering decisions](docs/ENGINEERING_DECISIONS.md) |
| AI evaluation | [Evaluation report](docs/EVALUATION_REPORT.md), [dataset](eval/EVAL_DATASET.json) |
| Tests | [Test report](docs/TEST_REPORT.md) |
| Accessibility | [Accessibility report](docs/ACCESSIBILITY_REPORT.md) |
| Security | [Security review](docs/SECURITY_REVIEW.md) |
| Performance | [Performance report](docs/PERFORMANCE_REPORT.md) |
| Independent code review | [Code review](docs/CODE_REVIEW.md) |
| Demo | [Demo script](docs/DEMO_SCRIPT.md) |

Development used actual specialist coding and review agents. Changes were challenged through independent evaluation, browser tests and code review; see the final implementation report for remaining limitations. AI-assisted development should be described accurately rather than represented as entirely unaided work.
