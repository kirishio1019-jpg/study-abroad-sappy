# Supabaseレビュー機能のセットアップガイド

レビューをSupabaseデータベースに保存するように変更しました。これにより、デプロイ後もすべてのユーザーからレビューを閲覧できるようになります。

---

## ✅ 実装した変更

### 1. Supabaseレビューテーブルの作成

**作成ファイル:** `supabase/migrations/001_create_reviews_table.sql`

このSQLスクリプトを実行して、レビューを保存するテーブルを作成してください。

### 2. レビュー保存・取得の共通関数

**作成ファイル:** `lib/reviews.ts`

- `getAllReviews()` - すべてのレビューを取得（Supabase優先、フォールバックはlocalStorage）
- `saveReview()` - レビューを保存（Supabase優先、フォールバックはlocalStorage）
- `deleteReview()` - レビューを削除
- `migrateReviewsFromLocalStorage()` - localStorageからSupabaseへの移行

### 3. ホームページの更新

**変更ファイル:** `components/pages/home-page.tsx`

- Supabaseからレビューを取得
- localStorageからSupabaseへの自動移行機能を追加

---

## 📋 セットアップ手順

### ステップ1: Supabaseでテーブルを作成

1. Supabaseダッシュボードにログイン
2. SQL Editorを開く
3. `supabase/migrations/001_create_reviews_table.sql`の内容をコピー＆ペースト
4. 「Run」ボタンをクリックして実行

### ステップ2: 環境変数の確認

`.env.local`ファイルに以下が設定されていることを確認：

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### ステップ3: 既存のレビューを移行（オプション）

アプリにアクセスすると、自動的にlocalStorageからSupabaseへの移行が試みられます。

手動で移行したい場合は、ブラウザのコンソールで以下を実行：

```javascript
// これは自動的に実行されますが、手動で実行することもできます
import { migrateReviewsFromLocalStorage } from '@/lib/reviews'
await migrateReviewsFromLocalStorage()
```

---

## 🔄 動作の仕組み

### レビューの保存

1. **Supabaseが利用可能な場合:**
   - レビューをSupabaseデータベースに保存
   - 同時にlocalStorageにも保存（オフライン対応・キャッシュ）

2. **Supabaseが利用できない場合:**
   - localStorageに保存（従来通り）

### レビューの取得

1. **Supabaseが利用可能な場合:**
   - Supabaseからレビューを取得
   - 取得したデータをlocalStorageにキャッシュ

2. **Supabaseが利用できない場合:**
   - localStorageから取得

---

## 🔐 セキュリティポリシー（RLS）

作成されたテーブルには以下のRow Level Security（RLS）ポリシーが設定されています：

- ✅ **全ユーザーがレビューを閲覧可能**
- ✅ **認証されたユーザーのみがレビューを投稿可能**
- ✅ **ユーザーは自分のレビューのみ編集・削除可能**

---

## 📝 データ移行について

### 自動移行

初回アクセス時に、localStorageのレビューが自動的にSupabaseに移行されます。

### 移行の確認

Supabaseダッシュボードで`reviews`テーブルを確認し、データが正しく移行されていることを確認してください。

---

## ⚠️ 注意事項

1. **後方互換性:** localStorageのサポートも継続しているため、Supabaseが設定されていない環境でも動作します。

2. **オフライン対応:** localStorageにキャッシュを保存しているため、一時的にオフラインでもレビューを閲覧できます。

3. **重複防止:** 移行時には、既にSupabaseにあるレビューはスキップされます。

---

## 🛠️ トラブルシューティング

### レビューが表示されない

1. Supabaseのテーブルが作成されているか確認
2. 環境変数が正しく設定されているか確認
3. ブラウザのコンソールでエラーを確認

### 移行が失敗する

1. Supabaseの認証が設定されているか確認
2. RLSポリシーが正しく設定されているか確認
3. ネットワーク接続を確認

---

## 📚 関連ファイル

- `supabase/migrations/001_create_reviews_table.sql` - テーブル作成SQL
- `lib/reviews.ts` - レビュー保存・取得の共通関数
- `components/pages/home-page.tsx` - ホームページ（更新済み）

---

**レビュー機能のSupabase対応が完了しました！デプロイ後もすべてのレビューが共有されます。**

