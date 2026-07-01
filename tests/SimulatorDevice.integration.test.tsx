import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, waitFor, within } from '@testing-library/react';
import SimulatorDevice from '../src/SimulatorDevice.js';
import { buildContactsDeviceJson } from './support/deviceJsonFixtures.js';

describe('SimulatorDevice integration', () => {
    it('renders phone shell from JSON without mocking SimulatorPhoneDevice', async () => {
        const { getByTestId, getByRole } = render(<SimulatorDevice value={buildContactsDeviceJson()} />);

        await waitFor(() => expect(getByTestId('simulator-device-shell')).toBeTruthy());
        expect(getByRole('button', { name: /IT Helpdesk/ })).toBeTruthy();
    });

    it('host contact detail render prop receives contact context from JSON contacts', async () => {
        const renderContactDetail = vi.fn(({ contact, onBack }) => (
            <div data-testid="host-contact-detail">
                <span>{contact.displayName}</span>
                <button type="button" onClick={onBack}>
                    Back
                </button>
            </div>
        ));

        const { getByRole, getByTestId } = render(
            <SimulatorDevice
                value={buildContactsDeviceJson()}
                phone={{ renderContactDetail }}
            />,
        );

        await waitFor(() => expect(getByRole('button', { name: /IT Helpdesk/ })).toBeTruthy());
        fireEvent.click(getByRole('button', { name: /IT Helpdesk/ }));

        await waitFor(() => expect(getByTestId('host-contact-detail')).toBeTruthy());
        expect(within(getByTestId('host-contact-detail')).getByText('IT Helpdesk')).toBeTruthy();
        expect(renderContactDetail).toHaveBeenCalled();
    });

    it('phone.contactDetail renders package form and onChange persists contact edits', async () => {
        const onChange = vi.fn();
        const onSave = vi.fn();

        const { getByRole, getByLabelText, getByTestId } = render(
            <SimulatorDevice
                value={buildContactsDeviceJson()}
                onChange={onChange}
                phone={{
                    contactDetail: {
                        mode: 'editable',
                        onSave,
                    },
                }}
            />,
        );

        await waitFor(() => expect(getByRole('button', { name: /IT Helpdesk/ })).toBeTruthy());
        fireEvent.click(getByRole('button', { name: /IT Helpdesk/ }));

        await waitFor(() => expect(getByTestId('simulator-phone-contact-detail')).toBeTruthy());

        fireEvent.change(getByLabelText('Display name'), { target: { value: 'Updated Helpdesk' } });
        fireEvent.click(getByRole('button', { name: 'Save' }));

        await waitFor(() => expect(onChange).toHaveBeenCalled());
        expect(onChange.mock.calls[0]?.[0]?.contacts?.[0]?.display_name).toBe('Updated Helpdesk');
        expect(onSave).toHaveBeenCalledWith(
            expect.objectContaining({ displayName: 'Updated Helpdesk' }),
            expect.objectContaining({ dispatch: expect.any(Function) }),
        );
    });
});
