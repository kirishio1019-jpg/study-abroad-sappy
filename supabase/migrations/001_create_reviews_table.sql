-- レビューテーブルの作成
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  country TEXT NOT NULL,
  university TEXT NOT NULL,
  university_id TEXT,
  region TEXT,
  title TEXT NOT NULL,
  satisfaction DECIMAL(2,1) NOT NULL DEFAULT 5.0,
  cost INTEGER DEFAULT 0,
  language TEXT,
  date TEXT NOT NULL,
  excerpt TEXT,
  
  -- 詳細情報
  major TEXT,
  study_major TEXT,
  selection_reason TEXT,
  start_date TEXT,
  start_year TEXT,
  end_date TEXT,
  end_year TEXT,
  vacation_period TEXT,
  credits_earned TEXT,
  credits_transferred TEXT,
  credits_300_level TEXT,
  language_cert TEXT,
  language_score TEXT,
  class_language TEXT,
  cost_of_living TEXT,
  cost_of_living_note TEXT,
  food_cost TEXT,
  rent TEXT,
  cultural_impression TEXT,
  safety TEXT,
  climate TEXT,
  daily_meals TEXT,
  accommodation TEXT,
  extracurricular_activities TEXT,
  extracurricular_activities_note TEXT,
  positives TEXT,
  challenges TEXT,
  strong_fields JSONB DEFAULT '[]',
  
  -- タイムスタンプ
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_reviews_country ON reviews(country);
CREATE INDEX IF NOT EXISTS idx_reviews_region ON reviews(region);
CREATE INDEX IF NOT EXISTS idx_reviews_university_id ON reviews(university_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- RLS（Row Level Security）の有効化
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 全ユーザーがレビューを読み取れるポリシー
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews
  FOR SELECT
  USING (true);

-- 認証されたユーザーがレビューを投稿できるポリシー
CREATE POLICY "Users can insert their own reviews"
  ON reviews
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ユーザーが自分のレビューを更新できるポリシー
CREATE POLICY "Users can update their own reviews"
  ON reviews
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ユーザーが自分のレビューを削除できるポリシー
CREATE POLICY "Users can delete their own reviews"
  ON reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- updated_atを自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

