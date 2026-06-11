import { resolveApiUrl } from '../../../api/httpClient';
import styles from './ApiDemo.module.css';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;

interface ApiActionRequest {
  method: HttpMethod;
  path: string;
  query?: QueryParams;
}

interface ApiActionButtonProps {
  disabled?: boolean;
  onClick?: () => void;
  requests: ApiActionRequest[];
  type?: 'button' | 'submit';
}

const getButtonClassName = (method: HttpMethod): string => {
  switch (method) {
    case 'GET':
      return styles.secondaryButton;
    case 'POST':
      return styles.primaryButton;
    case 'PUT':
      return styles.putButton;
    case 'DELETE':
      return styles.dangerButton;
  }
};

const buildTooltip = (requests: ApiActionRequest[]): string =>
  requests
    .map(({ method, path, query }) => {
      try {
        return `${method} ${resolveApiUrl(path, query)}`;
      } catch {
        return `${method} ${path}`;
      }
    })
    .join('\n');

export function ApiActionButton({
  disabled = false,
  onClick,
  requests,
  type = 'button',
}: ApiActionButtonProps): JSX.Element {
  const tooltip = buildTooltip(requests);

  return (
    <span className={styles.apiActionButtonWrap}>
      <button
        aria-label={tooltip}
        className={getButtonClassName(requests[0]?.method ?? 'GET')}
        disabled={disabled}
        onClick={onClick}
        type={type}
      >
        Ejecutar
      </button>
      <span className={styles.apiActionTooltip} role="tooltip">
        {tooltip}
      </span>
    </span>
  );
}
