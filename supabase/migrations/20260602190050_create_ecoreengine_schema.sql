/*
  # EcoReEngine - Complete Database Schema

  ## Overview
  Full schema for EcoReEngine educational platform that turns e-waste into learning resources.

  ## Tables Created
  1. `user_profiles` - Extended user data (level, XP, eco stats)
  2. `components` - Catalog of electronic components salvageable from e-waste
  3. `user_components` - User's personal component inventory
  4. `tutorials` - Learning content from basics to advanced projects
  5. `tutorial_progress` - Per-user tutorial completion tracking
  6. `projects` - User-created projects using salvaged components
  7. `community_posts` - Shared projects, tips, and questions
  8. `post_likes` - Likes on community posts
  9. `achievements` - Gamification achievement definitions
  10. `user_achievements` - Earned achievements per user

  ## Security
  - RLS enabled on all tables
  - Users can only read/write their own data
  - Public content (tutorials, components catalog, public posts) readable by authenticated users
*/

-- ─── USER PROFILES ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text DEFAULT '',
  bio text DEFAULT '',
  avatar_url text DEFAULT '',
  level integer DEFAULT 1,
  total_xp integer DEFAULT 0,
  components_salvaged integer DEFAULT 0,
  co2_saved_kg decimal(10,2) DEFAULT 0,
  tutorials_completed integer DEFAULT 0,
  projects_completed integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  last_active_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ─── COMPONENTS CATALOG ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text DEFAULT '',
  typical_source text DEFAULT '',
  difficulty_level integer DEFAULT 1,
  image_url text DEFAULT '',
  properties jsonb DEFAULT '{}',
  salvage_xp integer DEFAULT 10,
  co2_saved_g integer DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read components"
  ON components FOR SELECT
  TO authenticated
  USING (true);

-- ─── USER COMPONENT INVENTORY ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  component_id uuid REFERENCES components(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  condition text DEFAULT 'good',
  source text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own inventory"
  ON user_components FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory"
  ON user_components FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory"
  ON user_components FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory"
  ON user_components FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ─── TUTORIALS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tutorials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL,
  difficulty_level integer DEFAULT 1,
  duration_minutes integer DEFAULT 30,
  xp_reward integer DEFAULT 100,
  content jsonb DEFAULT '[]',
  required_components jsonb DEFAULT '[]',
  image_url text DEFAULT '',
  tags jsonb DEFAULT '[]',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read tutorials"
  ON tutorials FOR SELECT
  TO authenticated
  USING (true);

-- ─── TUTORIAL PROGRESS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tutorial_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tutorial_id uuid REFERENCES tutorials(id) ON DELETE CASCADE,
  status text DEFAULT 'not_started',
  progress_percentage integer DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tutorial_id)
);

ALTER TABLE tutorial_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own progress"
  ON tutorial_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON tutorial_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON tutorial_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── PROJECTS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'general',
  status text DEFAULT 'planning',
  difficulty_level integer DEFAULT 1,
  components_used jsonb DEFAULT '[]',
  steps jsonb DEFAULT '[]',
  images jsonb DEFAULT '[]',
  xp_earned integer DEFAULT 0,
  is_public boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read public projects"
  ON projects FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ─── COMMUNITY POSTS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text DEFAULT 'project',
  title text NOT NULL,
  content text DEFAULT '',
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  images jsonb DEFAULT '[]',
  tags jsonb DEFAULT '[]',
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read community posts"
  ON community_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own posts"
  ON community_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON community_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON community_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ─── POST LIKES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all likes"
  ON post_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own likes"
  ON post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ─── ACHIEVEMENTS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '🏆',
  category text DEFAULT 'general',
  requirement_type text NOT NULL,
  requirement_value integer DEFAULT 1,
  xp_reward integer DEFAULT 200,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- ─── USER ACHIEVEMENTS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ─── SEED: COMPONENTS CATALOG ────────────────────────────────────────────────
INSERT INTO components (name, category, description, typical_source, difficulty_level, salvage_xp, co2_saved_g, properties) VALUES
('Resistor 220Ω', 'resistor', 'Resistencia básica para limitar corriente', 'Televisores antiguos, radios, placas de PC', 1, 5, 2, '{"value":"220","unit":"Ω","tolerance":"5%"}'),
('Resistor 10kΩ', 'resistor', 'Resistencia de valor alto para divisores de tensión', 'Televisores, monitores, equipos de audio', 1, 5, 2, '{"value":"10000","unit":"Ω","tolerance":"5%"}'),
('Capacitor electrolítico 100µF', 'capacitor', 'Capacitor para filtrado de fuentes de alimentación', 'Fuentes de PC, televisores, radios', 2, 8, 5, '{"value":"100","unit":"µF","voltage":"16V"}'),
('Capacitor cerámico 100nF', 'capacitor', 'Capacitor de desacople y filtrado de alta frecuencia', 'Placas de PC, electrodomésticos', 1, 5, 3, '{"value":"100","unit":"nF","voltage":"50V"}'),
('Diodo 1N4007', 'diode', 'Diodo rectificador de propósito general', 'Fuentes de alimentación, cargadores', 1, 8, 4, '{"max_current":"1A","max_voltage":"1000V"}'),
('LED rojo 5mm', 'led', 'LED indicador de bajo consumo', 'Electrodomésticos, juguetes electrónicos, computadoras', 1, 5, 1, '{"color":"red","forward_voltage":"2V","current":"20mA"}'),
('LED verde 5mm', 'led', 'LED indicador verde de bajo consumo', 'Equipos de red, cargadores, aparatos médicos', 1, 5, 1, '{"color":"green","forward_voltage":"2.1V","current":"20mA"}'),
('Transistor NPN 2N2222', 'transistor', 'Transistor NPN para amplificación y switching', 'Radios AM/FM, amplificadores de audio', 2, 10, 3, '{"type":"NPN","package":"TO-92","max_current":"600mA"}'),
('Transistor NPN BC547', 'transistor', 'Transistor NPN de uso general', 'Televisores, radios, fuentes de alimentación', 2, 10, 3, '{"type":"NPN","package":"TO-92","max_current":"100mA"}'),
('Circuito Integrado NE555', 'ic', 'Temporizador versátil para osciladores y pulsos', 'Juguetes electrónicos, alarmas, temporizadores', 3, 20, 8, '{"type":"timer","package":"DIP-8","supply":"5-15V"}'),
('Motor DC pequeño', 'motor', 'Motor de corriente continua de pequeño tamaño', 'Juguetes, impresoras, reproductores de CD', 2, 15, 20, '{"voltage":"3-6V","rpm":"3000-6000"}'),
('Servomotor SG90', 'motor', 'Servomotor para proyectos de robótica y control', 'Drones viejos, robots de juguete, modelos RC', 3, 25, 30, '{"type":"servo","torque":"1.8kg.cm","voltage":"4.8-6V"}'),
('Buzzer piezoeléctrico', 'sensor', 'Transductor sonoro para alarmas y notificaciones', 'Computadoras, microondas, juguetes', 1, 8, 5, '{"type":"piezo","voltage":"3-24V","frequency":"2.3kHz"}'),
('Fotoresistor LDR', 'sensor', 'Sensor de luz que varía su resistencia', 'Alarmas con sensor de luz, juguetes solares', 1, 10, 4, '{"type":"LDR","dark_resistance":"1MΩ","light_resistance":"100Ω"}'),
('Fuente de alimentación 12V', 'power', 'Fuente regulada de 12V con ampere moderado', 'Impresoras viejas, routers descartados, monitores', 2, 30, 150, '{"voltage":"12V","current":"2A","type":"switching"}'),
('Cable USB tipo A', 'cable', 'Cable de transferencia de datos y alimentación', 'Teléfonos viejos, periféricos de computadora', 1, 5, 10, '{"type":"USB-A","length":"1m"}'),
('Pantalla LCD 16x2', 'display', 'Display de cristal líquido para mostrar texto', 'Electrodomésticos, medidores, impresoras', 3, 30, 25, '{"type":"LCD","columns":16,"rows":2,"interface":"parallel"}'),
('Módulo Bluetooth HC-05', 'wireless', 'Módulo de comunicación inalámbrica Bluetooth', 'Altavoces inalámbricos viejos, auriculares', 3, 35, 15, '{"version":"Bluetooth 2.0","range":"10m","voltage":"3.3-6V"}')
ON CONFLICT DO NOTHING;

-- ─── SEED: TUTORIALS ─────────────────────────────────────────────────────────
INSERT INTO tutorials (title, description, category, difficulty_level, duration_minutes, xp_reward, tags, order_index) VALUES
('¿Qué es la electricidad? Conceptos básicos', 'Aprende los fundamentos de la electricidad: voltaje, corriente, resistencia y la Ley de Ohm de forma práctica y sencilla.', 'basics', 1, 20, 50, '["electricidad","fundamentos","ley de ohm"]', 1),
('Identificando componentes electrónicos', 'Aprende a reconocer resistencias, capacitores, diodos y transistores usando sus códigos de color y marcas.', 'basics', 1, 25, 60, '["componentes","identificación","resistencias"]', 2),
('Tu primer circuito: LED con resistencia', 'Construye tu primer circuito funcional conectando un LED con su resistencia limitadora. El clásico "Hola Mundo" de la electrónica.', 'circuits', 1, 30, 100, '["LED","resistencia","primer circuito"]', 3),
('Cómo usar un multímetro', 'Domina el uso del multímetro para medir voltaje, corriente y resistencia. Herramienta esencial para diagnóstico.', 'basics', 1, 35, 80, '["multímetro","medición","diagnóstico"]', 4),
('Desensamblando una fuente de PC', 'Aprende a desmontar una fuente de alimentación de computadora con seguridad y recuperar sus componentes valiosos.', 'ewaste', 2, 45, 150, '["fuente de PC","desensamble","reciclaje"]', 5),
('Circuito temporizador con NE555', 'Usa el famoso chip NE555 para crear un temporizador o generador de pulsos. Circuito clásico de la electrónica analógica.', 'circuits', 2, 40, 120, '["NE555","temporizador","oscilador"]', 6),
('Control de motor DC con transistor', 'Aprende a controlar la velocidad y dirección de un motor de corriente continua usando transistores recuperados de equipos viejos.', 'robotics', 2, 50, 150, '["motor DC","transistor","control"]', 7),
('Sensor de luz con LDR: Luz automática', 'Construye un sistema que enciende una luz automáticamente cuando oscurece, usando un fotoresistor recuperado.', 'projects', 2, 45, 180, '["LDR","sensor de luz","automatización"]', 8),
('Brazo robótico con servos reciclados', 'Construye un brazo robótico básico usando servomotores recuperados de juguetes viejos y materiales de desecho.', 'robotics', 3, 120, 400, '["robótica","servo","brazo robótico"]', 9),
('Estación meteorológica con componentes reciclados', 'Crea una estación meteorológica básica que mida temperatura y humedad usando componentes recuperados y Arduino.', 'projects', 3, 90, 350, '["meteorología","sensores","Arduino"]', 10),
('Amplificador de audio desde cero', 'Recupera componentes de una radio vieja y construye tu propio amplificador de audio funcional.', 'circuits', 3, 80, 300, '["audio","amplificador","transistores"]', 11),
('Cargador solar USB para adultos mayores', 'Proyecto de impacto social: construye un cargador solar portátil usando paneles y componentes reciclados.', 'projects', 3, 100, 500, '["solar","cargador","impacto social","adultos mayores"]', 12)
ON CONFLICT DO NOTHING;

-- ─── SEED: ACHIEVEMENTS ──────────────────────────────────────────────────────
INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
('Primer Componente', 'Registraste tu primer componente electrónico en el inventario', '🔩', 'eco', 'components_salvaged', 1, 50),
('Explorador de E-waste', 'Has recuperado 10 componentes de aparatos en desuso', '♻️', 'eco', 'components_salvaged', 10, 200),
('Guerrero Verde', 'Recuperaste 50 componentes, salvando la Tierra un chip a la vez', '🌱', 'eco', 'components_salvaged', 50, 500),
('Primera Lección', 'Completaste tu primer tutorial educativo', '📚', 'learning', 'tutorials_completed', 1, 50),
('Aprendiz Dedicado', 'Has completado 5 tutoriales', '🎓', 'learning', 'tutorials_completed', 5, 200),
('Maestro de la Electrónica', 'Completaste 10 tutoriales. ¡Eres un experto!', '⚡', 'learning', 'tutorials_completed', 10, 500),
('Primer Proyecto', 'Creaste tu primer proyecto con componentes reciclados', '🔧', 'building', 'projects_completed', 1, 100),
('Constructor Serial', 'Has completado 5 proyectos. La creatividad no tiene límites', '🏗️', 'building', 'projects_completed', 5, 300),
('Inventor del Año', 'Completaste 10 proyectos. ¡Eres un verdadero inventor!', '💡', 'building', 'projects_completed', 10, 1000),
('Compartir es Crecer', 'Publicaste tu primer proyecto en la comunidad', '🤝', 'community', 'posts_created', 1, 100),
('CO2 Fighter', 'Has salvado 1kg de CO2 del ambiente mediante el reciclaje', '🌍', 'eco', 'co2_saved', 1000, 300)
ON CONFLICT DO NOTHING;
