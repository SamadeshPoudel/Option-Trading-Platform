export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

export async function apiRequest(
endpoint: string,
method: HttpMethod,
  body?:any
) {
  try {
    // Loading auth token from localStorage
    // const token = localStorage.getItem("auth_token")

    const res = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        // "authorization": `Bearer ${token}`,
      },
      body:body ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      const error = await res.json();
      console.log("API Error response:",error)
      throw new Error(error.msg || error.message || "Request failed");
    }

    return (await res.json());
  } catch (err) {
    console.log("we reached here",err)
    console.error("API request failed:", err)
    throw err
  }
}