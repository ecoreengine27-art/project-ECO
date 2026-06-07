import { useState, useEffect } from 'react';
import { ChevronLeft, RotateCcw, Zap, Clock, Star, Lock, Trophy, ChevronRight, Gamepad2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── TYPES ────────────────────────────────────────────────────────────────────
type DirIdx = 0 | 1 | 2 | 3; // N=0, E=1, S=2, W=3
type TileType = 'empty' | 'straight' | 'corner' | 'tee' | 'cross' | 'source' | 'sink';
type Rot = 0 | 90 | 180 | 270;

interface Tile { type: TileType; rotation: Rot; locked: boolean }

// [type, solutionRot, locked, initialRot]
type TileDef = [TileType, Rot, boolean, Rot];

interface Level {
  id: number;
  name: string;
  desc: string;
  rows: number;
  cols: number;
  baseXp: number;
  grid: TileDef[][];
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const BASE_CONNS: Record<TileType, DirIdx[]> = {
  empty: [],
  straight: [1, 3],       // E, W
  corner: [0, 1],         // N, E
  tee: [0, 1, 3],         // N, E, W
  cross: [0, 1, 2, 3],    // all
  source: [1],            // E
  sink: [3],              // W
};

// [dRow, dCol, oppositeDir]
const DIR_VEC: [number, number, DirIdx][] = [
  [-1, 0, 2], // N → opposite S
  [0, 1, 3],  // E → opposite W
  [1, 0, 0],  // S → opposite N
  [0, -1, 1], // W → opposite E
];

// Edge midpoint positions in 64×64 viewBox
const EDGE: [number, number][] = [
  [32, 5],  // N
  [59, 32], // E
  [32, 59], // S
  [5, 32],  // W
];

function getConns(type: TileType, rotation: Rot): DirIdx[] {
  const steps = rotation / 90;
  return BASE_CONNS[type].map(d => ((d + steps) % 4) as DirIdx);
}

function computePowered(tiles: Tile[][], rows: number, cols: number): boolean[][] {
  const p = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
  let sr = -1, sc = -1;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (tiles[r][c].type === 'source') { sr = r; sc = c; }
  if (sr < 0) return p;

  const q: [number, number][] = [[sr, sc]];
  p[sr][sc] = true;
  while (q.length) {
    const [r, c] = q.shift()!;
    for (const dir of getConns(tiles[r][c].type, tiles[r][c].rotation)) {
      const [dr, dc, opp] = DIR_VEC[dir];
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || p[nr][nc]) continue;
      if (tiles[nr][nc].type === 'empty') continue;
      if (getConns(tiles[nr][nc].type, tiles[nr][nc].rotation).includes(opp)) {
        p[nr][nc] = true;
        q.push([nr, nc]);
      }
    }
  }
  return p;
}

function isSolved(tiles: Tile[][], powered: boolean[][], rows: number, cols: number): boolean {
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (tiles[r][c].type === 'sink' && powered[r][c]) return true;
  return false;
}

// ─── LEVELS ───────────────────────────────────────────────────────────────────
const E: TileDef = ['empty', 0, true, 0];

const LEVELS: Level[] = [
  {
    id: 1, name: 'Línea directa', baseXp: 50,
    desc: 'Conecta la batería con el LED. Gira los cables para completar la línea.',
    rows: 4, cols: 4,
    grid: [
      [E, E, E, E],
      [['source', 0, true, 0], ['straight', 0, false, 90], ['straight', 0, false, 90], ['sink', 0, true, 0]],
      [E, E, E, E],
      [E, E, E, E],
    ],
  },
  {
    id: 2, name: 'Primera curva', baseXp: 90,
    desc: 'El circuito da vuelta en una esquina. Orienta la curva correctamente.',
    rows: 4, cols: 4,
    grid: [
      [E, E, E, E],
      [['source', 0, true, 0], ['straight', 0, false, 90], ['corner', 180, false, 90], E],
      [E, E, ['sink', 90, true, 90], E],
      [E, E, E, E],
    ],
  },
  {
    id: 3, name: 'Forma Z', baseXp: 130,
    desc: 'El camino zigzaguea. Dos curvas y dos rectas.',
    rows: 4, cols: 4,
    grid: [
      [E, E, E, E],
      [E, E, ['corner', 90, false, 180], ['sink', 0, true, 0]],
      [E, E, ['straight', 90, false, 0], E],
      [['source', 0, true, 0], ['straight', 0, false, 90], ['corner', 270, false, 90], E],
    ],
  },
  {
    id: 4, name: 'La escalera', baseXp: 180,
    desc: 'Un recorrido más largo con tres giros. Planifica antes de girar.',
    rows: 5, cols: 5,
    grid: [
      [E, E, E, E, E],
      [E, E, E, ['corner', 90, false, 180], ['sink', 0, true, 0]],
      [E, E, E, ['straight', 90, false, 0], E],
      [E, E, E, ['straight', 90, false, 0], E],
      [['source', 0, true, 0], ['straight', 0, false, 90], ['straight', 0, false, 90], ['corner', 270, false, 90], E],
    ],
  },
  {
    id: 5, name: 'La bifurcación T', baseXp: 240,
    desc: 'La unión T conecta tres ramas. Encuentra la orientación correcta del componente.',
    rows: 5, cols: 5,
    grid: [
      [E, E, E, E, E],
      [E, E, ['corner', 90, false, 0], ['straight', 0, false, 90], ['sink', 0, true, 0]],
      [['source', 0, true, 0], ['straight', 0, false, 90], ['tee', 270, false, 0], E, E],
      [E, E, E, E, E],
      [E, E, E, E, E],
    ],
  },
  {
    id: 6, name: 'La serpiente', baseXp: 350,
    desc: 'El laberinto más complejo. Seis giros, dos tramos verticales. ¡Demuestra tu maestría!',
    rows: 5, cols: 5,
    grid: [
      [['source', 0, true, 0], ['straight', 0, false, 90], ['corner', 180, false, 0], E, ['sink', 270, true, 270]],
      [E, E, ['straight', 90, false, 0], E, ['straight', 90, false, 0]],
      [E, E, ['corner', 0, false, 90], ['straight', 0, false, 90], ['corner', 270, false, 180]],
      [E, E, E, E, E],
      [E, E, E, E, E],
    ],
  },
];

const TILE_NAMES: Partial<Record<TileType, string>> = {
  straight: 'Recta', corner: 'Curva 90°', tee: 'Unión T', cross: 'Cruce',
  source: 'Batería', sink: 'LED',
};

// ─── TILE SVG ────────────────────────────────────────────────────────────────
interface TileProps { tile: Tile; powered: boolean; onClick: () => void; flash: boolean }

function TileComp({ tile, powered, onClick, flash }: TileProps) {
  const { type, rotation } = tile;
  if (type === 'empty') return <div className="aspect-square" />;

  const conns = getConns(type, rotation);
  const isSource = type === 'source';
  const isSink = type === 'sink';

  const wire = powered ? '#34d399' : '#475569';
  const glow = powered ? '#10b981' : 'transparent';
  const center = isSource ? '#f59e0b' : (isSink && powered) ? '#10b981' : powered ? '#34d399' : '#475569';

  return (
    <button
      onClick={onClick}
      disabled={tile.locked}
      title={TILE_NAMES[type]}
      className={[
        'aspect-square rounded-xl border transition-all duration-100 select-none relative overflow-hidden',
        powered
          ? 'bg-slate-800 border-emerald-500/50'
          : 'bg-slate-800/80 border-slate-700/60',
        !tile.locked ? 'cursor-pointer hover:brightness-125 active:scale-90' : 'cursor-default',
        flash ? 'brightness-150' : '',
      ].join(' ')}
      style={{ boxShadow: powered ? `0 0 10px ${glow}40` : undefined }}
    >
      <svg viewBox="0 0 64 64" className="w-full h-full">
        {/* Wire segments + edge dots + electricity particles */}
        {conns.map(dir => {
          const [ex, ey] = EDGE[dir];
          return (
            <g key={dir}>
              <line x1={32} y1={32} x2={ex} y2={ey}
                stroke={wire} strokeWidth={7} strokeLinecap="round" />
              <circle cx={ex} cy={ey} r={4.5} fill={wire} />
              {powered && (
                <circle r="2.8" fill="#a7f3d0" opacity="0.95">
                  <animateMotion dur={`${0.6 + dir * 0.12}s`} repeatCount="indefinite"
                    path={`M 32 32 L ${ex} ${ey}`} />
                </circle>
              )}
            </g>
          );
        })}

        {/* Center node */}
        <circle cx={32} cy={32} r={isSource || isSink ? 10 : 5} fill={center} />

        {/* Source: battery bolt */}
        {isSource && (
          <text x={32} y={38} textAnchor="middle" fontSize={12} fill="#1e293b" fontWeight="bold">⚡</text>
        )}

        {/* Sink: LED symbol */}
        {isSink && !powered && (
          <g>
            <polygon points="26,25 38,32 26,39" fill="#334155" />
            <line x1={38} y1={25} x2={38} y2={39} stroke="#334155" strokeWidth={3} />
          </g>
        )}
        {isSink && powered && (
          <g>
            <polygon points="26,25 38,32 26,39" fill="#fbbf24" />
            <line x1={38} y1={25} x2={38} y2={39} stroke="#fbbf24" strokeWidth={3} />
            {/* Glow rays */}
            {[0, 45, 90, 135].map(a => (
              <line key={a}
                x1={42 + Math.cos((a * Math.PI) / 180) * 5}
                y1={32 + Math.sin((a * Math.PI) / 180) * 5}
                x2={42 + Math.cos((a * Math.PI) / 180) * 11}
                y2={32 + Math.sin((a * Math.PI) / 180) * 11}
                stroke="#fcd34d" strokeWidth={2} strokeLinecap="round"
              />
            ))}
          </g>
        )}

        {/* Lock badge for locked non-endpoint tiles */}
        {tile.locked && !isSource && !isSink && (
          <circle cx={52} cy={52} r={8} fill="#1e293b" />
        )}
      </svg>
    </button>
  );
}

// ─── WIN SCREEN ───────────────────────────────────────────────────────────────
interface WinProps {
  level: Level;
  xpEarned: number;
  moves: number;
  elapsed: number;
  stars: number;
  isLast: boolean;
  onNext: () => void;
  onMenu: () => void;
  onRetry: () => void;
}

function WinScreen({ level, xpEarned, moves, elapsed, stars, isLast, onNext, onMenu, onRetry }: WinProps) {
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" />
      <div className="relative glass rounded-3xl p-8 max-w-sm w-full text-center animate-slide-up border border-emerald-500/30"
        style={{ boxShadow: '0 0 40px rgba(16,185,129,0.2)' }}>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map(i => (
            <Star key={i}
              className={`w-8 h-8 transition-all duration-300 ${i <= stars ? 'text-amber-400 fill-amber-400 scale-110' : 'text-slate-600'}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            />
          ))}
        </div>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-600/40">
          <Trophy className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-2xl font-bold text-slate-100 mb-1">¡Circuito completado!</h2>
        <p className="text-slate-400 text-sm mb-6">{level.name}</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'XP ganado', value: `+${xpEarned}`, icon: Zap, color: 'text-amber-400' },
            { label: 'Tiempo', value: fmt(elapsed), icon: Clock, color: 'text-teal-400' },
            { label: 'Movimientos', value: String(moves), icon: Gamepad2, color: 'text-blue-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
              <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
              <p className={`text-lg font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {!isLast && (
            <button onClick={onNext} className="btn-primary flex items-center justify-center gap-2">
              Siguiente nivel <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <button onClick={onRetry} className="btn-secondary text-sm">Repetir nivel</button>
          <button onClick={onMenu} className="btn-ghost text-sm">Volver al menú</button>
        </div>
      </div>
    </div>
  );
}

// ─── GAME SCREEN ──────────────────────────────────────────────────────────────
interface GameScreenProps {
  level: Level;
  userId: string;
  completedLevels: Set<number>;
  onBack: () => void;
  onLevelComplete: (id: number, xp: number) => void;
  onNextLevel: () => void;
}

function GameScreen({ level, userId, completedLevels, onBack, onLevelComplete, onNextLevel }: GameScreenProps) {
  const buildGrid = () =>
    level.grid.map(row => row.map(([type, , locked, initRot]) => ({ type, rotation: initRot, locked })));

  const [grid, setGrid] = useState<Tile[][]>(buildGrid);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [won, setWon] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [flashCell, setFlashCell] = useState<string | null>(null);
  const [stars, setStars] = useState(0);

  const powered = computePowered(grid, level.rows, level.cols);
  const solved = isSolved(grid, powered, level.rows, level.cols);

  // Timer
  useEffect(() => {
    if (won) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [won]);

  // Win detection
  useEffect(() => {
    if (won || !solved) return;
    setWon(true);

    const timeBonus = Math.max(0, Math.floor((180 - elapsed) / 6));
    const moveBonus = Math.max(0, 20 - moves);
    const total = level.baseXp + timeBonus + moveBonus;
    const s = elapsed < 30 && moves < 12 ? 3 : elapsed < 90 && moves < 25 ? 2 : 1;

    setXpEarned(total);
    setStars(s);
    onLevelComplete(level.id, total);

    // Award XP in Supabase
    (async () => {
      const { data: prof } = await supabase
        .from('user_profiles')
        .select('total_xp')
        .eq('id', userId)
        .maybeSingle();
      if (prof) {
        await supabase.from('user_profiles')
          .update({ total_xp: (prof.total_xp ?? 0) + total })
          .eq('id', userId);
      }
    })();
  }, [solved, won]);

  function rotate(r: number, c: number) {
    if (won || grid[r][c].locked || grid[r][c].type === 'empty') return;
    const key = `${r}-${c}`;
    setFlashCell(key);
    setTimeout(() => setFlashCell(null), 120);

    setGrid(prev =>
      prev.map((row, ri) =>
        row.map((tile, ci) =>
          ri === r && ci === c
            ? { ...tile, rotation: ((tile.rotation + 90) % 360) as Rot }
            : tile
        )
      )
    );
    setMoves(m => m + 1);
  }

  function reset() {
    setGrid(buildGrid());
    setMoves(0);
    setElapsed(0);
    setWon(false);
    setXpEarned(0);
    setFlashCell(null);
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-4 max-w-lg mx-auto animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="btn-ghost p-2 rounded-xl">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-emerald-400 font-medium">Nivel {level.id} · CircuitPuzzle</p>
          <h2 className="text-lg font-bold text-slate-100 leading-none">{level.name}</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm text-slate-400 font-mono">
            <Clock className="w-4 h-4" />{fmt(elapsed)}
          </span>
          <span className="text-sm text-slate-400 font-mono">{moves}m</span>
          <button onClick={reset} className="btn-ghost p-2 rounded-xl" title="Reiniciar">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description + reward */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-400 flex-1">{level.desc}</p>
        <div className="flex items-center gap-1 text-sm font-semibold text-amber-400 flex-shrink-0">
          <Zap className="w-4 h-4" />+{level.baseXp}
        </div>
      </div>

      {/* Grid */}
      <div
        className="rounded-2xl p-3 border transition-all duration-700"
        style={{
          backgroundImage: 'radial-gradient(circle, #1e293b 1.2px, #0f172a 1.2px)',
          backgroundSize: '20px 20px',
          borderColor: solved ? 'rgba(16,185,129,0.5)' : 'rgba(51,65,85,0.4)',
          boxShadow: solved ? '0 0 40px rgba(16,185,129,0.18), inset 0 0 30px rgba(16,185,129,0.06)' : undefined,
        }}
      >
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${level.cols}, 1fr)` }}
        >
          {grid.map((row, r) =>
            row.map((tile, c) => (
              <TileComp
                key={`${r}-${c}`}
                tile={tile}
                powered={powered[r][c]}
                onClick={() => rotate(r, c)}
                flash={flashCell === `${r}-${c}`}
              />
            ))
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <div className="w-5 h-1.5 rounded-full bg-emerald-400" />energizado
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-5 h-1.5 rounded-full bg-slate-500" />sin energía
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
            <span className="text-slate-400" style={{ fontSize: 8 }}>↻</span>
          </div>click = girar
        </span>
      </div>

      {/* Component guide */}
      <div className="glass rounded-2xl p-4">
        <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Guía de componentes</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-400">
          {[
            { label: 'Recta', desc: 'Conecta 2 lados opuestos', color: 'bg-teal-600' },
            { label: 'Curva 90°', desc: 'Conecta 2 lados adyacentes', color: 'bg-blue-600' },
            { label: 'Unión T', desc: 'Conecta 3 lados', color: 'bg-amber-600' },
          ].map(({ label, desc, color }) => (
            <div key={label} className="flex items-start gap-2">
              <div className={`w-2 h-2 rounded-full ${color} mt-0.5 flex-shrink-0`} />
              <div>
                <p className="text-slate-300 font-medium">{label}</p>
                <p className="text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {won && (
        <WinScreen
          level={level}
          xpEarned={xpEarned}
          moves={moves}
          elapsed={elapsed}
          stars={stars}
          isLast={level.id === LEVELS.length}
          onNext={() => { onNextLevel(); reset(); }}
          onMenu={onBack}
          onRetry={() => { reset(); }}
        />
      )}
    </div>
  );
}

// ─── LEVEL SELECT ────────────────────────────────────────────────────────────
interface LevelSelectProps {
  completedLevels: Map<number, { xp: number; stars: number }>;
  onSelect: (level: Level) => void;
}

function LevelSelect({ completedLevels, onSelect }: LevelSelectProps) {
  const DIFF_LABELS = ['', 'Fácil', 'Fácil', 'Medio', 'Medio', 'Difícil', 'Experto'];
  const DIFF_COLORS = ['', 'text-emerald-400', 'text-emerald-400', 'text-amber-400', 'text-amber-400', 'text-orange-400', 'text-red-400'];
  const totalXp = [...completedLevels.values()].reduce((s, v) => s + v.xp, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero banner */}
      <div className="relative rounded-3xl overflow-hidden p-8 border border-emerald-700/30"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(5,150,105,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(13,148,136,0.1) 0%, transparent 60%)',
          backgroundColor: '#0f172a',
        }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
            <Gamepad2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">CircuitPuzzle</h2>
            <p className="text-emerald-400 text-sm">Rota las piezas y cierra el circuito</p>
          </div>
        </div>
        <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
          Cada nivel es un circuito electrónico desarmado. Haz click en las piezas para rotarlas
          y crear un camino continuo desde la <strong className="text-amber-400">batería ⚡</strong> hasta
          el <strong className="text-emerald-400">LED 💡</strong>. Aprenderás sobre circuitos mientras juegas.
        </p>
        {totalXp > 0 && (
          <div className="flex items-center gap-2 mt-4">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-semibold">{totalXp} XP ganado del puzzle</span>
          </div>
        )}
      </div>

      {/* Level grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LEVELS.map((level, idx) => {
          const done = completedLevels.get(level.id);
          const isUnlocked = idx === 0 || completedLevels.has(LEVELS[idx - 1].id);

          return (
            <button
              key={level.id}
              onClick={() => isUnlocked && onSelect(level)}
              disabled={!isUnlocked}
              className={[
                'card text-left flex flex-col gap-3 transition-all duration-200 group',
                isUnlocked ? 'hover:border-emerald-500/30 hover:-translate-y-0.5 cursor-pointer' : 'opacity-50 cursor-not-allowed',
                done ? 'border-emerald-500/30' : '',
              ].join(' ')}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm
                    ${done ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white' : 'bg-slate-700 text-slate-400'}
                    ${!isUnlocked ? 'bg-slate-800' : ''}
                  `}>
                    {!isUnlocked ? <Lock className="w-4 h-4" /> : done ? level.id : level.id}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{level.name}</p>
                    <p className={`text-xs font-medium ${DIFF_COLORS[level.id]}`}>{DIFF_LABELS[level.id]}</p>
                  </div>
                </div>

                {/* Stars */}
                {done && (
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= done.stars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                    ))}
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-400 line-clamp-2">{level.desc}</p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <div
                    className="text-xs"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
                      backgroundSize: '6px 6px',
                      width: 24,
                      height: 16,
                      borderRadius: 3,
                      border: '1px solid #475569',
                    }}
                  />
                  {level.rows}×{level.cols}
                </div>
                <span className="text-xs font-medium text-amber-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />{done ? `+${done.xp}` : `+${level.baseXp}+`}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">¿Cómo jugar?</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { step: '1', text: 'Haz click en una pieza para rotarla 90° en sentido horario.' },
            { step: '2', text: 'Conecta todos los cables desde la batería hasta el LED.' },
            { step: '3', text: 'Los cables iluminados en verde indican que hay flujo de corriente.' },
            { step: '4', text: 'Menos movimientos y menos tiempo = más XP y estrellas.' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
                {step}
              </div>
              <p className="text-xs text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
interface PuzzlePageProps { userId: string; onXpGained: () => void }

export default function PuzzlePage({ userId, onXpGained }: PuzzlePageProps) {
  const [activeLevelIdx, setActiveLevelIdx] = useState<number | null>(null);
  const [completed, setCompleted] = useState<Map<number, { xp: number; stars: number }>>(() => {
    try {
      const raw = localStorage.getItem(`eco_puzzle_${userId}`);
      return raw ? new Map(JSON.parse(raw)) : new Map();
    } catch { return new Map(); }
  });

  function saveCompleted(map: Map<number, { xp: number; stars: number }>) {
    localStorage.setItem(`eco_puzzle_${userId}`, JSON.stringify([...map]));
  }

  function handleLevelComplete(id: number, xp: number) {
    setCompleted(prev => {
      const existing = prev.get(id);
      if (existing && existing.xp >= xp) return prev;
      const next = new Map(prev);
      const stars = xp > (LEVELS.find(l => l.id === id)?.baseXp ?? 0) * 1.3 ? 3
        : xp > (LEVELS.find(l => l.id === id)?.baseXp ?? 0) * 1.1 ? 2 : 1;
      next.set(id, { xp, stars });
      saveCompleted(next);
      return next;
    });
    onXpGained();
  }

  const activeLevel = activeLevelIdx !== null ? LEVELS[activeLevelIdx] : null;

  if (activeLevel) {
    return (
      <GameScreen
        key={activeLevel.id}
        level={activeLevel}
        userId={userId}
        completedLevels={new Set(completed.keys())}
        onBack={() => setActiveLevelIdx(null)}
        onLevelComplete={handleLevelComplete}
        onNextLevel={() => {
          if (activeLevelIdx !== null && activeLevelIdx < LEVELS.length - 1) {
            setActiveLevelIdx(activeLevelIdx + 1);
          } else {
            setActiveLevelIdx(null);
          }
        }}
      />
    );
  }

  return (
    <LevelSelect
      completedLevels={completed}
      onSelect={level => setActiveLevelIdx(LEVELS.findIndex(l => l.id === level.id))}
    />
  );
}
