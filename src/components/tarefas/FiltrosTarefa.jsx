import { FaList, FaClock, FaCheck, FaShieldAlt } from 'react-icons/fa';

export function FiltrosTarefa({ 
  filtro, 
  onFiltroChange, 
  estatisticas, 
  ehAdmin 
}) {
  const { total, concluidas, ativas } = estatisticas;

  const filtros = [
    { id: 'todas', label: 'Todas', icone: FaList, contador: total },
    { id: 'ativas', label: 'Ativas', icone: FaClock, contador: ativas },
    { id: 'concluidas', label: 'Concluídas', icone: FaCheck, contador: concluidas },
  ];

  return (
    <div className="filtros">
      {filtros.map(({ id, label, icone: Icone, contador }) => (
        <button
          key={id}
          className={filtro === id ? 'ativo' : ''}
          onClick={() => onFiltroChange(id)}
        >
          <Icone />
          {label}
          <span className="contador-filtro">{contador}</span>
        </button>
      ))}
      
      {ehAdmin && (
        <button 
          className="botao-admin-filtro" 
          onClick={() => alert('🔑 Modo Admin: Visualizando todas as tarefas!')}
        >
          <FaShieldAlt />
          Admin
        </button>
      )}
    </div>
  );
}