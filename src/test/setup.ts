// El paquete tiene tipados separados para Jest y Vitest — el matcher runtime
// es el mismo, pero solo "./vitest" amplía la interfaz `Assertion` de vitest
// (con el import plano, `expect(x).toBeInTheDocument()` no tipa).
import '@testing-library/jest-dom/vitest'
