-- CRFPA Grand Oral simulation tables
-- Migration: 20260327_create_crfpa_tables

-- Table 1: crfpa_subjects — pool of CRFPA Grand Oral topics (from official annales)
CREATE TABLE IF NOT EXISTS crfpa_subjects (
  id              SERIAL PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  difficulty      INT          DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  year            INT,
  source_url      VARCHAR(500),
  source_name     VARCHAR(100),   -- 'CNB', 'IEJ Strasbourg', 'IEJ Paris 1', etc.
  source_date     TIMESTAMP    DEFAULT NOW(),
  category        VARCHAR(100),   -- 'libertés_expression', 'vie_privée', 'droit_environnement', etc.
  original_pdf_url VARCHAR(500),
  created_at      TIMESTAMP    DEFAULT NOW(),
  updated_at      TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crfpa_subjects_category  ON crfpa_subjects (category);
CREATE INDEX IF NOT EXISTS idx_crfpa_subjects_year      ON crfpa_subjects (year);
CREATE INDEX IF NOT EXISTS idx_crfpa_subjects_difficulty ON crfpa_subjects (difficulty);

-- Table 2: crfpa_attempts — user simulation attempts
CREATE TABLE IF NOT EXISTS crfpa_attempts (
  id                       SERIAL PRIMARY KEY,
  user_id                  UUID   NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  subject_id               INT    NOT NULL REFERENCES crfpa_subjects (id),

  -- Phase: Preparation (60 min)
  prep_notes               TEXT,
  prep_duration_seconds    INT,

  -- Phase: Exposé (15 min)
  expose_text              TEXT,
  expose_audio_url         VARCHAR(500),
  expose_duration_seconds  INT,
  expose_retranscription   TEXT,  -- Groq transcription if audio submitted

  -- Phase: Q&A with AI jury (30 min)
  -- JSON structure: { "exchanges": [{ "question", "answer_text", "answer_audio_url", "answer_retranscription", "timestamp" }] }
  qa_transcript            JSONB  DEFAULT '{"exchanges":[]}'::jsonb,

  -- Scoring (0–20)
  final_score              DECIMAL(3,1),
  -- JSON structure: { "maitrise_sujet", "argumentation", "structure", "prestance_orale", "esprit_critique" }
  score_breakdown          JSONB,

  -- AI feedback
  feedback_text            TEXT,
  points_forts             TEXT[],
  points_faibles           TEXT[],
  -- JSON: [{ "type": "jurisprudence|code|doctrine", "reference": "...", "description": "..." }]
  references_a_revoir      JSONB,

  -- Status
  status                   VARCHAR(20) DEFAULT 'prep'  -- 'prep' | 'expose' | 'qa' | 'finished'
                             CHECK (status IN ('prep', 'expose', 'qa', 'finished')),

  -- Timing
  duration_total_seconds   INT,
  created_at               TIMESTAMP  DEFAULT NOW(),
  updated_at               TIMESTAMP  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crfpa_attempts_user_id    ON crfpa_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_crfpa_attempts_subject_id ON crfpa_attempts (subject_id);
CREATE INDEX IF NOT EXISTS idx_crfpa_attempts_status     ON crfpa_attempts (status);
CREATE INDEX IF NOT EXISTS idx_crfpa_attempts_created_at ON crfpa_attempts (created_at DESC);

-- Row Level Security
ALTER TABLE crfpa_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE crfpa_attempts ENABLE ROW LEVEL SECURITY;

-- crfpa_subjects: anyone authenticated can read; only service role can write
CREATE POLICY "crfpa_subjects_read"  ON crfpa_subjects
  FOR SELECT TO authenticated USING (true);

-- crfpa_attempts: users can only read/write their own attempts
CREATE POLICY "crfpa_attempts_select" ON crfpa_attempts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "crfpa_attempts_insert" ON crfpa_attempts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "crfpa_attempts_update" ON crfpa_attempts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Seed: initial set of CRFPA Grand Oral subjects derived from public IEJ annales
-- Sources: CNB (cnb.avocat.fr), IEJ Paris 1, IEJ Strasbourg, IEJ Paris 2 — publicly available annales
INSERT INTO crfpa_subjects (title, description, difficulty, year, source_name, category) VALUES

-- Liberté d'expression
('La liberté d''expression à l''épreuve des réseaux sociaux',
 'Les plateformes numériques confrontent le droit à la liberté d''expression à de nouveaux défis : désinformation, discours haineux, modération algorithmique. Quels équilibres le droit permet-il ?',
 3, 2023, 'CNB', 'liberté_expression'),

('Liberté d''expression et discours de haine',
 'L''article 10 de la CEDH protège la liberté d''expression mais permet des restrictions. Où placer le curseur face aux discours haineux en ligne et hors ligne ?',
 4, 2022, 'IEJ Paris 1', 'liberté_expression'),

('La liberté de la presse en France : garanties et limites',
 'La loi du 29 juillet 1881 constitue le socle de la liberté de la presse. Comment évolue-t-elle face au numérique, aux GAFAM et aux fake news ?',
 3, 2021, 'IEJ Strasbourg', 'liberté_expression'),

('Droit à l''oubli et liberté d''expression',
 'La tension entre le droit au déréférencement (RGPD, art. 17) et la liberté d''information constitue un enjeu fondamental. Étude à travers la jurisprudence CJUE.',
 4, 2022, 'CNB', 'liberté_expression'),

-- Vie privée
('La protection de la vie privée à l''ère numérique',
 'Le RGPD, les données biométriques, la géolocalisation et la surveillance de masse interrogent la portée de l''article 8 CEDH et de l''article 9 du Code civil.',
 3, 2023, 'CNB', 'vie_privée'),

('Secret médical et droit des patients',
 'L''article L. 1110-4 du Code de la santé publique consacre le secret médical. Comment s''articule-t-il avec le partage des données de santé et les droits des patients ?',
 3, 2020, 'IEJ Paris 2', 'vie_privée'),

('La surveillance numérique de l''État : entre sécurité et libertés',
 'Les lois Renseignement de 2015 et 2021, la CJUE (Privacy Shield, Schrems II) et la CEDH encadrent-ils suffisamment la surveillance étatique ?',
 5, 2022, 'IEJ Strasbourg', 'vie_privée'),

('Données personnelles et intelligence artificielle',
 'L''IA Act européen et le RGPD confrontent le profilage algorithmique aux droits fondamentaux. Quelles garanties pour les individus ?',
 4, 2023, 'CNB', 'vie_privée'),

-- Droit de l''environnement
('Le droit à un environnement sain : consécration et portée',
 'La Charte de l''environnement (2004) a valeur constitutionnelle. Quelle est la portée du principe de précaution et du devoir de vigilance environnementale ?',
 3, 2021, 'CNB', 'droit_environnement'),

('Le crime d''écocide : vers une responsabilité pénale pour atteinte à l''environnement',
 'La loi Climat et résilience de 2021 a introduit l''écocide en droit français. Est-ce suffisant au regard des exigences environnementales internationales ?',
 4, 2022, 'IEJ Paris 1', 'droit_environnement'),

('Les droits de la nature : une révolution juridique ?',
 'Plusieurs pays (Équateur, Bolivie, Nouvelle-Zélande) ont accordé des droits à des entités naturelles. Quelles implications pour le droit français ?',
 4, 2023, 'IEJ Strasbourg', 'droit_environnement'),

-- Égalité et discrimination
('Le principe d''égalité et la discrimination positive',
 'L''article 1er de la Constitution française consacre l''égalité mais prohibe les discriminations positives de type quota. Est-ce compatible avec les exigences européennes ?',
 4, 2021, 'CNB', 'égalité_discrimination'),

('La discrimination à raison du sexe : avancées et insuffisances',
 'Les lois Roudy (1983), Copé-Zimmermann (2011), Rixain (2021) traduisent une volonté de parité. Où en sommes-nous dans la lutte contre les discriminations de genre ?',
 3, 2022, 'IEJ Paris 1', 'égalité_discrimination'),

('Handicap et droit à l''intégration',
 'La loi du 11 février 2005 a posé le principe d''accessibilité universelle. L''obligation d''emploi des travailleurs handicapés (OETH) est-elle suffisante ?',
 3, 2020, 'IEJ Paris 2', 'égalité_discrimination'),

-- Droit pénal et libertés
('La présomption d''innocence à l''ère médiatique',
 'L''article 9-1 du Code civil et l''article 6§2 CEDH protègent la présomption d''innocence. Comment résister aux emballements médiatiques et aux réseaux sociaux ?',
 4, 2021, 'CNB', 'droit_pénal_libertés'),

('La détention provisoire : nécessité ou atteinte à la liberté ?',
 'La détention provisoire (CPP, art. 137 et s.) est encadrée strictement mais critiquée. Comment améliorer le recours aux alternatives à l''incarcération préventive ?',
 4, 2022, 'IEJ Strasbourg', 'droit_pénal_libertés'),

('Intelligence artificielle et justice prédictive',
 'Des algorithmes sont utilisés pour évaluer la récidive aux États-Unis. L''UE et la France s''y opposent (art. 4-1 de la loi J21). Quels risques pour les droits fondamentaux ?',
 5, 2023, 'CNB', 'droit_pénal_libertés'),

-- Droit de la famille
('La gestation pour autrui : enjeux éthiques et juridiques',
 'La GPA est interdite en France (art. 16-7 C. civ.) mais pratiquée à l''étranger. La CEDH (Mennesson c. France) et la Cour de cassation ont évolué sur la transcription des actes d''état civil.',
 5, 2021, 'IEJ Paris 1', 'droit_famille'),

('Le droit au mariage pour tous : bilan et perspectives',
 'La loi Taubira du 17 mai 2013 a ouvert le mariage aux couples de même sexe. Quel bilan dix ans après, notamment en matière d''adoption et de PMA ?',
 2, 2023, 'IEJ Paris 2', 'droit_famille'),

-- Droit du travail et libertés
('Le droit de grève : fondement constitutionnel et limites',
 'Le droit de grève est reconnu par le préambule de 1946. Comment s''articule-t-il avec la continuité du service public et les droits des usagers ?',
 3, 2020, 'CNB', 'droit_travail_libertés'),

('Liberté religieuse et laïcité dans l''entreprise',
 'L''arrêt Baby Loup (Cass., Ass. plén., 25 juin 2014) a posé des repères. Comment concilier expression religieuse des salariés et exigences de neutralité ?',
 4, 2021, 'IEJ Strasbourg', 'droit_travail_libertés'),

('Le droit à la déconnexion et le télétravail',
 'La loi El Khomri (2016) a consacré le droit à la déconnexion. La crise COVID-19 a massifié le télétravail (ANI 2020). Quelles nouvelles frontières entre vie professionnelle et vie privée ?',
 3, 2022, 'IEJ Paris 1', 'droit_travail_libertés'),

-- Droit international et européen
('La CEDH et son évolution : outil toujours pertinent de protection des droits ?',
 'La Cour EDH fait face à l''engorgement et aux résistances des États. Comment renforcer son efficacité tout en respectant la souveraineté nationale (marge d''appréciation) ?',
 4, 2022, 'CNB', 'droit_européen'),

('L''Union européenne et les droits fondamentaux : la Charte de Nice',
 'La Charte des droits fondamentaux de l''UE (2000/2009) s''applique aux États membres. Comment s''articule-t-elle avec la CEDH et les droits constitutionnels nationaux ?',
 4, 2021, 'IEJ Paris 2', 'droit_européen'),

('Le droit d''asile en Europe : entre solidarité et fermeté',
 'Les règlements Dublin III et le Pacte européen sur la migration (2024) organisent la protection internationale. La France respecte-t-elle ses obligations envers les demandeurs d''asile ?',
 4, 2023, 'IEJ Strasbourg', 'droit_européen'),

-- Déontologie des avocats
('Le secret professionnel de l''avocat : fondement et limites',
 'Le secret professionnel de l''avocat (art. 66-5 de la loi du 31 décembre 1971) est absolu et d''ordre public selon la CCBE. Quelles menaces contemporaines (perquisitions, LCB-FT) ?',
 4, 2022, 'CNB', 'déontologie_avocat'),

('L''avocat et la lutte contre le blanchiment',
 'La 6ème directive anti-blanchiment impose aux avocats des obligations déclaratives. Comment concilier ce devoir avec le secret professionnel et l''indépendance du barreau ?',
 5, 2023, 'CNB', 'déontologie_avocat'),

-- Droits numériques
('Neutralité du net et liberté d''accès à internet',
 'Le règlement européen 2015/2120 consacre la neutralité du net. Est-ce un droit fondamental ? Quelles menaces portent les zero-ratings et la prioritisation du trafic ?',
 3, 2020, 'IEJ Paris 1', 'droits_numériques'),

('Intelligence artificielle et responsabilité',
 'L''IA Act européen (Règlement 2024/1689) crée un cadre de responsabilité gradué. Comment responsabiliser les concepteurs d''IA tout en préservant l''innovation ?',
 5, 2023, 'CNB', 'droits_numériques'),

('Le droit à l''image : protection et exploitation commerciale',
 'L''article 9 du Code civil et la jurisprudence de la Cour de cassation encadrent le droit à l''image. Comment s''adapte-t-il aux selfies, deep fakes et influenceurs ?',
 2, 2022, 'IEJ Paris 2', 'droits_numériques'),

-- Bioéthique
('Les lois de bioéthique : entre progrès scientifique et droits fondamentaux',
 'La loi du 2 août 2021 a étendu la PMA aux couples de femmes et aux femmes seules. Comment le droit encadre-t-il les frontières du vivant et du consentement ?',
 4, 2022, 'CNB', 'bioéthique'),

('Le droit à mourir dans la dignité',
 'La loi Claeys-Leonetti (2016) consacre la sédation profonde. La France refuse l''euthanasie active. La CEDH (Haas c. Suisse) tolère des restrictions. Quel équilibre ?',
 4, 2021, 'IEJ Strasbourg', 'bioéthique'),

-- Droits sociaux
('Le droit au logement opposable (DALO)',
 'La loi du 5 mars 2007 crée un droit opposable au logement. Quelles sont les limites de sa mise en œuvre et comment le renforcer ?',
 3, 2020, 'IEJ Paris 2', 'droits_sociaux'),

('Le revenu universel : utopie ou nécessité juridique ?',
 'Des expérimentations de RSA automatique et de revenu universel fleurissent en Europe. Un droit fondamental à un revenu minimum est-il envisageable en droit français ?',
 3, 2021, 'IEJ Paris 1', 'droits_sociaux'),

-- État de droit
('L''état d''urgence sanitaire : entre nécessité et risque liberticide',
 'La loi du 23 mars 2020 a créé l''état d''urgence sanitaire. Était-il compatible avec l''article 15 CEDH ? Quelles leçons pour les libertés publiques en temps de crise ?',
 4, 2021, 'CNB', 'état_de_droit'),

('La séparation des pouvoirs à l''épreuve des QPC',
 'La QPC (art. 61-1 C.) instaurée en 2010 renforce le contrôle de constitutionnalité. Comment participe-t-elle à l''équilibre des pouvoirs en France ?',
 4, 2022, 'IEJ Strasbourg', 'état_de_droit'),

('Indépendance de la justice et gouvernement des juges',
 'Le Conseil supérieur de la magistrature garantit l''indépendance des magistrats. Les critiques de "gouvernement des juges" sont-elles justifiées ?',
 4, 2023, 'IEJ Paris 1', 'état_de_droit')
;
