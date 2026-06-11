import { SectionCard } from '../../../components/shared/SectionCard';
import { ApiConnectionPanel } from './ApiConnectionPanel';
import { CatalogExplorer } from './CatalogExplorer';
import { DamageCalculatorPanel } from './DamageCalculatorPanel';
import { SystemInfoPanel } from './SystemInfoPanel';

export function PokemonApiDemo(): JSX.Element {
  return (
    <>
      <SectionCard
        eyebrow="Integración"
        title="Conexión y contrato real"
        description="La UI se apoya en el OpenAPI del workspace y deja listo el cliente para adjuntar Bearer token si aparece autenticación más adelante."
      >
        <ApiConnectionPanel />
      </SectionCard>

      <SectionCard
        eyebrow="Host"
        title="Verificación técnica del backend"
        description="Primera comprobación ligera para confirmar que la base URL apunta al servicio esperado."
      >
        <SystemInfoPanel />
      </SectionCard>

      <SectionCard
        eyebrow="Catálogos"
        title="Exploración de recursos principales"
        description="Se exponen solo filtros soportados por el contrato: especies, movimientos e instancias jugables."
      >
        <CatalogExplorer />
      </SectionCard>

      <SectionCard
        eyebrow="Acción"
        title="Cálculo de daño real"
        description="La demo ejecuta un caso de uso backend con datos reales ya cargados en la API."
      >
        <DamageCalculatorPanel />
      </SectionCard>
    </>
  );
}

