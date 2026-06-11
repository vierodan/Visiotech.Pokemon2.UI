import type { PropsWithChildren } from 'react';
import styles from './MainContent.module.css';

export function MainContent({ children }: PropsWithChildren): JSX.Element {
  return <main className={styles.main}>{children}</main>;
}

