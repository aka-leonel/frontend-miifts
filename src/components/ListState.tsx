import type { ReactNode } from "react";

export function Skeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-20 animate-pulse rounded-2xl border border-border bg-[#2A2B36]" />
      ))}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-[#1A1B23] p-8 text-center">
      <div className="text-lg font-semibold text-text">{title}</div>
      {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
    </div>
  );
}

export function ErrorState({ onRetry, title = "No se pudo cargar" }: { onRetry?: () => void; title?: string }) {
  return (
    <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-center">
      <div className="text-base font-semibold text-red-100">{title}</div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-xl border border-red-500/50 bg-transparent px-3 py-2 text-sm font-medium text-red-100"
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
