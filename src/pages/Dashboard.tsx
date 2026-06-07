import { useEffect, useState } from 'react';
import { Leaf, Recycle, BookOpen, Wrench, Trophy, Flame, TrendingUp, Package, ChevronRight, Plus, Zap } from 'lucide-react';
import { supabase, UserProfile, Tutorial, xpToLevel, difficultyLabel, difficultyColor, categoryLabel } from '../lib/supabase';

interface DashboardProps {
  profile: UserProfile;
  onNavigate: (page: string) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  basics: '⚡', circuits: '🔌', robotics: '🤖', ewaste: '♻️', projects: '🔧',
};

export default function Dashboard({ profile, onNavigate }: DashboardProps) {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const levelInfo = xpToLevel(profile.total_xp);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('tutorials')
        .select('*')
        .order('order_index')
        .limit(4);
      setTutorials(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const ecoImpact = profile.components_salvaged * 50;

  const stats = [
    {
      icon: Leaf,
      label: 'XP Total',
      value: profile.total_xp.toLocaleString(),
      sub: `Nivel ${levelInfo.level}`,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      icon: Recycle,
      label: 'Componentes',
      value: profile.components_salvaged,
      sub: 'recuperados',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      icon: BookOpen,
      label: 'Tutoriales',
      value: profile.tutorials_completed,
      sub: 'completados',
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/20',
    },
    {
      icon: Wrench,
      label: 'Proyectos',
      value: profile.projects_completed,
      sub: 'construidos',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
  ];

  const quickActions = [
    { icon: Package, label: 'Registrar componente', page: 'inventory', color: 'from-emerald-600 to-teal-600' },
    { icon: BookOpen, label: 'Explorar tutoriales', page: 'learn', color: 'from-teal-600 to-blue-600' },
    { icon: Plus, label: 'Nuevo proyecto', page: 'projects', color: 'from-amber-600 to-orange-600' },
    { icon: Trophy, label: 'Ver logros', page: 'achievements', color: 'from-rose-600 to-pink-600' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome hero */}
      <div className="relative rounded-3xl overflow-hidden p-8 bg-gradient-to-br from-emerald-900/60 via-teal-900/40 to-slate-900/60 border border-emerald-700/30">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-emerald-400 text-sm font-medium mb-1 flex items-center gap-1">
              <Flame className="w-4 h-4" />
              {profile.streak_days} días de racha
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2">
              Hola, {profile.full_name?.split(' ')[0] || profile.username || 'Inventor'}!
            </h2>
            <p className="text-slate-400 max-w-md">
              Sigue construyendo. Cada componente recuperado es un paso hacia un mundo más sostenible.
            </p>
          </div>

          {/* Level / XP progress */}
          <div className="glass rounded-2xl p-5 min-w-64">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center font-bold text-slate-900">
                  {levelInfo.level}
                </div>
                <div>
                  <p className="text-xs text-slate-400">Nivel actual</p>
                  <p className="text-sm font-semibold text-slate-100">
                    {levelInfo.level < 5 ? 'Aprendiz' : levelInfo.level < 10 ? 'Constructor' : levelInfo.level < 15 ? 'Inventor' : 'Maestro'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Siguiente nivel</p>
                <p className="text-sm font-semibold text-amber-400">{(levelInfo.nextLevelXp - levelInfo.currentXp).toLocaleString()} XP</p>
              </div>
            </div>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${levelInfo.progress}%` }} />
            </div>
            <p className="text-xs text-slate-500 mt-1.5 text-right">{levelInfo.currentXp} / {levelInfo.nextLevelXp} XP</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, sub, color, bg, border }) => (
          <div key={label} className={`card-hover ${bg} border ${border}`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-slate-600" />
            </div>
            <p className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            <p className="text-xs text-slate-600">{sub}</p>
          </div>
        ))}
      </div>

      {/* CO2 Impact Banner */}
      <div className="card bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border-emerald-700/30 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center flex-shrink-0">
          <Recycle className="w-7 h-7 text-emerald-400" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm text-slate-400">Impacto ambiental acumulado</p>
          <p className="text-xl font-bold text-emerald-400">
            {ecoImpact >= 1000
              ? `${(ecoImpact / 1000).toFixed(2)} kg de CO2`
              : `${ecoImpact} g de CO2`}{' '}
            salvados del ambiente
          </p>
        </div>
        <button
          onClick={() => onNavigate('inventory')}
          className="btn-primary text-sm flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Registrar más
        </button>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="section-title mb-4">Acciones rápidas</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ icon: Icon, label, page, color }) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className="card-hover flex flex-col items-center gap-3 py-5 group"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-300 text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Tutorials */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Tutoriales recomendados</h3>
          <button
            onClick={() => onNavigate('learn')}
            className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Ver todos <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="card h-28 animate-pulse bg-slate-800/40" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {tutorials.map(tutorial => (
              <button
                key={tutorial.id}
                onClick={() => onNavigate('learn')}
                className="card-hover flex items-start gap-4 text-left group"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-700/80 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                  {CATEGORY_ICONS[tutorial.category] ?? '📖'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-100 line-clamp-1 mb-1">{tutorial.title}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="badge-emerald">{categoryLabel(tutorial.category)}</span>
                    <span className={`text-xs font-medium ${difficultyColor(tutorial.difficulty_level)}`}>
                      {difficultyLabel(tutorial.difficulty_level)}
                    </span>
                    <span className="text-xs text-slate-500">{tutorial.duration_minutes}min</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-medium text-amber-400">{tutorial.xp_reward}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
