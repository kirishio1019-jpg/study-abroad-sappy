# Vercel 404エラー チェックリスト

## 現在の状況

Vercelで404エラーが発生しています。以下の手順で確認してください。

## ✅ 確認手順

### 1. Vercelダッシュボードでの確認

1. **Vercelダッシュボードにアクセス**
   - https://vercel.com/dashboard

2. **プロジェクトを開いて以下を確認**:
   - **Settings** → **General**:
     - Root Directory: 空白（自動検出）
     - Framework Preset: Next.js
     - Build Command: `npm run build`（または空白）
     - Output Directory: `.next`（または空白）
   - **Settings** → **Environment Variables**:
     - `NEXT_PUBLIC_SUPABASE_URL` が設定されている
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` が設定されている

3. **最新のデプロイを開いて以下を確認**:
   - 「Build Logs」タブ: ビルドエラーがないか
   - 「Function Logs」タブ: 実行時エラーがないか

### 2. よくある原因と解決方法

#### 原因1: ビルドが失敗している

**確認方法**: Vercelの「Build Logs」を確認

**解決方法**: エラーメッセージに基づいてコードを修正

#### 原因2: ルートディレクトリの設定が間違っている

**確認方法**: Settings → General → Root Directory

**解決方法**: 空白にするか `./` に設定

#### 原因3: 環境変数が設定されていない

**確認方法**: Settings → Environment Variables

**解決方法**: 必要な環境変数を追加

#### 原因4: Next.jsのビルド設定の問題

**確認方法**: `package.json`の`build`スクリプトを確認

**解決方法**: `"build": "next build"`が正しく設定されているか確認

### 3. 再デプロイ

1. デプロイページで「⋯」メニューをクリック
2. 「Redeploy」を選択
3. 数分待つ

### 4. プロジェクトを再インポート（最終手段）

上記で解決しない場合：

1. プロジェクトを削除
2. 「Add New...」→「Project」
3. GitHubリポジトリを再度選択
4. 設定を確認
5. 環境変数を設定
6. 「Deploy」をクリック

## 📝 Next.jsのルーティング構造

このアプリは以下のルートを持っています：

- `/` - ホームページ（`app/page.tsx`）
- `/comparison` - 比較ページ（`app/comparison/page.tsx`）
- `/questions` - 質問ページ（`app/questions/page.tsx`）
- `/detail/[id]` - 詳細ページ（`app/detail/[id]/page.tsx`）
- `/auth/callback` - 認証コールバック（`app/auth/callback/route.ts`）

これらはNext.jsのApp Routerによって自動的にルーティングされます。

## 🔍 トラブルシューティング

### ビルドログを確認

1. Vercelダッシュボードで最新のデプロイを開く
2. 「Build Logs」タブを確認
3. エラーメッセージを確認して修正

### ローカルでビルドテスト

```powershell
cd C:\Users\kiris\.cursor\study-abroad-comparison
npm run build
```

ローカルでビルドが成功する場合、Vercelの設定に問題がある可能性が高いです。

## 📚 参考資料

- `VERCEL_404_SOLUTION.md` - 詳細な解決手順
- `DEPLOYMENT_GUIDE.md` - デプロイガイド

