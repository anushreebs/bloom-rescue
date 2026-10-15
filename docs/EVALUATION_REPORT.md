# AI evaluation and red-team report

## Status and method

Evaluation specialist independently authored **35 synthetic labeled cases** before running the service. The source dataset is [`../eval/EVAL_DATASET.json`](../eval/EVAL_DATASET.json); each case carries the expected verdict, permitted source IDs, category and a rationale where the boundary needs explanation. These are deliberately challenging examples, not a representative sample of Bloom users or real applications.

Run from the repository root:

```sh
.venv/bin/python eval/run_eval.py --mode deterministic
```

The runner exits nonzero if any label, source policy, extractive provenance, required-review flag or returned mode fails. Its JSON report records individual outputs and latencies. No LLM-as-judge is used. `verify_answer` is an additional implementation check, while expected outcomes and source allowlists are independent dataset labels. Exact extraction is a narrow provenance property; it cannot establish that a source is true, current, adequate to the question or owned by a real person.

## Initial measurement

`eval/results-initial.json` records the initial implementation on 14 October 2026:

- Overall labeled cases: **27/35 passed**.
- Mandatory human-review flag: **35/35**.
- Extractive provenance among nonempty generated answers: **14/14**.
- Sensitive-question abstention: **7/7**.
- Deliberately weak first-source-only baseline: **7/35**.

The baseline simply quotes the first provided source, without relevance, candidate or sensitive-question policy. This establishes why those checks matter on this constructed set; it does **not** prove the system outperforms a reasonable manually configured form or all deterministic alternatives. The deterministic product itself is a rules/extractive baseline for a future live LLM comparison.

## Initial failures and requested remediation

| Cases | Observation | Required mitigation |
|---|---|---|
| `contradiction-years` | One-year and five-year sources yielded `supported`. | Abstain when conflicting explicit duration claims are present. |
| `compound-rest-testing`, `compound-cloud-rest` | A source covered only one requested topic. | Require coverage of every requested supported topic. |
| `specific-rest-years` | A generic REST-project sentence answered a duration question. | Missing requested duration must require more information. |
| `specific-production`, `semantic-wrong-context` | Classroom evidence was treated as sufficient for production/professional context. | Check explicit context qualifiers; do not equate topic overlap with contextual relevance. |
| `unfamiliar-injection` | A paraphrased instruction attempt escaped the phrase list. | Broaden conservative instruction detection while documenting that regexes cannot solve arbitrary prompt injection. |
| `unsupported-management` | Implementation evidence answered a leadership question. | Require evidence for the requested role, not only technical-topic overlap. |

These were reported to the architect and AI owner before implementation changes. The frozen labels were not relaxed to obtain a passing result.

## Post-remediation regression measurement

The evaluation specialist reran the unchanged dataset after the AI owner implemented conservative topic coverage, contextual qualifiers, duration conflict checks and additional instruction detection. `eval/results-deterministic.json` records the final run:

| Check | Initial | After remediation |
|---|---:|---:|
| Independently labeled question outcomes | 27/35 | **35/35** |
| Human review required | 35/35 | **35/35** |
| Extractive provenance of nonempty answers | 14/14 | **6/6** |
| Direct verifier probes (separate denominator) | 8/8 | **8/8** |
| Weak first-source baseline | 7/35 | 7/35 |

All eight previously reported failures now abstain or request information as labeled. Nonempty drafts decreased from 14 to six because inadequately supported answers are now withheld. This is a measured conservative tradeoff on these cases; its effect on real user effort is unknown. The initial JSON remains preserved.

**This is a known-set regression result, not held-out generalization.** Developers saw the failed cases before remediation. No dataset labels were relaxed. No claim of production accuracy, comprehensive prompt-injection resistance or live LLM quality follows from this result.

## Live API gate

**Incomplete: no provider credentials are configured.** No API evaluation, model accuracy, token cost or model latency has been measured. API mode must be explicitly configured and separately run:

```sh
LLM_MODE=api OPENAI_MODEL=<configured-model> .venv/bin/python eval/run_eval.py --mode api
```

Set the API key securely in the environment; do not place it in commands, reports or version control. The run transmits only fictional evaluation data to the configured provider. Some sensitive/unsupported questions are intercepted before a model call, so mode labels alone do not prove a provider executed; inspect actual token/provider tests and record successful nonempty model-backed cases separately.

## Limitations and next evidence

- This is a small English, hand-authored test set; scores are not deployment accuracy, false-positive rates or customer outcomes.
- Rules and whole-source extraction are conservative. They can refuse valid answers and still miss nuanced contradictions or instructions.
- Broader topic vocabulary, temporal/currentness checks, multilingual questions and large authentic question sets remain untested.
- All responses require human review; this evaluation does not exercise approval endpoints or ATS submission. Backend, workflow and E2E suites own those boundaries.
- After remediation, rerun the unchanged dataset and retain both initial and final outputs. Add new holdout cases before making broader reliability claims.
- A meaningful LLM comparison needs a held-out question set, a stronger rules baseline, human adequacy judgments, latency, token usage and abstention tradeoffs. The present result cannot justify choosing an LLM over the deterministic demo.

## Direct verification probes

`eval/VERIFICATION_CASES.json` adds eight separately counted direct verifier probes: valid full extraction, fabricated source ID, foreign candidate source, extra unsupported sentence, paraphrase mismatch, removed negation, empty claims and malformed claims. Initial result: **8/8 matched the expected validity decision**. These probes test structural/extractive guards, not semantic truth. They are not added to the 35-question denominator.

Passing the same cases after remediation is a **regression result on a known set**, not independent evidence of generalization. Development agents received the failed case IDs and rationales to fix them. A later untouched holdout is needed before comparing model or retrieval strategies.

## Specialist handoff

**Decision:** Preserve strict independent labels and report the eight initial failures rather than broadening `supported` to mean any topically related quotation. **Artifacts:** dataset, direct probes, executable runner, initial snapshot and this report. **Verification:** deterministic first run and direct probes executed locally; evaluator lint and format checked. **Risk:** broader semantic coverage remains unresolved even if the enumerated regressions are fixed. **Architect approval requested:** treat any remaining incorrect `supported` verdict as a reliability defect; do not describe the API gate as complete without credentials and an observed provider response.
