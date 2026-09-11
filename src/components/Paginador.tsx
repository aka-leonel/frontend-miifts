type PaginadorProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Paginador({ page, totalPages, onPageChange }: PaginadorProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-5 flex items-center justify-center gap-3">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-xl border border-border bg-transparent px-3 py-2 text-sm text-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        Anterior
      </button>

      <span className="text-sm text-text">
        Página {page} / {totalPages}
      </span>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-xl border border-border bg-transparent px-3 py-2 text-sm text-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        Siguiente
      </button>
    </div>
  );
}
