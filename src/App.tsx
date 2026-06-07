import { useEffect, useState, useCallback } from 'react';
import { supabase, UserProfile } from './lib/supabase';
import type { User } from '@supabase/supabase-js';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import LearnPage from './pages/LearnPage';
import InventoryPage from './pages/InventoryPage';
import ProjectsPage from './pages/ProjectsPage';
import CommunityPage from './pages/CommunityPage';
import AchievementsPage from './pages/AchievementsPage';
import PuzzlePage from './pages/PuzzlePage';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

type Page = 'landing' | 'auth' | 'dashboard' | 'learn' | 'inventory' | 'projects' | 'community' | 'achievements' | 'puzzle' | 'settings';

const PAGE_TITLES: Record<Page, string> = {
  landing: 'EcoReEngine',
  auth: 'Iniciar Sesión',
  dashboard: 'Dashboard',
  learn: 'Aprender',
  inventory: 'Inventario',
  projects: 'Proyectos',
  community: 'Comunidad',
  achievements: 'Logros',
  puzzle: 'CircuitPuzzle',
  settings: 'Configuración',
};

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center mx-auto mb-4 animate-pulse-slow shadow-2xl shadow-emerald-600/40">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
          </svg>
        </div>
        <div className="w-6 h-6 border-2 border-emerald-600/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-sm mt-3">Cargando EcoReEngine...</p>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [page, setPage] = useState<Page>('landing');
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      setProfile(data);
    } else {
      const { data: newProfile } = await supabase
        .from('user_profiles')
        .insert({ id: userId })
        .select('*')
        .maybeSingle();
      if (newProfile) setProfile(newProfile);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id).finally(() => {
          setLoading(false);
          setPage('dashboard');
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (() => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          loadProfile(session.user.id);
          setPage('dashboard');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setPage('landing');
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  async function refreshProfile() {
    if (user) await loadProfile(user.id);
  }

  function navigate(p: string) {
    setPage(p as Page);
  }

  if (loading) return <LoadingScreen />;

  if (!user || page === 'landing') {
    return (
      <div className="dark">
        {page === 'landing' && !user && (
          <LandingPage onGetStarted={() => setPage('auth')} />
        )}
        {page === 'auth' && (
          <AuthPage onSuccess={() => setPage('dashboard')} onBack={() => setPage('landing')} />
        )}
      </div>
    );
  }

  const renderPage = () => {
    if (!profile) return null;
    switch (page) {
      case 'dashboard':
        return <Dashboard profile={profile} onNavigate={navigate} />;
      case 'learn':
        return <LearnPage userId={user.id} />;
      case 'inventory':
        return <InventoryPage userId={user.id} onXpGained={refreshProfile} />;
      case 'projects':
        return <ProjectsPage userId={user.id} onXpGained={refreshProfile} />;
      case 'community':
        return <CommunityPage userId={user.id} profile={profile} />;
      case 'achievements':
        return <AchievementsPage userId={user.id} profile={profile} />;
      case 'puzzle':
        return <PuzzlePage userId={user.id} onXpGained={refreshProfile} />;
      default:
        return <Dashboard profile={profile} onNavigate={navigate} />;
    }
  };

  return (
    <div className="dark min-h-screen bg-slate-950">
      <Sidebar
        currentPage={page}
        onNavigate={p => setPage(p)}
        profile={profile}
        onSignOut={handleSignOut}
      />
      <div className="lg:ml-64 min-h-screen flex flex-col">
        <Header
          currentPage={page}
          onNavigate={p => setPage(p)}
          profile={profile}
          pageTitle={PAGE_TITLES[page] ?? 'EcoReEngine'}
        />
        <main className="flex-1 px-4 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
