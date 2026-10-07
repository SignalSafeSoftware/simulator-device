import { useReducer } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SimulatorApp } from '@signalsafe/simulator-core/simulatorApp';
import { SimulatorPhoneScreenId } from '@signalsafe/simulator-core/devicePayload';
import { simulatorSessionReducer } from '@signalsafe/simulator-react/state/simulatorSessionReducer';
import { CallHistoryEntryKind } from '@signalsafe/simulator-react/types/session';
import type { SimulatorNavigationOptions } from '@signalsafe/simulator-react/contract/navigation';
import SimulatorPhoneDevice from '../src/phone/SimulatorPhoneDevice.js';
import { buildState } from './support/sessionFixtures.js';

function historyState() {
    const state = buildState({
        activeApp: SimulatorApp.Phone,
        showPrimaryMenu: false,
        phone: { screen: SimulatorPhoneScreenId.History, stack: [], chosenIndex: null },
    });
    state.payload.phone = {
        content: null,
        chosenIndex: null,
        callHistory: [
            {
                id: 'first',
                name: 'Taylor Example',
                number: '+12025550123',
                kind: CallHistoryEntryKind.Incoming,
                timestamp: 'Today 9:00 AM',
            },
            {
                id: 'related',
                name: 'Taylor Example',
                number: '+1 (202) 555-0123',
                kind: CallHistoryEntryKind.Outgoing,
                timestamp: 'Yesterday 4:00 PM',
            },
            {
                id: 'other',
                name: 'Morgan Example',
                number: '+12025550999',
                kind: CallHistoryEntryKind.Missed,
                timestamp: 'Yesterday 3:00 PM',
            },
        ],
    };
    return state;
}

function HistoryDevice(
    props: Pick<SimulatorNavigationOptions, 'onNavigation' | 'onNavigationEvent'>,
) {
    const [state, dispatch] = useReducer(simulatorSessionReducer, undefined, historyState);
    return <SimulatorPhoneDevice state={state} dispatch={dispatch} {...props} />;
}

describe('device call-history navigation', () => {
    it('opens details, keeps related rows informational and returns to the selected history row', () => {
        const onNavigationEvent = vi.fn();
        const view = render(<HistoryDevice onNavigationEvent={onNavigationEvent} />);
        expect(view.getAllByRole('heading', { name: 'Call History' })).toHaveLength(1);
        const row = view.getByRole('button', { name: /Taylor Example.*Today 9:00 AM/ });
        fireEvent.click(row);
        const heading = view.getByRole('heading', { name: 'Call Details' });
        expect(document.activeElement).toBe(heading);
        expect(view.container.querySelector('.simulator-history-detail')).not.toBeNull();
        expect(view.getByText('Yesterday 4:00 PM')).toBeInstanceOf(HTMLElement);
        expect(view.queryByText('Morgan Example')).toBeNull();
        expect(
            view.container.querySelector('.simulator-phone-history-row[aria-current]'),
        ).toBeNull();
        expect(view.queryByRole('button', { name: /Taylor Example.*Today 9:00 AM/ })).toBeNull();
        expect(view.getAllByRole('button', { name: 'Back' })).toHaveLength(1);
        fireEvent.click(view.getByRole('button', { name: 'Back' }));
        expect(view.queryByRole('heading', { name: 'Call Details' })).toBeNull();
        expect(view.getAllByRole('heading', { name: 'Call History' })).toHaveLength(1);
        expect(document.activeElement).toBe(
            view.getByRole('button', { name: /Taylor Example.*Today 9:00 AM/ }),
        );
        expect(view.getByText('Morgan Example')).toBeInstanceOf(HTMLElement);
        const location = {
            app: SimulatorApp.Phone,
            screen: SimulatorPhoneScreenId.History,
            primaryMenu: false,
        };
        expect(onNavigationEvent).toHaveBeenLastCalledWith({
            kind: 'back',
            from: location,
            to: location,
            disposition: 'delegated',
        });
        fireEvent.click(view.getByRole('button', { name: 'Back' }));
        expect(view.getByRole('navigation', { name: 'Simulator channels' })).toBeInstanceOf(
            HTMLElement,
        );
    });

    it('keeps history details open when a host handles Back', () => {
        const onNavigation = vi.fn(() => 'handled' as const);
        const view = render(<HistoryDevice onNavigation={onNavigation} />);
        fireEvent.click(view.getByRole('button', { name: /Taylor Example.*Today 9:00 AM/ }));
        fireEvent.click(view.getByRole('button', { name: 'Back' }));
        expect(view.getByRole('heading', { name: 'Call Details' })).toBeInstanceOf(HTMLElement);
        expect(onNavigation).toHaveBeenLastCalledWith(
            expect.objectContaining({
                kind: 'back',
                to: {
                    app: SimulatorApp.Phone,
                    screen: SimulatorPhoneScreenId.History,
                    primaryMenu: false,
                },
            }),
        );
    });
});
