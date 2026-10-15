# Architecture

```mermaid
flowchart TD
  UI[React review workspace] --> API[FastAPI boundary]
  API --> DB[SQLite state and events]
  API --> AI[Retrieval and structured selection]
  AI --> Verify[Extractive provenance verifier]
  Verify --> UI
  UI --> Approve[Explicit approval]
  Approve --> ATS[Durable mock ATS]
  ATS --> DB
```

The optional configured model API selects evidence excerpts. Deterministic mode uses the same verification and review boundary without credentials. Neither mode submits automatically. Reviewers can inspect state transitions and a synthetic receipt; the receipt is not an employer acknowledgement.

See CONTRACTS.md for interfaces and ENGINEERING_DECISIONS.md for tradeoffs. Implementation-specific validation and limitations are recorded in the test, security, evaluation and performance reports.
