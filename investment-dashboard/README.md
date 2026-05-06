# 投資導航儀

## 跨手機/電腦登入同步

本專案已支援 Supabase Auth + RLS 雲端同步。設定後，同一個 Email/密碼登入即可在手機與電腦讀取同一份持股資料。

1. 到 Supabase 建立新專案。
2. 在 SQL Editor 執行 `supabase-schema.sql`。
3. 到 Project Settings > API 複製：
   - Project URL
   - anon public key
4. 打開 `cloud-config.js`，貼上：

```js
window.EASYINVEST_CONFIG = {
  supabaseUrl: "你的 Project URL",
  supabaseAnonKey: "你的 anon public key"
};
```

安全重點：

- 密碼由 Supabase Auth 處理，不會存在本網站程式碼。
- 持股資料存在 `watchlists` 資料表。
- RLS 已限制每個登入者只能讀寫自己的資料。
- anon key 可以放在前端，真正的保護是 RLS 規則。

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

## 部署到 Netlify

把整個 `investment-dashboard` 資料夾部署到 Netlify。Netlify 會自動使用 `netlify/functions/market.js` 抓取證交所資料。

## 串接 Fugle 富果即時行情

1. 到 Fugle Developer 申請行情 API Key。
2. 到 Netlify 專案設定。
3. 開啟 Environment variables。
4. 新增變數：

```text
FUGLE_API_KEY=你的富果行情API金鑰
```

5. 重新部署網站。

設定完成後，追蹤清單與我的存股會優先使用 Fugle 即時報價；成交排名仍使用證交所公開成交排行。
