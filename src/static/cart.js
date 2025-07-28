// 购物车前端功能

// 添加商品到购物车
async function addToCart(productId, quantity = 1) {
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
        quantity: quantity
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('商品已添加到购物车');
      // 如果在购物车页面，刷新购物车内容
      if (typeof loadCart === 'function') {
        loadCart();
      }
    } else {
      alert('添加到购物车失败: ' + (result.error || '未知错误'));
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    alert('添加到购物车过程中发生错误');
  }
}

// 从商品列表页面添加"添加到购物车"按钮
function addAddToCartButtons() {
  // 在商品卡片上添加"添加到购物车"按钮
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach(card => {
    const productId = card.dataset.productId; // 假设商品卡片上有data-product-id属性
    if (productId && !card.querySelector('.add-to-cart-btn')) {
      const button = document.createElement('button');
      button.className = 'btn btn-primary add-to-cart-btn';
      button.textContent = '添加到购物车';
      button.onclick = () => addToCart(productId);
      
      // 将按钮添加到商品卡片中
      const infoDiv = card.querySelector('.product-info');
      if (infoDiv) {
        infoDiv.appendChild(button);
      }
    }
  });
}

// 页面加载完成后添加购物车按钮
document.addEventListener('DOMContentLoaded', function() {
  // 如果在商品列表页面，添加购物车按钮
  if (document.getElementById('product-grid')) {
    // 等待商品加载完成后再添加按钮
    setTimeout(addAddToCartButtons, 1000);
  }
});