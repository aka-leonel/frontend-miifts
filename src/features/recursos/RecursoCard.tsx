import { Card, Button } from '../../components';
import { useBorrarRecurso } from './hooks';

interface RecursoCardProps {
  id: number;
  titulo: string;
  url: string;
  descripcion: string;
  tipo: string | null;
  usuarioId: number;
  currentUserId: number; // Para verificar ownership
  onEdit: () => void;
}

export const RecursoCard = ({ 
  id, titulo, url, descripcion, tipo, usuarioId, currentUserId, onEdit 
}: RecursoCardProps) => {
  const borrarRecurso = useBorrarRecurso();

  const isOwner = usuarioId === currentUserId;

  return (
    <Card className="p-4 space-y-2">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-text">{titulo}</h3>
        {tipo && <span className="text-xs text-accent uppercase">{tipo}</span>}
      </div>
      <p className="text-sm text-surface2">{descripcion}</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">
        Ver recurso
      </a>
      {isOwner && (
        <div className="flex gap-2 mt-2">
          <Button variant="ghost" onClick={onEdit} size="sm">Editar</Button>
          <Button variant="danger" onClick={() => borrarRecurso.mutate(id)} size="sm">Borrar</Button>
        </div>
      )}
    </Card>
  );
};
