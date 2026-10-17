# 将曲栈上传到 GitHub

本地 Git 仓库已经初始化并完成提交。以下步骤从“准备上传”开始；在确认仓库名、许可证和公开范围前，不要直接执行最后的推送。

## 1. 先决定仓库名和公开范围

建议使用的仓库名：

```text
quzhan-local-player
```

仓库名使用 `quzhan-local-player` 比单独的 `quzhan` 更具体，也方便别人从名称直接看出这是本地播放器项目。

首次测试建议先创建 **Private** 仓库；确认 README、截图和许可证没有问题后，再改为 Public。

## 2. 登录 GitHub CLI

```powershell
gh auth login
gh auth status
```

也可以直接使用 GitHub 网页创建空仓库，然后在本地推送。

## 3. 检查本地仓库

```powershell
cd C:\Users\14911\Desktop\曲栈
git status --short
git log --oneline -3
```

如果之后又改过文件，再提交一次：

```powershell
git add .
git commit -m "Update Quzhan"
```

项目中的 `.gitignore` 已排除 `node_modules/`、`dist/`、`release/`、测试数据和临时文件。安装包不应直接提交进 Git，因为单个文件过大，而且 Release 更适合分发二进制。

## 4. 创建空仓库并推送

使用 GitHub CLI：

```powershell
gh repo create quzhan-local-player --private --source=. --remote=origin --push
```

或先在网页创建空仓库，再执行：

```powershell
git remote add origin https://github.com/你的用户名/quzhan-local-player.git
git push -u origin main
```

## 5. 发布 Windows 安装包

把 `release/` 中的安装包和便携版上传到 GitHub Releases，不要提交到普通代码历史：

```powershell
gh release create v0.4.0 `
  "release/Quzhan-Setup-0.4.0-x64.exe" `
  "release/Quzhan-Portable-0.4.0-x64.exe" `
  --title "曲栈 0.4.0" `
  --notes-file RELEASE_NOTES.md
```

如果安装包超过 GitHub 的单文件限制，请继续使用 Release assets，而不是 Git LFS 或把文件放进仓库。

## 6. 填写仓库信息

建议仓库简介：

> A local-first Windows music player with persistent play queues, round-aware shuffle, queue tools, synchronized lyrics, and a real-time spectrum.

建议 Topics：

```text
electron windows music-player local-music lrc lyrics desktop-lyrics
```

## 7. 发布前检查

- [ ] README 中没有使用其他产品、艺人的商标 Logo 或专辑封面。
- [ ] 截图使用自己的测试数据，不包含未授权封面。
- [ ] `THIRD_PARTY_NOTICES.md` 与实际依赖一致。
- [ ] 没有把 API Key、个人 Cookie、测试音乐或本地路径提交到仓库。
- [ ] 明确 README 中 AI 辅助和首次项目声明。
- [ ] 检查仓库名、应用名在目标平台的商标与同名产品情况。
- [ ] 选择与目标一致的许可证；当前仓库采用“保留所有权利”的自定义声明，不自动等同 OSI 开源许可。

## 8. 如果收到侵权投诉

先保留沟通记录，立即下架被具体指出的代码、图片、名称或素材，核实后通过 README 和 Issue 回应。不要在没有核实前公开争论。涉及商标、商业分发或较大金额时，请咨询当地律师。
