import { act, fireEvent, render } from '@testing-library/react';
import { createSimulatorDatasource } from '@signalsafe/simulator-react';
import type { SimulatorPhoneDeviceProps } from '../src/SimulatorPhoneDevice.js';
import SimulatorDevice from '../src/SimulatorDevice.js';
import { buildContactsDeviceJson } from './support/deviceJsonFixtures.js';
import { expect, it, vi } from 'vitest';

const capture = vi.hoisted(() => ({ dispatch: undefined as SimulatorPhoneDeviceProps['dispatch'] | undefined }));
vi.mock('../src/SimulatorPhoneDevice.js', () => ({ default: (props: SimulatorPhoneDeviceProps) => {
    capture.dispatch = props.dispatch;
    const contact = props.state.payload.contacts?.[0];
    if (!contact) return null;
    const context = { state: props.state, dispatch: props.dispatch, originalContact: contact };
    return <><button onClick={() => props.contactDetail?.onSave?.(contact, context)}>Save</button><button onClick={() => props.contactDetail?.onDelete?.(contact, context)}>Delete</button></>;
} }));

it('does not mutate JSON for datasource-backed contact changes', () => {
    const onChange = vi.fn();
    const onSave = vi.fn();
    const onDelete = vi.fn();
    const view = render(<SimulatorDevice datasource={createSimulatorDatasource(buildContactsDeviceJson())} onChange={onChange} phone={{ contactDetail: { onSave, onDelete } }} />);
    fireEvent.click(view.getByRole('button', { name: 'Save' }));
    fireEvent.click(view.getByRole('button', { name: 'Delete' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(onSave).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledOnce();
});

it('leaves save unwired when no persistence callback exists', () => {
    const view = render(<SimulatorDevice value={buildContactsDeviceJson()} phone={{ contactDetail: {} }} />);
    fireEvent.click(view.getByRole('button', { name: 'Save' }));
    expect(view.getByRole('button', { name: 'Save' })).toBeTruthy();
});

it('ignores a retained dispatch callback after the value becomes unsupported', () => {
    const view = render(<SimulatorDevice value={buildContactsDeviceJson()} />);
    const dispatch = capture.dispatch;
    if (!dispatch) throw new Error('Missing dispatch');
    const unsupported = Object.assign(buildContactsDeviceJson(), { type: 'desktop' });
    view.rerender(<SimulatorDevice value={unsupported} />);
    act(() => dispatch({ type: 'BACK' }));
    expect(view.getByTestId('simulator-device-unsupported')).toBeTruthy();
});

it('rejects simultaneous JSON and datasource at the runtime boundary', () => {
    const value = buildContactsDeviceJson();
    const invalid = Object.assign({ value }, { datasource: createSimulatorDatasource(value) });
    // JavaScript consumers can bypass the mutually exclusive TypeScript props.
    // @ts-expect-error Deliberately invalid input exercises the public runtime guard.
    expect(() => render(<SimulatorDevice {...invalid} />)).toThrow('Supply either value or datasource');
});
