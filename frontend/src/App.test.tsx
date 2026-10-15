import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import App from "./App";
import { WorkflowProgress } from "./WorkspaceVisuals";
import type { Application } from "./types";
let app: Application;
const evidence = {
  id: "e-rest",
  candidate_id: "c-demo",
  kind: "profile" as const,
  topic: "rest",
  text: "I built a REST API.",
  context: "REST experience",
};
beforeEach(() => {
  app = {
    id: "a-rest",
    candidate_id: "c-demo",
    company: "Fictional Lab",
    role: "Developer",
    question: "Describe your REST experience.",
    question_kind: "technical",
    state: "interrupted",
    revision: 0,
    evidence: [evidence],
    draft: null,
    approved_answer: null,
    receipt: null,
    scenario: "normal",
  };
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
    fn(0);
    return 0;
  });
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string, options?: RequestInit) => {
      if (input.endsWith("/session"))
        return Response.json({ csrf_token: "test-csrf" });
      if (input.endsWith("/health"))
        return Response.json({ status: "ok", mode: "deterministic" });
      if (input.endsWith("/events")) return Response.json({ events: [] });
      if (input.endsWith("/answers")) return Response.json({ answers: [] });
      if (input.endsWith("/resolve")) {
        app = {
          ...app,
          state: "awaiting_review",
          revision: 2,
          draft: {
            answer: "I built a REST API.",
            claims: [
              {
                text: evidence.text,
                source_id: evidence.id,
                quote: evidence.text,
              },
            ],
            missing_information: [],
            requires_confirmation: false,
            verdict: "supported",
            mode: "deterministic",
            latency_ms: 1,
            tokens: null,
            warnings: [],
          },
        };
        return Response.json(app);
      }
      if (input.endsWith("/approve")) {
        const body = JSON.parse(String(options?.body));
        app = {
          ...app,
          state: "approved",
          approved_answer: body.answer,
          revision: 3,
        };
        return Response.json(app);
      }
      if (input.endsWith("/resume")) {
        app = { ...app, state: "verification_required", revision: 5 };
        return Response.json(app);
      }
      return Response.json({ applications: [app] });
    }),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("recovery review boundaries", () => {
  it("keeps approval, reuse consent and mock submission separate", async () => {
    render(<App />);
    fireEvent.click(
      await screen.findByRole("button", { name: /Fictional Lab/ }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Generate evidence draft" }),
    );
    await screen.findByRole("button", { name: "Approve answer" });
    expect(
      screen.getByRole("checkbox", { name: /Save this approved answer/ }),
    ).not.toBeChecked();
    expect(
      screen.queryByRole("button", { name: "Resume mock application" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Approve answer" }));
    await screen.findByRole("button", { name: "Resume mock application" });
    expect(screen.getByLabelText("Approved answer")).toHaveAttribute(
      "readonly",
    );
    const fetchMock = vi.mocked(fetch);
    const approval = fetchMock.mock.calls.find(([path]) =>
      String(path).endsWith("/approve"),
    );
    expect(JSON.parse(String(approval?.[1]?.body))).toMatchObject({
      consent_save: false,
      confirm_sensitive: false,
      revision: 2,
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Resume mock application" }),
    );
    await screen.findByRole("button", { name: "Check submission status" });
    expect(
      screen.queryByRole("button", { name: "Resume mock application" }),
    ).not.toBeInTheDocument();
  });
  it("requires explicit confirmation for a human-supplied sensitive answer", async () => {
    app = {
      ...app,
      question_kind: "authorization",
      state: "awaiting_review",
      draft: {
        answer: "",
        claims: [],
        missing_information: ["Your confirmation"],
        requires_confirmation: true,
        verdict: "sensitive",
        mode: "deterministic",
        latency_ms: 1,
        tokens: null,
        warnings: [],
      },
    };
    render(<App />);
    fireEvent.click(
      await screen.findByRole("button", { name: /Fictional Lab/ }),
    );
    fireEvent.change(screen.getByLabelText("Answer for your review"), {
      target: { value: "Fictional confirmed answer" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Approve answer" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Confirm that your information is accurate",
    );
    expect(
      vi
        .mocked(fetch)
        .mock.calls.some(([path]) => String(path).endsWith("/approve")),
    ).toBe(false);
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "I confirm this information is accurate.",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Approve answer" }));
    await screen.findByRole("button", { name: "Resume mock application" });
  });
  it("does not make missing technical evidence look approvable", async () => {
    app = {
      ...app,
      state: "awaiting_review",
      draft: {
        answer: "",
        claims: [],
        missing_information: ["Cloud deployment evidence"],
        requires_confirmation: false,
        verdict: "needs_information",
        mode: "deterministic",
        latency_ms: 1,
        tokens: null,
        warnings: [],
      },
    };
    render(<App />);
    fireEvent.click(
      await screen.findByRole("button", { name: /Fictional Lab/ }),
    );
    expect(
      screen.getByRole("button", { name: "Approve answer" }),
    ).toBeDisabled();
    expect(screen.getByLabelText("Answer for your review")).toHaveAttribute(
      "readonly",
    );
    expect(
      screen.getByText(
        /absence of evidence does not mean absence of experience/,
      ),
    ).toBeVisible();
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Review the blocking question" }),
      ).toHaveFocus(),
    );
  });
  it("offers recovery for persisted processing states without implying success", async () => {
    app = { ...app, state: "resolving" };
    render(<App />);
    fireEvent.click(
      await screen.findByRole("button", { name: /Fictional Lab/ }),
    );
    expect(
      screen.getByRole("button", { name: "Refresh application state" }),
    ).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Retry draft" }));
    await screen.findByRole("button", { name: "Approve answer" });
    cleanup();
    app = {
      ...app,
      state: "submitting",
      approved_answer: "I built a REST API.",
    };
    render(<App />);
    fireEvent.click(
      await screen.findByRole("button", { name: /Fictional Lab/ }),
    );
    expect(
      screen.getByRole("button", { name: "Check submission status" }),
    ).toBeEnabled();
    expect(
      screen.queryByRole("button", { name: "Resume mock application" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Submitted to the mock ATS" }),
    ).not.toBeInTheDocument();
  });
});

describe("truthful workflow presentation", () => {
  it("does not present missing evidence as a completed supported result", () => {
    render(
      <WorkflowProgress
        state="awaiting_review"
        busy={false}
        verdict="unsupported"
      />,
    );
    const progress = screen.getByRole("list", {
      name: "Application recovery progress",
    });
    expect(progress.querySelector("li")).toHaveTextContent("Missing evidence");
    expect(progress.querySelector("li")).not.toHaveClass("complete");
    expect(progress.querySelector('[aria-current="step"]')).toHaveTextContent(
      "Your review",
    );
  });
  it("keeps uncertain submissions at the submission step without implying completion", () => {
    render(<WorkflowProgress state="verification_required" busy={false} />);
    const progress = screen.getByRole("list", {
      name: "Application recovery progress",
    });
    expect(progress.querySelector('[aria-current="step"]')).toHaveTextContent(
      "Mock submission",
    );
    expect(progress.querySelectorAll(".complete")).toHaveLength(2);
  });
  it("marks all steps complete only after submitted state", () => {
    render(<WorkflowProgress state="submitted" busy={false} />);
    const progress = screen.getByRole("list", {
      name: "Application recovery progress",
    });
    expect(progress.querySelector('[aria-current="step"]')).toBeNull();
    expect(progress.querySelectorAll(".complete")).toHaveLength(3);
  });
});

describe("session navigation and theme", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
    localStorage.clear();
  });
  it("keeps edits in memory across A-B-A and resets consent when text changes", async () => {
    app = {
      ...app,
      state: "awaiting_review",
      draft: {
        answer: evidence.text,
        claims: [],
        missing_information: [],
        requires_confirmation: false,
        verdict: "supported",
        mode: "deterministic",
        latency_ms: 1,
        tokens: null,
        warnings: [],
      },
    };
    const second = { ...app, id: "a-other", company: "Other Company" };
    const original = vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockImplementation(async (input, options) =>
      String(input).endsWith("/applications")
        ? Response.json({ applications: [app, second] })
        : original(input, options),
    );
    render(<App />);
    fireEvent.click(
      await screen.findByRole("button", { name: /Fictional Lab/ }),
    );
    fireEvent.click(
      screen.getByRole("checkbox", { name: /Save this approved answer/ }),
    );
    fireEvent.change(screen.getByLabelText("Answer for your review"), {
      target: { value: "My local edit" },
    });
    expect(
      screen.getByRole("checkbox", { name: /Save this approved answer/ }),
    ).not.toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: /Other Company/ }));
    fireEvent.click(screen.getByRole("button", { name: /Fictional Lab/ }));
    expect(screen.getByLabelText("Answer for your review")).toHaveValue(
      "My local edit",
    );
    expect(window.location.search).toBe("?application=a-rest");
    expect(Object.values(localStorage)).not.toContain("My local edit");
  });
  it("restores allowlisted selection and exposes theme state", async () => {
    window.history.replaceState(null, "", "/?application=a-rest");
    render(<App />);
    await screen.findByRole("heading", {
      name: "Review the blocking question",
    });
    const button = screen.getByRole("button", { name: "Dark theme" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("bloom-rescue-theme")).toBe("dark");
  });
  it("does not report a successful approval as failed when history refresh fails", async () => {
    app = {
      ...app,
      state: "awaiting_review",
      draft: {
        answer: evidence.text,
        claims: [],
        missing_information: [],
        requires_confirmation: false,
        verdict: "supported",
        mode: "deterministic",
        latency_ms: 1,
        tokens: null,
        warnings: [],
      },
    };
    const original = vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockImplementation(async (input, options) =>
      String(input).endsWith("/events") && app.state === "approved"
        ? Response.json({ detail: "History unavailable" }, { status: 500 })
        : original(input, options),
    );
    render(<App />);
    fireEvent.click(
      await screen.findByRole("button", { name: /Fictional Lab/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Approve answer" }));
    await screen.findByRole("button", { name: "Resume mock application" });
    await screen.findByText(/Your action succeeded/);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Approved answer")).toHaveAttribute(
      "aria-invalid",
      "false",
    );
  });
});
