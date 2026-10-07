import { test, expect } from '@playwright/test';

test('standalone packages preserve drafts across calls and support local apps', async ({
    page,
}) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('./');
    const channels = page.getByRole('navigation', { name: 'Simulator channels' });
    await page.getByRole('button', { name: 'Vault', exact: true }).click();
    await page.getByRole('button', { name: /Unfiled/ }).click();
    await page.getByRole('button', { name: 'New secret' }).click();
    await page.getByLabel('Title', { exact: true }).fill('Standalone secret');
    await page.getByLabel('Secret', { exact: true }).fill('synthetic-only');
    await page.getByRole('button', { name: 'Simulate call overlay' }).click();
    await expect(page.getByLabel('Title', { exact: true })).toBeHidden();
    await page.getByRole('button', { name: 'Decline call', exact: true }).click();
    await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Standalone secret');
    await page.getByRole('button', { name: 'Save secret' }).click();
    await expect(page.getByRole('button', { name: /Standalone secret/ })).toBeVisible();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await channels.getByRole('button', { name: 'Email', exact: true }).click();
    await page.getByRole('button', { name: 'Compose', exact: true }).click();
    await page.getByLabel('TO', { exact: true }).fill('synthetic@example.test');
    await page.getByLabel('Subject', { exact: true }).fill('Standalone mail');
    await page.getByRole('textbox', { name: 'Body', exact: true }).fill('Local only');
    await page.getByRole('button', { name: 'Save draft' }).click();
    await page.getByRole('button', { name: /Standalone mail/ }).click();
    await page.getByRole('button', { name: 'Edit draft' }).click();
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByRole('button', { name: /Standalone mail/ })).toBeVisible();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await page.getByLabel('New password', { exact: true }).fill('synthetic-password');
    await page.getByLabel('Confirm password', { exact: true }).fill('synthetic-password');
    await page.getByRole('button', { name: 'Save screen password' }).click();
    await page.getByLabel('Screen password', { exact: true }).fill('synthetic-password');
    await page.getByRole('button', { name: 'Unlock', exact: true }).click();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: 'Photos', exact: true }).click();
    await expect(
        page.getByRole('img', { name: 'Colored lights inside Raccoon cave near Chattanooga.' }),
    ).toBeVisible();
    const png = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 12;
        return canvas.toDataURL('image/png').split(',')[1]!;
    });
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Add photo', exact: true }).click();
    await (
        await chooser
    ).setFiles({
        name: 'Synthetic.png',
        mimeType: 'image/png',
        buffer: Buffer.from(png, 'base64'),
    });
    await page.getByLabel('Title', { exact: true }).fill('Standalone photo');
    await page.getByRole('button', { name: 'Save photo' }).click();
    await expect(page.getByRole('button', { name: /Standalone photo/ })).toBeVisible();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await channels.getByRole('button', { name: 'Internet', exact: true }).click();
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
    await channels.getByRole('button', { name: 'Home', exact: true }).click();
    await page.getByRole('button', { name: 'Vault', exact: true }).click();
    await page.getByRole('button', { name: /Unfiled/ }).click();
    await expect(page.getByRole('button', { name: /Standalone secret/ })).toBeVisible();
    expect(errors).toEqual([]);
});
