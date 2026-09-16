export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, status = 0) {
    super(`API error: ${code} (${status})`);
    this.code = code;
    this.status = status;
  }
}

export async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, init);
  } catch {
    throw new ApiError("network", 0);
  }
  if (!response.ok) {
    let code = "unknown";
    try {
      const body: unknown = await response.json();
      if (body && typeof body === "object" && "detail" in body) {
        const detail = (body as { detail: unknown }).detail;
        if (
          detail &&
          typeof detail === "object" &&
          "code" in detail &&
          typeof (detail as { code: unknown }).code === "string"
        ) {
          code = (detail as { code: string }).code;
        }
      } else if (response.status === 404) {
        code = "not_found";
      }
    } catch {
      /* body unreadable */
    }
    throw new ApiError(code, response.status);
  }
  return (await response.json()) as T;
}
