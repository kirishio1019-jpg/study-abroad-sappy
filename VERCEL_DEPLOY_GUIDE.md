# 🚀 Vercelデプロイガイド

GitHubへのプッシュが完了しました！次はVercelでデプロイします。

## ✅ 完了したステップ

- [x] GitHubリポジトリの作成
- [x] リモートリポジトリの追加
- [x] GitHubへのプッシュ

## 📋 Vercelでのデプロイ手順

### ステップ1: Vercelにサインアップ/ログイン

1. **Vercelにアクセス**
   - https://vercel.com/signup を開く
   - **「Continue with GitHub」**をクリック
   - GitHubアカウントでログイン（既にアカウントがある場合はログイン）

### ステップ2: プロジェクトをインポート

1. **ダッシュボードで「Add New...」→「Project」をクリック**

2. **リポジトリを選択**
   - `kirishio1019-jpg/study-abroad-sappy` を選択
   - **「Import」**をクリック

3. **プロジェクト設定を確認**
   - **Framework Preset**: `Next.js`（自動検出されるはず）
   - **Root Directory**: `./`（そのまま）
   - **Build Command**: `npm run build`（デフォルト）
   - **Output Directory**: `.next`（デフォルト）
   - **Install Command**: `npm install`（デフォルト）

### ステップ3: 環境変数の設定（重要！）

**⚠️ 重要**: Supabaseを使用する場合は、このステップを必ず実行してください。

1. **「Environment Variables」セクションを開く**

2. **以下の環境変数を追加**:
   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: your_supabase_project_url
   ```
   
   ```
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: your_supabase_anon_key
   ```

3. **各環境変数に対して以下を選択**:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. **「Add」をクリック**して追加

**注意**: 
- Supabaseを使用しない場合は、このステップをスキップできます
- 環境変数の値は、Supabaseダッシュボードの「Settings」→「API」から取得できます

### ステップ4: デプロイ

1. **「Deploy」ボタンをクリック**
   - Vercelが自動的にビルドとデプロイを開始します
   - 数分待つとデプロイが完了します

2. **デプロイ完了後**
   - 自動的に生成されたURLが表示されます（例: `https://study-abroad-sappy.vercel.app`）
   - このURLでアプリにアクセスできます

### ステップ5: SupabaseのリダイレクトURL設定（Googleログインを使用する場合）

1. **Supabaseダッシュボードを開く**
   - https://app.supabase.com にアクセス
   - プロジェクトを選択

2. **リダイレクトURLを追加**
   - **Authentication** → **URL Configuration** を開く
   - **Redirect URLs**に以下を追加：
     ```
     https://study-abroad-sappy.vercel.app/auth/callback
     ```
   - （実際のVercelのURLに置き換えてください）
   - **「Save」**をクリック

3. **Google OAuth設定を確認**
   - Google Cloud Consoleで「認証済みのリダイレクト URI」に以下が含まれているか確認：
     ```
     https://your-supabase-project-ref.supabase.co/auth/v1/callback
     ```

## ✅ デプロイ後の確認事項

- [ ] アプリが正常に表示される
- [ ] レビューの投稿・編集・削除が動作する
- [ ] Googleログインが動作する（設定した場合）
- [ ] モバイル端末でも正常に表示される
- [ ] レスポンシブデザインが正しく動作する

## 🔄 今後の更新方法

コードを変更したら：

1. **変更をコミット**
   ```powershell
   cd C:\Users\kiris\.cursor\study-abroad-comparison
   git add .
   git commit -m "変更内容の説明"
   ```

2. **GitHubにプッシュ**
   ```powershell
   git push
   ```

3. **Vercelが自動的に再デプロイ**されます（数分待つ）

## 📝 メモ

- 環境変数はVercelの設定から管理します（Settings → Environment Variables）
- 環境変数を変更した場合は「Redeploy」をクリックする必要があります
- カスタムドメインも設定可能です（Settings → Domains）
- デプロイログはVercelのダッシュボードで確認できます

## 🆘 トラブルシューティング

### ビルドエラーが発生した場合

1. Vercelのダッシュボードで「Deployments」タブを開く
2. 失敗したデプロイをクリック
3. 「Build Logs」を確認してエラー内容を確認
4. エラーを修正して再度プッシュ

### 環境変数が反映されない場合

1. Vercelの設定で環境変数が正しく設定されているか確認
2. 「Redeploy」をクリックして再デプロイ

### Googleログインが動作しない場合

1. SupabaseのリダイレクトURLが正しく設定されているか確認
2. Google Cloud Consoleの設定を確認
3. Vercelの環境変数が正しく設定されているか確認

