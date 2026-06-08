import { useEffect, useState } from 'react';
import { Zap, Search, Camera, BookOpen, Recycle, Puzzle, ChevronRight, Flame, Sparkles } from 'lucide-react';
import { supabase, UserProfile, Tutorial, xpToLevel } from '../lib/supabase';

interface DashboardProps {
  profile: UserProfile;
  onNavigate: (page: string) => void;
}

const DAILY_FACTS = [
  'Tu próximo gran invento no está en una tienda costosa; está escondido en un aparato viejo esperando que lo rescates. Hoy tienes el poder de transformar la chatarra electrónica en innovación de impacto. ¡La tecnología del futuro la construyes tú!',
  'Un computador desechado contiene más de 60 elementos de la tabla periódica. Cada componente que recuperas evita que metales preciosos terminen contaminando el suelo.',
  'El 80% de los dispositivos electrónicos desechados podría repararse o reutilizarse. Con tus manos y conocimiento, puedes darles una segunda vida.',
  'Una sola placa de circuito impreso reciclada puede evitar la emisión de hasta 2 kg de CO₂. Pequeñas acciones, gran impacto ambiental.',
  'Los inventores más creativos no compran piezas nuevas: las encuentran. Thomas Edison reutilizaba materiales en todos sus experimentos.',
];

export default function Dashboard({ profile, onNavigate }: DashboardProps) {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const levelInfo = xpToLevel(profile.total_xp);
  const dailyFact = DAILY_FACTS[new Date().getDay() % DAILY_FACTS.length];
  const firstName = profile.full_name?.split(' ')[0] || profile.username || 'Inventor';

  useEffect(() => {
    supabase.from('tutorials').select('*').order('order_index').limit(3).then(({ data }) => {
      setTutorials(data ?? []);
    });
  }, []);

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">

      {/* ── Header: Bienvenida + racha ── */}
      <div className="relative rounded-3xl overflow-hidden p-6"
        style={{ background: 'linear-gradient(135deg, #059669 0%, #0d9488 60%, #0f766e 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #fff 0%, transparent 50%)' }} />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-emerald-100 text-sm font-medium mb-0.5">Bienvenido a</p>
            <h1 className="text-3xl font-bold text-white leading-tight">EcoReEngine</h1>
            {profile.streak_days > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                <Flame className="w-4 h-4 text-amber-300" />
                <span className="text-emerald-100 text-sm font-medium">{profile.streak_days} días de racha</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <img
              src="/WhatsApp_Image_2026-06-08_at_8.40.25_AM.jpeg"
              alt="Logo"
              className="w-14 h-14 rounded-2xl object-cover shadow-lg border-2 border-white/20"
            />
            <div className="glass rounded-xl px-3 py-1.5 border border-white/20 bg-white/10">
              <div className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-xs font-bold text-white">Nv. {levelInfo.level}</span>
              </div>
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div className="relative mt-4">
          <div className="flex justify-between text-xs text-emerald-100 mb-1.5">
            <span>{profile.total_xp.toLocaleString()} XP</span>
            <span>{(levelInfo.nextLevelXp - levelInfo.currentXp).toLocaleString()} XP para nivel {levelInfo.level + 1}</span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-700"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Dato del día ── */}
      <div className="rounded-2xl overflow-hidden border border-emerald-700/40"
        style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.15) 0%, rgba(13,148,136,0.08) 100%)' }}>
        <div className="px-5 py-3 border-b border-emerald-700/30 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">Dato de hoy</h2>
        </div>
        <div className="px-5 py-4">
          <p className="text-slate-300 text-sm leading-relaxed">{dailyFact}</p>
        </div>
      </div>

      {/* ── Pregunta a la IA ── */}
      <button
        onClick={() => onNavigate('learn')}
        className="w-full rounded-2xl overflow-hidden border border-teal-600/40 transition-all duration-200 hover:border-teal-500/60 hover:-translate-y-0.5 active:scale-98"
        style={{ background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)' }}
      >
        <div className="flex items-center justify-between p-5">
          <div className="text-left">
            <p className="text-white/70 text-xs font-medium mb-0.5">Asistente inteligente</p>
            <h2 className="text-2xl font-bold text-white">Pregunta a la IA</h2>
            <p className="text-emerald-100 text-xs mt-1">Identifica componentes y aprende al instante</p>
          </div>
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <span className="text-white/80 text-xs font-medium text-center leading-tight">Tomar foto y<br/>consultar</span>
          </div>
        </div>
      </button>

      {/* ── Grid de 4 módulos ── */}
      <div className="grid grid-cols-2 gap-3">

        {/* Introducción a la electrónica */}
        <button
          onClick={() => onNavigate('learn')}
          className="rounded-2xl p-5 text-left border border-emerald-600/40 transition-all duration-200 hover:border-emerald-500/60 hover:-translate-y-0.5 active:scale-98 group"
          style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.25) 0%, rgba(5,150,105,0.12) 100%)' }}
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">⚡</div>
          <p className="text-sm font-semibold text-slate-100 leading-snug">
            Introducción a la electrónica y leyes básicas
          </p>
          {tutorials[0] && (
            <div className="mt-2 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-xs text-amber-400">{tutorials[0].xp_reward} XP</span>
            </div>
          )}
        </button>

        {/* Diccionario de componentes */}
        <button
          onClick={() => onNavigate('inventory')}
          className="rounded-2xl p-5 text-left border border-teal-600/40 transition-all duration-200 hover:border-teal-500/60 hover:-translate-y-0.5 active:scale-98 group"
          style={{ background: 'linear-gradient(135deg, rgba(13,148,136,0.25) 0%, rgba(13,148,136,0.12) 100%)' }}
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
            <Search className="w-8 h-8 text-teal-400" />
          </div>
          <p className="text-sm font-semibold text-slate-100 leading-snug">
            Diccionario de componentes y herramientas
          </p>
          <div className="mt-2">
            <span className="text-xs text-teal-400">{profile.components_salvaged} recuperados</span>
          </div>
        </button>

        {/* Reciclaje y E-waste */}
        <button
          onClick={() => onNavigate('projects')}
          className="rounded-2xl p-5 text-left border border-emerald-600/40 transition-all duration-200 hover:border-emerald-500/60 hover:-translate-y-0.5 active:scale-98 group"
          style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.25) 0%, rgba(5,150,105,0.12) 100%)' }}
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
            <Recycle className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-sm font-semibold text-slate-100 leading-snug">
            Reciclaje y gestión de E-waste
          </p>
          <div className="mt-2">
            <span className="text-xs text-emerald-400">{profile.projects_completed} proyectos</span>
          </div>
        </button>

        {/* Juego / Puzzle */}
        <button
          onClick={() => onNavigate('puzzle')}
          className="rounded-2xl p-5 text-left border border-amber-600/40 transition-all duration-200 hover:border-amber-500/60 hover:-translate-y-0.5 active:scale-98 group"
          style={{ background: 'linear-gradient(135deg, rgba(217,119,6,0.20) 0%, rgba(217,119,6,0.08) 100%)' }}
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
            <Puzzle className="w-8 h-8 text-amber-400" />
          </div>
          <p className="text-sm font-semibold text-slate-100 leading-snug">
            Juego o mini puzzle
          </p>
          <div className="mt-2">
            <span className="text-xs text-amber-400">CircuitPuzzle</span>
          </div>
        </button>
      </div>

      {/* ── Tutoriales recientes ── */}
      {tutorials.length > 0 && (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-slate-200">Continúa aprendiendo</h3>
            </div>
            <button
              onClick={() => onNavigate('learn')}
              className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Ver todos <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-700/40">
            {tutorials.map(tutorial => (
              <button
                key={tutorial.id}
                onClick={() => onNavigate('learn')}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-700/30 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center text-lg flex-shrink-0">
                  {tutorial.category === 'basics' ? '⚡' : tutorial.category === 'circuits' ? '🔌' : tutorial.category === 'robotics' ? '🤖' : tutorial.category === 'ewaste' ? '♻️' : '🔧'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 line-clamp-1">{tutorial.title}</p>
                  <p className="text-xs text-slate-500">{tutorial.duration_minutes} min</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">{tutorial.xp_reward}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Stats rápidas ── */}
      <div className="grid grid-cols-3 gap-3 pb-2">
        {[
          { label: 'Tutoriales', value: profile.tutorials_completed, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
          { label: 'Componentes', value: profile.components_salvaged, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Proyectos', value: profile.projects_completed, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-2xl p-4 border ${bg} text-center`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
