import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTarefas } from '../../hooks/useTarefas';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { 
  FaSignOutAlt, 
  FaList, 
  FaChartLine,
  FaSpinner,
  FaCamera
} from 'react-icons/fa';
import { ItemTarefa } from './ItemTarefa';
import { FiltrosTarefa } from './FiltrosTarefa';
import { FormularioTarefa } from './FormularioTarefa';
import { db } from '../../firebase/config';
import '../../styles/ListaTarefa.css';

export function ListaTarefa() {
  const { usuario, logout } = useAuth();
  const [filtro, setFiltro] = useState('todas');
  const [fotoPerfilTemp, setFotoPerfilTemp] = useState(null);
  const [fotoSelecionada, setFotoSelecionada] = useState(null);
  const [uploadCarregando, setUploadCarregando] = useState(false);
  const fileInputRef = useRef(null);

  const { 
    tarefas, 
    carregando, 
    erro,
    adicionarTarefa,
    alternarStatus,
    atualizarTarefa,
    removerTarefa,
    filtrarTarefas,
    getEstatisticas,
    ehAdmin
  } = useTarefas();

  const tarefasFiltradas = filtrarTarefas(tarefas, filtro);
  const estatisticas = getEstatisticas();

  const comprimirImagem = (dataUrl) => new Promise((resolve, reject) => {
    const imagem = new Image();

    imagem.onload = () => {
      const tamanhoMaximo = 256;
      const escala = Math.min(tamanhoMaximo / imagem.width, tamanhoMaximo / imagem.height, 1);
      const largura = Math.max(1, Math.round(imagem.width * escala));
      const altura = Math.max(1, Math.round(imagem.height * escala));

      const canvas = document.createElement('canvas');
      canvas.width = largura;
      canvas.height = altura;

      const contexto = canvas.getContext('2d');
      if (!contexto) {
        reject(new Error('Não foi possível processar a imagem.'));
        return;
      }

      contexto.drawImage(imagem, 0, 0, largura, altura);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };

    imagem.onerror = () => {
      reject(new Error('Não foi possível carregar a imagem.'));
    };
    imagem.src = dataUrl;
  });

  const handleSelecionarFoto = (evento) => {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;


    if (!arquivo.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    if (!usuario?.uid) {
      alert('Faça login novamente para salvar a foto.');
      return;
    }

    const leitor = new FileReader();
    leitor.onloadend = () => {
      setFotoPerfilTemp(leitor.result);
    };
    leitor.onerror = () => {
    };
    leitor.readAsDataURL(arquivo);

    setFotoSelecionada(arquivo);
    evento.target.value = '';
  };

  const handleSalvarFoto = async () => {
    if (!fotoSelecionada || !fotoPerfilTemp) {
      alert('Selecione uma imagem antes de salvar.');
      return;
    }

    if (!usuario?.uid) {
      alert('Faça login novamente para salvar a foto.');
      return;
    }

    setUploadCarregando(true);

    try {
      const url = await comprimirImagem(fotoPerfilTemp);

      localStorage.setItem(`fotoPerfil:${usuario.uid}`, url);
      setFotoPerfilTemp(url);
      setFotoSelecionada(null);

      await setDoc(doc(db, 'usuarios', usuario.uid), {
        email: usuario.email,
        displayName: usuario.displayName || null,
        photoURL: url,
        atualizadoEm: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      alert('Erro ao salvar a imagem. Tente novamente.');
      console.error('Erro ao salvar foto:', error);
    } finally {
      setUploadCarregando(false);
    }
  };

  useEffect(() => {
    if (!usuario?.uid) {
      setFotoPerfilTemp(null);
      setFotoSelecionada(null);
      return;
    }

    const carregarFotoPersistida = async () => {
      const fotoCache = localStorage.getItem(`fotoPerfil:${usuario.uid}`);

      if (fotoCache) {
        setFotoPerfilTemp(fotoCache);
        return;
      }

      try {
        const referenciaUsuario = doc(db, 'usuarios', usuario.uid);
        const snapshot = await getDoc(referenciaUsuario);
        const fotoFirestore = snapshot.exists() ? snapshot.data()?.photoURL : null;

        if (fotoFirestore) {
          setFotoPerfilTemp(fotoFirestore);
          localStorage.setItem(`fotoPerfil:${usuario.uid}`, fotoFirestore);
        }
      } catch (error) {
        console.error('Erro ao carregar foto salva:', error);
      }
    };

    carregarFotoPersistida();
  }, [usuario]);

  const fotoPerfil = fotoPerfilTemp || usuario?.photoURL || null;

  const temFotoSalva = Boolean(fotoPerfil);
  const botaoFotoTexto = fotoSelecionada
    ? 'Salvar foto'
    : temFotoSalva
      ? 'Alterar foto'
      : 'Escolher foto';

  const abrirSeletorArquivos = () => {
    fileInputRef.current?.click();
  };

  const lidarComBotaoFoto = () => {
    if (fotoSelecionada) {
      handleSalvarFoto();
      return;
    }

    abrirSeletorArquivos();
  };

  // Obtém a primeira letra do nome/email para o avatar
  const getIniciais = () => {
    if (usuario?.displayName) {
      return usuario.displayName.charAt(0).toUpperCase();
    }
    if (usuario?.email) {
      return usuario.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="container-lista-full">
      <div className="layout-duas-colunas">   
        <aside className="coluna-perfil">
          <div className="perfil-container">
       
            <div className="avatar-container">
              <div 
                className="avatar-circle"
                onClick={abrirSeletorArquivos}
                style={{ cursor: 'pointer' }}
              >
                {fotoPerfil ? (
                  <img 
                    src={fotoPerfil} 
                    alt="Foto de perfil" 
                    className="avatar-imagem"
                  />
                ) : (
                  <span className="avatar-iniciais">
                    {getIniciais()}
                  </span>
                )}
                
                {/* Ícone de câmera para upload */}
                <div className="avatar-overlay">
                  {uploadCarregando ? (
                    <FaSpinner className="spinner-upload" />
                  ) : (
                    <FaCamera size={24} />
                  )}
                </div>
              </div>
              
              {/* Input de arquivo oculto */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleSelecionarFoto}
                accept="image/*"
                style={{ display: 'none' }}
              />
              
              <p className="avatar-hint">
                Clique para {fotoSelecionada ? 'salvar a foto' : temFotoSalva ? 'alterar a foto' : 'escolher a foto'}
              </p>

              <button
                type="button"
                className="botao-salvar-foto"
                onClick={lidarComBotaoFoto}
                disabled={uploadCarregando}
              >
                {uploadCarregando ? 'Salvando foto...' : botaoFotoTexto}
              </button>
            </div>

            {/* INFORMAÇÕES DO USUÁRIO */}
            <div className="perfil-info">
              <h2 className="perfil-nome">
                {usuario?.displayName || 'Usuário'}
              </h2>
              <p className="perfil-email">
                {usuario?.email}
              </p>
              {ehAdmin && (
                <span className="perfil-admin-badge">🔑 Administrador</span>
              )}
            </div>

            {/* ESTATÍSTICAS DO PERFIL */}
            <div className="perfil-estatisticas">
              <div className="estatistica-item">
                <span className="estatistica-valor">{estatisticas.total}</span>
                <span className="estatistica-label">Total</span>
              </div>
              <div className="estatistica-divider"></div>
              <div className="estatistica-item">
                <span className="estatistica-valor">{estatisticas.concluidas}</span>
                <span className="estatistica-label">Concluídas</span>
              </div>
              <div className="estatistica-divider"></div>
              <div className="estatistica-item">
                <span className="estatistica-valor">{estatisticas.ativas}</span>
                <span className="estatistica-label">Ativas</span>
              </div>
            </div>

            {/* BOTÃO DE LOGOUT */}
            <button onClick={logout} className="perfil-botao-sair">
              <FaSignOutAlt />
              Sair
            </button>
          </div>
        </aside>

        <main className="coluna-tarefas">
          <header className="cabecalho-tarefas">
            <div className="cabecalho-tarefas-esquerdo">
              <h1>
                <FaList style={{ marginRight: 12 }} />
                Minhas Tarefas
              </h1>
              <span className="badge-total">
                {estatisticas.total} {estatisticas.total === 1 ? 'tarefa' : 'tarefas'}
              </span>
            </div>
          </header>

          <div className="progresso-container">
            <div className="progresso-info">
              <span>
                <FaChartLine style={{ marginRight: 8 }} />
                Progresso
              </span>
              <span>{estatisticas.concluidas} de {estatisticas.total} concluídas</span>
              <span className="porcentagem-progresso">{estatisticas.progresso}%</span>
            </div>
            <div className="barra-progresso">
              <div 
                className="barra-progresso-preenchida" 
                style={{ width: `${estatisticas.progresso}%` }}
              />
            </div>
          </div>

          <FiltrosTarefa
            filtro={filtro}
            onFiltroChange={setFiltro}
            estatisticas={estatisticas}
            ehAdmin={ehAdmin}
          />

          <FormularioTarefa
            onAdicionar={adicionarTarefa}
            carregando={carregando}
          />

          {erro && (
            <div className="mensagem-erro">
              ⚠️ {erro}
            </div>
          )}

          {carregando ? (
            <div className="carregando">
              <FaSpinner className="spinner" />
              Carregando tarefas...
            </div>
          ) : tarefasFiltradas.length === 0 ? (
            <div className="sem-tarefas">
              {filtro === 'todas' && '🎉 Nenhuma tarefa cadastrada ainda!'}
              {filtro === 'ativas' && '🎯 Nenhuma tarefa ativa!'}
              {filtro === 'concluidas' && '✅ Nenhuma tarefa concluída!'}
            </div>
          ) : (
            <ul className="lista-tarefas">
              {tarefasFiltradas.map((tarefa) => (
                <ItemTarefa
                  key={tarefa.id}
                  tarefa={tarefa}
                  onAlternar={alternarStatus}
                  onEditar={atualizarTarefa}
                  onExcluir={removerTarefa}
                />
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}