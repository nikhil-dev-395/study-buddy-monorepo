 export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Optional: Clear token and force logout if token is expired/invalid
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_profile");
    window.location.href = "/login";
  }

  return response;
}
