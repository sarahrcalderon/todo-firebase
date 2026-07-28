import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTarefas } from '../../hooks/useTarefas';
import { 
  FaSignOutAlt, 
  FaList, 
  FaChartLine,
  FaUserCog,
  FaSpinner
} from 'react-icons/fa';
import { ItemTarefa } from './ItemTarefa';
import { FiltrosTarefa } from './FiltrosTarefa';
import { FormularioTarefa } from './FormularioTarefa';
import '../../styles/ListaTarefa.css';

export function ListaTarefa() {
  const { usuario, logout } = useAuth();
  const [filtro, setFiltro] = useState('todas');
  

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

  return (
    <div className="container-lista">
      <header className="cabecalho">
        <div className="cabecalho-esquerdo">
          <h1>
            <FaList style={{ marginRight: 12 }} />
            Minhas Tarefas
          </h1>
          <span className="badge-total">
            {estatisticas.total} {estatisticas.total === 1 ? 'tarefa' : 'tarefas'}
          </span>
        </div>
        <div className="info-usuario">
          <div className="usuario-info">
            <FaUserCog className="icone-usuario" />
            <span>{usuario?.email}</span>
            {ehAdmin && <span className="badge-admin">🔑 Admin</span>}
          </div>
          <button onClick={logout} className="botao-sair">
            <FaSignOutAlt />
            Sair
          </button>
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

      {/* FILTROS */}
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
    </div>
  );
}