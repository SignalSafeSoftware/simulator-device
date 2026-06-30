import type { ReactNode, Ref } from 'react';
import { SIMULATOR_DEVICE_CLASS_NAMES as cls } from './simulatorDeviceClasses.js';

export interface SimulatorPhoneShellProps {
    children: ReactNode;
    /** Bottom navigation rendered as a shell sibling (typically SimulatorPhoneNav). */
    nav?: ReactNode;
    /** When true, use host scroll layout (nav sibling + screen scrolls). */
    useHostNav?: boolean;
    /** Optional host screen modifiers appended to the shell root. */
    screenClassNames?: string[];
    /** Ref to the scrollable screen region. */
    screenRef?: Ref<HTMLDivElement>;
}

export default function SimulatorPhoneShell({
    children,
    nav,
    useHostNav = false,
    screenClassNames = [],
    screenRef,
}: Readonly<SimulatorPhoneShellProps>) {
    const shellClassName = [
        cls.shell,
        useHostNav ? cls.shellHostNav : '',
        ...screenClassNames,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={shellClassName} data-testid="simulator-device-shell">
            <div className={cls.shellScreen} ref={screenRef}>
                {children}
            </div>
            {nav}
        </div>
    );
}
