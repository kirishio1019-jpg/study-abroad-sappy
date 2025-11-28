# Vercel 404エラーの解決方法

## 現在の状況

Vercelで404エラーが発生しています。これは、VercelがNext.jsアプリを正しく認識できていない可能性があります。

## 解決手順

### 1. Vercelダッシュボードでの設定確認

1. **Vercelダッシュボードにアクセス**
   - https://vercel.com/dashboard

2. **プロジェクト設定を確認**
   - プロジェクトを開く
   - 「Settings」→「General」を開く
   - 以下を確認：
     - **Root Directory**: 空白（自動検出）または `./`
     - **Framework Preset**: `Next.js`（自動検出されるはず）
     - **Build Command**: 空白（自動検出）または `npm run build`
     - **Output Directory**: 空白（自動検出）または `.next`
     - **Install Command**: 空白（自動検出）または `npm install`

### 2. ビルドログを確認

1. Vercelダッシュボードで最新のデプロイを開く
2. 「Build Logs」タブを確認
3. エラーメッセージを確認

**よくあるエラー**:
- `Module not found`: 依存関係の問題
- `Build failed`: コードの構文エラー
- `Command not found`: ビルドコマンドの問題

### 3. 環境変数の確認

1. 「Settings」→「Environment Variables」を開く
2. 以下が設定されているか確認：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. 再デプロイ

1. デプロイページで「⋯」メニューをクリック
2. 「Redeploy」を選択
3. 数分待つ

### 5. プロジェクトを再インポート（必要に応じて）

上記で解決しない場合：

1. プロジェクトを削除
2. 「Add New...」→「Project」
3. GitHubリポジトリを再度選択
4. 設定を確認して「Import」
5. 環境変数を設定
6. 「Deploy」をクリック

## 確認事項

- [ ] `app/page.tsx`が存在する
- [ ] `app/layout.tsx`が存在する
- [ ] `package.json`に`"build": "next build"`が定義されている
- [ ] Next.jsのバージョンが正しい
- [ ] 環境変数が設定されている

## よくある問題と解決方法

### ビルドエラー

Vercelのビルドログでエラーメッセージを確認し、該当するファイルを修正してください。

### 環境変数の問題

環境変数が設定されていない場合、ビルドは成功しても実行時にエラーが発生する可能性があります。必ず設定してください。

### ルーティングの問題

Next.jsのApp Routerを使用しているため、`app/page.tsx`がルートページ（`/`）として機能します。これが正しく存在しているか確認してください。

## 次のステップ

1. Vercelダッシュボードでビルドログを確認
2. エラーメッセージに基づいて修正
3. 再度デプロイ

