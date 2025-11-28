# 🚀 デプロイ後のGoogleログイン設定ガイド

デプロイ後のアプリでGoogleアカウントでログインできない場合の解決方法です。

---

## 📋 確認チェックリスト

以下の項目を順番に確認してください：

- [ ] デプロイ先のURLがGoogle Cloud Consoleの「承認済みのリダイレクト URI」に追加されている
- [ ] Supabaseの環境変数がデプロイ先で正しく設定されている
- [ ] SupabaseでGoogle認証プロバイダーが有効になっている
- [ ] Google Cloud ConsoleでOAuth 2.0 Client IDとSecretが正しく設定されている

---

## 🔧 解決手順

### ステップ1: デプロイ先のURLを確認

1. **デプロイ先のURLを確認**
   - 例: `https://your-app.vercel.app`
   - 例: `https://your-domain.com`

2. **リダイレクトURIを確認**
   - デプロイ先のURLに `/auth/callback` を追加
   - 例: `https://your-app.vercel.app/auth/callback`
   - 例: `https://your-domain.com/auth/callback`

---

### ステップ2: Google Cloud ConsoleでリダイレクトURIを追加

1. **Google Cloud Consoleにアクセス**
   - https://console.cloud.google.com/ にアクセス
   - あなたのプロジェクトを選択

2. **認証情報を開く**
   - 左側メニュー → 「APIとサービス」→ 「認証情報」
   - 作成した「OAuth 2.0 クライアント ID」をクリック

3. **リダイレクトURIを追加**
   - 「承認済みのリダイレクト URI」セクションを確認
   - 「URIを追加」をクリック
   - 以下のURIを追加：

   #### デプロイ先のURL（本番環境）
   ```
   https://your-app.vercel.app/auth/callback
   ```
   ※ `your-app.vercel.app` の部分を、あなたのデプロイ先のURLに置き換えてください

   #### 開発環境用（ローカル）
   ```
   http://localhost:3000/auth/callback
   ```

   #### Supabase用（必須）
   ```
   https://[your-project-ref].supabase.co/auth/v1/callback
   ```
   ※ `[your-project-ref]` の部分を、あなたのSupabaseプロジェクトURLに置き換えてください
   ※ SupabaseのProject URLを確認する方法：
      - Supabaseダッシュボード → Settings → API → Project URL

4. **保存**
   - 「保存」ボタンをクリック
   - 変更が保存されるまで数秒待つ

---

### ステップ3: Supabaseの設定を確認

1. **Supabaseダッシュボードにアクセス**
   - https://supabase.com/dashboard にアクセス
   - あなたのプロジェクトを選択

2. **Google認証プロバイダーを確認**
   - 左側メニュー → 「🔐 Authentication」→ 「Providers」
   - 「Google」をクリック

3. **設定を確認**
   - 「Enable Google provider」が **ON** になっているか確認
   - **Client ID (for OAuth)** が正しく設定されているか確認
   - **Client Secret (for OAuth)** が正しく設定されているか確認

4. **設定が正しくない場合**
   - Google Cloud Consoleで取得したClient IDとSecretを入力
   - 「Save」ボタンをクリック

---

### ステップ4: デプロイ先の環境変数を確認

デプロイ先（Vercel、Netlifyなど）で環境変数が正しく設定されているか確認してください。

#### 必要な環境変数：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Vercelの場合：

1. Vercelダッシュボードにアクセス
2. プロジェクトを選択
3. 「Settings」→ 「Environment Variables」
4. 上記の2つの環境変数が設定されているか確認
5. 設定されていない場合は、追加してください

#### 環境変数を変更した場合：

環境変数を変更した場合は、**再デプロイ**が必要です：
- Vercel: 自動的に再デプロイされるか、「Redeploy」をクリック
- その他のプラットフォーム: 再デプロイを実行

---

### ステップ5: ブラウザのキャッシュをクリア

1. **ブラウザのキャッシュをクリア**
   - `Ctrl + Shift + Delete` を押す
   - 「キャッシュされた画像とファイル」を選択
   - 「データを消去」をクリック

2. **ブラウザをリロード**
   - `Ctrl + F5` で強制リロード

---

## 🔍 トラブルシューティング

### エラー1: "redirect_uri_mismatch"

**原因**: Google Cloud Consoleの「承認済みのリダイレクト URI」に、デプロイ先のURLが登録されていない

**解決方法**:
1. ステップ2を確認して、デプロイ先のURLを追加してください
2. 保存後、数分待ってから再度試してください（設定の反映に時間がかかることがあります）

---

### エラー2: "provider is not enabled"

**原因**: SupabaseでGoogle認証プロバイダーが有効になっていない

**解決方法**:
1. ステップ3を確認して、Google認証プロバイダーを有効にしてください
2. Client IDとSecretが正しく設定されているか確認してください

---

### エラー3: ログイン後、元のページに戻らない

**原因**: リダイレクトURIが正しく設定されていない

**解決方法**:
1. デプロイ先のURLが正しく設定されているか確認
2. `/auth/callback` のパスが正しいか確認
3. ブラウザのコンソール（F12）でエラーを確認

---

### エラー4: セッションが作成されない

**原因**: 環境変数が正しく設定されていない、またはSupabaseの設定が間違っている

**解決方法**:
1. デプロイ先の環境変数が正しく設定されているか確認（ステップ4）
2. Supabaseの設定を確認（ステップ3）
3. 再デプロイを実行

---

## 📝 リダイレクトURIの例

### Vercelにデプロイした場合：

```
https://your-app.vercel.app/auth/callback
```

### カスタムドメインを使用している場合：

```
https://your-domain.com/auth/callback
```

### 開発環境：

```
http://localhost:3000/auth/callback
```

### Supabase用（必須）：

```
https://[your-project-ref].supabase.co/auth/v1/callback
```

---

## ✅ 確認方法

すべての設定が完了したら、以下を確認してください：

1. **デプロイ先のURLにアクセス**
2. **「Googleでログイン」ボタンをクリック**
3. **Googleの認証画面が表示される**
4. **認証後、デプロイ先のページに戻る**
5. **ログイン状態が保持されている**

---

## 🆘 まだ解決しない場合

1. **ブラウザのコンソールでエラーを確認**
   - `F12`キーを押して開発者ツールを開く
   - 「Console」タブでエラーメッセージを確認

2. **ネットワークタブでリクエストを確認**
   - 開発者ツールの「Network」タブで、認証リクエストが正しく送信されているか確認

3. **Supabaseのログを確認**
   - Supabaseダッシュボード → Authentication → Logs
   - エラーログがないか確認

4. **以下の情報を確認**
   - デプロイ先のURL
   - Google Cloud Consoleの「承認済みのリダイレクト URI」
   - Supabaseの設定
   - 環境変数の設定

これらの情報があれば、より具体的に解決できます！

---

## 📚 関連ドキュメント

- `GOOGLE_LOGIN_SETUP.md` - 初回セットアップガイド
- `FIX_REDIRECT_URI_ERROR.md` - リダイレクトURIエラーの解決方法
- `TROUBLESHOOTING_GOOGLE_LOGIN.md` - Googleログインのトラブルシューティング

