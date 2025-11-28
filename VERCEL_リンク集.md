# Vercel デプロイ関連リンク

## 🔗 重要なリンク

### 1. Vercelダッシュボード
- **メイン**: https://vercel.com/dashboard
- Vercelにログインして、プロジェクト一覧を確認できます

### 2. GitHubリポジトリ
- **リポジトリURL**: https://github.com/kirishio1019-jpg/study-abroad-sappy
- **デプロイURL**: 通常は `https://study-abroad-sappy.vercel.app` または `https://study-abroad-sappy-[あなたのユーザー名].vercel.app`
  - 正確なURLは、Vercelダッシュボードでプロジェクトを開いて確認できます

### 3. プロジェクト設定への直接アクセス

Vercelダッシュボードにログイン後：

1. **プロジェクト一覧ページ**
   - https://vercel.com/dashboard
   - プロジェクト「study-abroad-sappy」をクリック

2. **プロジェクト設定（Settings）**
   - プロジェクトを開いたら、「Settings」タブをクリック
   - または直接: https://vercel.com/dashboard/[プロジェクト名]/settings

3. **デプロイ履歴**
   - プロジェクトを開いたら、「Deployments」タブをクリック
   - または直接: https://vercel.com/dashboard/[プロジェクト名]

4. **環境変数設定**
   - Settings → Environment Variables
   - または直接: https://vercel.com/dashboard/[プロジェクト名]/settings/environment-variables

### 4. ビルドログの確認

最新のデプロイを開いて、「Build Logs」タブを確認：
- ビルドエラーの有無を確認
- エラーメッセージがあれば内容を確認

## 📝 404エラーが発生している場合

1. **まず、Vercelダッシュボードで最新のデプロイを開く**
   - https://vercel.com/dashboard → プロジェクトを開く → 最新のデプロイを開く

2. **「Build Logs」タブでビルドエラーを確認**
   - エラーメッセージがあれば内容を確認

3. **「Function Logs」タブで実行時エラーを確認**
   - アプリ実行時のエラーがないか確認

4. **「Settings」→「General」で設定を確認**
   - Root Directory: 空白
   - Framework Preset: Next.js
   - Build Command: `npm run build` または空白

5. **「Settings」→「Environment Variables」で環境変数を確認**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🔄 再デプロイ方法

1. **自動再デプロイ**: GitHubにpushすると自動的に再デプロイされます
2. **手動再デプロイ**: 
   - デプロイページで「⋯」メニューをクリック
   - 「Redeploy」を選択

## 📚 参考ドキュメント

詳細な解決手順は以下を参照：
- `VERCEL_404_解決手順.md` - 詳細な解決手順
- `VERCEL_404_CHECKLIST.md` - チェックリスト

