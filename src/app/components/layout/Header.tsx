import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X, Trophy, Bell, User, Heart } from 'lucide-react';
import { C } from '../../data/colors';

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
  const location = useLocation();

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
            <button style={{ color: C.textMuted }} className="relative p-2 rounded-full hover:opacity-70 transition-opacity">
              <Bell size={18} />
              <span style={{ background: C.accentGold }} className="absolute top-1 right-1 w-2 h-2 rounded-full" />
            </button>
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
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.btnHover; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.accentGold; }}
            >
              <User size={15} />
              Кабинет
            </Link>
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
          </div>
        </div>
      )}
    </header>
  );
}
