import { act, cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { fullDeviceToPayload } from '@signalsafe/simulator-react/adapters/deviceToSession';
import { getInitialSessionState } from '@signalsafe/simulator-react/state/simulatorSessionInitialState';
import SimulatorPhoneDevice from '../src/phone/SimulatorPhoneDevice';
import SimulatorDevice from '../src/SimulatorDevice';

const device = {
    entry_point: {
        app: 'messages',
        screen: 'thread_detail',
        target: { kind: 'conversation', id: 'A' },
    },
    messages: {
        thread_detail: {
            id: 'A',
            sender_display_name: 'Contact',
            messages: [
                { id: 'one', from: 'them', text: 'Immediate', delay_seconds: 0 },
                { id: 'two', from: 'them', text: 'Later', delay_seconds: 1 },
            ],
        },
    },
} as const;
function texts(): string[] {
    return within(screen.getByRole('list', { name: 'Message timeline' }))
        .queryAllByRole('listitem')
        .map((item) => item.textContent ?? '');
}
afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

it('forwards controlled conversation time through full phone composition without replay effects', () => {
    vi.useFakeTimers();
    const state = getInitialSessionState(
        fullDeviceToPayload({
            ...device,
            messages: {
                thread_detail: {
                    ...device.messages.thread_detail,
                    messages: [...device.messages.thread_detail.messages],
                },
            },
        }),
    );
    const dispatch = vi.fn();
    const onSimulatorEvent = vi.fn();
    const view = (elapsedMs: number) => (
        <SimulatorPhoneDevice
            state={state}
            dispatch={dispatch}
            onSimulatorEvent={onSimulatorEvent}
            scriptedConversationClock={{ conversationId: 'A', elapsedMs }}
        />
    );
    const rendered = render(view(1000));
    expect(texts()).toEqual(['Immediate', 'Later']);
    const phone = rendered.container.querySelector('[data-simulator-anchor="screen"]');
    expect(phone).not.toBeNull();
    rendered.rerender(view(0));
    expect(texts()).toEqual(['Immediate']);
    expect(rendered.container.querySelector('[data-simulator-anchor="screen"]')).toBe(phone);
    act(() => vi.advanceTimersByTime(10_000));
    expect(texts()).toEqual(['Immediate']);
    expect(dispatch).not.toHaveBeenCalled();
    expect(onSimulatorEvent).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
});

it('forwards the same optional clock through the value-owned device entry point', () => {
    vi.useFakeTimers();
    const value = {
        ...device,
        messages: {
            thread_detail: {
                ...device.messages.thread_detail,
                messages: [...device.messages.thread_detail.messages],
            },
        },
    };
    const original = JSON.stringify(value);
    const onChange = vi.fn();
    const view = (elapsedMs: number) => (
        <SimulatorDevice
            value={value}
            onChange={onChange}
            scriptedConversationClock={{ conversationId: 'A', elapsedMs }}
        />
    );
    const rendered = render(view(0));
    expect(texts()).toEqual(['Immediate']);
    rendered.rerender(view(1000));
    expect(texts()).toEqual(['Immediate', 'Later']);
    rendered.rerender(view(0));
    expect(texts()).toEqual(['Immediate']);
    expect(onChange).not.toHaveBeenCalled();
    expect(JSON.stringify(value)).toBe(original);
    expect(vi.getTimerCount()).toBe(0);
});

it('keeps runtime replies immediate while full device authored messages still follow logical time', () => {
    vi.useFakeTimers();
    const authored = [...device.messages.thread_detail.messages];
    const local = {
        id: 'runtime-local',
        from: 'me',
        text: 'Local reply',
        delay_seconds: 20,
    } as const;
    const state = getInitialSessionState(
        fullDeviceToPayload({
            ...device,
            messages: {
                thread_detail: { ...device.messages.thread_detail, messages: [...authored, local] },
            },
        }),
    );
    const dispatch = vi.fn();
    const onSimulatorEvent = vi.fn();
    const view = (elapsedMs: number) => (
        <SimulatorPhoneDevice
            state={state}
            dispatch={dispatch}
            onSimulatorEvent={onSimulatorEvent}
            scriptedConversationClock={{
                conversationId: 'A',
                elapsedMs,
                immediateMessageIds: ['runtime-local'],
            }}
        />
    );
    const rendered = render(view(0));
    expect(texts()).toEqual(['Immediate', 'Local reply']);
    rendered.rerender(view(1000));
    expect(texts()).toEqual(['Immediate', 'Later', 'Local reply']);
    rendered.rerender(view(0));
    expect(texts()).toEqual(['Immediate', 'Local reply']);
    act(() => vi.advanceTimersByTime(30_000));
    expect(texts()).toEqual(['Immediate', 'Local reply']);
    expect(dispatch).not.toHaveBeenCalled();
    expect(onSimulatorEvent).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
});
