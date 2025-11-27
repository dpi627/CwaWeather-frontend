# 森森天氣 - Copilot Instructions

## 專案概述

台灣六都天氣預報應用程式，採用日系 Kawaii 雜誌風格設計。純前端靜態網站，無建置流程，資料來源為中央氣象署。

## 檔案架構

```
index.html          # HTML 結構（城市選擇器、Hero 區塊、三日預報 Grid）
assets/css/style.css # Kawaii 風格樣式（粉彩色系、玻璃態效果）
assets/js/app.js     # 主邏輯（API 呼叫、資料轉換、DOM 渲染）
assets/img/          # 城市背景圖 bg-{city}.jpeg、天氣圖示 w{code}.jpg
doc/api.md           # 後端 API 完整文件
```

## API 整合

同時呼叫兩個端點，使用 `Promise.all()` 並行請求：
- **36 小時預報**：`GET /api/weather/{city}` → 渲染 Hero 區塊
- **三日預報**：`GET /api/weather/3day/{city}` → 渲染三日卡片

支援城市：`taipei`, `newtaipei`, `taoyuan`, `taichung`, `tainan`, `kaohsiung`

## 關鍵資料轉換

原始 API 回傳 `weatherElement[]` 多維陣列，需轉換為扁平結構：
- `transform36HourData()` - 從 Wx/PoP/MinT/MaxT/CI 合併為 `forecasts[]`
- `transform3DayData()` - 取第一個行政區，按日期分組計算每日極值

## CSS 變數慣例

使用 `--kawaii-*` 前綴的粉彩色系：
```css
--kawaii-pink: #FFB5C5;      /* 強調色、active 狀態 */
--kawaii-mint: #98E4D0;      /* 漸層色 */
--kawaii-lavender: #C9B1FF;  /* 時段標籤 */
--kawaii-cream: #FFF8E7;     /* 卡片背景 */
```

## JavaScript 核心函式

| 函式 | 用途 |
|------|------|
| `parseDateTime(str)` | Safari 相容的時間解析（空格→T） |
| `getWeatherEmoji(weather)` | 天氣描述轉 emoji |
| `getWeatherImage(code)` | 天氣代碼轉圖片路徑 `w{code}.jpg` |
| `getAdvice(rain, temp)` | 生成穿搭/帶傘建議 |
| `renderHero()` / `render3DayForecast()` | DOM 渲染 |
| `switchCity(cityKey)` | 城市切換，觸發重新載入 |

## UI 元件命名

- `.hero-*` - 36 小時主卡片（含城市背景）
- `.forecast-*` - 三日預報卡片（三欄 Grid）
- `.city-*` - 城市選擇器（橫向滾動 pill 按鈕）
- `.advice-*` - 穿搭/雨具建議區塊

## 開發方式

直接用瀏覽器開啟 `index.html` 或使用 VS Code Live Server。

## 修改注意事項

- **Loading 最少 1.5 秒**：UX 設計決策，見 `fetchWeather()` 中的 `delayPromise`
- **圖片 fallback**：天氣圖片加入 `onerror` 自動降級到 `w00.jpg`
- **Safari 相容**：時間字串必須用 `parseDateTime()` 處理
- **顏色請用 CSS 變數**：維持 Kawaii 風格一致性
- **emoji 集中管理**：統一在 `getWeatherEmoji()` 函式中維護
