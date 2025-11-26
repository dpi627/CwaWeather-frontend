# 森森天氣 - Copilot Instructions

## 專案概述

這是一個單頁式天氣預報應用程式，風格模仿「動物森友會」遊戲的 UI 設計。純前端靜態網站，無建置流程。

## 架構

- **單一檔案架構**：所有 HTML、CSS、JavaScript 都在 `index.html` 中
- **外部 API 依賴**：`https://hex-cwa.zeabur.app/api/weather/kaohsiung` 提供高雄天氣資料
- **無框架**：純 Vanilla JavaScript，無需 npm 或建置工具

## 程式碼慣例

### CSS 變數 (`:root`)
所有顏色使用 `--ac-*` 前綴的 CSS 變數，代表 Animal Crossing 風格：
```css
--ac-green: #7DE1A9;    /* 主背景色 */
--ac-cream: #FFFEF2;    /* 卡片背景 */
--ac-yellow: #F9F195;   /* 強調色 */
--ac-brown: #796452;    /* 文字色 */
```

### JavaScript 函式結構
- `getWeatherIcon(weather)` - 天氣描述轉換為 emoji
- `getAdvice(rainProb, maxTemp)` - 根據天氣生成穿搭/帶傘建議
- `getTimePeriod(startTime)` - 時間轉換為「早晨/中午/下午/晚上」
- `renderWeather(data)` - 主渲染邏輯，更新 DOM
- `fetchWeather()` - API 呼叫入口

### UI 元件命名
- `.hero-*` - 主卡片相關元素
- `.mini-*` - 稍後預報的小卡片
- `.advice-*` - 穿搭/雨具建議區塊

## 開發方式

1. 直接用瀏覽器開啟 `index.html` 即可預覽
2. 或使用 VS Code Live Server 擴充功能

## API 回應格式

```json
{
  "success": true,
  "data": {
    "forecasts": [
      {
        "startTime": "2025-01-01T06:00:00",
        "weather": "多雲時晴",
        "rain": "10%",
        "minTemp": "18",
        "maxTemp": "25"
      }
    ]
  }
}
```

## 修改注意事項

- 修改顏色時請使用 CSS 變數，維持一致性
- emoji 圖示在 `getWeatherIcon()` 中集中管理
- Loading 畫面需保持最少 1.5 秒顯示（UX 設計）
