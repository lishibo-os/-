# 部署指南

## 本地开发环境部署

### 1. 准备工作

确保已安装以下软件：
- Node.js (>= 14.0.0)
- MongoDB (>= 4.0)
- npm 或 yarn

### 2. 后端部署

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 创建环境变量文件
cp .env.example .env

# 编辑 .env 文件，配置以下内容：
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/lifestyle-sharing
# JWT_SECRET=your-secret-key-here
# NODE_ENV=development

# 初始化数据库（可选）
npm run seed

# 启动服务器
npm start
# 或开发模式（需要安装 nodemon）
npm run dev
```

### 3. 前端部署

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 创建环境变量文件
cp .env.example .env

# 编辑 .env 文件，配置以下内容：
# VITE_API_URL=http://localhost:5000/api

# 启动开发服务器
npm run dev

# 或构建生产版本
npm run build
```

## Docker 部署

### 使用 Docker Compose（推荐）

```bash
# 在项目根目录执行
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止并删除数据
docker-compose down -v
```

访问：
- 前端：http://localhost
- 后端 API：http://localhost:5000/api

### 手动 Docker 部署

```bash
# 创建 Docker 网络
docker network create lifestyle-network

# 启动 MongoDB
docker run -d \
  --name lifestyle-mongodb \
  --network lifestyle-network \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest

# 构建并启动后端
cd backend
docker build -t lifestyle-backend .
docker run -d \
  --name lifestyle-backend \
  --network lifestyle-network \
  -p 5000:5000 \
  -e MONGODB_URI=mongodb://lifestyle-mongodb:27017/lifestyle-sharing \
  -e JWT_SECRET=your-secret-key \
  lifestyle-backend

# 构建并启动前端
cd ../frontend
docker build -t lifestyle-frontend .
docker run -d \
  --name lifestyle-frontend \
  --network lifestyle-network \
  -p 80:80 \
  lifestyle-frontend
```

## 云服务器部署

### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# 启动 MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# 安装 PM2（进程管理器）
sudo npm install -g pm2
```

### 2. 部署后端

```bash
# 上传代码到服务器
# 使用 git clone 或 scp

cd /path/to/project/backend

# 安装依赖
npm install --production

# 配置环境变量
nano .env

# 使用 PM2 启动
pm2 start server.js --name lifestyle-backend
pm2 save
pm2 startup
```

### 3. 部署前端

```bash
cd /path/to/project/frontend

# 安装依赖
npm install

# 构建生产版本
npm run build

# 使用 Nginx 提供静态文件服务
sudo apt install -y nginx

# 配置 Nginx
sudo nano /etc/nginx/sites-available/lifestyle

# 粘贴以下内容：
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/project/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 启用站点
sudo ln -s /etc/nginx/sites-available/lifestyle /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. 配置 SSL（可选但推荐）

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## 环境变量说明

### 后端环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| PORT | 服务器端口 | 5000 |
| MONGODB_URI | MongoDB 连接字符串 | mongodb://localhost:27017/lifestyle-sharing |
| JWT_SECRET | JWT 密钥（生产环境必须修改） | your-random-secret-key |
| NODE_ENV | 运行环境 | development / production |

### 前端环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| VITE_API_URL | 后端 API 地址 | http://localhost:5000/api |

## 数据库初始化

首次部署时，需要初始化数据库分类：

```bash
cd backend
npm run seed
```

这将创建以下默认分类：
- 健康养生
- 美食烹饪
- 家居生活
- 旅行出游
- 职场技能
- 学习教育
- 理财投资
- 人际关系
- 兴趣爱好
- 科技数码

## 维护和监控

### 查看 PM2 进程状态

```bash
pm2 list
pm2 logs lifestyle-backend
pm2 monit
```

### 重启服务

```bash
pm2 restart lifestyle-backend
```

### 备份数据库

```bash
mongodump --db lifestyle-sharing --out /path/to/backup
```

### 恢复数据库

```bash
mongorestore --db lifestyle-sharing /path/to/backup/lifestyle-sharing
```

## 性能优化建议

1. **启用 Gzip 压缩**（Nginx）
2. **配置缓存策略**
3. **使用 CDN** 加速静态资源
4. **优化数据库索引**
5. **启用 MongoDB 副本集**（生产环境）
6. **设置请求速率限制**（防止滥用）

## 安全建议

1. 修改默认的 JWT_SECRET
2. 定期更新依赖包
3. 配置防火墙规则
4. 使用 HTTPS
5. 设置适当的 CORS 策略
6. 定期备份数据
7. 监控系统日志

## 故障排查

### 后端无法启动

1. 检查 MongoDB 是否运行：`sudo systemctl status mongod`
2. 检查环境变量是否正确配置
3. 查看日志：`pm2 logs lifestyle-backend`

### 前端无法连接后端

1. 检查 VITE_API_URL 是否正确
2. 检查后端 CORS 配置
3. 检查防火墙规则

### 数据库连接失败

1. 检查 MongoDB 服务状态
2. 检查 MONGODB_URI 配置
3. 验证网络连接

## 扩展和升级

### 水平扩展

使用负载均衡器（如 Nginx）分发请求到多个后端实例：

```bash
# 启动多个后端实例
pm2 start server.js -i 4 --name lifestyle-backend
```

### 数据库扩展

配置 MongoDB 分片或副本集以提高性能和可用性。

## 移动应用转换

当准备开发移动应用时：

1. 后端 API 已经准备就绪，可直接使用
2. 考虑使用 React Native 或 Flutter
3. 实现推送通知服务
4. 优化移动端的 API 响应大小
5. 实现离线功能和数据同步

## 联系支持

如遇到问题，请通过以下方式寻求帮助：
- 提交 GitHub Issue
- 查看项目文档
- 联系开发团队
