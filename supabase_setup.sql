-- =============================================
-- Tabinoto — Supabase セットアップSQL
-- Supabase の SQL Editor に貼り付けて実行してください
-- =============================================

-- 1. entriesテーブル（旅の記録）
CREATE TABLE IF NOT EXISTS entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  visited_at  DATE,
  title       TEXT NOT NULL,
  place_name  TEXT NOT NULL,
  body        TEXT,
  photos      TEXT[],         -- 写真URLの配列
  gps_lat     DOUBLE PRECISION,
  gps_lng     DOUBLE PRECISION,
  ai_summary  TEXT,           -- AIが生成した要約
  tags        TEXT[]          -- AIが生成したタグ
);

-- 2. 日付順インデックス（一覧表示を高速化）
CREATE INDEX IF NOT EXISTS entries_visited_at_idx ON entries (visited_at DESC);

-- 3. Row Level Security（RLS）を有効化
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- 4. RLSポリシー（今は全員読み書き可。認証追加後に変更）
CREATE POLICY "Allow all for now"
  ON entries FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- 5. Storageバケット（写真保存用）
-- Supabase Dashboard > Storage > New bucket で作成:
--   バケット名: photos
--   Public: true（チェックをオンにする）
-- =============================================

-- 確認用: テーブルが作れたかチェック
SELECT 'entries テーブル作成完了!' AS status;
