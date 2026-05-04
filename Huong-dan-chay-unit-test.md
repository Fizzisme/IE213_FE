# Hướng Dẫn Chạy Unit Test

## 1. Cài Đặt Dependencies (Lần đầu)

```bash
npm install
```

## 2. Chạy Unit Tests

### Chạy tất cả tests
```bash
npm test
```

### Chạy với UI (hiển thị giao diện test)
```bash
npm run test:ui
```

### Chạy với Coverage Report
```bash
npm run test:coverage
```

## 3. Viết Unit Test Mới

### Quy ước đặt tên file
```
Component.jsx      → Component.test.jsx
Hook.js            → Hook.test.js
utils.ts           → utils.test.ts
service.js         → service.test.js
```

### Cấu trúc file test cơ bản
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
    it('renders correctly', () => {
        render(<YourComponent />);
        expect(screen.getByText('Some text')).toBeInTheDocument();
    });
});
```

## 4. Xem Coverage Report

Sau khi chạy `npm run test:coverage`, mở file:
```
coverage/index.html
```

## 5. Mock Dependencies

Nếu cần mock API hoặc thư viện, thêm vào `src/test/mocks.js`

Ví dụ mock axios:
```js
vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));
```
