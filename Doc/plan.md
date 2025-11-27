# 寶可天氣 UI 全面重構計畫

## Japanese Magazine Kawaii Style

將天氣應用重新設計為現代化 Kawaii 雜誌風格，整合六都切換、36 小時 Hero 區塊（含城市背景）、三日預報卡片（顯示每日極值），使用寶可夢風格天氣圖示與 lazy loading 優化。

---

## 重構步驟

### Step 1: 重構 HTML 結構
修改 `index.html`：
- 新增橫向滾動城市選擇器 `.city-selector`（六個 pill 按鈕）
- Hero 區塊 `.hero-section` 改為可設定背景圖的容器
- 新增三欄均分 `.forecast-grid`（使用 CSS Grid `grid-template-columns: repeat(3, 1fr)`）
- 所有天氣圖片加入 `loading="lazy"` 屬性

### Step 2: 新增工具函式至 `app.js`
- `parseDateTime(str)` - 將 `"2025-11-26 06:00:00"` 轉換為 `"2025-11-26T06:00:00"` 確保 Safari 相容
- `getWeatherImage(code)` - 回傳 `assets/img/w${code.padStart(2,'0')}.jpg`，並在 HTML 加入 `onerror` 作為 fallback
- `CITIES` 常數物件 - 定義六都 `{ key, name, bgImage }` 對應

### Step 3: 新增 API 資料轉換函式至 `app.js`
- `transform36HourData(rawData)` - 從 `weatherElement[]` 提取 Wx/PoP/MinT/MaxT/CI，合併為 `forecasts[]` 陣列
- `transform3DayData(rawData)` - 取 `locations.location[0]`（第一個行政區），按日期分組並計算每日最高溫、最低溫、主要天氣代碼

### Step 4: 重寫 `fetchWeather(cityKey)` 函式
修改 `app.js`：
- 使用 `Promise.all()` 同時呼叫 `/api/weather/${cityKey}` 與 `/api/weather/3day/${cityKey}`
- 保留 1.5 秒最低 loading 時間
- 呼叫 `renderHero()` 與 `render3DayForecast()` 分別渲染

### Step 5: 實作 `renderHero(data36h, cityKey)` 函式
修改 `app.js`：
- 動態設定 `.hero-section` 背景為 `url(assets/img/bg-${cityKey}.jpeg)`
- 使用玻璃態卡片顯示當前時段天氣、平均溫度、舒適度 (CI)、穿搭/帶傘建議

### Step 6: 實作 `render3DayForecast(data3day)` 函式
新增至 `app.js`：
- 三欄卡片各顯示：日期標題、`<img src="w{code}.jpg" loading="lazy" onerror="...">`
- 🌡️ 最高/最低溫、💧 降雨機率、😊 舒適度文字

### Step 7: 新增城市切換邏輯
修改 `app.js`：
- 綁定 `.city-btn` 點擊事件，更新 `currentCity` 狀態
- 切換時顯示 loading、重新呼叫 `fetchWeather(newCity)`
- 更新按鈕 `.active` 樣式

### Step 8: 重寫 CSS 為 Kawaii 風格
大幅修改 `style.css`：
- 新增粉彩色系變數 `--kawaii-pink`, `--kawaii-mint`, `--kawaii-lavender`
- `.city-selector` 橫向滾動、pill 按鈕含 hover/active 動畫
- `.hero-section` 全幅背景 + 線性漸層遮罩
- `.forecast-grid` 三欄響應式（手機版改為縱向堆疊）
- 卡片使用 `backdrop-filter: blur()` 玻璃態效果、大圓角、柔和陰影

---

## 檔案修改摘要

| 檔案 | 修改內容 |
|------|----------|
| `index.html` | 重構 DOM 結構：城市選擇器、Hero 容器、三日預報 Grid |
| `assets/js/app.js` | 新增轉換函式、雙 API 整合、城市切換、新渲染邏輯 |
| `assets/css/style.css` | Kawaii 配色、城市選擇器樣式、Hero 背景、三欄 Grid、玻璃態卡片 |

---

## 技術決策

1. **三日 API 區域選擇** - 使用第一個行政區資料（簡化實作）
2. **三日預報溫度顯示** - 顯示每日最高/最低溫
3. **圖片載入優化** - 使用 `loading="lazy"` 延遲載入

---

## API 端點

| 用途 | 端點 |
|------|------|
| 36 小時預報 | `GET /api/weather/:city` |
| 三日預報 | `GET /api/weather/3day/:city` |

## 支援城市

| 路由參數 | 城市名稱 |
|----------|----------|
| `taipei` | 臺北市 |
| `newtaipei` | 新北市 |
| `taoyuan` | 桃園市 |
| `taichung` | 臺中市 |
| `tainan` | 臺南市 |
| `kaohsiung` | 高雄市 |
