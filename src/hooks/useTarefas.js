import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as tarefaService from '../services/tarefaService';

export function useTarefas() {
  const { usuario } = useAuth();
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!usuario) {
      setTarefas([]);
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro(null);

    const removerListener = tarefaService.ouvirTarefas(
      usuario.uid,
      (tarefasCarregadas) => {
        setTarefas(tarefasCarregadas);
        setCarregando(false);
      },
    );

    return removerListener;
  }, [usuario]);

  const adicionarTarefa = useCallback(
    async (texto) => {
      try {
        setErro(null);
        await tarefaService.criarTarefa(usuario.uid, texto);
      } catch (error) {
        setErro('Erro ao adicionar tarefa: ' + error.message);
        console.error('Erro ao adicionar tarefa:', error);
        throw error;
      }
    },
    [usuario],
  );

  const alternarStatus = useCallback(async (tarefaId, concluidaAtual) => {
    try {
      setErro(null);
      await tarefaService.alternarTarefa(tarefaId, concluidaAtual);
    } catch (error) {
      setErro('Erro ao atualizar tarefa: ' + error.message);
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  }, []);

  const atualizarTarefa = useCallback(async (tarefaId, novoTexto) => {
    try {
      setErro(null);
      await tarefaService.editarTarefa(tarefaId, novoTexto);
    } catch (error) {
      setErro('Erro ao editar tarefa: ' + error.message);
      console.error('Erro ao editar tarefa:', error);
      throw error;
    }
  }, []);

  const removerTarefa = useCallback(async (tarefaId) => {
    try {
      setErro(null);
      await tarefaService.excluirTarefa(tarefaId);
    } catch (error) {
      setErro('Erro ao excluir tarefa: ' + error.message);
      console.error('Erro ao excluir tarefa:', error);
      throw error;
    }
  }, []);

  const filtrarTarefas = useCallback((tarefas, filtro) => {
    switch (filtro) {
      case 'ativas':
        return tarefas.filter((t) => !t.concluida);
      case 'concluidas':
        return tarefas.filter((t) => t.concluida);
      default:
        return tarefas;
    }
  }, []);

  const getEstatisticas = useCallback(() => {
    const total = tarefas.length;
    const concluidas = tarefas.filter((t) => t.concluida).length;
    const progresso = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    return { total, concluidas, progresso, ativas: total - concluidas };
  }, [tarefas]);

  return {
    tarefas,
    carregando,
    erro,
    adicionarTarefa,
    alternarStatus,
    atualizarTarefa,
    removerTarefa,
    filtrarTarefas,
    getEstatisticas,
    ehAdmin: usuario?.email === 'admin@email.com',
  };
}
