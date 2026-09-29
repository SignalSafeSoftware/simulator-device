import { test, expect } from '@playwright/test';

test('standalone packages preserve drafts across calls and support local apps', async ({
    page,
}) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await page.getByRole('button', { name: /Unfiled/ }).click();
    await page.getByRole('button', { name: 'New secret' }).click();
    await page.getByLabel('Title', { exact: true }).fill('Standalone secret');
    await page.getByLabel('Secret', { exact: true }).fill('synthetic-only');
    await page.getByRole('button', { name: 'Simulate call overlay' }).click();
    await expect(page.getByLabel('Title', { exact: true })).toBeHidden();
    await page.getByRole('button', { name: 'End synthetic call' }).click();
    await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Standalone secret');
    await page.getByRole('button', { name: 'Save secret' }).click();
    await expect(page.getByRole('button', { name: /Standalone secret/ })).toBeVisible();
    const apps = page.getByRole('navigation', { name: 'Demo apps' });
    await apps.getByRole('button', { name: 'Mail', exact: true }).click();
    await page.getByRole('button', { name: 'Compose', exact: true }).click();
    await page.getByLabel('TO', { exact: true }).fill('synthetic@example.test');
    await page.getByLabel('Subject', { exact: true }).fill('Standalone mail');
    await page.getByRole('textbox', { name: 'Body', exact: true }).fill('Local only');
    await page.getByRole('button', { name: 'Save draft' }).click();
    await page.getByRole('button', { name: /Standalone mail/ }).click();
    await page.getByRole('button', { name: 'Edit draft' }).click();
    await page.getByRole('button', { name: 'Send simulated email' }).click();
    await expect(page.getByRole('button', { name: /Standalone mail/ })).toBeVisible();
    await apps.getByRole('button', { name: 'Settings' }).click();
    await page.getByLabel('New password', { exact: true }).fill('synthetic-password');
    await page.getByLabel('Confirm password', { exact: true }).fill('synthetic-password');
    await page.getByRole('button', { name: 'Save screen password' }).click();
    await expect(page.getByText('Screen password saved.', { exact: true })).toBeVisible();
    await apps.getByRole('button', { name: 'Photos' }).click();
    await expect(page.getByText('No photos saved.')).toBeVisible();
    const png = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 12;
        return canvas.toDataURL('image/png').split(',')[1]!;
    });
    await page
        .getByLabel('Add photo')
        .setInputFiles({
            name: 'Synthetic.png',
            mimeType: 'image/png',
            buffer: Buffer.from(png, 'base64'),
        });
    await page.getByLabel('Title', { exact: true }).fill('Standalone photo');
    await page.getByRole('button', { name: 'Save photo' }).click();
    await expect(page.getByRole('button', { name: /Standalone photo/ })).toBeVisible();
    await apps.getByRole('button', { name: 'Internet' }).click();
    await page.frameLocator('iframe').getByLabel('Search', { exact: true }).fill('bridge search');
    await page.frameLocator('iframe').getByRole('button', { name: 'Search', exact: true }).click();
    await expect(
        page.frameLocator('iframe').getByText('You searched for: bridge search'),
    ).toBeVisible();
    const address = page.getByRole('searchbox', { name: 'Search or enter address' });
    await address.fill('standalone search');
    await address.press('Enter');
    await expect(
        page.frameLocator('iframe').getByText('You searched for: standalone search'),
    ).toBeVisible();
    await apps.getByRole('button', { name: 'Vault', exact: true }).click();
    await page.getByRole('button', { name: /Unfiled/ }).click();
    await expect(page.getByRole('button', { name: /Standalone secret/ })).toBeVisible();
    expect(errors).toEqual([]);
});
