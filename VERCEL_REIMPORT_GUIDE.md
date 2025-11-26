# 🔄 Vercelプロジェクト再インポートガイド

## 問題
すべてのページで404エラーが発生している。原因は、GitHubリポジトリの構造が `study-abroad-comparison/package.json` となっているため、Vercelが正しいディレクトリを見つけられていないことです。

## 解決方法: プロジェクトを再インポート

### ステップ1: 既存のプロジェクトを削除

1. **Vercelのダッシュボードを開く**
   - https://vercel.com/dashboard

2. **プロジェクトを削除**
   - プロジェクト名をクリック
   - 「Settings」タブを開く
   - 一番下までスクロール
   - 「Delete Project」をクリック
   - 確認ダイアログでプロジェクト名を入力して削除

### ステップ2: プロジェクトを再インポート

1. **「Add New...」→「Project」をクリック**

2. **リポジトリを選択**
   - `kirishio1019-jpg/study-abroad-sappy` を選択
   - 「Import」をクリック

3. **重要: Root Directoryを設定**
   - 「Configure Project」画面で、**「Root Directory」**のセクションを見つける
   - 「Edit」をクリック
   - `study-abroad-comparison` と入力
   - 「Save」をクリック

4. **その他の設定を確認**
   - **Framework Preset**: `Next.js`（自動検出されるはず）
   - **Build Command**: `npm run build`（デフォルト）
   - **Output Directory**: `.next`（デフォルト）
   - **Install Command**: `npm install`（デフォルト）

5. **環境変数を設定**（Supabaseを使用する場合）
   - 「Environment Variables」セクションで以下を追加：
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - 各環境変数に対して以下を選択：
     - ✅ Production
     - ✅ Preview
     - ✅ Development

6. **「Deploy」をクリック**

### ステップ3: デプロイの確認

1. **デプロイが完了するまで待つ**（数分）

2. **デプロイログを確認**
   - 「Deployments」タブで最新のデプロイをクリック
   - 「Build Logs」を確認して、エラーがないか確認

3. **アプリにアクセス**
   - 表示されたURL（例: `https://study-abroad-sappy.vercel.app`）にアクセス
   - 404エラーが解消されているか確認

## もしRoot Directory設定が見つからない場合

VercelのUIが変更されている可能性があります。その場合は、以下の方法を試してください：

### 方法A: プロジェクト設定から設定

1. プロジェクトをインポート後、「Settings」→「General」を開く
2. 「Root Directory」のセクションを探す
3. 「Edit」をクリックして `study-abroad-comparison` を設定

### 方法B: vercel.jsonファイルを使用

プロジェクトに `vercel.json` ファイルを作成して設定を指定することもできますが、Next.jsプロジェクトでは通常不要です。

## 確認事項

- [ ] プロジェクトが削除された
- [ ] プロジェクトが再インポートされた
- [ ] Root Directoryが `study-abroad-comparison` に設定された
- [ ] 環境変数が設定された（Supabase使用時）
- [ ] デプロイが成功した
- [ ] アプリが正常に表示される

## 次のステップ

デプロイが成功したら：
1. 各ページ（`/`, `/comparison`, `/questions`）にアクセスして動作確認
2. Supabaseを使用する場合は、リダイレクトURLを設定
3. Googleログインが動作するか確認

