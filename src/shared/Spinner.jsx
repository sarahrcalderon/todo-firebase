import { FaSpinner } from 'react-icons/fa';

export function Spinner({ 
  tamanho = 20, 
  cor = '#667eea',
  texto = 'Carregando...' 
}) {
  return (
    <div className="carregando-central">
      <FaSpinner className="spinner" size={tamanho} color={cor} />
      <p>{texto}</p>
    </div>
  );
}