# GitHub仓库配置指南

## 前提条件
1. 拥有GitHub账号（https://github.com）
2. 安装Git（已安装）
3. 配置SSH密钥（推荐）或使用HTTPS

## 步骤1：创建GitHub仓库

1. 登录GitHub
2. 点击右上角"+"号，选择"New repository"
3. 填写仓库信息：
   - Repository name: `ecommerce-workspace`
   - Description: `跨境电商工作台 - 包含事项安排、新闻聚合、产品分析等功能`
   - 选择Public（免费）或Private
   - 勾选"Add a README file"
   - .gitignore模板选择：Node
   - License: MIT License（可选）
4. 点击"Create repository"

## 步骤2：连接本地仓库到GitHub

### 方法A：使用SSH（推荐）
```bash
# 1. 检查是否有SSH密钥
ls -al ~/.ssh

# 2. 如果没有，生成新的SSH密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 3. 将公钥添加到GitHub
# 复制~/.ssh/id_ed25519.pub的内容
# 到GitHub -> Settings -> SSH and GPG keys -> New SSH key

# 4. 测试连接
ssh -T git@github.com

# 5. 添加远程仓库（替换your-username）
git remote add origin git@github.com:your-username/ecommerce-workspace.git
```

### 方法B：使用HTTPS
```bash
# 添加远程仓库（替换your-username）
git remote add origin https://github.com/your-username/ecommerce-workspace.git
```

## 步骤3：推送代码到GitHub

```bash
# 推送代码
git push -u origin master

# 如果推送失败，可能需要先拉取远程仓库的README
git pull origin main --allow-unrelated-histories
git push -u origin master
```

## 步骤4：配置GitHub Pages（可选，用于静态网站托管）

### 方法A：通过GitHub界面
1. 进入仓库页面
2. 点击"Settings"
3. 左侧菜单选择"Pages"
4. Source选择"Deploy from a branch"
5. Branch选择"master"，文件夹选择"/ (root)"
6. 点击"Save"
7. 等待几分钟，访问链接：`https://your-username.github.io/ecommerce-workspace/`

### 方法B：使用GitHub Actions自动部署
1. 在项目根目录创建`.github/workflows/deploy.yml`
2. 添加以下内容：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ master ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

3. 提交并推送代码
4. 在GitHub仓库的"Settings" -> "Pages"中启用GitHub Pages
5. 选择"GitHub Actions"作为Source

## 步骤5：配置自动部署到Vercel（推荐，性能更好）

1. 访问 https://vercel.com
2. 使用GitHub账号登录
3. 点击"New Project"
4. 选择您的GitHub仓库
5. 配置项目：
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. 点击"Deploy"
7. 获得部署链接，如：`https://ecommerce-workspace.vercel.app`

### Vercel自动部署配置
- 每次推送到GitHub的master分支，Vercel会自动重新部署
- 支持预览部署：每个Pull Request都会生成一个预览链接
- 支持自定义域名

## 步骤6：配置自动部署到Netlify（备选方案）

1. 访问 https://netlify.com
2. 使用GitHub账号登录
3. 点击"New site from Git"
4. 选择GitHub仓库
5. 配置构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
6. 点击"Deploy site"

## 常见问题

### Q1: 推送时提示"fatal: remote origin already exists"
```bash
# 删除现有的远程仓库
git remote remove origin

# 重新添加
git remote add origin https://github.com/your-username/ecommerce-workspace.git
```

### Q2: 如何修改Git用户信息？
```bash
# 修改用户名
git config --global user.name "Your Name"

# 修改邮箱
git config --global user.email "your_email@example.com"
```

### Q3: 如何查看远程仓库地址？
```bash
git remote -v
```

### Q4: 如何同步远程仓库的更改？
```bash
git pull origin master
```

## 部署后的访问链接

- **GitHub Pages**: `https://your-username.github.io/ecommerce-workspace/`
- **Vercel**: `https://ecommerce-workspace.vercel.app`
- **Netlify**: `https://your-site-name.netlify.app`

## 推荐方案

**推荐使用Vercel**，原因：
1. 免费额度充足
2. 全球CDN加速，访问速度快
3. 自动部署，代码推送后立即更新
4. 支持预览部署
5. 配置简单，无需额外配置Actions

## 后续步骤

1. 创建GitHub仓库
2. 推送代码到GitHub
3. 选择Vercel或GitHub Pages进行部署
4. 分享链接给同事
5. 如需实时数据同步，考虑接入后端API