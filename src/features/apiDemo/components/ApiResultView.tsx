import type { RequestState } from '../types/apiDemo';
import styles from './ApiDemo.module.css';

interface ApiResultViewProps<T> {
  emptyMessage?: string;
  idleMessage: string;
  state: RequestState<T>;
  successMessage?: string;
}

export function ApiResultView<T>({
  emptyMessage = 'La operación no ha devuelto contenido.',
  idleMessage,
  state,
  successMessage = 'Respuesta recibida correctamente.',
}: ApiResultViewProps<T>): JSX.Element {
  if (state.status === 'idle') {
    return (
      <div className={styles.noticeBox}>
        <strong>Sin ejecutar todavia</strong>
        <p>{idleMessage}</p>
      </div>
    );
  }

  if (state.status === 'loading') {
    return (
      <div className={styles.noticeBox}>
        <strong>Ejecutando request...</strong>
        <p>Esperando respuesta de la API.</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className={styles.errorBox}>
        <strong>Error de API</strong>
        <p>{state.error ?? 'Ha fallado la petición.'}</p>
      </div>
    );
  }

  if (state.data === null) {
    return (
      <div className={styles.resultCard}>
        <strong>{successMessage}</strong>
        <p className={styles.helperText}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.resultCard}>
      <strong>{successMessage}</strong>
      <pre className={styles.jsonBlock}>{JSON.stringify(state.data, null, 2)}</pre>
    </div>
  );
}
