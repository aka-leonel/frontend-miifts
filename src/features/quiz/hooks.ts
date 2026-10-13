import { useAsyncAction } from "../../hooks/useAsyncQuery";
import { generarQuiz } from "./service";
import type { Quiz } from "../../api/types";

export function useGenerarQuiz() {
  return useAsyncAction<[File, number], Quiz>((archivo, cantidad) => generarQuiz(archivo, cantidad));
}
