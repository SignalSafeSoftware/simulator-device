import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import SimulatorWithSession from '@signalsafe/simulator-react/SimulatorWithSession';
import { SimulatorCapabilitiesContext } from '@signalsafe/simulator-react/contract/capabilities';
import SimulatorPhoneDevice from '../src/SimulatorPhoneDevice.js';
import { buildState } from './support/sessionFixtures.js';

function messageState(screen: 'new_thread' | 'thread_detail', primary: boolean) {
    const state = buildState({
        activeApp: 'messages',
        showPrimaryMenu: primary,
        messages: { screen, stack: [], visibleCount: 1 },
    });
    state.payload.sms = {
        thread: {
            sender_number: '+12025550123',
            messages: [{ from: 'them', text: 'Synthetic message' }],
        },
        visibleMessageCount: 1,
    };
    return state;
}
describe.each([true, false])('action ownership with primary menu %s', (primary) => {
    it.each(['new_thread', 'thread_detail'] as const)(
        'renders one device Send action on %s',
        (screen) => {
            const view = render(
                <SimulatorPhoneDevice state={messageState(screen, primary)} dispatch={vi.fn()} />,
            );
            expect(view.getAllByRole('button', { name: 'Send' })).toHaveLength(1);
        },
    );
    it.each(['new_thread', 'thread_detail'] as const)(
        'retains scenario Send without device navigation on %s',
        (screen) => {
            const view = render(
                <SimulatorWithSession state={messageState(screen, primary)} dispatch={vi.fn()} />,
            );
            expect(view.getAllByRole('button', { name: 'Send' })).toHaveLength(1);
        },
    );
    it('submits a reply exactly once from the footer and disables empty drafts', () => {
        const dispatch = vi.fn();
        const view = render(
            <SimulatorPhoneDevice
                state={messageState('thread_detail', primary)}
                dispatch={dispatch}
            />,
        );
        const send = view.getByRole('button', { name: 'Send' });
        expect(send).toHaveProperty('disabled', true);
        fireEvent.change(view.getByLabelText('Reply to message'), { target: { value: 'Hello' } });
        expect(send).toHaveProperty('disabled', false);
        fireEvent.click(send);
        expect(
            dispatch.mock.calls.filter(([action]) => action.type === 'SIMULATOR_ACTION'),
        ).toEqual([
            [{ type: 'SIMULATOR_ACTION', action: { type: 'send_reply', replyText: 'Hello' } }],
        ]);
        expect(send).toHaveProperty('disabled', true);
    });
    it('keeps one accessible explanation for receive-only messaging', () => {
        const reason = 'Receiving only; sending is unavailable.';
        const view = render(
            <SimulatorCapabilitiesContext.Provider
                value={{ sendMessage: { state: 'unavailable', reason } }}
            >
                <SimulatorPhoneDevice
                    state={messageState('thread_detail', primary)}
                    dispatch={vi.fn()}
                />
            </SimulatorCapabilitiesContext.Provider>,
        );
        expect(view.getAllByText(reason)).toHaveLength(1);
        const send = view.getByRole('button', { name: 'Send' });
        expect(send).toHaveProperty('disabled', true);
        expect(send.getAttribute('title')).toBe(reason);
        expect(view.getByText(reason).className).toBe('simulator-visually-hidden');
        expect(
            document.getElementById(send.getAttribute('aria-describedby') ?? '')?.textContent,
        ).toBe(reason);
    });
});
