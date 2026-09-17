import { fireEvent, render } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { MessageComposeContext } from '@signalsafe/simulator-react';
import SimulatorPhoneNav from '../src/SimulatorPhoneNav.js';
import SimulatorPhoneNavItem from '../src/SimulatorPhoneNavItem.js';
import SimulatorPhoneDevice from '../src/SimulatorPhoneDevice.js';
import { buildState } from './support/sessionFixtures.js';

it('uses a navigation item label as its accessible name', () => {
    const click = vi.fn();
    const view = render(<SimulatorPhoneNavItem label="Standalone" onClick={click} />);
    fireEvent.click(view.getByRole('button', { name: 'Standalone' }));
    expect(click).toHaveBeenCalledOnce();
});

it('disables message sending until a host callback is configured', () => {
    const state = buildState({ activeApp: 'messages' });
    state.view.messages.screen = 'new_thread';
    const view = render(<SimulatorPhoneNav state={state} dispatch={vi.fn()} />);
    for (const button of view.getAllByRole('button', { name: 'Send' })) expect(button).toHaveProperty('disabled', true);
});

it('submits the message form from the navigation menu and tolerates a missing shell', () => {
    const state = buildState({ activeApp: 'messages' });
    state.view.messages.screen = 'new_thread';
    const submit = vi.fn(event => event.preventDefault());
    const nav = <MessageComposeContext.Provider value={{ draft: { phoneNumber: "", messageBody: "" }, onChange: vi.fn(), onSend: vi.fn() }}><SimulatorPhoneNav state={state} dispatch={vi.fn()} /></MessageComposeContext.Provider>;
    const view = render(<div className="simulator-device-shell"><form className="simulator-messages__composer" onSubmit={submit} />{nav}</div>);
    fireEvent.click(view.getByRole('button', { name: 'Send' }));
    expect(submit).toHaveBeenCalledOnce();
    view.rerender(nav);
    fireEvent.click(view.getByRole('button', { name: 'Send' }));
    expect(submit).toHaveBeenCalledOnce();
});

it('uses the host capability reason when message sending is disabled', () => {
    const state = buildState({ activeApp: 'messages' });
    state.view.messages.screen = 'new_thread';
    const view = render(<SimulatorPhoneDevice state={state} dispatch={vi.fn()} capabilities={{ sendMessage: { state: 'unavailable', reason: 'Sending paused' } }} />);
    expect(view.getAllByText('Sending paused').length).toBeGreaterThan(0);
    for (const button of view.getAllByRole('button', { name: 'Send' })) expect(button).toHaveProperty('disabled', true);
});

it('disables email sending until a host callback is configured', () => {
    const state = buildState({ activeApp: 'email' });
    state.view.email.screen = 'compose';
    const view = render(<SimulatorPhoneNav state={state} dispatch={vi.fn()} />);
    expect(view.getByRole('button', { name: 'Send' })).toHaveProperty('disabled', true);
});
