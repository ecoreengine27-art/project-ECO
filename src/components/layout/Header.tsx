import { useState } from 'react';
import { Menu, X, Bell, Search, Cpu, LayoutDashboard, BookOpen, Package, Wrench, Users, Trophy, Leaf, Gamepad2 } from 'lucide-react';
import { UserProfile, xpToLevel } from '../../lib/supabase';

type Page = 'landing' | 'auth' | 'dashboard' | 'learn' | 'inventory' | 'projects' | 'community' | 'achievements' | 'puzzle' | 'settings';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  profile: UserProfile | null;
  pageTitle: string;
}

const mobileNavItems: { icon: React.ElementType; label: string; page: Page }[] = [
  { icon: LayoutDashboard, label: 'Inicio', page: 'dashboard' },
  { icon: BookOpen, label: 'Aprender', page: 'learn' },
  { icon: Package, label: 'Inventario', page: 'inventory' },
  { icon: Wrench, label: 'Proyectos', page: 'projects' },
  { icon: Users, label: 'Comunidad', page: 'community' },
  { icon: Gamepad2, label: 'Puzzle', page: 'puzzle' },
];

export default function Header({ currentPage, onNavigate, profile, pageTitle }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const levelInfo = profile ? xpToLevel(profile.total_xp) : null;

  return (
    <>
      <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/50 px-4 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: mobile menu + title */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden text-slate-400 hover:text-slate-100 p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="text-lg font-semibold text-slate-100">{pageTitle}</h1>
        </div>

        {/* Right: search + xp + notifications */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar tutoriales, componentes..."
              className="bg-transparent text-sm text-slate-300 placeholder-slate-500 focus:outline-none w-48"
            />
          </div>

          {levelInfo && (
            <div className="hidden md:flex items-center gap-2 glass rounded-xl px-3 py-1.5">
              <Leaf className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-amber-400">{profile?.total_xp.toLocaleString()} XP</span>
            </div>
          )}

          <button className="relative text-slate-400 hover:text-slate-100 p-2 rounded-xl hover:bg-slate-800 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
          </button>

          {profile && (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center font-bold text-white text-sm cursor-pointer hover:shadow-lg hover:shadow-emerald-600/30 transition-all">
              {(profile.full_name || profile.username || 'U')[0].toUpperCase()}
            </div>
          )}
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-slate-900 border-r border-slate-800 p-6 animate-slide-in">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-100">EcoReEngine</p>
                <p className="text-xs text-emerald-400">Aprende. Recicla. Crea.</p>
              </div>
            </div>

            <nav className="space-y-1">
              {[...mobileNavItems, { icon: Trophy, label: 'Logros', page: 'achievements' as Page }].map(({ icon: Icon, label, page }) => (
                <button
                  key={page}
                  onClick={() => { onNavigate(page); setMobileMenuOpen(false); }}
                  className={currentPage === page ? 'nav-item-active w-full text-left' : 'nav-item w-full text-left'}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </nav>

            {profile && levelInfo && (
              <div className="mt-auto pt-6">
                <div className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center font-bold text-white">
                      {(profile.full_name || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{profile.full_name || profile.username}</p>
                      <p className="text-xs text-emerald-400">Nivel {levelInfo.level} · {profile.total_xp} XP</p>
                    </div>
                  </div>
                  <div className="xp-bar">
                    <div className="xp-fill" style={{ width: `${levelInfo.progress}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
