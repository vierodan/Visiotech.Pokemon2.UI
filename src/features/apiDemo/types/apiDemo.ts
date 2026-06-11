export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export interface RequestState<T> {
  data: T | null;
  error: string | null;
  status: RequestStatus;
}

export const createRequestState = <T,>(): RequestState<T> => ({
  data: null,
  error: null,
  status: 'idle',
});

