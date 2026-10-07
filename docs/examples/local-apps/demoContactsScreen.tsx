import { createContext, useContext } from 'react';
import { createSimulatorId } from '@signalsafe/simulator-core/apps/id';
import type { SimulatorScreenOverrides } from '@signalsafe/simulator-react/contract/screenOverrides';
import { useSimulatorLocale } from '@signalsafe/simulator-react/i18n/SimulatorLocale';
import ContactEditorForm from '@signalsafe/simulator-react/views/contacts/ContactEditorForm';
import ContactEditorScreen from '@signalsafe/simulator-react/views/contacts/ContactEditorScreen';
import { contactFormValues } from '@signalsafe/simulator-react/views/contacts/contactFormModel';
import { contactFormSource, type DemoContact } from './demoContacts';

interface DemoContactsScreen {
    editing: DemoContact | undefined;
    save: (contact: DemoContact) => void;
    close: () => void;
}

export const DemoContactsContext = createContext<DemoContactsScreen | null>(null);

function DemoContactEditor() {
    const screen = useContext(DemoContactsContext);
    const { t } = useSimulatorLocale();
    if (!screen) throw new Error('The demo contact editor needs its contacts context.');
    const { editing, save, close } = screen;
    return (
        <ContactEditorScreen title={editing ? t('contact.edit') : t('contact.add')}>
            <ContactEditorForm
                key={editing?.id ?? 'new'}
                contact={contactFormSource(editing)}
                createId={createSimulatorId}
                onCancel={close}
                onSubmit={(event) => {
                    event.preventDefault();
                    const { name, details } = contactFormValues(new FormData(event.currentTarget));
                    if (!details || !name) return;
                    save({ id: editing?.id ?? createSimulatorId(), name, details });
                    close();
                }}
            />
        </ContactEditorScreen>
    );
}

// Stable component identity keeps edits intact while the session refreshes.
export const demoScreenOverrides: SimulatorScreenOverrides = {
    phone: { add_contact: DemoContactEditor },
};
