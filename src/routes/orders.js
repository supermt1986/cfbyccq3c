// 订单路由处理函数

// 获取用户订单列表
export async function getOrders(request, env) {
  try {
    // 从请求中获取用户ID（在实际应用中应该从认证信息中获取）
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 查询用户的订单
    const { results } = await env.D1_DB.prepare(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC'
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
    console.error('Get orders error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 获取订单详情
export async function getOrderDetail(request, env) {
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('orderId');
    
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Missing orderId parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 查询订单信息
    const order = await env.D1_DB.prepare(
      'SELECT * FROM orders WHERE id = ?'
    )
      .bind(orderId)
      .first();
    
    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 查询订单项
    const { results: orderItems } = await env.D1_DB.prepare(
      'SELECT oi.*, p.name as product_name, p.image_url as product_image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?'
    )
      .bind(orderId)
      .all();
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: {
        order: order,
        items: orderItems
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get order detail error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 创建订单
export async function createOrder(request, env) {
  try {
    const { userId, items, shippingAddress, paymentMethod } = await request.json();
    
    // 验证输入
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 开始数据库事务
    const txn = await env.D1_DB.batch([
      // 插入订单
      env.D1_DB.prepare(
        'INSERT INTO orders (user_id, total_amount, shipping_address, payment_method) VALUES (?, ?, ?, ?)'
      ).bind(userId, 0, shippingAddress, paymentMethod)
    ]);
    
    // 获取新创建的订单ID
    const orderId = txn[0].meta.last_row_id;
    
    // 计算总金额并插入订单项
    let totalAmount = 0;
    const orderItemQueries = [];
    
    for (const item of items) {
      // 获取商品信息
      const product = await env.D1_DB.prepare(
        'SELECT price, stock_quantity FROM products WHERE id = ?'
      )
        .bind(item.productId)
        .first();
      
      if (!product) {
        return new Response(JSON.stringify({ error: `Product with id ${item.productId} not found` }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // 检查库存
      if (product.stock_quantity < item.quantity) {
        return new Response(JSON.stringify({ error: `Insufficient stock for product ${item.productId}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      
      // 插入订单项
      orderItemQueries.push(
        env.D1_DB.prepare(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
        ).bind(orderId, item.productId, item.quantity, product.price)
      );
      
      // 更新商品库存
      orderItemQueries.push(
        env.D1_DB.prepare(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?'
        ).bind(item.quantity, item.productId)
      );
    }
    
    // 执行所有订单项插入和库存更新
    await env.D1_DB.batch(orderItemQueries);
    
    // 更新订单总金额
    await env.D1_DB.prepare(
      'UPDATE orders SET total_amount = ? WHERE id = ?'
    )
      .bind(totalAmount, orderId)
      .run();
    
    return new Response(JSON.stringify({ 
      success: true,
      orderId: orderId,
      totalAmount: totalAmount
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Create order error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 更新订单状态
export async function updateOrderStatus(request, env) {
  try {
    const { orderId, status } = await request.json();
    
    // 验证输入
    if (!orderId || !status) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 更新订单状态
    const result = await env.D1_DB.prepare(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    )
      .bind(status, orderId)
      .run();
    
    if (result.success) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Failed to update order status' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Update order status error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}