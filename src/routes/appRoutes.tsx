import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';

const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const PosPage = lazy(() => import('../features/pos/PosPage'));

function LoadingFallback() {
  return <div className="login-wrap">Loading…</div>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { ready, user } = useAuth();
  if (!ready) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { ready, user } = useAuth();
  if (!ready) return <LoadingFallback />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
          path="/login"
        />
        <Route
          element={
            <ProtectedRoute>
              <PosPage />
            </ProtectedRoute>
          }
          path="/"
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
