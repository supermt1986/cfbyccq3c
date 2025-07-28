#!/bin/bash

# 测试注册API
echo "测试注册API..."
curl -X POST http://localhost:8788/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

echo -e "\n"

# 测试登录API
echo "测试登录API..."
curl -X POST http://localhost:8788/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

echo -e "\n"

# 测试获取商品列表
echo "测试获取商品列表..."
curl -X GET http://localhost:8788/api/products

echo -e "\n"

# 测试添加商品到购物车
echo "测试添加商品到购物车..."
curl -X POST http://localhost:8788/api/cart/add \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "productId": 1,
    "quantity": 2
  }'

echo -e "\n"

# 测试获取购物车内容
echo "测试获取购物车内容..."
curl -X GET "http://localhost:8788/api/cart?userId=1"

echo -e "\n"

# 测试创建订单
echo "测试创建订单..."
curl -X POST http://localhost:8788/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "items": [
      {
        "productId": 1,
        "quantity": 2
      }
    ],
    "shippingAddress": "北京市朝阳区示例街道123号",
    "paymentMethod": "在线支付"
  }'

echo -e "\n"

# 测试获取订单列表
echo "测试获取订单列表..."
curl -X GET "http://localhost:8788/api/orders?userId=1"

echo -e "\n"