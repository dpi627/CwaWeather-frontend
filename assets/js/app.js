// ============================================
// 森森天氣 - Japanese Magazine Kawaii Style
// ============================================

const API_BASE = "https://hex-cwa.zeabur.app/api";

// 六都城市設定
const CITIES = {
    kaohsiung: { name: "高雄市", emoji: "🏙️" },
    taipei: { name: "臺北市", emoji: "🗼" },
    newtaipei: { name: "新北市", emoji: "🌉" },
    taoyuan: { name: "桃園市", emoji: "✈️" },
    taichung: { name: "臺中市", emoji: "🎡" },
    tainan: { name: "臺南市", emoji: "🏯" }
};

// 當前選擇的城市
let currentCity = "kaohsiung";

// ============================================
// 工具函式
// ============================================

/**
 * 安全解析 API 時間格式（解決 Safari 相容性問題）
 * "2025-11-26 06:00:00" → Date 物件
 */
function parseDateTime(str) {
    if (!str) return new Date();
    // 將空格替換為 T，確保 ISO 8601 格式
    return new Date(str.replace(' ', 'T'));
}

/**
 * 根據天氣代碼回傳圖片路徑
 */
function getWeatherImage(code) {
    const paddedCode = String(code || '00').padStart(2, '0');
    return `./assets/img/w${paddedCode}.jpg`;
}

/**
 * 天氣描述轉換為 emoji
 */
function getWeatherEmoji(weather) {
    if (!weather) return "🌤️";
    if (weather.includes("晴")) return "☀️";
    if (weather.includes("多雲")) return "⛅";
    if (weather.includes("陰")) return "☁️";
    if (weather.includes("雨")) return "🌧️";
    if (weather.includes("雷")) return "⛈️";
    return "🌤️";
}

/**
 * 根據降雨機率和溫度生成建議
 */
function getAdvice(rainProb, maxTemp) {
    let rainIcon = "🌂";
    let rainText = "不用帶傘";
    if (parseInt(rainProb) > 30) {
        rainIcon = "☂️";
        rainText = "記得帶傘！";
    }

    let clothIcon = "👕";
    let clothText = "舒適穿搭";
    const temp = parseInt(maxTemp);
    if (temp >= 28) {
        clothIcon = "🎽";
        clothText = "短袖涼爽";
    } else if (temp <= 20) {
        clothIcon = "🧥";
        clothText = "加件外套";
    }

    return { rainIcon, rainText, clothIcon, clothText };
}

/**
 * 時間轉換為時段描述
 */
function getTimePeriod(startTime) {
    const hour = parseDateTime(startTime).getHours();
    if (hour >= 5 && hour < 11) return "早晨";
    if (hour >= 11 && hour < 14) return "中午";
    if (hour >= 14 && hour < 18) return "下午";
    if (hour >= 18 && hour < 23) return "晚上";
    return "深夜";
}

/**
 * 格式化日期為中文顯示
 */
function formatDate(date) {
    const d = parseDateTime(date);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekdays = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];
    return `${month}/${day} ${weekdays[d.getDay()]}`;
}

// ============================================
// API 資料轉換函式
// ============================================

/**
 * 轉換 36 小時預報 API 資料
 * 從 weatherElement[] 多維陣列轉換為 forecasts[] 扁平結構
 */
function transform36HourData(rawData) {
    const location = rawData.location;
    const elements = location.weatherElement;
    
    // 建立 elementName → data 的映射
    const elementMap = {};
    elements.forEach(el => {
        elementMap[el.elementName] = el.time;
    });
    
    // 取得時段數量（以 Wx 為基準）
    const timeCount = elementMap.Wx ? elementMap.Wx.length : 0;
    const forecasts = [];
    
    for (let i = 0; i < timeCount; i++) {
        forecasts.push({
            startTime: elementMap.Wx[i].startTime,
            endTime: elementMap.Wx[i].endTime,
            weather: elementMap.Wx[i].parameter.parameterName,
            weatherCode: elementMap.Wx[i].parameter.parameterValue,
            rain: elementMap.PoP ? elementMap.PoP[i].parameter.parameterName : "0",
            minTemp: elementMap.MinT ? elementMap.MinT[i].parameter.parameterName : "20",
            maxTemp: elementMap.MaxT ? elementMap.MaxT[i].parameter.parameterName : "30",
            comfort: elementMap.CI ? elementMap.CI[i].parameter.parameterName : "舒適"
        });
    }
    
    return {
        city: rawData.city,
        forecasts
    };
}

/**
 * 從 36 小時預報資料生成替代的三日預報
 * 當三日預報 API 失敗時使用
 */
function generate3DayFromFallback(data36h) {
    const forecasts = data36h.forecasts;
    const dailyForecasts = [];
    const processedDates = new Set();
    
    forecasts.forEach((forecast, index) => {
        const date = parseDateTime(forecast.startTime);
        const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        
        if (!processedDates.has(dateKey) && dailyForecasts.length < 3) {
            processedDates.add(dateKey);
            dailyForecasts.push({
                date: forecast.startTime,
                dateFormatted: formatDate(forecast.startTime),
                weather: forecast.weather,
                weatherCode: forecast.weatherCode,
                minTemp: parseInt(forecast.minTemp),
                maxTemp: parseInt(forecast.maxTemp),
                rainProb: parseInt(forecast.rain),
                comfort: forecast.comfort
            });
        }
    });
    
    // 如果不足三天，複製最後一天的資料
    while (dailyForecasts.length < 3 && dailyForecasts.length > 0) {
        const lastDay = dailyForecasts[dailyForecasts.length - 1];
        const nextDate = new Date(parseDateTime(lastDay.date));
        nextDate.setDate(nextDate.getDate() + 1);
        
        dailyForecasts.push({
            ...lastDay,
            date: nextDate.toISOString(),
            dateFormatted: formatDate(nextDate.toISOString())
        });
    }
    
    return {
        city: data36h.city,
        forecasts: dailyForecasts
    };
}

/**
 * 轉換三日預報 API 資料
 * 取第一個行政區，按日期分組並計算每日極值
 */
function transform3DayData(rawData) {
    // 取得第一個行政區的資料
    const locations = rawData.locations;
    const firstDistrict = locations.location[0];
    const districtName = firstDistrict.locationName;
    const elements = firstDistrict.weatherElement;
    
    // 建立 elementName → data 的映射
    const elementMap = {};
    elements.forEach(el => {
        elementMap[el.elementName] = el.time;
    });
    
    // 按日期分組
    const dailyData = {};
    const wxData = elementMap.Wx || [];
    
    wxData.forEach((item, index) => {
        const date = parseDateTime(item.startTime);
        const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        
        if (!dailyData[dateKey]) {
            dailyData[dateKey] = {
                date: item.startTime,
                weathers: [],
                weatherCodes: [],
                temps: [],
                rains: [],
                comforts: []
            };
        }
        
        // 收集天氣描述和代碼
        if (item.elementValue && item.elementValue[0]) {
            dailyData[dateKey].weathers.push(item.elementValue[0].value);
            dailyData[dateKey].weatherCodes.push(item.elementValue[1]?.value || '00');
        }
        
        // 收集溫度（MinT）
        if (elementMap.MinT && elementMap.MinT[index]) {
            const minT = elementMap.MinT[index].elementValue?.[0]?.value;
            if (minT) dailyData[dateKey].temps.push(parseInt(minT));
        }
        
        // 收集溫度（MaxT）
        if (elementMap.MaxT && elementMap.MaxT[index]) {
            const maxT = elementMap.MaxT[index].elementValue?.[0]?.value;
            if (maxT) dailyData[dateKey].temps.push(parseInt(maxT));
        }
        
        // 收集降雨機率
        if (elementMap.PoP12h && elementMap.PoP12h[Math.floor(index / 4)]) {
            const pop = elementMap.PoP12h[Math.floor(index / 4)].elementValue?.[0]?.value;
            if (pop) dailyData[dateKey].rains.push(parseInt(pop));
        }
        
        // 收集舒適度
        if (elementMap.CI && elementMap.CI[index]) {
            const ci = elementMap.CI[index].elementValue?.[0]?.value;
            if (ci) dailyData[dateKey].comforts.push(ci);
        }
    });
    
    // 計算每日統計值
    const dailyForecasts = Object.entries(dailyData)
        .slice(0, 3) // 只取三天
        .map(([key, data]) => {
            const temps = data.temps.length > 0 ? data.temps : [25];
            const rains = data.rains.length > 0 ? data.rains : [0];
            
            return {
                date: data.date,
                dateFormatted: formatDate(data.date),
                weather: data.weathers[Math.floor(data.weathers.length / 2)] || "多雲",
                weatherCode: data.weatherCodes[Math.floor(data.weatherCodes.length / 2)] || "04",
                minTemp: Math.min(...temps),
                maxTemp: Math.max(...temps),
                rainProb: Math.max(...rains),
                comfort: data.comforts[Math.floor(data.comforts.length / 2)] || "舒適"
            };
        });
    
    return {
        city: rawData.city,
        district: districtName,
        forecasts: dailyForecasts
    };
}

// ============================================
// 渲染函式
// ============================================

/**
 * 渲染 Hero 區塊（36 小時預報）
 */
function renderHero(data, cityKey) {
    const heroSection = document.getElementById('heroSection');
    const heroCard = document.getElementById('heroCard');
    const current = data.forecasts[0];
    
    // 設定背景圖片
    heroSection.style.backgroundImage = `url('./assets/img/bg-${cityKey}.jpeg')`;
    
    // 計算平均溫度
    const avgTemp = Math.round((parseInt(current.maxTemp) + parseInt(current.minTemp)) / 2);
    const period = getTimePeriod(current.startTime);
    const advice = getAdvice(current.rain, current.maxTemp);
    
    heroCard.innerHTML = `
        <div class="hero-main">
            <div class="hero-temp-display">
                <span class="hero-emoji">${getWeatherEmoji(current.weather)}</span>
                <span class="hero-temp">${avgTemp}°</span>
            </div>
            <div class="hero-weather-desc">${current.weather}</div>
            <div class="hero-temp-range">
                <span>🌡️ ${current.minTemp}° ~ ${current.maxTemp}°</span>
            </div>
        </div>
        
        <div class="hero-comfort">
            <span class="comfort-badge">😊 ${current.comfort}</span>
        </div>
        
        <div class="hero-advice">
            <div class="advice-card">
                <span class="advice-icon">${advice.rainIcon}</span>
                <span class="advice-text">${advice.rainText}</span>
                <span class="advice-detail">💧 ${current.rain}%</span>
            </div>
            <div class="advice-card">
                <span class="advice-icon">${advice.clothIcon}</span>
                <span class="advice-text">${advice.clothText}</span>
                <span class="advice-detail">🌡️ ${current.maxTemp}°</span>
            </div>
        </div>
    `;
}

/**
 * 渲染三日預報
 */
function render3DayForecast(data) {
    const grid = document.getElementById('forecastGrid');
    
    if (!data.forecasts || data.forecasts.length === 0) {
        grid.innerHTML = '<p class="no-data">暫無預報資料</p>';
        return;
    }
    
    grid.innerHTML = data.forecasts.map((day, index) => {
        const dayLabel = index === 0 ? '今天' : index === 1 ? '明天' : '後天';
        const imgSrc = getWeatherImage(day.weatherCode);
        
        return `
            <div class="forecast-card">
                <div class="forecast-day">${dayLabel}</div>
                <div class="forecast-date">${day.dateFormatted}</div>
                
                <div class="forecast-img-container">
                    <img 
                        src="${imgSrc}" 
                        alt="${day.weather}"
                        class="forecast-img"
                        loading="lazy"
                        onerror="this.onerror=null; this.src='./assets/img/w00.jpg';"
                    />
                </div>
                
                <div class="forecast-weather">
                    <span class="weather-emoji">${getWeatherEmoji(day.weather)}</span>
                    <span class="weather-text">${day.weather}</span>
                </div>
                
                <div class="forecast-details">
                    <div class="detail-row">
                        <span class="detail-icon">🌡️</span>
                        <span class="detail-label">溫度</span>
                        <span class="detail-value">${day.minTemp}° ~ ${day.maxTemp}°</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-icon">💧</span>
                        <span class="detail-label">降雨</span>
                        <span class="detail-value">${day.rainProb}%</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-icon">😊</span>
                        <span class="detail-label">體感</span>
                        <span class="detail-value">${day.comfort}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * 更新頁面日期顯示
 */
function updateHeaderDate() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const days = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];
    document.getElementById('updateTime').textContent = `${month}月${date}日 ${days[now.getDay()]}`;
}

// ============================================
// API 請求與主流程
// ============================================

/**
 * 獲取天氣資料（同時請求 36 小時與三日預報）
 */
async function fetchWeather(cityKey = currentCity) {
    try {
        // 顯示 loading
        document.getElementById('loading').style.display = 'flex';
        document.getElementById('mainContent').style.display = 'none';
        
        // 最低顯示 loading 1.5 秒
        const delayPromise = new Promise(resolve => setTimeout(resolve, 1500));
        
        // 同時請求兩個 API
        const fetch36h = fetch(`${API_BASE}/weather/${cityKey}`).then(res => res.json());
        const fetch3day = fetch(`${API_BASE}/weather/3day/${cityKey}`).then(res => res.json());
        
        // 等待所有請求完成
        const [_, data36h, data3day] = await Promise.all([delayPromise, fetch36h, fetch3day]);
        
        if (!data36h.success) {
            throw new Error("36小時預報 API 錯誤");
        }
        
        // 轉換資料格式
        const transformed36h = transform36HourData(data36h.data);
        
        let transformed3day = { forecasts: [] };
        if (data3day.success && data3day.data) {
            try {
                transformed3day = transform3DayData(data3day.data);
            } catch (e) {
                console.warn("三日預報資料轉換失敗，使用替代方案", e);
                transformed3day = generate3DayFromFallback(transformed36h);
            }
        } else {
            // 三日預報 API 失敗，使用 36 小時資料生成替代
            console.warn("三日預報 API 失敗，使用 36 小時資料替代");
            transformed3day = generate3DayFromFallback(transformed36h);
        }
        
        // 渲染頁面
        renderHero(transformed36h, cityKey);
        render3DayForecast(transformed3day);
        updateHeaderDate();
        
        // 隱藏 loading，顯示主內容
        document.getElementById('loading').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        
    } catch (e) {
        console.error(e);
        alert("天氣資料讀取失敗，狸克把網路線咬斷了！🦝");
        document.getElementById('loading').style.display = 'none';
    }
}

/**
 * 切換城市
 */
function switchCity(cityKey) {
    if (cityKey === currentCity) return;
    
    currentCity = cityKey;
    
    // 更新按鈕狀態
    document.querySelectorAll('.city-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.city === cityKey);
    });
    
    // 重新載入資料
    fetchWeather(cityKey);
}

/**
 * 初始化城市選擇器事件
 */
function initCitySelector() {
    document.querySelectorAll('.city-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchCity(btn.dataset.city);
        });
    });
}

// ============================================
// 頁面初始化
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    initCitySelector();
    fetchWeather(currentCity);
});
