import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/app/lib/authToken";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

let isRefreshing = false;
let refreshPromise: Promise<Response> | null = null;

type AuthPayload = {
  access_token?: string;
};

const buildHeaders = (headers?: HeadersInit): Headers => {
  const nextHeaders = new Headers(headers);
  const token = getAccessToken();

  if (!nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    nextHeaders.set("Authorization", `Bearer ${token}`);
  }

  return nextHeaders;
};

const parseJson = async <T>(res: Response): Promise<T | null> =>
  res.json().catch(() => null);

const syncAccessToken = (payload: AuthPayload | null): void => {
  if (payload?.access_token) {
    setAccessToken(payload.access_token);
  }
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const makeRequest = () =>
    fetch(`${API_URL}${path}`, {
      credentials: "include",
      ...options,
      headers: buildHeaders(options.headers),
    });

  let res = await makeRequest();

  if (res.status !== 401) {
    if (!res.ok) {
      const error = await parseJson<{ message?: string }>(res);
      throw new Error(error?.message || "Something went wrong");
    }

    const data = await parseJson<T & AuthPayload>(res);
    syncAccessToken(data);
    return data as T;
  }

  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      isRefreshing = false;
    });
  }

  const refreshRequest = refreshPromise;

  if (!refreshRequest) {
    clearAccessToken();
    throw new Error("Unauthorized");
  }

  const refreshResponse = await refreshRequest;

  if (!refreshResponse.ok) {
    clearAccessToken();
    throw new Error("Unauthorized");
  }

  const refreshData = await parseJson<AuthPayload>(refreshResponse);
  syncAccessToken(refreshData);

  res = await makeRequest();

  if (!res.ok) {
    clearAccessToken();
    const error = await parseJson<{ message?: string }>(res);
    throw new Error(error?.message || "Unauthorized");
  }

  const data = await parseJson<T & AuthPayload>(res);
  syncAccessToken(data);
  return data as T;
}

export { request };
