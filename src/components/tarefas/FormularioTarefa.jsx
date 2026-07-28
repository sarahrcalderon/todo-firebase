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
      <button type="submit" disabled={carregando || !texto.trim()}>
        <FaPlus />
        Adicionar
      </button>
    </form>
  );
}