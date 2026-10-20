# ucaszyp 的个人主页

一个轻量、支持手机浏览的学术主页。无需安装依赖，也无需运行构建工具。

## 今晚从哪里开始填

所有个人资料集中在 **[content.js](content.js)**。

1. 在 GitHub 打开 `content.js`，点击铅笔按钮编辑。
2. 修改姓名 `name`、中文名 `nameChinese`、单位 `affiliation`、简介 `introduction` 和 `about`。
3. 填写邮箱 `email`、学术主页 `scholar`；不需要的字段保持空字符串 `""`。
4. 参照文件内注释，添加论文 `publications`、动态 `news`、教育或工作经历 `experience`。
5. 点击 **Commit changes**，提交到 `main`。GitHub Pages 会自动更新。

请只填写准备公开的内容。示例中的论文、职位和单位没有预填，现有项目链接来自账号公开仓库。

## 照片与简历

- 把照片上传为 `assets/photo.jpg`，将 `photo` 改成 `"assets/photo.jpg"`。
- 把简历上传为 `assets/cv.pdf`，将 `cv` 改成 `"assets/cv.pdf"`。
- 照片最好使用方形或竖版裁切。未设置照片时显示姓名首字母。

## 填写示例

```javascript
publications: [
  {
    title: "你的论文标题",
    authors: "你的姓名, 合作者姓名",
    venue: "会议名称 · 2026",
    description: "用一句话介绍主要贡献。",
    links: [
      { label: "Paper", url: "https://arxiv.org/abs/替换为论文编号" },
      { label: "Code", url: "https://github.com/ucaszyp/替换为仓库名" },
    ],
  },
],
```

保留英文引号、逗号和括号；每篇论文是一个 `{ ... }`，不同论文之间用逗号分隔。
文本会以纯文本显示，不需要写 HTML。

## GitHub Pages 首次发布

1. 在 `ucaszyp` 账号下创建公开仓库 **ucaszyp.github.io**。
2. 把本目录中的 `index.html`、`style.css`、`app.js`、`content.js`、`.nojekyll`、`assets` 和本说明上传到仓库根目录。
3. 打开 **Settings → Pages**。
4. Source 选择 **Deploy from a branch**。
5. Branch 选择 **main**，目录选择 **/(root)**，点击 **Save**。
6. 等待 Pages 部署成功后，访问 **https://ucaszyp.github.io/**。

此地址只有在仓库创建且 Pages 部署完成后才可访问。

## 本地预览

直接双击 `index.html` 即可浏览。也可在本目录运行 `node preview.mjs`，
然后访问终端显示的本地地址。

## 文件说明

| 文件 | 用途 |
| --- | --- |
| `content.js` | 你日常填写和更新的内容 |
| `index.html` | 主页结构 |
| `style.css` | 颜色、字体和响应式排版 |
| `app.js` | 将内容渲染到页面 |
| `assets/` | 照片、简历等公开素材 |

动态和经历在尚未填写时自动隐藏；论文区保留整理中的提示。
