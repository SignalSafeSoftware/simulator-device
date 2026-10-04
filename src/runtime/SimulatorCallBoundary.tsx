import type { ReactNode } from 'react';
/** Calls overlay the app without changing its destination, drafts or lock state. */
export function SimulatorCallBoundary({
    active,
    call,
    children,
}: Readonly<{
    active: boolean;
    call: ReactNode;
    children: ReactNode;
}>) {
    return (
        <>
            <div className="package-device simulator-host-device__content" hidden={active}>
                {children}
            </div>
            {active && call}
        </>
    );
}
