import { useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, Plus, X, Users, Lightbulb, HelpCircle, Trophy } from 'lucide-react';
import { supabase, CommunityPost, UserProfile, timeAgo } from '../lib/supabase';

interface CommunityPageProps {
  userId: string;
  profile: UserProfile;
}

const POST_TYPES: { value: CommunityPost['type']; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'project', label: 'Proyecto', icon: Trophy, color: 'text-amber-400' },
  { value: 'tip', label: 'Consejo', icon: Lightbulb, color: 'text-teal-400' },
  { value: 'question', label: 'Pregunta', icon: HelpCircle, color: 'text-blue-400' },
  { value: 'achievement', label: 'Logro', icon: Trophy, color: 'text-rose-400' },
];

const TYPE_ICONS: Record<string, React.ElementType> = {
  project: Trophy, tip: Lightbulb, question: HelpCircle, achievement: Trophy,
};

const TYPE_COLORS: Record<string, string> = {
  project: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  tip: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
  question: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  achievement: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
};

const TYPE_LABELS: Record<string, string> = {
  project: 'Proyecto', tip: 'Consejo', question: 'Pregunta', achievement: 'Logro',
};

export default function CommunityPage({ userId, profile }: CommunityPageProps) {
  const [posts, setPosts] = useState<(CommunityPost & { user?: UserProfile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [postType, setPostType] = useState<CommunityPost['type']>('project');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    loadPosts();
    loadLikes();
  }, [userId]);

  async function loadPosts() {
    const { data } = await supabase
      .from('community_posts')
      .select('*, user:user_profiles!community_posts_user_id_fkey(*)')
      .order('created_at', { ascending: false })
      .limit(50);
    setPosts(data ?? []);
    setLoading(false);
  }

  async function loadLikes() {
    const { data } = await supabase.from('post_likes').select('post_id').eq('user_id', userId);
    setLikedPosts(new Set(data?.map(l => l.post_id) ?? []));
  }

  async function createPost() {
    if (!title.trim()) return;
    setPosting(true);
    const { data } = await supabase.from('community_posts').insert({
      user_id: userId,
      type: postType,
      title: title.trim(),
      content: content.trim(),
    }).select('*').maybeSingle();

    if (data) {
      setPosts(prev => [{ ...data, user: profile }, ...prev]);
      setShowModal(false);
      setTitle('');
      setContent('');
    }
    setPosting(false);
  }

  async function toggleLike(postId: string) {
    const isLiked = likedPosts.has(postId);
    if (isLiked) {
      await supabase.from('post_likes').delete().match({ user_id: userId, post_id: postId });
      setLikedPosts(prev => { const n = new Set(prev); n.delete(postId); return n; });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: Math.max(0, p.likes_count - 1) } : p));
    } else {
      await supabase.from('post_likes').insert({ user_id: userId, post_id: postId });
      setLikedPosts(prev => new Set([...prev, postId]));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p));
    }
  }

  const filtered = posts.filter(p => activeFilter === 'all' || p.type === activeFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Comunidad EcoReEngine</h2>
          <p className="section-subtitle">{posts.length} publicaciones de la comunidad</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Publicar
        </button>
      </div>

      {/* Quick share bar */}
      <button
        onClick={() => setShowModal(true)}
        className="card w-full flex items-center gap-3 text-left hover:border-emerald-500/30 transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
          {(profile.full_name || 'U')[0].toUpperCase()}
        </div>
        <span className="text-slate-500 text-sm">Comparte un proyecto, consejo o pregunta...</span>
        <Share2 className="w-4 h-4 text-slate-600 ml-auto" />
      </button>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
            activeFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" /> Todos
        </button>
        {POST_TYPES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setActiveFilter(value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === value ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Posts feed */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="card h-32 animate-pulse bg-slate-800/40" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-medium mb-1">Aún no hay publicaciones</p>
          <p className="text-slate-500 text-sm mb-4">Sé el primero en compartir algo con la comunidad</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">Hacer primera publicación</button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(post => {
            const TypeIcon = TYPE_ICONS[post.type] ?? Trophy;
            const isLiked = likedPosts.has(post.id);
            return (
              <div key={post.id} className="card-hover">
                {/* Post header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                    {((post.user?.full_name || post.user?.username) ?? 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-100">
                        {post.user?.full_name || post.user?.username || 'Usuario'}
                      </span>
                      {post.user?.level && (
                        <span className="text-xs text-emerald-400">Nv.{post.user.level}</span>
                      )}
                      <span className={`badge border ${TYPE_COLORS[post.type]}`}>
                        <TypeIcon className="w-3 h-3" />
                        {TYPE_LABELS[post.type]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{timeAgo(post.created_at)}</p>
                  </div>
                </div>

                {/* Post content */}
                <h3 className="text-base font-semibold text-slate-100 mb-2">{post.title}</h3>
                {post.content && (
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">{post.content}</p>
                )}

                {/* Post tags */}
                {(post.tags as string[])?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(post.tags as string[]).map(tag => (
                      <span key={tag} className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Post actions */}
                <div className="flex items-center gap-4 pt-2 border-t border-slate-700/50">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? 'text-rose-400' : 'text-slate-500 hover:text-rose-400'}`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    {post.likes_count}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-400 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments_count}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-400 transition-colors ml-auto">
                    <Share2 className="w-4 h-4" />
                    Compartir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create post modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative glass rounded-3xl w-full max-w-lg animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-lg font-bold text-slate-100">Nueva publicación</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-200" /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de publicación</label>
                <div className="grid grid-cols-4 gap-2">
                  {POST_TYPES.map(({ value, label, icon: Icon, color }) => (
                    <button
                      key={value}
                      onClick={() => setPostType(value)}
                      className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-xs font-medium transition-all ${
                        postType === value
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${postType === value ? 'text-white' : color}`} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Título</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="¿Qué quieres compartir?" className="input" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Descripción (opcional)</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Más detalles..." className="input h-24 resize-none" />
              </div>
            </div>
            <div className="p-6 pt-0">
              <button onClick={createPost} disabled={!title.trim() || posting} className="btn-primary w-full py-3 disabled:opacity-50">
                {posting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
