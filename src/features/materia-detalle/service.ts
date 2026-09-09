
// TODO: Implementar con API real
import { apiClient } from '../../lib/apiClient';
import type { Materia, Correlativa } from '../../api/types';

export const getMateria = async (id: number): Promise<Materia> => {
  // return apiClient(`/materias/${id}`);
  return Promise.resolve({ id, nombre: 'Materia Mock', codigo: 'M01', carrera_id: 1, anio: 1, cuatrimestre: 1 });
};

export const getCorrelativas = async (materiaId: number): Promise<Correlativa[]> => {
  // return apiClient(`/materias/correlativas/${materiaId}`);
  return Promise.resolve([]);
};
