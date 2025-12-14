# 快速开始指南

本指南帮助你在 5 分钟内启动生活经验分享平台。

## 方法一：使用 Docker（推荐）

最简单的方式是使用 Docker Compose：

```bash
# 1. 克隆仓库
git clone <repository-url>
cd -

# 2. 启动所有服务
docker-compose up -d

# 3. 等待服务启动（约 30 秒）

# 4. 访问应用
# 前端: http://localhost
# 后端 API: http://localhost:5000/api
```

就这么简单！应用已经在运行了。

### 停止服务

```bash
docker-compose down
```

---

## 方法二：本地开发

### 前置要求

- Node.js >= 14.0
- MongoDB >= 4.0

### 快速启动

```bash
# 1. 克隆仓库
git clone <repository-url>
cd -

# 2. 启动 MongoDB（如果还没启动）
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Windows: 运行 MongoDB 服务

# 3. 后端设置
cd backend
npm install
cp .env.example .env
# 编辑 .env，设置 JWT_SECRET
npm run seed    # 初始化数据库分类
npm start       # 启动后端服务器

# 4. 前端设置（新终端窗口）
cd frontend
npm install
cp .env.example .env
npm run dev     # 启动前端开发服务器

# 5. 访问应用
# 前端: http://localhost:5173
# 后端: http://localhost:5000/api
```

---

## 首次使用

### 1. 注册账号

访问 http://localhost:5173，点击"注册"按钮：
- 用户名：至少 3 个字符
- 邮箱：有效的邮箱地址
- 密码：至少 6 个字符

### 2. 浏览内容

- 首页显示所有文章
- 点击分类按钮筛选内容
- 使用搜索框查找特定内容

### 3. 发布经验

登录后：
1. 点击导航栏的"发布经验"
2. 填写标题和选择分类
3. 使用 Markdown 格式编写内容
4. 添加标签（可选）
5. 点击"发布"

### 4. 互动功能

- ❤️ 点赞文章
- ⭐ 收藏文章
- 🔀 转载文章
- 💬 发表评论
- 👥 关注用户

---

## Markdown 使用示例

在发布文章时，可以使用 Markdown 格式：

```markdown
# 标题一
## 标题二

**加粗文本**
*斜体文本*

- 列表项 1
- 列表项 2

1. 有序列表 1
2. 有序列表 2

[链接](https://example.com)

代码块：
```
代码内容
```
```

---

## 测试 API

使用 curl 测试 API：

```bash
# 健康检查
curl http://localhost:5000/api/health

# 获取分类
curl http://localhost:5000/api/categories

# 注册用户
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "123456"
  }'

# 登录
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

---

## 默认数据

运行 `npm run seed` 后，数据库将包含以下默认分类：

- 💪 健康养生
- 🍳 美食烹饪
- 🏠 家居生活
- ✈️ 旅行出游
- 💼 职场技能
- 📚 学习教育
- 💰 理财投资
- 👥 人际关系
- 🎨 兴趣爱好
- 💻 科技数码

---

## 常见问题

### 无法连接 MongoDB

**问题**：后端启动失败，显示 MongoDB 连接错误

**解决**：
1. 确保 MongoDB 正在运行
2. 检查 `.env` 文件中的 `MONGODB_URI`
3. 默认连接：`mongodb://localhost:27017/lifestyle-sharing`

### 前端无法连接后端

**问题**：前端请求 API 失败

**解决**：
1. 确保后端服务器在运行（端口 5000）
2. 检查 `frontend/.env` 中的 `VITE_API_URL`
3. 检查浏览器控制台的错误信息

### 端口已被占用

**问题**：端口 5000 或 5173 已被使用

**解决**：
1. 修改 `backend/.env` 中的 `PORT`
2. 或停止占用端口的其他服务

---

## 下一步

- 📖 阅读完整 [README.md](./README.md)
- 🚀 查看 [部署指南](./DEPLOYMENT.md)
- 🔌 浏览 [API 文档](./API.md)
- 🤝 了解 [贡献指南](./CONTRIBUTING.md)

---

## 开发工具推荐

- **API 测试**：Postman 或 Insomnia
- **数据库管理**：MongoDB Compass
- **代码编辑器**：VS Code
- **Git 客户端**：Git CLI 或 GitHub Desktop

---

## 获取帮助

遇到问题？

1. 查看 [常见问题](#常见问题)
2. 搜索现有 [Issues](../../issues)
3. 创建新的 [Issue](../../issues/new)

祝你使用愉快！ 🎉
