# Vercel 404エラー解決手順

## 問題

Vercelで404エラーが発生しています：
```
404: NOT_FOUND
Code: NOT_FOUND
```

## 原因

VercelがNext.jsアプリを正しく認識できていない可能性があります。

## 解決方法

### ステップ1: Vercelの設定を確認

1. **Vercelダッシュボードにアクセス**
   - https://vercel.com/dashboard にアクセス
   - プロジェクトを開く

2. **Settings → General を確認**
   - **Root Directory**: 空白（または `./`）
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`（または空白で自動検出）
   - **Output Directory**: `.next`（または空白で自動検出）

3. **Settings → Environment Variables を確認**
   - `NEXT_PUBLIC_SUPABASE_URL` が設定されているか
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` が設定されているか

### ステップ2: ビルドログを確認

1. Vercelダッシュボードで最新のデプロイを開く
2. 「Build Logs」タブを確認
3. エラーメッセージがあれば修正

### ステップ3: プロジェクトを再デプロイ

1. Vercelダッシュボードで「Deployments」タブを開く
2. 最新のデプロイの右側にある「⋯」メニューをクリック
3. 「Redeploy」を選択

### ステップ4: プロジェクトを再インポート（必要に応じて）

上記で解決しない場合：

1. プロジェクトを削除（Settings → Delete Project）
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリを再度選択
4. **Root Directory**: 空白（自動検出）
5. 環境変数を設定
6. 「Deploy」をクリック

## 確認事項

- [ ] `app/page.tsx`が存在する（ルートページ）
- [ ] `app/layout.tsx`が存在する（ルートレイアウト）
- [ ] `package.json`に`"build": "next build"`が定義されている
- [ ] Next.jsのバージョンが正しい（package.jsonを確認）
- [ ] 環境変数が設定されている

## よくある問題

### ビルドエラー

Vercelのビルドログでエラーを確認し、修正してください。

### 環境変数の問題

環境変数が設定されていないと、ビルドは成功しても実行時にエラーが発生する可能性があります。

### ルーティングの問題

Next.jsのApp Routerを使用しているため、`app/page.tsx`がルートページとして機能します。これが正しく存在しているか確認してください。

