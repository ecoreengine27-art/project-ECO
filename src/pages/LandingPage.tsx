import { Recycle, Zap, Users, Award, ChevronRight, Leaf, Globe, BookOpen, Wrench, ArrowRight, Star, Github } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const features = [
  {
    icon: Recycle,
    title: 'Transforma E-waste',
    description: 'Aprende a identificar y recuperar componentes valiosos de aparatos electrónicos en desuso.',
    color: 'from-emerald-600 to-teal-600',
  },
  {
    icon: BookOpen,
    title: 'Aprende Haciendo',
    description: 'Tutoriales interactivos desde la Ley de Ohm hasta robótica avanzada, todos con materiales reciclados.',
    color: 'from-teal-600 to-blue-600',
  },
  {
    icon: Wrench,
    title: 'Construye Proyectos',
    description: 'Crea soluciones tecnológicas reales usando solo componentes recuperados y tu creatividad.',
    color: 'from-blue-600 to-cyan-600',
  },
  {
    icon: Users,
    title: 'Comunidad Activa',
    description: 'Comparte tus proyectos, ayuda a otros y aprende de una comunidad apasionada por la tecnología sostenible.',
    color: 'from-amber-600 to-orange-600',
  },
  {
    icon: Award,
    title: 'Gamificación',
    description: 'Gana XP, sube de nivel y desbloquea logros mientras aprendes y reduces el impacto ambiental.',
    color: 'from-rose-600 to-pink-600',
  },
  {
    icon: Globe,
    title: 'Impacto Real',
    description: 'Mide cuánto CO2 has salvado del ambiente. Cada componente recuperado cuenta.',
    color: 'from-green-600 to-emerald-600',
  },
];

const stats = [
  { value: '2.5M', label: 'Toneladas de e-waste anual en LatAm' },
  { value: '70%', label: 'Componentes reutilizables en promedio' },
  { value: '$0', label: 'Costo inicial para empezar' },
  { value: '10x', label: 'Ahorro vs kits comerciales' },
];

const testimonials = [
  {
    name: 'María González',
    role: 'Estudiante de Ing. Eléctrica',
    text: 'Con EcoReEngine aprendí electrónica básica usando partes de un televisor viejo. ¡Increíble!',
    xp: 2840,
    level: 5,
  },
  {
    name: 'Carlos Pérez',
    role: 'Docente de Secundaria',
    text: 'Mis alumnos construyeron robots con componentes reciclados. El aprendizaje fue exponencial.',
    xp: 5120,
    level: 8,
  },
  {
    name: 'Ana Rodríguez',
    role: 'Maker & Emprendedora',
    text: 'Creé un cargador solar para mi abuela usando piezas de una impresora. Cambió su vida.',
    xp: 9640,
    level: 12,
  },
];

const learningPath = [
  { step: 1, title: 'Fundamentos', desc: 'Ley de Ohm, voltaje, corriente, resistencia', badge: 'Principiante' },
  { step: 2, title: 'Identificación', desc: 'Aprende a leer códigos de colores y marcas', badge: 'Básico' },
  { step: 3, title: 'Primer Circuito', desc: 'LED + resistencia, tu primer "Hola Mundo"', badge: 'Básico' },
  { step: 4, title: 'E-waste Real', desc: 'Desmonta aparatos y recupera componentes', badge: 'Intermedio' },
  { step: 5, title: 'Proyectos', desc: 'Construye soluciones reales y útiles', badge: 'Avanzado' },
];

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/WhatsApp_Image_2026-06-08_at_8.40.25_AM.jpeg"
              alt="EcoReEngine logo"
              className="w-9 h-9 rounded-xl object-cover shadow-lg"
            />
            <span className="font-bold text-slate-100 text-lg">EcoReEngine</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Características</a>
            <a href="#learn" className="hover:text-emerald-400 transition-colors">Aprender</a>
            <a href="#community" className="hover:text-emerald-400 transition-colors">Comunidad</a>
          </div>
          <button onClick={onGetStarted} className="btn-primary text-sm">
            Comenzar Gratis
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient opacity-60" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-40 right-1/4 w-48 h-48 bg-teal-600/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-1/3 w-32 h-32 bg-amber-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 badge-emerald mb-6 px-4 py-1.5 text-sm">
            <Leaf className="w-4 h-4" />
            <span>Tecnología sostenible para todos</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-100 leading-tight mb-6">
            Convierte{' '}
            <span className="hero-text-gradient">E-waste</span>
            <br />
            en Conocimiento
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            La plataforma educativa que transforma residuos electrónicos en recursos de aprendizaje.
            Aprende electrónica y robótica <strong className="text-slate-200">gratis</strong>, con materiales que ya existen.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onGetStarted} className="btn-primary flex items-center gap-2 text-base px-8 py-3">
              Empieza tu viaje
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="btn-secondary flex items-center gap-2 text-base px-8 py-3">
              <Github className="w-4 h-4" />
              Ver en GitHub
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
              <span className="ml-1 text-slate-400">4.9/5</span>
            </div>
            <span>·</span>
            <span>+2,000 usuarios activos</span>
            <span>·</span>
            <span>Completamente gratis</span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative max-w-5xl mx-auto mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="glass rounded-2xl p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold hero-text-gradient mb-1">{value}</p>
              <p className="text-xs sm:text-sm text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
              Todo lo que necesitas para empezar
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Una plataforma integral diseñada para llevar a cualquier persona desde cero hasta crear proyectos de impacto real.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="card-hover group">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Path */}
      <section id="learn" className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
              Tu camino de aprendizaje
            </h2>
            <p className="text-slate-400">De cero a inventor en pasos claros y accesibles</p>
          </div>

          <div className="relative">
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-emerald-600 to-teal-600 hidden sm:block" />
            <div className="space-y-4">
              {learningPath.map(({ step, title, desc, badge }) => (
                <div key={step} className="flex gap-4 items-start">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-emerald-600/30 z-10 relative">
                      {step}
                    </div>
                  </div>
                  <div className="card-hover flex-1 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-100">{title}</h3>
                        <span className="badge-emerald text-xs">{badge}</span>
                      </div>
                      <p className="text-sm text-slate-400">{desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="community" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
              Historias reales de la comunidad
            </h2>
            <p className="text-slate-400">Personas que transformaron e-waste en oportunidades</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, xp, level }) => (
              <div key={name} className="card-hover flex flex-col gap-4">
                <div className="flex">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed flex-1">"{text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-700/50">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center font-bold text-white text-sm">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{name}</p>
                    <p className="text-xs text-slate-500">{role}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs font-semibold text-amber-400">Nv. {level}</p>
                    <p className="text-xs text-slate-500">{xp.toLocaleString()} XP</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-teal-600/5" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-600/40">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
                Empieza hoy. Es gratis.
              </h2>
              <p className="text-slate-400 mb-8 text-lg">
                Únete a miles de personas que ya están convirtiendo basura electrónica en tecnología útil.
              </p>
              <button onClick={onGetStarted} className="btn-primary flex items-center gap-2 mx-auto text-base px-10 py-4">
                Crear cuenta gratis
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-xs text-slate-500 mt-4">Sin tarjeta de crédito. Sin límites. Solo aprendizaje.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/WhatsApp_Image_2026-06-08_at_8.40.25_AM.jpeg"
              alt="EcoReEngine logo"
              className="w-7 h-7 rounded-lg object-cover"
            />
            <span className="font-semibold text-slate-300">EcoReEngine</span>
          </div>
          <p className="text-sm text-slate-500">
            Democratizando la educación tecnológica sostenible
          </p>
          <div className="flex gap-2">
            <span className="badge-emerald">Open Source</span>
            <span className="badge bg-teal-500/20 text-teal-400 border border-teal-500/30">Eco-friendly</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
