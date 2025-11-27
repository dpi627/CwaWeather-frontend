---
agent: agent
model: Claude Haiku 4.5
description: This prompt is used to create a commit message for changes made to the codebase.
---
- base on git staged files, create a concise commit message then goto requirements
- if no staged changes, read whole chages then goto requirements
- if no changes detected, respond with "No changes to commit."

## requirements:
- the message should summarize the changes made in the codebase
- the message should be in zh-TW
- user conventional commit format
- place a emoji in front of the description according to the type of change:
  - feat: ✨
  - fix: 🐛
  - docs: 📝
  - style: 🎨
  - refactor: 🏠
  - perf: ⚡️
  - test: 🔧
  - chore: 🪣
- do commit with message

```sh
git commit -m "<type>(<scope>): <emoji> <description>"
```