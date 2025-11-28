# Vercel 404エラーの解決方法

## 問題

Vercelで404エラーが発生しています：
- `404: NOT_FOUND`
- `Code: NOT_FOUND`

## 考えられる原因

1. **ビルドエラー**: Next.jsのビルドが失敗している可能性
2. **ルーティング設定**: Next.jsのルーティング設定に問題がある可能性
3. **Vercelの設定**: プロジェクトのルートディレクトリ設定が間違っている可能性

## 解決方法

### 方法1: Vercelの設定を確認

1. **Vercelダッシュボードにアクセス**
   - https://vercel.com/dashboard

2. **プロジェクト設定を確認**
   - プロジェクトを開く
   - 「Settings」→「General」を開く
   - 以下を確認：
     - **Root Directory**: `./` または空白（プロジェクトルート）
     - **Framework Preset**: Next.js（自動検出されるはず）
     - **Build Command**: `npm run build`（またはデフォルト）
     - **Output Directory**: `.next`（またはデフォルト）

3. **環境変数の確認**
   - 「Settings」→「Environment Variables」を開く
   - 以下が設定されているか確認：
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 方法2: ビルドログを確認

1. **Vercelダッシュボードでデプロイを開く**
2. **「Build Logs」タブを確認**
3. **エラーメッセージを確認**して修正

### 方法3: プロジェクトを再インポート

1. Vercelダッシュボードでプロジェクトを削除
2. 再度「Add New...」→「Project」からインポート
3. 設定を確認してデプロイ

### 方法4: ローカルでビルドテスト

ローカルでビルドが成功するか確認：

```powershell
cd C:\Users\kiris\.cursor\study-abroad-comparison
npm run build
```

ビルドが成功する場合、Vercelの設定に問題がある可能性が高いです。
ビルドが失敗する場合、コードに問題がある可能性があります。

## Next.jsのルーティング構造

このアプリは以下のルーティング構造を使用しています：

- `/` - ホームページ（`app/page.tsx`）
- `/comparison` - 比較ページ（`app/comparison/page.tsx`）
- `/questions` - 質問ページ（`app/questions/page.tsx`）
- `/detail/[id]` - 詳細ページ（`app/detail/[id]/page.tsx`）
- `/auth/callback` - 認証コールバック（`app/auth/callback/route.ts`）

## チェックリスト

- [ ] VercelのRoot Directory設定が正しい
- [ ] Framework PresetがNext.jsになっている
- [ ] ビルドコマンドが正しい（`npm run build`）
- [ ] 環境変数が設定されている
- [ ] ビルドログでエラーがない
- [ ] ローカルでビルドが成功する

