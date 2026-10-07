import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useDemoSession } from '../docs/examples/local-apps/useDemoSession';
import { SimulatorDispatchActionType } from '@signalsafe/simulator-react/state/simulatorDispatchActions';
import { SimulatorActionType } from '@signalsafe/simulator-react/utils/telemetry/simulatorActionTaxonomy';
import {
    RegionalDateFormat,
    RegionalTimeFormat,
    type RegionalPreferences,
} from '@signalsafe/simulator-react/apps/settings/regionalFormats';

const regional: RegionalPreferences = {
    country: 'US',
    language: 'en',
    currency: 'USD',
    dateFormat: RegionalDateFormat.YearMonthDay,
    timeFormat: RegionalTimeFormat.TwentyFourHour,
    timeZone: 'America/Denver',
};
afterEach(() => vi.useRealTimers());

it('keeps demo message instants raw across regional preference changes and replies', () => {
    vi.useFakeTimers();
    const now = new Date('2026-10-06T12:34:56.000Z');
    vi.setSystemTime(now);
    const { result, rerender } = renderHook((preferences) => useDemoSession(preferences), {
        initialProps: regional,
    });
    const original = result.current.state.payload.sms;
    expect(original?.threads?.length).toBeGreaterThan(1);
    for (const thread of original?.threads ?? []) {
        expect(thread.timestamp).toMatch(/^2026-.*Z$/);
    }
    for (const message of original?.thread.messages ?? []) {
        expect(message.timestamp).toMatch(/^2026-.*Z$/);
    }
    rerender({ ...regional, country: 'JP', language: 'ja', timeZone: 'Asia/Tokyo' });
    expect(result.current.state.payload.sms).toEqual(original);
    act(() =>
        result.current.dispatch({
            type: SimulatorDispatchActionType.SimulatorAction,
            action: { type: SimulatorActionType.SendReply, replyText: 'A new demo reply' },
        }),
    );
    const sms = result.current.state.payload.sms;
    expect(sms?.thread.messages.at(-1)?.timestamp).toBe(now.toISOString());
    expect(sms?.thread.last_at).toBe(now.toISOString());
    expect(sms?.threads?.find((thread) => thread.id === 'demo-thread')?.timestamp).toBe(
        now.toISOString(),
    );
});
