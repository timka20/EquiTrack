import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, User, ArrowLeft } from 'lucide-react';
import { C } from '../data/colors';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Ошибка входа. Проверьте данные.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ background: C.bgPrimary, minHeight: '100vh', fontFamily: "'Unbounded', sans-serif", paddingTop: '80px' }}>
      <div className="max-w-md mx-auto px-4 py-12">
        <Link to="/" style={{ color: C.textSecondary, fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', marginBottom: '1rem' }} className="hover:opacity-70 transition-opacity">
          <ArrowLeft size={16} /> На главную
        </Link>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '50%', 
              background: 'rgba(201,169,98,0.15)', border: '1px solid rgba(201,169,98,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <User size={28} style={{ color: C.accentGold }} />
            </div>
            <h1 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Вход в систему
            </h1>
            <p style={{ color: C.textSecondary, fontSize: '0.9rem' }}>
              Войдите в личный кабинет для доступа к полному функционалу
            </p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#dc2626', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label style={{ color: C.textPrimary, fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: C.textMuted }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{
                    width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                    borderRadius: '10px', padding: '0.875rem 1rem 0.875rem 2.75rem',
                    color: C.textPrimary, fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ color: C.textPrimary, fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                Пароль
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: C.textMuted }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  required
                  style={{
                    width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                    borderRadius: '10px', padding: '0.875rem 3rem 0.875rem 2.75rem',
                    color: C.textPrimary, fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" style={{ accentColor: C.accentGold, width: '16px', height: '16px' }} />
                <span style={{ color: C.textSecondary, fontSize: '0.875rem' }}>Запомнить меня</span>
              </label>
              <Link to="/forgot-password" style={{ color: C.accentGold, fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
                Забыли пароль?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', background: C.accentGold, color: C.textPrimary,
                border: 'none', borderRadius: '10px', padding: '1rem',
                fontSize: '1rem', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              {isLoading ? 'Вход...' : <><span>Войти</span> <ArrowRight size={18} /></>}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: C.textSecondary, fontSize: '0.9rem' }}>
              Ещё нет аккаунта?{' '}
              <Link to="/register" style={{ color: C.accentGold, fontWeight: 700, textDecoration: 'none' }}>
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
