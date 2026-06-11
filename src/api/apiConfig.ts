const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';

export const apiConfig = Object.freeze({
  baseUrl: rawApiBaseUrl.replace(/\/+$/, ''),
  timeoutMs: 15000,
});

export const hasConfiguredApi = apiConfig.baseUrl.length > 0;

