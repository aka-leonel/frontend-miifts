
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as service from './service';

export const useRecursosDeMateria = (materiaId: number) => {
  return useQuery({
    queryKey: ['recursos-materia', materiaId],
    queryFn: () => service.getRecursosDeMateria(materiaId),
  });
};

export const useCrearRecurso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: service.createRecurso,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recursos-materia'] }),
  });
};

export const useEditarRecurso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => service.updateRecurso(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recursos-materia'] }),
  });
};

export const useBorrarRecurso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: service.deleteRecurso,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recursos-materia'] }),
  });
};
