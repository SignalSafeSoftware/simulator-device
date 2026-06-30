import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
    SimulatorPhoneContactOpenProps,
    SimulatorSessionContact,
    SimulatorSessionState,
} from '@signalsafe/simulator-react';
import {
    resolveSimulatorPhoneShellHostMode,
    type SimulatorPhoneShellHostMode,
} from './simulatorPhoneShellScreenMapper.js';

function isPhoneContactsScreen(state: SimulatorSessionState): boolean {
    return state.view?.activeApp === 'phone' && state.view.phone?.screen === 'contacts';
}

export function useSimulatorPhoneDeviceContactHost(
    state: SimulatorSessionState,
    enabled: boolean,
): {
    hostMode: SimulatorPhoneShellHostMode;
    contact: SimulatorSessionContact | null;
    clearSelection: () => void;
    onPhoneContactOpen: (props: SimulatorPhoneContactOpenProps) => void;
} {
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const onContactsScreen = isPhoneContactsScreen(state);

    useEffect(() => {
        if (!enabled || !onContactsScreen) {
            setSelectedContactId(null);
        }
    }, [enabled, onContactsScreen]);

    const onPhoneContactOpen = useCallback(
        ({ contactId }: SimulatorPhoneContactOpenProps) => {
            if (enabled) {
                setSelectedContactId(contactId);
            }
        },
        [enabled],
    );

    const hostMode = resolveSimulatorPhoneShellHostMode(
        state,
        enabled ? selectedContactId : null,
    );

    const contact = useMemo((): SimulatorSessionContact | null => {
        if (hostMode.kind !== 'phone-contact-edit') {
            return null;
        }

        return state.payload.contacts?.find((entry) => entry.id === hostMode.contactId) ?? null;
    }, [hostMode, state.payload.contacts]);

    const clearSelection = useCallback(() => {
        setSelectedContactId(null);
    }, []);

    return {
        hostMode,
        contact,
        clearSelection,
        onPhoneContactOpen,
    };
}
