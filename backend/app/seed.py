"""Entirely fictional seed data; never import a real candidate profile."""

EVIDENCE = [
    {
        "id": "e-rest",
        "candidate_id": "c-demo",
        "kind": "profile",
        "topic": "rest",
        "text": "I built and integrated REST APIs using Python and TypeScript.",
        "context": "REST API development experience",
    },
    {
        "id": "e-tests",
        "candidate_id": "c-demo",
        "kind": "profile",
        "topic": "testing",
        "text": "I wrote unit and integration tests for API request handling.",
        "context": "Software testing experience",
    },
    {
        "id": "e-approved-rest",
        "candidate_id": "c-demo",
        "kind": "approved_answer",
        "topic": "rest",
        "text": "I built and integrated REST APIs using Python and TypeScript.",
        "context": "REST API development experience",
    },
]
APPLICATIONS = [
    (
        "a-rest",
        "Fable Labs",
        "Software Intern",
        "Describe your REST API development experience.",
        "technical",
        "normal",
    ),
    (
        "a-cloud",
        "Paper Orbit",
        "Cloud Intern",
        "Describe your AWS cloud deployment experience.",
        "technical",
        "normal",
    ),
    (
        "a-auth",
        "Moss Studio",
        "Software Intern",
        "Are you authorized to work in the United States?",
        "authorization",
        "normal",
    ),
    (
        "a-reuse",
        "Copper Finch",
        "API Intern",
        "Describe your REST API development experience.",
        "technical",
        "normal",
    ),
    (
        "a-timeout",
        "Lantern Demo",
        "Software Intern",
        "Describe your REST API development experience.",
        "technical",
        "ambiguous_timeout",
    ),
]
