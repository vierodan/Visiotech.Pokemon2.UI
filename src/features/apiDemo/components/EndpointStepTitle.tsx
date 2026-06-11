import styles from './ApiDemo.module.css';

interface EndpointStepTitleProps {
  path: string | string[];
  title: string;
}

export function EndpointStepTitle({ path, title }: EndpointStepTitleProps): JSX.Element {
  const normalizedPath = Array.isArray(path) ? path.join(' · ') : path;

  return (
    <h4 className={styles.endpointStepTitle}>
      <span>{title}</span>{' '}
      <span className={styles.endpointStepPath}>[{normalizedPath}]</span>
    </h4>
  );
}
