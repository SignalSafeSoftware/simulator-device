import { SimulatorPhoneScreenId } from '@signalsafe/simulator-core/devicePayload';
import { SimulatorApp } from '@signalsafe/simulator-core/simulatorApp';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SimulatorPhoneContactOpenProps } from '@signalsafe/simulator-react/ui/renderSlots';
import type {
    SimulatorSessionContact,
    SimulatorSessionState,
} from '@signalsafe/simulator-react/types/session';
import {
    resolveSimulatorPhoneShellHostMode,
    type SimulatorPhoneShellHostMode,
} from './simulatorPhoneShellScreenMapper.js';

function isPhoneContactsScreen(state: SimulatorSessionState): boolean {
    return (
        state.view?.activeApp === SimulatorApp.Phone &&
        state.view.phone?.screen === SimulatorPhoneScreenId.Contacts
    );
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

    const contact = useMemo((): SimulatorSessionContact | null => {
        if (!enabled || !onContactsScreen || selectedContactId == null) {
            return null;
        }
        return state.payload.contacts?.find((entry) => entry.id === selectedContactId) ?? null;
    }, [enabled, onContactsScreen, selectedContactId, state.payload.contacts]);

    const hostMode = resolveSimulatorPhoneShellHostMode(state, contact?.id ?? null);

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
