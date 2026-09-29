-- ========== DISTRINOV DATABASE SCHEMA ==========

CREATE TABLE live_state (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{"part":1,"slide":"welcome","timer":null,"kanbios":false}'::jsonb,
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE private_content (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE evals (
  eval_id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  eval_id TEXT,
  action TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX idx_live_state_updated_at ON live_state(updated_at DESC);
CREATE INDEX idx_private_content_updated_at ON private_content(updated_at DESC);
CREATE INDEX idx_evals_updated_at ON evals(updated_at DESC);

-- Seed live_state
INSERT INTO live_state (id, data) VALUES (
  'current',
  '{
    "part": 1,
    "slide": "welcome",
    "timer": null,
    "kanbios": false
  }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Seed private_content (DG facts, criteria, Kanbios approach)
INSERT INTO private_content (id, data) VALUES (
  'hidden',
  '{
    "facts": [
      "CEO a renforcé le budget IA de 40%",
      "Partenariat technologique avec Google Cloud signé",
      "Turnover RH en augmentation de 15%",
      "Pipeline produit bloqué sur architecture legacy",
      "Acquisition en cours de 2 startups tech",
      "Certifications ISO 27001 expirées",
      "Contrats clients à renouveler Q4",
      "Équipe tech sous-staffée sur backend",
      "Migration cloud en retard de 3 mois",
      "Budget opex dépassé de 12%",
      "Transition CEO prévue dans 18 mois"
    ]
  }'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO private_content (id, data) VALUES (
  'criteria',
  '{
    "governance": 4,
    "product_thinking": 4,
    "business_case": 4,
    "stakeholder_management": 4,
    "technical_architecture": 4,
    "communication": 4
  }'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO private_content (id, data) VALUES (
  'kanbios_approach',
  '{
    "slides": [
      {"step": 1, "title": "Diagnostic", "description": "Comprendre la situation actuelle"},
      {"step": 2, "title": "Gouvernance", "description": "Proposer un modèle de pilotage"},
      {"step": 3, "title": "MVP", "description": "Définir le périmètre initial"},
      {"step": 4, "title": "Récurrence", "description": "Cadrer le model opérationnel"},
      {"step": 5, "title": "Synthèse", "description": "Conclure et valider le plan"}
    ]
  }'::jsonb
) ON CONFLICT (id) DO NOTHING;
