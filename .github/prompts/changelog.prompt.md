---
agent: agent
model: Claude Haiku 4.5
description: This prompt is used to create a changelog entry for documentation updates.
---
- 取得當下日期與目前時間

```pwoershell
$now = Get-Date
$timestamp = $now.ToString("yyyyMMddHHmmss")
```

- 請將此次修改進行簡短摘要，包含以下欄位
  - 時間，格式為 yyyy-MM-dd HH:mm:ss
  - 標題，請勿超過 20 個字
  - 內容，請勿超過 50 個字
- 優先讀取 stage 區域的變更，若無則讀取 changes
- 內容均使用 zh-TW 撰寫
- 寫入 doc\changelog
- 使用 yyyyMMddHHmmss.md 命名