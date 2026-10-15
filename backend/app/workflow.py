"""Deterministic application state transitions, independent of model decisions."""

_TRANSITIONS: dict[tuple[str, str], str] = {
    ("interrupted", "resolve_start"): "resolving",
    ("awaiting_review", "resolve_start"): "resolving",
    ("failed", "resolve_start"): "resolving",
    ("resolving", "resolve_success"): "awaiting_review",
    ("resolving", "resolve_error"): "failed",
    ("awaiting_review", "approve"): "approved",
    ("approved", "submit_start"): "submitting",
    ("submitting", "submit_success"): "submitted",
    ("submitting", "submit_timeout"): "verification_required",
    ("verification_required", "reconcile_success"): "submitted",
    ("verification_required", "reconcile_pending"): "verification_required",
}


def transition(state: str, event: str) -> str:
    """Reject illegal transitions; terminal submissions cannot be replayed."""
    try:
        return _TRANSITIONS[(state, event)]
    except KeyError:
        raise ValueError(f"Illegal workflow transition: {state} / {event}") from None


def is_sensitive(question_kind: str) -> bool:
    """Kinds requiring explicit human confirmation, never model inference."""
    return question_kind.strip().lower() in {
        "authorization",
        "compensation",
        "eligibility",
    }
