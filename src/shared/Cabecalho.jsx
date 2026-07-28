import { FaArrowLeft } from 'react-icons/fa';

export function Cabecalho({ 
  titulo, 
  subtitulo, 
  icone: Icone, 
  corIcone = '#667eea',
  onVoltar,
  mostrarVoltar = false
}) {
  return (
    <div className="card-header">
      {mostrarVoltar && (
        <button 
          className="botao-voltar"
          onClick={onVoltar}
          aria-label="Voltar"
        >
          <FaArrowLeft size={18} />
          <span>Voltar</span>
        </button>
      )}
      
      {Icone && (
        <div className="logo-icon">
          <Icone size={40} color={corIcone} />
        </div>
      )}
      
      <h2>{titulo}</h2>
      {subtitulo && <p>{subtitulo}</p>}
    </div>
  );
}