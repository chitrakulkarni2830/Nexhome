const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to login
  await page.goto('http://localhost:5173/login');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'login_screen.png' });
  console.log('Login screen captured');
  
  // Navigate to register
  await page.goto('http://localhost:5173/register');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'register_screen.png' });
  console.log('Register screen captured');
  
  // Perform registration to enter dashboard
  await page.fill('input[placeholder="John Doe"]', 'Test User');
  await page.fill('input[placeholder="you@example.com"]', 'test2@example.com');
  await page.fill('input[placeholder="••••••••"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Wait for dashboard to load
  await page.waitForURL('**/dashboard');
  await page.waitForTimeout(1000);
  
  // Add a device
  await page.click('text="+ Add Device"');
  await page.fill('input[placeholder="e.g. Living Room Lamp"]', 'Smart Thermostat');
  await page.selectOption('select', 'thermostat');
  await page.click('button:has-text("Save")');
  await page.waitForTimeout(1000);
  
  // Add another device
  await page.click('text="+ Add Device"');
  await page.fill('input[placeholder="e.g. Living Room Lamp"]', 'Front Door Lock');
  await page.selectOption('select', 'lock');
  await page.click('button:has-text("Save")');
  await page.waitForTimeout(1000);

  // Capture dashboard
  await page.screenshot({ path: 'dashboard_screen.png' });
  console.log('Dashboard screen captured');

  await browser.close();
})();
