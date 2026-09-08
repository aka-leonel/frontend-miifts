# Changelog

## [Unreleased]

### Added
- QueryClientProvider con TanStack Query para la app React.
- Guard de rutas admin (`RutaAdmin`) para proteger `/admin/catalogo`.
- Manejo de expiración de sesión con detección de token vencido y aviso previo.
- Modal de "Extender sesión" por re-login cuando el backend no expone un endpoint de refresh.
- Actualización de README con el estado actual de Fundaciones.

### Fixed
- Corrección del `AuthContext` para incluir `verificandoSesion` en el `value` del provider.
- Ajuste de la ruta de catálogo y enlace visible solo para usuarios admin.
