-- ============================================================================
-- 地方議員マップ (chiho-map) DB スキーマ migration
-- ============================================================================
--
-- 国会議員マップ（diet-map）と同じ Neon プロジェクトに、
-- "_chiho" サフィックス付きの独立テーブルを作成する。
-- diet-map の既存テーブル (reviews, takedowns, ...) には一切影響しない。
--
-- 実行方法:
--   1. Neon Console (https://console.neon.tech/) で diet-map と同じプロジェクトを開く
--   2. SQL Editor を開く
--   3. このファイルの内容を全文貼り付けて実行
--
-- スキーマは diet-map 側と同一構造（後で統合可能）。
-- ============================================================================

-- ========== reviews_chiho ==========
CREATE TABLE IF NOT EXISTS reviews_chiho (
  id              TEXT PRIMARY KEY,
  member_id       TEXT NOT NULL,
  rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content         TEXT NOT NULL,
  case_type       TEXT NOT NULL DEFAULT 'その他',
  status          TEXT NOT NULL DEFAULT 'pending_payment'
                  CHECK (status IN ('pending_payment','published','under_review','removed')),
  ip_hash         TEXT NOT NULL,
  flags           JSONB NOT NULL DEFAULT '[]'::jsonb,
  stripe_session_id TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reviews_chiho_member_status
  ON reviews_chiho (member_id, status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_chiho_ip_created
  ON reviews_chiho (ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_chiho_stripe_session
  ON reviews_chiho (stripe_session_id);

-- ========== moderation_queue_chiho ==========
CREATE TABLE IF NOT EXISTS moderation_queue_chiho (
  id            TEXT PRIMARY KEY,
  review_id     TEXT NOT NULL REFERENCES reviews_chiho(id) ON DELETE CASCADE,
  member_id     TEXT NOT NULL,
  content       TEXT NOT NULL,
  rating        INTEGER NOT NULL,
  case_type     TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','approved','rejected')),
  auto_flags    JSONB NOT NULL DEFAULT '[]'::jsonb,
  reviewer_note TEXT,
  reviewer      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_moderation_queue_chiho_status
  ON moderation_queue_chiho (status, created_at);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_chiho_review
  ON moderation_queue_chiho (review_id);

-- ========== takedowns_chiho ==========
CREATE TABLE IF NOT EXISTS takedowns_chiho (
  id                    TEXT PRIMARY KEY,
  receipt_number        TEXT NOT NULL UNIQUE,
  requester_name        TEXT NOT NULL,
  requester_type        TEXT NOT NULL
                        CHECK (requester_type IN ('self','lawyer','secretary','other')),
  requester_email       TEXT NOT NULL,
  ip_hash               TEXT NOT NULL,
  target_review_id      TEXT,
  target_member_id      TEXT,
  violation_categories  JSONB NOT NULL DEFAULT '[]'::jsonb,
  reason                TEXT NOT NULL,
  evidence              TEXT NOT NULL DEFAULT '',
  status                TEXT NOT NULL DEFAULT 'received'
                        CHECK (status IN ('received','under_review','consultation_started','approved','rejected','withdrawn')),
  decision_reason       TEXT,
  operator_note         TEXT,
  notified_at           TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_takedowns_chiho_status
  ON takedowns_chiho (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_takedowns_chiho_ip_created
  ON takedowns_chiho (ip_hash, created_at DESC);

-- ========== corrections_chiho ==========
CREATE TABLE IF NOT EXISTS corrections_chiho (
  id              TEXT PRIMARY KEY,
  receipt_number  TEXT NOT NULL UNIQUE,
  requester_name  TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  ip_hash         TEXT NOT NULL,
  target          TEXT NOT NULL,
  member_ref      TEXT,
  speech_ref      TEXT,
  what_is_wrong   TEXT NOT NULL,
  should_be       TEXT NOT NULL,
  evidence_url    TEXT NOT NULL DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'received'
                  CHECK (status IN ('received','under_review','accepted','rejected')),
  operator_note   TEXT,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_corrections_chiho_status
  ON corrections_chiho (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_corrections_chiho_ip_created
  ON corrections_chiho (ip_hash, created_at DESC);

-- ========== moderation_logs_chiho ==========
CREATE TABLE IF NOT EXISTS moderation_logs_chiho (
  id                     TEXT PRIMARY KEY,
  related_review_id      TEXT,
  related_takedown_id    TEXT,
  related_correction_id  TEXT,
  action_type            TEXT NOT NULL,
  decision_reason        TEXT NOT NULL DEFAULT '',
  operator               TEXT NOT NULL,
  snapshot               JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_logs_chiho_created
  ON moderation_logs_chiho (created_at DESC);

-- ========== stripe_events_chiho ==========
-- Stripe webhook の冪等性確保用（同じイベントを二重処理しない）
CREATE TABLE IF NOT EXISTS stripe_events_chiho (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL,
  payload     JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== 確認 ==========
-- 作成されたテーブル一覧を確認
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE '%_chiho'
ORDER BY table_name;
