export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle registration
    if (url.pathname === '/api/register' && request.method === 'POST') {
      return handleRegister(request, env);
    }
    
    // Handle login
    if (url.pathname === '/api/login' && request.method === 'POST') {
      return handleLogin(request, env);
    }
    
    // Serve dashboard for authenticated users
    if (url.pathname === '/dashboard') {
      // In a real app, you would check authentication here
      return new Response(dashboardTemplate, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }
    
    // Serve static files for the frontend
    if (url.pathname === '/') {
      return new Response(htmlTemplate, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }
    
    if (url.pathname === '/static/style.css') {
      return new Response(cssTemplate, {
        headers: {
          'Content-Type': 'text/css',
        },
      });
    }
    
    if (url.pathname === '/static/script.js') {
      return new Response(jsTemplate, {
        headers: {
          'Content-Type': 'application/javascript',
        },
      });
    }
    
    // 404 handler
    return new Response('Not Found', { status: 404 });
  }
};

async function handleRegister(request, env) {
  try {
    const { username, email, password } = await request.json();
    
    // Validate input
    if (!username || !email || !password) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if user already exists
    const existingUser = await env.D1_DB.prepare(
      'SELECT id FROM users WHERE email = ? OR username = ?'
    )
      .bind(email, username)
      .first();
      
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Simple encoding for password (in a real app, use a proper hashing library)
    const encodedPassword = encodeURIComponent(password);
    
    // Insert new user
    await env.D1_DB.prepare(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
    )
      .bind(username, email, encodedPassword)
      .run();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleLogin(request, env) {
  try {
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Missing email or password' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Encode password for comparison
    const encodedPassword = encodeURIComponent(password);
    
    // Find user
    const user = await env.D1_DB.prepare(
      'SELECT id, username FROM users WHERE email = ? AND password = ?'
    )
      .bind(email, encodedPassword)
      .first();
      
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // In a real app, you would generate a JWT token here
    return new Response(JSON.stringify({ 
      success: true, 
      user: { id: user.id, username: user.username } 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

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

/* Dashboard styles */
.dashboard-container {
    display: flex;
    width: 100%;
    min-height: 100vh;
    background: #f5f7fa;
}

.sidebar {
    width: 250px;
    background: #2c3e50;
    color: white;
    height: 100vh;
    position: fixed;
}

.logo {
    padding: 20px;
    background: #1a2530;
    text-align: center;
}

.logo h2 {
    margin: 0;
    font-size: 1.2em;
}

.menu ul {
    list-style: none;
    padding: 0;
}

.menu li {
    border-bottom: 1px solid #34495e;
}

.menu li.active {
    background: #34495e;
}

.menu a {
    display: block;
    padding: 15px 20px;
    color: #ecf0f1;
    text-decoration: none;
    transition: all 0.3s ease;
}

.menu a:hover {
    background: #34495e;
    padding-left: 25px;
}

.main-content {
    flex: 1;
    margin-left: 250px;
    display: flex;
    flex-direction: column;
}

header {
    background: white;
    padding: 20px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.logout-btn {
    background: #e74c3c;
    color: white;
    padding: 8px 15px;
    border-radius: 5px;
    text-decoration: none;
    transition: background 0.3s;
}

.logout-btn:hover {
    background: #c0392b;
}

.content-area {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

.content {
    display: none;
}

.content.active {
    display: block;
    animation: fadeIn 0.5s ease;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin: 20px 0;
}

.stat-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    text-align: center;
}

.stat-card h3 {
    color: #7f8c8d;
    margin-bottom: 10px;
}

.stat-card p {
    font-size: 1.5em;
    font-weight: bold;
    color: #2c3e50;
}

.chart-placeholder {
    background: white;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    text-align: center;
    margin-top: 20px;
    color: #7f8c8d;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .dashboard-container {
        flex-direction: column;
    }
    
    .sidebar {
        width: 100%;
        height: auto;
        position: relative;
    }
    
    .main-content {
        margin-left: 0;
    }
    
    .stats-grid {
        grid-template-columns: 1fr;
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
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
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
            // 登录成功后重定向到仪表板
            window.location.href = '/dashboard';
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

// Dashboard template
const dashboardTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>商城系统 - 仪表板</title>
    <link rel="stylesheet" href="/static/style.css">
</head>
<body>
    <div class="dashboard-container">
        <div class="sidebar">
            <div class="logo">
                <h2>商城管理系统</h2>
            </div>
            <nav class="menu">
                <ul>
                    <li class="active"><a href="#" onclick="showContent('overview')">概览</a></li>
                    <li><a href="#" onclick="showContent('products')">商品管理</a></li>
                    <li><a href="#" onclick="showContent('orders')">订单管理</a></li>
                    <li><a href="#" onclick="showContent('customers')">客户管理</a></li>
                    <li><a href="#" onclick="showContent('categories')">分类管理</a></li>
                    <li><a href="#" onclick="showContent('promotions')">促销活动</a></li>
                    <li><a href="#" onclick="showContent('reports')">数据报告</a></li>
                    <li><a href="#" onclick="showContent('settings')">系统设置</a></li>
                </ul>
            </nav>
        </div>
        <div class="main-content">
            <header>
                <h1>仪表板</h1>
                <div class="user-info">
                    <span>欢迎, <span id="username">用户</span></span>
                    <a href="/" class="logout-btn">退出登录</a>
                </div>
            </header>
            <div class="content-area">
                <div id="overview" class="content active">
                    <h2>概览</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <h3>总销售额</h3>
                            <p>¥128,000</p>
                        </div>
                        <div class="stat-card">
                            <h3>订单数量</h3>
                            <p>1,248</p>
                        </div>
                        <div class="stat-card">
                            <h3>客户数量</h3>
                            <p>3,456</p>
                        </div>
                        <div class="stat-card">
                            <h3>商品数量</h3>
                            <p>892</p>
                        </div>
                    </div>
                    <div class="chart-placeholder">
                        <p>销售趋势图表</p>
                    </div>
                </div>
                <div id="products" class="content">
                    <h2>商品管理</h2>
                    <p>这里是商品管理页面的内容。在实际应用中，这里会显示商品列表、添加/编辑商品等功能。</p>
                </div>
                <div id="orders" class="content">
                    <h2>订单管理</h2>
                    <p>这里是订单管理页面的内容。在实际应用中，这里会显示订单列表、订单详情、发货状态等功能。</p>
                </div>
                <div id="customers" class="content">
                    <h2>客户管理</h2>
                    <p>这里是客户管理页面的内容。在实际应用中，这里会显示客户列表、客户详情、客户分组等功能。</p>
                </div>
                <div id="categories" class="content">
                    <h2>分类管理</h2>
                    <p>这里是分类管理页面的内容。在实际应用中，这里会显示商品分类、添加/编辑分类等功能。</p>
                </div>
                <div id="promotions" class="content">
                    <h2>促销活动</h2>
                    <p>这里是促销活动页面的内容。在实际应用中，这里会显示优惠券、折扣活动、满减活动等功能。</p>
                </div>
                <div id="reports" class="content">
                    <h2>数据报告</h2>
                    <p>这里是数据报告页面的内容。在实际应用中，这里会显示销售报告、客户分析、商品分析等功能。</p>
                </div>
                <div id="settings" class="content">
                    <h2>系统设置</h2>
                    <p>这里是系统设置页面的内容。在实际应用中，这里会显示店铺信息、支付设置、配送设置等功能。</p>
                </div>
            </div>
        </div>
    </div>
    <script>
        // 显示选中的内容
        function showContent(contentId) {
            // 隐藏所有内容
            document.querySelectorAll('.content').forEach(content => {
                content.classList.remove('active');
            });
            
            // 显示选中的内容
            document.getElementById(contentId).classList.add('active');
            
            // 更新菜单状态
            document.querySelectorAll('.menu li').forEach(li => {
                li.classList.remove('active');
            });
            
            // 找到对应的菜单项并激活
            const menuItem = Array.from(document.querySelectorAll('.menu a')).find(a => 
                a.getAttribute('onclick').includes(contentId)
            );
            if (menuItem) {
                menuItem.parentElement.classList.add('active');
            }
        }
        
        // 页面加载完成后显示概览
        document.addEventListener('DOMContentLoaded', function() {
            showContent('overview');
        });
    </script>
</body>
</html>`;