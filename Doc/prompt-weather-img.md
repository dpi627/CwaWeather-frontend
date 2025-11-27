請依照天氣代碼與建議屬性

```
天氣代碼 (Wx),天氣描述範例,建議寶可夢屬性,代表色 (HEX),對應理由
"01, 02",晴天、晴時多雲,🔥 火 (Fire),#F08030,陽光強烈，如同火系招式「大晴天」。
"03, 04",多雲時晴、多雲,🌿 草 (Grass),#78C850,氣候宜人，適合植物生長，視覺舒適。
"05, 06",多雲時陰、陰時多雲,⚪ 一般 (Normal),#A8A878,平淡無奇的天氣，沒有強烈特徵。
07,陰天,👻 幽靈 (Ghost),#705898,光線灰暗，氣氛較為沈悶陰森。
"08, 11, 19",短暫雨、午後短暫雨,💧 水 (Water),#6890F0,直接對應降雨，邏輯最直觀。
"15, 18",雷陣雨,⚡ 電 (Electric),#F8D030,伴隨雷擊，視覺上需要強烈的黃色警示。
```

參考以下提示詞模板

```
task: Choose one Pokémon for the weather-related terms and depict it accordingly.

pose: Exaggerated, dynamic, powerful
background: Plain white, suitable for background removal
content: Only the Pokémon itself, no text, no extra elements
aspect ratio: 1:1
style: japanese magazine kawaii

屬性: 火
term: 晴天
```

產生所有代碼對應的提示詞，新增一個 emotion:
依照天氣生成對應的 emotion 與 pose
其餘條件不變，替換屬性與 term 即可