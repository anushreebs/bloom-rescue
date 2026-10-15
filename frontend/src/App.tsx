import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, request } from "./api";
import type { Application, AuditEvent, Evidence } from "./types";
import {
  WorkflowProgress,
  WorkspaceIllustration,
  SourceRail,
} from "./WorkspaceVisuals";
type EditorBuffer = { revision: number; text: string };
function selectedFromUrl() {
  return new URL(window.location.href).searchParams.get("application") ?? "";
}
function initialTheme(): "light" | "dark" {
  try {
    const stored = localStorage.getItem("bloom-rescue-theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* Storage is optional. Answers never enter storage. */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}
const labels: Record<string, string> = {
  interrupted: "Needs your review",
  resolving: "Preparing draft",
  awaiting_review: "Review required",
  approved: "Answer approved",
  submitting: "Sending to mock ATS",
  submitted: "Submitted to mock ATS",
  failed: "Could not prepare draft",
  verification_required: "Submission status uncertain",
};
export default function App() {
  const [apps, setApps] = useState<Application[]>([]),
    [selected, setSelected] = useState(""),
    [events, setEvents] = useState<AuditEvent[]>([]),
    [saved, setSaved] = useState<Evidence[]>([]);
  const [mode, setMode] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [answer, setAnswer] = useState(""),
    [consent, setConsent] = useState(false),
    [confirmed, setConfirmed] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [theme, setTheme] = useState(initialTheme);
  const [answerError, setAnswerError] = useState("");
  const [confirmationError, setConfirmationError] = useState("");
  const [historyWarning, setHistoryWarning] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [confirmedReceiptId, setConfirmedReceiptId] = useState("");
  const [operationId, setOperationId] = useState<string | null>(null);
  const buffers = useRef<Record<string, EditorBuffer>>({});
  const outcomeTitle = useRef<HTMLHeadingElement>(null);
  const pendingFocus = useRef<string | null>(null);
  const pendingOperation = useRef<{ id: string; company: string } | null>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const active = useRef("");
  const loadEvents = useCallback(async (id: string) => {
    if (active.current === id) setHistoryLoading(true);
    try {
      const data = await request<{ events: AuditEvent[] }>(
        `/applications/${id}/events`,
      );
      if (active.current === id) setEvents(data.events);
    } finally {
      if (active.current === id) setHistoryLoading(false);
    }
  }, []);
  const open = useCallback(
    (a: Application, push = true) => {
      active.current = a.id;
      setSelected(a.id);
      const buffer = buffers.current[a.id];
      setAnswer(
        a.approved_answer ??
          (buffer?.revision === a.revision ? buffer.text : a.draft?.answer) ??
          "",
      );
      if (buffer && buffer.revision !== a.revision)
        delete buffers.current[a.id];
      if (push) {
        const url = new URL(window.location.href);
        url.searchParams.set("application", a.id);
        if (url.href !== window.location.href)
          window.history.pushState(null, "", url);
      }
      setAnswerError("");
      setConfirmationError("");
      setHistoryWarning("");
      setConfirmedReceiptId("");
      pendingFocus.current = null;
      setConsent(false);
      setConfirmed(false);
      setError("");
      setNotice(
        pendingOperation.current
          ? `An update for ${pendingOperation.current.company} is still running. You can review this application while it finishes.`
          : "",
      );
      setEvents([]);
      void loadEvents(a.id).catch(() => {
        if (active.current === a.id)
          setHistoryWarning(
            "History could not load. The application state is still shown; refresh to retry history.",
          );
      });
    },
    [loadEvents],
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("bloom-rescue-theme", theme);
    } catch {
      /* Optional preference. */
    }
  }, [theme]);
  useEffect(() => {
    if (pendingFocus.current && !busy) {
      if (pendingFocus.current === active.current)
        outcomeTitle.current?.focus();
      pendingFocus.current = null;
    }
  }, [busy]);
  const app = apps.find((a) => a.id === selected);
  const appBusy = busy && operationId === app?.id;
  async function refresh() {
    const [list, answers, health] = await Promise.all([
      request<{ applications: Application[] }>("/applications"),
      request<{ answers: Evidence[] }>("/answers"),
      request<{ mode: string }>("/health"),
    ]);
    setApps(list.applications);
    setSaved(answers.answers);
    setMode(health.mode);
    return list.applications;
  }
  useEffect(() => {
    if (selected) title.current?.focus();
  }, [selected]);
  useEffect(() => {
    void Promise.resolve()
      .then(async () => {
        const list = await refresh();
        const requested = selectedFromUrl();
        const target = list.find((item) => item.id === requested);
        if (target) open(target, false);
        else if (requested) {
          const url = new URL(window.location.href);
          url.searchParams.delete("application");
          window.history.replaceState(null, "", url);
        }
      })
      .catch(() =>
        setError(
          "The recovery workspace could not load. Check the local API and try again.",
        ),
      )
      .finally(() => setLoading(false));
  }, [open]);
  useEffect(() => {
    function onPopState() {
      const target = apps.find((item) => item.id === selectedFromUrl());
      if (target) open(target, false);
      else {
        active.current = "";
        setSelected("");
        setEvents([]);
        setError("");
        setHistoryWarning("");
        pendingFocus.current = null;
        setNotice(
          pendingOperation.current
            ? `An update for ${pendingOperation.current.company} is still running.`
            : "",
        );
        const url = new URL(window.location.href);
        url.searchParams.delete("application");
        window.history.replaceState(null, "", url);
      }
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [apps, open]);
  function update(next: Application) {
    delete buffers.current[next.id];
    setApps((previous) => previous.map((a) => (a.id === next.id ? next : a)));
    if (active.current === next.id)
      setAnswer(next.approved_answer ?? next.draft?.answer ?? "");
  }
  async function act(action: "resolve" | "approve" | "resume") {
    if (!app || busy) return;
    if (action === "approve" && (!answer.trim() || (sensitive && !confirmed))) {
      setAnswerError(!answer.trim() ? "Enter an answer before approving." : "");
      setConfirmationError(
        sensitive && !confirmed
          ? "Confirm that your information is accurate before approving."
          : "",
      );
      setError(
        !answer.trim()
          ? "Enter an answer before approving."
          : "Confirm that your information is accurate before approving.",
      );
      return;
    }
    const id = app.id;
    pendingOperation.current = { id, company: app.company };
    setOperationId(id);
    setBusy(true);
    setError("");
    setAnswerError("");
    setConfirmationError("");
    setHistoryWarning("");
    setNotice(
      action === "resolve"
        ? "Generating an evidence draft…"
        : action === "approve"
          ? "Checking your answer…"
          : "Checking mock application status…",
    );
    const body =
      action === "approve"
        ? {
            revision: app.revision,
            answer,
            consent_save: consent,
            confirm_sensitive: confirmed,
          }
        : action === "resume"
          ? {
              revision: app.revision,
              idempotency_key: `rescue-${app.id}-${app.revision}`,
            }
          : {};
    try {
      const next = await request<Application>(`/applications/${id}/${action}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      update(next);
      if (
        active.current === id &&
        (action === "approve" || next.state === "submitted")
      )
        pendingFocus.current = id;
      if (
        active.current === id &&
        next.state === "submitted" &&
        app.state !== "submitted"
      )
        setConfirmedReceiptId(next.id);
      setNotice(
        active.current !== id
          ? `Update finished for ${app.company}. Select its card to review the saved state.`
          : next.state === "verification_required"
            ? "Submission status is uncertain. Check status before retrying."
            : action === "resolve"
              ? next.draft?.verdict === "supported"
                ? "Draft ready for review."
                : next.draft?.verdict === "sensitive"
                  ? "Your information and explicit confirmation are needed. No personal answer was inferred."
                  : "Evidence check finished. More information is needed; no supported answer is ready."
              : action === "approve"
                ? "Answer approved. Submission is a separate action."
                : "Submitted to the mock ATS.",
      );
      const supplemental = await Promise.allSettled([
        loadEvents(id),
        request<{ answers: Evidence[] }>("/answers").then((r) =>
          setSaved(r.answers),
        ),
      ]);
      if (
        supplemental.some((result) => result.status === "rejected") &&
        active.current === id
      )
        setHistoryWarning(
          "Your action succeeded. History or saved permissions could not refresh; refresh to retry those details.",
        );
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "The operation could not finish.";
      if (
        active.current === id &&
        action === "approve" &&
        e instanceof ApiError &&
        e.status === 422
      )
        setAnswerError(message);
      if (active.current === id)
        setError(
          e instanceof ApiError && e.status === 409
            ? `${message} The current application state has been reloaded; review it before trying again.`
            : message,
        );
      else
        setNotice(
          `The update for ${app.company} could not be confirmed. Select its card to check the current state.`,
        );
      try {
        const current = await request<{ applications: Application[] }>(
          "/applications",
        );
        const latest = current.applications.find((item) => item.id === id);
        if (latest && latest.revision !== app.revision) {
          delete buffers.current[id];
          if (active.current === id) {
            setConsent(false);
            setConfirmed(false);
            setAnswer(latest.approved_answer ?? latest.draft?.answer ?? "");
          }
        }
        setApps(current.applications);
        try {
          await loadEvents(id);
        } catch {
          if (active.current === id)
            setHistoryWarning(
              "Current state reloaded, but history could not refresh.",
            );
        }
      } catch {
        if (active.current === id)
          setError(
            `${message} Current status could not be refreshed. Do not assume submission failed.`,
          );
      }
      if (active.current === id) setNotice("");
    } finally {
      pendingOperation.current = null;
      setOperationId(null);
      setBusy(false);
    }
  }
  async function refreshCurrent() {
    if (!app || busy) return;
    const id = app.id;
    pendingOperation.current = { id, company: app.company };
    setOperationId(id);
    setBusy(true);
    setError("");
    try {
      const list = await request<{ applications: Application[] }>(
        "/applications",
      );
      const next = list.applications.find((item) => item.id === app.id);
      if (next && next.revision !== app.revision) {
        delete buffers.current[app.id];
        if (active.current === id) {
          setConsent(false);
          setConfirmed(false);
          setAnswer(next.approved_answer ?? next.draft?.answer ?? "");
          setAnswerError("");
          setConfirmationError("");
        }
      }
      setApps(list.applications);
      try {
        await loadEvents(app.id);
      } catch {
        if (active.current === id)
          setHistoryWarning(
            "Application state refreshed, but history could not load.",
          );
      }
      if (active.current === id)
        setNotice(
          "Application state refreshed. Review its current status before another action.",
        );
    } catch (e) {
      if (active.current === id)
        setError(
          e instanceof Error
            ? e.message
            : "Could not refresh the application state.",
        );
    } finally {
      if (active.current !== id)
        setNotice(
          `The status request for ${app.company} has finished. Select its card to review the current state.`,
        );
      pendingOperation.current = null;
      setOperationId(null);
      setBusy(false);
    }
  }
  async function revoke(id: string) {
    setBusy(true);
    setError("");
    try {
      await request(`/answers/${id}`, { method: "DELETE" });
      setSaved((current) => current.filter((entry) => entry.id !== id));
      setNotice(
        "Reuse permission revoked. Existing approvals and mock receipts remain unchanged.",
      );
      try {
        const result = await request<{ answers: Evidence[] }>("/answers");
        setSaved(result.answers);
      } catch {
        setHistoryWarning(
          "Reuse permission was revoked, but the saved-permission list could not refresh.",
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not revoke permission.");
    } finally {
      setBusy(false);
    }
  }
  const sensitive =
    app?.draft?.verdict === "sensitive" ||
    ["authorization", "compensation"].includes(app?.question_kind ?? "");
  const unsupported =
    app?.draft?.verdict === "unsupported" ||
    app?.draft?.verdict === "needs_information";
  const locked = app
    ? ["approved", "submitting", "submitted", "verification_required"].includes(
        app.state,
      )
    : false;
  return (
    <>
      <a className="skip" href="#main">
        Skip to recovery workspace
      </a>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            ✳
          </span>
          <span>
            Bloom Rescue<small>Independent fictional demo</small>
          </span>
        </div>
        <div className="topbar-actions">
          <span className="mode">
            {mode === "api"
              ? "Live model API mode"
              : mode === "deterministic"
                ? "Deterministic evidence mode"
                : "Connecting to local API"}
          </span>
          <button
            className="theme-toggle"
            aria-label="Dark theme"
            aria-pressed={theme === "dark"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </header>
      <main id="main">
        <section className="intro">
          <p className="eyebrow">YOUR APPLICATION WORKSPACE</p>
          <h1>Keep good applications moving.</h1>
          <p>
            Resolve the question. Review the evidence. Decide what happens next.
          </p>
          <p className="boundary">
            Fictional candidate and companies · mock ATS only · no real
            applications sent. This concept does not establish that Bloom’s
            existing recovery workflow is missing or broken.
          </p>
        </section>
        <div
          className={`feedback ${notice ? "has-notice" : ""}`}
          role="status"
          aria-live="polite"
        >
          {busy && <span className="activity-spinner" aria-hidden="true" />}
          {notice}
        </div>
        {error && (
          <div className="error" role="alert">
            {error}
            {!apps.length && (
              <button
                onClick={() => {
                  setLoading(true);
                  setError("");
                  void refresh()
                    .catch(() => setError("Local API still unavailable."))
                    .finally(() => setLoading(false));
                }}
              >
                Retry loading
              </button>
            )}
          </div>
        )}
        <div className="workspace">
          <aside className="queue" aria-label="Recovery queue">
            <div className="section-heading">
              <h2>Recovery queue</h2>
              <span className="count">{apps.length}</span>
            </div>
            <p className="muted queue-description">
              Pick up where the application paused.
            </p>
            <div className="queue-summary">
              <span>
                <b>{apps.filter((a) => a.state !== "submitted").length}</b> open
              </span>
              <span>
                <b>{apps.filter((a) => a.state === "submitted").length}</b>{" "}
                submitted
              </span>
            </div>
            {loading ? (
              <div className="queue-loading" role="status">
                <span className="sr-only">Loading fictional applications…</span>
                {[0, 1, 2, 3, 4].map((index) => (
                  <div
                    className="queue-skeleton"
                    key={index}
                    aria-hidden="true"
                  >
                    <span />
                    <span />
                    <span />
                  </div>
                ))}
              </div>
            ) : apps.length === 0 ? (
              <p>No fictional applications in this queue.</p>
            ) : (
              <>
                <p className="queue-scroll-hint">
                  Scroll to choose another application →
                </p>
                <ul className="application-list">
                  {apps.map((a, index) => (
                    <li
                      key={a.id}
                      style={{ animationDelay: `${index * 35}ms` }}
                    >
                      <button
                        className={`queue-card ${a.id === selected ? "selected" : ""}`}
                        onClick={() => open(a)}
                        aria-current={a.id === selected ? "true" : undefined}
                        disabled={busy}
                      >
                        <span className="card-top">
                          <span className="company-symbol" aria-hidden="true">
                            {a.company
                              .split(" ")
                              .map((word) => word[0])
                              .slice(0, 2)
                              .join("")}
                          </span>
                          <span className="company">
                            {a.company}
                            <span className="role">{a.role}</span>
                          </span>
                        </span>
                        <span className="question-preview">{a.question}</span>
                        <span className={`badge ${a.state}`}>
                          {labels[a.state] ?? a.state}
                        </span>
                        <span className="open-label">
                          {a.state === "submitted"
                            ? "View mock receipt"
                            : a.state === "approved"
                              ? "Open to resume"
                              : [
                                    "submitting",
                                    "verification_required",
                                  ].includes(a.state)
                                ? "Open to check status"
                                : a.draft?.verdict === "sensitive"
                                  ? "Open to confirm information"
                                  : a.draft?.verdict === "unsupported" ||
                                      a.draft?.verdict === "needs_information"
                                    ? "Open missing information"
                                    : "Open application"}{" "}
                          <span aria-hidden="true">↗</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>
          <section
            className="review"
            aria-labelledby="review-title"
            aria-busy={appBusy}
          >
            {!app ? (
              <div className="welcome">
                <WorkspaceIllustration />
                <p className="eyebrow">YOU STAY IN CONTROL</p>
                <h2 id="review-title">
                  A little context. A confident next step.
                </h2>
                <p>
                  The draft cites fictional profile evidence. Approval, answer
                  reuse, and mock submission are separate decisions.
                </p>
                <ol className="steps">
                  <li>
                    <b>01</b> Inspect the evidence
                  </li>
                  <li>
                    <b>02</b> Review and approve
                  </li>
                  <li>
                    <b>03</b> Resume with a receipt
                  </li>
                </ol>
              </div>
            ) : (
              <>
                <div className="review-header">
                  <p className="eyebrow">
                    {app.company} / {app.role}
                  </p>
                  <h2 id="review-title" ref={title} tabIndex={-1}>
                    Review the blocking question
                  </h2>
                  <span className={`badge ${app.state}`}>
                    {labels[app.state] ?? app.state}
                  </span>
                </div>
                <div className="next-action">
                  <span className="eyebrow">NEXT ACTION</span>
                  <p>
                    {app.state === "submitted"
                      ? "Review your local mock receipt. No real application was sent."
                      : app.state === "approved"
                        ? "Your answer is approved. Choose whether to resume the mock application."
                        : ["submitting", "verification_required"].includes(
                              app.state,
                            )
                          ? "Check submission status before attempting another submission."
                          : sensitive
                            ? "Supply fictional information and explicitly confirm it before approval."
                            : unsupported
                              ? "More verified evidence is needed. This technical answer cannot be approved yet."
                              : app.state === "awaiting_review"
                                ? "Compare the draft with its sources, then approve the answer."
                                : "Check available evidence to prepare a draft for your review."}
                  </p>
                </div>
                <WorkflowProgress
                  state={app.state}
                  busy={appBusy}
                  verdict={app.draft?.verdict}
                />
                <div className="review-task-intro">
                  <div className="question-block">
                    <span className="eyebrow">
                      EMPLOYER QUESTION · FICTIONAL
                    </span>
                    <p>{app.question}</p>
                  </div>
                  {["interrupted", "failed"].includes(app.state) && (
                    <div className="action-intro">
                      <p>
                        Start with the available evidence. Nothing will be
                        approved or submitted automatically.
                      </p>
                      <button
                        className="primary"
                        disabled={busy}
                        onClick={() => void act("resolve")}
                      >
                        {appBusy
                          ? "Preparing draft…"
                          : "Generate evidence draft"}
                      </button>
                    </div>
                  )}
                  {app.state === "resolving" && (
                    <div className="warning">
                      <h3>Draft preparation is still in progress</h3>
                      <p>
                        The process may have been interrupted. Refresh the
                        current state first. Retry draft becomes safe only after
                        the server’s two-minute processing lease expires; an
                        earlier retry will explain how long to wait.
                      </p>
                      <button
                        className="secondary"
                        disabled={busy}
                        onClick={() => void refreshCurrent()}
                      >
                        Refresh application state
                      </button>{" "}
                      <button
                        className="primary"
                        disabled={busy}
                        onClick={() => void act("resolve")}
                      >
                        Retry draft
                      </button>
                    </div>
                  )}
                </div>
                <div className="review-columns">
                  <SourceRail application={app} busy={appBusy} />
                  <div className="review-body" key={app.id}>
                    {app.draft && (
                      <>
                        <div className="section-heading">
                          <h3>Evidence &amp; draft</h3>
                          <span className="text-tag">
                            {app.draft.mode === "api"
                              ? "Model-selected excerpts"
                              : "Deterministic excerpts"}
                          </span>
                        </div>
                        <p className="muted">
                          Extractive verification checks quoted sources. It is
                          not general fact-checking.
                        </p>
                        {!!app.draft.missing_information.length && (
                          <div className="warning">
                            <h4>Missing information</h4>
                            <ul>
                              {app.draft.missing_information.map((m, i) => (
                                <li key={i}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {app.draft.warnings.map((w, i) => (
                          <p className="warning" key={i}>
                            {w}
                          </p>
                        ))}
                        {sensitive && (
                          <p className="sensitive">
                            Personal information needs your confirmation. No
                            authorization, eligibility, or salary answer has
                            been inferred.
                          </p>
                        )}
                        {unsupported && !sensitive && (
                          <p className="warning">
                            This demo cannot approve an unsupported technical
                            answer. Add verified evidence in a future profile
                            workflow; absence of evidence does not mean absence
                            of experience.
                          </p>
                        )}
                        <p
                          className={`provenance-state ${locked ? "approved" : answer !== app.draft.answer ? "edited" : "generated"}`}
                        >
                          {locked
                            ? "Approved payload · locked"
                            : answer !== app.draft.answer
                              ? "User-edited · not yet approved"
                              : sensitive
                                ? "Awaiting human input"
                                : "Generated excerpts · not yet approved"}
                          {!locked && answer !== app.draft.answer && (
                            <small className="unsaved-label">
                              {" "}
                              Session edits stay here when switching
                              applications; refreshing clears them.
                            </small>
                          )}
                        </p>
                        <label className="editor-label" htmlFor="answer">
                          {locked
                            ? "Approved answer"
                            : "Answer for your review"}
                        </label>
                        <textarea
                          id="answer"
                          value={answer}
                          onChange={(e) => {
                            setAnswer(e.target.value);
                            buffers.current[app.id] = {
                              revision: app.revision,
                              text: e.target.value,
                            };
                            setConsent(false);
                            setConfirmed(false);
                            setAnswerError("");
                            setConfirmationError("");
                            setError("");
                          }}
                          readOnly={locked || (unsupported && !sensitive)}
                          disabled={busy}
                          aria-describedby={`answer-help${answerError ? " answer-error" : ""}`}
                          aria-invalid={Boolean(answerError)}
                          rows={5}
                        />
                        {answerError && (
                          <p id="answer-error" className="field-error">
                            {answerError}
                          </p>
                        )}
                        <p id="answer-help" className="muted">
                          {locked
                            ? "This approved payload is locked. A separate re-review flow is outside this demo."
                            : sensitive
                              ? "Enter only fictional information you can explicitly confirm."
                              : "Technical text must match the supported excerpts. Unsupported edits are rejected on approval."}
                        </p>
                        {app.state === "awaiting_review" && (
                          <div className="approval">
                            <label className="check">
                              <input
                                type="checkbox"
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                                disabled={busy}
                              />
                              <span>
                                Save this approved answer for reuse in similar
                                questions.
                                <small>
                                  Optional. Context is checked, and permission
                                  can be revoked below.
                                </small>
                              </span>
                            </label>
                            {sensitive && (
                              <label className="check">
                                <input
                                  type="checkbox"
                                  checked={confirmed}
                                  aria-invalid={Boolean(confirmationError)}
                                  aria-describedby={
                                    confirmationError
                                      ? "confirmation-error"
                                      : undefined
                                  }
                                  onChange={(e) =>
                                    setConfirmed(e.target.checked)
                                  }
                                  disabled={busy}
                                />
                                <span>
                                  I confirm this information is accurate.
                                </span>
                              </label>
                            )}
                            {confirmationError && (
                              <p
                                id="confirmation-error"
                                className="field-error"
                              >
                                {confirmationError}
                              </p>
                            )}
                            <button
                              className="primary"
                              onClick={() => void act("approve")}
                              disabled={busy || (unsupported && !sensitive)}
                            >
                              Approve answer
                            </button>
                          </div>
                        )}
                      </>
                    )}
                    {app.state === "approved" && (
                      <div className="outcome">
                        <h3 ref={outcomeTitle} tabIndex={-1}>
                          Approved. Ready for your next decision.
                        </h3>
                        <p>
                          Only the approved answer will be sent to the fictional
                          mock ATS.
                        </p>
                        <button
                          className="primary"
                          disabled={busy}
                          onClick={() => void act("resume")}
                        >
                          Resume mock application
                        </button>
                      </div>
                    )}
                    {["verification_required", "submitting"].includes(
                      app.state,
                    ) && (
                      <div className="warning">
                        <h3>Check before retrying</h3>
                        <p>
                          The mock ATS may have accepted this application. A
                          status check reconciles its receipt before any further
                          submission.
                        </p>
                        <button
                          className="primary"
                          disabled={busy}
                          onClick={() => void act("resume")}
                        >
                          Check submission status
                        </button>
                      </div>
                    )}
                    {app.state === "submitted" && (
                      <div
                        className={`outcome success ${confirmedReceiptId === app.id ? "is-new-confirmation" : ""}`}
                      >
                        <svg
                          className="success-check"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <circle cx="24" cy="24" r="21" />
                          <path d="m14 24 7 7 13-14" />
                        </svg>
                        <h3 ref={outcomeTitle} tabIndex={-1}>
                          Submitted to the mock ATS
                        </h3>
                        <p>
                          This is a local demo receipt, not an employer
                          confirmation.
                        </p>
                        <dl>
                          {Object.entries(app.receipt ?? {}).map(
                            ([key, value]) => (
                              <div key={key}>
                                <dt>{key.replaceAll("_", " ")}</dt>
                                <dd>{String(value)}</dd>
                              </div>
                            ),
                          )}
                        </dl>
                      </div>
                    )}
                  </div>
                </div>
                <section className="history" aria-labelledby="history-title">
                  <h3 id="history-title">Activity history</h3>
                  {historyWarning && (
                    <p className="supplemental-warning" role="status">
                      {historyWarning}
                    </p>
                  )}
                  {events.length ? (
                    <ol>
                      {events.map((e) => (
                        <li key={e.id}>
                          <span className="event-dot" aria-hidden="true" />
                          <div>
                            <strong>{e.type.replaceAll("_", " ")}</strong>
                            <p>
                              {labels[e.from_state] ?? e.from_state} →{" "}
                              {labels[e.to_state] ?? e.to_state}
                            </p>
                            <time dateTime={e.created_at}>
                              {new Date(e.created_at).toLocaleString()}
                            </time>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="muted">
                      {historyLoading
                        ? "Loading activity history…"
                        : historyWarning
                          ? "Activity history is currently unavailable."
                          : "No recorded transitions yet."}
                    </p>
                  )}
                </section>
              </>
            )}
          </section>
        </div>
        <section className="saved" aria-labelledby="saved-title">
          <div className="section-heading">
            <h2 id="saved-title">Saved answer permissions</h2>
            <span className="text-tag">Explicit consent only</span>
          </div>
          <p className="muted">
            Revocation stops future reuse. Existing application approvals and
            mock receipts remain unchanged.
          </p>
          {saved.length ? (
            <ul>
              {saved.map((e) => (
                <li key={e.id}>
                  <div>
                    <h3>{e.topic}</h3>
                    <p>{e.text}</p>
                    <p className="muted">{e.context}</p>
                  </div>
                  <button
                    className="secondary"
                    disabled={busy}
                    onClick={() => void revoke(e.id)}
                  >
                    Revoke reuse permission
                    <span className="sr-only"> for {e.id}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No answers currently have reuse permission.</p>
          )}
        </section>
        <footer className="page-footer">
          Built to make uncertainty visible. Independent concept · fictional
          data · human approval required.
        </footer>
      </main>
    </>
  );
}
