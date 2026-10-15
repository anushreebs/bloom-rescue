from concurrent.futures import ThreadPoolExecutor

import pytest

from app.ats import AmbiguousSubmissionError, MockATS
from app.workflow import is_sensitive, transition


def test_complete_reviewed_workflow():
    state = "interrupted"
    for event in ["resolve_start", "resolve_success", "approve", "submit_start", "submit_success"]:
        state = transition(state, event)
    assert state == "submitted"


def test_timeout_requires_verification():
    assert transition("submitting", "submit_timeout") == "verification_required"
    assert transition("verification_required", "reconcile_pending") == "verification_required"
    assert transition("verification_required", "reconcile_success") == "submitted"


@pytest.mark.parametrize(
    "state,event",
    [
        ("interrupted", "approve"),
        ("awaiting_review", "submit_start"),
        ("submitted", "submit_start"),
        ("verification_required", "submit_start"),
        ("approved", "resolve_start"),
        ("unknown", "resolve_start"),
        ("resolving", "approve"),
        ("failed", "approve"),
    ],
)
def test_illegal_transition_rejected(state, event):
    with pytest.raises(ValueError, match="Illegal workflow"):
        transition(state, event)


def test_failed_resolution_can_retry():
    assert transition("resolving", "resolve_error") == "failed"
    assert transition("failed", "resolve_start") == "resolving"


@pytest.mark.parametrize(
    "kind", ["authorization", "compensation", "eligibility", " AUTHORIZATION "]
)
def test_sensitive_kinds(kind):
    assert is_sensitive(kind)


def test_technical_not_sensitive():
    assert not is_sensitive("technical")


def test_acceptance_survives_restart_and_new_keys(tmp_path):
    path = str(tmp_path / "ats.db")
    first = MockATS(path).submit("a1", "Verified answer", "key1")
    assert MockATS(path).status("a1", "key2") == first
    assert MockATS(path).submit("a1", "Verified answer", "key3") == first
    assert first["submission_count"] == 1


def test_ambiguous_timeout_persists_and_reconciles(tmp_path):
    path = str(tmp_path / "ats.db")
    with pytest.raises(AmbiguousSubmissionError):
        MockATS(path).submit("a1", "answer", "key1", "ambiguous_timeout")
    reconciled = MockATS(path).status("a1", "key2")
    assert reconciled is not None
    assert reconciled["status"] == "submitted"
    assert MockATS(path).submit("a1", "answer", "key3", "ambiguous_timeout") == reconciled


def test_concurrent_retries_have_one_receipt(tmp_path):
    adapter = MockATS(str(tmp_path / "ats.db"))
    with ThreadPoolExecutor(max_workers=8) as pool:
        receipts = list(pool.map(lambda i: adapter.submit("a1", "answer", f"key-{i}"), range(16)))
    assert len({receipt["receipt_id"] for receipt in receipts}) == 1


def test_answer_replacement_rejected_after_acceptance(tmp_path):
    adapter = MockATS(str(tmp_path / "ats.db"))
    first = adapter.submit("a1", "answer", "key1")
    with pytest.raises(ValueError, match="different answer"):
        adapter.submit("a1", "changed answer", "key2")
    assert adapter.status("a1", "key2") == first


def test_unknown_application_has_no_receipt(tmp_path):
    assert MockATS(str(tmp_path / "ats.db")).status("unknown", "key") is None


def test_invalid_request_never_accepts(tmp_path):
    adapter = MockATS(str(tmp_path / "ats.db"))
    with pytest.raises(ValueError):
        adapter.submit("a1", "", "key")
    with pytest.raises(ValueError):
        adapter.submit("a1", "answer", "key", "unknown")
    assert adapter.status("a1", "key") is None
