# Vercel 404エラー 解決手順

## 現在の状況

Vercelで404エラーが発生しています。以下の手順で解決してください。

## 🔍 まず確認すること

### 1. Vercelダッシュボードでビルドログを確認

1. **Vercelダッシュボードにアクセス**
   - https://vercel.com/dashboard

2. **プロジェクトを開く**

3. **最新のデプロイを開く**

4. **「Build Logs」タブを確認**
   - ビルドが成功しているか確認
   - エラーメッセージがあれば内容を確認

### 2. Vercelのプロジェクト設定を確認

1. **Settings → General を確認**:
   - **Root Directory**: 空白（自動検出）または `./`
   - **Framework Preset**: `Next.js`
   - **Build Command**: 空白（自動検出）または `npm run build`
   - **Output Directory**: 空白（自動検出）または `.next`
   - **Install Command**: 空白（自動検出）または `npm install`

2. **Settings → Environment Variables を確認**:
   - `NEXT_PUBLIC_SUPABASE_URL` が設定されている
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` が設定されている

## 🛠️ 解決方法

### 方法1: 再デプロイ

1. デプロイページで「⋯」メニューをクリック
2. 「Redeploy」を選択
3. 数分待つ

### 方法2: 設定を確認して再デプロイ

1. Settings → General で設定を確認
2. 必要に応じて設定を修正
3. 「Redeploy」を実行

### 方法3: プロジェクトを再インポート

上記で解決しない場合：

1. プロジェクトを削除（Settings → Delete Project）
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリを再度選択
4. 設定を確認：
   - Root Directory: 空白
   - Framework Preset: Next.js（自動検出）
5. 環境変数を設定
6. 「Deploy」をクリック

## 📋 確認事項

- [ ] `app/page.tsx`が存在する（ルートページ）
- [ ] `app/layout.tsx`が存在する（ルートレイアウト）
- [ ] `package.json`に`"build": "next build"`が定義されている
- [ ] 環境変数が設定されている
- [ ] ビルドログでエラーがない

## 🔧 Next.jsのルーティング

このアプリは以下のルートを持っています：

- `/` - `app/page.tsx`（ホームページ）
- `/comparison` - `app/comparison/page.tsx`
- `/questions` - `app/questions/page.tsx`
- `/detail/[id]` - `app/detail/[id]/page.tsx`
- `/auth/callback` - `app/auth/callback/route.ts`

これらはNext.jsのApp Routerによって自動的に処理されます。

## 💡 ヒント

- **ビルドが成功している場合**: Vercelの設定に問題がある可能性が高いです
- **ビルドが失敗している場合**: ビルドログのエラーメッセージを確認して修正してください
- **環境変数エラー**: 環境変数が設定されていない可能性があります

