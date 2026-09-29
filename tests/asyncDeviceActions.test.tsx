import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import SimulatorDevice from '../src/SimulatorDevice.js';
import SimulatorPhoneDevice from '../src/SimulatorPhoneDevice.js';
import { buildContactsDeviceJson } from './support/deviceJsonFixtures.js';
import { buildState } from './support/sessionFixtures.js';

it.each(['Save', 'Delete'])(
    'keeps %s pending through top-level composition and preserves failed drafts',
    async (action) => {
        let reject: (error: Error) => void = () => {};
        const persist = vi.fn(
            () =>
                new Promise<void>((_resolve, fail) => {
                    reject = fail;
                }),
        );
        const onChange = vi.fn();
        const view = render(
            <SimulatorDevice
                value={buildContactsDeviceJson()}
                onChange={onChange}
                phone={{ contactDetail: { mode: 'editable', onSave: persist, onDelete: persist } }}
            />,
        );
        fireEvent.click(await view.findByRole('button', { name: /IT Helpdesk/ }));
        fireEvent.change(view.getByLabelText('Display name'), {
            target: { value: 'Unsaved draft' },
        });
        fireEvent.click(view.getByRole('button', { name: action }));
        fireEvent.click(view.getByRole('button', { name: action }));
        expect(persist).toHaveBeenCalledTimes(1);
        expect(view.getByRole('button', { name: action }).hasAttribute('disabled')).toBe(true);
        expect(onChange).not.toHaveBeenCalled();
        await act(async () => reject(new Error('Persistence failed')));
        expect(view.getByRole('alert').textContent).toContain('Persistence failed');
        expect(view.getByLabelText('Display name')).toHaveProperty('value', 'Unsaved draft');
        expect(onChange).not.toHaveBeenCalled();
        expect(view.getByRole('button', { name: action }).hasAttribute('disabled')).toBe(false);
    },
);
it('does not apply a delayed save until persistence succeeds', async () => {
    let finish = () => {};
    const onSave = vi.fn(
        () =>
            new Promise<void>((resolve) => {
                finish = resolve;
            }),
    );
    const onChange = vi.fn();
    const view = render(
        <SimulatorDevice
            value={buildContactsDeviceJson()}
            onChange={onChange}
            phone={{ contactDetail: { mode: 'editable', onSave } }}
        />,
    );
    fireEvent.click(await view.findByRole('button', { name: /IT Helpdesk/ }));
    fireEvent.click(view.getByRole('button', { name: 'Save' }));
    expect(onChange).not.toHaveBeenCalled();
    await act(async () => finish());
    expect(onChange).toHaveBeenCalledTimes(1);
});
it('shares email validity and pending state with shell Send and Back', async () => {
    const state = buildState({
        activeApp: 'email',
        showPrimaryMenu: false,
        email: { screen: 'compose', stack: ['list'], selectedMessageId: null },
    });
    let finish = () => {};
    const onSend = vi.fn(
        () =>
            new Promise<void>((resolve) => {
                finish = resolve;
            }),
    );
    const dispatch = vi.fn();
    const view = render(
        <SimulatorPhoneDevice state={state} dispatch={dispatch} emailCompose={{ onSend }} />,
    );
    expect(view.getByRole('button', { name: 'Send' }).hasAttribute('disabled')).toBe(true);
    fireEvent.change(view.getByLabelText('Recipient'), {
        target: { value: 'recipient@example.test' },
    });
    fireEvent.click(view.getByRole('button', { name: 'Send' }));
    fireEvent.click(view.getByRole('button', { name: 'Send' }));
    fireEvent.click(view.getByRole('button', { name: 'Back' }));
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(dispatch).not.toHaveBeenCalled();
    expect(view.getByRole('button', { name: 'Back' }).hasAttribute('disabled')).toBe(true);
    await act(async () => finish());
    await waitFor(() => expect(dispatch).toHaveBeenCalledTimes(1));
});
