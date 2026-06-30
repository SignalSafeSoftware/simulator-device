import { SIMULATOR_DEVICE_CLASS_NAMES as cls } from './simulatorDeviceClasses.js';

export interface SimulatorPhoneNavItemProps {
    label: string;
    icon?: string;
    active?: boolean;
    onClick: () => void;
    ariaLabel?: string;
}

export default function SimulatorPhoneNavItem({
    label,
    icon,
    active = false,
    onClick,
    ariaLabel,
}: Readonly<SimulatorPhoneNavItemProps>) {
    return (
        <button
            type="button"
            aria-current={active ? 'page' : undefined}
            aria-label={ariaLabel ?? label}
            className={
                active
                    ? `${cls.navButton} ${cls.navButtonActive}`
                    : `${cls.navButton} ${cls.navButtonInactive}`
            }
            onClick={onClick}
        >
            {icon != null && icon !== '' && (
                <span className={cls.navIcon} aria-hidden="true">
                    {icon}
                </span>
            )}
            <span className={cls.navLabel}>{label}</span>
        </button>
    );
}
