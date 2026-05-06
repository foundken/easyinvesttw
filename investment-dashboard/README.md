# 投資導航儀

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
