import { expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import SimulatorPhoneDevice from '../src/SimulatorPhoneDevice.js';
import { buildState } from './support/sessionFixtures.js';
it('restores focus to the originating contact after closing details',()=>{
  const state=buildState({activeApp:'phone',showPrimaryMenu:false,phone:{screen:'contacts',stack:[],chosenIndex:null}});
  state.payload.contacts=[{id:'one',displayName:'Synthetic Contact',number:'+12025550123'}];
  const {getByRole}=render(<SimulatorPhoneDevice state={state} dispatch={vi.fn()} contactDetail={{mode:'read-only'}}/>);
  expect(getByRole('button',{name:/Synthetic Contact/}).closest('[data-simulator-contact-id]')).not.toBeNull();
  fireEvent.click(getByRole('button',{name:/Synthetic Contact/}));
  fireEvent.click(getByRole('button',{name:'Back to contacts list'}));
  expect(document.activeElement).toBe(getByRole('button',{name:/Synthetic Contact/}));
});
