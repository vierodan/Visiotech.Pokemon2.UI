export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export interface RequestState<T> {
  data: T | null;
  error: string | null;
  httpStatus: number | null;
  status: RequestStatus;
}

export const createRequestState = <T,>(): RequestState<T> => ({
  data: null,
  error: null,
  httpStatus: null,
  status: 'idle',
});

export const setRequestLoading = <T,>(current: RequestState<T>): RequestState<T> => ({
  ...current,
  error: null,
  httpStatus: null,
  status: 'loading',
});

export const createRequestSuccess = <T,>(data: T | null, httpStatus: number | null): RequestState<T> => ({
  data,
  error: null,
  httpStatus,
  status: 'success',
});

export const createRequestError = <T,>(error: string, httpStatus: number | null): RequestState<T> => ({
  data: null,
  error,
  httpStatus,
  status: 'error',
});
