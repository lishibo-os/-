# API 文档

## 基础信息

- **Base URL**: `http://localhost:5000/api`
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token (JWT)

## 认证

大多数 API 端点需要认证。在请求头中包含 JWT token：

```
Authorization: Bearer <your-jwt-token>
```

---

## 认证接口

### 用户注册

**POST** `/auth/register`

注册新用户账号。

**请求体**:
```json
{
  "username": "string (3-30字符)",
  "email": "string (有效邮箱)",
  "password": "string (至少6字符)"
}
```

**响应**:
```json
{
  "message": "注册成功",
  "token": "jwt-token-string",
  "user": {
    "id": "user-id",
    "username": "username",
    "email": "email@example.com",
    "avatar": "avatar-url"
  }
}
```

### 用户登录

**POST** `/auth/login`

用户登录获取 token。

**请求体**:
```json
{
  "email": "string",
  "password": "string"
}
```

**响应**:
```json
{
  "message": "登录成功",
  "token": "jwt-token-string",
  "user": {
    "id": "user-id",
    "username": "username",
    "email": "email@example.com",
    "avatar": "avatar-url"
  }
}
```

---

## 用户接口

### 获取当前用户信息

**GET** `/users/me`

需要认证。

**响应**:
```json
{
  "_id": "user-id",
  "username": "username",
  "email": "email@example.com",
  "avatar": "avatar-url",
  "bio": "用户简介",
  "followers": [],
  "following": [],
  "savedPosts": [],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 获取用户信息

**GET** `/users/:id`

**响应**: 同上

### 更新用户资料

**PUT** `/users/me`

需要认证。

**请求体**:
```json
{
  "bio": "string (可选)",
  "avatar": "string (可选)"
}
```

### 关注用户

**POST** `/users/:id/follow`

需要认证。

**响应**:
```json
{
  "message": "关注成功"
}
```

### 取消关注

**POST** `/users/:id/unfollow`

需要认证。

**响应**:
```json
{
  "message": "取消关注成功"
}
```

---

## 文章接口

### 获取文章列表

**GET** `/posts`

**查询参数**:
- `page` (number, 默认: 1) - 页码
- `limit` (number, 默认: 10) - 每页数量
- `category` (string, 可选) - 分类 ID
- `search` (string, 可选) - 搜索关键词
- `tag` (string, 可选) - 标签

**响应**:
```json
{
  "posts": [
    {
      "_id": "post-id",
      "title": "文章标题",
      "content": "文章内容",
      "author": {
        "_id": "user-id",
        "username": "username",
        "avatar": "avatar-url"
      },
      "category": {
        "_id": "category-id",
        "name": "分类名称",
        "icon": "📝"
      },
      "tags": ["标签1", "标签2"],
      "likes": [],
      "views": 0,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "currentPage": 1,
  "totalPages": 5,
  "totalPosts": 50
}
```

### 获取文章详情

**GET** `/posts/:id`

**响应**:
```json
{
  "_id": "post-id",
  "title": "文章标题",
  "content": "文章内容（Markdown）",
  "author": {
    "_id": "user-id",
    "username": "username",
    "avatar": "avatar-url",
    "bio": "作者简介"
  },
  "category": {
    "_id": "category-id",
    "name": "分类名称",
    "icon": "📝"
  },
  "tags": ["标签1", "标签2"],
  "images": [],
  "likes": [],
  "views": 100,
  "forkedFrom": null,
  "forks": [],
  "editHistory": [],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 创建文章

**POST** `/posts`

需要认证。

**请求体**:
```json
{
  "title": "string (必填)",
  "content": "string (必填)",
  "category": "category-id (必填)",
  "tags": ["string"],
  "images": ["image-url"]
}
```

**响应**: 返回创建的文章对象

### 更新文章

**PUT** `/posts/:id`

需要认证，且只能更新自己的文章。

**请求体**: 同创建文章

**响应**: 返回更新后的文章对象

### 删除文章

**DELETE** `/posts/:id`

需要认证，且只能删除自己的文章。

**响应**:
```json
{
  "message": "文章已删除"
}
```

### 点赞/取消点赞

**POST** `/posts/:id/like`

需要认证。

**响应**:
```json
{
  "message": "点赞成功",
  "liked": true,
  "likesCount": 10
}
```

### 转载文章

**POST** `/posts/:id/fork`

需要认证。

**响应**: 返回转载后的文章对象

### 收藏/取消收藏

**POST** `/posts/:id/save`

需要认证。

**响应**:
```json
{
  "message": "收藏成功",
  "saved": true
}
```

---

## 分类接口

### 获取所有分类

**GET** `/categories`

**响应**:
```json
[
  {
    "_id": "category-id",
    "name": "分类名称",
    "description": "分类描述",
    "icon": "📝",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### 获取单个分类

**GET** `/categories/:id`

**响应**: 返回单个分类对象

### 创建分类

**POST** `/categories`

需要认证。

**请求体**:
```json
{
  "name": "string (必填)",
  "description": "string (可选)",
  "icon": "string (可选，默认: 📝)"
}
```

---

## 评论接口

### 获取文章评论

**GET** `/comments/post/:postId`

**响应**:
```json
[
  {
    "_id": "comment-id",
    "content": "评论内容",
    "author": {
      "_id": "user-id",
      "username": "username",
      "avatar": "avatar-url"
    },
    "post": "post-id",
    "parentComment": null,
    "likes": [],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### 创建评论

**POST** `/comments`

需要认证。

**请求体**:
```json
{
  "content": "string (必填)",
  "post": "post-id (必填)",
  "parentComment": "comment-id (可选)"
}
```

### 删除评论

**DELETE** `/comments/:id`

需要认证，且只能删除自己的评论。

**响应**:
```json
{
  "message": "评论已删除"
}
```

### 点赞评论

**POST** `/comments/:id/like`

需要认证。

**响应**:
```json
{
  "message": "点赞成功",
  "liked": true,
  "likesCount": 5
}
```

---

## 错误响应

所有错误响应遵循以下格式：

```json
{
  "message": "错误描述",
  "errors": [
    {
      "field": "字段名",
      "message": "错误信息"
    }
  ]
}
```

### 常见错误码

- `400 Bad Request` - 请求参数错误
- `401 Unauthorized` - 未授权，需要登录
- `403 Forbidden` - 禁止访问，权限不足
- `404 Not Found` - 资源不存在
- `500 Internal Server Error` - 服务器错误

---

## 使用示例

### JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 设置认证 token
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// 获取文章列表
const posts = await api.get('/posts?page=1&limit=10');

// 创建文章
const newPost = await api.post('/posts', {
  title: '我的经验',
  content: '这是内容',
  category: 'category-id',
  tags: ['标签1']
});
```

### cURL

```bash
# 注册
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"123456"}'

# 获取文章
curl http://localhost:5000/api/posts

# 创建文章（需要 token）
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"标题","content":"内容","category":"category-id"}'
```

---

## 速率限制

目前没有实施速率限制，但建议：
- 登录/注册：每分钟最多 5 次
- 其他 API：每分钟最多 60 次

## Webhook（计划中）

未来版本将支持 webhook，用于以下事件：
- 新文章发布
- 收到评论
- 被关注
- 文章被点赞

---

更多信息请参考项目 README 和源代码。
