import { expect, test } from '@playwright/test';

test.use({ timezoneId: 'UTC' });

test('seeded mail fills every folder and includes a local attachment', async ({ page }) => {
    await page.goto('./');
    await page
        .getByRole('navigation', { name: 'Simulator channels' })
        .getByRole('button', { name: 'Email', exact: true })
        .click();
    const folders = page.locator('.prototype-mail-folders');
    for (const [name, count] of [
        ['Inbox', 5],
        ['Drafts', 2],
        ['Sent', 2],
        ['Trash', 1],
    ] as const) {
        const folder = folders.getByRole('button', { name: new RegExp(`^${name}`) });
        await expect(folder.locator('.prototype-folder-count')).toHaveText(String(count));
        await folder.click();
        await expect(page.locator('.prototype-mail-list > li')).toHaveCount(count);
        await page.getByRole('button', { name: 'Back', exact: true }).click();
    }
    await folders.getByRole('button', { name: /^Inbox/ }).click();
    await page.getByRole('button', { name: /A checklist for your first look/ }).click();
    await expect(page.getByText('CC: morgan@example.test', { exact: true })).toBeVisible();
    const attachment = page.getByRole('link', { name: 'demo-checklist.txt', exact: true });
    await expect(attachment).toHaveAttribute('download', 'demo-checklist.txt');
    await expect(attachment).toHaveAttribute('href', /^data:text\/plain;base64,/);
    const checklist = await attachment.evaluate((link) => {
        const encoded = link.getAttribute('href')?.split(',')[1];
        return encoded ? atob(encoded) : '';
    });
    expect(checklist).toContain('SIMULATOR DEMO CHECKLIST');
    expect(checklist).toContain('Reset the demo to restore the starting records.');
});

test('gallery photos show their own capture details without external requests', async ({
    page,
}) => {
    const externalRequests: string[] = [];
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route(/^https?:\/\//, (route) => {
        if (new URL(route.request().url()).hostname !== '127.0.0.1') {
            externalRequests.push(route.request().url());
            return route.abort();
        }
        return route.continue();
    });
    await page.goto('./');
    await page.getByRole('button', { name: 'Photos', exact: true }).click();
    await expect(page.locator('.prototype-gallery img')).toHaveCount(5);
    const photos = [
        {
            title: 'Raccoon cave',
            caption: 'Colored lights inside Raccoon cave near Chattanooga.',
            captured: '2026-08-19 15:56:41',
            displayed: '8/19/2026, 7:56:41 PM',
            zone: 'America/New_York',
            latitude: '35.0217',
            size: ['960 px', '1280 px'],
        },
        {
            title: 'Koh Samet hotel',
            caption: 'A hotel balcony overlooking the sea at Koh Samet.',
            captured: '2026-04-18 06:07:58',
            displayed: '4/17/2026, 11:07:58 PM',
            zone: 'Asia/Bangkok',
            latitude: '12.5672',
            size: ['960 px', '1280 px'],
        },
        {
            title: 'Relaxing squirrel',
            caption: 'A squirrel resting on a tree branch.',
            captured: '2026-04-04 14:30:24',
            displayed: '4/4/2026, 8:30:24 PM',
            zone: 'America/Denver',
            latitude: '39.7069',
            size: ['960 px', '1280 px'],
        },
        {
            title: 'Friendly cat',
            caption: 'A cat sitting on a hotel reception desk.',
            captured: '2025-02-16 07:22:34',
            displayed: '2/16/2025, 12:22:34 AM',
            zone: 'Asia/Bangkok',
            latitude: '12.7611',
            size: ['960 px', '1280 px'],
        },
        {
            title: 'Cartagena rooftop',
            caption: 'A rooftop view of Cartagena at night.',
            captured: '2023-02-24 21:13:23',
            displayed: '2/25/2023, 2:13:23 AM',
            zone: 'America/Bogota',
            latitude: '10.4229',
            size: ['1280 px', '960 px'],
        },
    ];
    for (const photo of photos) {
        const preview = page.getByRole('img', { name: photo.caption, exact: true });
        await expect(preview).toHaveAttribute('src', /^data:image\/jpeg;base64,/);
        await page.locator('.prototype-gallery button').filter({ has: preview }).click();
        const details = page.getByRole('article', { name: 'Photo details', exact: true });
        await expect(details).toContainText(photo.title);
        for (const dimension of photo.size) await expect(details).toContainText(dimension);
        await expect(details).toContainText(photo.displayed);
        const location = page.locator('.prototype-location-card');
        await expect(location).toContainText(
            photo.latitude ?? 'No location recorded for this photo.',
        );
        await page.getByRole('button', { name: 'Edit photo', exact: true }).click();
        await expect(page.getByLabel('Capture date and time', { exact: true })).toHaveValue(
            new RegExp(`^${photo.captured.replace(' ', 'T').slice(0, 16)}(?::\\d{2})?$`),
        );
        await expect(
            page.getByLabel('Capture time zone or UTC offset (blank if unknown)'),
        ).toHaveValue(photo.zone);
        await page.getByRole('button', { name: 'Back', exact: true }).click();
        await expect(page.locator('.prototype-gallery img')).toHaveCount(5);
    }
    expect(externalRequests).toEqual([]);
    expect(errors).toEqual([]);
});

test('seeded vault folders expose readable notes and dummy credentials', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Vault', exact: true }).click();
    const folders = page.getByRole('list', { name: 'Vault folders', exact: true });
    for (const name of ['Unfiled', 'Travel', 'Work']) {
        const folder = folders.getByRole('button', { name: new RegExp(`^${name}`) });
        await expect(folder.locator('.vault-folder-count')).toHaveText('2');
        await folder.click();
        await expect(
            page.getByRole('list', { name: 'Folder secrets', exact: true }).getByRole('button'),
        ).toHaveCount(2);
        await page.getByRole('button', { name: 'Back', exact: true }).click();
    }
    await folders.getByRole('button', { name: /^Travel/ }).click();
    await page.getByRole('button', { name: /Weekend packing list/ }).click();
    await expect(page.getByRole('combobox', { name: 'Type', exact: true })).toHaveValue('note');
    await expect(page.getByRole('textbox', { name: 'Notes', exact: true })).toHaveValue(
        /Water bottle/,
    );
    await expect(page.getByRole('textbox', { name: 'Notes', exact: true })).toHaveValue(
        /Picnic blanket/,
    );
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: /Example lodge guest portal/ }).click();
    await expect(page.getByRole('combobox', { name: 'Type', exact: true })).toHaveValue(
        'credentials',
    );
    await expect(page.getByRole('textbox', { name: 'Username', exact: true })).toHaveValue(
        'demo-guest',
    );
    await expect(page.getByRole('textbox', { name: 'Site', exact: true })).toHaveValue(
        'https://lodge.example.test',
    );
    await expect(page.getByLabel('Secret', { exact: true })).toHaveAttribute('type', 'password');
    await expect(page.getByLabel('Secret', { exact: true })).toHaveValue(
        'DEMO-LODGE-NOT-A-REAL-PASSWORD',
    );
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await folders.getByRole('button', { name: /^Unfiled/ }).click();
    await page.getByRole('button', { name: /Welcome note/ }).click();
    await expect(page.getByRole('textbox', { name: 'Notes', exact: true })).toHaveValue(
        /Reset demo restores these starting records/,
    );
});
