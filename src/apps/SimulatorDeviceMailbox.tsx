import {
    SimulatorEmailScreenId,
    type SimulatorEntryTarget,
} from '@signalsafe/simulator-core/devicePayload';
import type { DeviceStore } from '@signalsafe/simulator-core/apps/store';
import Mailbox from '@signalsafe/simulator-react/apps/mail/Mailbox';

/** One default mailbox route adapter for scenario and device hosts. */
export function SimulatorDeviceMailbox({
    store,
    onBack,
    screen,
    selectedEmailId,
    target,
    onSelectedEmailChange,
}: Readonly<{
    store: DeviceStore;
    onBack: () => void;
    screen: string;
    selectedEmailId?: string;
    target?: SimulatorEntryTarget;
    onSelectedEmailChange?: (id: string | undefined) => void;
}>) {
    return (
        <Mailbox
            store={store}
            onBack={onBack}
            onSelectedMessageChange={onSelectedEmailChange}
            initialCompose={screen === SimulatorEmailScreenId.Compose}
            initialFolder={
                screen === SimulatorEmailScreenId.Outbox
                    ? 'sent'
                    : screen === SimulatorEmailScreenId.Trash
                      ? 'trash'
                      : undefined
            }
            initialMessageId={
                screen === SimulatorEmailScreenId.Detail
                    ? (selectedEmailId ?? (target?.kind === 'email' ? target.id : undefined))
                    : undefined
            }
        />
    );
}
