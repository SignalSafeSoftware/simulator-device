import type { ReactNode } from 'react';
import { SimulatorAppsProvider, type SimulatorAppsHost } from '@signalsafe/simulator-react';
import SimulatorPhoneShell from './SimulatorPhoneShell.js';
const Shell: SimulatorAppsHost['Shell'] = ({ children, nav }) => (
    <SimulatorPhoneShell useHostNav nav={nav}>
        {children}
    </SimulatorPhoneShell>
);
export function SimulatorDeviceAppsProvider({
    children,
    value = {},
}: {
    children: ReactNode;
    value?: Partial<SimulatorAppsHost>;
}) {
    return <SimulatorAppsProvider value={{ Shell, ...value }}>{children}</SimulatorAppsProvider>;
}
