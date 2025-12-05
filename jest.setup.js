// jest.setup.js

// 导入 @testing-library/jest-dom 的匹配器。
// 这使得您可以直接在测试中使用如 toBeInTheDocument(), toHaveClass() 等断言。
import '@testing-library/jest-dom';

// 如果需要全局模拟某些浏览器 API 或对象（例如 Fetch API 或 ResizeObserver），
// 也可以在这里添加模拟代码。
// 示例：模拟 Fetch API (在集成测试中经常用到)
/*
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true }),
  })
);
*/