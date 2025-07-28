// 导入订单路由处理函数
import { getOrders, getOrderDetail, createOrder, updateOrderStatus } from './routes/orders.js';
// 导入购物车路由处理函数
import { getCart, addToCart, updateCart, removeFromCart, clearCart } from './routes/cart.js';

// 购物车页面模板
const cartTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>商城系统 - 购物车</title>
    <link rel="stylesheet" href="/static/style.css">
</head>
<body>
    <div class="product-listing-container">
        <header class="product-header">
            <div class="header-content">
                <h1>商城系统</h1>
                <nav class="main-nav">
                    <a href="/">首页</a>
                    <a href="/admin">管理后台</a>
                </nav>
            </div>
        </header>
        
        <main class="product-main">
            <div class="container">
                <div class="section-header">
                    <h2>购物车</h2>
                </div>
                
                <div class="cart-container">
                    <div class="cart-items" id="cart-items">
                        <div class="loading">加载中...</div>
                    </div>
                    <div class="cart-summary">
                        <div class="cart-total">
                            <h3>总计: <span id="cart-total">¥0.00</span></h3>
                        </div>
                        <button class="btn btn-primary" onclick="checkout()">结算</button>
                    </div>
                </div>
            </div>
        </main>
        
        <footer class="product-footer">
            <div class="container">
                <p>&copy; 2023 商城系统. 保留所有权利.</p>
            </div>
        </footer>
    </div>
    
    <script>
        // 页面加载完成后获取购物车内容
        document.addEventListener('DOMContentLoaded', function() {
            loadCart();
        });
        
        // 获取购物车内容
        async function loadCart() {
            try {
                // 在实际应用中，这里应该从认证信息中获取用户ID
                // 为了演示，我们使用一个示例用户ID
                const userId = 1;
                const response = await fetch('/api/cart?userId=' + userId);
                const result = await response.json();
                
                if (result.success) {
                    renderCart(result.data);
                } else {
                    document.getElementById('cart-items').innerHTML = 
                        '<div class="error">加载失败: ' + (result.error || '未知错误') + '</div>';
                }
            } catch (error) {
                console.error('Load cart error:', error);
                document.getElementById('cart-items').innerHTML = 
                    '<div class="error">加载过程中发生错误</div>';
            }
        }
        
        // 渲染购物车内容
        function renderCart(cartItems) {
            const container = document.getElementById('cart-items');
            
            if (cartItems.length === 0) {
                container.innerHTML = '<div class="no-products">购物车为空</div>';
                document.getElementById('cart-total').textContent = '¥0.00';
                return;
            }
            
            let total = 0;
            const itemsHtml = cartItems.map(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                
                return '<div class="cart-item">' +
                    '<div class="cart-item-image">' +
                    (item.image ? '<img src="' + item.image + '" alt="' + item.product_name + '">' : '<div class="placeholder-image">无图片</div>') +
                    '</div>' +
                    '<div class="cart-item-info">' +
                    '<h4>' + item.product_name + '</h4>' +
                    '<p>单价: ¥' + item.price + '</p>' +
                    '</div>' +
                    '<div class="cart-item-quantity">' +
                    '<button class="btn btn-secondary" onclick="updateQuantity(' + item.product_id + ', ' + (item.quantity - 1) + ')">-</button>' +
                    '<span>' + item.quantity + '</span>' +
                    '<button class="btn btn-secondary" onclick="updateQuantity(' + item.product_id + ', ' + (item.quantity + 1) + ')">+</button>' +
                    '</div>' +
                    '<div class="cart-item-total">' +
                    '<p>小计: ¥' + itemTotal.toFixed(2) + '</p>' +
                    '</div>' +
                    '<div class="cart-item-actions">' +
                    '<button class="btn btn-danger" onclick="removeFromCart(' + item.product_id + ')">删除</button>' +
                    '</div>' +
                    '</div>';
            }).join('');
            
            container.innerHTML = itemsHtml;
            document.getElementById('cart-total').textContent = '¥' + total.toFixed(2);
        }
        
        // 更新商品数量
        async function updateQuantity(productId, quantity) {
            if (quantity <= 0) {
                removeFromCart(productId);
                return;
            }
            
            try {
                // 在实际应用中，这里应该从认证信息中获取用户ID
                // 为了演示，我们使用一个示例用户ID
                const userId = 1;
                
                const response = await fetch('/api/cart/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: userId,
                        productId: productId,
                        quantity: quantity
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    loadCart(); // 重新加载购物车
                } else {
                    alert('更新数量失败: ' + (result.error || '未知错误'));
                }
            } catch (error) {
                console.error('Update quantity error:', error);
                alert('更新数量过程中发生错误');
            }
        }
        
        // 从购物车中移除商品
        async function removeFromCart(productId) {
            if (!confirm('确定要从购物车中移除这个商品吗？')) {
                return;
            }
            
            try {
                // 在实际应用中，这里应该从认证信息中获取用户ID
                // 为了演示，我们使用一个示例用户ID
                const userId = 1;
                
                const response = await fetch('/api/cart/remove', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: userId,
                        productId: productId
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    loadCart(); // 重新加载购物车
                } else {
                    alert('移除商品失败: ' + (result.error || '未知错误'));
                }
            } catch (error) {
                console.error('Remove from cart error:', error);
                alert('移除商品过程中发生错误');
            }
        }
        
        // 结算
        async function checkout() {
            try {
                // 在实际应用中，这里应该从认证信息中获取用户ID
                // 为了演示，我们使用一个示例用户ID
                const userId = 1;
                
                // 获取购物车内容
                const response = await fetch('/api/cart?userId=' + userId);
                const result = await response.json();
                
                if (result.success && result.data.length > 0) {
                    // 创建订单
                    const orderResponse = await fetch('/api/orders', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            userId: userId,
                            items: result.data.map(item => ({
                                productId: item.product_id,
                                quantity: item.quantity
                            })),
                            shippingAddress: '示例地址',
                            paymentMethod: '在线支付'
                        })
                    });
                    
                    const orderResult = await orderResponse.json();
                    
                    if (orderResult.success) {
                        alert('订单创建成功！订单号: ' + orderResult.orderId);
                        // 清空购物车
                        const clearResponse = await fetch('/api/cart/clear', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                userId: userId
                            })
                        });
                        
                        const clearResult = await clearResponse.json();
                        
                        if (clearResult.success) {
                            // 重新加载购物车
                            loadCart();
                        } else {
                            alert('清空购物车失败: ' + (clearResult.error || '未知错误'));
                        }
                    } else {
                        alert('创建订单失败: ' + (orderResult.error || '未知错误'));
                    }
                } else {
                    alert('购物车为空，无法结算');
                }
            } catch (error) {
                console.error('Checkout error:', error);
                alert('结算过程中发生错误');
            }
        }
    </script>
</body>
</html>`;

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
    
    // Handle logout
    if (url.pathname === '/api/logout' && request.method === 'POST') {
      return handleLogout(request, env);
    }
    
    // Handle products API
    if (url.pathname === '/api/products' && request.method === 'GET') {
      return handleGetProducts(request, env);
    }
    
    if (url.pathname === '/api/products' && request.method === 'POST') {
      return handleCreateProduct(request, env);
    }
    
    if (url.pathname.startsWith('/api/products/') && request.method === 'PUT') {
      const productId = url.pathname.split('/')[3];
      return handleUpdateProduct(request, env, productId);
    }
    
    if (url.pathname.startsWith('/api/products/') && request.method === 'DELETE') {
      const productId = url.pathname.split('/')[3];
      return handleDeleteProduct(request, env, productId);
    }
    
    // Handle orders API
    if (url.pathname === '/api/orders' && request.method === 'GET') {
      return getOrders(request, env);
    }
    
    if (url.pathname === '/api/order-detail' && request.method === 'GET') {
      return getOrderDetail(request, env);
    }
    
    if (url.pathname === '/api/orders' && request.method === 'POST') {
      return createOrder(request, env);
    }
    
    if (url.pathname === '/api/update-order-status' && request.method === 'POST') {
      return updateOrderStatus(request, env);
    }
    
    // Handle cart API
    if (url.pathname === '/api/cart' && request.method === 'GET') {
      return getCart(request, env);
    }
    
    if (url.pathname === '/api/cart/add' && request.method === 'POST') {
      return addToCart(request, env);
    }
    
    if (url.pathname === '/api/cart/update' && request.method === 'POST') {
      return updateCart(request, env);
    }
    
    if (url.pathname === '/api/cart/remove' && request.method === 'POST') {
      return removeFromCart(request, env);
    }
    
    if (url.pathname === '/api/cart/clear' && request.method === 'POST') {
      return clearCart(request, env);
    }
    
    // Serve cart page
    if (url.pathname === '/cart') {
      // Try to serve the static cart.html file first
      try {
        const cartHtml = await env.ASSETS.fetch(new Request('http://localhost/cart.html')).then(res => res.text());
        return new Response(cartHtml, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        });
      } catch (error) {
        // Fallback to the inline template if the file is not found
        return new Response(cartTemplate, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        });
      }
    }
    
    // Serve dashboard for authenticated users
    if (url.pathname === '/admin') {
      // Check if user is authenticated (for demo purposes, we'll use a simple cookie check)
      const cookieHeader = request.headers.get('Cookie') || '';
      const authMatch = cookieHeader.match(/auth_token=(\d+)/);
      
      if (!authMatch) {
        // Redirect to login page if not authenticated
        return new Response(htmlTemplate, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        });
      }
      
      // Get user ID from cookie
      const userId = authMatch[1];
      
      // Verify user exists in database
      try {
        const user = await env.D1_DB.prepare(
          'SELECT id, username FROM users WHERE id = ?'
        )
        .bind(userId)
        .first();
        
        if (!user) {
          // Invalid user, redirect to login
          return new Response(htmlTemplate, {
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Set-Cookie': 'auth_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
            },
          });
        }
        
        // Inject user data into dashboard template
        const dashboardWithUser = dashboardTemplate.replace(
          '<span id="username">用户</span>',
          `<span id="username">${user.username}</span>`
        );
        
        return new Response(dashboardWithUser, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        });
      } catch (error) {
        console.error('Authentication error:', error);
        return new Response(htmlTemplate, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        });
      }
    }
    
    // Serve product listing page as homepage
    if (url.pathname === '/') {
      return new Response(productListingTemplate, {
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
    // For demo purposes, we'll set a simple auth cookie
    const responseBody = JSON.stringify({ 
      success: true, 
      user: { id: user.id, username: user.username } 
    });
    
    return new Response(responseBody, {
      headers: { 
        'Content-Type': 'application/json',
        'Set-Cookie': `auth_token=${user.id}; Path=/; HttpOnly; SameSite=Strict`
      }
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

/* Product management styles */
.product-actions {
    margin-bottom: 20px;
}

.btn {
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
}

.btn-primary {
    background: #3498db;
    color: white;
}

.btn-primary:hover {
    background: #2980b9;
}

.btn-secondary {
    background: #95a5a6;
    color: white;
}

.btn-secondary:hover {
    background: #7f8c8d;
}

.btn-danger {
    background: #e74c3c;
    color: white;
}

.btn-danger:hover {
    background: #c0392b;
}

.product-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.product-table th,
.product-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ecf0f1;
}

.product-table th {
    background: #3498db;
    color: white;
    font-weight: bold;
}

.product-table tr:hover {
    background: #f5f7fa;
}

.text-center {
    text-align: center;
}

.product-form-container {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    margin-top: 20px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #2c3e50;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
    box-sizing: border-box;
}

.form-group textarea {
    height: 100px;
    resize: vertical;
}

.form-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
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
}

/* Product listing styles */
.product-listing-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
}

.product-header {
    background: white;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    padding: 1rem 0;
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

@media (max-width: 768px) {
    .header-content {
        padding: 0 1rem;
    }
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

@media (max-width: 768px) {
    .container {
        padding: 0 1rem;
    }
}

.header-content h1 {
    color: #2c3e50;
    margin: 0;
}

.main-nav a {
    text-decoration: none;
    color: #3498db;
    margin-left: 1rem;
    font-weight: 500;
    transition: color 0.3s;
}

.main-nav a:hover {
    color: #2980b9;
}

.product-main {
    flex: 1;
    padding: 2rem 0;
}

.section-header {
    text-align: center;
    margin-bottom: 2rem;
}

.section-header h2 {
    color: #2c3e50;
    font-size: 2rem;
    margin: 0;
}

.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
}

@media (min-width: 1200px) {
    .product-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

@media (min-width: 992px) and (max-width: 1199px) {
    .product-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (min-width: 768px) and (max-width: 991px) {
    .product-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 767px) {
    .product-grid {
        grid-template-columns: 1fr;
        padding: 1rem;
    }
}

.product-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 20px rgba(0,0,0,0.15);
}

.product-image {
    height: 200px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.placeholder-image {
    color: #7f8c8d;
    font-size: 1rem;
}

.product-info {
    padding: 1.5rem;
}

.product-name {
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
    font-size: 1.25rem;
}

.product-description {
    color: #7f8c8d;
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
    line-height: 1.5;
}

.product-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.product-price {
    font-weight: bold;
    color: #e74c3c;
    font-size: 1.25rem;
}

.product-stock {
    color: #27ae60;
    font-size: 0.9rem;
}

.product-category {
    background: #3498db;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
}

.btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s ease;
}

.btn-primary {
    background: #3498db;
    color: white;
}

.btn-primary:hover {
    background: #2980b9;
}

.loading, .error, .no-products {
    text-align: center;
    padding: 2rem;
    color: #7f8c8d;
    font-size: 1.1rem;
}

.error {
    color: #e74c3c;
}

.no-products {
    color: #95a5a6;
}

.product-footer {
    background: #2c3e50;
    color: white;
    text-align: center;
    padding: 1rem 0;
    margin-top: auto;
}

/* Cart styles */
.cart-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    padding: 2rem;
    margin-bottom: 2rem;
    max-width: 1200px;
    margin: 0 auto 2rem auto;
}

.cart-item {
    display: flex;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid #eee;
}

.cart-item:last-child {
    border-bottom: none;
}

.cart-item-image {
    width: 100px;
    height: 100px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border-radius: 4px;
    margin-right: 1rem;
}

.cart-item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.cart-item-info {
    flex: 1;
    margin-right: 1rem;
}

.cart-item-info h4 {
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
}

.cart-item-info p {
    margin: 0;
    color: #7f8c8d;
}

.cart-item-quantity {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-right: 1rem;
}

.cart-item-quantity span {
    min-width: 2rem;
    text-align: center;
}

.cart-item-total {
    min-width: 100px;
    margin-right: 1rem;
}

.cart-item-total p {
    margin: 0;
    font-weight: bold;
    color: #e74c3c;
}

.cart-item-actions {
    min-width: 80px;
}

.cart-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-top: 2px solid #eee;
}

.cart-total h3 {
    margin: 0;
    color: #2c3e50;
}

@media (max-width: 768px) {
    .cart-item {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .cart-item-image {
        width: 80px;
        height: 80px;
        margin-bottom: 0.5rem;
    }
    
    .cart-item-info, .cart-item-quantity, .cart-item-total, .cart-item-actions {
        margin: 0.5rem 0;
        width: 100%;
    }
    
    .cart-summary {
        flex-direction: column;
        gap: 1rem;
    }
    
    .cart-total {
        text-align: center;
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
            // 登录成功后重定向到管理后台
            window.location.href = '/admin';
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

// Handle get products
async function handleGetProducts(request, env) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;
    
    // Get products with pagination
    const { results } = await env.D1_DB.prepare(
      'SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?'
    )
      .bind(limit, offset)
      .all();
    
    // Get total count
    const { results: countResults } = await env.D1_DB.prepare(
      'SELECT COUNT(*) as total FROM products'
    )
      .all();
    
    const total = countResults[0].total;
    const totalPages = Math.ceil(total / limit);
    
    return new Response(JSON.stringify({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get products error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle create product
async function handleCreateProduct(request, env) {
  try {
    const { name, description, price, category, stock_quantity, image_url } = await request.json();
    
    // Validate input
    if (!name || price === undefined) {
      return new Response(JSON.stringify({ error: 'Name and price are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Insert new product
    const result = await env.D1_DB.prepare(
      'INSERT INTO products (name, description, price, category, stock_quantity, image_url) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(
        name, 
        description || null, 
        price, 
        category || null, 
        stock_quantity !== undefined ? stock_quantity : 0, 
        image_url || null
      )
      .run();
    
    if (result.success) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      console.error('Failed to create product:', result);
      return new Response(JSON.stringify({ error: 'Failed to create product' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Create product error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle update product
async function handleUpdateProduct(request, env, productId) {
  try {
    const { name, description, price, category, stock_quantity, image_url } = await request.json();
    
    // Validate input
    if (!productId) {
      return new Response(JSON.stringify({ error: 'Product ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update product
    const result = await env.D1_DB.prepare(
      'UPDATE products SET name = ?, description = ?, price = ?, category = ?, stock_quantity = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    )
      .bind(
        name || null, 
        description || null, 
        price !== undefined ? price : null, 
        category || null, 
        stock_quantity !== undefined ? stock_quantity : null, 
        image_url || null, 
        productId
      )
      .run();
    
    if (result.success) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      console.error('Failed to update product:', result);
      return new Response(JSON.stringify({ error: 'Failed to update product' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Update product error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle logout
async function handleLogout(request, env) {
  return new Response(JSON.stringify({ success: true }), {
    headers: { 
      'Content-Type': 'application/json',
      'Set-Cookie': 'auth_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
    }
  });
}

// Handle delete product
async function handleDeleteProduct(request, env, productId) {
  try {
    // Validate input
    if (!productId) {
      return new Response(JSON.stringify({ error: 'Product ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Delete product
    const { success } = await env.D1_DB.prepare(
      'DELETE FROM products WHERE id = ?'
    )
      .bind(productId)
      .run();
    
    if (success) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Failed to delete product' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Delete product error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

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
                    <a href="#" class="logout-btn" onclick="logout()">退出登录</a>
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
                    <div class="product-actions">
                        <button class="btn btn-primary" onclick="showProductForm()">添加商品</button>
                    </div>
                    <div class="product-list">
                        <table class="product-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>商品名称</th>
                                    <th>价格</th>
                                    <th>库存</th>
                                    <th>分类</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody id="product-table-body">
                                <tr>
                                    <td colspan="6" class="text-center">加载中...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="product-form-container" class="product-form-container" style="display: none;">
                        <h3 id="form-title">添加商品</h3>
                        <form id="product-form">
                            <input type="hidden" id="product-id">
                            <div class="form-group">
                                <label for="product-name">商品名称</label>
                                <input type="text" id="product-name" required>
                            </div>
                            <div class="form-group">
                                <label for="product-price">价格</label>
                                <input type="number" id="product-price" step="0.01" required>
                            </div>
                            <div class="form-group">
                                <label for="product-stock">库存</label>
                                <input type="number" id="product-stock" value="0">
                            </div>
                            <div class="form-group">
                                <label for="product-category">分类</label>
                                <input type="text" id="product-category">
                            </div>
                            <div class="form-group">
                                <label for="product-description">描述</label>
                                <textarea id="product-description"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="product-image">图片URL</label>
                                <input type="text" id="product-image">
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">保存</button>
                                <button type="button" class="btn btn-secondary" onclick="hideProductForm()">取消</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div id="orders" class="content">
                    <h2>订单管理</h2>
                    <div class="order-actions">
                        <button class="btn btn-primary" onclick="loadOrders()">刷新订单</button>
                    </div>
                    <div class="order-list">
                        <table class="product-table">
                            <thead>
                                <tr>
                                    <th>订单ID</th>
                                    <th>用户ID</th>
                                    <th>总金额</th>
                                    <th>状态</th>
                                    <th>创建时间</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody id="order-table-body">
                                <tr>
                                    <td colspan="6" class="text-center">加载中...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="order-detail-container" class="product-form-container" style="display: none; margin-top: 20px;">
                        <h3>订单详情</h3>
                        <div id="order-detail-content"></div>
                        <div class="form-actions">
                            <button class="btn btn-secondary" onclick="hideOrderDetail()">关闭</button>
                        </div>
                    </div>
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
            const contentElement = document.getElementById(contentId);
            if (contentElement) {
                contentElement.classList.add('active');
            }
            
            // 更新菜单状态
            document.querySelectorAll('.menu li').forEach(li => {
                li.classList.remove('active');
            });
            
            // 找到对应的菜单项并激活
            const menuLinks = document.querySelectorAll('.menu a');
            for (let i = 0; i < menuLinks.length; i++) {
                const link = menuLinks[i];
                if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(contentId)) {
                    if (link.parentElement) {
                        link.parentElement.classList.add('active');
                    }
                    break;
                }
            }
            
            // 如果是商品管理页面，加载商品数据
            if (contentId === 'products') {
                loadProducts();
            }
            
            // 如果是订单管理页面，加载订单数据
            if (contentId === 'orders') {
                loadOrders();
            }
        }
        
        // 页面加载完成后显示概览
        document.addEventListener('DOMContentLoaded', function() {
            showContent('overview');
        });
        
        // 商品管理功能
        async function loadProducts() {
            try {
                const response = await fetch('/api/products');
                const result = await response.json();
                
                if (result.success) {
                    renderProducts(result.data);
                } else {
                    document.getElementById('product-table-body').innerHTML = 
                        '<tr><td colspan="6" class="text-center">加载失败</td></tr>';
                }
            } catch (error) {
                console.error('Load products error:', error);
                document.getElementById('product-table-body').innerHTML = 
                    '<tr><td colspan="6" class="text-center">加载失败</td></tr>';
            }
        }
        
        function renderProducts(products) {
            const tbody = document.getElementById('product-table-body');
            
            if (products.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">暂无商品数据</td></tr>';
                return;
            }
            
            tbody.innerHTML = products.map(product => 
                '<tr>' +
                '<td>' + product.id + '</td>' +
                '<td>' + product.name + '</td>' +
                '<td>¥' + product.price + '</td>' +
                '<td>' + product.stock_quantity + '</td>' +
                '<td>' + (product.category || '-') + '</td>' +
                '<td>' +
                '<button class="btn btn-primary" onclick="editProduct(' + product.id + ')">编辑</button> ' +
                '<button class="btn btn-danger" onclick="deleteProduct(' + product.id + ')">删除</button>' +
                '</td>' +
                '</tr>'
            ).join('');
        }
        
        function showProductForm() {
            const formTitle = document.getElementById('form-title');
            const productForm = document.getElementById('product-form');
            const productId = document.getElementById('product-id');
            const formContainer = document.getElementById('product-form-container');
            
            if (formTitle) formTitle.textContent = '添加商品';
            if (productForm) productForm.reset();
            if (productId) productId.value = '';
            if (formContainer) formContainer.style.display = 'block';
        }
        
        function hideProductForm() {
            const formContainer = document.getElementById('product-form-container');
            if (formContainer) {
                formContainer.style.display = 'none';
            }
        }
        
        function editProduct(productId) {
            // 在实际应用中，这里会从服务器获取商品详情
            // 这里我们只是演示编辑功能
            const formTitle = document.getElementById('form-title');
            const productIdInput = document.getElementById('product-id');
            const formContainer = document.getElementById('product-form-container');
            
            if (formTitle) formTitle.textContent = '编辑商品';
            if (productIdInput) productIdInput.value = productId;
            // 这里应该填充表单数据，但在演示中我们跳过这一步
            if (formContainer) formContainer.style.display = 'block';
        }
        
        async function deleteProduct(productId) {
            if (!confirm('确定要删除这个商品吗？')) {
                return;
            }
            
            try {
                const response = await fetch('/api/products/' + productId, {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('商品删除成功');
                    loadProducts(); // 重新加载商品列表
                } else {
                    alert('删除失败: ' + (result.error || '未知错误'));
                }
            } catch (error) {
                console.error('Delete product error:', error);
                alert('删除过程中发生错误');
            }
        }
        
        // 处理商品表单提交
        document.getElementById('product-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const productId = document.getElementById('product-id').value;
            const name = document.getElementById('product-name').value;
            const price = document.getElementById('product-price').value;
            const stock = document.getElementById('product-stock').value;
            const category = document.getElementById('product-category').value;
            const description = document.getElementById('product-description').value;
            const image = document.getElementById('product-image').value;
            
            try {
                const method = productId ? 'PUT' : 'POST';
                const url = productId ? '/api/products/' + productId : '/api/products';
                
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name,
                        price: parseFloat(price),
                        stock_quantity: parseInt(stock),
                        category,
                        description,
                        image_url: image
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert(productId ? '商品更新成功' : '商品添加成功');
                    hideProductForm();
                    loadProducts(); // 重新加载商品列表
                } else {
                    alert('操作失败: ' + (result.error || '未知错误'));
                }
            } catch (error) {
                console.error('Product form error:', error);
                alert('操作过程中发生错误');
            }
        });
        
        // 登出功能
        async function logout() {
            try {
                const response = await fetch('/api/logout', {
                    method: 'POST',
                    credentials: 'same-origin'
                });
                const data = await response.json();
                if (data.success) {
                    // 登出成功，重定向到首页
                    window.location.href = '/';
                } else {
                    alert('登出失败');
                }
            } catch (error) {
                console.error('Logout error:', error);
                alert('登出过程中发生错误');
            }
        }
        
        // 订单管理功能
        async function loadOrders() {
            try {
                // 在实际应用中，这里应该从认证信息中获取用户ID
                // 为了演示，我们使用一个示例用户ID
                const userId = 1;
                const response = await fetch('/api/orders?userId=' + userId);
                const result = await response.json();
                
                if (result.success) {
                    renderOrders(result.data);
                } else {
                    document.getElementById('order-table-body').innerHTML = 
                        '<tr><td colspan="6" class="text-center">加载失败</td></tr>';
                }
            } catch (error) {
                console.error('Load orders error:', error);
                document.getElementById('order-table-body').innerHTML = 
                    '<tr><td colspan="6" class="text-center">加载失败</td></tr>';
            }
        }
        
        function renderOrders(orders) {
            const tbody = document.getElementById('order-table-body');
            
            if (orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">暂无订单数据</td></tr>';
                return;
            }
            
            tbody.innerHTML = orders.map(order => 
                '<tr>' +
                '<td>' + order.id + '</td>' +
                '<td>' + order.user_id + '</td>' +
                '<td>¥' + order.total_amount + '</td>' +
                '<td>' + order.status + '</td>' +
                '<td>' + new Date(order.created_at).toLocaleDateString() + '</td>' +
                '<td>' +
                '<button class="btn btn-primary" onclick="viewOrderDetail(' + order.id + ')">详情</button> ' +
                '<button class="btn btn-secondary" onclick="updateOrderStatus(' + order.id + ', \'shipped\')">发货</button>' +
                '</td>' +
                '</tr>'
            ).join('');
        }
        
        async function viewOrderDetail(orderId) {
            try {
                const response = await fetch('/api/order-detail?orderId=' + orderId);
                const result = await response.json();
                
                if (result.success) {
                    renderOrderDetail(result.data);
                    const detailContainer = document.getElementById('order-detail-container');
                    if (detailContainer) {
                        detailContainer.style.display = 'block';
                    }
                } else {
                    alert('获取订单详情失败: ' + (result.error || '未知错误'));
                }
            } catch (error) {
                console.error('Get order detail error:', error);
                alert('获取订单详情过程中发生错误');
            }
        }
        
        function renderOrderDetail(orderData) {
            const order = orderData.order;
            const items = orderData.items;
            
            let itemsHtml = items.map(item => 
                '<tr>' +
                '<td>' + item.product_name + '</td>' +
                '<td>' + item.quantity + '</td>' +
                '<td>¥' + item.price + '</td>' +
                '<td>¥' + (item.price * item.quantity).toFixed(2) + '</td>' +
                '</tr>'
            ).join('');
            
            const detailHtml = '<div class="order-detail-info">' +
                '<h4>订单信息</h4>' +
                '<p><strong>订单号:</strong> ' + order.id + '</p>' +
                '<p><strong>总金额:</strong> ¥' + order.total_amount + '</p>' +
                '<p><strong>状态:</strong> ' + order.status + '</p>' +
                '<p><strong>创建时间:</strong> ' + new Date(order.created_at).toLocaleString() + '</p>' +
                '<p><strong>收货地址:</strong> ' + (order.shipping_address || '未提供') + '</p>' +
                '<p><strong>支付方式:</strong> ' + (order.payment_method || '未提供') + '</p>' +
                '</div>' +
                '<div class="order-detail-items">' +
                '<h4>订单项</h4>' +
                '<table class="product-table">' +
                '<thead>' +
                '<tr>' +
                '<th>商品名称</th>' +
                '<th>数量</th>' +
                '<th>单价</th>' +
                '<th>小计</th>' +
                '</tr>' +
                '</thead>' +
                '<tbody>' +
                itemsHtml +
                '</tbody>' +
                '</table>' +
                '</div>';
            
            document.getElementById('order-detail-content').innerHTML = detailHtml;
        }
        
        function hideOrderDetail() {
            const detailContainer = document.getElementById('order-detail-container');
            if (detailContainer) {
                detailContainer.style.display = 'none';
            }
        }
        
        async function updateOrderStatus(orderId, status) {
            if (!confirm('确定要更新订单状态吗？')) {
                return;
            }
            
            try {
                const response = await fetch('/api/update-order-status', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        orderId: orderId,
                        status: status
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('订单状态更新成功');
                    loadOrders(); // 重新加载订单列表
                } else {
                    alert('更新失败: ' + (result.error || '未知错误'));
                }
            } catch (error) {
                console.error('Update order status error:', error);
                alert('更新订单状态过程中发生错误');
            }
        }
    </script>
</body>
</html>`;

// Product listing template
const productListingTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>商城系统 - 商品浏览</title>
    <link rel="stylesheet" href="/static/style.css">
</head>
<body>
    <div class="product-listing-container">
        <header class="product-header">
            <div class="header-content">
                <h1>商城系统</h1>
                <nav class="main-nav">
                    <a href="/">首页</a>
                    <a href="/admin">管理后台</a>
                    <a href="/cart">购物车</a>
                </nav>
            </div>
        </header>
        
        <main class="product-main">
            <div class="container">
                <div class="section-header">
                    <h2>商品列表</h2>
                </div>
                
                <div class="product-grid" id="product-grid">
                    <!-- 商品将通过JavaScript动态加载 -->
                    <div class="loading">加载中...</div>
                </div>
            </div>
        </main>
        
        <footer class="product-footer">
            <div class="container">
                <p>&copy; 2023 商城系统. 保留所有权利.</p>
            </div>
        </footer>
    </div>
    
    <script>
        // 页面加载完成后获取商品列表
        document.addEventListener('DOMContentLoaded', function() {
            loadProducts();
        });
        
        // 获取商品列表
        async function loadProducts() {
            try {
                const response = await fetch('/api/products');
                const result = await response.json();
                
                if (result.success) {
                    renderProducts(result.data);
                } else {
                    document.getElementById('product-grid').innerHTML = 
                        '<div class="error">加载失败: ' + (result.error || '未知错误') + '</div>';
                }
            } catch (error) {
                console.error('Load products error:', error);
                document.getElementById('product-grid').innerHTML = 
                    '<div class="error">加载过程中发生错误</div>';
            }
        }
        
        // 渲染商品列表
        function renderProducts(products) {
            const grid = document.getElementById('product-grid');
            
            if (products.length === 0) {
                grid.innerHTML = '<div class="no-products">暂无商品</div>';
                return;
            }
            
            grid.innerHTML = products.map(product => 
                '<div class="product-card" data-product-id="' + product.id + '">' +
                '<div class="product-image">' +
                (product.image_url ? 
                    '<img src="' + product.image_url + '" alt="' + product.name + '">' : 
                    '<div class="placeholder-image">无图片</div>') +
                '</div>' +
                '<div class="product-info">' +
                '<h3 class="product-name">' + product.name + '</h3>' +
                '<p class="product-description">' + (product.description || '暂无描述') + '</p>' +
                '<div class="product-meta">' +
                '<span class="product-price">¥' + product.price + '</span>' +
                '<span class="product-stock">库存: ' + product.stock_quantity + '</span>' +
                (product.category ? '<span class="product-category">' + product.category + '</span>' : '') +
                '</div>' +
                '<button class="btn btn-primary" onclick="viewProduct(' + product.id + ')">查看详情</button> ' +
                '<button class="btn btn-secondary" onclick="addToCart(' + product.id + ')">添加到购物车</button>' +
                '</div>' +
                '</div>'
            ).join('');
        }
        
        // 查看商品详情（示例功能）
        function viewProduct(productId) {
            alert('查看商品ID: ' + productId + ' 的详情');
            // 在实际应用中，这里会跳转到商品详情页
        }
        
        // 添加商品到购物车
        async function addToCart(productId) {
            try {
                // 在实际应用中，这里应该从认证信息中获取用户ID
                // 为了演示，我们使用一个示例用户ID
                const userId = 1;
                
                const response = await fetch('/api/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: userId,
                        productId: productId,
                        quantity: 1
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('商品已添加到购物车');
                } else {
                    alert('添加到购物车失败: ' + (result.error || '未知错误'));
                }
            } catch (error) {
                console.error('Add to cart error:', error);
                alert('添加到购物车过程中发生错误');
            }
        }
    </script>
</body>
</html>`;