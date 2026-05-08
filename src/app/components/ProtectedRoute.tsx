import { useState, useEffect } from 'react';
import { Navigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { C } from '../data/colors';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {

    const token = localStorage.getItem('token');
    setHasToken(!!token);
  }, []);

  if (isLoading && !hasToken) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: C.bgPrimary,
        fontFamily: "'Unbounded', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={40} style={{ color: C.accentGold, animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: C.textMuted, fontSize: '0.875rem' }}>Проверка аутентификации...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
