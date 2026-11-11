import { test, expect } from '@playwright/test';

test('contacts can be added, edited and deleted with the shared editor', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('./');
    const channels = page.getByRole('navigation', { name: 'Simulator channels' });
    const openContacts = async () => {
        // Saving an edit returns to the list; other flows return Home.
        if (await page.getByRole('searchbox', { name: 'Search contacts' }).isVisible()) return;
        await channels.getByRole('button', { name: 'Phone', exact: true }).click();
        await page.getByRole('button', { name: 'Contacts', exact: true }).click();
    };

    await openContacts();
    await page.getByRole('button', { name: 'Add contact', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Add contact', level: 2 })).toBeVisible();
    await page.getByLabel('First name', { exact: true }).fill('Riley');
    await page.getByLabel('Last name', { exact: true }).fill('Demo');
    await page.getByRole('button', { name: 'Add phone', exact: true }).click();
    await page.getByRole('textbox', { name: 'Phone 1', exact: true }).fill('+12025550199');
    await page.getByRole('button', { name: 'Save contact', exact: true }).click();

    await openContacts();
    await page.getByRole('button', { name: /Riley Demo/ }).click();
    await expect(page.getByRole('button', { name: 'Edit contact', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Edit contact', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Edit contact', level: 2 })).toBeVisible();
    await expect(page.getByLabel('First name', { exact: true })).toHaveValue('Riley');
    await page.getByLabel('Last name', { exact: true }).fill('Example');
    await page.getByRole('button', { name: 'Save contact', exact: true }).click();

    await openContacts();
    await expect(page.getByRole('button', { name: /Riley Demo/ })).toHaveCount(0);
    await page.getByRole('button', { name: /Riley Example/ }).click();
    await page.getByRole('button', { name: 'Delete contact', exact: true }).click();
    await openContacts();
    await expect(page.getByRole('button', { name: /Riley Example/ })).toHaveCount(0);
    expect(errors).toEqual([]);
});

test('saved call history shows readable related times', async ({ page }) => {
    await page.goto('./');
    const channels = page.getByRole('navigation', { name: 'Simulator channels' });
    await channels.getByRole('button', { name: 'Phone', exact: true }).click();
    await page.locator('button[data-simulator-history-id="demo-call"]').click();
    const detail = page.locator('.simulator-history-detail');
    await expect(detail).toBeVisible();
    await expect(detail).not.toContainText('T12:00:00.000Z');
    await expect(detail.locator('.simulator-history-detail__time')).toContainText(
        /\d{1,2}\/\d{1,2}\/\d{4}/,
    );
    await expect(page.locator('.simulator-phone-history-screen')).toContainText('Missed');
    await expect(page.locator('button[data-simulator-history-id]')).toHaveCount(0);
});
