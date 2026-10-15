# Final council: AI Engineering Lead

## Review scope and independence

This is the AI Engineering Lead's separate role assessment of the current `backend/app/ai.py`, evaluation artifacts and implementation review. This agent previously implemented the AI module; it is therefore **not an independent audit of its own code**. The separate evaluation specialist and staff reviewer provide independent checks. No other final council role's conclusions were read before this assessment.

## Assessment

**Readiness: 6/10 for a bounded, fictional local engineering demonstration.** This score does not authorize production use and does not close the live-model release gate. The workflow demonstrates useful separation between probabilistic selection and deterministic approval, provenance and submission rules. The unexecuted provider path and limited answer-adequacy checks prevent a stronger assessment.

Preserve explicit human review, no fabricated sensitive values, server-composed full-source extraction, schema validation, no fallback pretending a failed API call succeeded, and the honest deterministic/API distinction.

## Three most important weaknesses

| Priority | Weakness and actual evidence | Concrete next improvement |
|---|---|---|
| Incomplete release gate | No actual provider call has been demonstrated. HTTP doubles exercise the request/response contract but cannot establish that a configured model accepts the schema, selects useful evidence, or meets latency/cost expectations. | Run a credentialed fictional-data smoke test, record model/version, successful structured response, token usage, latency and safe failure behavior. Run the same held-out cases through deterministic and API modes, recording which cases actually invoke the provider. |
| P2 answer adequacy | `verify_answer` establishes extraction/provenance, not entailment, completeness, source truth or currentness. `_missing_requirements` recognizes only enumerated topics and qualifiers. Two new exploratory probes below returned `supported` for questions whose extra requirements were absent from the evidence. No unsupported experience was added, but the verdict overstates coverage. | Rename the user-facing concept to “evidence-backed excerpt; review completeness,” or reserve an adequacy verdict for explicitly supported question templates. Add a separate coverage/uncertainty result and benchmark unknown qualifiers. Do not solve this by simply expanding a phrase list and claiming completeness. |
| Evidence and model-value gap | Frozen-set results improved from 27/35 to 35/35 after developers saw failures. Only six final outputs are nonempty; the weak first-source baseline is intentionally inadequate. This measures regression repair, not held-out reliability or the incremental value of an LLM. | Freeze an untouched set spanning paraphrases, multi-topic requests, quantitative requirements and temporal conflicts. Compare a reasonable deterministic baseline with API selection using blinded human adequacy labels, abstention/coverage, review time, latency and cost. Keep the simpler approach unless measured benefits justify the model. |

## Additional probes performed for this review

Command: `PYTHONPATH=backend .venv/bin/python` importing `resolve_question`, explicitly using deterministic mode. Both questions received the same fictional source:

> I built REST API endpoints for a classroom exercise.

Metadata: `candidate_id=c-demo`, `kind=profile`, `topic=REST API`, `context=classroom REST API project`.

| Question | Actual verdict and response | Interpretation |
|---|---|---|
| Describe your REST API experience handling 10,000 requests per second. | `supported`; quoted the classroom sentence verbatim. | Source does not establish the requested throughput. This is answer-adequacy overstatement, not fabricated quoted content. |
| Describe your REST API experience implementing encryption at rest. | `supported`; quoted the classroom sentence verbatim. | Source does not establish encryption work. Keyword overlap is insufficient. |

These two exploratory probes were not added to or hidden inside the frozen 35-case score. They expose a known boundary and should become labeled regressions for a subsequent iteration. They are not a representative accuracy estimate.

## Strongest counterargument

For this five-scenario demo, an intentionally extractive system with visible uncertainty and mandatory human approval may be the appropriate engineering tradeoff. General semantic answer assessment would add complexity and another uncertain model judgment. This supports the architecture's restraint, but it does not justify describing every `supported` draft as complete or establishing a model's value without running one.

## Missing evidence and decision

Missing: successful real-provider execution, model-selection comparison, untouched holdout results, authentic task corpus, human review-time measurements, source-currentness behavior and reliable multilingual coverage.

**Recommendation:** Demonstrate the deterministic recovery workflow and explain its constraints. Describe API integration as implemented but not live-validated. Do not claim that the LLM improves results over rules, that the extractor verifies truth, or that all requested release gates have passed. Address the verdict/coverage wording before presenting broad question-answering capability.
