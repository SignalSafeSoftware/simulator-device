import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import SimulatorPhoneContactDetailForm from '../src/contact/SimulatorPhoneContactDetailForm.js';
import type { SimulatorPhoneContactDetailContext } from '../src/contact/contactDetailTypes.js';
import { buildState } from './support/sessionFixtures.js';

const context: SimulatorPhoneContactDetailContext = {
    state: buildState(),
    dispatch: vi.fn(),
    originalContact: { id: 'c1', displayName: 'Alice Chen', number: '+1-555-100-2000', email: 'alice@example.com' },
};

describe('SimulatorPhoneContactDetailForm', () => {
    it('renders displayName, number, and email', () => {
        const { getByText } = render(
            <SimulatorPhoneContactDetailForm
                contact={{
                    id: 'c1',
                    displayName: 'Alice Chen',
                    number: '+1-555-100-2000',
                    email: 'alice@example.com',
                }}
                mode="read-only"
                onBack={vi.fn()}
                context={context}
            />,
        );

        expect(getByText('Alice Chen')).toBeTruthy();
        expect(getByText('+1-555-100-2000')).toBeTruthy();
        expect(getByText('alice@example.com')).toBeTruthy();
    });

    it('read-only mode renders non-editable values', () => {
        const { queryByRole } = render(
            <SimulatorPhoneContactDetailForm
                contact={{ id: 'c1', displayName: 'Bob', number: '555', email: 'bob@example.com' }}
                mode="read-only"
                onBack={vi.fn()}
                context={context}
            />,
        );

        expect(queryByRole('textbox')).toBeNull();
    });

    it('editable mode updates form state', () => {
        const { getByLabelText } = render(
            <SimulatorPhoneContactDetailForm
                contact={{ id: 'c1', displayName: 'Alice', number: '111', email: 'a@example.com' }}
                mode="editable"
                onBack={vi.fn()}
                onSave={vi.fn()}
                context={context}
            />,
        );

        fireEvent.change(getByLabelText('Display name'), { target: { value: 'Alice Updated' } });
        expect(getByLabelText('Display name')).toHaveProperty('value', 'Alice Updated');
    });

    it('Save calls onSave with updated values', () => {
        const onSave = vi.fn();
        const { getByLabelText, getByRole } = render(
            <SimulatorPhoneContactDetailForm
                contact={{ id: 'c1', displayName: 'Alice', number: '111', email: 'a@example.com' }}
                mode="editable"
                onBack={vi.fn()}
                onSave={onSave}
                context={context}
            />,
        );

        fireEvent.change(getByLabelText('Email'), { target: { value: 'new@example.com' } });
        fireEvent.click(getByRole('button', { name: 'Save' }));

        expect(onSave).toHaveBeenCalledWith({
            id: 'c1',
            displayName: 'Alice',
            number: '111',
            email: 'new@example.com',
        });
    });

    it('Delete calls onDelete with current values', () => {
        const onDelete = vi.fn();
        const { getByRole } = render(
            <SimulatorPhoneContactDetailForm
                contact={{ id: 'c1', displayName: 'Alice', number: '111', email: 'a@example.com' }}
                mode="editable"
                onBack={vi.fn()}
                onSave={vi.fn()}
                onDelete={onDelete}
                context={context}
            />,
        );

        fireEvent.click(getByRole('button', { name: 'Delete' }));
        expect(onDelete).toHaveBeenCalledWith({
            id: 'c1',
            displayName: 'Alice',
            number: '111',
            email: 'a@example.com',
        });
    });

    it('Back calls onBack', () => {
        const onBack = vi.fn();
        const { getByRole } = render(
            <SimulatorPhoneContactDetailForm
                contact={{ id: 'c1', displayName: 'Alice', number: '111', email: 'a@example.com' }}
                mode="read-only"
                onBack={onBack}
                context={context}
            />,
        );

        fireEvent.click(getByRole('button', { name: 'Back to contacts list' }));
        expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('renderExtraFields renders and can update contact state', () => {
        const { getByTestId, getByLabelText, getByRole } = render(
            <SimulatorPhoneContactDetailForm
                contact={{ id: 'c1', displayName: 'Alice', number: '111', email: 'a@example.com' }}
                mode="editable"
                onBack={vi.fn()}
                onSave={vi.fn()}
                context={context}
                renderExtraFields={({ contact, updateContact }) => (
                    <div data-testid="extra-fields">
                        <span>{contact.displayName}</span>
                        <button type="button" onClick={() => updateContact({ displayName: 'Extra Updated' })}>
                            Patch name
                        </button>
                    </div>
                )}
            />,
        );

        expect(getByTestId('extra-fields')).toBeTruthy();
        fireEvent.click(getByRole('button', { name: 'Patch name' }));
        expect(getByLabelText('Display name')).toHaveProperty('value', 'Extra Updated');
    });

    it('renderActions overrides default actions', () => {
        const { getByTestId, queryByRole } = render(
            <SimulatorPhoneContactDetailForm
                contact={{ id: 'c1', displayName: 'Alice', number: '111', email: 'a@example.com' }}
                mode="editable"
                onBack={vi.fn()}
                onSave={vi.fn()}
                context={context}
                renderActions={() => <div data-testid="custom-actions">Custom</div>}
            />,
        );

        expect(getByTestId('custom-actions')).toBeTruthy();
        expect(queryByRole('button', { name: 'Save' })).toBeNull();
    });
});
