# 開発サーバー起動手順

## 手順1: ターミナルを開く
Cursorのターミナルを開いてください（`Ctrl + Shift + ` または メニューから「ターミナル」→「新しいターミナル」）

## 手順2: プロジェクトフォルダに移動
```powershell
cd C:\Users\kiris\.cursor\study-abroad-comparison
```

## 手順3: 開発サーバーを起動
```powershell
npm run dev
```

## 手順4: 起動を確認
以下のようなメッセージが表示されるまで待ってください：
```
   ▲ Next.js 16.0.0
   - Local:        http://localhost:3000
   - ready started server on 0.0.0.0:3000
```

## 手順5: ブラウザで開く
ブラウザで以下のURLを開いてください：
```
http://localhost:3000
```

## トラブルシューティング

### エラーが出る場合
- `npm run dev`を実行したときのエラーメッセージを確認してください
- よくあるエラー：
  - `Error: Cannot find module` → `npm install`を実行してください
  - `Port 3000 is already in use` → 他のプロセスがポート3000を使用しています

### ページが表示されない場合
- ブラウザでF12キーを押して開発者ツールを開く
- Consoleタブでエラーメッセージを確認
- Networkタブでリクエストが失敗していないか確認

### ポート3000が使用中の場合
別のポートを使用するには：
```powershell
npm run dev -- -p 3001
```
その後、`http://localhost:3001`でアクセス


