import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/auth/Login';
import { Cadastro } from './components/auth/Cadastro';
import { EsqueciSenha } from './components/auth/EsqueciSenha';
import { ListaTarefa } from './components/tarefas/ListaTarefa';
import { Spinner } from './shared/Spinner';
import './App.css';

function RotaProtegida({ children }) {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return <Spinner tamanho={48} texto="Carregando..." />;
  }

  if (!usuario) {
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/esqueci-senha" element={<EsqueciSenha />} />
            
            <Route 
              path="/tarefas" 
              element={
                <RotaProtegida>
                  <ListaTarefa />
                </RotaProtegida>
              } 
            />
            
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;