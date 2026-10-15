"""Validated public API contracts for the fictional demo."""

from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Evidence(StrictModel):
    id: str
    candidate_id: str
    kind: Literal["profile", "approved_answer"]
    topic: str
    text: str
    context: str


class Claim(StrictModel):
    text: str
    source_id: str
    quote: str


class Resolution(StrictModel):
    answer: str
    claims: list[Claim]
    missing_information: list[str]
    requires_confirmation: bool
    verdict: Literal["supported", "needs_information", "sensitive", "unsupported"]
    mode: Literal["deterministic", "api"]
    latency_ms: float
    tokens: int | None
    warnings: list[str]


class Application(StrictModel):
    id: str
    candidate_id: str
    company: str
    role: str
    question: str
    question_kind: str
    state: Literal[
        "interrupted",
        "resolving",
        "awaiting_review",
        "approved",
        "submitting",
        "submitted",
        "failed",
        "verification_required",
    ]
    revision: int
    evidence: list[Evidence]
    draft: Resolution | None
    approved_answer: str | None
    receipt: dict | None
    scenario: Literal["normal", "ambiguous_timeout"]


class EmptyRequest(StrictModel):
    pass


class ApprovalRequest(StrictModel):
    revision: int = Field(ge=0)
    answer: str = Field(min_length=1, max_length=5000)
    consent_save: bool = False
    confirm_sensitive: bool = False


class ResumeRequest(StrictModel):
    revision: int = Field(ge=0)
    idempotency_key: str = Field(min_length=1, max_length=200)
