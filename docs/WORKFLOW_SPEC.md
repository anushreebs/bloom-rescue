# Workflow and recovery guarantees

`backend/app/workflow.py` defines legal transitions. Backend validation precedes transitions; every change increments a revision and records a safe event. Model work runs outside write transactions. Late results are discarded through revision checks.

Normal journey: interrupted → resolving → awaiting_review → approved → submitting → submitted. Provider errors enter failed and can retry. Approval is explicit; a model never approves or submits.

Timeout after mock acceptance: submitting → verification_required → submitted after authoritative status lookup. A changed client retry key cannot create another acceptance. The adapter's unique application ID and durable receipt survive process restart. Accepted answers cannot be silently replaced.

An expired resolving lease can retry after two minutes; the old request's revision cannot overwrite the new state. A persisted submitting state exposes Check submission status. If the local authoritative adapter reports no receipt, the backend may perform an idempotent submission; this is valid only because the mock store's negative status is authoritative and its uniqueness constraint guards races. A real ATS adapter must establish those guarantees separately.

Unknown technical information stops at review. Authorization answers must be human supplied and confirmed. Saving answers is optional consent; revocation removes future retrieval permission and does not retract already approved applications or receipts.

Tests: workflow transition and adapter tests, API approval/reconciliation tests, and `backend/tests/test_recovery.py` for restart windows before/after acceptance and expired resolution leases. No production ATS recovery guarantee is established.
