import type { ReactNode } from 'react';
import { SimulatorAppsProvider } from '@signalsafe/simulator-react/apps/shared/SimulatorAppsHost';
import type { SimulatorAppsHost } from '@signalsafe/simulator-react/apps/shared/SimulatorAppsHost';
import SimulatorPhoneShell from '../phone/SimulatorPhoneShell.js';
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
