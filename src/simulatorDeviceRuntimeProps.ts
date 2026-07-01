import type { SimulatorPhoneDeviceProps } from './SimulatorPhoneDevice.js';

/**
 * Props {@link SimulatorPhoneDevice} manages internally or via {@link SimulatorDevicePhoneOptions};
 * not exposed as top-level {@link SimulatorDevice} props.
 */
export type SimulatorDeviceManagedPhoneDeviceProps =
    | 'state'
    | 'dispatch'
    | 'renderContactDetail'
    | 'contactDetail'
    | 'renderIncomingCallExtra'
    | 'className'
    | 'screenClassNames';

/**
 * Runtime passthrough props forwarded from {@link SimulatorDevice} to {@link SimulatorPhoneDevice}
 * and then to `SimulatorWithSession`. Session `state` / `dispatch` are owned by `SimulatorDevice`.
 *
 * Use for preview/run hosts that need interaction events, developer tools, exit chrome,
 * deep-link contact search seed (`initialContactsSearch`), or custom render slots without
 * managing session state manually.
 */
export type SimulatorDeviceRuntimePassthroughProps = Omit<
    SimulatorPhoneDeviceProps,
    SimulatorDeviceManagedPhoneDeviceProps
>;
