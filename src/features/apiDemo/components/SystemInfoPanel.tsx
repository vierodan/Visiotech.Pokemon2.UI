import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../../api/apiError';
import { hasConfiguredApi } from '../../../api/apiConfig';
import { pokemonApi } from '../../../api/pokemonApi';
import type { SystemInfoContract } from '../../../api/contracts';
import { createRequestState, type RequestState } from '../types/apiDemo';
import styles from './ApiDemo.module.css';
import { TestingGuide } from './TestingGuide';

export function SystemInfoPanel(): JSX.Element {
  const [state, setState] = useState<RequestState<SystemInfoContract>>(createRequestState<SystemInfoContract>());

  const loadSystemInfo = async (): Promise<void> => {
    setState((current) => ({
      ...current,
      error: null,
      status: 'loading',
    }));

    try {
      const data = await pokemonApi.getSystemInfo();

      setState({
        data,
        error: null,
        status: 'success',
      });
    } catch (error) {
      setState({
        data: null,
        error: getApiErrorMessage(error),
        status: 'error',
      });
    }
  };

  useEffect(() => {
    if (!hasConfiguredApi) {
      return;
    }

    void (async () => {
      setState({
        data: null,
        error: null,
        status: 'loading',
      });

      try {
        const data = await pokemonApi.getSystemInfo();

        setState({
          data,
          error: null,
          status: 'success',
        });
      } catch (error) {
        setState({
          data: null,
          error: getApiErrorMessage(error),
          status: 'error',
        });
      }
    })();
  }, []);

  return (
    <div className={styles.stack}>
      <TestingGuide
        steps={[
          'Asegurate de que la API esta levantada en localhost:5090.',
          'Pulsa Refrescar para lanzar GET /api/v1/system.',
          'Verifica que aparecen service, environment, version y generatedAt con datos reales del backend.',
        ]}
        hint="Esta es la comprobacion mas rapida para confirmar que la UI realmente esta hablando con el backend esperado."
      />

      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.panelEyebrow}>GET /api/v1/system</p>
          <h3 className={styles.panelTitle}>Estado técnico del host</h3>
        </div>

        <button className={styles.secondaryButton} type="button" onClick={() => void loadSystemInfo()}>
          Refrescar
        </button>
      </div>

      {!hasConfiguredApi ? (
        <div className={styles.noticeBox}>
          <strong>Configura primero la URL base</strong>
          <p>La comprobación del host se activará cuando exista `VITE_API_BASE_URL` en `.env.local`.</p>
        </div>
      ) : null}

      {state.status === 'loading' ? (
        <div className={styles.noticeBox}>
          <strong>Cargando host...</strong>
          <p>Consultando el endpoint técnico del sistema.</p>
        </div>
      ) : null}

      {state.status === 'error' && state.error ? (
        <div className={styles.errorBox}>
          <strong>Error al consultar `/system`</strong>
          <p>{state.error}</p>
        </div>
      ) : null}

      {state.status === 'success' && state.data ? (
        <div className={styles.metricGrid}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Service</span>
            <strong>{state.data.service}</strong>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Environment</span>
            <strong>{state.data.environment}</strong>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Version</span>
            <strong>{state.data.version}</strong>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Generated At</span>
            <strong>{new Date(state.data.generatedAtUtc).toLocaleString('es-ES')}</strong>
          </div>
        </div>
      ) : null}
    </div>
  );
}
