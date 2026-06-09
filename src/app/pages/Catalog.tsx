import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Search, Filter, Heart, Star, ChevronDown, Plus } from 'lucide-react';
import { C } from '../data/colors';
import { horsesApi, uploadApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Horse {
  id: number;
  name: string;
  gender: string;
  color: string;
  birthYear: number;
  status: string;
  photos?: string;
  price?: number;
  wins?: number;
  places?: number;
  starts?: number;
  totalEarnings?: number;
}

const genderOptions = [
  { value: 'all', label: 'Все полы' },
  { value: 'stallion', label: 'Жеребец' },
  { value: 'mare', label: 'Кобыла' },
  { value: 'gelding', label: 'Мерин' },
];

const ageOptions = [
  { value: 'all', label: 'Любой возраст' },
  { value: '1-2', label: '1-2 года' },
  { value: '2-3', label: '2-3 года' },
  { value: '3-5', label: '3-5 лет' },
  { value: '5+', label: '5+ лет' },
];

const sortOptions = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'price-asc', label: 'Цена: по возрастанию' },
  { value: 'price-desc', label: 'Цена: по убыванию' },
  { value: 'wins', label: 'По количеству побед' },
];

const statusOptions = [
  { value: 'all', label: 'Все статусы' },
  { value: 'for_sale', label: 'В продаже' },
  { value: 'in_training', label: 'В тренировке' },
  { value: 'resting', label: 'Отдых' },
  { value: 'breeding', label: 'В разведении' },
  { value: 'sold', label: 'Продан' },
  { value: 'retired', label: 'Выбыл' },
];

function formatMoney(amount: number) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
}

export default function Catalog() {
  const { user } = useAuth();
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedAge, setSelectedAge] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [horsePhotoFile, setHorsePhotoFile] = useState<File | null>(null);
  const [allHorses, setAllHorses] = useState<any[]>([]);

  const canAddHorse = user?.role === 'owner_private' || user?.role === 'owner_stud' || user?.role === 'admin';

  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  useEffect(() => {
    const fetchHorses = async () => {
      try {
        setLoading(true);
        const data = await horsesApi.getAll();
        setHorses(data);
      } catch (error) {
        console.error('Error fetching horses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHorses();
  }, []);

  useEffect(() => {
    const fetchAllHorses = async () => {
      try {
        const data = await horsesApi.getAll();
        setAllHorses(data);
      } catch (error) {
        console.error('Error fetching all horses:', error);
      }
    };
    if (showAddModal) {
      fetchAllHorses();
    }
  }, [showAddModal]);

  const filteredHorses = useMemo(() => {
    let result = [...horses];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(h => h.name.toLowerCase().includes(q));
    }

    if (selectedGender !== 'all') {
      result = result.filter(h => h.gender === selectedGender);
    }

    if (selectedStatus !== 'all') {
      result = result.filter(h => h.status === selectedStatus);
    }

    if (selectedAge !== 'all') {
      const currentYear = new Date().getFullYear();
      result = result.filter(h => {
        const age = currentYear - h.birthYear;
        switch (selectedAge) {
          case '1-2': return age >= 1 && age <= 2;
          case '2-3': return age >= 2 && age <= 3;
          case '3-5': return age >= 3 && age <= 5;
          case '5+': return age >= 5;
          default: return true;
        }
      });
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'wins':
        result.sort((a, b) => (b.wins || 0) - (a.wins || 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [horses, searchQuery, selectedGender, selectedAge, selectedStatus, sortBy]);

  const toggleFav = (id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { bg: string; color: string; label: string }> = {
      for_sale: { bg: 'rgba(34,197,94,0.12)', color: '#16a34a', label: 'В продаже' },
      in_training: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', label: 'В тренировке' },
      resting: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'Отдых' },
      breeding: { bg: 'rgba(168,85,247,0.12)', color: '#a855f7', label: 'В разведении' },
      sold: { bg: 'rgba(100,100,100,0.12)', color: '#666', label: 'Продан' },
      retired: { bg: 'rgba(100,100,100,0.12)', color: '#666', label: 'Выбыл' },
    };
    return configs[status] || { bg: 'rgba(200,200,200,0.2)', color: '#999', label: status };
  };

  const handleAddHorse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      let photos: string[] = [];
      if (horsePhotoFile) {
        const uploadRes = await uploadApi.uploadImage(horsePhotoFile);
        photos = [uploadRes.url];
      }

      await horsesApi.create({
        name: formData.get('name') as string,
        gender: formData.get('gender') as string,
        color: formData.get('color') as string,
        birthYear: parseInt(formData.get('birthYear') as string),
        birthCountry: formData.get('birthCountry') as string,
        fatherId: formData.get('fatherId') ? parseInt(formData.get('fatherId') as string) : undefined,
        motherId: formData.get('motherId') ? parseInt(formData.get('motherId') as string) : undefined,
        status: formData.get('status') as string,
        photos,
        description: formData.get('description') as string,
        price: formData.get('price') ? parseFloat(formData.get('price') as string) : undefined,
      });
      setHorsePhotoFile(null);
      setShowAddModal(false);
      const data = await horsesApi.getAll();
      setHorses(data);
    } catch (error: any) {
      alert('Ошибка при добавлении лошади: ' + (error.message || 'Неизвестная ошибка'));
    }
  };

  return (
    <div style={{ background: C.bgPrimary, fontFamily: "'Unbounded', sans-serif", minHeight: '100vh' }}>

      <div style={{ background: C.textPrimary, padding: '3.5rem 0 3rem' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p style={{ color: C.accentGold, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Торговая площадка
          </p>
          <h1 style={{ fontFamily: "'Unbounded', sans-serif", color: '#FFFFFF', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, marginBottom: '0.75rem' }}>
            Каталог лошадей
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem' }}>
            Подбор лошадей по вашим критериям. Все животные прошли ветеринарный осмотр.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div style={{ background: C.white, borderRadius: '12px', border: `1px solid ${C.border}`, padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
          <div className="flex flex-col lg:flex-row gap-4">

            <div className="relative flex-1">
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: C.textMuted }} />
              <input
                type="text"
                placeholder="Поиск по имени..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                  borderRadius: '8px', padding: '0.625rem 1rem 0.625rem 2.5rem',
                  fontSize: '0.875rem', fontFamily: "'Unbounded', sans-serif",
                  outline: 'none', color: C.textPrimary,
                }}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={selectedGender}
                onChange={e => setSelectedGender(e.target.value)}
                style={{
                  background: C.bgSecondary, border: `1px solid ${C.border}`,
                  borderRadius: '8px', padding: '0.625rem 0.875rem',
                  fontSize: '0.875rem', fontFamily: "'Unbounded', sans-serif",
                  color: C.textPrimary, cursor: 'pointer',
                }}
              >
                {genderOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              <select
                value={selectedAge}
                onChange={e => setSelectedAge(e.target.value)}
                style={{
                  background: C.bgSecondary, border: `1px solid ${C.border}`,
                  borderRadius: '8px', padding: '0.625rem 0.875rem',
                  fontSize: '0.875rem', fontFamily: "'Unbounded', sans-serif",
                  color: C.textPrimary, cursor: 'pointer',
                }}
              >
                {ageOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  background: C.bgSecondary, border: `1px solid ${C.border}`,
                  borderRadius: '8px', padding: '0.625rem 0.875rem',
                  fontSize: '0.875rem', fontFamily: "'Unbounded', sans-serif",
                  color: C.textPrimary, cursor: 'pointer',
                }}
              >
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
            <span style={{ color: C.textMuted, fontSize: '0.875rem' }}>
              Найдено: <strong style={{ color: C.textPrimary }}>{filteredHorses.length}</strong>
            </span>
            {canAddHorse && (
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  marginLeft: 'auto',
                  background: C.accentGold,
                  color: C.textPrimary,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Plus size={16} /> Добавить лошадь
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div style={{ color: C.textMuted }}>Загрузка лошадей...</div>
          </div>
        )}

        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {filteredHorses.map(horse => {
              const badge = getStatusBadge(horse.status);
              return (
                <div
                  key={horse.id}
                  style={{
                    background: C.white, borderRadius: '12px', border: `1px solid ${C.border}`,
                    overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  className="hover:-translate-y-1 hover:shadow-lg"
                >

                  <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={(() => {
                        try {
                          if (typeof horse.photos === 'string') {
                            const parsed = JSON.parse(horse.photos);
                            return parsed[0] || 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800';
                          }
                          if (Array.isArray(horse.photos)) {
                            return horse.photos[0] || 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800';
                          }
                          return 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800';
                        } catch {
                          return 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800';
                        }
                      })()}
                      alt={horse.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.07)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                    />
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', right: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.color}33`, fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.7rem', borderRadius: '100px', backdropFilter: 'blur(4px)' }}>
                        {badge.label}
                      </span>
                      <button
                        onClick={() => toggleFav(horse.id)}
                        style={{
                          background: 'rgba(255,255,255,0.9)', borderRadius: '50%', width: '32px', height: '32px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer',
                        }}
                      >
                        <Heart size={15} style={{ color: favorites.has(horse.id) ? '#ef4444' : C.textMuted }} fill={favorites.has(horse.id) ? '#ef4444' : 'none'} />
                      </button>
                    </div>
                    {horse.wins ? (
                      <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', background: 'rgba(61,50,37,0.85)', borderRadius: '100px', padding: '0.2rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Star size={11} style={{ color: C.accentGold }} fill={C.accentGold} />
                        <span style={{ color: '#FFF', fontSize: '0.72rem', fontWeight: 700 }}>{horse.wins} побед</span>
                      </div>
                    ) : null}
                  </div>

                  <div style={{ padding: '1.25rem' }}>
                    <div className="flex items-start justify-between mb-1">
                      <Link to={`/horse/${horse.id}`} style={{ textDecoration: 'none' }}>
                        <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1rem', fontWeight: 700 }}>
                          {horse.name}
                        </h3>
                      </Link>
                    </div>

                    <p style={{ color: C.textSecondary, fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                      {horse.color} · {horse.gender === 'stallion' ? 'Жеребец' : horse.gender === 'mare' ? 'Кобыла' : 'Мерин'} · {horse.birthYear} г.р.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div style={{ background: C.bgSecondary, borderRadius: '6px', padding: '0.5rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.75rem', color: C.textMuted }}>Старты</p>
                        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: C.textPrimary }}>{horse.starts || 0}</p>
                      </div>
                      <div style={{ background: C.bgSecondary, borderRadius: '6px', padding: '0.5rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.75rem', color: C.textMuted }}>Победы</p>
                        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: C.textPrimary }}>{horse.wins || 0}</p>
                      </div>
                      <div style={{ background: C.bgSecondary, borderRadius: '6px', padding: '0.5rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.75rem', color: C.textMuted }}>Призы</p>
                        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: C.textPrimary }}>{horse.places || 0}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p style={{ color: C.textMuted, fontSize: '0.72rem' }}>Цена</p>
                        <p style={{ fontFamily: "'Unbounded', sans-serif", color: horse.price ? C.accentGold : C.textMuted, fontSize: '1.1rem', fontWeight: 700 }}>
                          {horse.price != null ? formatMoney(horse.price) : 'По запросу'}
                        </p>
                      </div>
                      <Link
                        to={`/horse/${horse.id}`}
                        style={{
                          background: C.accentGold, color: C.textPrimary,
                          padding: '0.5rem 1rem', borderRadius: '6px',
                          fontWeight: 700, fontSize: '0.82rem',
                          textDecoration: 'none', transition: 'background 0.2s',
                        }}
                      >
                        Подробнее
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredHorses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: C.textMuted, fontSize: '1rem' }}>По выбранным фильтрам лошадей не найдено</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGender('all');
                setSelectedAge('all');
                setSelectedStatus('all');
              }}
              style={{
                marginTop: '1rem', background: C.accentGold, color: C.textPrimary,
                border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }} onClick={() => { setShowAddModal(false); setHorsePhotoFile(null); }}>
          <div style={{ background: C.white, borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Добавить новую лошадь
            </h3>
            <form onSubmit={handleAddHorse} className="space-y-4">
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Имя лошади *</label>
                <input type="text" name="name" required placeholder="Например: Звёздный Султан" style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Пол *</label>
                  <select name="gender" required style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }}>
                    <option value="">Выберите</option>
                    <option value="stallion">Жеребец</option>
                    <option value="mare">Кобыла</option>
                    <option value="gelding">Мерин</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Масть *</label>
                  <input type="text" name="color" required placeholder="Например: Гнедой" style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Год рождения *</label>
                  <input type="number" name="birthYear" required min="1990" max={new Date().getFullYear()} style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
                </div>
                <div>
                  <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Страна рождения *</label>
                  <input type="text" name="birthCountry" required placeholder="Например: Россия" style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Отец</label>
                  <select name="fatherId" style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }}>
                    <option value="">Не указан</option>
                    {allHorses.filter((h: any) => h.gender === 'stallion').map((h: any) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Мать</label>
                  <select name="motherId" style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }}>
                    <option value="">Не указана</option>
                    {allHorses.filter((h: any) => h.gender === 'mare').map((h: any) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Статус</label>
                  <select name="status" required style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }}>
                    <option value="in_training">В тренировке</option>
                    <option value="resting">Отдых</option>
                    <option value="breeding">В разведении</option>
                    <option value="for_sale">В продаже</option>
                    <option value="sold">Продан</option>
                    <option value="retired">Выбыл</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Цена (₽)</label>
                  <input type="number" name="price" min="0" placeholder="По запросу" style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
                </div>
              </div>

              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Фото</label>
                <input type="file" accept="image/*" onChange={e => setHorsePhotoFile(e.target.files?.[0] || null)} style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
                {horsePhotoFile && <p style={{ color: C.textMuted, fontSize: '0.75rem', marginTop: '0.25rem' }}>{horsePhotoFile.name}</p>}
              </div>

              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Описание</label>
                <textarea name="description" rows={3} placeholder="Описание лошади, достижения, особенности..." style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary, resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" style={{ flex: 1, background: C.accentGold, color: C.textPrimary, border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
                  Добавить
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, background: C.bgSecondary, color: C.textSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
