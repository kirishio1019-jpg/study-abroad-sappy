# 🔧 Vercelエラー修正ガイド

## エラー内容
```
Error: No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies". Also check your Root Directory setting matches the directory of your package.json file.
```

## 原因
Vercelが`package.json`を見つけられていない可能性があります。これは、リポジトリのルートディレクトリ設定の問題です。

## 解決方法

### 方法1: VercelのRoot Directory設定を確認

1. **Vercelのプロジェクト設定ページを開く**
   - プロジェクトページで「Settings」をクリック
   - 「General」セクションを開く

2. **Root Directory設定を確認**
   - 「Root Directory」の設定を確認
   - もし設定されている場合は、**削除**または**空にする**
   - または、`study-abroad-comparison`に設定されている場合は、**削除**して空にする

3. **「Save」をクリック**

4. **再デプロイ**
   - 「Deployments」タブに戻る
   - 最新のデプロイをクリック
   - 「Redeploy」をクリック

### 方法2: GitHubリポジトリの構造を確認

GitHubリポジトリの構造を確認してください：

1. **GitHubリポジトリを開く**
   - https://github.com/kirishio1019-jpg/study-abroad-sappy

2. **`package.json`がルートディレクトリにあるか確認**
   - リポジトリのルートに`package.json`があるはずです
   - もし`study-abroad-comparison/package.json`という構造になっている場合は、Root Directoryを`study-abroad-comparison`に設定する必要があります

### 方法3: プロジェクトを再インポート

1. **Vercelのダッシュボードでプロジェクトを削除**
   - 「Settings」→「General」→ 一番下の「Delete Project」

2. **再度インポート**
   - 「Add New...」→「Project」
   - リポジトリを選択
   - インポート時にRoot Directoryが空であることを確認

## 確認事項

- [ ] GitHubリポジトリのルートに`package.json`がある
- [ ] `package.json`に`"next": "16.0.0"`が含まれている
- [ ] VercelのRoot Directory設定が正しい（空または`study-abroad-comparison`）

## 次のステップ

エラーが解決したら、再度デプロイを試してください。まだエラーが出る場合は、エラーメッセージの全文を共有してください。

