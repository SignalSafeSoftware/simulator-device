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
});
