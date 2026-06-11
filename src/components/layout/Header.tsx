import brandMark from '../../assets/brandMark.svg';
import { apiConfig, hasConfiguredApi } from '../../api/apiConfig';
import styles from './Header.module.css';

export function Header(): JSX.Element {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <img className={styles.logo} src={brandMark} alt="Visiotech UI Demo" />
        <div>
          <p className={styles.kicker}>Frontend foundation</p>
          <h1 className={styles.title}>Visiotech UI Demo</h1>
        </div>
      </div>

      <div className={styles.meta}>
        <span className={hasConfiguredApi ? styles.statusOnline : styles.statusMock}>
          {hasConfiguredApi ? 'API configurada' : 'Modo mock'}
        </span>
        <span className={styles.endpoint}>
          {hasConfiguredApi ? apiConfig.baseUrl : 'Pendiente de VITE_API_BASE_URL'}
        </span>
      </div>
    </header>
  );
}

