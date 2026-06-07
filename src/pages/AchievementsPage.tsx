import { useEffect, useState } from 'react';
import { Trophy, Lock, Leaf, BookOpen, Wrench, Recycle, Users, Star, Zap } from 'lucide-react';
import { supabase, Achievement, UserAchievement, UserProfile } from '../lib/supabase';

interface AchievementsPageProps {
  userId: string;
  profile: UserProfile;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  eco: Recycle, learning: BookOpen, building: Wrench, community: Users, general: Trophy,
};

const CATEGORY_LABELS: Record<string, string> = {
  eco: 'Ecología', learning: 'Aprendizaje', building: 'Construcción', community: 'Comunidad', general: 'General',
};

const CATEGORY_COLORS: Record<string, string> = {
  eco: 'from-emerald-600 to-teal-600',
  learning: 'from-teal-600 to-blue-600',
  building: 'from-amber-600 to-orange-600',
  community: 'from-rose-600 to-pink-600',
  general: 'from-slate-600 to-slate-500',
};

export default function AchievementsPage({ userId, profile }: AchievementsPageProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earned, setEarned] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    async function load() {
      const [{ data: ach }, { data: ua }] = await Promise.all([
        supabase.from('achievements').select('*').order('category').order('requirement_value'),
        supabase.from('user_achievements').select('achievement_id').eq('user_id', userId),
      ]);
      setAchievements(ach ?? []);
      setEarned(new Set(ua?.map(u => u.achievement_id) ?? []));
      setLoading(false);
    }
    load();
  }, [userId]);

  const categories = ['all', ...new Set(achievements.map(a => a.category))];
  const filtered = achievements.filter(a => activeCategory === 'all' || a.category === activeCategory);
  const earnedCount = [...earned].length;
  const totalXpFromAchievements = achievements.filter(a => earned.has(a.id)).reduce((sum, a) => sum + a.xp_reward, 0);

  function getProgress(achievement: Achievement): number {
    const map: Record<string, number> = {
      components_salvaged: profile.components_salvaged,
      tutorials_completed: profile.tutorials_completed,
      projects_completed: profile.projects_completed,
      co2_saved: Number(profile.co2_saved_kg) * 1000,
    };
    const current = map[achievement.requirement_type] ?? 0;
    return Math.min(100, Math.round((current / achievement.requirement_value) * 100));
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Logros obtenidos', value: `${earnedCount}/${achievements.length}`, icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'XP de logros', value: totalXpFromAchievements.toLocaleString(), icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Completado', value: `${achievements.length > 0 ? Math.round((earnedCount / achievements.length) * 100) : 0}%`, icon: Star, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`card ${bg} border flex items-center gap-3`}>
            <Icon className={`w-6 h-6 ${color} flex-shrink-0`} />
            <div>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-300">Progreso general de logros</p>
          <p className="text-sm font-semibold text-emerald-400">{earnedCount}/{achievements.length}</p>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${achievements.length > 0 ? (earnedCount / achievements.length) * 100 : 0}%` }} />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(cat => {
          const Icon = cat === 'all' ? Trophy : (CATEGORY_ICONS[cat] ?? Trophy);
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat === 'all' ? 'Todos' : CATEGORY_LABELS[cat] ?? cat}
            </button>
          );
        })}
      </div>

      {/* Achievements grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="card h-32 animate-pulse bg-slate-800/40" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(achievement => {
            const isEarned = earned.has(achievement.id);
            const progress = getProgress(achievement);
            const CatIcon = CATEGORY_ICONS[achievement.category] ?? Trophy;
            const gradient = CATEGORY_COLORS[achievement.category] ?? 'from-slate-600 to-slate-500';

            return (
              <div
                key={achievement.id}
                className={`card-hover relative overflow-hidden ${isEarned ? 'border-emerald-500/30' : ''}`}
              >
                {isEarned && (
                  <div className="absolute top-0 right-0 w-0 h-0 border-l-[32px] border-l-transparent border-t-[32px] border-t-emerald-500" />
                )}

                <div className="flex items-start gap-4 mb-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${isEarned ? gradient : 'from-slate-700 to-slate-600'} flex items-center justify-center text-2xl flex-shrink-0 ${!isEarned ? 'grayscale opacity-50' : 'shadow-lg'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-snug ${isEarned ? 'text-slate-100' : 'text-slate-400'}`}>
                      {achievement.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{achievement.description}</p>
                  </div>
                  {!isEarned && <Lock className="w-4 h-4 text-slate-600 flex-shrink-0 mt-1" />}
                </div>

                {!isEarned && (
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Progreso</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                  <div className="flex items-center gap-1">
                    <CatIcon className="w-3 h-3 text-slate-500" />
                    <span className="text-xs text-slate-500">{CATEGORY_LABELS[achievement.category]}</span>
                  </div>
                  <span className={`text-xs font-medium flex items-center gap-1 ${isEarned ? 'text-amber-400' : 'text-slate-600'}`}>
                    <Zap className="w-3 h-3" />{achievement.xp_reward} XP
                  </span>
                </div>

                {isEarned && (
                  <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    Logro desbloqueado
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
