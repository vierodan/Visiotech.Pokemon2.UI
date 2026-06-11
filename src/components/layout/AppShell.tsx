import type { PropsWithChildren } from 'react';
import styles from './AppShell.module.css';

export function AppShell({ children }: PropsWithChildren): JSX.Element {
  return (
    <div className={styles.shell}>
      <div className={styles.backdrop} />
      <div className={styles.content}>{children}</div>
    </div>
  );
}

