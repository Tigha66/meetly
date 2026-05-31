
import { test, expect } from '@playwright/test';

test.describe('Meetly Core Booking Flow', () => {
  test('Landing page loads', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/Meetly/);
    await expect(page.locator('h1')).toContainText('sells you first');
  });

  test('Guest booking page loads and shows host info', async ({ page }) => {
    await page.goto('http://localhost:3000/book/abdelhak/deep-dive');
    await expect(page.locator('h1')).toContainText('Abdelhak');
    await expect(page.locator('text=60-minute Deep Dive')).toBeVisible();
  });

  test('Dashboard layout renders sidebar', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await expect(page.locator('text=Overview')).toBeVisible();
    await expect(page.locator('text=Bookings')).toBeVisible();
  });
});
