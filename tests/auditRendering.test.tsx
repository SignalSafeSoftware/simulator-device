import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SimulatorApp } from '@signalsafe/simulator-core/simulatorApp';
import { SimulatorPhoneScreenId } from '@signalsafe/simulator-core/devicePayload';
import SimulatorDevice from '../src/SimulatorDevice.js';

describe('audited full-device conversion through rendered screens', () => {
    it('renders history without inventing an incoming call', () => {
        const view = render(
            <SimulatorDevice
                value={{
                    entry_point: {
                        app: SimulatorApp.Phone,
                        screen: SimulatorPhoneScreenId.History,
                    },
                    phone: {
                        history: [{ id: 'prior', name: 'History-only caller', number: '123' }],
                    },
                }}
            />,
        );
        expect(view.getByText('History-only caller')).toBeInstanceOf(HTMLElement);
        expect(view.queryByRole('button', { name: 'Answer' })).toBeNull();
    });

    it('renders voicemail without an incoming call', () => {
        const view = render(
            <SimulatorDevice
                value={{
                    entry_point: {
                        app: SimulatorApp.Phone,
                        screen: SimulatorPhoneScreenId.Voicemail,
                    },
                    phone: {
                        voicemail: {
                            transcript: 'Retained voicemail text',
                            caller_name: 'Prior caller',
                        },
                    },
                }}
            />,
        );
        expect(view.getByText('Retained voicemail text')).toBeInstanceOf(HTMLElement);
        expect(view.queryByRole('button', { name: 'Answer' })).toBeNull();
    });

    it('retains authored browser buttons and navigates to case-sensitive page IDs', () => {
        const view = render(
            <SimulatorDevice
                value={{
                    entry_point: { app: SimulatorApp.Internet, screen: 'Start' },
                    internet: {
                        pages: [
                            {
                                id: 'Start',
                                title: 'Start page',
                                url: 'https://example.test/start',
                                layout: 'content',
                                buttons: [
                                    {
                                        label: 'Continue to destination',
                                        target_page_id: 'CaseSensitive',
                                    },
                                ],
                            },
                            {
                                id: 'CaseSensitive',
                                title: 'Destination',
                                url: 'https://example.test/destination',
                                layout: 'content',
                                content: 'Arrived at the authored destination',
                            },
                        ],
                    },
                }}
            />,
        );
        fireEvent.click(view.getByRole('button', { name: 'Continue to destination' }));
        expect(view.getByText('Arrived at the authored destination')).toBeInstanceOf(HTMLElement);
    });
});
