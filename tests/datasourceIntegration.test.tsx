import { expect, it, vi } from 'vitest';
import { fireEvent, render, waitFor, within } from '@testing-library/react';
import { createSimulatorDatasource } from '@signalsafe/simulator-react';
import SimulatorDevice from '../src/SimulatorDevice.js';
import type { SimulatorDevicePayload } from '../src/types/simulatorDevicePayload.js';
const value: SimulatorDevicePayload = {
  entry_point: { app: 'home', screen: 'home' },
  contacts: [
    { id: 'c1', display_name: 'Source Contact', number: '+12025550123' },
  ],
  phone: {
    incoming_call: {
      caller_name: 'Scenario caller',
      transcript: 'Scenario instructions',
    },
    history: [
      {
        id: 'h1',
        name: 'Source caller',
        number: '+12025550123',
        direction: 'missed',
      },
    ],
  },
  email: {
    messages: [
      {
        id: 'e1',
        from: 'source@example.test',
        folder_id: 'inbox',
        subject: 'Source email',
      },
    ],
  },
  messages: {
    threads: [
      { id: 't1', contact_name: 'Source SMS', snippet: 'Message preview' },
    ],
    thread_detail: {
      id: 't1',
      messages: [{ from: 'them', text: 'Source text body' }],
    },
  },
};
it('supports JSON and datasource consumers without services and preserves navigation on refresh', async () => {
  const { container, rerender, getByRole, getByText } = render(
    <SimulatorDevice value={value} />,
  );
  const original = container.textContent;
  rerender(<SimulatorDevice datasource={createSimulatorDatasource(value)} />);
  await waitFor(() => expect(container.textContent).toBe(original));
  const nav = getByRole('navigation', { name: 'Simulator channels' });
  fireEvent.click(within(nav).getByRole('button', { name: 'Phone' }));
  fireEvent.click(getByRole('button', { name: 'Contacts' }));
  expect(getByText('Source Contact')).toBeTruthy();
  rerender(
    <SimulatorDevice
      datasource={createSimulatorDatasource({
        ...value,
        contacts: [{ id: 'c1', display_name: 'Refreshed Contact' }],
      })}
    />,
  );
  await waitFor(() => expect(getByText('Refreshed Contact')).toBeTruthy());
  expect(getByRole('button', { name: 'Contacts' })).toBeTruthy();
});
it('preserves a mounted contact editor draft across data refreshes', async () => {
  const onSave = vi.fn();
  const datasource = createSimulatorDatasource({
    ...value,
    entry_point: { app: 'phone', screen: 'contacts' },
  });
  const { getByText, getByLabelText, rerender } = render(
    <SimulatorDevice
      datasource={datasource}
      phone={{ contactDetail: { mode: 'editable', onSave } }}
    />,
  );
  fireEvent.click(getByText('Source Contact'));
  const name = getByLabelText(/Display name/i);
  fireEvent.change(name, { target: { value: 'My draft' } });
  rerender(
    <SimulatorDevice
      datasource={createSimulatorDatasource({
        ...value,
        contacts: [
          { id: 'c1', display_name: 'Source Contact', number: '+12025550123' },
        ],
      })}
      phone={{ contactDetail: { mode: 'editable', onSave } }}
    />,
  );
  await waitFor(() => {
    const input = getByLabelText(/Display name/i);
    expect(input instanceof HTMLInputElement && input.value).toBe('My draft');
  });
  expect(onSave).not.toHaveBeenCalled();
});

it.each([
  ['phone', 'history', 'Source caller'],
  ['phone', 'contacts', 'Source Contact'],
  ['email', 'list', 'source@example.test'],
  ['messages', 'threads', 'Source SMS'],
] as const)(
  'renders %s/%s identically from JSON and a datasource',
  async (app, screen, content) => {
    const source = { ...value, entry_point: { app, screen } };
    const { container, rerender, getByText } = render(
      <SimulatorDevice value={source} />,
    );
    expect(getByText(content)).toBeTruthy();
    const before = container.textContent;
    rerender(
      <SimulatorDevice datasource={createSimulatorDatasource(source)} />,
    );
    await waitFor(() => expect(container.textContent).toBe(before));
  },
);
