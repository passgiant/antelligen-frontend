import { env } from "@/infrastructure/config/env";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("user_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function agentHttpClient<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${env.agentApiBaseUrl}${path}`;

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.location.replace("/login");
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
