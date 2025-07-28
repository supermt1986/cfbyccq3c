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
        
        const response = await fetch('/api/cart', {
            method: 'PUT',
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