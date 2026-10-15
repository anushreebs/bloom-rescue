import type { Application } from "./types";
export function WorkflowProgress({
  state,
  busy,
  verdict,
}: {
  state: string;
  busy: boolean;
  verdict?: "supported" | "needs_information" | "sensitive" | "unsupported";
}) {
  const stage =
    state === "submitted"
      ? 3
      : ["approved", "submitting", "verification_required"].includes(state)
        ? 2
        : state === "awaiting_review"
          ? 1
          : 0;
  const needsInput =
    stage === 1 && verdict !== undefined && verdict !== "supported";
  return (
    <ol
      className={`workflow-progress ${busy ? "is-working" : ""}`}
      aria-label="Application recovery progress"
    >
      {["Evidence check", "Your review", "Mock submission"].map((name, i) => (
        <li
          key={name}
          className={
            i === 0 && needsInput
              ? "needs-input"
              : i < stage
                ? "complete"
                : i === stage
                  ? "current"
                  : ""
          }
          aria-current={i === stage ? "step" : undefined}
        >
          <span className="step-marker" aria-hidden="true">
            {i === 0 && needsInput ? "!" : i < stage ? "✓" : i + 1}
          </span>
          <span>
            {name}
            <small>
              {i === 0 && needsInput
                ? verdict === "sensitive"
                  ? "Human input needed"
                  : "Missing evidence"
                : i < stage
                  ? i === 0
                    ? "Check finished"
                    : "Completed"
                  : i === stage
                    ? "Current step"
                    : "Not started"}
            </small>
          </span>
        </li>
      ))}
    </ol>
  );
}
export function WorkspaceIllustration() {
  return (
    <div className="workspace-illustration" aria-hidden="true">
      <svg viewBox="0 0 420 235" fill="none">
        <ellipse
          cx="210"
          cy="118"
          rx="155"
          ry="94"
          stroke="#ded1e6"
          strokeDasharray="5 7"
        />
        <g className="illustration-document">
          <rect
            x="122"
            y="35"
            width="177"
            height="174"
            rx="16"
            fill="white"
            stroke="#d8ccdf"
          />
          <rect x="143" y="56" width="33" height="33" rx="9" fill="#eee6f3" />
          <path d="m153 72 6 6 10-12" stroke="#694277" strokeWidth="3" />
          <rect x="188" y="60" width="80" height="7" rx="3" fill="#594062" />
          <rect x="188" y="76" width="58" height="5" rx="2" fill="#c7b9ce" />
          {[106, 120, 134].map((y) => (
            <rect
              key={y}
              x="143"
              y={y}
              width={y === 120 ? 115 : 133}
              height="5"
              rx="2"
              fill="#d6ccd9"
            />
          ))}
          <rect x="143" y="160" width="133" height="28" rx="7" fill="#4d285d" />
          <path d="m200 174 5 5 10-10" stroke="white" strokeWidth="2" />
        </g>
        <g className="illustration-evidence">
          <rect
            x="44"
            y="132"
            width="119"
            height="48"
            rx="11"
            fill="#fff6ed"
            stroke="#e9ccaf"
          />
          <circle cx="64" cy="156" r="9" fill="#f1d5b9" />
          <path d="m60 156 3 3 5-6" stroke="#80512d" strokeWidth="2" />
          <rect x="81" y="149" width="65" height="5" rx="2" fill="#855b3a" />
          <rect x="81" y="160" width="48" height="4" rx="2" fill="#c4a486" />
        </g>
        <g className="illustration-confirm">
          <circle cx="309" cy="72" r="29" fill="#e8f0e9" stroke="#c1d7c7" />
          <path
            d="m296 72 9 9 17-19"
            stroke="#416c50"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
        <circle cx="86" cy="65" r="5" fill="#e6a28e" />
        <circle cx="339" cy="164" r="4" fill="#b6a2c5" />
      </svg>
    </div>
  );
}
export function SourceRail({
  application: app,
  busy,
}: {
  application: Application;
  busy: boolean;
}) {
  return (
    <aside className="source-rail" aria-label="Evidence sources">
      <div className="rail-heading">
        <span aria-hidden="true">⌑</span>
        <h3>Source evidence</h3>
        <span className="count">{app.draft?.claims.length ?? 0}</span>
      </div>
      <p className="muted">Know where the answer comes from.</p>
      {!app.draft ? (
        <div className="source-placeholder">
          {busy ? (
            <span className="activity-spinner" aria-hidden="true" />
          ) : (
            <span aria-hidden="true">↳</span>
          )}
          <p>
            {busy
              ? "Preparing an evidence draft…"
              : "Your sources will appear here"}
          </p>
          <small>No answer is approved automatically.</small>
        </div>
      ) : (
        <div className="evidence-list">
          {app.draft.claims.length ? (
            app.draft.claims.map((claim, i) => (
              <blockquote key={`${claim.source_id}-${i}`}>
                <span className="source-kind">
                  {app.evidence.find((e) => e.id === claim.source_id)?.kind ===
                  "approved_answer"
                    ? "Previously approved answer"
                    : "Fictional profile"}
                </span>
                <p>{claim.quote}</p>
                <footer>Source: {claim.source_id}</footer>
              </blockquote>
            ))
          ) : (
            <p className="empty-evidence">
              No supporting excerpts were selected for this question.
            </p>
          )}
        </div>
      )}
      <details>
        <summary>Inspect available source context</summary>
        {app.evidence.map((e) => (
          <article className="source" key={e.id}>
            <h4>
              {e.id} ·{" "}
              {e.kind === "profile" ? "Fictional profile" : "Approved answer"}
            </h4>
            <p>{e.text}</p>
            <p className="muted">Context: {e.context}</p>
          </article>
        ))}
      </details>
      <div className="trust-note">
        <span aria-hidden="true">◇</span>
        <p>
          <b>You have the final say.</b>Sources support review. They do not
          replace your judgment.
        </p>
      </div>
    </aside>
  );
}
