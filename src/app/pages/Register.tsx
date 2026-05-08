import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react';
import { C } from '../data/colors';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ background: C.bgPrimary, minHeight: '100vh', fontFamily: "'Unbounded', sans-serif", paddingTop: '80px' }}>
      <div className="max-w-xl mx-auto px-4 py-12">
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
              Создать аккаунт
            </h1>
            <p style={{ color: C.textSecondary, fontSize: '0.9rem' }}>
              Присоединяйтесь к сообществу профессионалов конной индустрии
            </p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#dc2626', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <h2 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              Личные данные
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label style={{ color: C.textPrimary, fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Имя</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Иван"
                  required
                  style={{
                    width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                    borderRadius: '10px', padding: '0.875rem 1rem',
                    color: C.textPrimary, fontSize: '0.95rem', outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ color: C.textPrimary, fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Фамилия</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Иванов"
                  required
                  style={{
                    width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                    borderRadius: '10px', padding: '0.875rem 1rem',
                    color: C.textPrimary, fontSize: '0.95rem', outline: 'none',
                  }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label style={{ color: C.textPrimary, fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: C.textMuted }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  style={{
                    width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                    borderRadius: '10px', padding: '0.875rem 1rem 0.875rem 2.75rem',
                    color: C.textPrimary, fontSize: '0.95rem', outline: 'none',
                  }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label style={{ color: C.textPrimary, fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Телефон</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+7 (999) 999-99-99"
                  style={{
                    width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                    borderRadius: '10px', padding: '0.875rem 1rem',
                    color: C.textPrimary, fontSize: '0.95rem', outline: 'none',
                  }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label style={{ color: C.textPrimary, fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Пароль</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: C.textMuted }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Минимум 6 символов"
                  required
                  minLength={6}
                  style={{
                    width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                    borderRadius: '10px', padding: '0.875rem 3rem 0.875rem 2.75rem',
                    color: C.textPrimary, fontSize: '0.95rem', outline: 'none',
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

            <div className="mb-6">
              <label style={{ color: C.textPrimary, fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Подтвердите пароль</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: C.textMuted }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Повторите пароль"
                  required
                  style={{
                    width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                    borderRadius: '10px', padding: '0.875rem 1rem 0.875rem 2.75rem',
                    color: C.textPrimary, fontSize: '0.95rem', outline: 'none',
                  }}
                />
              </div>
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
              {isLoading ? 'Создание...' : <><span>Зарегистрироваться</span> <ArrowRight size={18} /></>}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: C.textSecondary, fontSize: '0.9rem' }}>
              Уже есть аккаунт?{' '}
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
