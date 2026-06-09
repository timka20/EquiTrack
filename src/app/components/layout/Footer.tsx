import { Link } from 'react-router';
import { Trophy, Mail, Phone, MapPin, Instagram, Facebook, Youtube } from 'lucide-react';
import { C } from '../../data/colors';

export function Footer() {
  return (
    <footer style={{ background: '#2A2118', borderTop: `1px solid rgba(201,169,98,0.2)` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          <div>
            <div className="flex items-center gap-3 mb-5">
              <div style={{ background: C.accentGold }} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0">
                <Trophy size={18} style={{ color: C.textPrimary }} />
              </div>
              <div>
                <span style={{
                  fontFamily: "'Unbounded', sans-serif",
                  color: C.accentGold,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  display: 'block',
                  lineHeight: 1.1,
                }}>EquiTrack</span>
                <span style={{ color: C.textMuted, fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Конный портал</span>
              </div>
            </div>
            <p style={{ color: C.textMuted, fontFamily: "'Unbounded', sans-serif", fontSize: '0.875rem', lineHeight: 1.7 }}>
              Комплексная платформа для управления конным бизнесом: скачки, племенная работа, торговля.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[Instagram, Facebook, Youtube].map((Icon, i) => (
                <button
                  key={i}
                  style={{ color: C.textMuted, border: `1px solid rgba(201,169,98,0.25)` }}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity"
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ color: C.accentGold, fontFamily: "'Unbounded', sans-serif", fontWeight: 600, fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              Разделы
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Афиша скачек', href: '/races' },
                { label: 'Результаты забегов', href: '/results' },
                { label: 'Каталог лошадей', href: '/catalog' },
                { label: 'Племенная работа', href: '/breeding' },
                { label: 'Личный кабинет', href: '/dashboard' },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    style={{ color: '#B8AFA6', fontFamily: "'Unbounded', sans-serif", fontSize: '0.875rem' }}
                    className="hover:opacity-70 transition-opacity"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ color: C.accentGold, fontFamily: "'Unbounded', sans-serif", fontWeight: 600, fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              Для участников
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Владельцы лошадей', href: '/dashboard' },
                { label: 'Конные заводы', href: '/dashboard' },
                { label: 'Тренеры', href: '/dashboard' },
                { label: 'Жокеи', href: '/dashboard' },
                { label: 'Ветеринарные врачи', href: '/dashboard' },
                { label: 'Администраторы', href: '/dashboard' },
              ].map(link => (
                <li key={link.href + link.label}>
                  <Link to={link.href} style={{ color: '#B8AFA6', fontFamily: "'Unbounded', sans-serif", fontSize: '0.875rem', textDecoration: 'none' }}
                    className="hover:opacity-70 transition-opacity">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ color: C.accentGold, fontFamily: "'Unbounded', sans-serif", fontWeight: 600, fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              Контакты
            </h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <MapPin size={16} style={{ color: C.accentGold, flexShrink: 0, marginTop: '2px' }} />
                <span style={{ color: '#B8AFA6', fontFamily: "'Unbounded', sans-serif", fontSize: '0.875rem', lineHeight: 1.6 }}>
                  г. Москва, Беговая ул., д. 22, Центральный Московский Ипподром
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} style={{ color: C.accentGold, flexShrink: 0 }} />
                <a href="tel:+74959454517" style={{ color: '#B8AFA6', fontFamily: "'Unbounded', sans-serif", fontSize: '0.875rem', textDecoration: 'none' }} className="hover:opacity-70 transition-opacity">
                  +7 (495) 945-45-17
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} style={{ color: C.accentGold, flexShrink: 0 }} />
                <a href="mailto:info@equitrack.ru" style={{ color: '#B8AFA6', fontFamily: "'Unbounded', sans-serif", fontSize: '0.875rem', textDecoration: 'none' }} className="hover:opacity-70 transition-opacity">
                  info@equitrack.ru
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: `1px solid rgba(201,169,98,0.15)`, marginTop: '3rem', paddingTop: '1.5rem' }}
          className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p style={{ color: C.textMuted, fontFamily: "'Unbounded', sans-serif", fontSize: '0.8rem' }}>
            © 2026 EquiTrack. Все права защищены.
          </p>
          <div className="flex items-center gap-4">
            {[
              { label: 'Политика конфиденциальности', href: '/privacy' },
              { label: 'Условия использования', href: '/terms' },
            ].map(item => (
              <Link key={item.href} to={item.href} style={{ color: C.textMuted, fontFamily: "'Unbounded', sans-serif", fontSize: '0.8rem', textDecoration: 'none' }}
                className="hover:opacity-70 transition-opacity">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
