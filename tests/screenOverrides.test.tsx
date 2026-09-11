import { useEffect, useReducer } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, within } from '@testing-library/react';
import { SimulatorWithSession, getInitialSessionState, simulatorSessionReducer, type SimulatorScreenOverrideProps, type SimulatorScreenOverrides } from '@signalsafe/simulator-react';
import SimulatorPhoneDevice from '../src/SimulatorPhoneDevice.js';

const initial = () => getInitialSessionState({templateId:null,templateKey:'override-fixture',name:'Override fixture',topicTags:[],runId:null,attemptId:null,device:null,email:null,sms:null,browser:null,phone:null,contacts:null,directory:null,channel:'home',entryPoint:{app:'home',screen:'home'},home:{widgets:[],featuredApps:[],settingsSections:[{id:'general',title:'General'}]}});

// Consumer compile-time contract: closed screens reject accidental misspellings.
const invalid: SimulatorScreenOverrides = { home: {
    // @ts-expect-error Settings is the lowercase schema screen ID.
    Settings: () => null,
} };
void invalid;

describe('actual source screen override consumer', () => {
    for (const Component of [SimulatorWithSession, SimulatorPhoneDevice]) {
        for (const entry of ['button','local','action'] as const) {
            it(`${Component.name}: ${entry} enters the same screen, retains shell and backs out once`, () => {
                const enter = vi.fn(); const exit = vi.fn(); const events = vi.fn();
                function Settings({onBack, location}: SimulatorScreenOverrideProps) {
                    useEffect(() => { enter(); return exit; }, []);
                    return <section aria-label="Host settings"><h1>{location.screen}</h1><button onClick={onBack}>Return to previous screen</button></section>;
                }
                const overrides: SimulatorScreenOverrides = {home:{settings:Settings}};
                function Fixture() {
                    const [state, dispatch] = useReducer(simulatorSessionReducer, undefined, initial);
                    return <><button onClick={() => dispatch({type:'NAV_LOCAL',app:'home',screen:'settings'})}>Local entry</button><button onClick={() => dispatch({type:'SIMULATOR_ACTION',action:{type:'navigate_screen',app:'home',screen:'settings'}})}>Action entry</button><Component state={state} dispatch={dispatch} screenOverrides={overrides} onNavigationEvent={events}/></>;
                }
                const {container,unmount} = render(<Fixture/>); const view=within(container);
                fireEvent.click(view.getByRole('button',{name:entry==='button'?'Settings':entry==='local'?'Local entry':'Action entry'}));
                expect(view.getByRole('region',{name:'Host settings'})).toBeTruthy();
                expect(container.querySelector('.simulator-runtime__screen')).not.toBeNull();
                if (Component === SimulatorPhoneDevice) expect(view.getByTestId('simulator-device-nav')).toBeTruthy();
                expect(enter).toHaveBeenCalledTimes(1);
                fireEvent.click(view.getByRole('button',{name:'Return to previous screen'}));
                expect(view.queryByRole('region',{name:'Host settings'})).toBeNull();
                expect(view.getByRole('button',{name:'Settings'})).toBeTruthy();
                expect(exit).toHaveBeenCalledTimes(1);
                expect(events).toHaveBeenLastCalledWith(expect.objectContaining({kind:'back',disposition:'delegated'}));
                unmount();
            });
        }
        it(`${Component.name}: handled navigation never enters an override`, () => {
            const Screen=vi.fn(()=> <h1>Host screen</h1>);
            const {container}=render(<Component state={initial()} dispatch={vi.fn()} screenOverrides={{home:{settings:Screen}}} onNavigation={()=>'handled'}/>);
            fireEvent.click(within(container).getByRole('button',{name:'Settings'}));
            expect(Screen).not.toHaveBeenCalled();
        });
        it(`${Component.name}: default fallback, intentional empty content and explicit fallback`, () => {
            const state=simulatorSessionReducer(initial(),{type:'NAV_LOCAL',app:'home',screen:'settings'});
            const {container,rerender}=render(<Component state={state} dispatch={vi.fn()}/>);
            const original=container.textContent;
            rerender(<Component state={state} dispatch={vi.fn()} screenOverrides={{home:{settings:()=>null}}}/>);
            expect(container.textContent).not.toEqual(original);
            function Fallback({renderDefault}: SimulatorScreenOverrideProps) { return <>{renderDefault()}</>; }
            rerender(<Component state={state} dispatch={vi.fn()} screenOverrides={{home:{settings:Fallback}}}/>);
            expect(container.textContent).toEqual(original);
        });
        it(`${Component.name}: state updates do not remount; removal exits and restores default`, () => {
            const enter=vi.fn(); const exit=vi.fn();
            function Screen() { useEffect(()=>{enter();return exit;},[]); return <h1>Host screen</h1>; }
            const state=simulatorSessionReducer(initial(),{type:'NAV_LOCAL',app:'home',screen:'settings'});
            const {rerender,container}=render(<Component state={state} dispatch={vi.fn()} screenOverrides={{home:{settings:Screen}}}/>);
            rerender(<Component state={{...state}} dispatch={vi.fn()} screenOverrides={{home:{settings:Screen}}}/>);
            expect(enter).toHaveBeenCalledTimes(1);
            rerender(<Component state={state} dispatch={vi.fn()}/>);
            expect(exit).toHaveBeenCalledTimes(1);
            expect(within(container).queryByText('Host screen')).toBeNull();
        });
    }
    it('the same component at different destinations exits and reenters, including deep links', () => {
        const enter=vi.fn(); const exit=vi.fn();
        function Screen({location}:SimulatorScreenOverrideProps) { useEffect(()=>{enter(location.screen);return ()=>exit(location.screen);},[]);return <h1>Host {location.screen}</h1>; }
        const overrides:SimulatorScreenOverrides={home:{home:Screen,settings:Screen}};
        const {rerender,unmount}=render(<SimulatorPhoneDevice state={initial()} dispatch={vi.fn()} screenOverrides={overrides}/>);
        const settings=simulatorSessionReducer(initial(),{type:'NAV_LOCAL',app:'home',screen:'settings'});
        rerender(<SimulatorPhoneDevice state={settings} dispatch={vi.fn()} screenOverrides={overrides}/>);
        expect(enter.mock.calls).toEqual([['home'],['settings']]);
        expect(exit).toHaveBeenCalledExactlyOnceWith('home');
        unmount();expect(exit.mock.calls).toEqual([['home'],['settings']]);
    });
    it('an override dispatch uses the same single interception boundary as device navigation',()=>{
        const events=vi.fn(); const raw=vi.fn();
        const state=simulatorSessionReducer(initial(),{type:'NAV_LOCAL',app:'home',screen:'settings'});
        function Screen({dispatch}:SimulatorScreenOverrideProps){return <button onClick={()=>dispatch({type:'SWITCH_APP',app:'phone'})}>Open phone</button>;}
        const {container}=render(<SimulatorPhoneDevice state={state} dispatch={raw} screenOverrides={{home:{settings:Screen}}} onNavigation={()=>'handled'} onNavigationEvent={events}/>);
        fireEvent.click(within(container).getByRole('button',{name:'Open phone'}));
        expect(raw).not.toHaveBeenCalled();expect(events).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({kind:'app',disposition:'handled'}));
    });
});
