# Evaluation artifacts

- `EVAL_DATASET.json`: 35 independently labeled fictional question cases.
- `VERIFICATION_CASES.json`: eight separately counted direct provenance checks.
- `run_eval.py`: runs both sets; exits nonzero on any failed label or safety check.
- `results-initial.json`: frozen initial 27/35 question result, before remediation.
- `results-deterministic.json`: latest run; regeneration intentionally replaces this file.
- `../docs/EVALUATION_REPORT.md`: methods, failures, interpretation and limitations.

Use `.venv/bin/python eval/run_eval.py` from the repository root. The initial snapshot predates adding the separately reported direct verification probes. All text is synthetic and contains no user resume. API mode is opt-in, not demonstrated by deterministic results. Avoid interpreting the weak first-source baseline as a fair comparison to every possible non-LLM implementation.
