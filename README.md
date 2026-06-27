# SportMed AI — 部署指南

## 完整架構
- **前端 + API**：Next.js 部署於 Vercel（免費）
- **資料庫**：Supabase PostgreSQL（免費層）
- **AI**：Anthropic Claude API（您的 Key）
- **網址**：`https://your-app-name.vercel.app`

---

## 步驟一：建立 Supabase 資料庫（約 5 分鐘）

1. 前往 https://supabase.com → 點「Start your project」
2. 用 GitHub 帳號登入
3. 點「New project」→ 填入：
   - Project name：`sportmed-ai`
   - Database Password：設一個強密碼（自己記住）
   - Region：Southeast Asia（Singapore）最近
4. 等待建立完成（約 2 分鐘）
5. 進入專案後，點左側「SQL Editor」
6. 把 `supabase_schema.sql` 檔案的內容全部貼上 → 點「Run」
7. 點左側「Settings」→「API」，複製：
   - **Project URL**（`https://xxxx.supabase.co`）
   - **service_role** 的 Key（在 Project API keys 下方）

---

## 步驟二：取得 Anthropic API Key（約 2 分鐘）

1. 前往 https://console.anthropic.com
2. 登入後點「API Keys」→「Create Key」
3. 複製 Key（`sk-ant-...`）

---

## 步驟三：部署到 Vercel（約 5 分鐘）

### 方法 A：透過 GitHub（推薦）

1. 前往 https://github.com → 建立新 Repository（例如 `sportmed-ai`）
2. 把本資料夾所有檔案上傳到 Repository
3. 前往 https://vercel.com → 用 GitHub 帳號登入
4. 點「New Project」→ 選擇你的 Repository → 點「Import」
5. 在「Environment Variables」加入以下四個變數：

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | 步驟一取得的 Project URL |
   | `SUPABASE_SERVICE_KEY` | 步驟一取得的 service_role key |
   | `ANTHROPIC_API_KEY` | 步驟二取得的 API Key |
   | `JWT_SECRET` | 任意隨機字串（例如 `sportmed-secret-2024-ray`） |
   | `SETUP_SECRET` | 設一個初始化密碼（例如 `init-sportmed-2024`） |

6. 點「Deploy」→ 等待 1-2 分鐘

### 方法 B：透過 Vercel CLI

```bash
npm i -g vercel
cd sportmed
vercel deploy
# 按照提示操作，在 Vercel 網站設定環境變數
```

---

## 步驟四：初始化管理員帳號（一次性）

部署完成後，在瀏覽器訪問：

```
https://your-app.vercel.app/api/auth/setup?secret=init-sportmed-2024
```

（把 `your-app` 換成你的 Vercel 網址，`init-sportmed-2024` 換成你設的 SETUP_SECRET）

看到 `{"success":true}` 代表管理員帳號已建立。

---

## 步驟五：登入使用

訪問：`https://your-app.vercel.app`

- **信箱**：tanghuipei@gmail.com
- **密碼**：tanghuipei

---

## 使用流程

1. 登入後進入「客戶管理」頁面
2. 輸入客戶姓名建立新客戶（若已存在會直接開啟）
3. 點選客戶進入個案頁面
4. 填寫診斷日期、次數及症狀描述 → 點「開始評估分析」
5. AI 分析完成後結果自動存入資料庫
6. 點「新增反饋意見」輸入治療後狀況 → 系統將歷史資料整合後重新評估
7. 所有記錄永久保存，隨時可叫出

---

## 免費額度說明

| 服務 | 免費額度 | 備註 |
|------|---------|------|
| Vercel | 無限靜態、100GB 流量/月 | 個人使用完全免費 |
| Supabase | 500MB 資料庫、50000 API呼叫/月 | 個人使用完全免費 |
| Anthropic | 依 API 使用量計費 | Claude Sonnet 約 $3/百萬 token |

---

## 遇到問題？

- Vercel 部署失敗：檢查 Environment Variables 是否都有填
- 登入失敗：確認已執行步驟四的初始化
- AI 分析失敗：確認 ANTHROPIC_API_KEY 正確且有餘額
