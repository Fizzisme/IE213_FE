# Testing

## Tech Stack

| Type | Framework/Tool | Purpose |
|------|----------------|---------|
| Unit Test | Vitest + React Testing Library | Test từng component, hook, function độc lập |
| E2E Test | Playwright | Test luồng user hoàn chỉnh, cross-browser |
| Coverage | Vitest (built-in) | Đo lường độ bao phủ code |

## Installation

```bash
npm install
```

## Commands

### Unit Tests

```bash
# Chạy unit tests
npm test

# Chạy với UI
npm run test:ui

# Chạy với coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Chạy E2E tests (headless)
npm run test:e2e

# Chạy với Playwright UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug

# Chạy với Chromium (mặc định)
npm run test:e2e -- --project=chromium
```

### Combined

```bash
# Chạy cả Unit + E2E tests
npm test && npx playwright test

# Chạy unit tests với coverage + E2E
npm run test:coverage && npx playwright test
```

## Writing Tests

### Unit Test Pattern

1. Đặt file test **cùng cấp** với file được test:
   - `Component.jsx` → `Component.test.jsx`
   - `utils.ts` → `utils.test.ts`

2. Sử dụng `@testing-library/react` để render components

3. Mock các dependencies trong `src/test/mocks.js`

**Ví dụ:**
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button.tsx';

describe('Button', () => {
    it('renders children correctly', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        fireEvent.click(screen.getByText('Click me'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
```

### E2E Test Pattern

1. Đặt file test trong `src/e2e/`

2. Sử dụng Playwright API để test luồng user thực

3. Chạy dev server tự động qua `webServer` config

**Ví dụ:**
```ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/auth');
    });

    test('has MetaMask login button', async ({ page }) => {
        const btn = page.getByRole('button', { name: /Đăng nhập bằng MetaMask/i });
        await expect(btn).toBeVisible();
    });
});
```

## Coverage Report

Sau khi chạy `npm run test:coverage`, mở file `coverage/index.html` trong trình duyệt để xem chi tiết.