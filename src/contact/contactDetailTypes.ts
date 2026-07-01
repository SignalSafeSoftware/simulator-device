import type { ReactNode } from 'react';
import type {
    SimulatorDispatchAction,
    SimulatorSessionContact,
    SimulatorSessionState,
} from '@signalsafe/simulator-react';

export interface SimulatorPhoneContactDetailValues {
    id: string;
    displayName: string;
    number?: string;
    email?: string;
}

export interface SimulatorPhoneContactDetailContext {
    state: SimulatorSessionState;
    dispatch: (action: SimulatorDispatchAction) => void;
    originalContact: SimulatorSessionContact;
}

export interface SimulatorPhoneDeviceContactDetailOptions {
    mode?: 'read-only' | 'editable';
    onSave?: (
        contact: SimulatorPhoneContactDetailValues,
        context: SimulatorPhoneContactDetailContext,
    ) => void;
    onDelete?: (
        contact: SimulatorPhoneContactDetailValues,
        context: SimulatorPhoneContactDetailContext,
    ) => void;
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
    mode: 'read-only' | 'editable';
    onBack: () => void;
    onSave?: (contact: SimulatorPhoneContactDetailValues) => void;
    onDelete?: (contact: SimulatorPhoneContactDetailValues) => void;
    renderExtraFields?: SimulatorPhoneDeviceContactDetailOptions['renderExtraFields'];
    renderActions?: SimulatorPhoneDeviceContactDetailOptions['renderActions'];
    context: SimulatorPhoneContactDetailContext;
}
