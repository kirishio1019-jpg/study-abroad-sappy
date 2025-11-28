# ローカル開発環境の起動方法

## 🚀 ローカル開発サーバーの起動

開発サーバーは起動しています。以下のURLにアクセスしてください：

**http://localhost:3000**

---

## 📝 基本的な使い方

### 1. 開発サーバーの起動

```bash
cd study-abroad-comparison
npm run dev
```

### 2. ブラウザでアクセス

開発サーバーが起動したら、ブラウザで以下のURLを開きます：

```
http://localhost:3000
```

---

## 🔧 開発の流れ

1. **コードを編集**
   - Cursorでファイルを編集
   - 保存すると自動的にリロードされます（Hot Reload）

2. **変更を確認**
   - ブラウザで確認
   - エラーがあればターミナルやブラウザのコンソールに表示されます

3. **変更をコミット**
   - GitHub Desktopで変更をコミット
   - プッシュするとVercelに自動デプロイされます

---

## ⚙️ 環境変数の設定

`.env.local`ファイルが必要な場合：

1. `study-abroad-comparison`フォルダに`.env.local`を作成
2. 以下の環境変数を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🛑 サーバーを停止する方法

ターミナルで `Ctrl + C` を押してください。

---

## 📚 便利なコマンド

- `npm run dev` - 開発サーバーを起動
- `npm run build` - プロダクション用ビルド
- `npm run start` - プロダクションサーバーを起動
- `npm run lint` - コードのリントチェック

---

**ローカルで修正を加えたら、GitHubにプッシュしてVercelにデプロイしましょう！**



