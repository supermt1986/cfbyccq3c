export async function registerUser(request, env) {
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

export async function loginUser(request, env) {
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