# 🚀 デプロイ手順ガイド

このファイルは、現在のデプロイ状況を追跡するためのガイドです。

## ✅ 完了したステップ

- [x] プロジェクトの状態確認
- [x] ビルドテスト（成功）
- [x] 変更のコミット

## 📋 次のステップ

### ステップ1: GitHubリポジトリの作成

1. **GitHubにアクセス**
   - https://github.com/new を開く
   - または、GitHubの右上の「+」→「New repository」をクリック

2. **リポジトリ情報を入力**
   - **Repository name**: `sappy-study-abroad`（またはお好みの名前）
   - **Description**: 「留学先比較プラットフォーム - Study Abroad Comparison Platform」（任意）
   - **Public** または **Private** を選択
   - ⚠️ **重要**: 「Add a README file」「Add .gitignore」「Choose a license」は**チェックしない**（既にファイルがあるため）

3. **「Create repository」をクリック**

4. **リポジトリURLをコピー**
   - 作成後、表示されるページのURLをコピー
   - 例: `https://github.com/YOUR_USERNAME/sappy-study-abroad.git`

### ステップ2: リモートリポジトリを追加してプッシュ

以下のコマンドを実行してください（`YOUR_USERNAME`と`REPO_NAME`を実際の値に置き換えてください）：

```powershell
cd C:\Users\kiris\.cursor\study-abroad-comparison

# リモートリポジトリを追加
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# メインブランチに設定（既にmainの場合は不要）
git branch -M main

# GitHubにプッシュ
git push -u origin main
```

**認証について**:
- ユーザー名: GitHubのユーザー名
- パスワード: **パーソナルアクセストークン**（通常のパスワードではありません）

**パーソナルアクセストークンの取得方法**:
1. GitHub → 右上のアイコン → **Settings**
2. 左下の **Developer settings**
3. **Personal access tokens** → **Tokens (classic)**
4. **Generate new token (classic)**
5. **Note**: 「Sappy deployment」など
6. **Expiration**: 90 days（または No expiration）
7. **Select scopes**: ✅ **repo** にチェック
8. **Generate token** をクリック
9. 表示されたトークンを**コピー**（後で見れないので注意！）

### ステップ3: Vercelでデプロイ

1. **Vercelにアクセス**
   - https://vercel.com/signup を開く
   - **「Continue with GitHub」**をクリック
   - GitHubアカウントでログイン

2. **プロジェクトをインポート**
   - ダッシュボードで **「Add New...」** → **「Project」**をクリック
   - 作成したリポジトリ（`sappy-study-abroad`）を選択
   - **「Import」**をクリック

3. **プロジェクト設定を確認**
   - **Framework Preset**: Next.js（自動検出されるはず）
   - **Root Directory**: `./`（そのまま）
   - **Build Command**: `npm run build`（デフォルト）
   - **Output Directory**: `.next`（デフォルト）
   - **Install Command**: `npm install`（デフォルト）

4. **環境変数の設定（重要！）**
   - **「Environment Variables」**セクションを開く
   - 以下の環境変数を追加：
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - ⚠️ **注意**: Supabaseを使用しない場合は、このステップをスキップできます

5. **「Deploy」をクリック**
   - 数分待つとデプロイが完了します
   - デプロイ完了後、URLが表示されます（例: `https://sappy-study-abroad.vercel.app`）

### ステップ4: Supabaseの設定（Googleログインを使用する場合）

1. **Supabaseダッシュボードを開く**
   - https://app.supabase.com にアクセス
   - プロジェクトを選択

2. **リダイレクトURLを追加**
   - **Authentication** → **URL Configuration** を開く
   - **Redirect URLs**に以下を追加：
     ```
     https://your-project-name.vercel.app/auth/callback
     ```
   - （実際のVercelのURLに置き換えてください）

3. **Google OAuth設定を確認**
   - Google Cloud Consoleで「認証済みのリダイレクト URI」に以下が含まれているか確認：
     ```
     https://your-supabase-project-ref.supabase.co/auth/v1/callback
     ```

### ステップ5: デプロイ後の確認

- [ ] アプリが正常に表示される
- [ ] レビューの投稿・編集・削除が動作する
- [ ] Googleログインが動作する（設定した場合）
- [ ] モバイル端末でも正常に表示される
- [ ] レスポンシブデザインが正しく動作する

## 🔄 今後の更新方法

コードを変更したら：

1. **変更をコミット**
   ```powershell
   git add .
   git commit -m "変更内容の説明"
   ```

2. **GitHubにプッシュ**
   ```powershell
   git push
   ```

3. **Vercelが自動的に再デプロイ**されます（数分待つ）

## 📝 メモ

- 環境変数はVercelの設定から管理します（`.env.local`はGitHubにプッシュしない）
- デプロイ後、環境変数を変更した場合は「Redeploy」をクリックする必要があります
- カスタムドメインも設定可能です（Settings → Domains）

