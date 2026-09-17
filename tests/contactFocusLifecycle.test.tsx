import { fireEvent, render } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import type { SimulatorPhoneShellProps } from '../src/SimulatorPhoneShell.js';
import SimulatorPhoneDevice from '../src/SimulatorPhoneDevice.js';
import { buildContactsScreenState } from './support/contactFixtures.js';

const shell = vi.hoisted(() => ({ attachScreen: true }));
vi.mock('../src/SimulatorPhoneShell.js', () => ({
    default: ({ children, screenRef, nav }: SimulatorPhoneShellProps) => (
        <div ref={shell.attachScreen ? screenRef : undefined}>{children}{nav}</div>
    ),
}));

it('tolerates a detached screen ref while returning from contact details', () => {
    const state = buildContactsScreenState();
    const dispatch = vi.fn();
    const view = render(<SimulatorPhoneDevice state={state} dispatch={dispatch} contactDetail={{}} />);
    fireEvent.click(view.getByRole('button', { name: /IT Helpdesk/ }));
    expect(view.getByTestId('simulator-phone-contact-detail')).toBeTruthy();
    shell.attachScreen = false;
    try {
        view.rerender(<SimulatorPhoneDevice state={{ ...state, payload: { ...state.payload, contacts: [] } }} dispatch={dispatch} contactDetail={{}} />);
        expect(view.queryByTestId('simulator-phone-contact-detail')).toBeNull();
    } finally { shell.attachScreen = true; }
});
