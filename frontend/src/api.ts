let csrfToken: string | undefined;
let sessionRequest: Promise<void> | undefined;
async function ensureSession() {
  if (csrfToken) return;
  if (!sessionRequest) {
    sessionRequest = fetch("/api/session", {
      method: "POST",
      signal: AbortSignal.timeout(15000),
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    })
      .then(async (response) => {
        if (!response.ok)
          throw new Error("Demo session unavailable. Please retry shortly.");
        const data = await response.json();
        if (typeof data.csrf_token !== "string" || !data.csrf_token) {
          throw new Error("Invalid demo session response. Please reload.");
        }
        csrfToken = data.csrf_token;
      })
      .finally(() => {
        sessionRequest = undefined;
      });
  }
  await sessionRequest;
}
export async function resetDemo() {
  await request("/session/reset", { method: "POST", body: "{}" });
  csrfToken = undefined;
  window.location.assign(window.location.pathname);
}
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  await ensureSession();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`/api${path}`, {
      ...options,
      credentials: "same-origin",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        ...options.headers,
      },
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 401) csrfToken = undefined;
      const detail =
        data && typeof data === "object" && "detail" in data
          ? data.detail
          : null;
      throw new ApiError(
        typeof detail === "string"
          ? detail
          : `Request failed (${response.status}). Please refresh the current state.`,
        response.status,
      );
    }
    return data as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw new Error(
        "The request timed out. Submission status may be uncertain; refresh and check its current state before another action.",
        { cause: error },
      );
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
