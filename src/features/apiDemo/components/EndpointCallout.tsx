import styles from './ApiDemo.module.css';

export interface EndpointCalloutProps {
  description: string;
  fields?: string[];
  response: string[];
  rules?: string[];
}

export function EndpointCallout({
  description,
  fields = [],
  response,
  rules = [],
}: EndpointCalloutProps): JSX.Element {
  return (
    <aside className={styles.endpointCallout}>
      <div className={styles.endpointCalloutSection}>
        <strong className={styles.endpointCalloutLabel}>¿Qué hace?</strong>
        <p className={styles.endpointCalloutText}>{description}</p>
      </div>

      {fields.length > 0 ? (
        <div className={styles.endpointCalloutSection}>
          <strong className={styles.endpointCalloutLabel}>Campos y valores válidos</strong>
          <ul className={styles.endpointCalloutList}>
            {fields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {rules.length > 0 ? (
        <div className={styles.endpointCalloutSection}>
          <strong className={styles.endpointCalloutLabel}>Reglas útiles</strong>
          <ul className={styles.endpointCalloutList}>
            {rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={styles.endpointCalloutSection}>
        <strong className={styles.endpointCalloutLabel}>¿Qué devuelve?</strong>
        <ul className={styles.endpointCalloutList}>
          {response.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
