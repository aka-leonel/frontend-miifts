// Interruptor DEMO: `VITE_DEMO_MODE=true` (en `.env`) para recorrer la UI sin backend.
//
// Los `service.ts` de cada feature deciden por acá si responder con datos hardcodeados
// (módulos `./demo.ts`) o pegarle a la API real. Cuando el backend esté estable en
// `VITE_API_URL`, poné `VITE_DEMO_MODE=false` y los services no cambian su interfaz.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";