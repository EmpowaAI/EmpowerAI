import { test, expect } from '@playwright/test'

test('landing page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/EmpowaAI/i)
  await expect(page.locator('#root')).toBeVisible()
})
