import { useSimulatorLocale } from '@signalsafe/simulator-react/i18n/SimulatorLocale';
import { useSimulatorCapabilities } from '@signalsafe/simulator-react/contract/capabilities';
import { useCallback, useRef, useState } from 'react';
import {
    ContactDetailMode,
    type SimulatorPhoneContactDetailFormProps,
    type SimulatorPhoneContactDetailValues,
} from './contactDetailTypes.js';

export function useContactFormState({
    contact: initialContact,
    mode,
    onBack,
    onSave,
    onDelete,
}: Pick<
    SimulatorPhoneContactDetailFormProps,
    'contact' | 'mode' | 'onBack' | 'onSave' | 'onDelete'
>) {
    const capability = useSimulatorCapabilities().editContact;
    const { t } = useSimulatorLocale();
    const unavailable = capability && capability.state !== 'enabled' ? capability.reason : '';
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const inFlight = useRef(false);
    const [state, setState] = useState({
        source: initialContact,
        draft: initialContact,
    });
    const sameSource = JSON.stringify(state.source) === JSON.stringify(initialContact);
    const pristine = JSON.stringify(state.draft) === JSON.stringify(state.source);
    if (
        !sameSource &&
        (pristine ||
            JSON.stringify(state.draft) === JSON.stringify(initialContact) ||
            state.source.id !== initialContact.id)
    ) {
        setState({ source: initialContact, draft: initialContact });
    }
    const draft = mode === ContactDetailMode.ReadOnly ? initialContact : state.draft;
    const conflict =
        mode === ContactDetailMode.Editable &&
        !sameSource &&
        !pristine &&
        state.source.id === initialContact.id;
    const editable = mode === ContactDetailMode.Editable;

    const updateField = useCallback((patch: Partial<SimulatorPhoneContactDetailValues>) => {
        setState((prev) => ({ ...prev, draft: { ...prev.draft, ...patch } }));
    }, []);

    const run = async (callback: typeof onSave) => {
        if (!callback || inFlight.current || conflict || unavailable || !editable) return;
        inFlight.current = true;
        setPending(true);
        setError('');
        try {
            await callback(draft);
        } catch (error_) {
            setError(error_ instanceof Error ? error_.message : t('app.contact.saveFailed'));
        } finally {
            inFlight.current = false;
            setPending(false);
        }
    };
    const handleSave = () => {
        void run(onSave);
    };
    const handleDelete = () => {
        void run(onDelete);
    };
    const back = () => {
        if (!inFlight.current) onBack();
    };

    return {
        draft,
        editable,
        conflict,
        pending,
        error,
        unavailable,
        updateField,
        handleSave,
        handleDelete,
        back,
        reload: () => setState({ source: initialContact, draft: initialContact }),
    };
}
