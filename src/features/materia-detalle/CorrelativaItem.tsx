import { Card } from '../../components';

interface CorrelativaItemProps {
  nombre: string;
  codigo: string;
}

export const CorrelativaItem = ({ nombre, codigo }: CorrelativaItemProps) => {
  return (
    <Card className="p-4 flex items-center justify-between">
      <span className="font-medium text-text">{nombre}</span>
      <span className="text-sm text-secondary bg-surface2 px-2 py-1 rounded-pill">{codigo}</span>
    </Card>
  );
};
