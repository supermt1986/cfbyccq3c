# Cloudflare Worker 商城系统

这是一个基于 Cloudflare Worker 和 D1 数据库的简单商城系统。

## 功能特性

- 用户注册和登录
- 美观的响应式界面
- 使用 Cloudflare D1 数据库存储用户信息

## 快速开始

1. 安装依赖：
   ```
   npm install
   ```

2. 创建数据库表：
   ```
   npx wrangler d1 execute shop_db --local --file=./schema.sql
   ```

3. 启动开发服务器：
   ```
   npm run dev
   ```

4. 在浏览器中访问 `http://localhost:8787` 查看应用

## 部署到 Cloudflare

1. 创建 Cloudflare D1 数据库：
   ```
   npx wrangler d1 create shop_db
   ```

2. 更新 `wrangler.toml` 中的数据库配置

3. 创建数据库表：
   ```
   npx wrangler d1 execute shop_db --file=./schema.sql
   ```

4. 部署应用：
   ```
   npm run deploy
   ```

## API 接口

### 注册
- URL: `/api/register`
- 方法: `POST`
- 参数:
  - `username`: 用户名
  - `email`: 邮箱
  - `password`: 密码

### 登录
- URL: `/api/login`
- 方法: `POST`
- 参数:
  - `email`: 邮箱
  - `password`: 密码

## 文件结构

- `src/index.js`: 应用入口文件
- `src/routes/auth.js`: 认证相关路由处理
- `src/static/`: 静态文件（HTML, CSS, JS）
- `schema.sql`: 数据库表结构
- `wrangler.toml`: Wrangler 配置文件