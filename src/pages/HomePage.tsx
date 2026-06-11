import { SectionCard } from '../components/shared/SectionCard';
import { PokemonApiDemo } from '../features/apiDemo/components/PokemonApiDemo';
import styles from './HomePage.module.css';

const contractHighlights = [
  'El contrato publica catálogos de `moves`, `pokemons` y `my-pokemons` con paginación explícita.',
  'Existe un endpoint técnico `GET /api/v1/system` ideal para validar conectividad sin depender de datos de negocio.',
  'El caso de uso más demostrable para UI es `POST /api/v1/damage-calculations`, porque consume IDs reales y devuelve un resultado útil.',
];

const roadmapItems = [
  'Separar cada vertical del backend en su propia feature cuando empiece a crecer el producto.',
  'Añadir navegación cuando aparezcan varias pantallas operativas reales.',
  'Introducir tests de integración sobre servicios y componentes con datos mockeados del contrato.',
];

export function HomePage(): JSX.Element {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>API demo</p>
          <h2 className={styles.heroTitle}>Una UI ligera para probar el backend real sin inventar contratos.</h2>
          <p className={styles.heroLead}>
            La página principal conecta con el OpenAPI del workspace, explora los recursos más importantes y ejecuta
            un cálculo de daño real usando `my-pokemons` y movimientos equipados del backend.
          </p>
        </div>

        <div className={styles.heroStats}>
          <div>
            <span className={styles.statValue}>OpenAPI-first</span>
            <span className={styles.statLabel}>la UI sigue el contrato disponible en `backend/visiotech-pokemon-api-v1.json`</span>
          </div>
          <div>
            <span className={styles.statValue}>TypeScript estricto</span>
            <span className={styles.statLabel}>tipos explícitos en DTOs, estados remotos y componentes</span>
          </div>
          <div>
            <span className={styles.statValue}>HTTP real</span>
            <span className={styles.statLabel}>base URL por `.env.local` y cliente listo para Bearer token opcional</span>
          </div>
        </div>
      </section>

      <section className={styles.grid}>
        <SectionCard
          eyebrow="Contrato"
          title="Lo que realmente expone la API"
          description="La demo se apoya solo en rutas y campos documentados, sin añadir DTOs ficticios."
        >
          <ul className={styles.list}>
            {contractHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          eyebrow="Siguiente paso"
          title="Cómo puede crecer esta UI"
          description="La estructura ya separa layout, capa HTTP y demo funcional para extenderse sin reescribir."
        >
          <ul className={styles.list}>
            {roadmapItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SectionCard>
      </section>

      <PokemonApiDemo />
    </div>
  );
}
