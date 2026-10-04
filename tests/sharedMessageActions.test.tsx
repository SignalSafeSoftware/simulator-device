import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import SimulatorPhoneDevice from '../src/SimulatorPhoneDevice.js';
import { buildState } from './support/sessionFixtures.js';

describe('shared message action ownership', () => {
    it.each(['new_thread', 'thread_detail'] as const)('renders one Send action on %s', (screen) => {
        const state = buildState({
            activeApp: 'messages',
            showPrimaryMenu: false,
            messages: { screen, stack: [], visibleCount: 1 },
        });
        state.payload.sms = {
            thread: {
                sender_number: '+12025550123',
                messages: [{ from: 'them', text: 'Synthetic message' }],
            },
            visibleMessageCount: 1,
        };
        const { getAllByRole } = render(<SimulatorPhoneDevice state={state} dispatch={vi.fn()} />);
        expect(getAllByRole('button', { name: 'Send' })).toHaveLength(1);
    });
});
