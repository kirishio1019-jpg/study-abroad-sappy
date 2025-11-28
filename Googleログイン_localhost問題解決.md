# Googleログインでlocalhostにリダイレクトされる問題の解決方法

## 🔍 問題

Googleアカウントでログインした後、localhostにリダイレクトされてしまう。

## 🛠️ 解決方法

### 原因

SupabaseとGoogle Cloud Consoleの設定で、デプロイ環境のURLが正しく設定されていない可能性があります。

### 解決手順

#### ステップ1: デプロイURLを確認

1. **Vercelダッシュボードにアクセス**
   - https://vercel.com/dashboard
   - プロジェクト「study-abroad-sappy」を開く
   - **デプロイURLを確認**（例: `https://study-abroad-sappy.vercel.app`）

#### ステップ2: Supabaseの認証設定を確認

1. **Supabaseダッシュボードにアクセス**
   - https://supabase.com/dashboard
   - プロジェクトを開く

2. **認証設定を開く**
   - 左側のメニューから「**Authentication**」をクリック
   - 「**URL Configuration**」を開く

3. **Site URLを設定**
   - **Site URL**: デプロイURLを設定（例: `https://study-abroad-sappy.vercel.app`）

4. **Redirect URLsを追加**
   - 「**Redirect URLs**」セクションで「**Add URL**」をクリック
   - 以下のURLを追加：
     - `https://study-abroad-sappy.vercel.app/auth/callback`
     - （ローカル開発用に）`http://localhost:3000/auth/callback`

5. **保存**をクリック

#### ステップ3: Google Cloud Consoleの設定を確認

1. **Google Cloud Consoleにアクセス**
   - https://console.cloud.google.com/
   - プロジェクトを選択

2. **APIとサービス → 認証情報**を開く
   - 左側のメニューから「**APIとサービス**」→「**認証情報**」をクリック

3. **OAuth 2.0 クライアント ID**を開く
   - Supabase用のOAuth 2.0 クライアント IDをクリック

4. **承認済みのリダイレクト URI**を確認・追加
   - 「**承認済みのリダイレクト URI**」セクションで以下を確認・追加：
     - `https://study-abroad-sappy.vercel.app/auth/callback`
     - （ローカル開発用に）`http://localhost:3000/auth/callback`
     - （SupabaseのリダイレクトURIも必要）
       - `https://[your-project-id].supabase.co/auth/v1/callback`

5. **保存**をクリック

#### ステップ4: コードを確認（既に正しく設定されているはず）

`components/auth/login-button.tsx`で、リダイレクトURIが動的に生成されていることを確認：

```typescript
const redirectTo = `${window.location.origin}/auth/callback`
```

これは正しく設定されています。デプロイ環境では、`window.location.origin`がデプロイURLになります。

## ✅ 確認チェックリスト

- [ ] Supabaseの「Site URL」がデプロイURLに設定されている
- [ ] Supabaseの「Redirect URLs」にデプロイURLの`/auth/callback`が追加されている
- [ ] Google Cloud Consoleの「承認済みのリダイレクト URI」にデプロイURLの`/auth/callback`が追加されている
- [ ] コードで`window.location.origin`が使用されている（既に設定済み）

## 🔗 必要なリンク

- **Vercelダッシュボード**: https://vercel.com/dashboard
- **Supabaseダッシュボード**: https://supabase.com/dashboard
- **Google Cloud Console**: https://console.cloud.google.com/

## 💡 重要なポイント

- **Supabaseの「Site URL」**は、デプロイ環境のURLに設定する必要があります
- **リダイレクトURI**は、SupabaseとGoogle Cloud Consoleの両方に設定する必要があります
- コードは既に正しく設定されているため、設定のみの修正で解決できるはずです

