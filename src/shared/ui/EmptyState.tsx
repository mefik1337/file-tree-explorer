import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

type EmptyStateProps = {
  readonly title: string;
  readonly icon: ReactNode;
  readonly children: ReactNode;
};

export const EmptyState = ({ title, icon, children }: EmptyStateProps) => (
  <section className={styles.emptyState}>
    <div className={styles.icon}>{icon}</div>
    <h1 className={styles.title}>{title}</h1>
    <div className={styles.body}>{children}</div>
  </section>
);
