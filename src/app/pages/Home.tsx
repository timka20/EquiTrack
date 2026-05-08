import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Calendar, Trophy, TrendingUp, Users, Star, ChevronRight, Clock, MapPin, CircleDot, Medal, DollarSign, User } from 'lucide-react';
import { C } from '../data/colors';
import { horsesApi, racesApi } from '../services/api';

const HERO_IMG = '/hero-bg.jpg';
const STUD_IMG = 'https://images.unsplash.com/photo-1741604128722-0f50a3025132?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900';
const JOCKEY_IMG = 'https://images.unsplash.com/photo-1579847625475-7877e1a5fa11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900';

function formatMoney(amount: number) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

const statusColors: Record<string, string> = {
  registration_open: '#22c55e',
  scheduled: '#f59e0b',
  finished: '#A89B8C',
};

const statusLabels: Record<string, string> = {
  registration_open: 'Приём заявок',
  scheduled: 'Запланирован',
  finished: 'Завершён',
};

interface Horse {
  id: number;
  name: string;
  gender: string;
  color: string;
  birthYear: number;
  status: string;
  photos?: string[];
  price?: number;
  father_name?: string;
  mother_name?: string;
  wins?: number;
  totalEarnings?: number;
}

interface Race {
  id: number;
  name: string;
  date: string;
  hippodrome: string;
  distance: number;
  surface: string;
  prizeFund: number;
  status: string;
  category: string;
}

interface Stats {
  total: number;
  forSale: number;
  inTraining: number;
  sold: number;
}

export default function Home() {
  const [featuredHorses, setFeaturedHorses] = useState<Horse[]>([]);
  const [nextRaces, setNextRaces] = useState<Race[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, forSale: 0, inTraining: 0, sold: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const horsesData = await horsesApi.getForSale();
        setFeaturedHorses(horsesData.slice(0, 3));

        const racesData = await racesApi.getAll();

        const upcomingRaces = racesData
          .filter((r: Race) => r.status !== 'finished')
          .sort((a: Race, b: Race) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3);
        setNextRaces(upcomingRaces);

        const statsData = await horsesApi.getStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ background: C.bgPrimary, fontFamily: "'Unbounded', sans-serif", marginTop: '-80px' }}>

      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          backgroundImage: `url(${HERO_IMG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(105deg, rgba(61,50,37,0.82) 0%, rgba(61,50,37,0.55) 55%, rgba(61,50,37,0.25) 100%)',
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div style={{ maxWidth: '600px', textAlign: 'left', marginLeft: 0 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(201,169,98,0.18)', border: '1px solid rgba(201,169,98,0.4)',
              borderRadius: '100px', padding: '0.35rem 1rem', marginBottom: '1.5rem',
            }}>
              <Star size={13} style={{ color: C.accentGold }} fill={C.accentGold} />
              <span style={{ color: C.accentGold, fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Элитный конный портал России
              </span>
            </div>
            <h1 style={{
              fontFamily: "'Unbounded', sans-serif",
              color: '#FFFFFF',
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: '1.25rem',
            }}>
              Мир скачек,<br />
              <span style={{ color: C.accentGold }}>племенной работы</span><br />
              и торговли
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: '2rem', maxWidth: '520px' }}>
              Единая платформа для управления лошадьми, отслеживания скачек, ведения родословных и покупки жеребят у лучших заводов России.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/catalog"
                style={{
                  background: C.accentGold, color: C.textPrimary,
                  padding: '0.875rem 2rem', borderRadius: '8px',
                  fontWeight: 700, fontSize: '0.95rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  transition: 'background 0.2s',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.btnHover; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.accentGold; }}
              >
                Каталог лошадей <ArrowRight size={18} />
              </Link>
              <Link
                to="/races"
                style={{
                  background: 'rgba(255,255,255,0.12)', color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.35)',
                  padding: '0.875rem 2rem', borderRadius: '8px',
                  fontWeight: 600, fontSize: '0.95rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; }}
              >
                Афиша скачек <Calendar size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: C.textPrimary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-0 lg:divide-x" style={{ '--tw-divide-opacity': 1 } as any}>
            {[
              { icon: CircleDot, label: 'Лошадей в базе', value: stats.total.toString() },
              { icon: Trophy, label: 'Скачек проведено', value: '18' },
              { icon: Medal, label: 'Побед засчитано', value: (stats.total * 3).toString() },
              { icon: DollarSign, label: 'Лошадей продано', value: stats.sold.toString() },
              { icon: User, label: 'Активных владельцев', value: '19' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
              <div key={stat.label} className="flex flex-col items-center text-center lg:px-6">
                <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                  <Icon size={28} style={{ color: C.accentGold }} />
                </div>
                <span style={{
                  fontFamily: "'Unbounded', sans-serif",
                  color: C.accentGold, fontSize: '2rem', fontWeight: 700, lineHeight: 1
                }}>
                  {loading ? '...' : stat.value}
                </span>
                <span style={{ color: C.textMuted, fontSize: '0.78rem', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {stat.label}
                </span>
              </div>
            );
            })}
          </div>
        </div>
      </section>

      <section style={{ background: C.bgPrimary }} className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p style={{ color: C.accentGold, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Ближайшие старты
              </p>
              <h2 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: 700, lineHeight: 1.2 }}>
                Афиша скачек
              </h2>
            </div>
            <Link to="/races" style={{ color: C.accentGold, fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap', textDecoration: 'none' }}
              className="hover:opacity-70 transition-opacity">
              Все скачки <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div style={{ color: C.textMuted }}>Загрузка...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nextRaces.map(race => (
                <div
                  key={race.id}
                  style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  className="hover:-translate-y-1 hover:shadow-lg"
                >
                  <div style={{ background: C.textPrimary, padding: '1.25rem 1.5rem' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{
                        background: 'rgba(201,169,98,0.15)', color: C.accentGold,
                        border: '1px solid rgba(201,169,98,0.3)',
                        fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em',
                        padding: '0.2rem 0.75rem', borderRadius: '100px',
                      }}>
                        {race.category}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: statusColors[race.status] || '#A89B8C' }}>
                        ● {statusLabels[race.status] || race.status}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginTop: '0.5rem' }}>
                      {race.name}
                    </h3>
                  </div>
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} style={{ color: C.accentGold, flexShrink: 0 }} />
                        <span style={{ color: C.textSecondary, fontSize: '0.875rem' }}>{formatDate(race.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} style={{ color: C.accentGold, flexShrink: 0 }} />
                        <span style={{ color: C.textSecondary, fontSize: '0.875rem' }}>{race.hippodrome}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} style={{ color: C.accentGold, flexShrink: 0 }} />
                        <span style={{ color: C.textSecondary, fontSize: '0.875rem' }}>{race.distance} м · {race.surface}</span>
                      </div>
                    </div>
                    <div style={{ borderTop: `1px solid ${C.border}`, marginTop: '1rem', paddingTop: '1rem' }} className="flex items-center justify-between">
                      <div>
                        <p style={{ color: C.textMuted, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Призовой фонд</p>
                        <p style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700 }}>
                          {formatMoney(race.prizeFund || race.prize_fund || 0)}
                        </p>
                      </div>
                      <Link to="/races" style={{
                        background: C.bgSecondary, color: C.textPrimary,
                        border: `1px solid ${C.border}`, borderRadius: '6px',
                        padding: '0.4rem 0.875rem', fontSize: '0.8rem', fontWeight: 600,
                        textDecoration: 'none', transition: 'background 0.2s',
                      }}>
                        Подробнее
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ background: C.bgSecondary }} className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p style={{ color: C.accentGold, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Торговая площадка
              </p>
              <h2 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: 700, lineHeight: 1.2 }}>
                Жеребята на продажу
              </h2>
            </div>
            <Link to="/catalog" style={{ color: C.accentGold, fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap', textDecoration: 'none' }}
              className="hover:opacity-70 transition-opacity">
              Полный каталог <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div style={{ color: C.textMuted }}>Загрузка...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredHorses.map(horse => (
                <div
                  key={horse.id}
                  style={{ background: C.white, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${C.border}`, transition: 'transform 0.2s, box-shadow 0.2s' }}
                  className="hover:-translate-y-1 hover:shadow-lg"
                >
                  <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                    <img 
                      src={horse.photos?.[0] || 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800'} 
                      alt={horse.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                    />
                    <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                      <span style={{
                        background: horse.status === 'reserved' ? C.accentAmber : C.accentGold,
                        color: C.textPrimary, fontSize: '0.72rem', fontWeight: 700,
                        padding: '0.25rem 0.75rem', borderRadius: '100px',
                      }}>
                        {horse.status === 'reserved' ? 'Забронирован' : 'В продаже'}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700 }}>
                      {horse.name}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 mb-3">
                      <span style={{ color: C.textSecondary, fontSize: '0.82rem' }}>
                        {horse.gender === 'stallion' ? 'Жеребец' : horse.gender === 'mare' ? 'Кобыла' : 'Мерин'}
                      </span>
                      <span style={{ color: C.textSecondary, fontSize: '0.82rem' }}>{horse.color}</span>
                      <span style={{ color: C.textSecondary, fontSize: '0.82rem' }}>{horse.birthYear} г.р.</span>
                    </div>
                    <div style={{ background: C.bgSecondary, borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
                      <p style={{ color: C.textMuted, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Родители</p>
                      <p style={{ color: C.textSecondary, fontSize: '0.82rem' }}>Отец: <strong style={{ color: C.textPrimary }}>{horse.father_name || 'Неизвестен'}</strong></p>
                      <p style={{ color: C.textSecondary, fontSize: '0.82rem' }}>Мать: <strong style={{ color: C.textPrimary }}>{horse.mother_name || 'Неизвестна'}</strong></p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p style={{ color: C.textMuted, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Цена</p>
                        <p style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700 }}>
                          {horse.price ? formatMoney(horse.price) : 'По запросу'}
                        </p>
                      </div>
                      <Link
                        to={`/horse/${horse.id}`}
                        style={{
                          background: C.accentGold, color: C.textPrimary,
                          padding: '0.5rem 1.25rem', borderRadius: '6px',
                          fontWeight: 700, fontSize: '0.875rem',
                          textDecoration: 'none', transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.btnHover; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.accentGold; }}
                      >
                        Подробнее
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ background: C.bgPrimary }} className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src={STUD_IMG}
                alt="Конный завод"
                style={{ width: '100%', height: '420px', objectFit: 'cover', borderRadius: '16px' }}
              />
              <div style={{
                position: 'absolute', bottom: '-1.5rem', right: '-1.5rem',
                background: C.textPrimary, borderRadius: '12px',
                padding: '1.25rem 1.75rem', textAlign: 'center',
                boxShadow: '0 10px 40px rgba(61,50,37,0.25)',
              }}
                className="hidden sm:block"
              >
                <p style={{ fontFamily: "'Unbounded', sans-serif", color: C.accentGold, fontSize: '2.25rem', fontWeight: 700, lineHeight: 1 }}>
                  25+
                </p>
                <p style={{ color: '#D9CFC0', fontSize: '0.78rem', marginTop: '0.25rem' }}>лет на рынке</p>
              </div>
            </div>
            <div>
              <p style={{ color: C.accentGold, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                О платформе
              </p>
              <h2 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '1.25rem' }}>
                Всё для конного бизнеса в одном месте
              </h2>
              <p style={{ color: C.textSecondary, lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
                EquiTrack — цифровая экосистема для участников конной индустрии России. Мы объединяем владельцев лошадей, тренеров, жокеев, ветеринарных врачей и покупателей на единой платформе.
              </p>
              <p style={{ color: C.textSecondary, lineHeight: 1.8, marginBottom: '2rem', fontSize: '0.95rem' }}>
                Следите за скачками, ведите родословные, управляйте случным сезоном, контролируйте здоровье лошадей и выставляйте жеребят на продажу с прогнозом будущей стоимости.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Trophy, text: 'Спортивный портал' },
                  { icon: Users, text: 'Племенной учёт' },
                  { icon: TrendingUp, text: 'Аналитика и прогнозы' },
                  { icon: Calendar, text: 'Личные кабинеты' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div style={{ background: 'rgba(201,169,98,0.12)', border: `1px solid rgba(201,169,98,0.3)`, borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} style={{ color: C.accentGold }} />
                    </div>
                    <span style={{ color: C.textPrimary, fontSize: '0.875rem', fontWeight: 600 }}>{text}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/dashboard"
                style={{
                  background: C.accentGold, color: C.textPrimary,
                  padding: '0.875rem 2rem', borderRadius: '8px',
                  fontWeight: 700, fontSize: '0.95rem',
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  textDecoration: 'none', transition: 'background 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.btnHover; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.accentGold; }}
              >
                Зарегистрироваться <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{
        position: 'relative', backgroundImage: `url(${JOCKEY_IMG})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        padding: '5rem 0',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(61,50,37,0.75)' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 style={{ fontFamily: "'Unbounded', sans-serif", color: '#FFFFFF', fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, marginBottom: '1rem' }}>
            Присоединяйтесь к сообществу
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            Более 19 пользователей уже доверяют нам учёт своих лошадей. Зарегистрируйтесь и получите полный доступ к платформе.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              style={{
                background: C.accentGold, color: C.textPrimary,
                padding: '0.875rem 2.5rem', borderRadius: '8px',
                fontWeight: 700, fontSize: '1rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                textDecoration: 'none', transition: 'background 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.btnHover; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.accentGold; }}
            >
              Начать бесплатно
            </Link>
            <Link
              to="/catalog"
              style={{
                background: 'transparent', color: '#FFFFFF',
                border: '2px solid rgba(255,255,255,0.5)',
                padding: '0.875rem 2.5rem', borderRadius: '8px',
                fontWeight: 600, fontSize: '1rem',
                textDecoration: 'none', transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.9)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.5)'; }}
            >
              Смотреть каталог
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
