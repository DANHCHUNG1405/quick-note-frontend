const API_URL = process.env.NEXT_PUBLIC_API_URL;

let isRefreshing = false;
let refreshPromise: Promise<Response> | null = null;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const makeRequest = () =>
    fetch(`${API_URL}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

  let res = await makeRequest();

  // Nếu không phải 401 → xử lý bình thường
  if (res.status !== 401) {
    if (!res.ok) {
      const error = await res.json().catch(() => null);
      throw new Error(error?.message || "Something went wrong");
    }
    return res.json();
  }

  // Nếu 401 → thử refresh
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      isRefreshing = false;
    });
  }

  await refreshPromise;

  // Sau khi refresh → retry request cũ
  res = await makeRequest();

  if (!res.ok) {
    throw new Error("Unauthorized");
  }

  return res.json();
}

export { request };
