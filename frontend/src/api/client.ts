export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    const requestHeaders = new Headers(options.headers);
    requestHeaders.set('Accept', 'application/json');

    response = await fetch(`/api${path}`, { ...options, headers: requestHeaders });
  } catch {
    throw new ApiError(0, 'Nem sikerült kapcsolódni a szerverhez.');
  }

  if (!response.ok) {
    throw new ApiError(response.status, await errorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (
      data !== null &&
      typeof data === 'object' &&
      'error' in data &&
      typeof data.error === 'string'
    ) {
      return data.error;
    }
  } catch {
    /* fall through to default */
  }
  return 'A kérés sikertelen.';
}
