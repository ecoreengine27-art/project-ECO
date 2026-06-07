import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Partial<UserProfile>;
        Update: Partial<UserProfile>;
      };
      components: {
        Row: Component;
        Insert: Partial<Component>;
        Update: Partial<Component>;
      };
      user_components: {
        Row: UserComponent;
        Insert: Partial<UserComponent>;
        Update: Partial<UserComponent>;
      };
      tutorials: {
        Row: Tutorial;
        Insert: Partial<Tutorial>;
        Update: Partial<Tutorial>;
      };
      tutorial_progress: {
        Row: TutorialProgress;
        Insert: Partial<TutorialProgress>;
        Update: Partial<TutorialProgress>;
      };
      projects: {
        Row: Project;
        Insert: Partial<Project>;
        Update: Partial<Project>;
      };
      community_posts: {
        Row: CommunityPost;
        Insert: Partial<CommunityPost>;
        Update: Partial<CommunityPost>;
      };
      achievements: {
        Row: Achievement;
        Insert: Partial<Achievement>;
        Update: Partial<Achievement>;
      };
      user_achievements: {
        Row: UserAchievement;
        Insert: Partial<UserAchievement>;
        Update: Partial<UserAchievement>;
      };
    };
  };
};

export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string;
  bio: string;
  avatar_url: string;
  level: number;
  total_xp: number;
  components_salvaged: number;
  co2_saved_kg: number;
  tutorials_completed: number;
  projects_completed: number;
  streak_days: number;
  last_active_date: string;
  created_at: string;
  updated_at: string;
}

export interface Component {
  id: string;
  name: string;
  category: string;
  description: string;
  typical_source: string;
  difficulty_level: number;
  image_url: string;
  properties: Record<string, string | number>;
  salvage_xp: number;
  co2_saved_g: number;
  created_at: string;
}

export interface UserComponent {
  id: string;
  user_id: string;
  component_id: string;
  quantity: number;
  condition: string;
  source: string;
  notes: string;
  created_at: string;
  component?: Component;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: number;
  duration_minutes: number;
  xp_reward: number;
  content: TutorialBlock[];
  required_components: string[];
  image_url: string;
  tags: string[];
  order_index: number;
  created_at: string;
}

export interface TutorialBlock {
  type: 'text' | 'code' | 'warning' | 'tip' | 'image' | 'quiz';
  content: string;
  language?: string;
  options?: string[];
  answer?: number;
}

export interface TutorialProgress {
  id: string;
  user_id: string;
  tutorial_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  completed_at: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  status: 'planning' | 'in_progress' | 'completed' | 'shared';
  difficulty_level: number;
  components_used: string[];
  steps: ProjectStep[];
  images: string[];
  xp_earned: number;
  is_public: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectStep {
  title: string;
  description: string;
  completed: boolean;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  type: 'project' | 'question' | 'tip' | 'achievement';
  title: string;
  content: string;
  project_id: string | null;
  images: string[];
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  user?: UserProfile;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export function xpToLevel(xp: number): { level: number; currentXp: number; nextLevelXp: number; progress: number } {
  const base = 100;
  let level = 1;
  let totalRequired = 0;
  while (true) {
    const required = base * level * level;
    if (xp < totalRequired + required) {
      return {
        level,
        currentXp: xp - totalRequired,
        nextLevelXp: required,
        progress: Math.round(((xp - totalRequired) / required) * 100),
      };
    }
    totalRequired += required;
    level++;
  }
}

export function difficultyLabel(level: number): string {
  return ['', 'Principiante', 'Básico', 'Intermedio', 'Avanzado', 'Experto'][level] ?? 'Experto';
}

export function difficultyColor(level: number): string {
  return ['', 'text-emerald-400', 'text-teal-400', 'text-amber-400', 'text-orange-400', 'text-red-400'][level] ?? 'text-red-400';
}

export function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    basics: 'Fundamentos',
    circuits: 'Circuitos',
    robotics: 'Robótica',
    ewaste: 'E-waste',
    projects: 'Proyectos',
    general: 'General',
    resistor: 'Resistencia',
    capacitor: 'Capacitor',
    diode: 'Diodo',
    led: 'LED',
    transistor: 'Transistor',
    ic: 'Circuito Integrado',
    motor: 'Motor',
    sensor: 'Sensor',
    power: 'Fuente de Poder',
    cable: 'Cable',
    display: 'Pantalla',
    wireless: 'Inalámbrico',
  };
  return map[cat] ?? cat;
}

export function formatCO2(grams: number): string {
  if (grams >= 1000) return `${(grams / 1000).toFixed(1)} kg`;
  return `${grams} g`;
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora mismo';
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days}d`;
  return new Date(dateStr).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' });
}
