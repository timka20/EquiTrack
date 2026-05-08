import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Heart, ChevronRight, Trash2 } from 'lucide-react';
import { C } from '../data/colors';
import { horsesApi } from '../services/api';

export default function Favorites() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [horses, setHorses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        const favIds = JSON.parse(savedFavorites);
        setFavorites(favIds);

        try {
          const allHorses = await horsesApi.getAll();
          const favHorses = allHorses.filter((h: any) => favIds.includes(h.id));
          setHorses(favHorses);
        } catch (error) {
          console.error('Error loading horses:', error);
        }
      }
      setLoading(false);
    };
    loadFavorites();
  }, []);

  const removeFromFavorites = (id: number) => {
    const newFavorites = favorites.filter(fid => fid !== id);
    setFavorites(newFavorites);
    setHorses(horses.filter(h => h.id !== id));
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bgPrimary }}>
        <p style={{ color: C.textMuted }}>Загрузка...</p>
      </div>
    );
  }

  return (
    <div style={{ background: C.bgPrimary, fontFamily: "'Unbounded', sans-serif", minHeight: '100vh' }}>

      <div style={{ background: C.textPrimary, padding: '3.5rem 0 3rem' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p style={{ color: C.accentGold, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Избранное
          </p>
          <h1 style={{ fontFamily: "'Unbounded', sans-serif", color: '#FFFFFF', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, marginBottom: '0.75rem' }}>
            Мои закладки
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem' }}>
            {horses.length} {horses.length === 1 ? 'лошадь' : horses.length < 5 ? 'лошади' : 'лошадей'} в избранном
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {horses.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {horses.map(horse => (
              <div key={horse.id} style={{ background: C.white, borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ position: 'relative' }}>
                  <img 
                    src={horse.photos?.[0] || (horse.photos ? JSON.parse(horse.photos)[0] : 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800')} 
                    alt={horse.name}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                  <button
                    onClick={() => removeFromFavorites(horse.id)}
                    style={{
                      position: 'absolute', top: '0.75rem', right: '0.75rem',
                      background: 'rgba(255,255,255,0.9)', border: 'none',
                      borderRadius: '50%', width: '36px', height: '36px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={18} style={{ color: '#dc2626' }} />
                  </button>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ background: 'rgba(201,169,98,0.15)', color: C.accentGold, border: '1px solid rgba(201,169,98,0.35)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', padding: '0.2rem 0.75rem', borderRadius: '100px' }}>
                      {horse.gender === 'stallion' ? 'Жеребец' : horse.gender === 'mare' ? 'Кобыла' : 'Мерин'}
                    </span>
                    <span style={{ color: C.textMuted, fontSize: '0.78rem' }}>{horse.birthYear || horse.birth_year} г.р.</span>
                  </div>
                  <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {horse.name}
                  </h3>
                  <p style={{ color: C.textSecondary, fontSize: '0.82rem', marginBottom: '1rem' }}>
                    {horse.color} · {(horse.owner_first_name && horse.owner_last_name) ? `${horse.owner_first_name} ${horse.owner_last_name}` : (horse.owner?.name || 'Владелец не указан')}
                  </p>
                  <Link 
                    to={`/horse/${horse.id}`}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                      color: C.accentGold, fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none'
                    }}
                  >
                    Перейти к карточке <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Heart size={64} style={{ color: C.border, margin: '0 auto 1.5rem' }} />
            <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              В избранном пока пусто
            </h3>
            <p style={{ color: C.textMuted, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Добавляйте лошадей в избранное, чтобы следить за ними
            </p>
            <Link 
              to="/catalog"
              style={{
                display: 'inline-block', background: C.accentGold, color: C.textPrimary,
                padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none'
              }}
            >
              Перейти в каталог
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
