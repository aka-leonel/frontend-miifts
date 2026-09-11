import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, FormModal, Section } from '../../components';
import { useMateria, useCorrelativas } from './hooks';
import { useRecursosDeMateria } from '../recursos/hooks';
import { RecursoCard } from '../recursos/RecursoCard';
import { CorrelativaItem } from './CorrelativaItem';
import { recursoSpec } from '../recursos/recursoSpec';

// TODO: Importar de features/materias/materiaUsuarioSpec cuando esté disponible
const materiaUsuarioSpecMock = { titulo: () => "Editar notas" }; 
// TODO: Importar de features/recordatorios/hooks cuando esté disponible
const useRecordatoriosMock = (f: any) => ({ data: { items: [] } }); 
// TODO: Importar de features/recordatorios/RecordatorioCard cuando esté disponible
const RecordatorioCardMock = () => <div>Recordatorio Mock</div>;

export const MateriaDetalleScreen = () => {
  const { id } = useParams<{ id: string }>();
  const materiaId = Number(id);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSpec, setModalSpec] = useState<any>(null);

  const { data: materia, isLoading: loadingMateria } = useMateria(materiaId);
  const { data: correlativas } = useCorrelativas(materiaId);
  const { data: recursos } = useRecursosDeMateria(materiaId);
  const { data: recordatorios } = useRecordatoriosMock({ materia_id: materiaId });

  if (loadingMateria) return <div>Cargando...</div>;
  if (!materia) return <div>Materia no encontrada</div>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-text">{materia.nombre}</h1>
      
      <Button onClick={() => { setModalSpec(materiaUsuarioSpecMock); setModalOpen(true); }}>
        Editar notas
      </Button>

      <Section title="Correlativas">
        {correlativas?.map(c => (
          <CorrelativaItem key={c.id} nombre={c.requiere?.nombre || 'Desconocida'} codigo={c.requiere?.codigo || ''} />
        ))}
      </Section>

      <Section title="Recursos" action={<Button onClick={() => { setModalSpec(recursoSpec(materiaId)); setModalOpen(true); }}>Agregar</Button>}>
        {recursos?.map(r => (
          <RecursoCard 
            key={r.id} {...r} 
            currentUserId={1} // TODO: Obtener del auth context
            onEdit={() => { setModalSpec(recursoSpec(materiaId)); setModalOpen(true); }}
          />
        ))}
      </Section>

      <Section title="Recordatorios">
        {/* @ts-ignore */}
        {recordatorios?.items?.map(r => <RecordatorioCardMock key={r.id} />)}
      </Section>

      {modalSpec && (
        <FormModal spec={modalSpec} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
};
