import * as service from './service';

export const recursoSpec = (materiaId: number) => ({
  titulo: (r: any) => (r ? 'Editar recurso' : 'Agregar recurso'),
  fields: [
    { name: 'titulo', label: 'Título', type: 'text', required: true, max: 150 },
    { name: 'url', label: 'Link', type: 'url', required: true },
    { name: 'descripcion', label: 'Descripción', type: 'text', required: true },
    { name: 'tipo', label: 'Tipo', type: 'select', options: ['pdf', 'video', 'link'] },
  ],
  submit: {
    create: (v: any) => service.createRecurso({ ...v, materia_id: materiaId }),
    update: (id: number, v: any) => service.updateRecurso(id, { ...v, materia_id: materiaId }),
  },
  onError: { 403: 'toast', 422: 'fields' },
  invalidates: () => [['recursos-materia', materiaId]],
});
