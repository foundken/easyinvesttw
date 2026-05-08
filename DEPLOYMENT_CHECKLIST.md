# 📋 部署檢查清單

## 前置準備

- [ ] 確認已安裝 Node.js 和 Git
- [ ] 確認有 GitHub 帳號訪問權限
- [ ] 確認有 Netlify 帳號和部署權限
- [ ] 備份當前代碼（可選）

## 代碼驗證

### 本地檢查
```bash
# 確認文件已修改
cd investment-dashboard
ls -la index.html styles.css app.js

# 檢查關鍵代碼是否存在
grep "quick-add-panel" index.html    # 應該返回多行
grep "quickAddForm" app.js           # 應該返回多行
grep ".quick-add-panel" styles.css   # 應該返回結果
```

### 本地測試
```bash
# 如果有本地開發服務器
# 例如：python -m http.server
# 或：python -m SimpleHTTPServer 8000

# 然後在浏览器打开 http://localhost:8000/investment-dashboard/

# 检查：
# ✓ 快速加入面板在页面顶部可见
# ✓ 搜索输入框可用
# ✓ 可以输入股票代号和名称
# ✓ 搜索结果正常显示
# ✓ 添加股票到快速列表工作正常
```

## Git 提交步驟

```bash
# 1. 確認當前分支
git branch
# 應該看到 main（或 master）分支標記

# 2. 查看修改的文件
git status
# 應該看到 3 個修改的文件：
# - investment-dashboard/index.html
# - investment-dashboard/styles.css
# - investment-dashboard/app.js

# 3. 添加所有修改
git add investment-dashboard/index.html
git add investment-dashboard/styles.css
git add investment-dashboard/app.js

# 4. 驗證暫存區
git status
# 應該看到 3 個文件準備提交

# 5. 提交更改
git commit -m "feat: UX 改善 - 添加快速加入股票面板和搜尋功能

- 新增快速加入面板到頁面頂部
- 實現股票代號和名稱搜尋功能  
- 添加已加入股票的快速預覽
- 集成編輯和刪除快捷功能
- 完整的響應式設計支持
- 向後相容原有表單"

# 6. 驗證提交日誌
git log --oneline -5
# 應該看到你的提交在最上方

# 7. 推送到遠程倉庫
git push origin main
# 或
git push origin master
```

## Netlify 部署

### 方案 A: 自動部署（推薦）
GitHub 推送後自動部署
```bash
# 推送後，Netlify 應該自動：
# 1. 檢測到代碼變更
# 2. 觸發構建流程
# 3. 部署到生產環境

# 在 Netlify Dashboard 檢查部署狀態
# https://app.netlify.com/
```

### 方案 B: 手動部署
```bash
# 如果使用 Netlify CLI
netlify login
netlify deploy --prod

# 或在 Netlify Dashboard 上手動觸發部署
```

## 部署後驗證

### 訪問應用
```
https://easyinvesttw.web.app
```

### 功能檢查清單

**視覺檢查**
- [ ] 快速加入面板在頁面頂部可見
- [ ] 面板標題為「快速加入」
- [ ] 標題下方有「輸入股票代號查詢」
- [ ] 有「支援代號或股票名稱」的提示

**搜尋功能**
- [ ] 輸入 `2330` 顯示結果
- [ ] 輸入 `台積` 顯示結果
- [ ] 結果中顯示股票代號、名稱和價格
- [ ] 點擊結果後代號自動填入

**表單功能**
- [ ] 可輸入買進價
- [ ] 可輸入股數
- [ ] 可選擇分類（我的存股/觀察名單）
- [ ] 點擊「加入」按鈕
- [ ] 股票添加成功（如已登入）

**已加入股票列表**
- [ ] 顯示「已加入的股票：」標題
- [ ] 列表中顯示最近添加的股票
- [ ] 每個股票有編輯按鈕
- [ ] 每個股票有刪除按鈕
- [ ] 編輯按鈕回填表單
- [ ] 刪除後股票從列表移除

**響應式設計**
- [ ] 桌面版布局正確（4列）
- [ ] 平板版布局正確（2列）
- [ ] 手機版布局正確（堆疊）
- [ ] 深色模式顯示正常

**向後相容性**
- [ ] 原有的底部表單仍然可用
- [ ] 原有的「我的存股」和「觀察名單」功能正常
- [ ] 所有現有功能未受影響

### 性能檢查
```javascript
// 在瀏覽器控制台執行
console.time('search');
// 然後輸入股票代號觸發搜尋
console.timeEnd('search');
// 應該顯示時間 < 200ms
```

## 故障排除

### 問題：快速加入面板沒有顯示
**解決方案**
1. 清除瀏覽器快取（Ctrl+Shift+Del）
2. 硬刷新（Ctrl+Shift+R）
3. 檢查瀏覽器控制台是否有錯誤
4. 確認部署已完成

### 問題：搜尋功能不工作
**解決方案**
1. 檢查網絡連接
2. 查看瀏覽器控制台是否有錯誤
3. 確認 API 端點正常（`/api/market` 或 `/.netlify/functions/market`）
4. 嘗試輸入數字股票代號

### 問題：股票無法添加
**解決方案**
1. 確認已登入（如使用雲端存儲）
2. 檢查股票代號是否正確（4-6 位數字）
3. 查看瀏覽器控制台錯誤信息
4. 確認 Firebase 連接正常

### 問題：樣式顯示異常
**解決方案**
1. 清除瀏覽器快取
2. 確認 CSS 文件已正確部署
3. 檢查深色/淺色模式設置
4. 在不同瀏覽器上測試

## 回滾計劃

如果出現嚴重問題，可以回滾：

```bash
# 查看提交歷史
git log --oneline

# 找到上一個穩定版本的 commit hash
git revert <commit-hash>
# 或
git reset --hard <previous-commit>

# 推送回滾
git push origin main
```

## 文檔更新

- [ ] 更新 README.md 如需要
- [ ] 更新用戶文檔
- [ ] 更新 API 文檔（如有變更）
- [ ] 更新變更日誌

## 發行通知

- [ ] 通知用戶新功能已發布
- [ ] 提供使用指南
- [ ] 收集使用反饋
- [ ] 監控 GitHub Issues

## 最後檢查

在標記為「完成」之前：

- [ ] 所有測試通過
- [ ] 沒有控制台錯誤
- [ ] 沒有性能問題
- [ ] 移動版本可用
- [ ] 深色模式工作正常
- [ ] 文檔已更新
- [ ] 用戶已通知

---

## 聯絡支持

如有問題，請聯絡：
- **GitHub Issues**: https://github.com/foundken/easyinvesttw/issues
- **Email**: foundken@gmail.com

---

**檢查清單版本**: 1.0  
**最後更新**: 2026-05-08  
**狀態**: 待部署 ⏳

