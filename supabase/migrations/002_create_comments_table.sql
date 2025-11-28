-- レビューコメントテーブルの作成
CREATE TABLE IF NOT EXISTS review_comments (
  id BIGSERIAL PRIMARY KEY,
  review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  content TEXT NOT NULL,
  
  -- タイムスタンプ
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_review_comments_review_id ON review_comments(review_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_user_id ON review_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_created_at ON review_comments(created_at DESC);

-- RLS（Row Level Security）の有効化
ALTER TABLE review_comments ENABLE ROW LEVEL SECURITY;

-- 全ユーザーがコメントを読み取れるポリシー
CREATE POLICY "Comments are viewable by everyone"
  ON review_comments
  FOR SELECT
  USING (true);

-- 認証されたユーザーがコメントを投稿できるポリシー
CREATE POLICY "Users can insert comments"
  ON review_comments
  FOR INSERT
  WITH CHECK (true); -- 匿名投稿も可能

-- ユーザーが自分のコメントを更新できるポリシー
CREATE POLICY "Users can update their own comments"
  ON review_comments
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ユーザーが自分のコメントを削除できるポリシー
-- 匿名コメント（user_id IS NULL）は投稿者以外でも削除できないようにするため、
-- 認証されたユーザーの場合は自分のコメントのみ削除可能
CREATE POLICY "Users can delete their own comments"
  ON review_comments
  FOR DELETE
  USING (
    (auth.uid() = user_id) OR 
    (user_id IS NULL AND auth.role() = 'authenticated')
  );

-- updated_atを自動更新するトリガー
CREATE TRIGGER update_review_comments_updated_at
  BEFORE UPDATE ON review_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

