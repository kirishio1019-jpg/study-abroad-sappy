# 🔧 PowerShell実行ポリシーエラーの解決方法

## エラーの内容

以下のようなエラーが表示される場合：

```
npm: このシステムではスクリプトの実行が無効になっているため、ファイルを読み込むことが出来ません。
```

これは、PowerShellの実行ポリシーが制限されているために発生します。

---

## ✅ 解決方法（3つの方法）

### 方法1: 実行ポリシーを変更する（推奨）

1. **PowerShellを管理者として開く**

   - Windowsキーを押す
   - 「PowerShell」と入力
   - 「Windows PowerShell」を右クリック
   - 「管理者として実行」をクリック

2. **以下のコマンドを実行：**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **「Y」を入力してEnterキーを押す**

4. **PowerShellを閉じる**

5. **Cursorのターミナルでもう一度試す**

---

### 方法2: コマンドプロンプト（cmd）を使用する

PowerShellの代わりに、コマンドプロンプトを使用します。

#### 手順：

1. **Windowsキーを押す**

2. **「cmd」と入力**

3. **「コマンドプロンプト」をクリック**

4. **以下のコマンドを順番に実行：**
   ```cmd
   cd C:\Users\kiris\.cursor\study-abroad-comparison
   ```
   Enterキーを押す

5. **次に：**
   ```cmd
   npm run dev
   ```
   Enterキーを押す

6. **「✓ Ready」というメッセージが表示されるまで待つ**

---

### 方法3: 実行ポリシーをバイパスして実行する

Cursorのターミナルで、以下のように実行します：

```powershell
cd C:\Users\kiris\.cursor\study-abroad-comparison
```

Enterキーを押す

次に：

```powershell
powershell -ExecutionPolicy Bypass -Command "npm run dev"
```

Enterキーを押す

---

## 🎯 最も簡単な解決方法（おすすめ）

**方法2（コマンドプロンプトを使用）が最も簡単です。**

PowerShellの設定を変更する必要がなく、すぐに使えます。

---

## 📋 手順のまとめ（コマンドプロンプトを使用）

1. **Windowsキーを押す**

2. **「cmd」と入力してEnter**

3. **コマンドプロンプトが開いたら、以下を実行：**
   ```
   cd C:\Users\kiris\.cursor\study-abroad-comparison
   ```
   Enterキー

4. **次に：**
   ```
   npm run dev
   ```
   Enterキー

5. **「✓ Ready」というメッセージが表示されるまで待つ（30秒〜1分）**

6. **ブラウザで `http://localhost:3000` を開く**

---

## ❓ よくある質問

### Q: コマンドプロンプトはどこにありますか？

A: 
- Windowsキーを押す
- 「cmd」と入力
- 「コマンドプロンプト」をクリック

または

- Windowsキー + R を押す
- 「cmd」と入力してEnter

### Q: 方法1で「アクセスが拒否されました」と表示されます

A: 
- PowerShellを**管理者として**開いているか確認してください
- または、方法2（コマンドプロンプト）を使用してください

### Q: コマンドプロンプトでも同じエラーが出ます

A: 
- その場合は、Node.jsが正しくインストールされていない可能性があります
- Node.jsのインストールを確認してください

---

## ✅ 確認チェックリスト

- [ ] コマンドプロンプトを開いた
- [ ] `cd C:\Users\kiris\.cursor\study-abroad-comparison` を実行した
- [ ] `npm run dev` を実行した
- [ ] 「✓ Ready」というメッセージが表示された
- [ ] ブラウザで `http://localhost:3000` を開いた
- [ ] ページが表示された

---

**まずは、方法2（コマンドプロンプトを使用）を試してみてください！**

