import { expect, test } from '@playwright/test';

// Make the browser's default regional time zone deterministic; the app still uses the viewer's zone.
test.use({ timezoneId: 'UTC' });

test('default data loads under the Pages path and reset removes local edits', async ({ page }) => {
    const errors: string[] = [];
    const externalRequests: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route(/^https?:\/\//, (route) => {
        if (new URL(route.request().url()).hostname !== '127.0.0.1') {
            externalRequests.push(route.request().url());
            return route.abort();
        }
        return route.continue();
    });
    await page.goto('./');
    await expect(page.getByRole('heading', { name: 'Home', exact: true })).toBeVisible();
    const clock = page.locator('.prototype-home-clock');
    await expect(clock).toHaveCount(1);
    await expect(clock).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}T/);
    const initialTime = await clock.getAttribute('datetime');
    await expect.poll(() => clock.getAttribute('datetime')).not.toBe(initialTime);
    const channels = page.getByRole('navigation', { name: 'Simulator channels' });
    await expect(page.getByRole('navigation', { name: 'Demo apps' })).toHaveCount(0);
    for (const name of ['Settings', 'Vault', 'Photos']) {
        await expect(
            page.locator('.simulator-home-screen').getByRole('button', { name, exact: true }),
        ).toBeVisible();
    }
    await channels.getByRole('button', { name: 'Email', exact: true }).click();
    await page.getByRole('button', { name: /^Inbox/ }).click();
    await expect(page.getByRole('button', { name: /Your simulator demo is ready/ })).toBeVisible();
    await page.getByRole('button', { name: 'Compose', exact: true }).click();
    await page.getByLabel('TO', { exact: true }).fill('demo@example.test');
    await page.getByLabel('Subject', { exact: true }).fill('Temporary draft');
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    await expect(page.getByRole('button', { name: /Temporary draft/ })).toBeVisible();
    await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Home', exact: true })).toBeVisible();
    await expect(page.getByRole('status')).toContainText('Default data restored');
    await channels.getByRole('button', { name: 'Email', exact: true }).click();
    await page.getByRole('button', { name: /^Inbox/ }).click();
    await expect(page.getByRole('button', { name: /Your simulator demo is ready/ })).toBeVisible();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: /^Drafts/ }).click();
    await expect(page.getByRole('button', { name: /Temporary draft/ })).toHaveCount(0);
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: 'Vault', exact: true }).click();
    await page.getByRole('button', { name: /Unfiled/ }).click();
    await expect(page.getByRole('button', { name: /Welcome note/ })).toBeVisible();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: 'Photos', exact: true }).click();
    await expect(
        page.getByRole('img', { name: 'Colored lights inside Raccoon cave near Chattanooga.' }),
    ).toBeVisible();
    expect(externalRequests).toEqual([]);
    expect(errors).toEqual([]);
});

test('shared settings keep PhoneMe tools out, apply preferences, and reset with the demo', async ({
    page,
}) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    for (const name of ['Appearance', 'Region and formats', 'Screen password']) {
        await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    }
    await expect(page.getByText('Twilio credentials', { exact: true })).toHaveCount(0);
    for (const name of [
        'Merge duplicate contacts',
        'Blocked simulator numbers',
        'Simulated device data',
    ]) {
        await expect(page.getByRole('heading', { name, exact: true })).toHaveCount(0);
    }
    for (const name of [
        'Review duplicates',
        'Refresh blocked numbers',
        'Save email identity',
        'Download simulator backup',
        'Reset simulated records',
    ]) {
        await expect(page.getByRole('button', { name, exact: true })).toHaveCount(0);
    }
    await page.getByRole('combobox', { name: 'Theme', exact: true }).selectOption('ocean');
    const device = page.locator('.simulator-host-device');
    await expect(device).not.toHaveAttribute('style', /#f2f7fc/);
    await page.getByRole('button', { name: 'Apply appearance', exact: true }).click();
    await expect(device).toHaveAttribute('style', /#f2f7fc/);
    await page.getByRole('combobox', { name: 'Time format', exact: true }).selectOption('24');
    await page.getByRole('combobox', { name: 'Time zone', exact: true }).selectOption('UTC');
    await page.getByRole('button', { name: 'Save regional settings', exact: true }).click();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    const clock = page.locator('.prototype-home-clock');
    await expect(clock.locator('strong')).not.toContainText(/AM|PM/);
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Time format', exact: true })).toHaveValue(
        '24',
    );
    await page.getByRole('button', { name: 'Reset appearance', exact: true }).click();
    await expect(device).not.toHaveAttribute('style', /#f2f7fc/);
    await expect(page.getByRole('combobox', { name: 'Theme', exact: true })).toHaveValue('night');
    await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Time format', exact: true })).toHaveValue(
        '12',
    );
    await expect(
        page.getByRole('heading', { name: 'Simulated device data', exact: true }),
    ).toHaveCount(0);
});

test('contact details use the shared photo card and value groups', async ({ page }) => {
    await page.goto('./');
    await page
        .getByRole('navigation', { name: 'Simulator channels' })
        .getByRole('button', { name: 'Phone', exact: true })
        .click();
    await page.getByRole('button', { name: 'Contacts', exact: true }).click();
    await page.getByRole('button', { name: /Taylor Example/ }).click();
    const detail = page.locator('.simulator-contact-detail');
    await expect(detail.getByRole('article', { name: 'Taylor Example' })).toBeVisible();
    await expect(detail.locator('.contact-detail-card__photo')).toHaveCount(1);
    await expect(detail.getByRole('heading', { name: 'Phone numbers' })).toBeVisible();
    await expect(detail.getByRole('heading', { name: 'Email addresses' })).toBeVisible();
    await expect(detail.getByText('taylor@example.test', { exact: true })).toBeVisible();
    for (const [width, textSize] of [
        [320, 16],
        [430, 16],
        [320, 32],
        [430, 32],
    ] as const) {
        await page.setViewportSize({ width, height: 844 });
        await page.evaluate((size) => {
            document.documentElement.style.fontSize = `${size}px`;
        }, textSize);
        const issues = await detail.evaluate((root) => {
            const bounds = root.getBoundingClientRect();
            const problems = Array.from(
                root.querySelectorAll(
                    '.contact-detail-card, .contact-detail-list, button, h2, p, svg',
                ),
            ).flatMap((element) => {
                const rect = element.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return [];
                return rect.left < bounds.left - 1 || rect.right > bounds.right + 1
                    ? [`${element.tagName}: outside contact screen`]
                    : [];
            });
            const content = root.querySelector('.simulator-contact-detail__content');
            if (!content) return [...problems, 'Missing contact content'];
            const contentBounds = content.getBoundingClientRect();
            const inset = Number.parseFloat(getComputedStyle(content).paddingLeft);
            for (const card of root.querySelectorAll(
                '.contact-detail-card, .contact-detail-list',
            )) {
                const rect = card.getBoundingClientRect();
                if (
                    Math.abs(rect.left - contentBounds.left - inset) > 1 ||
                    Math.abs(contentBounds.right - rect.right - inset) > 1
                )
                    problems.push('Doubled or missing card inset');
            }
            const avatar = root.querySelector('.contact-detail-card__photo svg');
            if (!avatar || avatar.getBoundingClientRect().width < 40)
                problems.push('Missing or collapsed contact avatar');
            return problems;
        });
        expect(issues).toEqual([]);
    }
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(detail).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Taylor Example/ })).toBeVisible();
});

test('saved history shares regional formatting in Call History and Call Details', async ({
    page,
}) => {
    await page.goto('./');
    await page
        .getByRole('navigation', { name: 'Simulator channels' })
        .getByRole('button', { name: 'Phone', exact: true })
        .click();
    await expect(page.getByRole('heading', { name: 'Call History', exact: true })).toHaveCount(1);
    const historyRow = page.locator('button[data-simulator-history-id="demo-call"]');
    await expect(historyRow).toBeVisible();
    await expect(historyRow).toContainText('(202) 555-0123');
    await expect(historyRow).toContainText('10/5/2026, 12:00:00 PM');
    await expect(historyRow).toContainText('3m 4s');
    await expect(historyRow).not.toContainText('2026-10-05T12:00:00.000Z');
    await historyRow.click();
    const title = page.getByRole('heading', { name: 'Call Details', exact: true });
    await expect(title).toBeFocused();
    const detail = page.locator('.simulator-history-detail');
    await expect(detail.getByText('Taylor Example', { exact: true })).toBeVisible();
    await expect(detail.locator('.simulator-history-detail__number')).toHaveText(
        'Mobile · (202) 555-0123',
    );
    await expect(detail.locator('.simulator-history-detail__time')).toHaveText(
        '10/5/2026, 12:00:00 PM',
    );
    await expect(page.locator('.simulator-phone-history-screen')).toContainText('3m 4s');
    await expect(page.getByRole('button', { name: 'Incoming call', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Voicemail', exact: true })).toHaveCount(0);
    await expect(page.locator('button[data-simulator-history-id]')).toHaveCount(0);
    await expect(page.locator('.simulator-phone-history-row[aria-current]')).toHaveCount(0);
    for (const [width, size] of [
        [320, 16],
        [430, 16],
        [320, 32],
        [430, 32],
    ] as const) {
        await page.setViewportSize({ width, height: 844 });
        await page.evaluate((textSize) => {
            document.documentElement.style.fontSize = `${textSize}px`;
        }, size);
        const issues = await detail.evaluate((root) => {
            const bounds = root.getBoundingClientRect();
            return Array.from(root.querySelectorAll('h3, p, button, svg')).flatMap((element) => {
                const rect = element.getBoundingClientRect();
                return rect.width &&
                    rect.height &&
                    (rect.left < bounds.left - 1 || rect.right > bounds.right + 1)
                    ? [element.tagName]
                    : [];
            });
        });
        expect(issues).toEqual([]);
    }
    const back = page.getByRole('button', { name: 'Back', exact: true });
    await expect(back).toHaveCount(1);
    await back.click();
    await expect(title).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Call History', exact: true })).toHaveCount(1);
    await expect(historyRow).toBeFocused();
    await expect(page.getByRole('button', { name: 'Incoming call', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Voicemail', exact: true })).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => {
        document.documentElement.style.fontSize = '16px';
    });
    await back.click();
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await page.getByRole('combobox', { name: 'Date format', exact: true }).selectOption('dmy');
    await page.getByRole('combobox', { name: 'Time format', exact: true }).selectOption('24');
    await page
        .getByRole('combobox', { name: 'Time zone', exact: true })
        .selectOption('America/Denver');
    await page.getByRole('button', { name: 'Save regional settings', exact: true }).click();
    await back.click();
    await page
        .getByRole('navigation', { name: 'Simulator channels' })
        .getByRole('button', { name: 'Phone', exact: true })
        .click();
    await expect(historyRow).toContainText('(202) 555-0123');
    await expect(historyRow).toContainText('05/10/2026, 06:00:00');
    await expect(historyRow).toContainText('3m 4s');
    await expect(historyRow).not.toContainText(/AM|PM/);
    await historyRow.click();
    await expect(detail.locator('.simulator-history-detail__time')).toHaveText(
        '05/10/2026, 06:00:00',
    );
    await expect(detail.locator('.simulator-history-detail__number')).toHaveText(
        'Mobile · (202) 555-0123',
    );
    await expect(page.locator('.simulator-phone-history-screen')).toContainText('3m 4s');
});
