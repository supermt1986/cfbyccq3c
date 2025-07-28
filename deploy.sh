#!/bin/bash

# 部署脚本 - 按照CLAUDE.md中的规则进行测试和部署

echo "开始部署流程..."

# 1. 运行测试
echo "1. 运行测试..."
node test.js
if [ $? -ne 0 ]; then
    echo "测试失败，停止部署"
    exit 1
fi
echo "测试通过"

# 2. 检查代码格式化（如果项目使用了代码格式化工具）
# echo "2. 检查代码格式化..."
# npm run format 2>/dev/null || echo "未找到格式化脚本，跳过此步骤"

# 3. 构建项目（如果需要）
# echo "3. 构建项目..."
# npm run build 2>/dev/null || echo "未找到构建脚本，跳过此步骤"

# 4. 部署到Cloudflare
echo "4. 部署到Cloudflare..."
npx wrangler deploy
if [ $? -ne 0 ]; then
    echo "部署失败"
    exit 1
fi
echo "部署成功"

# 5. 提交到GitHub（需要先配置Git）
echo "5. 提交到GitHub..."
git add .
git commit -m "部署订单管理功能 🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>" || echo "提交失败，可能没有更改需要提交"

# 推送到远程仓库
git push origin main 2>/dev/null || echo "推送失败，可能没有配置远程仓库"

echo "部署流程完成！"