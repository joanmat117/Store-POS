import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './shared/context/AuthContext';
import './index.css';

// Detectar si corremos dentro de Electron (renderer process)
// En Electron, process.versions.electron existe; en navegador normal, no.
const isElectron =
  typeof window !== 'undefined' && typeof process !== 'undefined' && !!process.versions?.electron;

const Router = isElectron
  ? ({ children }: { children: React.ReactNode }) => (
      // MemoryRouter: historial en memoria, no toca la URL (ideal para file:// en Electron)
      <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
    )
  : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
