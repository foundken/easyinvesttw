# 投資導航儀

## 跨手機/電腦登入同步

本專案已支援 Firebase Authentication + Firestore 雲端同步。設定後，同一個 Email/密碼登入即可在手機與電腦讀取同一份持股資料；不同使用者會各自讀寫自己的持股資料。

1. 到 Firebase 建立專案。
2. 到 Authentication > Sign-in method，啟用 Email/Password。
3. 到 Firestore Database，建立資料庫。
4. 到 Project settings > Your apps，新增 Web app 並複製 Firebase config。
5. 打開 `firebase-config.js`，貼上：

```js
window.EASYINVEST_FIREBASE_CONFIG = {
  apiKey: "你的 apiKey",
  authDomain: "你的 authDomain",
  projectId: "你的 projectId",
  storageBucket: "你的 storageBucket",
  messagingSenderId: "你的 messagingSenderId",
  appId: "你的 appId"
};
```

6. 到 Firestore Database > Rules，把 `firestore-rules.txt` 的內容貼上並發布。

安全重點：

- 密碼由 Firebase Authentication 處理，不會存在本網站程式碼。
- 持股資料存在 Firestore 的 `watchlists/{使用者UID}` 文件。
- Firestore Security Rules 已限制每個登入者只能讀寫自己的資料。
- Firebase 前端 config 可以放在網站中，真正的保護是 Authentication 與 Security Rules。

這是一個給不熟悉股市線圖的人使用的台股投資管理儀表板。

## 目前功能

- 加入已購買或想觀察的股票代號
- 記錄買進價與股數，估算持有損益
- 用白話顯示「可觀察轉強」「等待確認」「先保守」
- 顯示今日成交金額排行
- 顯示月營收、本益比、殖利率、股價淨值比
- 每 60 秒更新一次

## 資料來源

- 臺灣證券交易所 OpenAPI：每日個股成交資訊
- 臺灣證券交易所 OpenAPI：本益比、殖利率、股價淨值比
- 臺灣證券交易所 OpenAPI：上市公司月營收

本工具只做資料整理與教育用途，不構成投資建議。

## 部署到 Firebase Hosting

本專案已加入 Firebase Hosting 設定，會把 `investment-dashboard` 資料夾發布成網站。

```bash
firebase login
firebase deploy --only hosting,functions
```

注意：Firebase Hosting 是靜態網站服務，市場資料 API 透過 Firebase Functions 提供，所以正式部署請一起發布 `hosting` 和 `functions`。

### GitHub push 自動部署

Repo 已加入 GitHub Actions workflow：

- 檔案位置：`.github/workflows/firebase-deploy.yml`
- 觸發條件：push 到 `main`
- 部署內容：`firebase deploy --only hosting,functions --project easyinvesttw --non-interactive`

第一次啟用前，請先在 GitHub repository secrets 新增：

```bash
FIREBASE_SERVICE_ACCOUNT_EASYINVESTTW
```

這個 secret 內容要放 Firebase / Google Cloud service account 的 JSON 金鑰，並授權它可以部署 Hosting 與 Functions。

如果你想用 Firebase CLI 自動幫你建立 GitHub 部署基礎設定，也可以在 repo root 執行：

```bash
firebase init hosting:github
```

若只部署 Hosting，登入與 Firestore 持股同步可以使用，但市場資料會缺少後端代理，可能退回範例資料。Firebase Functions 呼叫外部市場資料來源通常需要 Firebase Blaze 方案。

## 串接 Fugle 富果即時行情

1. 到 Fugle Developer 申請行情 API Key。
2. 到 Firebase Functions 的執行環境設定對應變數。
3. 開啟環境變數設定。
4. 新增變數：

```text
FUGLE_API_KEY=你的富果行情API金鑰
```

5. 重新部署網站。

設定完成後，追蹤清單與我的存股會優先使用 Fugle 即時報價；成交排名仍使用證交所公開成交排行。
