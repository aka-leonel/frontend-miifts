
// TODO: Implementar con API real
import { apiClient } from '../../lib/apiClient';
import type { Recurso, RecursoCreate } from '../../api/types';

export const getRecursosDeMateria = async (materiaId: number): Promise<Recurso[]> => {
  // return apiClient(`/recursos/materia/${materiaId}`);
  return Promise.resolve([]);
};

export const createRecurso = async (data: RecursoCreate) => {
  // return apiClient(`/recursos/`, { method: 'POST', body: data });
  return Promise.resolve();
};

export const updateRecurso = async (id: number, data: RecursoCreate) => {
  // return apiClient(`/recursos/${id}`, { method: 'PUT', body: data });
  return Promise.resolve();
};

export const deleteRecurso = async (id: number) => {
  // return apiClient(`/recursos/${id}`, { method: 'DELETE' });
  return Promise.resolve();
};
