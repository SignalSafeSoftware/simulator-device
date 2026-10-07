import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ContactValueList from '../src/contact/ContactValueList.js';
import { ContactEmailFields, ContactPhoneFields } from '../src/contact/contactFormFields.js';

describe('ContactValueList read-only rendering', () => {
    it('shows labels, formatted phone values, and per-row actions', () => {
        const renderAction = vi.fn((value: { value: string }) => (
            <button type='button'>Call {value.value}</button>
        ));
        const view = render(
            <ContactValueList
                kind='phone'
                title='Phone number'
                values={[
                    { label: '  ', value: '+1-555-100-2000' },
                    { label: 'Work', value: '+1-555-100-3000' },
                ]}
                editable={false}
                onChange={vi.fn()}
                renderAction={renderAction}
            />,
        );
        expect(view.getByText('Unlabeled')).toBeTruthy();
        expect(view.getByText('Work')).toBeTruthy();
        expect(view.getByText('+1 555 100 2000')).toBeTruthy();
        expect(view.getByText('+1 555 100 3000')).toBeTruthy();
        expect(renderAction).toHaveBeenCalledTimes(2);
        expect(view.queryByRole('textbox')).toBeNull();
    });

    it('shows email values verbatim without actions', () => {
        const view = render(
            <ContactValueList
                kind='email'
                title='Email'
                values={[{ label: 'Home', value: 'a@example.test' }]}
                editable={false}
                onChange={vi.fn()}
            />,
        );
        expect(view.getByText('a@example.test')).toBeTruthy();
        expect(view.getByText('Home')).toBeTruthy();
    });

    it('renders nothing when read-only and every value is blank', () => {
        const view = render(
            <ContactValueList
                kind='phone'
                title='Phone number'
                values={[{ label: 'Work', value: '   ' }]}
                editable={false}
                onChange={vi.fn()}
            />,
        );
        expect(view.container.firstChild).toBeNull();
    });

    it('still renders blank values while editable', () => {
        const view = render(
            <ContactValueList
                kind='phone'
                title='Phone number'
                values={[{ label: '', value: '' }]}
                editable
                onChange={vi.fn()}
            />,
        );
        expect(view.container.querySelector('fieldset')).toBeTruthy();
    });
});

describe('contact form fields read-only rendering', () => {
    it('renders phone lists with and without a phone action renderer', () => {
        const draft = { id: 'c1', displayName: 'A', phoneNumbers: [{ label: '', value: '555' }] };
        const renderPhoneAction = vi.fn(() => <span>action</span>);
        const withAction = render(
            <ContactPhoneFields
                draft={draft}
                editable={false}
                updateField={vi.fn()}
                renderPhoneAction={renderPhoneAction}
            />,
        );
        expect(withAction.getByText('action')).toBeTruthy();
        expect(renderPhoneAction).toHaveBeenCalledWith(draft.phoneNumbers[0], draft);
        const without = render(
            <ContactPhoneFields draft={draft} editable={false} updateField={vi.fn()} />,
        );
        expect(without.container.textContent).not.toContain('action');
    });

    it('renders scalar phone and email as text, or nothing when blank', () => {
        const phone = render(
            <ContactPhoneFields
                draft={{ id: 'c1', displayName: 'A', number: '+1-555-100-2000' }}
                editable={false}
                updateField={vi.fn()}
            />,
        );
        expect(phone.getByText('+1 555 100 2000')).toBeTruthy();
        expect(phone.queryByRole('textbox')).toBeNull();
        expect(phone.queryByRole('button')).toBeNull();

        const email = render(
            <ContactEmailFields
                draft={{ id: 'c1', displayName: 'A', email: 'a@example.test' }}
                editable={false}
                updateField={vi.fn()}
            />,
        );
        expect(email.getByText('a@example.test')).toBeTruthy();

        const blankPhone = render(
            <ContactPhoneFields
                draft={{ id: 'c1', displayName: 'A', number: ' ' }}
                editable={false}
                updateField={vi.fn()}
            />,
        );
        expect(blankPhone.container.firstChild).toBeNull();
        const blankEmail = render(
            <ContactEmailFields
                draft={{ id: 'c1', displayName: 'A' }}
                editable={false}
                updateField={vi.fn()}
            />,
        );
        expect(blankEmail.container.firstChild).toBeNull();
    });
});
