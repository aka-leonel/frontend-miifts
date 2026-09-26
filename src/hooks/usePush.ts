// Hook para gestionar notificaciones push - miIFTS

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "../api/client"
import {
  registrarSW,
  solicitarPermiso,
  suscribirPush,
  desuscribirPush,
  obtenerSubscriptionActual,
  suscripcionAJSON,
  esPushSoportado,
} from "../lib/push"

export type PushState = {
  isSupported: boolean
  permission: NotificationPermission
  subscription: PushSubscription | null
  contadorPendientes: number
  loading: boolean
  error: string | null
}

export type PushActions = {
  registrar: () => Promise<void>
  activar: () => Promise<void>
  desactivar: () => Promise<void>
  actualizarContador: () => Promise<void>
  cargarContador: () => Promise<void>
}

export function usePush(): PushState & PushActions {
  const [state, setState] = useState<PushState>({
    isSupported: false,
    permission: "default",
    subscription: null,
    contadorPendientes: 0,
    loading: false,
    error: null,
  })

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY

  // Verificar soporte inicial
  useEffect(() => {
    const supported = esPushSoportado()
    setState((prev) => ({ ...prev, isSupported: supported }))

    if (supported) {
      // Notification.permission es un string, no una Promise
      setState((prev) => ({ ...prev, permission: Notification.permission }))

      // Registrar SW y verificar suscripción existente
      registrarSW().then(async (registration) => {
        if (!registration) return

        const sub = await obtenerSubscriptionActual(registration)
        if (!sub) {
          setState((prev) => ({ ...prev, subscription: null }))
          return
        }

        // Verificar que la suscripción local existe en el backend
        try {
          const status = await apiClient<{ subscribed: boolean; endpoint: string | null }>(
            "/notificaciones/suscripcion",
            { auth: true }
          )
          if (status?.subscribed && status?.endpoint === sub.endpoint) {
            // Si existe en BD y coincide el endpoint, usar la suscripción local
            setState((prev) => ({ ...prev, subscription: sub }))
            await cargarContador()
          } else {
            // Si no existe en BD o endpoint distinto, limpiar suscripción local obsoleta
            await desuscribirPush(registration)
            setState((prev) => ({ ...prev, subscription: null }))
          }
        } catch {
          // Error de red/auth, limpiar por seguridad
          await desuscribirPush(registration)
          setState((prev) => ({ ...prev, subscription: null }))
        }
      })
    }
  }, [])

  // Escuchar mensajes del SW para actualizar contador en foreground
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PUSH_RECIBIDO") {
        actualizarContador()
      }
    }

    navigator.serviceWorker.addEventListener("message", handleMessage)
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage)
    }
  }, [])

  const registrar = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const registration = await registrarSW()
      if (!registration) throw new Error("No se pudo registrar Service Worker")

      const permission = await solicitarPermiso()
      setState((prev) => ({ ...prev, permission }))

      if (permission !== "granted") {
        throw new Error("Permiso denegado")
      }

      if (!vapidPublicKey) {
        throw new Error("VITE_VAPID_PUBLIC_KEY no configurada")
      }

      const subscription = await suscribirPush(registration, vapidPublicKey)
      if (!subscription) throw new Error("No se pudo crear suscripción")

      // Enviar suscripción al backend
      const payload = suscripcionAJSON(subscription)
      await apiClient("/notificaciones/suscripcion", {
        method: "POST",
        body: payload,
        auth: true,
      })

      setState((prev) => ({ ...prev, subscription, loading: false }))
      await cargarContador()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error activando notificaciones"
      setState((prev) => ({ ...prev, loading: false, error: message }))
      throw err
    }
  }, [vapidPublicKey])

  const activar = useCallback(async () => {
    await registrar()
  }, [registrar])

  const desactivar = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await obtenerSubscriptionActual(registration)

      if (subscription) {
        const endpoint = subscription.endpoint
        await apiClient("/notificaciones/suscripcion", {
          method: "DELETE",
          body: { endpoint },
          auth: true,
        })
        await desuscribirPush(registration)
      }

      setState((prev) => ({
        ...prev,
        subscription: null,
        contadorPendientes: 0,
        loading: false,
      }))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error desactivando notificaciones"
      setState((prev) => ({ ...prev, loading: false, error: message }))
      throw err
    }
  }, [])

  const cargarContador = useCallback(async () => {
    try {
      const response = await apiClient<{ total: number }>(
        "/recordatorios?estado=pendiente&limit=1",
        {
          auth: true,
        },
      )
      setState((prev) => ({
        ...prev,
        contadorPendientes: response?.total ?? 0,
      }))
    } catch (err) {
      console.error("[Push] Error cargando contador:", err)
      setState((prev) => ({ ...prev, contadorPendientes: 0 }))
    }
  }, [])

  const actualizarContador = useCallback(async () => {
    await cargarContador()
  }, [cargarContador])

  return {
    ...state,
    registrar,
    activar,
    desactivar,
    actualizarContador,
    cargarContador,
  }
}
