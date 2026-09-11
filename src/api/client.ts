// SEAM · trabajo de Integrante 1 (Fundaciones).
//
// Bridge a la implementación HTTP que YA existe en `src/lib/apiClient.ts`, para que el
// resto del equipo importe desde `@/api/client` (la ruta canónica del README). Cuando
// Int. 1 consolide el cliente acá mismo, solo cambia este archivo.
export { apiClient, ApiError } from "../lib/apiClient";
export type { ApiClientOptions, ApiFieldErrors } from "../lib/apiClient";