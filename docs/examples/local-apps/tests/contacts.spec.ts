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

test('incoming call history shows readable times', async ({ page }) => {
    await page.goto('./');
    const channels = page.getByRole('navigation', { name: 'Simulator channels' });
    await channels.getByRole('button', { name: 'Phone', exact: true }).click();
    await page.getByRole('button', { name: 'Incoming call', exact: true }).click();
    const history = page.getByRole('region', { name: 'Previous calls' });
    await expect(history).toBeVisible();
    await expect(history).not.toContainText('T12:00:00.000Z');
    await expect(history.getByRole('cell').first()).toContainText(/\d{1,2}\/\d{1,2}\/\d{4}/);
});
