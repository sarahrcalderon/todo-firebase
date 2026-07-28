import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COLECAO_TAREFAS = 'tarefas';

export function ouvirTarefas(usuarioId, callback) {
  if (!usuarioId) {
    callback([]);
    return () => {};
  }

  const consulta = query(
    collection(db, COLECAO_TAREFAS),
    where('usuarioId', '==', usuarioId),
    orderBy('criadoEm', 'desc'),
  );

  const removerListener = onSnapshot(consulta, (snapshot) => {
    const tarefas = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(tarefas);
  });

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

export function ouvirTodasTarefas(callback) {
  const consulta = query(
    collection(db, COLECAO_TAREFAS),
    orderBy('criadoEm', 'desc'),
  );

  const removerListener = onSnapshot(consulta, (snapshot) => {
    const tarefas = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(tarefas);
  });

  return removerListener;
}
