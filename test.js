// 测试文件
import { registerUser, loginUser } from './src/routes/auth.js';

// 模拟环境变量
const mockEnv = {
  D1_DB: {
    prepare: (sql) => {
      return {
        bind: (...params) => {
          return {
            first: async () => {
              // 模拟数据库查询结果
              if (sql.includes('SELECT id FROM users')) {
                return null; // 用户不存在
              }
              return null;
            },
            run: async () => {
              // 模拟插入操作
              console.log('Database operation:', sql, params);
              return { success: true };
            }
          };
        }
      };
    }
  }
};

// 测试注册功能
async function testRegister() {
  console.log('Testing registration...');
  
  const mockRequest = {
    json: async () => ({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    })
  };
  
  try {
    const response = await registerUser(mockRequest, mockEnv);
    const result = await response.json();
    console.log('Registration result:', result);
  } catch (error) {
    console.error('Registration error:', error);
  }
}

// 运行测试
testRegister();