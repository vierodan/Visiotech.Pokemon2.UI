import { hasConfiguredApi } from '../../../api/apiConfig';
import { useDemoPreview } from '../hooks/useDemoPreview';
import styles from './DemoApiPanel.module.css';

export function DemoApiPanel(): JSX.Element {
  const { data, error, loadApi, loadMock, source, status } = useDemoPreview();

  const isLoading = status === 'loading';
  const hasItems = Boolean(data?.endpoints.length);

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <div>
          <p className={styles.kicker}>Demo funcional</p>
          <h3 className={styles.title}>Simulación de capa API y estados de UI</h3>
        </div>

        <div className={styles.actions}>
          <button className={styles.secondaryButton} type="button" onClick={() => void loadMock('success')}>
            Cargar OK
          </button>
          <button className={styles.secondaryButton} type="button" onClick={() => void loadMock('empty')}>
            Simular vacío
          </button>
          <button className={styles.secondaryButton} type="button" onClick={() => void loadMock('error')}>
            Simular error
          </button>
          <button
            className={styles.primaryButton}
            type="button"
            disabled={!hasConfiguredApi || isLoading}
            onClick={() => void loadApi()}
          >
            Probar HTTP real
          </button>
        </div>
      </div>

      <div className={styles.statusRow}>
        <span className={styles.statusChip}>Fuente activa: {source}</span>
        <span className={styles.statusHint}>
          {hasConfiguredApi
            ? 'La llamada real usa GET /demo como endpoint provisional.'
            : 'Añade VITE_API_BASE_URL para activar la prueba HTTP real.'}
        </span>
      </div>

      {isLoading ? (
        <div className={styles.stateBox}>
          <strong>Cargando...</strong>
          <p>Se está resolviendo la petición de demo para validar el estado transitorio de la interfaz.</p>
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className={styles.stateBoxError}>
          <strong>Error de integración</strong>
          <p>{error}</p>
          <button className={styles.inlineButton} type="button" onClick={() => void loadMock('success')}>
            Volver al mock funcional
          </button>
        </div>
      ) : null}

      {!isLoading && !error && data && !hasItems ? (
        <div className={styles.stateBox}>
          <strong>Sin datos todavía</strong>
          <p>
            La estructura está lista, pero esta respuesta no trae recursos. La UI ya contempla el estado vacío
            sin lógica adicional en la página.
          </p>
        </div>
      ) : null}

      {!isLoading && !error && data && hasItems ? (
        <div className={styles.grid}>
          {data.endpoints.map((endpoint) => (
            <article className={styles.endpointCard} key={endpoint.id}>
              <div className={styles.endpointHeader}>
                <span className={styles.method}>{endpoint.method}</span>
                <span className={styles.path}>{endpoint.path}</span>
              </div>
              <h4>{endpoint.title}</h4>
              <p>{endpoint.description}</p>
            </article>
          ))}
        </div>
      ) : null}

      {data ? (
        <footer className={styles.footer}>
          <span>{data.title}</span>
          <span>{new Date(data.checkedAt).toLocaleString('es-ES')}</span>
        </footer>
      ) : null}
    </div>
  );
}
