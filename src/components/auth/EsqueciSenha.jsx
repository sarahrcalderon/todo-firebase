import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaSpinner, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { BsShieldLock } from 'react-icons/bs';
import { Cabecalho } from '../../shared/Cabecalho';
import '../../styles/Login.css';

export function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const { recuperarSenha } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (evento) => {
    evento.preventDefault();

    if (!email) {
      return setErro('Digite seu email.');
    }

    try {
      setErro('');
      setSucesso(false);
      setCarregando(true);
      await recuperarSenha(email);
      setSucesso(true);
      setEmail('');
    } catch (error) {
      const mensagensErro = {
        'auth/user-not-found': 'Usuário não encontrado com este email.',
        'auth/invalid-email': 'Email inválido. Verifique o formato.',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.'
      };
      setErro(mensagensErro[error.code] || 'Erro ao enviar email. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container-login">
      <div className="card-login">
        <Cabecalho 
          titulo="Recuperar Senha"
          subtitulo="Enviaremos um link para redefinir sua senha"
          icone={BsShieldLock}
          onVoltar={() => navigate('/login')}
       
        />

        {erro && (
          <div className="mensagem-erro">
            <FaEnvelope size={12} style={{ marginRight: 8 }} />
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="mensagem-sucesso">
            <FaCheckCircle size={12} style={{ marginRight: 8 }} />
            <div>
              <strong>Email enviado!</strong>
              <p>Verifique sua caixa de entrada para redefinir sua senha.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="campo-formulario">
            <label>Email</label>
            <div className="input-wrapper">
              <FaEnvelope className="icone-input" size={12} />
              <input
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={carregando || sucesso}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={carregando || sucesso}
            className="botao-entrar"
          >
            {carregando ? (
              <>
                <FaSpinner className="spinner" size={12} />
                Enviando...
              </>
            ) : (
              <>
              
                Enviar Link de Recuperação
              </>
            )}
          </button>
        </form>

        <div className="divider">
          <span>ou</span>
        </div>

        <p className="link-cadastro">
          <FaArrowLeft size={14} style={{ marginRight: 8 }} />
          <Link to="/login">Voltar para o login</Link>
        </p>
      </div>
    </div>
  );
}