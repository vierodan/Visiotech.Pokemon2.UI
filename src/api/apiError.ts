import { HttpError } from './httpClient';
import type { HttpValidationProblemDetailsContract, ProblemDetailsContract } from './contracts';

const hasValue = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const flattenValidationErrors = (errors?: Record<string, string[]>): string | null => {
  if (!errors) {
    return null;
  }

  const messages = Object.entries(errors)
    .flatMap(([field, issues]) => issues.map((issue) => `${field}: ${issue}`))
    .filter(hasValue);

  return messages.length > 0 ? messages.join(' | ') : null;
};

export const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof HttpError) {
    const payload = error.payload as ProblemDetailsContract | HttpValidationProblemDetailsContract | undefined;
    const validationMessage =
      payload && 'errors' in payload ? flattenValidationErrors(payload.errors as Record<string, string[]>) : null;

    return (
      validationMessage ||
      (payload && hasValue(payload.detail) ? payload.detail : null) ||
      (payload && hasValue(payload.title) ? payload.title : null) ||
      `La API ha respondido con HTTP ${error.status}.`
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ha ocurrido un error inesperado al contactar con la API.';
};

