import { SectionCard } from '../components/shared/SectionCard';
import { DemoApiPanel } from '../features/demo/components/DemoApiPanel';
import styles from './HomePage.module.css';

const architectureItems = [
  'Capa `api/` desacoplada de la UI para integrar fetch, headers y auth.',
  'Features aisladas por vertical para que cada dominio crezca sin contaminar el resto.',
  'Layout y componentes compartidos separados de páginas y lógica remota.',
];

const roadmapItems = [
  'Conectar servicios reales por feature sobre `httpClient`.',
  'Añadir React Router cuando aparezcan más vistas.',
  'Incorporar tests y observabilidad antes de crecer en complejidad.',
];

export function HomePage(): JSX.Element {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>SPA starter</p>
          <h2 className={styles.heroTitle}>Una base limpia para crecer sin reescribir la UI a mitad de camino.</h2>
          <p className={styles.heroLead}>
            Este skeleton combina una landing técnica, una capa HTTP reutilizable y una primera feature demo para
            integrar backend externo cuando llegue el momento.
          </p>
        </div>

        <div className={styles.heroStats}>
          <div>
            <span className={styles.statValue}>React + Vite</span>
            <span className={styles.statLabel}>arranque rápido y toolchain ligero</span>
          </div>
          <div>
            <span className={styles.statValue}>TypeScript</span>
            <span className={styles.statLabel}>tipado explícito en servicios, hooks y componentes</span>
          </div>
          <div>
            <span className={styles.statValue}>API-ready</span>
            <span className={styles.statLabel}>base URL por entorno y soporte futuro para Bearer token</span>
          </div>
        </div>
      </section>

      <section className={styles.grid}>
        <SectionCard
          eyebrow="Arquitectura"
          title="Preparada para evolucionar por features"
          description="La organización prioriza separación de responsabilidades sin meter abstracciones prematuras."
        >
          <ul className={styles.list}>
            {architectureItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          eyebrow="Próximo encaje"
          title="Ruta natural de crecimiento"
          description="Lo siguiente ya tiene sitio claro dentro del código sin necesidad de reordenar toda la app."
        >
          <ul className={styles.list}>
            {roadmapItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SectionCard>
      </section>

      <SectionCard
        eyebrow="Integración demo"
        title="Estado de datos, errores y vacío resueltos"
        description="La página no conoce detalles de red: delega en la feature demo y mantiene una superficie visual simple."
      >
        <DemoApiPanel />
      </SectionCard>
    </div>
  );
}

