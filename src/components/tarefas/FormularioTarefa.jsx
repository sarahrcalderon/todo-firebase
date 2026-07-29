
import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';

export function FormularioTarefa({ onAdicionar, carregando }) {
  const [texto, setTexto] = useState('');

  const handleSubmit = async (evento) => {
    evento.preventDefault();
    if (!texto.trim()) return;

    await onAdicionar(texto);
    setTexto('');
  };

  return (
    <form onSubmit={handleSubmit} className="formulario-tarefa">
      <input
        type="text"
        placeholder="Digite sua nova tarefa..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        disabled={carregando}
      />
      <button type="submit" disabled={carregando || !texto.trim()}
         style={{
          backgroundColor: '#6872dc', 
          color: '#ffffff',
          border: 'none',
          borderRadius: '12px',
          padding: '14px 28px',
          fontWeight: '600',
          fontSize: '15px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 15px rgba(104, 114, 220, 0.4)',
          opacity: (!texto.trim() || carregando) ? '0.5' : '1',
          pointerEvents: (!texto.trim() || carregando) ? 'none' : 'auto'
        }}
        onMouseEnter={(e) => {
          if (texto.trim() && !carregando) {
            e.currentTarget.style.backgroundColor = '#5a64c9';  
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(104, 114, 220, 0.5)';
          }
        }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#6872dc';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(104, 114, 220, 0.4)';
      }}
      >
        <FaPlus />
        Adicionar
      </button>
    </form>
  );
}