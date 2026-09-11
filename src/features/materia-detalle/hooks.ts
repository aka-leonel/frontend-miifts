
import { useQuery } from '@tanstack/react-query';
import * as service from './service';

export const useMateria = (id: number) => {
  return useQuery({
    queryKey: ['materia', id],
    queryFn: () => service.getMateria(id),
  });
};

export const useCorrelativas = (id: number) => {
  return useQuery({
    queryKey: ['correlativas', id],
    queryFn: () => service.getCorrelativas(id),
  });
};
