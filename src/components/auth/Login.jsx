import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaEnvelope,
  FaLock,
  FaSignInAlt,
  FaUserPlus,
  FaSpinner
} from 'react-icons/fa';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { BsShieldLock } from 'react-icons/bs';
import { Cabecalho } from '../../shared/Cabecalho';
import '../../styles/Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (evento) => {
    evento.preventDefault();
    
    try {
      setErro('');
      setCarregando(true);
      await login(email, senha);
      navigate('/tarefas');
    } catch (error) {
      const mensagensErro = {
        'auth/user-not-found': 'Usuário não encontrado. Verifique seu email.',
        'auth/wrong-password': 'Senha incorreta. Tente novamente.',
        'auth/invalid-email': 'Email inválido. Verifique o formato.',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
        'auth/network-request-failed': 'Erro de rede. Verifique sua conexão.'
      };
      setErro(mensagensErro[error.code] || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container-login">
      <div className="card-login">
        <Cabecalho 
          titulo="Bem-vindo de volta!"
          subtitulo="Faça login para continuar"
          icone={BsShieldLock}
        />

        {erro && (
          <div className="mensagem-erro">
            <FaEnvelope siza={12}style={{ marginRight: 8 }} />
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="campo-formulario">
            <label>Email</label>
            <div className="input-wrapper">
              <FaEnvelope className="icone-input" size={12}/>
              <input
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={carregando}
              />
            </div>
          </div>

          <div className="campo-formulario">
            <label>Senha</label>
            <div className="input-wrapper">
              <FaLock className="icone-input" size={12}/>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={carregando}
              />
              <button
                type="button"
                className="botao-mostrar-senha"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                disabled={carregando}
              >
                {mostrarSenha ? (
                  <AiOutlineEyeInvisible size={18} />
                ) : (
                  <AiOutlineEye size={18} />
                )}
              </button>
            </div>
          </div>

          <div className="opcoes-login">
            <label className="checkbox-lembrar">
              <input type="checkbox" />
              <span>Lembrar-me</span>
            </label>
            <Link to="/esqueci-senha" className="esqueci-senha">
              Esqueceu a senha?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={carregando}
            className="botao-entrar"
          >
            {carregando ? (
              <>
                <FaSpinner className="spinner" size={12}/>
                Entrando...
              </>
            ) : (
              <>
                <FaSignInAlt size={12}/>
                Entrar
              </>
            )}
          </button>
        </form>

        <div className="divider">
          <span>ou</span>
        </div>

        <p className="link-cadastro">
          <FaUserPlus siza={12}style={{ marginRight: 8 }} />
          Não tem uma conta? <Link to="/cadastro">Cadastre-se gratuitamente</Link>
        </p>
      </div>
    </div>
  );
}