import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Trophy, Calendar, MapPin, TrendingUp, Heart, Share2, ChevronRight, Activity, Syringe, FileText, Star, CheckCircle, User, Home, Dumbbell, UserCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { C } from '../data/colors';
import { horsesApi, medicalApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function formatMoney(amount: number | string | undefined | null) {
  if (!amount && amount !== 0) return '—';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(num);
}

const genderLabels: Record<string, string> = { stallion: 'Жеребец', mare: 'Кобыла', gelding: 'Мерин' };
const statusLabels: Record<string, string> = { training: 'В тренинге', rest: 'На отдыхе', stud: 'В разведении', sold: 'Продан', retired: 'Выбыл', for_sale: 'На продаже', reserved: 'Забронирован' };
const statusColors: Record<string, string> = {
  training: C.accentGold, rest: C.textMuted, stud: C.accentAmber,
  sold: '#dc2626', retired: C.textMuted, for_sale: '#16a34a', reserved: C.accentSienna,
};

export default function HorseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [horse, setHorse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'career' | 'pedigree' | 'medical' | 'forecast'>('career');
  const [favorited, setFavorited] = useState(false);
  const [booked, setBooked] = useState(false);
  const [raceResults, setRaceResults] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [vaccinations, setVaccinations] = useState<any[]>([]);

  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchHorse = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [horseData, medicalData, vaccinesData] = await Promise.all([
          horsesApi.getById(id),
          medicalApi.getByHorseId(id).catch(() => []),
          medicalApi.getVaccinations(id).catch(() => [])
        ]);
        console.log('Horse data:', horseData);
        console.log('Race history:', horseData.raceHistory);
        console.log('Pedigree:', horseData.pedigree);
        console.log('Owner:', horseData.owner);
        console.log('Breeder:', horseData.breeder);
        setHorse(horseData);
        setRaceResults(horseData.raceHistory || []);
        setMedicalRecords(medicalData || []);
        setVaccinations(vaccinesData || []);

        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
          const favorites = JSON.parse(savedFavorites);
          setFavorited(favorites.includes(parseInt(id)));
        }
      } catch (err) {
        setError('Не удалось загрузить данные лошади');
      } finally {
        setLoading(false);
      }
    };
    fetchHorse();
  }, [id, refreshKey]);

  const toggleFavorite = () => {
    const savedFavorites = localStorage.getItem('favorites');
    let favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
    const horseId = parseInt(id!);

    if (favorited) {
      favorites = favorites.filter((fid: number) => fid !== horseId);
    } else {
      favorites.push(horseId);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    setFavorited(!favorited);
  };

  const handleAddVaccination = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await medicalApi.createVaccination(id!, {
        name: formData.get('name') as string,
        date: formData.get('date') as string,
        nextDate: formData.get('nextDate') as string,
        notes: formData.get('notes') as string
      });
      setShowVaccineModal(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      alert('Ошибка при добавлении прививки');
    }
  };

  const handleAddMedicalRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await medicalApi.createRecord(id!, {
        date: formData.get('date') as string,
        record_type: formData.get('record_type') as string,
        description: formData.get('description') as string,
        diagnosis: formData.get('diagnosis') as string,
        treatment: formData.get('treatment') as string,
        restrictions: formData.get('restrictions') as string
      });
      setShowMedicalModal(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      alert('Ошибка при добавлении медицинской записи');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bgPrimary }}>
        <Loader2 size={40} style={{ color: C.accentGold, animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error || !horse) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bgPrimary }}>
        <p style={{ color: C.textMuted }}>{error || 'Лошадь не найдена'}</p>
      </div>
    );
  }

  const horseResults = raceResults || [];

  const winRate = horse.stats?.totalRaces > 0 ? Math.round((horse.stats?.wins / horse.stats?.totalRaces) * 100) : 0;

  const ownerName = horse.owner?.firstName 
    ? `${horse.owner.firstName} ${horse.owner.lastName || ''}`.trim()
    : horse.owner?.name || horse.ownerName || horse.owner_first_name 
      ? `${horse.owner_first_name || ''} ${horse.owner_last_name || ''}`.trim()
      : '—';

  const breederName = horse.breeder?.firstName
    ? `${horse.breeder.firstName} ${horse.breeder.lastName || ''}`.trim()
    : horse.breeder?.name || horse.breederName || horse.breeder_first_name
      ? `${horse.breeder_first_name || ''} ${horse.breeder_last_name || ''}`.trim()
      : '—';

  const fatherName = horse.pedigree?.father?.name || horse.father_name || horse.fatherName || '—';
  const motherName = horse.pedigree?.mother?.name || horse.mother_name || horse.motherName || '—';

  return (
    <div style={{ background: C.bgPrimary, fontFamily: "'Unbounded', sans-serif", minHeight: '100vh' }}>

      <div style={{ background: C.textPrimary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-0">
          <Link to="/catalog" style={{ color: '#D9CFC0', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', width: 'fit-content' }}
            className="hover:opacity-70 transition-opacity">
            <ArrowLeft size={16} /> Назад в каталог
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={horse.photos|| horse.photo || 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800'}
                alt={horse.name}
                style={{ width: 'clamp(260px, 30vw, 340px)', height: '260px', objectFit: 'cover', borderRadius: '16px', border: '3px solid rgba(201,169,98,0.3)' }}
              />
              <span style={{
                position: 'absolute', top: '0.75rem', left: '0.75rem',
                color: '#FFF',
                border: `1px solid ${statusColors[horse.status]}44`,
                fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: '100px',
                backdropFilter: 'blur(4px)', background: 'rgba(30,22,14,0.85)',
              }}>
                {horse.status ? statusLabels[horse.status] || horse.status : ''}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <span style={{ background: 'rgba(201,169,98,0.15)', color: C.accentGold, border: '1px solid rgba(201,169,98,0.35)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', padding: '0.2rem 0.75rem', borderRadius: '100px' }}>
                  {genderLabels[horse.gender]}
                </span>
                <span style={{ background: 'rgba(201,169,98,0.15)', color: C.accentGold, border: '1px solid rgba(201,169,98,0.35)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', padding: '0.2rem 0.75rem', borderRadius: '100px' }}>
                  {horse.color}
                </span>
              </div>
              <h1 style={{ fontFamily: "'Unbounded', sans-serif", color: '#FFFFFF', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.1 }}>
                {horse.name}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {horse.birthYear} г.р. · {horse.birthCountry} · Заводчик: {breederName}
                <span> · Владелец: {ownerName}</span>
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Стартов', val: horse.stats?.totalRaces ?? 0 },
                  { label: 'Побед', val: horse.stats?.wins ?? 0 },
                  { label: 'Призовых', val: horse.stats?.podiums ?? 0 },
                  { label: 'Процент побед', val: `${winRate}%` },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.875rem 1rem', textAlign: 'center' }}>
                    <p style={{ fontFamily: "'Unbounded', sans-serif", color: C.accentGold, fontSize: '1.6rem', fontWeight: 700 }}>{s.val}</p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {horse.stats?.totalPrize > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <Trophy size={18} style={{ color: C.accentGold }} />
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                    Суммарный выигрыш: <strong style={{ color: C.accentGold, fontFamily: "'Unbounded', sans-serif", fontSize: '0.95rem' }}>{formatMoney(horse.stats?.totalPrize)}</strong>
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={toggleFavorite}
                  style={{
                    background: 'rgba(255,255,255,0.1)', color: favorited ? '#ef4444' : 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                    padding: '0.6rem 1.25rem', fontSize: '0.875rem', fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    fontFamily: "'Unbounded', sans-serif",
                  }}
                >
                  <Heart size={16} fill={favorited ? '#ef4444' : 'none'} />
                  {favorited ? 'В избранном' : 'В избранное'}
                </button>
                {(horse.status === 'for_sale' || horse.status === 'reserved') && !booked && (
                  <button
                    onClick={() => setBooked(true)}
                    style={{
                      background: C.accentGold, color: C.textPrimary,
                      border: 'none', borderRadius: '8px',
                      padding: '0.6rem 1.5rem', fontSize: '0.875rem', fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                      transition: 'background 0.2s', fontFamily: "'Unbounded', sans-serif",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.btnHover; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.accentGold; }}
                  >
                    Оставить заявку
                  </button>
                )}
                {booked && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(34,197,94,0.15)', border: '1px solid #16a34a', color: '#4ade80', borderRadius: '8px', padding: '0.6rem 1.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
                    <CheckCircle size={16} /> Заявка подана
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: C.bgSecondary, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
            {[
              { key: 'career', label: 'Карьера', icon: Trophy },
              { key: 'pedigree', label: 'Родословная', icon: FileText },
              { key: 'medical', label: 'Медкарта', icon: Syringe },
              { key: 'forecast', label: 'Прогноз', icon: TrendingUp },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '1rem 1.5rem', border: 'none', background: 'transparent',
                    color: activeTab === tab.key ? C.accentGold : C.textSecondary,
                    borderBottom: activeTab === tab.key ? `2px solid ${C.accentGold}` : '2px solid transparent',
                    cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.875rem', fontWeight: 600,
                    transition: 'all 0.2s', fontFamily: "'Unbounded', sans-serif",
                  }}
                >
                  <Icon size={15} /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {activeTab === 'career' && (
          <div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                <Star size={24} style={{ color: C.accentGold, margin: '0 auto 0.5rem' }} />
                <p style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '2rem', fontWeight: 700 }}>{horse.stats?.wins ?? 0}</p>
                <p style={{ color: C.textMuted, fontSize: '0.82rem' }}>Побед в карьере</p>
              </div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                <Activity size={24} style={{ color: C.accentAmber, margin: '0 auto 0.5rem' }} />
                <p style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '2rem', fontWeight: 700 }}>{horse.stats?.totalRaces ?? 0}</p>
                <p style={{ color: C.textMuted, fontSize: '0.82rem' }}>Всего стартов</p>
              </div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                <Trophy size={24} style={{ color: C.accentSienna, margin: '0 auto 0.5rem' }} />
                <p style={{ fontFamily: "'Unbounded', sans-serif", color: C.accentGold, fontSize: '1.5rem', fontWeight: 700 }}>{formatMoney(horse.stats?.totalPrize)}</p>
                <p style={{ color: C.textMuted, fontSize: '0.82rem' }}>Суммарный выигрыш</p>
              </div>
            </div>

            {horseResults.length > 0 ? (
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.border}` }}>
                  <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1.25rem', fontWeight: 700 }}>
                    История выступлений
                  </h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ background: C.bgSecondary, borderBottom: `1px solid ${C.border}` }}>
                        {['Место', 'Соревнование', 'Дата', 'Ипподром', 'Дист.', 'Время', 'Выигрыш'].map(col => (
                          <th key={col} style={{ color: C.textMuted, textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {horseResults.map((res, idx) => {
                        const place = res.place || res.position || 0;
                        const raceName = res.raceName || res.race_name || res.name || '—';
                        const date = res.date || res.race_date || '';
                        const time = res.time || res.race_time || '—';
                        const earnings = res.earnings || res.prize || 0;

                        return (
                          <tr key={idx} style={{ borderBottom: idx < horseResults.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                            <td style={{ padding: '0.875rem 1rem' }}>
                              <span style={{
                                fontFamily: "'Unbounded', sans-serif",
                                color: place === 1 ? C.accentGold : place === 2 ? '#888' : place === 3 ? C.accentSienna : C.textMuted,
                                fontSize: '0.95rem', fontWeight: 700,
                              }}>
                                {place === 1 ? '1 место' : place === 2 ? '2 место' : place === 3 ? '3 место' : place || '—'}
                              </span>
                            </td>
                            <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: C.textPrimary }}>{raceName}</td>
                            <td style={{ padding: '0.875rem 1rem', color: C.textSecondary }}>{date ? new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                            <td style={{ padding: '0.875rem 1rem', color: C.textSecondary }}>{res.hippodrome || '—'}</td>
                            <td style={{ padding: '0.875rem 1rem', color: C.textSecondary }}>{res.distance ? `${res.distance}м` : '—'}</td>
                            <td style={{ padding: '0.875rem 1rem', color: C.textPrimary, fontWeight: 600 }}>{time}</td>
                            <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: place <= 3 ? C.accentGold : C.textSecondary }}>{typeof earnings === 'number' && earnings > 0 ? formatMoney(earnings) : '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: C.textMuted, fontSize: '1rem' }}>
                  {horse.stats?.totalRaces === 0 ? 'Лошадь ещё не принимала участия в скачках' : 'Данные о выступлениях загружаются'}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pedigree' && (
          <div>

            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '2rem', marginBottom: '2rem', overflowX: 'auto' }}>
              <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>
                Родословная {horse.name}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '800px', margin: '0 auto' }}>

                <div style={{ display: 'flex', width: '100%' }}>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    <div style={{ display: 'flex', width: '100%' }}>

                      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 0.5rem' }}>
                        <div style={{ width: '100%', maxWidth: '160px', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                          <p style={{ color: C.textMuted, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', fontWeight: 700 }}>Отец отца</p>
                          <p style={{ color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700 }}>
                            {horse.pedigree?.father?.father?.name || horse.pedigree?.father?.father || '—'}
                          </p>
                        </div>
                      </div>

                      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 0.5rem' }}>
                        <div style={{ width: '100%', maxWidth: '160px', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                          <p style={{ color: C.textMuted, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', fontWeight: 700 }}>Мать отца</p>
                          <p style={{ color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700 }}>
                            {horse.pedigree?.father?.mother?.name || horse.pedigree?.father?.mother || '—'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', width: '50%', justifyContent: 'space-between' }}>
                      <div style={{ width: '2px', height: '16px', background: C.border }}></div>
                      <div style={{ width: '2px', height: '16px', background: C.border }}></div>
                    </div>
                    <div style={{ display: 'flex', width: '50%', height: '16px' }}>
                      <div style={{ flex: 1, borderTop: `2px solid ${C.border}`, borderRight: `2px solid ${C.border}` }}></div>
                      <div style={{ flex: 1, borderTop: `2px solid ${C.border}` }}></div>
                    </div>

                    <div style={{ width: '100%', maxWidth: '220px', background: `linear-gradient(135deg, ${C.accentGold}15, ${C.accentAmber}10)`, border: `2px solid ${C.accentGold}40`, borderRadius: '12px', padding: '1.25rem', textAlign: 'center', zIndex: 2 }}>
                      <p style={{ color: C.textMuted, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem', fontWeight: 700 }}>Отец</p>
                      <p style={{ color: C.textPrimary, fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {horse.pedigree?.father?.name || '—'}
                      </p>
                      {horse.pedigree?.father && (
                        <>
                          <p style={{ color: C.textSecondary, fontSize: '0.75rem' }}>
                            {horse.pedigree.father.color ? `${horse.pedigree.father.color}` : ''}
                          </p>
                          <p style={{ color: C.textMuted, fontSize: '0.72rem', marginTop: '0.35rem' }}>
                            р. {horse.pedigree.father.birthYear || ''}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    <div style={{ display: 'flex', width: '100%' }}>

                      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 0.5rem' }}>
                        <div style={{ width: '100%', maxWidth: '160px', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                          <p style={{ color: C.textMuted, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', fontWeight: 700 }}>Отец матери</p>
                          <p style={{ color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700 }}>
                            {horse.pedigree?.mother?.father?.name || horse.pedigree?.mother?.father || '—'}
                          </p>
                        </div>
                      </div>

                      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 0.5rem' }}>
                        <div style={{ width: '100%', maxWidth: '160px', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                          <p style={{ color: C.textMuted, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', fontWeight: 700 }}>Мать матери</p>
                          <p style={{ color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700 }}>
                            {horse.pedigree?.mother?.mother?.name || horse.pedigree?.mother?.mother || '—'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', width: '50%', justifyContent: 'space-between' }}>
                      <div style={{ width: '2px', height: '16px', background: C.border }}></div>
                      <div style={{ width: '2px', height: '16px', background: C.border }}></div>
                    </div>
                    <div style={{ display: 'flex', width: '50%', height: '16px' }}>
                      <div style={{ flex: 1, borderTop: `2px solid ${C.border}`, borderRight: `2px solid ${C.border}` }}></div>
                      <div style={{ flex: 1, borderTop: `2px solid ${C.border}` }}></div>
                    </div>

                    <div style={{ width: '100%', maxWidth: '220px', background: `linear-gradient(135deg, ${C.accentSienna}15, ${C.accentAmber}10)`, border: `2px solid ${C.accentSienna}40`, borderRadius: '12px', padding: '1.25rem', textAlign: 'center', zIndex: 2 }}>
                      <p style={{ color: C.textMuted, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem', fontWeight: 700 }}>Мать</p>
                      <p style={{ color: C.textPrimary, fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {horse.pedigree?.mother?.name || '—'}
                      </p>
                      {horse.pedigree?.mother && (
                        <>
                          <p style={{ color: C.textSecondary, fontSize: '0.75rem' }}>
                            {horse.pedigree.mother.color ? `${horse.pedigree.mother.color}` : ''}
                          </p>
                          <p style={{ color: C.textMuted, fontSize: '0.72rem', marginTop: '0.35rem' }}>
                            р. {horse.pedigree.mother.birthYear || ''}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                </div>

                <div style={{ display: 'flex', width: '50%', justifyContent: 'space-between' }}>
                  <div style={{ width: '2px', height: '24px', background: C.border }}></div>
                  <div style={{ width: '2px', height: '24px', background: C.border }}></div>
                </div>
                <div style={{ display: 'flex', width: '50%', height: '24px' }}>
                  <div style={{ flex: 1, borderTop: `2px solid ${C.border}`, borderRight: `2px solid ${C.border}` }}></div>
                  <div style={{ flex: 1, borderTop: `2px solid ${C.border}` }}></div>
                </div>

                <div style={{ width: '100%', maxWidth: '280px', background: `linear-gradient(135deg, ${C.accentGold}25, ${C.accentSienna}15)`, border: `3px solid ${C.accentGold}60`, borderRadius: '14px', padding: '1.5rem', textAlign: 'center', zIndex: 2 }}>
                  <p style={{ color: C.accentGold, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.6rem', fontWeight: 700 }}>👑 Объект разведения</p>
                  <p style={{ color: C.textPrimary, fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.3rem', fontFamily: "'Unbounded', sans-serif" }}>
                    {horse.name}
                  </p>
                  <p style={{ color: C.textSecondary, fontSize: '0.8rem' }}>
                    {horse.gender === 'stallion' ? 'Жеребец' : horse.gender === 'mare' ? 'Кобыла' : 'Мерин'}
                  </p>
                  <p style={{ color: C.textSecondary, fontSize: '0.75rem', marginTop: '0.35rem' }}>
                    {horse.color}, р. {horse.birthYear}
                  </p>
                </div>

              </div>
            </div>

          </div>
        )}

        {activeTab === 'medical' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1rem', fontWeight: 700 }}>
                    Прививки ({vaccinations.length})
                  </h3>
                  {(user?.role === 'admin' || user?.role === 'veterinarian') && (
                    <button 
                      onClick={() => setShowVaccineModal(true)}
                      style={{ background: C.accentGold, color: C.textPrimary, border: 'none', borderRadius: '6px', padding: '0.35rem 0.875rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      + Добавить
                    </button>
                  )}
                </div>
                <div style={{ padding: '1.25rem' }} className="space-y-3">
                  {vaccinations.length > 0 ? vaccinations.map((v: any, i: number) => {
                    const nextDate = new Date(v.next_date || v.nextDate);
                    const today = new Date();
                    const isOverdue = nextDate < today;
                    const isUpcoming = !isOverdue && (nextDate.getTime() - today.getTime()) < 7 * 24 * 60 * 60 * 1000;
                    const status = isOverdue ? 'overdue' : isUpcoming ? 'upcoming' : 'scheduled';

                    return (
                      <div key={i} style={{ padding: '0.875rem', background: C.bgSecondary, borderRadius: '8px' }}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p style={{ color: C.textPrimary, fontWeight: 700, fontSize: '0.875rem' }}>{v.name}</p>
                            <p style={{ color: C.textMuted, fontSize: '0.75rem' }}>Проведено: {new Date(v.vaccination_date || v.date).toLocaleDateString('ru-RU')}</p>
                            {v.next_date || v.nextDate ? (
                              <p style={{ color: C.textMuted, fontSize: '0.75rem' }}>Следующая: {nextDate.toLocaleDateString('ru-RU')}</p>
                            ) : null}
                            {v.notes && <p style={{ color: C.textSecondary, fontSize: '0.75rem', marginTop: '0.25rem' }}>{v.notes}</p>}
                          </div>
                          <span style={{
                            background: status === 'overdue' ? 'rgba(239,68,68,0.1)' : status === 'upcoming' ? 'rgba(212,165,116,0.2)' : 'rgba(34,197,94,0.1)',
                            color: status === 'overdue' ? '#dc2626' : status === 'upcoming' ? C.accentAmber : '#16a34a',
                            fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.6rem', borderRadius: '100px', whiteSpace: 'nowrap',
                          }}>
                            {status === 'overdue' ? 'Просрочено' : status === 'upcoming' ? 'Скоро' : 'По плану'}
                          </span>
                        </div>
                      </div>
                    );
                  }) : (
                    <p style={{ color: C.textMuted, textAlign: 'center', padding: '1rem' }}>Нет данных о прививках</p>
                  )}
                </div>
              </div>

              <div>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1rem', fontWeight: 700 }}>
                      Медицинские записи ({medicalRecords.length})
                    </h3>
                    {(user?.role === 'admin' || user?.role === 'veterinarian') && (
                      <button 
                        onClick={() => setShowMedicalModal(true)}
                        style={{ background: C.accentGold, color: C.textPrimary, border: 'none', borderRadius: '6px', padding: '0.35rem 0.875rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        + Добавить
                      </button>
                    )}
                  </div>
                  <div style={{ padding: '1.25rem' }} className="space-y-3">
                    {medicalRecords.length > 0 ? medicalRecords.map((record: any, i: number) => (
                      <div key={i} style={{ padding: '0.875rem', background: C.bgSecondary, borderRadius: '8px' }}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p style={{ color: C.textPrimary, fontWeight: 700, fontSize: '0.875rem' }}>{record.type}</p>
                            <p style={{ color: C.textSecondary, fontSize: '0.82rem' }}>{record.description}</p>
                            {record.diagnosis && (
                              <p style={{ color: C.textMuted, fontSize: '0.75rem', marginTop: '0.25rem' }}>Диагноз: {record.diagnosis}</p>
                            )}
                            {record.treatment && (
                              <p style={{ color: C.textMuted, fontSize: '0.75rem' }}>Лечение: {record.treatment}</p>
                            )}
                            {record.restrictions && (
                              <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(212,165,116,0.1)', borderRadius: '6px' }}>
                                <p style={{ color: C.accentAmber, fontSize: '0.75rem', fontWeight: 600 }}>
                                  <AlertTriangle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                  Ограничения: {record.restrictions}
                                </p>
                              </div>
                            )}
                            <p style={{ color: C.textMuted, fontSize: '0.72rem', marginTop: '0.5rem' }}>
                              {new Date(record.record_date || record.date).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <p style={{ color: C.textMuted, textAlign: 'center', padding: '1rem' }}>Нет медицинских записей</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {showVaccineModal && (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000, padding: '1rem'
              }} onClick={() => setShowVaccineModal(false)}>
                <div style={{ background: C.white, borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
                  <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                    Добавить прививку
                  </h3>
                  <form onSubmit={handleAddVaccination} className="space-y-4">
                    <div>
                      <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Название прививки</label>
                      <input type="text" name="name" required placeholder="Например: Тетанус" style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Дата</label>
                        <input type="date" name="date" required style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
                      </div>
                      <div>
                        <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Следующая дата</label>
                        <input type="date" name="nextDate" style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Примечания</label>
                      <textarea name="notes" rows={2} style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary, resize: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                      <button type="submit" style={{ flex: 1, background: C.accentGold, color: C.textPrimary, border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
                        Добавить
                      </button>
                      <button type="button" onClick={() => setShowVaccineModal(false)} style={{ flex: 1, background: C.bgSecondary, color: C.textSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                        Отмена
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {showMedicalModal && (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000, padding: '1rem'
              }} onClick={() => setShowMedicalModal(false)}>
                <div style={{ background: C.white, borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '450px', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
                  <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                    Добавить медицинскую запись
                  </h3>
                  <form onSubmit={handleAddMedicalRecord} className="space-y-4">
                    <div>
                      <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Тип записи</label>
                      <select name="type" required style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }}>
                        <option value="Плановый осмотр">Плановый осмотр</option>
                        <option value="Лечение">Лечение</option>
                        <option value="Травма">Травма</option>
                        <option value="Вакцинация">Вакцинация</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Дата</label>
                      <input type="date" name="date" required style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
                    </div>
                    <div>
                      <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Описание</label>
                      <textarea name="description" required rows={2} style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary, resize: 'none' }} />
                    </div>
                    <div>
                      <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Диагноз</label>
                      <input type="text" name="diagnosis" style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
                    </div>
                    <div>
                      <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Лечение</label>
                      <input type="text" name="treatment" style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
                    </div>
                    <div>
                      <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Ограничения</label>
                      <input type="text" name="restrictions" placeholder="Например: Исключить прыжки 2 нед." style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                      <button type="submit" style={{ flex: 1, background: C.accentGold, color: C.textPrimary, border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
                        Добавить
                      </button>
                      <button type="button" onClick={() => setShowMedicalModal(false)} style={{ flex: 1, background: C.bgSecondary, color: C.textSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                        Отмена
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'forecast' && (
          <div className="max-w-2xl">
            {horse.forecastPrice ? (
              <>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <div style={{ background: C.textPrimary, padding: '1.5rem 2rem' }}>
                    <p style={{ color: C.accentGold, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
                      Прогноз рыночной стоимости
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                      <p style={{ fontFamily: "'Unbounded', sans-serif", color: '#FFF', fontSize: '2.25rem', fontWeight: 700 }}>
                        {formatMoney(horse.forecastPrice[0])}
                      </p>
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.25rem' }}>—</span>
                      <p style={{ fontFamily: "'Unbounded', sans-serif", color: '#FFF', fontSize: '2.25rem', fontWeight: 700 }}>
                        {formatMoney(horse.forecastPrice[1])}
                      </p>
                    </div>
                  </div>
                  <div style={{ padding: '1.5rem 2rem' }}>
                    <p style={{ color: C.textMuted, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', fontWeight: 700 }}>
                      Анализ факторов
                    </p>
                    <div className="space-y-3">
                      {[
                        { label: 'Отец: ' + (horse.father?.name || '—'), val: 'Побед: 12 · Выиграно 5.2M ₽', score: 85, color: C.accentGold },
                        { label: 'Мать: ' + (horse.mother?.name || '—'), val: 'Побед: 6 · Выиграно 2.2M ₽', score: 70, color: C.accentAmber },
                        { label: 'Братья/сёстры', val: 'Средняя цена продажи: 1.5M ₽', score: 65, color: C.accentSienna },
                        { label: 'Масть и стать', val: horse.color + ' · Гармоничное телосложение', score: 78, color: C.accentGold },
                      ].map(f => (
                        <div key={f.label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                            <div>
                              <span style={{ color: C.textPrimary, fontSize: '0.875rem', fontWeight: 600 }}>{f.label}</span>
                              <span style={{ color: C.textMuted, fontSize: '0.78rem', display: 'block' }}>{f.val}</span>
                            </div>
                            <span style={{ color: f.color, fontWeight: 700, fontSize: '0.875rem' }}>{f.score}/100</span>
                          </div>
                          <div style={{ height: '6px', background: C.bgSecondary, borderRadius: '100px', overflow: 'hidden' }}>
                            <div style={{ width: `${f.score}%`, height: '100%', background: f.color, borderRadius: '100px', transition: 'width 0.8s ease' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(201,169,98,0.08)', border: `1px solid ${C.accentGold}33`, borderRadius: '12px', padding: '1.25rem 1.5rem' }}>
                  <p style={{ color: C.textMuted, fontSize: '0.78rem', lineHeight: 1.7 }}>
                    <strong style={{ color: C.textPrimary }}>Пример расчёта:</strong> Отец выиграл 12 забегов (5.2M ₽), мать — 6 забегов (2.2M ₽), старшая сестра продана за 1.8M ₽.
                    На основе этих данных и актуального рынка прогнозируемая стоимость составляет <strong style={{ color: C.accentGold }}>{formatMoney(horse.forecastPrice[0])} — {formatMoney(horse.forecastPrice[1])}</strong>.
                  </p>
                </div>
              </>
            ) : (
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
                <TrendingUp size={48} style={{ color: C.border, margin: '0 auto 1rem' }} />
                <p style={{ color: C.textMuted, fontSize: '1rem' }}>Прогноз стоимости доступен для лошадей на продаже</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
