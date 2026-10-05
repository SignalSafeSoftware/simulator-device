import { SimulatorPhoneScreenId } from '@signalsafe/simulator-core/devicePayload';
import { SimulatorApp } from '@signalsafe/simulator-core/simulatorApp';
import { useLayoutEffect, useRef, type MutableRefObject } from 'react';

export interface ContactListFocusRestoreOptions {
    screenRef: MutableRefObject<HTMLDivElement | null>;
    showHostContactDetail: boolean;
    selectedContactId: string | undefined;
    activeApp: SimulatorApp;
    phoneScreen: string;
}

/** Focuses the host contact detail when it opens and returns focus to its list row when it closes. */
export function useContactListFocusRestore({
    screenRef,
    showHostContactDetail,
    selectedContactId,
    activeApp,
    phoneScreen,
}: Readonly<ContactListFocusRestoreOptions>): void {
    const returnContactId = useRef<string | null>(null);
    useLayoutEffect(() => {
        if (showHostContactDetail && selectedContactId) {
            returnContactId.current = selectedContactId;
            screenRef.current
                ?.querySelector<HTMLElement>('input:not([type="hidden"]), [tabindex="-1"], button')
                ?.focus();
        } else if (returnContactId.current) {
            if (
                activeApp === SimulatorApp.Phone &&
                phoneScreen === SimulatorPhoneScreenId.Contacts
            ) {
                const rows = Array.from(
                    screenRef.current?.querySelectorAll<HTMLElement>(
                        '[data-simulator-contact-id]',
                    ) ?? [],
                );
                const row = rows.find(
                    (item) => item.dataset.simulatorContactId === returnContactId.current,
                );
                const button = row?.matches('button')
                    ? row
                    : row?.querySelector<HTMLButtonElement>('button');
                (
                    button ??
                    screenRef.current?.querySelector<HTMLInputElement>('input[type="search"]')
                )?.focus();
            }
            returnContactId.current = null;
        }
    }, [showHostContactDetail, selectedContactId, activeApp, phoneScreen, screenRef]);
}
