import styles from './ApiDemo.module.css';

interface TestingGuideProps {
  hint?: string;
  steps: string[];
  title?: string;
}

export function TestingGuide({
  hint,
  steps,
  title = 'Cómo probar esta sección',
}: TestingGuideProps): JSX.Element {
  return (
    <aside className={styles.testingGuide}>
      <strong className={styles.testingGuideTitle}>{title}</strong>
      <ol className={styles.testingGuideList}>
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      {hint ? <p className={styles.testingGuideHint}>{hint}</p> : null}
    </aside>
  );
}
