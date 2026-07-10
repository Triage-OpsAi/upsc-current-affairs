export interface StudentProfile {
  id: string;
  device_id: string;
  name: string | null;
  email: string | null;
  target_exam: string;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  suspended_until: string | null;
  recent_device_count?: number;
  device_limit?: number;
  device_warning?: string | null;
}

export interface AuthSession {
  access_token: string;
  expires_at: string;
  student: StudentProfile;
}

const DEVICE_ID_KEY = "gazette_device_id";
const TOKEN_KEY = "gazette_access_token";
const TOKEN_EXP_KEY = "gazette_token_expires_at";
const STUDENT_KEY = "gazette_student";

export function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getAuthToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiresAt = localStorage.getItem(TOKEN_EXP_KEY);
  if (!token || !expiresAt) return null;
  if (new Date(expiresAt).getTime() <= Date.now()) {
    clearAuthSession();
    return null;
  }
  return token;
}

export function getStoredStudent(): StudentProfile | null {
  const raw = localStorage.getItem(STUDENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StudentProfile;
  } catch {
    return null;
  }
}

export function setAuthSession(session: AuthSession) {
  localStorage.setItem(TOKEN_KEY, session.access_token);
  localStorage.setItem(TOKEN_EXP_KEY, session.expires_at);
  localStorage.setItem(STUDENT_KEY, JSON.stringify(session.student));
}

export function updateStoredStudent(student: StudentProfile) {
  localStorage.setItem(STUDENT_KEY, JSON.stringify(student));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXP_KEY);
  localStorage.removeItem(STUDENT_KEY);
}

export async function ensureStudentId(): Promise<string> {
  const token = getAuthToken();
  const student = getStoredStudent();
  if (!token || !student) throw new Error("Please sign in again");
  return student.id;
}
