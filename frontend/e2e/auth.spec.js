import { test, expect } from '@playwright/test';

test('navigate to login page and see login form', async ({ page }) => {
  await page.goto('/login');
  
  // Check title
  await expect(page.locator('h2')).toContainText('Welcome Back');
  
  // Check inputs
  await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
  await expect(page.getByPlaceholder('••••••••')).toBeVisible();
  
  // Check button
  await expect(page.locator('button[type="submit"]')).toContainText('Sign In');
});

test('navigate to register page and see register form', async ({ page }) => {
  await page.goto('/register');
  
  // Check title
  await expect(page.locator('h2')).toContainText('Create Account');
  
  // Check inputs
  await expect(page.getByPlaceholder('John Doe')).toBeVisible();
  await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
  await expect(page.getByPlaceholder('••••••••')).toBeVisible();
  
  // Check button
  await expect(page.locator('button[type="submit"]')).toContainText('Sign Up');
});
