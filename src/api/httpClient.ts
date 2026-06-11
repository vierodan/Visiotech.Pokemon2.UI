import { apiConfig } from './apiConfig';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;
type AccessTokenGetter = () => string | null | undefined;

export interface HttpRequestOptions {
  auth?: boolean;
  body?: unknown;
  headers?: HeadersInit;
  query?: QueryParams;
  signal?: AbortSignal;
}

export class HttpError extends Error {
  public readonly status: number;
  public readonly payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.payload = payload;
  }
}

let accessTokenGetter: AccessTokenGetter | null = null;

export const setAccessTokenGetter = (getter: AccessTokenGetter | null): void => {
  accessTokenGetter = getter;
};

const buildUrl = (path: string, query?: QueryParams): string => {
  if (!apiConfig.baseUrl) {
    throw new Error('VITE_API_BASE_URL is not configured.');
  }

  const normalizedPath = path.replace(/^\//, '');
  const baseUrl = /^https?:\/\//i.test(apiConfig.baseUrl)
    ? `${apiConfig.baseUrl}/`
    : new URL(apiConfig.baseUrl.replace(/^\//, ''), window.location.origin + '/').toString();
  const url = new URL(normalizedPath, baseUrl);

  if (!query) {
    return url.toString();
  }

  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
};

const serializeBody = (body: unknown): BodyInit | undefined => {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (body instanceof FormData || body instanceof URLSearchParams || typeof body === 'string') {
    return body;
  }

  return JSON.stringify(body);
};

const buildHeaders = (
  body: unknown,
  headers?: HeadersInit,
  auth: boolean = true,
): Headers => {
  const requestHeaders = new Headers(headers);

  if (body !== undefined && body !== null && !(body instanceof FormData) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (auth && accessTokenGetter) {
    const token = accessTokenGetter();

    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  return requestHeaders;
};

const parseResponse = async (response: Response): Promise<unknown> => {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
};

const request = async <T>(
  method: HttpMethod,
  path: string,
  options: HttpRequestOptions = {},
): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), apiConfig.timeoutMs);

  try {
    const response = await fetch(buildUrl(path, options.query), {
      method,
      body: serializeBody(options.body),
      headers: buildHeaders(options.body, options.headers, options.auth),
      signal: options.signal ?? controller.signal,
    });

    const payload = await parseResponse(response);

    if (!response.ok) {
      throw new HttpError(response.status, `HTTP ${response.status}`, payload);
    }

    return payload as T;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export const httpClient = {
  get: <T>(path: string, options?: Omit<HttpRequestOptions, 'body'>): Promise<T> =>
    request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: Omit<HttpRequestOptions, 'body'>): Promise<T> =>
    request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: Omit<HttpRequestOptions, 'body'>): Promise<T> =>
    request<T>('PUT', path, { ...options, body }),
  delete: <T>(path: string, options?: Omit<HttpRequestOptions, 'body'>): Promise<T> =>
    request<T>('DELETE', path, options),
};
