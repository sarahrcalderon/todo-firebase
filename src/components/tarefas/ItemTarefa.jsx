import { useState } from 'react';
import { 
  FaEdit, 
  FaTrash, 
  FaCircle 
} from 'react-icons/fa';
import { BsFillCheckCircleFill } from 'react-icons/bs';

export function ItemTarefa({ 
  tarefa, 
  onAlternar, 
  onEditar, 
  onExcluir 
}) {
  const [editando, setEditando] = useState(false);
  const [textoEditado, setTextoEditado] = useState(tarefa.texto);

  const handleEditar = () => {
    if (textoEditado.trim()) {
      onEditar(tarefa.id, textoEditado);
      setEditando(false);
    }
  };

  const formatarData = (timestamp) => {
    if (!timestamp) return 'Agora';
    const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <li className={`item-tarefa ${tarefa.concluida ? 'concluida' : ''}`}>
      <button
        className="botao-check"
        onClick={() => onAlternar(tarefa.id, tarefa.concluida)}
        aria-label={tarefa.concluida ? 'Marcar como pendente' : 'Marcar como concluída'}
      >
        {tarefa.concluida ? (
          <BsFillCheckCircleFill size={18} color="#2ecc71" />
        ) : (
          <FaCircle size={18} color="#d1d5db" />
        )}
      </button>

      {editando ? (
        <input
          type="text"
          className="input-edicao"
          value={textoEditado}
          onChange={(e) => setTextoEditado(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleEditar()}
          onBlur={handleEditar}
          autoFocus
        />
      ) : (
        <span className="texto-tarefa">
          {tarefa.texto}
          <small className="data-tarefa">
            📅 {formatarData(tarefa.criadoEm)}
          </small>
        </span>
      )}

      <div className="botoes-tarefa">
        {!editando && (
          <button 
            onClick={() => {
              setEditando(true);
              setTextoEditado(tarefa.texto);
            }}
            className="botao-editar"
            aria-label="Editar tarefa"
              style={{
                backgroundColor: '#7c3aed',  
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#6d28d9';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#7c3aed';
                e.currentTarget.style.transform = 'scale(1)';
              }}
          >
            
            <FaEdit/>
          </button>
        )}
        <button 
          onClick={() => {
            if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
              onExcluir(tarefa.id);
            }
          }}
          className="botao-excluir"
          aria-label="Excluir tarefa"
        >
          <FaTrash />
        </button>
      </div>
    </li>
  );
}