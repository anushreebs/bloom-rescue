"""Reproducible, independently labeled deterministic/API evaluation.

Run from the repository: .venv/bin/python eval/run_eval.py --mode deterministic
API mode explicitly transmits synthetic inputs to the configured provider.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
from app.ai import AIProviderError, resolve_question, retrieve_evidence, verify_answer  # noqa: E402 -- standalone runner adds backend package path


def evaluate(mode: str) -> dict:
    dataset = json.loads((ROOT / "eval/EVAL_DATASET.json").read_text())
    rows = []
    for case in dataset["cases"]:
        try:
            result = resolve_question(
                case["question"], case["evidence"], case["question_kind"], mode=mode
            )
            claims = result["claims"]
            source_ids_ok = all(c["source_id"] in case["allowed_source_ids"] for c in claims)
            scoped = retrieve_evidence(case["question"], case["evidence"], case["question_kind"])
            provenance_ok = (
                not result["answer"] or verify_answer(result["answer"], claims, scoped)[0]
            )
            verdict_ok = result["verdict"] in case["expected_verdicts"]
            review_ok = result["requires_confirmation"] is True
            mode_ok = result["mode"] == mode
            rows.append(
                {
                    "id": case["id"],
                    "category": case["category"],
                    "expected": case["expected_verdicts"],
                    "actual": result["verdict"],
                    "passed": all([source_ids_ok, provenance_ok, verdict_ok, review_ok, mode_ok]),
                    "verdict_ok": verdict_ok,
                    "source_ids_ok": source_ids_ok,
                    "provenance_ok": provenance_ok,
                    "review_ok": review_ok,
                    "mode_ok": mode_ok,
                    "answer": result["answer"],
                    "latency_ms": result["latency_ms"],
                    "tokens": result["tokens"],
                }
            )
        except AIProviderError as exc:
            rows.append(
                {
                    "id": case["id"],
                    "category": case["category"],
                    "passed": False,
                    "error": str(exc),
                }
            )
    # Deliberately weak reference: quote the first provided source regardless of
    # relevance/candidate/sensitivity. Exposes value of policy checks, not proof
    # of superiority to all simpler methods or production usefulness.
    baseline_pass = 0
    for case in dataset["cases"]:
        verdict = "supported" if case["evidence"] else "unsupported"
        source_ok = not case["evidence"] or case["evidence"][0]["id"] in case["allowed_source_ids"]
        baseline_pass += verdict in case["expected_verdicts"] and source_ok
    verification_dataset = json.loads((ROOT / "eval/VERIFICATION_CASES.json").read_text())
    verification_rows = []
    for case in verification_dataset["cases"]:
        valid, errors = verify_answer(
            case["answer"], case["claims"], verification_dataset["evidence"]
        )
        verification_rows.append(
            {
                "id": case["id"],
                "expected_valid": case["expected_valid"],
                "actual_valid": valid,
                "passed": valid == case["expected_valid"],
                "errors": errors,
            }
        )
    categories = {}
    for row in rows:
        cat = categories.setdefault(row["category"], {"passed": 0, "total": 0})
        cat["total"] += 1
        cat["passed"] += bool(row["passed"])
    return {
        "verification": {
            "passed": sum(r["passed"] for r in verification_rows),
            "total": len(verification_rows),
            "rows": verification_rows,
        },
        "mode": mode,
        "total": len(rows),
        "passed": sum(r["passed"] for r in rows),
        "categories": categories,
        "baseline": {
            "name": "first-source extractive baseline; no policy/relevance checks",
            "passed": baseline_pass,
            "total": len(rows),
        },
        "claim_bearing": sum(bool(r.get("answer")) for r in rows),
        "provenance_passed": sum(
            bool(r.get("answer")) and r.get("provenance_ok", False) for r in rows
        ),
        "review_passed": sum(r.get("review_ok", False) for r in rows),
        "rows": rows,
        "limitations": [
            "Hand-authored small adversarial set, not random or representative.",
            "Provenance is exact extraction, not truth or semantic relevance.",
            "Independent labels include specificity and contradiction challenges beyond the initial keyword implementation.",
            "All cases require review; no workflow submission is exercised here.",
            "API mode does not imply a provider call on sensitive/abstained questions.",
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["deterministic", "api"], default="deterministic")
    parser.add_argument("--output", default=None)
    args = parser.parse_args()
    report = evaluate(args.mode)
    output = Path(args.output) if args.output else ROOT / f"eval/results-{args.mode}.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({k: v for k, v in report.items() if k != "rows"}, indent=2))
    for row in report["rows"]:
        if not row["passed"]:
            print(
                "FAIL",
                row["id"],
                row.get("actual", row.get("error")),
                "expected",
                row.get("expected"),
            )
    return (
        0
        if report["passed"] == report["total"]
        and report["verification"]["passed"] == report["verification"]["total"]
        else 1
    )


if __name__ == "__main__":
    raise SystemExit(main())
