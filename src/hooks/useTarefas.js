import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as tarefaService from '../services/tarefaService';

function getCacheKey(usuarioId) {
  return usuarioId ? `tarefas-cache:${usuarioId}` : null;
}

function carregarCacheTarefas(usuarioId) {
  const chave = getCacheKey(usuarioId);
  if (!chave) {
    return [];
  }

  try {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : [];
  } catch (error) {
    console.warn('Não foi possível carregar o cache de tarefas:', error);
    return [];
  }
}

function salvarCacheTarefas(usuarioId, tarefas) {
  const chave = getCacheKey(usuarioId);
  if (!chave) {
    return;
  }

  try {
    localStorage.setItem(chave, JSON.stringify(tarefas));
  } catch (error) {
    console.warn('Não foi possível salvar o cache de tarefas:', error);
  }
}

function ordenarTarefasLocal(tarefas) {
  return [...tarefas].sort((a, b) => {
    const concluidaA = a.concluida ? 1 : 0;
    const concluidaB = b.concluida ? 1 : 0;

    if (concluidaA !== concluidaB) {
      return concluidaA - concluidaB;
    }

    const dataA = a.criadoEm ? new Date(a.criadoEm).getTime() : 0;
    const dataB = b.criadoEm ? new Date(b.criadoEm).getTime() : 0;

    return dataB - dataA;
  });
}

export function useTarefas() {
  const { usuario } = useAuth();
  const usuarioId = usuario?.uid;
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const tarefasRef = useRef([]);

  useEffect(() => {
    tarefasRef.current = tarefas;
  }, [tarefas]);

  useEffect(() => {
    if (!usuarioId) {
      setTarefas([]);
      setCarregando(false);
      return;
    }

    const tarefasCache = carregarCacheTarefas(usuarioId);

    setTarefas(tarefasCache);
    setCarregando(tarefasCache.length === 0);
    setErro(null);

    const removerListener = tarefaService.ouvirTarefas(
      usuarioId,
      (tarefasCarregadas) => {
        if (tarefasCarregadas.length > 0 || tarefasCache.length === 0) {
          const ordenadas = ordenarTarefasLocal(tarefasCarregadas);
          setTarefas(ordenadas);
          salvarCacheTarefas(usuarioId, ordenadas);
        }

        setCarregando(false);
      },
      (error) => {
        setErro('Erro ao carregar tarefas: ' + error.message);
        setCarregando(false);
      },
    );

    return removerListener;
  }, [usuarioId]);

  const adicionarTarefa = useCallback(
    async (texto) => {
      if (!usuarioId) {
        throw new Error('Usuário não autenticado.');
      }

      try {
        setErro(null);
        const referenciaTarefa = await tarefaService.criarTarefa(
          usuarioId,
          texto,
        );
        const agora = new Date();
        const novaTarefa = {
          id: referenciaTarefa.id,
          texto: texto.trim(),
          concluida: false,
          usuarioId,
          criadoEm: agora,
          atualizadoEm: agora,
        };

        setTarefas((tarefasAtuais) => {
          const proximaLista = ordenarTarefasLocal([
            ...tarefasAtuais,
            novaTarefa,
          ]);
          salvarCacheTarefas(usuarioId, proximaLista);
          return proximaLista;
        });
      } catch (error) {
        setErro('Erro ao adicionar tarefa: ' + error.message);
        console.error('Erro ao adicionar tarefa:', error);
        throw error;
      }
    },
    [usuarioId],
  );

  const alternarStatus = useCallback(
    async (tarefaId, concluidaAtual) => {
      try {
        setErro(null);
        await tarefaService.alternarTarefa(tarefaId, concluidaAtual);

        setTarefas((tarefasAtuais) => {
          const proximaLista = ordenarTarefasLocal(
            tarefasAtuais.map((tarefa) =>
              tarefa.id === tarefaId
                ? {
                    ...tarefa,
                    concluida: !concluidaAtual,
                    atualizadoEm: new Date(),
                  }
                : tarefa,
            ),
          );
          salvarCacheTarefas(usuarioId, proximaLista);
          return proximaLista;
        });
      } catch (error) {
        setErro('Erro ao atualizar tarefa: ' + error.message);
        console.error('Erro ao atualizar tarefa:', error);
        throw error;
      }
    },
    [usuarioId],
  );

  const atualizarTarefa = useCallback(
    async (tarefaId, novoTexto) => {
      try {
        setErro(null);
        await tarefaService.editarTarefa(tarefaId, novoTexto);

        setTarefas((tarefasAtuais) => {
          const proximaLista = ordenarTarefasLocal(
            tarefasAtuais.map((tarefa) =>
              tarefa.id === tarefaId
                ? {
                    ...tarefa,
                    texto: novoTexto.trim(),
                    atualizadoEm: new Date(),
                  }
                : tarefa,
            ),
          );
          salvarCacheTarefas(usuarioId, proximaLista);
          return proximaLista;
        });
      } catch (error) {
        setErro('Erro ao editar tarefa: ' + error.message);
        console.error('Erro ao editar tarefa:', error);
        throw error;
      }
    },
    [usuarioId],
  );

  const removerTarefa = useCallback(
    async (tarefaId) => {
      const tarefasAnteriores = tarefasRef.current;

      setTarefas((tarefasAtuais) => {
        const proximaLista = tarefasAtuais.filter(
          (tarefa) => tarefa.id !== tarefaId,
        );
        salvarCacheTarefas(usuarioId, proximaLista);
        return proximaLista;
      });

      try {
        setErro(null);
        await tarefaService.excluirTarefa(tarefaId);
      } catch (error) {
        setTarefas(tarefasAnteriores);
        salvarCacheTarefas(usuarioId, tarefasAnteriores);
        setErro('Erro ao excluir tarefa: ' + error.message);
        console.error('Erro ao excluir tarefa:', error);
        throw error;
      }
    },
    [usuarioId],
  );

  const filtrarTarefas = useCallback((listaTarefas, filtro) => {
    switch (filtro) {
      case 'ativas':
        return listaTarefas.filter((t) => !t.concluida);
      case 'concluidas':
        return listaTarefas.filter((t) => t.concluida);
      default:
        return listaTarefas;
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
