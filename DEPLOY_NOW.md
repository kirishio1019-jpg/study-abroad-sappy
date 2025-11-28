# 🚀 アプリを再度公開する手順

## 現在の状態

多くの変更が未コミットの状態です。以下の手順で公開できます。

## 📋 手順

### ステップ1: すべての変更をコミット

PowerShellで以下のコマンドを実行してください：

```powershell
# プロジェクトフォルダーに移動
cd C:\Users\kiris\.cursor\study-abroad-comparison

# すべての変更をステージング（追加）
git add .

# 変更をコミット（記録）
git commit -m "UI改善と機能追加: レビュー詳細ページのスクロール修正、比較ページの2列レイアウト、検索ページの強みのある分野の更新など"
```

### ステップ2: GitHubにプッシュ

```powershell
# GitHubにアップロード
git push origin main
```

**注意**: パスワードを求められた場合、GitHubの**パーソナルアクセストークン**を使用してください（通常のパスワードではありません）。

### ステップ3: Vercelでの再デプロイ

1. **既にVercelにデプロイ済みの場合**:
   - GitHubにプッシュすると、Vercelが自動的に再デプロイを開始します
   - 数分待つと、最新の変更が反映されます
   - Vercelダッシュボード（https://vercel.com/dashboard）でデプロイの進行状況を確認できます

2. **初めてVercelにデプロイする場合**:
   - https://vercel.com/signup にアクセス
   - 「Continue with GitHub」をクリック
   - 「Add New...」→「Project」をクリック
   - GitHubのリポジトリを選択
   - 「Import」をクリック
   - 環境変数を設定（SupabaseのURLとKey）
   - 「Deploy」をクリック

## 🔐 環境変数の確認（重要）

Vercelで環境変数が設定されているか確認してください：

1. Vercelダッシュボードでプロジェクトを開く
2. 「Settings」→「Environment Variables」を確認
3. 以下が設定されているか確認：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

設定されていない場合は追加してください。

## ✅ 公開後の確認

- [ ] アプリが正常に表示される
- [ ] レビューの投稿・編集・削除が動作する
- [ ] Googleログインが動作する
- [ ] モバイル端末でも正常に表示される
- [ ] 最新のUI変更が反映されている

## 🆘 問題が起きた場合

### Gitの認証エラー

GitHubのパーソナルアクセストークンを取得：
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 「Generate new token (classic)」
3. `repo`にチェック
4. トークンを生成してコピー
5. `git push`のパスワードとして使用

### ビルドエラー

Vercelのダッシュボードでエラーログを確認し、問題を修正してください。

## 📝 今回の主な変更内容

- レビュー詳細ページのスクロール位置をトップに修正
- 比較ページの2列レイアウト実装
- 検索ページの強みのある分野を更新
- ログインボタンのコンパクト化（スマホUI）
- ナビゲーションバーのアイコン配置調整
- レビューカードの見やすさ改善

