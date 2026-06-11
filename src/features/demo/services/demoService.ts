import { hasConfiguredApi } from '../../../api/apiConfig';
import { httpClient } from '../../../api/httpClient';
import type { DemoPreview, DemoSimulationMode } from '../types/demo';

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

const buildMockPreview = (endpoints: DemoPreview['endpoints']): DemoPreview => ({
  checkedAt: new Date().toISOString(),
  source: 'mock',
  summary:
    'La feature ya separa UI, hooks y servicios; cuando exista backend solo habrá que sustituir o ampliar este servicio.',
  title: 'Estado de la integración preparado',
  endpoints,
});

const mockEndpoints: DemoPreview['endpoints'] = [
  {
    id: 'health',
    method: 'GET',
    path: '/health',
    title: 'Health check',
    description: 'Punto de entrada mínimo para validar conectividad y disponibilidad.',
  },
  {
    id: 'resources',
    method: 'GET',
    path: '/resources',
    title: 'Listado de recursos',
    description: 'Ejemplo de lectura para poblar una pantalla con datos remotos.',
  },
  {
    id: 'resource-create',
    method: 'POST',
    path: '/resources',
    title: 'Creación de entidades',
    description: 'Patrón base para formularios o acciones de escritura.',
  },
];

export const fetchDemoPreview = async (mode: DemoSimulationMode): Promise<DemoPreview> => {
  await wait(650);

  if (mode === 'error') {
    throw new Error('La demo ha simulado un fallo de red para validar la UI de error.');
  }

  if (mode === 'empty') {
    return buildMockPreview([]);
  }

  return buildMockPreview(mockEndpoints);
};

export const fetchDemoPreviewFromApi = async (): Promise<DemoPreview> => {
  if (!hasConfiguredApi) {
    throw new Error('Configura VITE_API_BASE_URL para activar la llamada HTTP real.');
  }

  return httpClient.get<DemoPreview>('/demo', { auth: false });
};

