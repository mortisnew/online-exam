
import type { UserRole, LoginResponse } from "../types/auth";
import type { CreateSchoolData } from "../types/core";

const API_BASE_URL = "http://127.0.0.1:8000";

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("Content-Type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function handleResponse<T = unknown>(
  response: Response,
): Promise<T> {
  const result = await parseResponse(response);

  if (!response.ok) {
    throw result ?? {
      detail: `Request failed: ${response.status}`,
    };
  }

  return result as T;
}

export async function registerUser(data: {
  first_name: string;
  last_name: string;
  email: string;
  rules: UserRole;
  password: string;
  password2: string;
}) {
  const response = await fetch(`${API_BASE_URL}/accounts/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/accounts/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<LoginResponse>(response);
}

export async function authenticatedFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const access = localStorage.getItem("access");
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body !== undefined && options.body !== null) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  if (access) {
    headers.set("Authorization", `Bearer ${access}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return handleResponse<T>(response);
}

// موقت؛ در مرحله پروفایل بازنویسی می‌شود.
export type UserProfile = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  rules: UserRole;
  avatar: string | null;
};

export async function getProfile() {
  return authenticatedFetch<{ profile: UserProfile }>("/profile/");
}

export async function getSchools() {
  return authenticatedFetch("/core/school/");
}

export async function createSchool(name: string) {
  const data: CreateSchoolData = { name };

  return authenticatedFetch("/core/school/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
