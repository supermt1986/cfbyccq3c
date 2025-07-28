#!/bin/bash

# 购物车功能测试脚本

echo "开始测试购物车功能..."

# 1. 添加商品到购物车
echo "1. 添加商品到购物车..."
curl -s -X POST http://localhost:8788/api/cart/add \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "productId": 1, "quantity": 2}' | jq .

# 2. 检查购物车内容
echo "2. 检查购物车内容..."
curl -s -X GET "http://localhost:8788/api/cart?userId=1" | jq .

# 3. 更新购物车中商品的数量
echo "3. 更新购物车中商品的数量..."
curl -s -X POST http://localhost:8788/api/cart/update \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "productId": 1, "quantity": 5}' | jq .

# 4. 再次检查购物车内容
echo "4. 再次检查购物车内容..."
curl -s -X GET "http://localhost:8788/api/cart?userId=1" | jq .

# 5. 添加另一个商品到购物车
echo "5. 添加另一个商品到购物车..."
curl -s -X POST http://localhost:8788/api/cart/add \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "productId": 2, "quantity": 3}' | jq .

# 6. 检查购物车内容（应该有两个商品）
echo "6. 检查购物车内容（应该有两个商品）..."
curl -s -X GET "http://localhost:8788/api/cart?userId=1" | jq .

# 7. 从购物车中移除一个商品
echo "7. 从购物车中移除一个商品..."
curl -s -X POST http://localhost:8788/api/cart/remove \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "productId": 1}' | jq .

# 8. 检查购物车内容（应该只剩一个商品）
echo "8. 检查购物车内容（应该只剩一个商品）..."
curl -s -X GET "http://localhost:8788/api/cart?userId=1" | jq .

# 9. 清空购物车
echo "9. 清空购物车..."
curl -s -X POST http://localhost:8788/api/cart/clear \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}' | jq .

# 10. 最后检查购物车内容（应该为空）
echo "10. 最后检查购物车内容（应该为空）..."
curl -s -X GET "http://localhost:8788/api/cart?userId=1" | jq .

echo "购物车功能测试完成！"