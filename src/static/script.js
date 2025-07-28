// 切换表单显示
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
});