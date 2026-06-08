import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X, Trophy, Bell, User, Heart, LogOut } from 'lucide-react';
import { C } from '../../data/colors';
import { useAuth } from '../../contexts/AuthContext';
import { notificationsApi } from '../../services/api';

const navLinks = [
  { label: 'Афиша скачек', href: '/races' },
  { label: 'Результаты', href: '/results' },
  { label: 'Каталог лошадей', href: '/catalog' },
  { label: 'Разведение', href: '/breeding' },
  { label: 'Личный кабинет', href: '/dashboard' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const notifRef = useRef<HTMLDivElement>(null);

  const isHomePage = location.pathname === '/';
  const isActive = (href: string) => location.pathname === href;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    if (isHomePage) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setIsScrolled(true);
    }
  }, [isHomePage]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifications = async () => {
      try {
        const count = await notificationsApi.getUnreadCount();
        setNotificationsCount(count?.count ?? count ?? 0);
        const data = await notificationsApi.getAll();
        setNotifications(data.slice(0, 5));
      } catch (e) {}
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setNotificationsCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const headerBg = isHomePage && !isScrolled 
    ? 'transparent' 
    : C.textPrimary;

  return (
    <header 
      style={{ 
        background: headerBg, 
        borderBottom: isScrolled || !isHomePage ? `1px solid rgba(201,169,98,0.3)` : 'none',
        transition: 'background 0.3s ease, border-bottom 0.3s ease'
      }} 
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div style={{ background: C.accentGold }} className="w-9 h-9 rounded-full flex items-center justify-center">
              <Trophy size={18} style={{ color: C.textPrimary }} />
            </div>
            <div>
              <span style={{
                fontFamily: "'Unbounded', sans-serif",
                color: C.accentGold,
                fontSize: '0.95rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                lineHeight: 1.1,
                display: 'block'
              }}>
                EquiTrack
              </span>
              <span style={{
                color: C.textMuted,
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                display: 'block'
              }}>
                Конный портал
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                style={{
                  color: isActive(link.href) ? C.accentGold : '#D9CFC0',
                  fontFamily: "'Unbounded', sans-serif",
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  padding: '0.5rem 0.875rem',
                  borderRadius: '6px',
                  borderBottom: isActive(link.href) ? `2px solid ${C.accentGold}` : '2px solid transparent',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  if (!isActive(link.href)) {
                    (e.currentTarget as HTMLElement).style.color = C.accentGold;
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive(link.href)) {
                    (e.currentTarget as HTMLElement).style.color = '#D9CFC0';
                  }
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link 
              to="/favorites" 
              style={{ color: C.textMuted }} 
              className="relative p-2 rounded-full hover:opacity-70 transition-opacity"
            >
              <Heart size={18} />
            </Link>
            
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ color: C.textMuted }} 
                  className="relative p-2 rounded-full hover:opacity-70 transition-opacity"
                >
                  <Bell size={18} />
                  {notificationsCount > 0 && (
                    <span style={{ background: C.accentGold }} className="absolute top-1 right-1 w-2 h-2 rounded-full" />
                  )}
                </button>
                
                {showNotifications && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', width: '320px', maxHeight: '400px', overflow: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', zIndex: 100 }}>
                    <div style={{ padding: '1rem', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 600, fontSize: '0.875rem', color: C.textPrimary }}>Уведомления</span>
                      {notificationsCount > 0 && (
                        <span style={{ background: C.accentGold, color: C.textPrimary, fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: '100px' }}>{notificationsCount}</span>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '1.5rem', textAlign: 'center', color: C.textMuted, fontSize: '0.875rem' }}>Нет уведомлений</div>
                    ) : (
                      <div>
                        {notifications.map(n => (
                          <div key={n.id} style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${C.border}44`, display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: n.is_read ? 'transparent' : 'rgba(201,169,98,0.05)' }}>
                            <div className="flex-1">
                              <p style={{ fontWeight: 600, fontSize: '0.8rem', color: C.textPrimary, marginBottom: '0.25rem' }}>{n.title}</p>
                              <p style={{ fontSize: '0.75rem', color: C.textSecondary }}>{n.message}</p>
                            </div>
                            {!n.is_read && (
                              <button onClick={() => handleMarkRead(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.accentGold, fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                Прочитать
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  style={{
                    background: C.accentGold,
                    color: C.textPrimary,
                    fontFamily: "'Unbounded', sans-serif",
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    padding: '0.5rem 1.25rem',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'background 0.2s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.btnHover; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.accentGold; }}
                >
                  <User size={15} />
                  Кабинет
                </Link>
                <button
                  onClick={logout}
                  style={{
                    background: 'transparent',
                    color: C.textMuted,
                    border: `1px solid ${C.border}`,
                    borderRadius: '6px',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Выйти"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                style={{
                  background: C.accentGold,
                  color: C.textPrimary,
                  fontFamily: "'Unbounded', sans-serif",
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'background 0.2s',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.btnHover; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.accentGold; }}
              >
                <User size={15} />
                Войти
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-md"
            style={{ color: C.accentGold }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div style={{ background: '#2A2118', borderTop: `1px solid rgba(201,169,98,0.2)` }} className="lg:hidden">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  color: isActive(link.href) ? C.accentGold : '#D9CFC0',
                  fontFamily: "'Unbounded', sans-serif",
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  display: 'block',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: isActive(link.href) ? 'rgba(201,169,98,0.1)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    background: C.accentGold,
                    color: C.textPrimary,
                    fontFamily: "'Unbounded', sans-serif",
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    marginTop: '0.5rem',
                  }}
                >
                  <User size={16} />
                  Личный кабинет
                </Link>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  style={{
                    background: 'transparent',
                    color: '#D9CFC0',
                    fontFamily: "'Unbounded', sans-serif",
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    marginTop: '0.5rem',
                    width: '100%',
                    border: 'none',
                    textAlign: 'left',
                  }}
                >
                  <LogOut size={16} />
                  Выйти
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                style={{
                  background: C.accentGold,
                  color: C.textPrimary,
                  fontFamily: "'Unbounded', sans-serif",
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginTop: '0.5rem',
                }}
              >
                <User size={16} />
                Войти
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
