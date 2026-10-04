import type { ReactNode } from 'react';
import type { SimulatorDispatchAction } from '@signalsafe/simulator-react/state/simulatorDispatchActions';
import type {
    SimulatorSessionContact,
    SimulatorSessionState,
} from '@signalsafe/simulator-react/types/session';

export interface SimulatorPhoneContactDetailValues extends SimulatorSessionContact {}

export const ContactDetailMode = Object.freeze({
    ReadOnly: 'read-only',
    Editable: 'editable',
} as const);
export type ContactDetailMode = (typeof ContactDetailMode)[keyof typeof ContactDetailMode];

export interface SimulatorPhoneContactDetailContext {
    state: SimulatorSessionState;
    dispatch: (action: SimulatorDispatchAction) => void;
    originalContact: SimulatorSessionContact;
}

export interface SimulatorPhoneDeviceContactDetailOptions {
    mode?: ContactDetailMode;
    renderIdentityImage?: (contact: SimulatorPhoneContactDetailValues) => ReactNode;
    renderPhoneAction?: (
        phone: NonNullable<SimulatorSessionContact['phoneNumbers']>[number],
        contact: SimulatorPhoneContactDetailValues,
    ) => ReactNode;
    onSave?: (
        contact: SimulatorPhoneContactDetailValues,
        context: SimulatorPhoneContactDetailContext,
    ) => void | Promise<void>;
    onDelete?: (
        contact: SimulatorPhoneContactDetailValues,
        context: SimulatorPhoneContactDetailContext,
    ) => void | Promise<void>;
    renderExtraFields?: (props: {
        contact: SimulatorPhoneContactDetailValues;
        updateContact: (patch: Partial<SimulatorPhoneContactDetailValues>) => void;
        context: SimulatorPhoneContactDetailContext;
    }) => ReactNode;
    renderActions?: (props: {
        contact: SimulatorPhoneContactDetailValues;
        onBack: () => void;
        onSave?: () => void;
        onDelete?: () => void;
        context: SimulatorPhoneContactDetailContext;
    }) => ReactNode;
}

export interface SimulatorPhoneContactDetailFormProps {
    contact: SimulatorPhoneContactDetailValues;
    mode: ContactDetailMode;
    onBack: () => void;
    onSave?: (contact: SimulatorPhoneContactDetailValues) => void | Promise<void>;
    onDelete?: (contact: SimulatorPhoneContactDetailValues) => void | Promise<void>;
    renderIdentityImage?: NonNullable<
        SimulatorPhoneDeviceContactDetailOptions['renderIdentityImage']
    >;
    renderPhoneAction?: NonNullable<SimulatorPhoneDeviceContactDetailOptions['renderPhoneAction']>;
    renderExtraFields?: NonNullable<SimulatorPhoneDeviceContactDetailOptions['renderExtraFields']>;
    renderActions?: NonNullable<SimulatorPhoneDeviceContactDetailOptions['renderActions']>;
    context: SimulatorPhoneContactDetailContext;
}
