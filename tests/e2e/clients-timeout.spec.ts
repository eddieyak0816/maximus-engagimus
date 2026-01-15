import { test, expect } from '@playwright/test';

test('shows error UI when clients API times out', async ({ page }) => {
  // Ensure dev mock auth + dark theme so page renders clients view
  await page.addInitScript(() => {
    localStorage.setItem('dev:mockAuth', 'true');
    localStorage.setItem('theme', 'dark');
  });

  // Intercept Supabase clients request and delay it beyond our 10s timeout
  await page.route('**/rest/v1/clients*', async (route) => {
    // delay > 10s to trigger the timeout path in useClients
    await new Promise((r) => setTimeout(r, 11000));
    await route.fulfill({ status: 500, body: 'Server error' });
  });

  // Navigate to the clients page
  await page.goto('/clients');

  // Wait for the error message to appear (timeout set to 20s in config)
  await expect(page.locator('text=Failed to load clients')).toBeVisible();
  await expect(page.locator('text=Try Again')).toBeVisible();
});
