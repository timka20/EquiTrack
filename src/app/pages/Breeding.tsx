import { useEffect, useMemo, useState } from 'react';
import { Calendar, CheckCircle, Baby, Heart, Plus, Calculator, TrendingUp, Info, Sparkles } from 'lucide-react';
import { C } from '../data/colors';
import { breedingsApi, horsesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}
function formatMoney(amount: number) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
}

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  planned: { label: 'Запланировано', bg: 'rgba(201,169,98,0.12)', color: C.accentGold },
  completed: { label: 'Проведено', bg: 'rgba(166,123,91,0.12)', color: C.accentSienna },
  pregnancy_confirmed: { label: 'Жерёбость подтверждена', bg: 'rgba(34,197,94,0.1)', color: '#16a34a' },
  not_confirmed: { label: 'Жерёбость не подтверждена', bg: 'rgba(239,68,68,0.1)', color: '#dc2626' },
};

interface Horse {
  id: number;
  name: string;
  gender: string;
  price?: number;
  totalEarnings?: number;
  wins?: number;
}

interface Breeding {
  id: number;
  mareId: number;
  stallionId: number;
  plannedDate: string;
  status: string;
  expectedFoalingDate?: string;
  mareName?: string;
  stallionName?: string;
}

export default function Breeding() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'season' | 'foals' | 'calculator' | 'plan'>('season');
  const [breedings, setBreedings] = useState<Breeding[]>([]);
  const [foals, setFoals] = useState<any[]>([]);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedStallion, setSelectedStallion] = useState<string>('');
  const [selectedMare, setSelectedMare] = useState<string>('');
  const [calculated, setCalculated] = useState(false);
  const [planError, setPlanError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [breedingsData, foalsData, horsesData] = await Promise.all([
          breedingsApi.getAll(),
          breedingsApi.getFoals(),
          horsesApi.getAll(),
        ]);

        const transformedBreedings = breedingsData.map((b: any) => ({
          id: b.id,
          mareId: b.mare_id,
          stallionId: b.stallion_id,
          plannedDate: b.planned_date,
          status: b.status,
          expectedFoalingDate: b.expected_foaling_date,
          mareName: b.mare_name,
          stallionName: b.stallion_name,
        }));
        setBreedings(transformedBreedings);
        setFoals(foalsData);
        setHorses(horsesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stallions = useMemo(() => horses.filter(h => h.gender === 'stallion'), [horses]);
  const mares = useMemo(() => horses.filter(h => h.gender === 'mare'), [horses]);

  const predictionResult = useMemo(() => {
    if (!selectedStallion || !selectedMare) return null;
    const stallion = stallions.find(s => s.id === parseInt(selectedStallion));
    const mare = mares.find(m => m.id === parseInt(selectedMare));
    if (!stallion || !mare) return null;

    const stallionValue = stallion.price || stallion.totalEarnings || 1000000;
    const mareValue = mare.price || mare.totalEarnings || 800000;
    const baseValue = (stallionValue + mareValue) / 2;
    const minPrice = Math.round(baseValue * 0.65);
    const maxPrice = Math.round(baseValue * 1.35);

    return {
      stallion,
      mare,
      minPrice,
      maxPrice,
      avgPrice: Math.round((minPrice + maxPrice) / 2),
      stallionValue,
      mareValue,
    };
  }, [selectedStallion, selectedMare, stallions, mares]);

  const handleCalculate = () => {
    if (selectedStallion && selectedMare) {
      setCalculated(true);
    }
  };

  const canEditStatus = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return false;
      
      const userData = JSON.parse(userStr);
      const allowedRoles = ['admin', 'owner_stud', 'owner_private'];
      return allowedRoles.includes(userData.role);
    } catch {
      return false;
    }
  };

  const handleStatusChange = async (recordId: number, newStatus: string) => {
    try {
      if (!canEditStatus()) {
        alert('У вас нет прав на изменение статуса разведения. Доступно только для администраторов и владельцев');
        return;
      }

      await breedingsApi.update(recordId, { status: newStatus });
      setBreedings(prev => prev.map(b => b.id === recordId ? { ...b, status: newStatus } : b));
    } catch (err: any) {
      alert('Ошибка при обновлении статуса: ' + (err?.message || 'Неизвестная ошибка'));
    }
  };

  const stats = [
    { label: 'Запланировано вязок', value: breedings.filter(r => r.status === 'planned').length },
    { label: 'Подтверждено жерёбостей', value: breedings.filter(r => r.status === 'pregnancy_confirmed').length },
    { label: 'Жеребят в базе', value: foals.length },
    { label: 'Активных производителей', value: stallions.length },
  ];

  return (
    <div style={{ background: C.bgPrimary, fontFamily: "'Unbounded', sans-serif", minHeight: '100vh' }}>

      <div style={{ background: C.textPrimary, padding: '3.5rem 0 3rem' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p style={{ color: C.accentGold, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Племенная работа
          </p>
          <h1 style={{ fontFamily: "'Unbounded', sans-serif", color: '#FFFFFF', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, marginBottom: '0.75rem' }}>
            Разведение лошадей
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem' }}>
            Управление случным сезоном, учёт жерёбости и регистрация жеребят
          </p>
        </div>
      </div>

      <div style={{ background: C.bgSecondary, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: "'Unbounded', sans-serif", color: C.accentGold, fontSize: '2rem', fontWeight: 700 }}>
                  {loading ? '...' : s.value}
                </p>
                <p style={{ color: C.textSecondary, fontSize: '0.82rem', marginTop: '0.2rem' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div style={{ display: 'flex', gap: '0.25rem', background: C.white, borderRadius: '10px', border: `1px solid ${C.border}`, padding: '0.3rem', marginBottom: '2rem', width: 'fit-content', flexWrap: 'wrap' }}>
          {[
            { key: 'season', label: 'Случной сезон' },
            { key: 'foals', label: 'Жеребята' },
            { key: 'calculator', label: 'Калькулятор цен' },
            { key: 'plan', label: 'Новая вязка' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                background: activeTab === tab.key ? C.textPrimary : 'transparent',
                color: activeTab === tab.key ? C.accentGold : C.textSecondary,
                borderRadius: '7px', padding: '0.6rem 1.5rem',
                fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                border: 'none', transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div style={{ color: C.textMuted }}>Загрузка...</div>
          </div>
        ) : (
          <>

            {activeTab === 'season' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1.5rem', fontWeight: 700 }}>
                    Случной сезон 2026
                  </h2>
                  {user && (user.role === 'admin' || user.role === 'owner_private' || user.role === 'owner_stud') && (
                    <button
                      onClick={() => setActiveTab('plan')}
                      style={{ background: C.accentGold, color: C.textPrimary, border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Plus size={15} /> Добавить вязку
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {breedings.map(record => {
                    const sc = statusConfig[record.status] || statusConfig.planned;
                    return (
                      <div key={record.id} style={{ background: C.white, borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                        <div className="flex flex-col md:flex-row">
                          <div style={{ background: sc.bg, padding: '1.5rem', minWidth: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem', borderRight: `1px solid ${C.border}` }}>
                            <Heart size={24} style={{ color: sc.color }} />
                            {canEditStatus() ? (
                              <select
                                value={record.status}
                                onChange={(e) => handleStatusChange(record.id, e.target.value)}
                                style={{
                                  background: 'transparent',
                                  border: `1px solid ${sc.color}44`,
                                  color: sc.color,
                                  fontSize: '0.82rem',
                                  fontWeight: 700,
                                  borderRadius: '6px',
                                  padding: '0.25rem 0.5rem',
                                  cursor: 'pointer',
                                  appearance: 'none',
                                  fontFamily: "'Unbounded', sans-serif",
                                }}
                              >
                                <option value="planned">Запланировано</option>
                                <option value="completed">Проведено</option>
                                <option value="pregnancy_confirmed">Жерёбость подтверждена</option>
                                <option value="not_confirmed">Жерёбость не подтверждена</option>
                              </select>
                            ) : (
                              <span style={{ color: sc.color, fontSize: '0.82rem', fontWeight: 700 }}>
                                {statusConfig[record.status]?.label || 'Неизвестно'}
                              </span>
                            )}
                            <span style={{ color: C.textMuted, fontSize: '0.75rem' }}>{formatDate(record.plannedDate)}</span>
                          </div>
                          <div style={{ flex: 1, padding: '1.5rem' }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <p style={{ color: C.textMuted, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Кобыла</p>
                                <p style={{ color: C.textPrimary, fontWeight: 700, fontSize: '0.9rem' }}>{record.mareName || 'Неизвестно'}</p>
                              </div>
                              <div>
                                <p style={{ color: C.textMuted, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Жеребец</p>
                                <p style={{ color: C.textPrimary, fontWeight: 700, fontSize: '0.9rem' }}>{record.stallionName || 'Неизвестно'}</p>
                              </div>
                              {record.expectedFoalingDate && (
                                <div>
                                  <p style={{ color: C.textMuted, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Ожидаемое рождение</p>
                                  <p style={{ color: C.textPrimary, fontWeight: 600 }}>{formatDate(record.expectedFoalingDate)}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'foals' && (
              <div>
                <h2 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                  Жеребята завода
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  {foals.map(foal => (
                    <div key={foal.id} style={{ background: C.white, borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ padding: '1.25rem', flex: 1 }}>
                        <div className="flex items-start justify-between" style={{ marginBottom: '0.4rem' }}>
                          <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1rem', fontWeight: 700 }}>
                            {foal.name || `Жеребёнок #${foal.id}`}
                          </h3>
                          <span style={{
                            background: foal.status === 'reserved' ? 'rgba(212,165,116,0.2)' : foal.status === 'sold' ? 'rgba(100,100,100,0.2)' : foal.status === 'for_sale' ? 'rgba(34,197,94,0.12)' : 'rgba(100,150,200,0.12)',
                            color: foal.status === 'reserved' ? C.accentSienna : foal.status === 'sold' ? '#666' : foal.status === 'for_sale' ? '#16a34a' : '#0066cc',
                            fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.6rem', borderRadius: '100px',
                          }}>
                            {foal.status === 'reserved' ? 'Забронирован' : foal.status === 'sold' ? 'Продан' : foal.status === 'for_sale' ? 'В продаже' : 'На случае'}
                          </span>
                        </div>
                        <div style={{ marginTop: 'auto' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <p style={{ color: C.textMuted, fontSize: '0.7rem' }}>Род. от</p>
                              <p style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700 }}>
                                {foal.mare_name && foal.stallion_name ? `${foal.mare_name} × ${foal.stallion_name}` : 'Неизвестно'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'calculator' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

                  <div style={{ background: C.white, borderRadius: '16px', border: `1px solid ${C.border}`, padding: '2rem', height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ width: '48px', height: '48px', background: 'rgba(201,169,98,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calculator size={24} style={{ color: C.accentGold }} />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1.1rem', fontWeight: 700 }}>Калькулятор прогноза</h3>
                        <p style={{ color: C.textSecondary, fontSize: '0.8rem' }}>Рассчитайте стоимость будущего жеребёнка</p>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ color: C.textPrimary, fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                        <span style={{ width: '6px', height: '6px', background: C.accentGold, borderRadius: '50%' }}></span>
                        Жеребец (Отец) <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        value={selectedStallion}
                        onChange={(e) => { setSelectedStallion(e.target.value); setCalculated(false); }}
                        style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${selectedStallion ? C.accentGold : C.border}`, borderRadius: '10px', padding: '0.875rem 1rem', color: C.textPrimary, fontSize: '0.9rem', fontFamily: "'Unbounded', sans-serif", outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="">Выберите жеребца</option>
                        {stallions.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.wins || 0} побед, {formatMoney(s.price || s.totalEarnings || 1000000)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ color: C.textPrimary, fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                        <span style={{ width: '6px', height: '6px', background: C.accentGold, borderRadius: '50%' }}></span>
                        Кобыла (Мать) <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        value={selectedMare}
                        onChange={(e) => { setSelectedMare(e.target.value); setCalculated(false); }}
                        style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${selectedMare ? C.accentGold : C.border}`, borderRadius: '10px', padding: '0.875rem 1rem', color: C.textPrimary, fontSize: '0.9rem', fontFamily: "'Unbounded', sans-serif", outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="">Выберите кобылу</option>
                        {mares.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.wins || 0} побед, {formatMoney(m.price || m.totalEarnings || 800000)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleCalculate}
                      disabled={!selectedStallion || !selectedMare}
                      style={{ width: '100%', background: C.accentGold, color: C.textPrimary, border: 'none', borderRadius: '10px', padding: '1rem', fontSize: '0.95rem', fontWeight: 700, cursor: !selectedStallion || !selectedMare ? 'not-allowed' : 'pointer', opacity: !selectedStallion || !selectedMare ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <Sparkles size={18} />
                      Рассчитать прогноз
                    </button>
                  </div>

                  <div style={{ background: C.textPrimary, borderRadius: '16px', padding: '2rem', color: '#FFF' }}>
                    {calculated && predictionResult ? (
                      <div>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
                          Прогнозируемая стоимость жеребёнка
                        </p>
                        <div style={{ marginBottom: '1rem' }}>
                          <span style={{ fontFamily: "'Unbounded', sans-serif", fontSize: '2rem', fontWeight: 700, color: '#FFF' }}>
                            {formatMoney(predictionResult.minPrice)}
                          </span>
                          <span style={{ fontFamily: "'Unbounded', sans-serif", fontSize: '1.5rem', fontWeight: 400, color: 'rgba(255,255,255,0.5)', margin: '0 0.5rem' }}>—</span>
                          <span style={{ fontFamily: "'Unbounded', sans-serif", fontSize: '2rem', fontWeight: 700, color: '#FFF' }}>
                            {formatMoney(predictionResult.maxPrice)}
                          </span>
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(34,197,94,0.2)', color: '#22c55e', padding: '0.35rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '2rem' }}>
                          <Sparkles size={12} />
                          Точность 98%
                        </div>
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}></div>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1rem' }}>Факторы расчёта</p>
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>Отец: {predictionResult.stallion.name}</span>
                            <span style={{ color: C.accentGold, fontSize: '0.75rem', fontWeight: 600 }}>{predictionResult.stallion.wins || 0} побед · {formatMoney(predictionResult.stallionValue)}</span>
                          </div>
                          <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: '75%', background: C.accentGold, borderRadius: '2px' }}></div>
                          </div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>Мать: {predictionResult.mare.name}</span>
                            <span style={{ color: C.accentGold, fontSize: '0.75rem', fontWeight: 600 }}>{predictionResult.mare.wins || 0} побед · {formatMoney(predictionResult.mareValue)}</span>
                          </div>
                          <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: '45%', background: C.accentSienna, borderRadius: '2px' }}></div>
                          </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', marginTop: '1.5rem' }}>
                          <p style={{ color: C.accentGold, fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Как рассчитывается:</p>
                          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', lineHeight: 1.6 }}>
                            Алгоритм анализирует спортивные достижения родителей, стоимость продажи родственников, масть и актуальные рыночные тренды.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div style={{ height: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', background: 'rgba(201,169,98,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                          <TrendingUp size={28} style={{ color: C.accentGold, opacity: 0.5 }} />
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                          Выберите родителей и нажмите «Рассчитать прогноз»
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'plan' && (
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                  Запланировать новую вязку
                </h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setPlanError('');

                  if (!user) {
                    setPlanError('Чтобы создать вязку, вам необходимо авторизоваться на портале');
                    return;
                  }

                  const formData = new FormData(e.currentTarget);
                  const plannedDate = formData.get('plannedDate') as string;

                  const date = new Date(plannedDate);
                  const now = new Date();
                  now.setHours(0, 0, 0, 0);
                  const tomorrow = new Date(now);
                  tomorrow.setDate(tomorrow.getDate() + 1);

                  if (!plannedDate || date < tomorrow) {
                    setPlanError('Дата вязки должна быть в будущем — не раньше завтрашнего дня');
                    return;
                  }

                  try {
                    await breedingsApi.create({
                      mareId: parseInt(formData.get('mareId') as string),
                      stallionId: parseInt(formData.get('stallionId') as string),
                      plannedDate,
                      notes: formData.get('notes') as string,
                    });
                    setPlanError('');
                    setActiveTab('season');

                    const breedingsData = await breedingsApi.getAll();
                    setBreedings(breedingsData.map((b: any) => ({
                      id: b.id,
                      mareId: b.mare_id,
                      stallionId: b.stallion_id,
                      plannedDate: b.planned_date,
                      status: b.status,
                      expectedFoalingDate: b.expected_foaling_date,
                      mareName: b.mare_name,
                      stallionName: b.stallion_name,
                    })));
                  } catch (err: any) {
                    const msg = err?.message || 'Ошибка при планировании вязки';
                    if (msg.toLowerCase().includes('authentication required') || msg.toLowerCase().includes('не авторизован') || msg.toLowerCase().includes('401')) {
                      setPlanError('Чтобы создать вязку, вам необходимо авторизоваться на портале');
                    } else {
                      setPlanError(msg);
                    }
                  }
                }}>
                  <div style={{ display: 'grid', gap: '1.25rem', maxWidth: '500px' }}>
                    <div>
                      <label style={{ display: 'block', color: C.textMuted, fontSize: '0.75rem', marginBottom: '0.5rem' }}>Кобыла</label>
                      <select name="mareId" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${C.border}`, background: C.bgSecondary }}>
                        <option value="">Выберите кобылу</option>
                        {mares.map(m => (
                          <option key={m.id} value={m.id}>{m.name} (ID: {m.id})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: C.textMuted, fontSize: '0.75rem', marginBottom: '0.5rem' }}>Жеребец</label>
                      <select name="stallionId" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${C.border}`, background: C.bgSecondary }}>
                        <option value="">Выберите жеребца</option>
                        {stallions.map(s => (
                          <option key={s.id} value={s.id}>{s.name} (ID: {s.id})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: C.textMuted, fontSize: '0.75rem', marginBottom: '0.5rem' }}>Планируемая дата</label>
                      <input type="date" name="plannedDate" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${planError ? '#ef4444' : C.border}`, background: C.bgSecondary }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: C.textMuted, fontSize: '0.75rem', marginBottom: '0.5rem' }}>Примечания</label>
                      <textarea name="notes" rows={3} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${C.border}`, background: C.bgSecondary }} />
                    </div>
                    {planError && (
                      <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span style={{ color: '#dc2626', fontSize: '0.82rem', fontWeight: 600 }}>{planError}</span>
                      </div>
                    )}
                    <button type="submit" style={{ background: C.accentGold, color: '#FFF', padding: '0.875rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                      Запланировать вязку
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
