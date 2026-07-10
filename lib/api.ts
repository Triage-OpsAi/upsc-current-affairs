import {
  AuthSession,
  StudentProfile,
  clearAuthSession,
  getAuthToken,
  getOrCreateDeviceId,
} from "./student";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string | null = null,
    public readonly details: unknown = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => globalThis.setTimeout(resolve, milliseconds));

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? getAuthToken() : null;
  const deviceId = typeof window !== "undefined" ? getOrCreateDeviceId() : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (deviceId) headers["X-Device-Id"] = deviceId;

  const method = (options.method || "GET").toUpperCase();
  const maxAttempts = method === "GET" ? 3 : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        cache: options.cache ?? "no-store",
      });
    } catch {
      if (attempt + 1 < maxAttempts) {
        await wait(250 * (attempt + 1));
        continue;
      }
      throw new ApiError("Could not connect to the server. Please try again.", 0);
    }

    if (!res.ok) {
      if ([500, 502, 503, 504].includes(res.status) && attempt + 1 < maxAttempts) {
        const retryAfter = Number(res.headers.get("Retry-After"));
        await wait(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 250 * (attempt + 1));
        continue;
      }
      if (res.status === 401) clearAuthSession();
      throw await errorFromResponse(res);
    }

    try {
      return await res.json();
    } catch {
      throw new ApiError("The server returned unreadable data. Please try again.", res.status);
    }
  }

  throw new ApiError("The server is temporarily unavailable. Please try again.", 503);
}

async function errorFromResponse(res: Response): Promise<ApiError> {
  let detail: any = null;
  try {
    const body = await res.json();
    detail = body?.detail ?? null;
  } catch {
    // Some infrastructure errors return HTML/plain text. Use the safe status message.
  }
  const message = typeof detail === "string"
    ? detail
    : typeof detail?.message === "string"
      ? detail.message
      : messageForStatus(res.status);
  return new ApiError(message, res.status, typeof detail?.code === "string" ? detail.code : null, detail);
}

function messageForStatus(status: number): string {
  if (status === 400) return "The code or details you entered are not valid.";
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "This action is not allowed for this account or device.";
  if (status === 404) return "No saved data is available for this screen yet.";
  if (status === 429) return "Too many attempts. Please wait and try again.";
  if (status === 503) return "The database is busy. Please retry in a moment.";
  if (status >= 500) return "The server had a problem. Please try again.";
  return "Something went wrong. Please try again.";
}

export interface Topic {
  id: string;
  month: number;
  year: number;
  title: string;
  summary: string | null;
  subject_tags: string[];
  source_date: string | null;
  question_text: string | null;
}

export interface ArchiveMonth {
  year: number;
  month: number;
  question_count: number;
}

export interface TopicListResponse {
  items: Topic[];
  meta: { page: number; page_size: number; total_items: number; total_pages: number };
}

export interface NextTopicResponse {
  topic: Topic | null;
}

export interface Question {
  id: string;
  topic_id: string;
  question_text: string;
  options: { key: string; text: string }[];
  difficulty: string;
}

export interface AttemptResult {
  is_correct: boolean;
  correct_option: string | null;
  explanation: string | null;
  breakdown_available: boolean;
}

export interface BreakdownSlide {
  id: string;
  slide_order: number;
  slide_type: "theory" | "practice";
  subject: string;
  content: string | null;
  practice_question: string | null;
  practice_options: { key: string; text: string }[] | null;
}

export interface DailyReport {
  report_date: string;
  total_attempted: number;
  total_correct: number;
  accuracy: number;
  percentile: number;
  subject_breakdown: Record<string, { total: number; correct: number }>;
  exam_wise_readiness: Record<string, number>;
  ai_feedback: string | null;
}

export interface DashboardStats {
  run_date: string;
  questions_attempted_today: number;
  correct_today: number;
  accuracy_today: number;
  current_streak_days: number;
  rank_today: number | null;
  active_aspirants_today: number;
}

export const api = {
  requestOtp: (email: string) =>
    request<{ ok: boolean; expires_in_minutes: number; account_exists: boolean; resend_after_seconds: number; dev_otp: string | null }>(`/api/auth/request-otp`, {
      method: "POST",
      body: JSON.stringify({ email, purpose: "login" }),
    }),
  verifyOtp: (body: { email: string; otp: string; name?: string; target_exam?: string }) =>
    request<AuthSession>(`/api/auth/verify-otp`, {
      method: "POST",
      body: JSON.stringify({ ...body, device_id: getOrCreateDeviceId() }),
    }),
  me: () => request<StudentProfile>(`/api/auth/me`),
  updateProfile: (body: Partial<Pick<StudentProfile, "name" | "target_exam" | "avatar_url" | "bio" | "city">>) =>
    request<StudentProfile>(`/api/profile`, { method: "PATCH", body: JSON.stringify(body) }),
  logout: () => request<{ ok: boolean }>(`/api/auth/logout`, { method: "POST" }),
  getDashboard: () => request<DashboardStats>(`/api/dashboard`),
  listTopics: (params: { month?: number; year?: number; page?: number; page_size?: number }) => {
    const q = new URLSearchParams();
    if (params.month) q.set("month", String(params.month));
    if (params.year) q.set("year", String(params.year));
    q.set("page", String(params.page ?? 1));
    q.set("page_size", String(params.page_size ?? 10));
    return request<TopicListResponse>(`/api/current-affairs?${q.toString()}`);
  },
  getAvailableMonths: () => request<ArchiveMonth[]>(`/api/current-affairs/months`),
  getLatestPracticeTopic: () => request<NextTopicResponse>(`/api/current-affairs/practice/latest`),
  getNextTopic: (topicId: string) => request<NextTopicResponse>(`/api/current-affairs/${topicId}/next`),
  getOrCreateStudent: (device_id: string) =>
    request<{ id: string; device_id: string; name: string | null; target_exam: string }>(`/api/students`, {
      method: "POST",
      body: JSON.stringify({ device_id }),
    }),
  getQuestionForTopic: (topicId: string) => request<Question>(`/api/questions/topic/${topicId}`),
  submitAttempt: (body: {
    student_id: string;
    question_id: string;
    selected_option: string;
    attempt_number?: number;
    went_through_breakdown?: boolean;
  }) =>
    request<AttemptResult>(`/api/attempts`, { method: "POST", body: JSON.stringify(body) }),
  getBreakdown: (questionId: string) => request<BreakdownSlide[]>(`/api/breakdown/${questionId}`),
  submitBreakdownAnswer: (body: { student_id: string; slide_id: string; selected_option: string }) =>
    request<{ is_correct: boolean; correct_option: string; explanation: string | null }>(`/api/breakdown-answers`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getReport: (studentId: string, date?: string) =>
    request<DailyReport>(`/api/reports/${studentId}${date ? `?report_date=${date}` : ""}`),
  getMyReport: (date?: string) =>
    request<DailyReport>(`/api/reports/me${date ? `?report_date=${date}` : ""}`),
};
