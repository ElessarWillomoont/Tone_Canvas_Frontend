// jest.config.js

const nextJest = require('next/jest');

// 1. 创建 Next.js 的 Jest 配置函数
// dir: './' 指明 Next.js 配置的根目录是项目根目录
const createJestConfig = nextJest({
  dir: './',
});

// 2. 自定义 Jest 配置
const customJestConfig = {
  // 自动导入 setup 文件，使得 @testing-library/jest-dom 的断言全局可用
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // 指定测试环境为 jsdom，模拟浏览器 DOM 环境，适用于 React 组件测试
  testEnvironment: 'jest-environment-jsdom',
  
  // 配置模块别名，匹配您的 tsconfig.json 中的路径别名（例如：@/components）
  // 确保 Jest 能够识别和解析您的自定义导入路径
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/contexts/(.*)$': '<rootDir>/contexts/$1',
    // 如果您有其他路径别名，请在此处添加
  },
  
  // 忽略 Next.js 的构建目录和 node_modules
  testPathIgnorePatterns: [
    '<rootDir>/.next/', 
    '<rootDir>/node_modules/',
  ],

  // 确保所有 .tsx 和 .ts 文件都被识别为测试路径
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)', 
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
};

// 3. 将自定义配置传递给 Next.js 的配置函数并导出
module.exports = createJestConfig(customJestConfig);