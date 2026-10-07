import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, within } from '@testing-library/react';
import PhoneContactEditor from '@signalsafe/simulator-react/views/contacts/PhoneContactEditor';

import SimulatorPhoneShell from '../src/phone/SimulatorPhoneShell.js';
import { SIMULATOR_DEVICE_CLASS_NAMES } from '../src/simulatorDeviceClasses.js';

describe('SimulatorPhoneShell', () => {
    it('wraps session content in simulator-device-shell__session-column', () => {
        const { container } = render(
            <SimulatorPhoneShell>
                <div data-testid='session-content'>Runtime</div>
            </SimulatorPhoneShell>,
        );

        const sessionColumn = container.querySelector(
            `.${SIMULATOR_DEVICE_CLASS_NAMES.shellSessionColumn}`,
        );
        expect(sessionColumn).not.toBeNull();
        expect(sessionColumn?.querySelector('[data-testid="session-content"]')).not.toBeNull();
    });
});

it('moves contact actions into the shell footer and restores navigation when editing ends', () => {
    const submit = vi.fn();
    const cancel = vi.fn();
    const view = render(
        <SimulatorPhoneShell useHostNav nav={<button>Contacts</button>}>
            <PhoneContactEditor
                number=''
                onNumberChange={() => {}}
                onSubmit={(event) => {
                    event.preventDefault();
                    submit(new FormData(event.currentTarget).get('name'));
                }}
                onCancel={cancel}
            />
        </SimulatorPhoneShell>,
    );
    const menu = view.getByRole('navigation', { name: 'App secondary menu' });
    expect(
        within(menu)
            .getAllByRole('button')
            .map((button) => button.getAttribute('aria-label')),
    ).toEqual(['Save contact', 'Back']);
    expect(menu.closest('.simulator-device-shell__screen')).toBeNull();
    const save = within(menu).getByRole('button', { name: 'Save contact' });
    expect(save.getAttribute('type')).toBe('submit');
    expect(save.getAttribute('form')).toBe(view.container.querySelector('form')?.id);
    expect(view.queryByRole('button', { name: 'Contacts' })).toBeNull();
    expect(view.container.querySelector('.simulator-editor-actions')).toBeNull();
    fireEvent.click(within(menu).getByRole('button', { name: 'Save contact' }));
    expect(submit).not.toHaveBeenCalled();
    fireEvent.change(view.getByLabelText('Name'), { target: { value: 'Synthetic person' } });
    fireEvent.click(within(menu).getByRole('button', { name: 'Save contact' }));
    expect(submit).toHaveBeenCalledExactlyOnceWith('Synthetic person');
    fireEvent.click(within(menu).getByRole('button', { name: 'Back' }));
    expect(cancel).toHaveBeenCalledOnce();
    view.rerender(
        <SimulatorPhoneShell useHostNav nav={<button>Contacts</button>}>
            Contact list
        </SimulatorPhoneShell>,
    );
    expect(view.queryByRole('button', { name: 'Save contact' })).toBeNull();
    expect(view.getByRole('button', { name: 'Contacts' })).toBeInstanceOf(HTMLElement);
});

it('keeps contact save availability and pending actions synchronized with the footer', () => {
    const submit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());
    const cancel = vi.fn();
    const screen = (saving: boolean, saveDisabled: boolean) => (
        <SimulatorPhoneShell useHostNav nav={<button>Contacts</button>}>
            <PhoneContactEditor
                defaultName='Synthetic'
                number=''
                onNumberChange={() => {}}
                onSubmit={submit}
                onCancel={cancel}
                saving={saving}
                saveDisabled={saveDisabled}
            />
        </SimulatorPhoneShell>
    );
    const view = render(screen(false, true));
    expect(view.getByRole('button', { name: 'Save contact' }).hasAttribute('disabled')).toBe(true);
    expect(view.getByRole('button', { name: 'Back' }).hasAttribute('disabled')).toBe(false);
    view.rerender(screen(true, false));
    for (const button of within(view.getByRole('navigation')).getAllByRole('button')) {
        expect(button.hasAttribute('disabled')).toBe(true);
        fireEvent.click(button);
    }
    expect(submit).not.toHaveBeenCalled();
    expect(cancel).not.toHaveBeenCalled();
    view.rerender(screen(false, false));
    fireEvent.click(view.getByRole('button', { name: 'Save contact' }));
    expect(submit).toHaveBeenCalledOnce();
});

it('keeps nested device action menus scoped to their own shell', () => {
    const view = render(
        <SimulatorPhoneShell useHostNav nav={<button>Outer navigation</button>}>
            <SimulatorPhoneShell useHostNav nav={<button>Inner navigation</button>}>
                <PhoneContactEditor
                    defaultName='Synthetic'
                    number=''
                    onNumberChange={() => {}}
                    onSubmit={(event) => event.preventDefault()}
                    onCancel={() => {}}
                />
            </SimulatorPhoneShell>
        </SimulatorPhoneShell>,
    );
    expect(view.getByRole('button', { name: 'Outer navigation' })).toBeInstanceOf(HTMLElement);
    expect(view.queryByRole('button', { name: 'Inner navigation' })).toBeNull();
    expect(view.getAllByRole('button', { name: 'Save contact' })).toHaveLength(1);
});
