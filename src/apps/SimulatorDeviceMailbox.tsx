import {
    SimulatorEmailScreenId,
    type SimulatorEntryTarget,
} from '@signalsafe/simulator-core/devicePayload';
import type { ComponentProps } from 'react';
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
    let initialFolder: ComponentProps<typeof Mailbox>['initialFolder'];
    if (screen === SimulatorEmailScreenId.Outbox) initialFolder = 'sent';
    else if (screen === SimulatorEmailScreenId.Trash) initialFolder = 'trash';
    let initialMessageId: string | undefined;
    if (screen === SimulatorEmailScreenId.Detail) {
        initialMessageId = selectedEmailId ?? (target?.kind === 'email' ? target.id : undefined);
    }
    return (
        <Mailbox
            store={store}
            onBack={onBack}
            onSelectedMessageChange={onSelectedEmailChange}
            initialCompose={screen === SimulatorEmailScreenId.Compose}
            initialFolder={initialFolder}
            initialMessageId={initialMessageId}
        />
    );
}
