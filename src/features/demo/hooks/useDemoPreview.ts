import { useEffect, useState } from 'react';
import { fetchDemoPreview, fetchDemoPreviewFromApi } from '../services/demoService';
import type { DemoPreviewState, DemoSimulationMode, DemoSource } from '../types/demo';

const initialState: DemoPreviewState = {
  data: null,
  error: null,
  source: 'mock',
  status: 'idle',
};

export const useDemoPreview = () => {
  const [state, setState] = useState<DemoPreviewState>(initialState);

  const runRequest = async (
    source: DemoSource,
    requestFactory: () => Promise<DemoPreviewState['data']>,
  ): Promise<void> => {
    setState((current) => ({
      ...current,
      error: null,
      source,
      status: 'loading',
    }));

    try {
      const data = await requestFactory();

      setState({
        data,
        error: null,
        source,
        status: 'success',
      });
    } catch (error) {
      setState({
        data: null,
        error: error instanceof Error ? error.message : 'Ha ocurrido un error inesperado.',
        source,
        status: 'error',
      });
    }
  };

  const loadMock = async (mode: DemoSimulationMode): Promise<void> => {
    await runRequest('mock', () => fetchDemoPreview(mode));
  };

  const loadApi = async (): Promise<void> => {
    await runRequest('api', fetchDemoPreviewFromApi);
  };

  useEffect(() => {
    void runRequest('mock', () => fetchDemoPreview('success'));
  }, []);

  return {
    ...state,
    loadApi,
    loadMock,
  };
};
