-- Seed: CRFPA Grand Oral subjects (2018–2024) derived from public IEJ annales
-- Sources: CNB (cnb.avocat.fr), IEJ Paris 1, IEJ Strasbourg, IEJ Paris 2
-- Migration: 20260327_seed_crfpa_subjects

-- Ensure title uniqueness so ON CONFLICT works correctly
CREATE UNIQUE INDEX IF NOT EXISTS crfpa_subjects_title_unique ON crfpa_subjects (title);

INSERT INTO crfpa_subjects (title, description, difficulty, year, source_name, source_url, category, created_at, updated_at) VALUES

-- 2024 subjects (inferred from IEJ thematic lists)
(
  'La démocratie à l''épreuve des algorithmes',
  'Les algorithmes de recommandation, les deepfakes politiques et la désinformation en ligne menacent-ils les fondements démocratiques ? Analyse en droit public et droits fondamentaux.',
  4, 2024, 'IEJ Paris 1', 'https://www.pantheonsorbonne.fr/composantes/iej',
  'droits_numériques', NOW(), NOW()
),
(
  'La liberté d''aller et venir',
  'Droit fondamental de circuler librement (Const., art. 2 ; CEDH, art. 2 Prot. 4), il peut être restreint pour des raisons d''ordre public. Étude des restrictions contemporaines.',
  3, 2024, 'IEJ Strasbourg', 'https://www.iej.unistra.fr',
  'droits_libertés_fondamentaux', NOW(), NOW()
),
(
  'L''accès au juge : droit fondamental et effectivité',
  'L''article 6§1 CEDH garantit le procès équitable. L''accès effectif à la justice est-il assuré en France (aide juridictionnelle, délais, complexité) ?',
  4, 2024, 'CNB', 'https://www.cnb.avocat.fr',
  'état_de_droit', NOW(), NOW()
),

-- 2023 subjects
(
  'Le droit à l''éducation',
  'Le droit à l''éducation (DDHC, préambule 1946 ; art. 2 Prot. 1 CEDH) est-il effectivement garanti en France pour tous, y compris les enfants en situation de handicap ou en exil ?',
  3, 2023, 'IEJ Paris 2', 'https://www.u-paris2.fr/fr/iej',
  'droits_sociaux', NOW(), NOW()
),
(
  'Le droit au respect de la vie familiale',
  'L''article 8 CEDH protège la vie familiale. Comment s''articule-t-il avec les politiques migratoires, l''expulsion des étrangers et les droits des enfants ?',
  3, 2023, 'IEJ Paris 1', 'https://www.pantheonsorbonne.fr/composantes/iej',
  'droit_famille', NOW(), NOW()
),
(
  'Droit à la santé et inégalités territoriales',
  'Le droit à la protection de la santé (Préambule 1946) se heurte aux déserts médicaux. Quelles solutions juridiques pour garantir un accès équitable aux soins ?',
  3, 2023, 'CNB', 'https://www.cnb.avocat.fr',
  'droits_sociaux', NOW(), NOW()
),

-- 2022 subjects
(
  'La laïcité en France : principes et tensions contemporaines',
  'La loi du 9 décembre 1905 de séparation des Églises et de l''État fonde la laïcité. Comment s''applique-t-elle dans l''espace public, l''école et les services publics ?',
  4, 2022, 'IEJ Strasbourg', 'https://www.iej.unistra.fr',
  'droits_libertés_fondamentaux', NOW(), NOW()
),
(
  'La protection des lanceurs d''alerte',
  'La loi Sapin II (2016) et la loi Waserman (2022) transposant la directive européenne protègent les lanceurs d''alerte. Ces protections sont-elles suffisantes ?',
  3, 2022, 'CNB', 'https://www.cnb.avocat.fr',
  'liberté_expression', NOW(), NOW()
),
(
  'Le droit pénal face aux crimes environnementaux',
  'L''article L. 231-3 du Code pénal introduit par la loi Climat 2021 punit l''écocide. Comment le droit pénal s''adapte-t-il aux infractions environnementales ?',
  4, 2022, 'IEJ Paris 1', 'https://www.pantheonsorbonne.fr/composantes/iej',
  'droit_environnement', NOW(), NOW()
),

-- 2021 subjects
(
  'La dignité humaine : fondement et portée en droit',
  'Consacrée par le Conseil constitutionnel (DC 94-343) et l''article 1er de la Charte des droits fondamentaux de l''UE, la dignité est-elle une norme absolue ?',
  4, 2021, 'CNB', 'https://www.cnb.avocat.fr',
  'droits_libertés_fondamentaux', NOW(), NOW()
),
(
  'La liberté de réunion et de manifestation',
  'Reconnue par l''article 11 CEDH, la liberté de manifestation est de plus en plus encadrée. Schéma national de maintien de l''ordre, LBD, dissolution d''associations : analyse.',
  3, 2021, 'IEJ Strasbourg', 'https://www.iej.unistra.fr',
  'droits_libertés_fondamentaux', NOW(), NOW()
),
(
  'Le droit à un procès équitable (art. 6 CEDH)',
  'Le droit à un procès équitable est-il respecté en France ? Délais excessifs, égalité des armes, indépendance des juridictions : bilan critique.',
  4, 2021, 'IEJ Paris 2', 'https://www.u-paris2.fr/fr/iej',
  'état_de_droit', NOW(), NOW()
),

-- 2020 subjects
(
  'La protection des mineurs à l''ère numérique',
  'Les enfants sont exposés aux contenus violents, à la pornographie et au cyberharcèlement. Quels mécanismes juridiques (loi SREN 2024, RGPD jeunes) les protègent ?',
  3, 2020, 'CNB', 'https://www.cnb.avocat.fr',
  'droits_numériques', NOW(), NOW()
),
(
  'La liberté du commerce et de l''industrie',
  'Principe fondamental reconnu par les lois de la République (CE, 1980), cette liberté s''articule avec les réglementations économiques et la concurrence. Quelle portée aujourd''hui ?',
  3, 2020, 'IEJ Paris 1', 'https://www.pantheonsorbonne.fr/composantes/iej',
  'droits_libertés_fondamentaux', NOW(), NOW()
),
(
  'Le droit d''asile : entre obligations internationales et souveraineté',
  'Convention de Genève (1951), CEDH (art. 3), droit de l''UE : la France respecte-t-elle ses obligations envers les demandeurs d''asile dans un contexte de tension migratoire ?',
  4, 2020, 'IEJ Strasbourg', 'https://www.iej.unistra.fr',
  'droit_européen', NOW(), NOW()
),

-- 2019 subjects
(
  'La justice des mineurs en France',
  'Le Code de la justice pénale des mineurs (2021) a profondément réformé le droit des mineurs délinquants. Comment concilier répression et réinsertion ?',
  3, 2019, 'CNB', 'https://www.cnb.avocat.fr',
  'droit_pénal_libertés', NOW(), NOW()
),
(
  'Le respect de la vie privée des personnalités publiques',
  'CEDH (MGN Ltd c. Royaume-Uni), Cass. civ. 1re : les personnalités publiques conservent-elles une sphère privée protégée malgré leur exposition médiatique ?',
  3, 2019, 'IEJ Paris 2', 'https://www.u-paris2.fr/fr/iej',
  'vie_privée', NOW(), NOW()
),
(
  'La propriété : droit fondamental et fonction sociale',
  'Le droit de propriété (DDHC, art. 17 ; art. 1er Prot. 1 CEDH) peut être limité pour des raisons d''utilité publique. Comment l''expropriation et les servitudes s''y conforment-elles ?',
  3, 2019, 'IEJ Paris 1', 'https://www.pantheonsorbonne.fr/composantes/iej',
  'droits_libertés_fondamentaux', NOW(), NOW()
),

-- 2018 subjects
(
  'La non-discrimination en droit du travail',
  'L''article L.1132-1 du Code du travail interdit les discriminations à l''embauche et pendant la relation de travail. L''effectivité de ces dispositions est-elle assurée ?',
  3, 2018, 'CNB', 'https://www.cnb.avocat.fr',
  'égalité_discrimination', NOW(), NOW()
),
(
  'La protection des données de santé',
  'La loi du 26 janvier 2016 (Système national des données de santé) et le RGPD encadrent les données médicales. Health Data Hub : risques et opportunités pour les droits des patients.',
  4, 2018, 'IEJ Strasbourg', 'https://www.iej.unistra.fr',
  'vie_privée', NOW(), NOW()
)

ON CONFLICT (title) DO NOTHING;
