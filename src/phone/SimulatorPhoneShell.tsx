import { useState, type ReactNode, type Ref } from 'react';
import { ScreenActionMenuContext } from '@signalsafe/simulator-react/contract/screenActionMenu';
import { SimulatorPage } from '@signalsafe/simulator-react/ui/layout/SimulatorPage';
import { SIMULATOR_DEVICE_CLASS_NAMES as cls } from '../simulatorDeviceClasses.js';

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
    const [screenMenu, setScreenMenu] = useState<ReactNode>(null);
    const shellClassName = [cls.shell, useHostNav ? cls.shellHostNav : '', ...screenClassNames]
        .filter(Boolean)
        .join(' ');

    return (
        <ScreenActionMenuContext.Provider value={setScreenMenu}>
            <SimulatorPage
                className={shellClassName}
                data-testid='simulator-device-shell'
                footer={screenMenu ?? nav}
            >
                <div className={cls.shellScreen} ref={screenRef}>
                    <div className={cls.shellSessionColumn}>{children}</div>
                </div>
            </SimulatorPage>
        </ScreenActionMenuContext.Provider>
    );
}
