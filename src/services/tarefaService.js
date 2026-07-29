import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COLECAO_TAREFAS = 'tarefas';

function ordenarPorCriadoEm(tarefas) {
  return tarefas.sort((a, b) => {
    const concluidaA = a.concluida ? 1 : 0;
    const concluidaB = b.concluida ? 1 : 0;

    if (concluidaA !== concluidaB) {
      return concluidaA - concluidaB;
    }

    const dataA = a.criadoEm?.toMillis ? a.criadoEm.toMillis() : 0;
    const dataB = b.criadoEm?.toMillis ? b.criadoEm.toMillis() : 0;

    return dataB - dataA;
  });
}

export function ouvirTarefas(usuarioId, callback, onError) {
  if (!usuarioId) {
    callback([]);
    return () => {};
  }

  const consulta = query(
    collection(db, COLECAO_TAREFAS),
    where('usuarioId', '==', usuarioId),
  );

  const removerListener = onSnapshot(
    consulta,
    (snapshot) => {
      const tarefas = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(ordenarPorCriadoEm(tarefas));
    },
    (error) => {
      console.error('Erro ao ouvir tarefas:', error);
      if (onError) {
        onError(error);
      }
    },
  );

  return removerListener;
}

export async function criarTarefa(usuarioId, texto) {
  if (!texto.trim()) {
    throw new Error('O texto da tarefa não pode estar vazio.');
  }

  return await addDoc(collection(db, COLECAO_TAREFAS), {
    texto: texto.trim(),
    concluida: false,
    usuarioId: usuarioId,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
}

export async function alternarTarefa(tarefaId, concluidaAtual) {
  return await updateDoc(doc(db, COLECAO_TAREFAS, tarefaId), {
    concluida: !concluidaAtual,
    atualizadoEm: serverTimestamp(),
  });
}

export async function editarTarefa(tarefaId, novoTexto) {
  if (!novoTexto.trim()) {
    throw new Error('O texto da tarefa não pode estar vazio.');
  }

  return await updateDoc(doc(db, COLECAO_TAREFAS, tarefaId), {
    texto: novoTexto.trim(),
    atualizadoEm: serverTimestamp(),
  });
}

export async function excluirTarefa(tarefaId) {
  return await deleteDoc(doc(db, COLECAO_TAREFAS, tarefaId));
}

export function ouvirTodasTarefas(callback, onError) {
  const consulta = query(collection(db, COLECAO_TAREFAS));

  const removerListener = onSnapshot(
    consulta,
    (snapshot) => {
      const tarefas = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(ordenarPorCriadoEm(tarefas));
    },
    (error) => {
      console.error('Erro ao ouvir todas as tarefas:', error);
      if (onError) {
        onError(error);
      }
    },
  );

  return removerListener;
}
