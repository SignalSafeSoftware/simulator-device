import { expect, it, vi } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';
import SimulatorPhoneDevice from '../src/SimulatorPhoneDevice.js';
import { buildState } from './support/sessionFixtures.js';

it('submits Bcc through the shell Send action and retains fields when the host rejects', async () => {
    const state = buildState();
    state.view.activeApp = 'email';
    state.view.showPrimaryMenu = false;
    state.view.email.screen = 'compose';
    const onSend = vi.fn().mockRejectedValueOnce(new Error('Try again')).mockResolvedValueOnce(undefined);
    const { getByRole, getByLabelText } = render(<SimulatorPhoneDevice state={state} dispatch={vi.fn()} emailCompose={{ onSend }} />);
    fireEvent.change(getByLabelText('Recipient'), { target: { value: 'recipient@example.test' } });
    fireEvent.change(getByLabelText('Bcc'), { target: { value: 'private@example.test' } });
    fireEvent.change(getByLabelText('Body'), { target: { value: 'Message' } });
    fireEvent.click(getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(getByRole('alert').textContent).toBe('Try again'));
    expect(getByLabelText('Bcc')).toHaveProperty('value', 'private@example.test');
    fireEvent.click(getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(onSend).toHaveBeenCalledTimes(2));
    expect(onSend).toHaveBeenLastCalledWith({ to: 'recipient@example.test', bcc: 'private@example.test', subject: '', body: 'Message' });
});
