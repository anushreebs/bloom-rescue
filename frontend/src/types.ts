export type Evidence = {
  id: string;
  candidate_id: string;
  kind: "profile" | "approved_answer";
  topic: string;
  text: string;
  context: string;
};
export type Resolution = {
  answer: string;
  claims: { text: string; source_id: string; quote: string }[];
  missing_information: string[];
  requires_confirmation: boolean;
  verdict: "supported" | "needs_information" | "sensitive" | "unsupported";
  mode: "deterministic" | "api";
  latency_ms: number;
  tokens: number | null;
  warnings: string[];
};
export type Application = {
  id: string;
  candidate_id: string;
  company: string;
  role: string;
  question: string;
  question_kind: string;
  state: string;
  revision: number;
  evidence: Evidence[];
  draft: Resolution | null;
  approved_answer: string | null;
  receipt: Record<string, unknown> | null;
  scenario: string;
};
export type AuditEvent = {
  id: number;
  application_id: string;
  type: string;
  from_state: string;
  to_state: string;
  created_at: string;
  detail: Record<string, unknown>;
};
