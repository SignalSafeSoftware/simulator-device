import { expect, test } from '@playwright/test';

test('demo conversations keep local replies isolated and reset to the default messages', async ({
    page,
}) => {
    await page.goto('./');
    const channels = page.getByRole('navigation', { name: 'Simulator channels' });
    await channels.getByRole('button', { name: 'Messages', exact: true }).click();
    for (const name of [
        'Taylor Example',
        'Morgan Chen',
        'Avery Patel',
        'Jordan Rivera',
        'Casey Brooks',
        'Northstar Studio',
    ]) {
        await expect(page.getByRole('button', { name: new RegExp(name) })).toBeVisible();
    }

    await page.getByRole('button', { name: /Taylor Example/ }).click();
    const timeline = page.getByRole('list', { name: 'Message timeline', exact: true });
    const messages = timeline.getByRole('listitem');
    await expect.poll(() => messages.count()).toBeGreaterThanOrEqual(6);
    const originalTaylorMessages = await messages.allTextContents();
    const reply = page.getByRole('textbox', { name: 'Reply to message', exact: true });
    const send = page.getByRole('button', { name: 'Send', exact: true });
    await expect(send).toBeDisabled();
    await reply.fill('   ');
    await expect(send).toBeDisabled();
    await expect(messages).toHaveCount(originalTaylorMessages.length);

    const localReply = 'This reply belongs only to Taylor and disappears after reset.';
    await reply.fill(localReply);
    await expect(send).toBeEnabled();
    await send.click();
    await expect(messages).toHaveCount(originalTaylorMessages.length + 1);
    await expect(timeline.getByText(localReply, { exact: true })).toHaveCount(1);
    await expect(reply).toHaveValue('');
    await expect(send).toBeDisabled();

    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(page.getByRole('button', { name: /Taylor Example/ })).toContainText(localReply);
    await page.getByRole('button', { name: /Morgan Chen/ }).click();
    await expect.poll(() => messages.count()).toBeGreaterThanOrEqual(6);
    const originalMorganMessages = await messages.allTextContents();
    expect(originalMorganMessages).not.toEqual(originalTaylorMessages);
    await expect(timeline.getByText(localReply, { exact: true })).toHaveCount(0);
    await expect(reply).toHaveValue('');

    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: /Taylor Example/ }).click();
    await expect(messages).toHaveCount(originalTaylorMessages.length + 1);
    await expect(timeline.getByText(localReply, { exact: true })).toHaveCount(1);
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: /Morgan Chen/ }).click();
    await expect(messages).toHaveText(originalMorganMessages);

    await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Home', exact: true })).toBeVisible();
    await channels.getByRole('button', { name: 'Messages', exact: true }).click();
    await expect(page.getByRole('button', { name: /Taylor Example/ })).not.toContainText(
        localReply,
    );
    await page.getByRole('button', { name: /Taylor Example/ }).click();
    await expect(messages).toHaveText(originalTaylorMessages);
    await expect(timeline.getByText(localReply, { exact: true })).toHaveCount(0);
});

test('the shared new-thread composer creates a local conversation', async ({ page }) => {
    await page.goto('./');
    await page
        .getByRole('navigation', { name: 'Simulator channels' })
        .getByRole('button', { name: 'Messages', exact: true })
        .click();
    await page.getByRole('button', { name: 'New thread', exact: true }).click();
    const send = page.getByRole('button', { name: 'Send', exact: true });
    await expect(send).toBeDisabled();
    await page.getByRole('textbox', { name: 'Phone number', exact: true }).fill('+12025550199');
    await expect(send).toBeDisabled();
    const newMessage = 'A new conversation sent locally by the demo browser test.';
    await page.getByRole('textbox', { name: 'Message body', exact: true }).fill(newMessage);
    await expect(send).toBeEnabled();
    await send.click();

    const newThread = page.getByRole('button', { name: new RegExp(newMessage) });
    await expect(newThread).toBeVisible();
    await newThread.click();
    const timeline = page.getByRole('list', { name: 'Message timeline', exact: true });
    await expect(timeline.getByRole('listitem')).toHaveCount(1);
    await expect(timeline.getByText(newMessage, { exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Reply to message', exact: true })).toHaveValue(
        '',
    );
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await newThread.click();
    await expect(timeline.getByText(newMessage, { exact: true })).toHaveCount(1);
});

test('a national US recipient reuses the existing international-number conversation', async ({
    page,
}) => {
    await page.goto('./');
    await page
        .getByRole('navigation', { name: 'Simulator channels' })
        .getByRole('button', { name: 'Messages', exact: true })
        .click();
    const threadRows = page.locator('.simulator-messages__thread-row');
    await expect(threadRows).toHaveCount(6);
    await page.getByRole('button', { name: /Taylor Example/ }).click();
    const timeline = page.getByRole('list', { name: 'Message timeline', exact: true });
    const messages = timeline.getByRole('listitem');
    await expect.poll(() => messages.count()).toBeGreaterThanOrEqual(6);
    const originalMessageCount = await messages.count();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: 'New thread', exact: true }).click();
    await page.getByRole('textbox', { name: 'Phone number', exact: true }).fill('(202) 555-0123');
    const localMessage = 'A national-format recipient should stay in the Taylor conversation.';
    await page.getByRole('textbox', { name: 'Message body', exact: true }).fill(localMessage);
    await page.getByRole('button', { name: 'Send', exact: true }).click();

    await expect(threadRows).toHaveCount(6);
    const taylorThread = page.getByRole('button', { name: /Taylor Example/ });
    await expect(taylorThread).toContainText(localMessage);
    await taylorThread.click();
    await expect(messages).toHaveCount(originalMessageCount + 1);
    await expect(timeline.getByText(localMessage, { exact: true })).toHaveCount(1);
});
