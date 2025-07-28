import { Router } from 'itty-router';
import { registerUser, loginUser } from './routes/auth.js';

// Create a new router
const router = Router();

// Handle registration
router.post('/api/register', registerUser);

// Handle login
router.post('/api/login', loginUser);

// Serve static files for the frontend
router.get('/', () => {
  return new Response(htmlTemplate, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
});

router.get('/static/:filename', ({ params }) => {
  const { filename } = params;
  
  if (filename === 'style.css') {
    return new Response(cssTemplate, {
      headers: {
        'Content-Type': 'text/css',
      },
    });
  }
  
  if (filename === 'script.js') {
    return new Response(jsTemplate, {
      headers: {
        'Content-Type': 'application/javascript',
      },
    });
  }
  
  return new Response('File not found', { status: 404 });
});

// 404 handler
router.all('*', () => new Response('Not Found', { status: 404 }));

export default {
  async fetch(request, env) {
    return router.handle(request, env);
  }
};

// HTML template
const htmlTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>商城系统 - 登录/注册</title>
    <link rel="stylesheet" href="/static/style.css">
</head>
<body>
    <div class="container">
        <div class="form-container">
            <div class="form-header">
                <h2>欢迎来到商城系统</h2>
                <div class="tab">
                    <button class="tab-button active" onclick="showForm('login')">登录</button>
                    <button class="tab-button" onclick="showForm('register')">注册</button>
                </div>
            </div>
            
            <!-- 登录表单 -->
            <form id="login-form" class="form active">
                <div class="input-group">
                    <label for="login-email">邮箱</label>
                    <input type="email" id="login-email" required>
                </div>
                <div class="input-group">
                    <label for="login-password">密码</label>
                    <input type="password" id="login-password" required>
                </div>
                <button type="submit" class="submit-btn">登录</button>
                <div class="form-footer">
                    <a href="#" onclick="showForm('register')">还没有账户？立即注册</a>
                </div>
            </form>
            
            <!-- 注册表单 -->
            <form id="register-form" class="form">
                <div class="input-group">
                    <label for="register-username">用户名</label>
                    <input type="text" id="register-username" required>
                </div>
                <div class="input-group">
                    <label for="register-email">邮箱</label>
                    <input type="email" id="register-email" required>
                </div>
                <div class="input-group">
                    <label for="register-password">密码</label>
                    <input type="password" id="register-password" required>
                </div>
                <div class="input-group">
                    <label for="register-confirm-password">确认密码</label>
                    <input type="password" id="register-confirm-password" required>
                </div>
                <button type="submit" class="submit-btn">注册</button>
                <div class="form-footer">
                    <a href="#" onclick="showForm('login')">已有账户？立即登录</a>
                </div>
            </form>
        </div>
    </div>
    
    <script src="/static/script.js"></script>
</body>
</html>`;

// CSS template
const cssTemplate = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    width: 100%;
    max-width: 400px;
    padding: 20px;
}

.form-container {
    background: white;
    border-radius: 10px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.form-header {
    padding: 30px;
    text-align: center;
    background: #f8f9fa;
}

.form-header h2 {
    color: #333;
    margin-bottom: 20px;
}

.tab {
    display: flex;
    border-radius: 25px;
    background: #e9ecef;
    padding: 5px;
}

.tab-button {
    flex: 1;
    border: none;
    padding: 10px;
    border-radius: 20px;
    cursor: pointer;
    background: transparent;
    transition: all 0.3s ease;
    font-weight: 500;
}

.tab-button.active {
    background: #667eea;
    color: white;
}

.form {
    display: none;
    padding: 30px;
    animation: fadeIn 0.5s ease;
}

.form.active {
    display: block;
}

.input-group {
    margin-bottom: 20px;
}

.input-group label {
    display: block;
    margin-bottom: 8px;
    color: #555;
    font-weight: 500;
}

.input-group input {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
    transition: border-color 0.3s;
}

.input-group input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.submit-btn {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
}

.submit-btn:hover {
    transform: translateY(-2px);
}

.submit-btn:active {
    transform: translateY(0);
}

.form-footer {
    text-align: center;
    margin-top: 20px;
}

.form-footer a {
    color: #667eea;
    text-decoration: none;
    font-size: 14px;
}

.form-footer a:hover {
    text-decoration: underline;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 响应式设计 */
@media (max-width: 480px) {
    .container {
        padding: 10px;
    }
    
    .form-header, .form {
        padding: 20px;
    }
}`;

// JavaScript template
const jsTemplate = `// 切换表单显示
function showForm(formType) {
    // 隐藏所有表单
    document.querySelectorAll('.form').forEach(form => {
        form.classList.remove('active');
    });
    
    // 显示选中的表单
    document.getElementById(formType + '-form').classList.add('active');
    
    // 更新标签按钮状态
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    event.target.classList.add('active');
}

// 处理登录表单提交
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert('登录成功！');
            // 在实际应用中，这里应该重定向到用户仪表板
            console.log('Logged in user:', result.user);
        } else {
            alert('登录失败: ' + (result.error || '未知错误'));
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('登录过程中发生错误');
    }
});

// 处理注册表单提交
document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // 简单验证
    if (password !== confirmPassword) {
        alert('密码和确认密码不匹配');
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert('注册成功！请登录');
            showForm('login');
        } else if (response.status === 409) {
            alert('用户已存在，请使用其他邮箱或用户名');
        } else {
            alert('注册失败: ' + (result.error || '未知错误'));
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('注册过程中发生错误');
    }
});

// 页面加载完成后显示登录表单
document.addEventListener('DOMContentLoaded', function() {
    showForm('login');
});`;