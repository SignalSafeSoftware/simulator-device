import { SIMULATOR_DEVICE_CLASS_NAMES as cls } from './simulatorDeviceClasses.js';

export interface SimulatorPhoneNavItemProps {
    label: string;
    icon?: string;
    active?: boolean;
    disabled?: boolean;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    ariaLabel?: string;
    describedBy?: string;
}

export default function SimulatorPhoneNavItem({
    label,
    icon,
    active = false,
    disabled = false,
    onClick,
    ariaLabel,
    describedBy,
}: Readonly<SimulatorPhoneNavItemProps>) {
    return (
        <button
            type="button"
            disabled={disabled}
            aria-current={active ? 'page' : undefined}
            aria-label={ariaLabel ?? label}
            aria-describedby={describedBy}
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
