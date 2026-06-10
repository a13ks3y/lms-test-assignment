import { expect, test } from '@playwright/test';

test.describe('Enrollment queue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Enrolment Request Queue')).toBeVisible();
  });

  test('filters update visible counters and list items', async ({ page }) => {
    await expect(page.locator('[data-test="status-filter"]')).toHaveValue('all');

    await page.locator('[data-test="status-filter"]').selectOption('approved');
    const visibleTotal = Number(await page.locator('[data-test="count-total"]').textContent());
    const visibleApproved = Number(await page.locator('[data-test="count-approved"]').textContent());
    expect(visibleApproved).toBeGreaterThanOrEqual(1);
    expect(visibleTotal).toBe(visibleApproved);

    const items = page.locator('li[app-request-item]');
    await expect(items).toHaveCount(visibleTotal);
    await expect(items.locator('.badge-status')).toHaveText(Array(visibleTotal).fill('Approved'));
  });

  test('approve action updates status and footer counts', async ({ page }) => {
    await page.locator('[data-test="status-filter"]').selectOption('all');

    const pendingBefore = Number(await page.locator('[data-test="count-pending"]').textContent());
    const approvedBefore = Number(await page.locator('[data-test="count-approved"]').textContent());

    const pendingItem = page.locator('li[app-request-item]').filter({ has: page.locator('.badge-status', { hasText: 'Pending' }) }).first();
    const itemId = await pendingItem.getAttribute('data-request-id');
    const selectedRow = page.locator(`li[app-request-item][data-request-id="${itemId}"]`);

    await expect(selectedRow.locator('button', { hasText: 'Approve' })).toBeEnabled();
    await selectedRow.locator('button', { hasText: 'Approve' }).click();
    await expect(selectedRow.locator('.badge-status')).toHaveText('Approved');
    await expect(selectedRow.locator('button', { hasText: 'Approve' })).toBeDisabled();

    await expect(page.locator('[data-test="count-approved"]')).toHaveText(String(approvedBefore + 1));
    await expect(page.locator('[data-test="count-pending"]')).toHaveText(String(pendingBefore - 1));
  });

  test('blocks approval/rejection for cross-college requests', async ({ page }) => {
    await page.locator('[data-test="user-select"]').selectOption('501');
    const crossCollegeRow = page.locator('li[app-request-item][data-request-id="9006"]');

    await expect(crossCollegeRow).toBeVisible();
    await expect(crossCollegeRow.locator('button', { hasText: 'Approve' })).toBeDisabled();
    await expect(crossCollegeRow.locator('button', { hasText: 'Reject' })).toBeDisabled();
    await expect(crossCollegeRow.locator('.request-warning')).toHaveText(
      'This request belongs to a different college and cannot be approved or rejected.',
    );
  });

  test('shows empty state when filters match no requests', async ({ page }) => {
    await page.locator('[data-test="status-filter"]').selectOption('approved');
    await page.locator('[data-test="branch-filter"]').selectOption('Health');

    await expect(page.locator('[data-test="empty-state"]')).toBeVisible();
    await expect(page.locator('[data-test="count-total"]')).toHaveText('0');
    await expect(page.locator('li[app-request-item]')).toHaveCount(0);
  });
});
