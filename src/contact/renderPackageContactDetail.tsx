import type { ReactNode } from 'react';
import type {
    SimulatorDispatchAction,
    SimulatorSessionContact,
    SimulatorSessionState,
} from '@signalsafe/simulator-react';
import SimulatorPhoneContactDetailForm from './SimulatorPhoneContactDetailForm.js';
import { contactSnapshotFromSessionContact } from './contactSnapshotFromSessionContact.js';
import type { SimulatorPhoneDeviceContactDetailOptions } from './contactDetailTypes.js';

export function renderPackageContactDetail({
    contactId,
    contact,
    onBack,
    state,
    dispatch,
    contactDetail,
}: {
    contactId: string;
    contact: SimulatorSessionContact;
    onBack: () => void;
    state: SimulatorSessionState;
    dispatch: (action: SimulatorDispatchAction) => void;
    contactDetail: SimulatorPhoneDeviceContactDetailOptions;
}): ReactNode {
    const values = contactSnapshotFromSessionContact(contact);
    const context = {
        state,
        dispatch,
        originalContact: contact,
    };

    return (
        <SimulatorPhoneContactDetailForm
            contact={{ ...values, id: contactId }}
            mode={contactDetail.mode ?? 'read-only'}
            onBack={onBack}
            onSave={
                contactDetail.onSave
                    ? (updated) => contactDetail.onSave!(updated, context)
                    : undefined
            }
            onDelete={
                contactDetail.onDelete
                    ? (current) => contactDetail.onDelete!(current, context)
                    : undefined
            }
            renderExtraFields={contactDetail.renderExtraFields}
            renderActions={contactDetail.renderActions}
            context={context}
        />
    );
}
