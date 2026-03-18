# Tabinoto 🌿 旅のノート

React + Supabase + Claude APIで作る旅の記録アプリ

---

## 🚀 起動するまでの手順（初回のみ）

### 1. Node.jsをインストール

https://nodejs.org から **LTS版** をダウンロードしてインストール。

ターミナル（Macはターミナル、WindowsはPowerShell）で確認：
```bash
node -v   # v18以上なら OK
```

### 2. このフォルダをターミナルで開く

```bash
cd tabinoto
```

### 3. パッケージをインストール

```bash
npm install
```

### 4. Supabaseを設定する（無料）

1. https://supabase.com でアカウント作成
2. 「New Project」でプロジェクト作成
3. **SQL Editor** を開いて `supabase_setup.sql` の内容を貼り付けて実行
4. **Storage** > **New bucket** で `photos` バケットを作成（Public: ON）
5. **Settings > API** から以下をコピー：
   - `Project URL`
   - `anon public` キー

### 5. Claude APIキーを取得する

1. https://console.anthropic.com でアカウント作成
2. API Keys > Create Key でキーを作成

### 6. 環境変数ファイルを作る

`.env.example` を `.env` という名前でコピーして値を入力：

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://あなたのプロジェクトURL.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...（anonキー）
VITE_ANTHROPIC_API_KEY=sk-ant-...（Claudeキー）
```

### 7. 起動！

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開く。

---

## 📁 ファイル構成

```
tabinoto/
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # サイドバー付きレイアウト
│   │   └── Layout.module.css
│   ├── hooks/
│   │   ├── useEntries.js       # 日記CRUD（Supabase連携）
│   │   └── usePhotoUpload.js   # 写真アップロード＋GPS読み取り
│   ├── lib/
│   │   ├── supabase.js         # Supabaseクライアント
│   │   └── claude.js           # Claude API連携
│   ├── pages/
│   │   ├── DiaryPage.jsx       # 日記一覧
│   │   ├── NewEntryPage.jsx    # 新規記録フォーム
│   │   ├── EntryDetailPage.jsx # 記録詳細
│   │   ├── MapPage.jsx         # 地図・訪問地一覧
│   │   └── AiResearchPage.jsx  # AI情報収集
│   ├── App.jsx                 # ルーティング
│   ├── main.jsx
│   └── index.css               # グローバルスタイル
├── supabase_setup.sql          # Supabaseテーブル作成SQL
├── .env.example                # 環境変数テンプレート
└── package.json
```

---

## ✦ 機能一覧

| 機能 | 説明 |
|------|------|
| 日記一覧 | 時系列で旅の記録を表示 |
| 新規記録 | タイトル・訪問地・本文・写真を保存 |
| GPS読み取り | 写真のEXIF情報から自動で位置情報を取得 |
| 逆ジオコーディング | 緯度経度から地名を自動取得 |
| AI要約・タグ | 日記保存時にClaudeが自動で要約とタグを生成 |
| AI情報収集 | 訪問予定地の観光情報をClaude+Web検索で収集 |
| オフライン対応 | Supabase未設定時はlocalStorageにフォールバック |

---

## 🌐 Vercelにデプロイする（公開する）

1. https://github.com で新しいリポジトリを作成
2. このフォルダをGitHubにプッシュ
3. https://vercel.com でGitHubと連携
4. 環境変数（VITE_SUPABASE_URL等）をVercelのダッシュボードに設定
5. デプロイ完了！URLが発行される

---

## 🔧 次のステップ（Claudeに依頼できること）

- 「ユーザー認証（ログイン機能）を追加して」
- 「日記をPDFでエクスポートできるようにして」
- 「スマートフォン向けのレイアウトを改善して」
- 「地図にLeaflet.jsを使った本格的なマップを追加して」
- 「記録を検索できる機能を追加して」
