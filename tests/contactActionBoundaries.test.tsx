import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import SimulatorPhoneContactDetailForm from '../src/contact/SimulatorPhoneContactDetailForm.js';
import SimulatorPhoneDevice from '../src/SimulatorPhoneDevice.js';
import { buildState } from './support/sessionFixtures.js';
import { buildContactsScreenState } from './support/contactFixtures.js';

const contact = { id: 'one', displayName: 'Contact' };
const context = { state: buildState(), dispatch: vi.fn(), originalContact: contact };

it('preserves a draft after a non-Error rejection', async () => {
    const view = render(<SimulatorPhoneContactDetailForm contact={contact} context={context} mode="editable" onBack={vi.fn()} onSave={vi.fn().mockRejectedValue('offline')} />);
    fireEvent.click(view.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(view.getByRole('alert').textContent).toContain('Your draft is preserved'));
});

it('blocks custom save and back actions while saving', async () => {
    let finish: () => void = () => { throw new Error('Save did not start'); };
    const onSave = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
    const onBack = vi.fn();
    const view = render(<SimulatorPhoneContactDetailForm contact={contact} context={context} mode="editable" onBack={onBack} onSave={onSave} renderActions={actions => <><button onClick={actions.onSave}>Custom save</button><button onClick={actions.onBack}>Custom back</button></>} />);
    fireEvent.click(view.getByRole('button', { name: 'Custom save' }));
    fireEvent.click(view.getByRole('button', { name: 'Custom save' }));
    fireEvent.click(view.getByRole('button', { name: 'Custom back' }));
    expect(onSave).toHaveBeenCalledOnce();
    expect(onBack).not.toHaveBeenCalled();
    await act(async () => finish());
    fireEvent.click(view.getByRole('button', { name: 'Custom back' }));
    expect(onBack).toHaveBeenCalledOnce();
});

it('blocks custom actions in read-only mode', () => {
    const onDelete = vi.fn();
    const onSave = vi.fn();
    const view = render(<SimulatorPhoneContactDetailForm contact={{ ...contact, number: ' ', emailAddresses: [{ label: 'Work', value: 'work@example.com' }] }} context={context} mode="read-only" onBack={vi.fn()} onSave={onSave} onDelete={onDelete} renderActions={actions => <><button onClick={actions.onSave}>Custom save</button><button onClick={actions.onDelete}>Custom delete</button></>} />);
    expect(view.getByText('work@example.com')).toBeTruthy();
    expect(view.getByText(/Open editing mode/)).toBeTruthy();
    fireEvent.click(view.getByRole('button', { name: 'Custom save' }));
    fireEvent.click(view.getByRole('button', { name: 'Custom delete' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
});

it('disables contact edits when the host marks editing unavailable', () => {
    const onSave = vi.fn();
    const view = render(<SimulatorPhoneDevice state={buildContactsScreenState()} dispatch={vi.fn()} capabilities={{ editContact: { state: 'unavailable', reason: 'Read access only' } }} contactDetail={{ mode: 'editable', onSave, renderActions: actions => <button onClick={actions.onSave}>Custom save</button> }} />);
    fireEvent.click(view.getByRole('button', { name: /IT Helpdesk/ }));
    expect(view.getByText('Read access only')).toBeTruthy();
    fireEvent.click(view.getByRole('button', { name: 'Custom save' }));
    expect(onSave).not.toHaveBeenCalled();
});

it('provides no save action when the host has not supplied one', () => {
    const actions = vi.fn(() => <span>Custom actions</span>);
    render(<SimulatorPhoneContactDetailForm contact={contact} context={context} mode="editable" onBack={vi.fn()} renderActions={actions} />);
    expect(actions).toHaveBeenCalledWith(expect.objectContaining({ onSave: undefined, onDelete: undefined }));
});
