import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaEnvelope,
  FaLock,
  FaUserPlus,
  FaSpinner,
  FaUser,
  FaCheckCircle,
  FaArrowLeft
} from 'react-icons/fa';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { BsShieldCheck } from 'react-icons/bs';
import { Cabecalho } from '../../shared/Cabecalho';
import '../../styles/Cadastro.css';

export function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const { cadastrar } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (evento) => {
    evento.preventDefault();

    if (!nome.trim()) {
      return setErro('Por favor, digite seu nome.');
    }

    if (senha !== confirmarSenha) {
      return setErro('As senhas não coincidem!');
    }

    if (senha.length < 6) {
      return setErro('A senha deve ter pelo menos 6 caracteres.');
    }

    if (!email.includes('@')) {
      return setErro('Digite um email válido.');
    }

    try {
      setErro('');
      setCarregando(true);
      await cadastrar(email, senha, nome);
      navigate('/tarefas');
    } catch (error) {
      const mensagensErro = {
        'auth/email-already-in-use': 'Este email já está cadastrado.',
        'auth/invalid-email': 'Email inválido. Verifique o formato.',
        'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
        'auth/configuration-not-found': '❌ Erro de configuração. Verifique o Firebase.',
        'auth/operation-not-allowed': '❌ Authentication está desativado.',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
        'auth/network-request-failed': 'Erro de rede. Verifique sua conexão.'
      };
      setErro(mensagensErro[error.code] || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const forcaSenha = () => {
    if (senha.length === 0) return 0;
    let forca = 0;
    if (senha.length >= 6) forca++;
    if (senha.match(/[a-z]/) && senha.match(/[A-Z]/)) forca++;
    if (senha.match(/\d/)) forca++;
    if (senha.match(/[^a-zA-Z\d]/)) forca++;
    return forca;
  };

  const forca = forcaSenha();
  const coresForca = ['', '#ff4444', '#ffaa44', '#44bb44', '#44dd44'];
  const textosForca = ['', 'Fraca', 'Média', 'Forte', 'Muito Forte'];

  return (
    <div className="container-cadastro">
      <div className="card-cadastro">
        <Cabecalho 
          titulo="Criar Conta"
          subtitulo="Comece sua jornada de produtividade"
          icone={BsShieldCheck}
          onVoltar={() => navigate('/login')}
   
        />

        {erro && (
          <div className="mensagem-erro">
            <FaEnvelope size={12} style={{ marginRight: 8 }} />
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="campo-formulario">
            <label>Nome</label>
            <div className="input-wrapper">
              <FaUser className="icone-input" size={12} />
              <input
                type="text"
                placeholder="Digite seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                disabled={carregando}
              />
            </div>
          </div>

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
                disabled={carregando}
              />
            </div>
          </div>

          <div className="campo-formulario">
            <label>Senha</label>
            <div className="input-wrapper">
              <FaLock className="icone-input" size={12} />
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Crie uma senha (mínimo 6 caracteres)"
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
            {senha.length > 0 && (
              <div className="forca-senha">
                <div className="barra-forca">
                  <div 
                    className="barra-forca-preenchida"
                    style={{ 
                      width: `${(forca / 4) * 100}%`,
                      background: coresForca[forca]
                    }}
                  />
                </div>
                <span style={{ color: coresForca[forca] }}>
                  {textosForca[forca]}
                </span>
              </div>
            )}
          </div>

          <div className="campo-formulario">
            <label>Confirmar Senha</label>
            <div className="input-wrapper">
              <FaCheckCircle className="icone-input" size={12} />
              <input
                type={mostrarConfirmarSenha ? 'text' : 'password'}
                placeholder="Confirme sua senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
                disabled={carregando}
              />
              <button
                type="button"
                className="botao-mostrar-senha"
                onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                disabled={carregando}
              >
                {mostrarConfirmarSenha ? (
                  <AiOutlineEyeInvisible size={18} />
                ) : (
                  <AiOutlineEye size={18} />
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={carregando}
            className="botao-cadastrar"
          >
            {carregando ? (
              <>
                <FaSpinner className="spinner" size={12} />
                Criando conta...
              </>
            ) : (
              <>
                <FaUserPlus size={12} />
                Criar Conta
              </>
            )}
          </button>
        </form>

        <div className="divider">
          <span>ou</span>
        </div>

        <p className="link-login">
          <FaArrowLeft size={12} style={{ marginRight: 8 }} />
          Já tem uma conta? <Link to="/login">Faça login</Link>
        </p>
      </div>
    </div>
  );
}