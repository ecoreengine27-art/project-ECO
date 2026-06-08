import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Leaf, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function AuthPage({ onSuccess, onBack }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (mode === 'register') {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      if (data.user) {
        await supabase.from('user_profiles').insert({
          id: data.user.id,
          full_name: fullName,
          username: email.split('@')[0],
        });
        onSuccess();
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos' : signInError.message);
        setLoading(false);
        return;
      }
      onSuccess();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-teal-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </button>

        {/* Card */}
        <div className="glass rounded-3xl p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img
              src="/WhatsApp_Image_2026-06-08_at_8.40.25_AM.jpeg"
              alt="EcoReEngine logo"
              className="w-11 h-11 rounded-2xl object-cover shadow-lg"
            />
            <div>
              <p className="font-bold text-slate-100">EcoReEngine</p>
              <p className="text-xs text-emerald-400">Aprende. Recicla. Crea.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-100 mb-1">
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </h2>
          <p className="text-slate-400 text-sm mb-8">
            {mode === 'login'
              ? 'Ingresa tus credenciales para continuar tu aprendizaje'
              : 'Únete a la comunidad de tecnología sostenible'}
          </p>

          {/* Mode toggle */}
          <div className="flex bg-slate-800/80 rounded-xl p-1 mb-6 border border-slate-700">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'login' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'register' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Tu nombre"
                    className="input pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                  className="input pl-10 pr-10"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Leaf className="w-4 h-4" />
                  {mode === 'login' ? 'Iniciar Sesión' : 'Crear cuenta gratis'}
                </>
              )}
            </button>
          </form>

          {mode === 'register' && (
            <p className="text-xs text-slate-500 text-center mt-4">
              Al registrarte aceptas contribuir a un mundo con menos e-waste
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
