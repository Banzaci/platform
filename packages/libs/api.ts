export type ApiClient = ReturnType<typeof createApi>;

export function createApi(url: string, tokenName: string) {
  async function api<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = getToken();
    const isFormData = options.body instanceof FormData;
    const res = await fetch(`${url}${endpoint}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!res.ok) {
      throw new Error("API error");
    }

    return res.json();
  }

  function getToken() {
    return typeof window !== "undefined"
      ? localStorage.getItem(tokenName)
      : null;
  }

  function setToken(token: string) {
    localStorage.setItem(tokenName, token);
  }

  function removeToken() {
    localStorage.removeItem(tokenName);
  }

  return {
    api,
    getToken,
    setToken,
    removeToken,
  };
}