import { apiClient } from "../../api/client";
import type { Quiz } from "../../api/types";

export async function generarQuiz(archivo: File, cantidad: number): Promise<Quiz> {
  const body = new FormData();
  body.append("archivo", archivo);
  return apiClient<Quiz>(`/quiz/?cantidad=${cantidad}`, { method: "POST", body });
}
