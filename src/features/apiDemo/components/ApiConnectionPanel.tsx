import { useEffect, useState } from 'react';
import { apiConfig, hasConfiguredApi } from '../../../api/apiConfig';
import { setAccessTokenGetter } from '../../../api/httpClient';
import styles from './ApiDemo.module.css';
import { TestingGuide } from './TestingGuide';

export function ApiConnectionPanel(): JSX.Element {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const sanitizedToken = token.trim();
    setAccessTokenGetter(sanitizedToken ? () => sanitizedToken : null);

    return () => {
      setAccessTokenGetter(null);
    };
  }, [token]);

  return (
    <div className={styles.stack}>
      <TestingGuide
        steps={[
          'Arranca la API en http://localhost:5090 y la UI en http://localhost:5091.',
          'Comprueba que la Base URL activa apunta a /api o al host correcto en .env.local.',
          'Si el backend requiere autenticación, pega aquí el Bearer token antes de usar el resto de paneles.',
        ]}
        hint="Si esta sección no queda bien configurada, el resto de las pruebas de la demo no podrán llamar a la API real."
      />

      <div className={styles.connectionMeta}>
        <div>
          <p className={styles.panelEyebrow}>Configuración</p>
          <h3 className={styles.panelTitle}>Conexión a la API externa</h3>
        </div>

        <span className={hasConfiguredApi ? styles.positiveBadge : styles.warningBadge}>
          {hasConfiguredApi ? 'Base URL detectada' : 'Falta configurar .env.local'}
        </span>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Base URL activa</span>
          <code className={styles.codeBlock}>
            {hasConfiguredApi ? apiConfig.baseUrl : 'Define VITE_API_BASE_URL en .env.local'}
          </code>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Contrato analizado</span>
          <code className={styles.codeBlock}>backend/visiotech-pokemon-api-v1.json</code>
        </div>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Bearer token opcional</span>
        <input
          className={styles.input}
          type="password"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="Pega un JWT si el backend empieza a requerirlo"
        />
      </label>

      <p className={styles.helperText}>
        El contrato actual no documenta `securitySchemes`, pero el cliente HTTP ya puede adjuntar `Authorization:
        Bearer ...` si pegas un token aquí.
      </p>
    </div>
  );
}
