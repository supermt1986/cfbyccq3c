// 购物车路由处理函数

// 获取购物车内容
export async function getCart(request, env) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return new Response(JSON.stringify({ 
        success: true, 
        data: [] 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 从数据库中获取用户的购物车内容
    const { results } = await env.D1_DB.prepare(
      `SELECT 
         ci.id,
         ci.product_id,
         ci.quantity,
         p.name as product_name,
         p.price,
         p.image_url as image
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`
    )
      .bind(userId)
      .all();
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: results 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 添加商品到购物车
export async function addToCart(request, env) {
  try {
    const { userId, productId, quantity } = await request.json();
    
    // 验证输入
    if (!userId || !productId || !quantity) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 检查商品是否存在
    const product = await env.D1_DB.prepare(
      'SELECT id, name, price, stock_quantity, image_url FROM products WHERE id = ?'
    )
      .bind(productId)
      .first();
    
    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 检查库存
    if (product.stock_quantity < quantity) {
      return new Response(JSON.stringify({ error: 'Insufficient stock' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 检查购物车中是否已存在该商品
    const existingCartItem = await env.D1_DB.prepare(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?'
    )
      .bind(userId, productId)
      .first();
    
    if (existingCartItem) {
      // 如果已存在，更新数量
      const newQuantity = existingCartItem.quantity + quantity;
      
      // 检查更新后的数量是否超过库存
      if (product.stock_quantity < newQuantity) {
        return new Response(JSON.stringify({ error: 'Insufficient stock for requested quantity' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      await env.D1_DB.prepare(
        'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      )
        .bind(newQuantity, existingCartItem.id)
        .run();
    } else {
      // 如果不存在，插入新记录
      await env.D1_DB.prepare(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)'
      )
        .bind(userId, productId, quantity)
        .run();
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Product added to cart successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 更新购物车中的商品数量
export async function updateCart(request, env) {
  try {
    const { userId, productId, quantity } = await request.json();
    
    // 验证输入
    if (!userId || !productId || quantity === undefined) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 检查商品是否存在
    const product = await env.D1_DB.prepare(
      'SELECT id, name, price, stock_quantity, image_url FROM products WHERE id = ?'
    )
      .bind(productId)
      .first();
    
    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 检查库存
    if (product.stock_quantity < quantity) {
      return new Response(JSON.stringify({ error: 'Insufficient stock' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 检查购物车项是否存在
    const existingCartItem = await env.D1_DB.prepare(
      'SELECT id FROM cart_items WHERE user_id = ? AND product_id = ?'
    )
      .bind(userId, productId)
      .first();
    
    if (!existingCartItem) {
      return new Response(JSON.stringify({ error: 'Cart item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (quantity <= 0) {
      // 如果数量为0或负数，删除购物车项
      await env.D1_DB.prepare(
        'DELETE FROM cart_items WHERE id = ?'
      )
        .bind(existingCartItem.id)
        .run();
    } else {
      // 更新购物车项数量
      await env.D1_DB.prepare(
        'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      )
        .bind(quantity, existingCartItem.id)
        .run();
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Cart updated successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update cart error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 从购物车中移除商品
export async function removeFromCart(request, env) {
  try {
    const { userId, productId } = await request.json();
    
    // 验证输入
    if (!userId || !productId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 检查购物车项是否存在
    const existingCartItem = await env.D1_DB.prepare(
      'SELECT id FROM cart_items WHERE user_id = ? AND product_id = ?'
    )
      .bind(userId, productId)
      .first();
    
    if (!existingCartItem) {
      return new Response(JSON.stringify({ error: 'Cart item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 从购物车中移除商品
    await env.D1_DB.prepare(
      'DELETE FROM cart_items WHERE id = ?'
    )
      .bind(existingCartItem.id)
      .run();
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Product removed from cart successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 清空购物车
export async function clearCart(request, env) {
  try {
    const { userId } = await request.json();
    
    // 验证输入
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 清空用户的购物车
    await env.D1_DB.prepare(
      'DELETE FROM cart_items WHERE user_id = ?'
    )
      .bind(userId)
      .run();
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Cart cleared successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}