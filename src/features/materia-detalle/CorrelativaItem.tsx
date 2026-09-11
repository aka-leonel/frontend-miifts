interface CorrelativaItemProps {
  nombre: string;
  codigo: string;
}

export function CorrelativaItem({ nombre, codigo }: CorrelativaItemProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
      <span className="font-medium text-text">{nombre}</span>
      <span className="rounded-full bg-surface2 px-2 py-1 text-sm text-muted">{codigo}</span>
    </div>
  );
}
