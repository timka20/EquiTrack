import { useEffect, useState } from 'react';
import { Trophy, Calendar, MapPin, Clock, ChevronDown, Medal, TrendingUp, Award } from 'lucide-react';
import { C } from '../data/colors';
import { racesApi } from '../services/api';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}
function formatMoney(amount: number) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
}

const placeConfig: Record<number, { bg: string; color: string; label: string; Icon: any }> = {
  1: { bg: 'rgba(201,169,98,0.15)', color: C.accentGold, label: '1 место', Icon: Award },
  2: { bg: 'rgba(168,168,168,0.15)', color: '#888', label: '2 место', Icon: Medal },
  3: { bg: 'rgba(166,123,91,0.15)', color: C.accentSienna, label: '3 место', Icon: Trophy },
};

interface RaceResult {
  raceId: number;
  raceName: string;
  date: string;
  hippodrome: string;
  distance: number;
  prizeFund: number;
  category: string;
  results: {
    place: number;
    horseName: string;
    jockey: string;
    trainer: string;
    raceTime?: string;
    earnings: number;
  }[];
}

export default function Results() {
  const [raceResults, setRaceResults] = useState<RaceResult[]>([]);
  const [expandedRace, setExpandedRace] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const races = await racesApi.getAll();

        const finishedRaces = races.filter((r: any) => r.status === 'finished');

        const racesWithResults = await Promise.all(
          finishedRaces.map(async (race: any) => {
            try {
              const raceDetails = await racesApi.getById(race.id);
              return {
                raceId: race.id,
                raceName: race.name,
                date: race.date,
                hippodrome: race.hippodrome,
                distance: race.distance,
                prizeFund: race.prizeFund || race.prize_fund || 0,
                category: race.category,
                results: (raceDetails.results || []).map((r: any) => ({
                  place: r.position,
                  horseName: r.horse_name || r.horseName,
                  jockey: r.jockey_first_name && r.jockey_last_name 
                    ? `${r.jockey_first_name} ${r.jockey_last_name}`
                    : r.jockeyName || '—',
                  trainer: r.trainer_name || '—',
                  raceTime: r.race_time,
                  earnings: r.prize || r.earnings || 0,
                })),
              };
            } catch (e) {
              console.error(`Error fetching race ${race.id}:`, e);
              return null;
            }
          })
        );

        const validRaces = racesWithResults.filter(Boolean) as RaceResult[];
        setRaceResults(validRaces);
        if (validRaces.length > 0) {
          setExpandedRace(validRaces[0].raceId);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const totalEarnings = raceResults.reduce((sum, r) => 
    sum + r.results.reduce((s, res) => s + (res.earnings || 0), 0), 0
  );

  return (
    <div style={{ background: C.bgPrimary, fontFamily: "'Unbounded', sans-serif", minHeight: '100vh' }}>

      <div style={{ background: C.textPrimary, padding: '3.5rem 0 3rem' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p style={{ color: C.accentGold, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Архив результатов
          </p>
          <h1 style={{ fontFamily: "'Unbounded', sans-serif", color: '#FFFFFF', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, marginBottom: '0.75rem' }}>
            Результаты скачек
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem' }}>
            Официальные итоги прошедших забегов и статистика выплат
          </p>
        </div>
      </div>

      <div style={{ background: C.bgSecondary, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: 'Забегов в архиве', value: raceResults.length.toString(), icon: Trophy },
              { label: 'Суммарный призовой', value: formatMoney(totalEarnings), icon: TrendingUp },
              { label: 'Участников всего', value: raceResults.reduce((s, r) => s + r.results.length, 0).toString(), icon: Medal },
              { label: 'Ипподромов', value: new Set(raceResults.map(r => r.hippodrome)).size.toString(), icon: MapPin },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div style={{ background: 'rgba(201,169,98,0.12)', border: `1px solid rgba(201,169,98,0.3)`, borderRadius: '10px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} style={{ color: C.accentGold }} />
                </div>
                <div>
                  <p style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1rem', fontWeight: 700 }}>{loading ? '...' : value}</p>
                  <p style={{ color: C.textMuted, fontSize: '0.75rem' }}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="text-center py-12">
            <div style={{ color: C.textMuted }}>Загрузка результатов...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {raceResults.map(race => (
              <div key={race.raceId} style={{ background: C.white, borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>

                <button
                  onClick={() => setExpandedRace(expandedRace === race.raceId ? null : race.raceId)}
                  style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                >
                  <div style={{ background: C.textPrimary, padding: '1.25rem 1.5rem' }} className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: '#FFFFFF', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {race.raceName}
                      </h3>
                      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} style={{ color: C.accentGold }} />
                          <span style={{ color: '#D9CFC0', fontSize: '0.82rem' }}>{formatDate(race.date)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} style={{ color: C.accentGold }} />
                          <span style={{ color: '#D9CFC0', fontSize: '0.82rem' }}>{race.hippodrome}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} style={{ color: C.accentGold }} />
                          <span style={{ color: '#D9CFC0', fontSize: '0.82rem' }}>{race.distance} м</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Trophy size={13} style={{ color: C.accentGold }} />
                          <span style={{ color: '#D9CFC0', fontSize: '0.82rem' }}>{formatMoney(race.prizeFund)}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginLeft: '1rem', color: C.accentGold, transition: 'transform 0.3s', transform: expandedRace === race.raceId ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </button>

                <div className="grid grid-cols-3 divide-x" style={{ borderBottom: expandedRace === race.raceId ? `1px solid ${C.border}` : 'none' }}>
                  {race.results.slice(0, 3).map(res => {
                    const pc = placeConfig[res.place] || { bg: 'transparent', color: C.textMuted, label: `${res.place} место`, Icon: Medal };
                    const IconComponent = pc.Icon;
                    return (
                      <div key={res.place} style={{ background: pc.bg, padding: '1rem 1.25rem', textAlign: 'center' }}>
                        <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                          <IconComponent size={28} style={{ color: pc.color }} />
                        </div>
                        <p style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                          {res.horseName}
                        </p>
                        <p style={{ color: C.textMuted, fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                          Жокей: {res.jockey}
                        </p>
                        <div className="flex items-center justify-center gap-2">
                          <span style={{ color: C.textMuted, fontSize: '0.78rem' }}>{res.raceTime || '--:--'}</span>
                          <span style={{ color: pc.color, fontSize: '0.78rem', fontWeight: 700 }}>+{formatMoney(res.earnings || 0)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {expandedRace === race.raceId && (
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    <p style={{ color: C.textMuted, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', fontWeight: 700 }}>
                      Полные результаты забега
                    </p>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                          <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                            {['Место', 'Лошадь', 'Жокей', 'Тренер', 'Время', 'Выигрыш'].map(col => (
                              <th key={col} style={{ color: C.textMuted, textAlign: 'left', padding: '0.5rem 0.875rem', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {race.results.map((res, idx) => (
                            <tr key={res.place} style={{ borderBottom: idx < race.results.length - 1 ? `1px solid ${C.border}` : 'none', background: idx % 2 === 0 ? 'transparent' : C.bgPrimary + '55' }}>
                              <td style={{ padding: '0.75rem 0.875rem', fontWeight: 700, color: res.place <= 3 ? (placeConfig[res.place]?.color || C.textMuted) : C.textMuted }}>
                                {res.place}
                              </td>
                              <td style={{ padding: '0.75rem 0.875rem', fontWeight: 700, color: C.textPrimary }}>{res.horseName}</td>
                              <td style={{ padding: '0.75rem 0.875rem', color: C.textSecondary }}>{res.jockey}</td>
                              <td style={{ padding: '0.75rem 0.875rem', color: C.textSecondary }}>{res.trainer}</td>
                              <td style={{ padding: '0.75rem 0.875rem', color: C.textPrimary, fontWeight: 600 }}>{res.raceTime || '--:--'}</td>
                              <td style={{ padding: '0.75rem 0.875rem', fontWeight: 700, color: res.place <= 3 ? C.accentGold : C.textSecondary }}>
                                {formatMoney(res.earnings || 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && raceResults.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: C.textMuted, fontSize: '1rem' }}>Пока нет завершённых скачек</p>
          </div>
        )}
      </div>
    </div>
  );
}
