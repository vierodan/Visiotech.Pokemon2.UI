import { useEffect, useState } from 'react';
import { getApiErrorMessage, getApiErrorStatus } from '../../../api/apiError';
import { hasConfiguredApi } from '../../../api/apiConfig';
import { getLastResponseStatus } from '../../../api/httpClient';
import { pokemonApi } from '../../../api/pokemonApi';
import type { SystemInfoContract } from '../../../api/contracts';
import {
  createRequestError,
  createRequestState,
  createRequestSuccess,
  setRequestLoading,
  type RequestState,
} from '../types/apiDemo';
import styles from './ApiDemo.module.css';
import { ApiActionButton } from './ApiActionButton';
import { EndpointCallout } from './EndpointCallout';
import { EndpointStepTitle } from './EndpointStepTitle';
import { TestingGuide } from './TestingGuide';
import { endpointDocs } from './endpointDocs';

export function SystemInfoPanel(): JSX.Element {
  const [state, setState] = useState<RequestState<SystemInfoContract>>(createRequestState<SystemInfoContract>());

  const loadSystemInfo = async (): Promise<void> => {
    setState((current) => setRequestLoading(current));

    try {
      const data = await pokemonApi.getSystemInfo();
      setState(createRequestSuccess(data, getLastResponseStatus()));
    } catch (error) {
      setState(createRequestError(getApiErrorMessage(error), getApiErrorStatus(error)));
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
        httpStatus: null,
        status: 'loading',
      });

      try {
        const data = await pokemonApi.getSystemInfo();
        setState(createRequestSuccess(data, getLastResponseStatus()));
      } catch (error) {
        setState(createRequestError(getApiErrorMessage(error), getApiErrorStatus(error)));
      }
    })();
  }, []);

  return (
    <div className={styles.stack}>
      <section className={styles.endpointStep}>
        <EndpointStepTitle path="/api/v1/system" title="Estado técnico del host" />
        <TestingGuide
          steps={[
            'Asegúrate de que la API está levantada en localhost:5090.',
            'Pulsa Refrescar para lanzar GET /api/v1/system.',
            'Verifica que aparecen service, environment, version y generatedAt con datos reales del backend.',
          ]}
          hint="Esta es la comprobación más rápida para confirmar que la UI realmente está hablando con el backend esperado."
        />
        <EndpointCallout {...endpointDocs.systemInfo} />
        <div className={styles.endpointStepAction}>
          <ApiActionButton onClick={() => void loadSystemInfo()} requests={[{ method: 'GET', path: '/api/v1/system' }]} />
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
      </section>
    </div>
  );
}
