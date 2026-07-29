import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export const AuthContext = createContext(null);

async function criarConta(email, senha, nome) {
  if (!email || !senha || !nome) {
    throw new Error('Preencha todos os campos.');
  }

  const credenciais = await createUserWithEmailAndPassword(auth, email, senha);

  await updateProfile(credenciais.user, {
    displayName: nome
  });

  await setDoc(doc(db, 'usuarios', credenciais.user.uid), {
    email: credenciais.user.email,
    displayName: nome,
    photoURL: credenciais.user.photoURL || null,
    atualizadoEm: serverTimestamp(),
  }, { merge: true });

  return credenciais.user;
}

async function entrar(email, senha) {
  if (!email || !senha) {
    throw new Error('Preencha todos os campos.');
  }

  const credenciais = await signInWithEmailAndPassword(auth, email, senha);
  return credenciais.user;
}

async function sair() {
  await signOut(auth);
}

async function recuperar(email) {
  if (!email) {
    throw new Error('Digite seu email.');
  }

  await sendPasswordResetEmail(auth, email);
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    const unsubscribe = onAuthStateChanged(auth, (usuarioAtual) => {
      if (!ativo) {
        return;
      }

      if (!usuarioAtual) {
        setUsuario(null);
        setCarregando(false);
        return;
      }

      setUsuario(usuarioAtual);
      setCarregando(false);

      void (async () => {
        try {
          const referenciaUsuario = doc(db, 'usuarios', usuarioAtual.uid);
          await setDoc(referenciaUsuario, {
            email: usuarioAtual.email,
            displayName: usuarioAtual.displayName || null,
            atualizadoEm: serverTimestamp(),
          }, { merge: true });
        } catch (error) {
          console.warn('Não foi possível sincronizar o perfil do usuário:', error);
        }
      })();
    });

    return () => {
      ativo = false;
      unsubscribe();
    };
  }, []);

  const login = async (email, senha) => {
    const user = await entrar(email, senha);
    setUsuario(user);
    return user;
  };

  const cadastrar = async (email, senha, nome) => {
    const user = await criarConta(email, senha, nome);
    setUsuario(user);
    return user;
  };

  const logout = async () => {
    await sair();
    setUsuario(null);
  };

  const recuperarSenha = async (email) => {
    await recuperar(email);
  };

  const valor = useMemo(() => ({
    usuario,
    carregando,
    login,
    cadastrar,
    logout,
    recuperarSenha
  }), [usuario, carregando]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return contexto;
}

/**
 * Cadastra um novo usuário
 * @param {string} email
 * @param {string} senha
 * @param {string} nome
 * @returns {Promise}
 */
export async function cadastrarUsuario(email, senha, nome) {
  return criarConta(email, senha, nome);
}

/**
 * Faz login do usuário
 * @param {string} email
 * @param {string} senha
 * @returns {Promise}
 */
export async function loginUsuario(email, senha) {
  return entrar(email, senha);
}

/**
 * Faz logout do usuário
 * @returns {Promise}
 */
export async function logoutUsuario() {
  return sair();
}

/**
 * Envia email para recuperação de senha
 * @param {string} email
 * @returns {Promise}
 */
export async function recuperarSenhaUsuario(email) {
  return recuperar(email);
}

/**
 * Atualiza o nome do usuário
 * @param {string} nome
 * @returns {Promise}
 */
export async function atualizarNomeUsuario(nome) {
  if (!auth.currentUser) {
    throw new Error('Usuário não está logado.');
  }

  await updateProfile(auth.currentUser, {
    displayName: nome
  });
}

/**
 * Verifica se o usuário é administrador
 * @param {object} usuario
 * @returns {boolean}
 */
export function isAdmin(usuario) {
  const emailsAdmin = ['admin@email.com', 'admin@meusite.com'];
  return usuario ? emailsAdmin.includes(usuario.email) : false;
}