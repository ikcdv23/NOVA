import { store } from '@/config/store';

/** Shared text signature; the name stays selectable and accessible. */
export function Wordmark({ className = '' }: { className?: string }) {
  return <span className={`brand-wordmark ${className}`.trim()}>{store.shortName}</span>;
}
