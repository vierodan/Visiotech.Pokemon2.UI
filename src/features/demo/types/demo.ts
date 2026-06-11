export type DemoSimulationMode = 'success' | 'empty' | 'error';
export type DemoSource = 'mock' | 'api';
export type DemoRequestStatus = 'idle' | 'loading' | 'success' | 'error';

export interface DemoEndpointPreview {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  title: string;
  description: string;
}

export interface DemoPreview {
  checkedAt: string;
  source: DemoSource;
  summary: string;
  title: string;
  endpoints: DemoEndpointPreview[];
}

export interface DemoPreviewState {
  data: DemoPreview | null;
  error: string | null;
  source: DemoSource;
  status: DemoRequestStatus;
}

