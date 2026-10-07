import { expect, test, type Locator, type Page } from '@playwright/test';

// The narrow phone makes the seeded conversations overflow without changing package styling.
test.use({ viewport: { width: 320, height: 1100 } });

function threadScrollBody(page: Page): Locator {
    return page.locator('.simulator-messages__thread-detail > .simulator-overflow-auto');
}

async function scrollMetrics(body: Locator) {
    return body.evaluate((element) => ({
        top: element.scrollTop,
        maximum: element.scrollHeight - element.clientHeight,
        distanceFromBottom: element.scrollHeight - element.clientHeight - element.scrollTop,
    }));
}

async function expectLatestMessageInView(body: Locator) {
    await expect.poll(async () => (await scrollMetrics(body)).maximum).toBeGreaterThan(2);
    await expect
        .poll(async () => (await scrollMetrics(body)).distanceFromBottom)
        .toBeLessThanOrEqual(2);
    const lastMessageIsInside = await body.evaluate((element) => {
        const last = element.querySelector('ul[aria-label="Message timeline"] > li:last-child');
        if (!last) return false;
        const viewport = element.getBoundingClientRect();
        const message = last.getBoundingClientRect();
        return message.top >= viewport.top - 1 && message.bottom <= viewport.bottom + 1;
    });
    expect(lastMessageIsInside, 'The newest bubble fits inside the thread scroll viewport').toBe(
        true,
    );
}

async function openMessages(page: Page) {
    await page.goto('./');
    await page
        .getByRole('navigation', { name: 'Simulator channels' })
        .getByRole('button', { name: 'Messages', exact: true })
        .click();
}

async function settleLayout(page: Page) {
    await page.evaluate(
        () =>
            new Promise<void>((resolve) => {
                requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
            }),
    );
}

test('an overflowing thread opens at its newest message and follows a local reply', async ({
    page,
}) => {
    await openMessages(page);
    await page.getByRole('button', { name: /Taylor Example/ }).click();
    const body = threadScrollBody(page);
    await expectLatestMessageInView(body);

    const replyText =
        'This newest local reply should stay visible above the composer after it is sent.';
    await page.getByRole('textbox', { name: 'Reply to message', exact: true }).fill(replyText);
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    const timeline = page.getByRole('list', { name: 'Message timeline', exact: true });
    await expect(timeline.getByRole('listitem').last()).toContainText(replyText);
    await expectLatestMessageInView(body);
});

test('reading older messages survives typing and resizing, while another thread opens at its end', async ({
    page,
}) => {
    await openMessages(page);
    await page.getByRole('button', { name: /Taylor Example/ }).click();
    const body = threadScrollBody(page);
    await expectLatestMessageInView(body);
    const readingTop = await body.evaluate((element) => {
        element.scrollTop = Math.min(120, (element.scrollHeight - element.clientHeight) / 2);
        element.dispatchEvent(new Event('scroll'));
        return element.scrollTop;
    });
    await settleLayout(page);
    expect(readingTop).toBeGreaterThan(0);
    expect((await scrollMetrics(body)).distanceFromBottom).toBeGreaterThan(48);

    await page
        .getByRole('textbox', { name: 'Reply to message', exact: true })
        .fill('An unsent draft must not pull me away from the messages I am reading.');
    await settleLayout(page);
    expect(Math.abs((await scrollMetrics(body)).top - readingTop)).toBeLessThanOrEqual(1);
    expect((await scrollMetrics(body)).distanceFromBottom).toBeGreaterThan(48);

    await page.setViewportSize({ width: 340, height: 1100 });
    await settleLayout(page);
    const resized = await scrollMetrics(body);
    // Reflow reduces the remaining content, but must not move the reader to its end.
    expect(Math.abs(resized.top - readingTop)).toBeLessThanOrEqual(1);
    expect(resized.distanceFromBottom).toBeGreaterThan(2);
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: /Morgan Chen/ }).click();
    await expectLatestMessageInView(body);
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: /Taylor Example/ }).click();
    await expectLatestMessageInView(body);
});
