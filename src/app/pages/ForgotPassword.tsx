import { useState } from 'react';
import { Link } from 'react-router';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { C } from '../data/colors';
import { authApi } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Укажите корректный email');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Ошибка при восстановлении пароля');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ background: C.bgPrimary, minHeight: '100vh', fontFamily: "'Unbounded', sans-serif", paddingTop: '80px' }}>
      <div className="max-w-md mx-auto px-4 py-12">
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Восстановление пароля
            </h1>
            <p style={{ color: C.textSecondary, fontSize: '0.9rem' }}>
              Введите email, и мы отправим инструкции по восстановлению
            </p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#dc2626', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#16a34a', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} />
              Инструкции отправлены на ваш email
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

            <button
              type="submit"
              disabled={isLoading || success}
              style={{
                width: '100%', background: C.accentGold, color: C.textPrimary,
                border: 'none', borderRadius: '10px', padding: '1rem',
                fontSize: '1rem', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              {isLoading ? 'Отправка...' : <><span>Восстановить пароль</span> <ArrowRight size={18} /></>}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: C.textSecondary, fontSize: '0.9rem' }}>
              Вспомнили пароль?{' '}
              <Link to="/login" style={{ color: C.accentGold, fontWeight: 700, textDecoration: 'none' }}>
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
