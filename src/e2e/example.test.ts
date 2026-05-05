import { test, expect } from '@playwright/test';

test.describe('Authentication Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/auth');
    });

    test('has correct title', async ({ page }) => {
        await expect(page).toHaveTitle(/Aegitas/);
    });

    test('renders logo', async ({ page }) => {
        const logo = page.getByRole('img', { name: 'logo' });
        await expect(logo).toBeVisible();
    });

    test('has MetaMask login button', async ({ page }) => {
        const btn = page.getByRole('button', { name: /Đăng nhập bằng MetaMask/i });
        await expect(btn).toBeVisible();
    });

    test('has carousel slides', async ({ page }) => {
        const slides = page.locator('.bg-primary .absolute');
        await expect(slides.first()).toBeVisible();
    });

    test('has quote section', async ({ page }) => {
        await expect(page.getByText(/Not your keys, not your crypto/i)).toBeVisible();
    });
});
