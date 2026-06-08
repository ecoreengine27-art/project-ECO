import { useEffect, useRef, useState } from 'react';
import { Zap, Search, Camera, BookOpen, Recycle, Puzzle, ChevronRight, Flame, Sparkles, Send, X, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import { supabase, UserProfile, Tutorial, xpToLevel } from '../lib/supabase';

interface DashboardProps {
  profile: UserProfile;
  onNavigate: (page: string) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const DAILY_FACTS = [
  'Tu próximo gran invento no está en una tienda costosa; está escondido en un aparato viejo esperando que lo rescates. Hoy tienes el poder de transformar la chatarra electrónica en innovación de impacto. ¡La tecnología del futuro la construyes tú!',
  'Un computador desechado contiene más de 60 elementos de la tabla periódica. Cada componente que recuperas evita que metales preciosos terminen contaminando el suelo.',
  'El 80% de los dispositivos electrónicos desechados podría repararse o reutilizarse. Con tus manos y conocimiento, puedes darles una segunda vida.',
  'Una sola placa de circuito impreso reciclada puede evitar la emisión de hasta 2 kg de CO₂. Pequeñas acciones, gran impacto ambiental.',
  'Los inventores más creativos no compran piezas nuevas: las encuentran. Thomas Edison reutilizaba materiales en todos sus experimentos.',
  'El e-waste es la corriente de residuos de más rápido crecimiento en el mundo. Solo el 20% se recicla correctamente. Tú puedes cambiar eso.',
  'Cada resistencia, capacitor o transistor que salvas de la basura es un recurso que no necesita ser minado ni fabricado de nuevo.',
];

const SUGGESTED_QUESTIONS = [
  '¿Cómo identifico una resistencia por su código de colores?',
  '¿Qué componentes puedo recuperar de un celular viejo?',
  '¿Cómo funciona la Ley de Ohm?',
  '¿Qué es un transistor y para qué sirve?',
];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

async function askAI(messages: ChatMessage[]): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Error ${res.status}`);
  }

  const data = await res.json() as { reply?: string; error?: string };
  if (data.error) throw new Error(data.error);
  return data.reply ?? 'Sin respuesta.';
}

function ChatModal({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy EcoBot 🤖⚡ Tu asistente de electrónica y reciclaje. Puedes preguntarme sobre componentes electrónicos, circuitos, cómo recuperar piezas de aparatos viejos, o cualquier duda de electrónica. ¿En qué te ayudo hoy?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const reply = await askAI(newMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg flex flex-col bg-slate-900 sm:rounded-3xl border border-slate-700/60 shadow-2xl overflow-hidden"
        style={{ height: 'min(90vh, 680px)' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/60 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)' }}>
          <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white leading-none">EcoBot</p>
            <p className="text-emerald-100 text-xs mt-0.5">Asistente de electrónica y e-waste</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-emerald-600 to-teal-600'
                  : 'bg-slate-700'
              }`}>
                {msg.role === 'assistant'
                  ? <Bot className="w-4 h-4 text-white" />
                  : <UserIcon className="w-4 h-4 text-slate-300" />
                }
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tl-sm'
                  : 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-tr-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                <span className="text-sm text-slate-400">EcoBot está pensando...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl px-4 py-3">
              Error: {error}
            </div>
          )}

          {/* Suggested questions — only on first message */}
          {messages.length === 1 && !loading && (
            <div className="space-y-2 pt-1">
              <p className="text-xs text-slate-500 px-1">Preguntas sugeridas:</p>
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="w-full text-left text-xs text-slate-300 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 hover:border-emerald-500/40 hover:bg-slate-700/60 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 px-4 py-3 border-t border-slate-700/60 bg-slate-900 flex-shrink-0"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Escribe tu pregunta..."
            disabled={loading}
            className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:shadow-lg hover:shadow-emerald-600/30 transition-all active:scale-95"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard({ profile, onNavigate }: DashboardProps) {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const levelInfo = xpToLevel(profile.total_xp);
  const dailyFact = DAILY_FACTS[new Date().getDay() % DAILY_FACTS.length];

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
        onClick={() => setChatOpen(true)}
        className="w-full rounded-2xl overflow-hidden border border-teal-600/40 transition-all duration-200 hover:border-teal-500/60 hover:-translate-y-0.5 active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)' }}
      >
        <div className="flex items-center justify-between p-5">
          <div className="text-left">
            <p className="text-white/70 text-xs font-medium mb-0.5">Asistente inteligente</p>
            <h2 className="text-2xl font-bold text-white">Pregunta a la IA</h2>
            <p className="text-emerald-100 text-xs mt-1">Identifica componentes, aprende electrónica y más</p>
          </div>
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <span className="text-white/80 text-xs font-medium text-center leading-tight">Toca para<br/>chatear</span>
          </div>
        </div>
      </button>

      {/* ── Grid de 4 módulos ── */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('learn')}
          className="rounded-2xl p-5 text-left border border-emerald-600/40 transition-all duration-200 hover:border-emerald-500/60 hover:-translate-y-0.5 active:scale-[0.98] group"
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

        <button
          onClick={() => onNavigate('inventory')}
          className="rounded-2xl p-5 text-left border border-teal-600/40 transition-all duration-200 hover:border-teal-500/60 hover:-translate-y-0.5 active:scale-[0.98] group"
          style={{ background: 'linear-gradient(135deg, rgba(13,148,136,0.25) 0%, rgba(13,148,136,0.12) 100%)' }}
        >
          <div className="mb-3 group-hover:scale-110 transition-transform duration-200">
            <Search className="w-8 h-8 text-teal-400" />
          </div>
          <p className="text-sm font-semibold text-slate-100 leading-snug">
            Diccionario de componentes y herramientas
          </p>
          <div className="mt-2">
            <span className="text-xs text-teal-400">{profile.components_salvaged} recuperados</span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('projects')}
          className="rounded-2xl p-5 text-left border border-emerald-600/40 transition-all duration-200 hover:border-emerald-500/60 hover:-translate-y-0.5 active:scale-[0.98] group"
          style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.25) 0%, rgba(5,150,105,0.12) 100%)' }}
        >
          <div className="mb-3 group-hover:scale-110 transition-transform duration-200">
            <Recycle className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-sm font-semibold text-slate-100 leading-snug">
            Reciclaje y gestión de E-waste
          </p>
          <div className="mt-2">
            <span className="text-xs text-emerald-400">{profile.projects_completed} proyectos</span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('puzzle')}
          className="rounded-2xl p-5 text-left border border-amber-600/40 transition-all duration-200 hover:border-amber-500/60 hover:-translate-y-0.5 active:scale-[0.98] group"
          style={{ background: 'linear-gradient(135deg, rgba(217,119,6,0.20) 0%, rgba(217,119,6,0.08) 100%)' }}
        >
          <div className="mb-3 group-hover:scale-110 transition-transform duration-200">
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

      {/* ── Chat Modal ── */}
      {chatOpen && <ChatModal onClose={() => setChatOpen(false)} />}
    </div>
  );
}
