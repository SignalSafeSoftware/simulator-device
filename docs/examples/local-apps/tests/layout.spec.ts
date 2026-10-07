import { expect, test } from '@playwright/test';

test.use({ timezoneId: 'UTC' });

test('demo controls and package headers remain usable at narrow widths and enlarged text', async ({
    page,
}) => {
    for (const width of [320, 430]) {
        for (const scale of [100, 200]) {
            await page.setViewportSize({ width, height: 1000 });
            await page.goto('./');
            await page.addStyleTag({ content: `:root { font-size: ${scale}%; }` });
            for (const name of ['Home', 'Vault', 'Photos', 'Email', 'Settings', 'Internet']) {
                if (name !== 'Home') await page.getByRole('button', { name, exact: true }).click();
                await expect(page.locator('.simulator-host-device h2').first()).toBeVisible();
                const horizontalOverflow = await page.evaluate(
                    () => document.documentElement.scrollWidth > window.innerWidth,
                );
                expect(horizontalOverflow, `${name} at ${width}px / ${scale}%`).toBe(false);
                const edges = await page.evaluate(() => {
                    const device = document.querySelector('.simulator-host-device');
                    const header = device?.querySelector('h2');
                    if (!device || !header) throw new Error('Demo device header is missing.');
                    const shell = device.getBoundingClientRect();
                    const banner = header.getBoundingClientRect();
                    const border = Number.parseFloat(getComputedStyle(device).borderLeftWidth);
                    return [
                        Math.abs(banner.left - shell.left - border),
                        Math.abs(shell.right - border - banner.right),
                    ];
                });
                expect(
                    Math.max(...edges),
                    `${name} header at ${width}px / ${scale}%`,
                ).toBeLessThanOrEqual(1);
                if (name === 'Home') {
                    const tilesFit = await page.locator('.prototype-home button').evaluateAll(
                        (tiles) =>
                            tiles.length === 3 &&
                            tiles.every((tile) => {
                                const screen = tile.closest('.simulator-device-shell__screen');
                                if (!screen) return false;
                                const bounds = screen.getBoundingClientRect();
                                const rect = tile.getBoundingClientRect();
                                return (
                                    rect.left >= bounds.left &&
                                    rect.right <= bounds.right &&
                                    tile.scrollWidth <= tile.clientWidth
                                );
                            }),
                    );
                    expect(tilesFit, `Home tiles at ${width}px / ${scale}%`).toBe(true);
                    const clockFits = await page
                        .locator('.prototype-home-clock')
                        .evaluate((clock) => {
                            const tiles = clock.nextElementSibling;
                            if (!tiles) return false;
                            const box = clock.getBoundingClientRect();
                            return (
                                clock.scrollWidth <= clock.clientWidth &&
                                tiles.getBoundingClientRect().top - box.bottom >= 8
                            );
                        });
                    expect(clockFits, `Home clock at ${width}px / ${scale}%`).toBe(true);
                } else if (name === 'Settings') {
                    const controlsFit = await page
                        .locator('.simulator-settings__sections')
                        .evaluate((sections) => {
                            const outer = sections.getBoundingClientRect();
                            return [...sections.children].every((card) => {
                                const box = card.getBoundingClientRect();
                                return (
                                    Math.abs(box.left - outer.left) < 1 &&
                                    Math.abs(box.right - outer.right) < 1 &&
                                    [...card.querySelectorAll('input, select, button')].every(
                                        (control) => {
                                            const rect = control.getBoundingClientRect();
                                            return (
                                                rect.left >= box.left &&
                                                rect.right <= box.right &&
                                                (control.tagName === 'INPUT' ||
                                                    control.scrollWidth <= control.clientWidth + 1)
                                            );
                                        },
                                    )
                                );
                            });
                        });
                    expect(controlsFit, `Settings controls at ${width}px / ${scale}%`).toBe(true);
                    await page.getByRole('button', { name: 'Back', exact: true }).click();
                } else if (name === 'Internet') {
                    await page.getByRole('button', { name: 'Home', exact: true }).click();
                } else {
                    await page.getByRole('button', { name: 'Back', exact: true }).click();
                }
                await expect(
                    page.getByRole('heading', { name: 'Home', exact: true }),
                ).toBeVisible();
            }
        }
    }
});
