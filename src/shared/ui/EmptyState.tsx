import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

type EmptyStateProps = {
  readonly title: string;
  readonly children: ReactNode;
};

export const EmptyState = ({ title, children }: EmptyStateProps) => (
  <section className={styles.emptyState}>
    <h1 className={styles.title}>{title}</h1>
    <div className={styles.body}>{children}</div>
  </section>
);
