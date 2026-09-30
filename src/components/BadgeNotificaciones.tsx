// Badge de contador para notificaciones, sobre el ícono de Recordatorios en
// BottomNav/SidebarNav. Rescatado de feature/recordatorios-front (ver nota
// en src/lib/push.ts) y pasado a los tokens de color del tema.
import type { ReactNode } from "react";

type Props = {
  count: number;
  children?: ReactNode;
  className?: string;
};

export function BadgeNotificaciones({ count, children, className = "" }: Props) {
  if (count <= 0) return <>{children}</>;

  const texto = count > 9 ? "9+" : String(count);

  return (
    <span className={`relative inline-flex ${className}`}>
      {children}
      <span
        aria-hidden="true"
        className={[
          "absolute -right-1.5 -top-1.5 flex h-5 min-w-[18px] items-center justify-center rounded-full",
          "border-2 border-card bg-danger-solid text-[0.625rem] font-bold text-on-solid",
          count > 9 ? "px-1" : "px-1.5",
        ].join(" ")}
      >
        {texto}
      </span>
      <span className="sr-only"> ({count} notificacion{count !== 1 ? "es" : ""} pendiente{count !== 1 ? "s" : ""})</span>
    </span>
  );
}
