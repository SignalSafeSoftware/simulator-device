import { expect, it, vi } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';
import SimulatorPhoneContactDetailForm from '../src/contact/SimulatorPhoneContactDetailForm.js';
import { buildState } from './support/sessionFixtures.js';
it('keeps a rejected contact draft and permits a deliberate retry', async () => {
  const contact={id:'one',displayName:'Before',number:'+12025550123'};
  const save=vi.fn().mockRejectedValueOnce(new Error('Revision conflict')).mockResolvedValueOnce(undefined);
  const {getByLabelText,getByRole}=render(<SimulatorPhoneContactDetailForm contact={contact} mode="editable" onBack={vi.fn()} onSave={save} context={{state:buildState(),dispatch:vi.fn(),originalContact:contact}}/>);
  fireEvent.change(getByLabelText('Display name'),{target:{value:'Draft'}});
  fireEvent.click(getByRole('button',{name:'Save'}));
  await waitFor(()=>expect(getByRole('alert').textContent).toBe('Revision conflict'));
  expect(getByLabelText('Display name')).toHaveProperty('value','Draft');
  fireEvent.click(getByRole('button',{name:'Save'}));
  await waitFor(()=>expect(save).toHaveBeenCalledTimes(2));
  expect(save).toHaveBeenLastCalledWith({...contact,displayName:'Draft'});
});
