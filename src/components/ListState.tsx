import type { ReactNode } from "react";

export function Skeleton() {
  return (
    <div className="space-y-3" role="status" aria-busy="true">
      <span className="sr-only">Cargando…</span>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} aria-hidden="true" className="h-20 animate-pulse rounded-2xl border border-border bg-surface2" />
      ))}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
    </div>
  );
}

export function ErrorState({ onRetry, title = "No se pudo cargar" }: { onRetry?: () => void; title?: string }) {
  return (
    <div role="alert" className="rounded-2xl border border-danger/40 bg-danger/10 p-6 text-center">
      <div className="text-base font-semibold text-danger">{title}</div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-xl border border-danger/50 bg-transparent px-3 py-2 text-sm font-medium text-danger"
        >
          Reintentar
        </button>
      ) : null}
    </div>
  );
}

type ListStateProps<T> = {
  loading: boolean;
  error: unknown;
  items?: T[];
  children: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
};

export function ListState<T>({
  loading,
  error,
  items,
  children,
  emptyTitle = "Sin elementos",
  emptyDescription = "Todavía no hay información para mostrar.",
  onRetry,
}: ListStateProps<T>) {
  if (loading) {
    return <Skeleton />;
  }

  if (error) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (!items || items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return <>{children}</>
}
