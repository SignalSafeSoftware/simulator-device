import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, within } from '@testing-library/react';
import { SimulatorWithSession, getInitialSessionState } from '@signalsafe/simulator-react';
import SimulatorPhoneNav from '../src/SimulatorPhoneNav.js';
import SimulatorPhoneDevice from '../src/SimulatorPhoneDevice.js';

const homeState = () => getInitialSessionState({channel: 'home', entryPoint: {app: 'home', screen: 'home'},
    home: {widgets: [], featuredApps: [], settingsSections: [{id: 'general', title: 'General'}]}});

describe('source package consumer navigation compatibility', () => {
    for (const Component of [SimulatorWithSession, SimulatorPhoneDevice]) {
        it(`${Component.name} intercepts the rendered Settings button once without moving package state`, () => {
            const dispatch = vi.fn();
            const onNavigation = vi.fn(() => 'handled' as const);
            const onNavigationEvent = vi.fn();
            const {container} = render(<Component state={homeState()} dispatch={dispatch} onNavigation={onNavigation} onNavigationEvent={onNavigationEvent}/>);
            fireEvent.click(within(container).getByRole('button', {name: 'Settings'}));
            expect(onNavigation).toHaveBeenCalledTimes(1);
            expect(onNavigation).toHaveBeenCalledWith({kind: 'screen', from: {app: 'home', screen: 'home', primaryMenu: true}, to: {app: 'home', screen: 'settings', primaryMenu: true}});
            expect(dispatch.mock.calls.some(([action]) => action.type === 'SIMULATOR_ACTION' && action.action.type === 'navigate_screen')).toBe(false);
            expect(onNavigationEvent).toHaveBeenCalledTimes(1);
        });
        it(`${Component.name} delegates Settings with unchanged legacy observer support`, () => {
            const dispatch = vi.fn();
            const observer = vi.fn();
            const {container} = render(<Component state={homeState()} dispatch={dispatch} onSimulatorEvent={observer} onNavigation={() => 'delegate'}/>);
            fireEvent.click(within(container).getByRole('button', {name:'Settings'}));
            expect(dispatch).toHaveBeenCalledWith({type:'SIMULATOR_ACTION', action:{type:'navigate_screen',app:'home',screen:'settings'}});
            expect(observer).toHaveBeenCalledWith(expect.objectContaining({kind:'settings_opened'}));
        });
    }
    it('device Contacts primary Back emits one primary request, with no artificial screen hops', () => {
        const state = getInitialSessionState({channel:'phone',entryPoint:{app:'phone',screen:'contacts'}});
        const dispatch = vi.fn();
        const events = vi.fn();
        const {container} = render(<SimulatorPhoneDevice state={state} dispatch={dispatch} onNavigationEvent={events}/>);
        const nav = within(container).getByTestId('simulator-device-nav');
        fireEvent.click(within(nav).getByRole('button',{name:'Back'}));
        expect(dispatch).toHaveBeenCalledExactlyOnceWith({type:'BACK'});
        expect(events).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({kind:'back', disposition:'delegated'}));
    });
    for (const Component of [SimulatorWithSession, SimulatorPhoneDevice, SimulatorPhoneNav]) {
        it(`${Component.name} intercepts secondary menu navigation without dispatch`, () => {
            const state = getInitialSessionState({channel:'phone',entryPoint:{app:'phone',screen:'contacts'}, phone: {content: {}, chosenIndex: null, callHistory: []}});
            const dispatch = vi.fn();
            const onNavigation = vi.fn(() => 'handled' as const);
            const {container} = render(<Component state={state} dispatch={dispatch} onNavigation={onNavigation}/>);
            const nav = container.querySelector('[aria-label="App secondary menu"]');
            expect(nav).not.toBeNull();
            if (nav === null) throw new Error('missing secondary nav');
            const item = Array.from(nav.querySelectorAll('button')).find((button) => button.getAttribute('aria-label') === 'History');
            expect(item).toBeDefined();
            if (item === undefined) throw new Error('missing History entry');
            fireEvent.click(item);
            expect(onNavigation).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({kind:'screen', to: expect.objectContaining({app:'phone',screen:'history'})}));
            expect(dispatch).not.toHaveBeenCalled();
        });
    }

});
