import { test, expect } from '@playwright/test';

test.describe('Photo Capture Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to photos page', async ({ page }) => {
    // Click on Photos link in navigation
    await page.click('text=Photos');

    // Wait for navigation to complete
    await page.waitForURL('/photos');

    // Verify URL
    await expect(page).toHaveURL('/photos');

    // Verify page title
    await expect(page.locator('h1')).toContainText('Photo Tracking');
  });

  test('should display empty state when no photos exist', async ({ page }) => {
    await page.goto('/photos');

    // Should show empty state message
    await expect(page.locator('text=No photos yet')).toBeVisible();
    await expect(page.locator('text=Take Your First Photo')).toBeVisible();
  });

  test('should navigate to photo capture wizard', async ({ page }) => {
    await page.goto('/photos');

    // Click "Take Photo" button
    await page.click('text=Take Photo');

    // Verify navigation to capture page
    await expect(page).toHaveURL('/photos/capture');

    // Verify step 1 is active (Select Body Area)
    await expect(page.locator('text=Select Body Area')).toBeVisible();
  });

  test('should complete body area selection step', async ({ page }) => {
    await page.goto('/photos/capture');

    // Verify body area options are displayed
    await expect(page.locator('text=Face (Front View)')).toBeVisible();
    await expect(page.locator('text=Left Hand')).toBeVisible();

    // Select a body area
    await page.click('text=Left Hand');

    // Verify selection is highlighted
    const selectedButton = page.locator('button:has-text("Left Hand")');
    await expect(selectedButton).toHaveClass(/border-primary/);

    // Click continue button
    await page.click('text=Continue to Camera');

    // Verify navigation to camera capture step
    await expect(page.locator('text=Capture Photo')).toBeVisible();
    await expect(page.locator('text=Taking photo of: Left Hand')).toBeVisible();
  });

  test('should handle custom body area', async ({ page }) => {
    await page.goto('/photos/capture');

    // Select custom body area
    await page.click('text=Custom Area');

    // Custom description field should appear
    await expect(page.locator('input[placeholder*="forearm"]')).toBeVisible();

    // Fill in custom description
    await page.fill('input[placeholder*="forearm"]', 'Rash on left arm near elbow');

    // Continue button should be enabled
    const continueButton = page.locator('text=Continue to Camera');
    await expect(continueButton).toBeEnabled();

    await continueButton.click();

    // Verify we're on camera step
    await expect(page.locator('text=Capture Photo')).toBeVisible();
    // Verify body area is mentioned (either "Custom" or with description)
    await expect(page.locator('text=Taking photo of:')).toBeVisible();
  });

  test('should show camera controls', async ({ page }) => {
    await page.goto('/photos/capture');

    // Select body area
    await page.click('text=Left Hand');
    await page.click('text=Continue to Camera');

    // Verify camera controls are present
    await expect(page.locator('text=Start Camera')).toBeVisible();
    await expect(page.locator('text=Upload from Device')).toBeVisible();
  });

  test('should allow file upload', async ({ page }) => {
    await page.goto('/photos/capture');

    // Select body area and continue
    await page.click('text=Left Hand');
    await page.click('text=Continue to Camera');

    // Note: We can't actually upload a file in this test without a real file
    // But we can verify the upload button exists
    await expect(page.locator('text=Upload from Device')).toBeVisible();
  });

  test('should have back button in camera step', async ({ page }) => {
    await page.goto('/photos/capture');

    // Navigate to camera step
    await page.click('text=Left Hand');
    await page.click('text=Continue to Camera');

    // Verify back button exists
    const backButton = page.locator('text=Back');
    await expect(backButton).toBeVisible();

    // Click back
    await backButton.click();

    // Should return to body area selection
    await expect(page.locator('text=Select Body Area')).toBeVisible();
  });

  test('should display step progress indicator', async ({ page }) => {
    await page.goto('/photos/capture');

    // Verify all 3 steps are shown
    await expect(page.locator('text=Select Area')).toBeVisible();
    await expect(page.locator('text=Capture')).toBeVisible();
    await expect(page.locator('text=Edit & Save')).toBeVisible();

    // Step 1 should be active
    const step1 = page.locator('div:has-text("Select Area")').first();
    await expect(step1).toBeVisible();
  });

  test('should navigate back to photos list on cancel', async ({ page }) => {
    await page.goto('/photos/capture');

    // Click cancel
    await page.click('text=Cancel');

    // Should return to photos page
    await expect(page).toHaveURL('/photos');
  });
});

test.describe('Navigation', () => {
  test('should navigate between main pages', async ({ page }) => {
    await page.goto('/');

    // Test each navigation link
    const pages = [
      { link: 'Photos', heading: 'Photo Tracking' },
      { link: 'Symptoms', heading: 'Symptom Journal' },
      { link: 'Supplements', heading: 'Supplement Tracking' },
      { link: 'Meals', heading: 'Food & Meal Tracking' },
      { link: 'Analysis', heading: 'AI Analysis' },
      { link: 'Reports', heading: 'Medical Reports' },
    ];

    for (const { link, heading } of pages) {
      await page.click(`text=${link}`);
      await expect(page.locator('h1')).toContainText(heading);
    }
  });

  test('should highlight active nav item', async ({ page }) => {
    await page.goto('/');

    // Navigate to Photos
    await page.click('text=Photos');

    // Photos nav link should be highlighted
    const photosLink = page.locator('nav a:has-text("Photos")').first();
    await expect(photosLink).toHaveClass(/border-primary/);
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');

    // Should have h1
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Welcome to Symptiq');
  });

  test('should have accessible buttons', async ({ page }) => {
    await page.goto('/photos');

    // All buttons should have text or aria-label
    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      expect(text || ariaLabel).toBeTruthy();
    }
  });
});
