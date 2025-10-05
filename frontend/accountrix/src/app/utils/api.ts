export async function apiFetch(url: string, options: RequestInit = {}) {
  let accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  options.headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  let res = await fetch(url, options);

  // If access token expired
  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch("http://127.0.0.1:8000/api/accounts/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      localStorage.setItem("accessToken", data.access);

      // retry original request with new token
      options.headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${data.access}`,
        "Content-Type": "application/json",
      };
      res = await fetch(url, options);
    } else {
      // refresh failed → force login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
  }

  return res;
}
