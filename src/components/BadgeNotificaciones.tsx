// src/components/BadgeNotificaciones.tsx
// Badge de contador para notificaciones push en BottomNav/Sidebar

import type { ReactNode } from "react"

interface BadgeNotificacionesProps {
  count: number
  children?: ReactNode
  className?: string
}

export function BadgeNotificaciones({
  count,
  children,
  className = "",
}: BadgeNotificacionesProps) {
  if (count <= 0) return <>{children}</>

  const displayCount = count > 9 ? "9+" : String(count)
  const isDoubleDigit = count >= 10

  return (
    <span className={`relative inline-flex ${className}`}>
      {children}
      <span
        className={`
          absolute -top-1 -right-1 flex items-center justify-center
          min-w-[18px] h-5 rounded-full bg-red-500 text-white text-[10px] font-bold
          border-2 border-[#111218]
          ${isDoubleDigit ? "px-1" : "px-1.5"}
        `}
        aria-label={`${count} notificaciones pendientes`}
      >
        {displayCount}
      </span>
    </span>
  )
}
