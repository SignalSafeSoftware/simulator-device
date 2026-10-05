import {
    SIM_PHONE_CONTACT_DETAIL_ACTIONS,
    SIM_PHONE_CONTACT_DETAIL_FIELD,
    SIM_PHONE_CONTACT_DETAIL_INPUT,
    SIM_PHONE_CONTACT_DETAIL_LABEL,
    SIM_PHONE_CONTACT_DETAIL_VALUE,
} from '@signalsafe/simulator-react/ui/styles/semanticSimulatorClasses';
import {} from '@signalsafe/simulator-react/ui/layout/SimulatorPage';
import { useSimulatorLocale } from '@signalsafe/simulator-react/i18n/SimulatorLocale';
import {} from '@signalsafe/simulator-react/contract/capabilities';
import { usePhoneNumberFormatter } from '@signalsafe/simulator-react/contract/phonePresentation';
import { ContactValueKind } from '@signalsafe/simulator-react/ui/contacts/ContactValuesEditor';
import ContactValueList from './ContactValueList.js';
import { SIMULATOR_DEVICE_CLASS_NAMES } from '../simulatorDeviceClasses.js';
import { useId } from 'react';
import {
    type SimulatorPhoneContactDetailFormProps,
    type SimulatorPhoneContactDetailValues,
} from './contactDetailTypes.js';
import type { useContactFormState } from './useContactFormState.js';

export function fieldId(suffix: string, contactId: string): string {
    return `simulator-phone-contact-detail-${suffix}-${contactId}`;
}

export type FieldProps = {
    draft: SimulatorPhoneContactDetailValues;
    editable: boolean;
    updateField: (patch: Partial<SimulatorPhoneContactDetailValues>) => void;
};

export function ContactActions({
    editable,
    pending,
    conflict,
    unavailable,
    onSave,
    onDelete,
    handleSave,
    handleDelete,
    back,
}: Readonly<
    Pick<
        ReturnType<typeof useContactFormState>,
        'editable' | 'pending' | 'conflict' | 'unavailable' | 'handleSave' | 'handleDelete' | 'back'
    > &
        Pick<SimulatorPhoneContactDetailFormProps, 'onSave' | 'onDelete'>
>) {
    const screenLocale = useSimulatorLocale();
    return (
        <div className={SIM_PHONE_CONTACT_DETAIL_ACTIONS}>
            <button
                type="button"
                className={`${SIMULATOR_DEVICE_CLASS_NAMES.contactDetailButton} ${SIMULATOR_DEVICE_CLASS_NAMES.contactDetailButtonBack}`}
                aria-label={screenLocale.t(
                    'screen.simulatorPhoneContactDetailForm.back.to.contacts.list',
                )}
                onClick={back}
                disabled={pending}
            >
                {screenLocale.t('screen.simulatorPhoneContactDetailForm.back')}
            </button>
            {editable && onSave != null && (
                <button
                    type="button"
                    className={`${SIMULATOR_DEVICE_CLASS_NAMES.contactDetailButton} ${SIMULATOR_DEVICE_CLASS_NAMES.contactDetailButtonSave}`}
                    onClick={handleSave}
                    disabled={conflict || pending || Boolean(unavailable)}
                >
                    {screenLocale.t('screen.simulatorPhoneContactDetailForm.save')}
                </button>
            )}
            {onDelete != null && (
                <button
                    type="button"
                    className={`${SIMULATOR_DEVICE_CLASS_NAMES.contactDetailButton} ${SIMULATOR_DEVICE_CLASS_NAMES.contactDetailButtonDelete}`}
                    onClick={handleDelete}
                    disabled={!editable || conflict || pending || Boolean(unavailable)}
                    aria-disabled={!editable || conflict || pending || Boolean(unavailable)}
                >
                    {screenLocale.t('screen.simulatorPhoneContactDetailForm.delete')}
                </button>
            )}
        </div>
    );
}

export function ScalarContactField({
    fieldKey,
    label,
    inputType,
    value,
    display,
    editable,
    addLabel,
    onChange,
    onAdd,
}: Readonly<{
    fieldKey: string;
    label: string;
    inputType: 'tel' | 'email';
    value: string;
    display: string;
    editable: boolean;
    addLabel: string;
    onChange: (value: string) => void;
    onAdd: () => void;
}>) {
    const instanceId = useId();
    return (
        <>
            <div className={SIM_PHONE_CONTACT_DETAIL_FIELD}>
                <label
                    className={SIM_PHONE_CONTACT_DETAIL_LABEL}
                    htmlFor={fieldId(fieldKey, instanceId)}
                >
                    {label}
                </label>
                {editable ? (
                    <input
                        id={fieldId(fieldKey, instanceId)}
                        className={SIM_PHONE_CONTACT_DETAIL_INPUT}
                        type={inputType}
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                    />
                ) : (
                    <span className={SIM_PHONE_CONTACT_DETAIL_VALUE}>{display}</span>
                )}
            </div>
            {editable && (
                <button type="button" onClick={onAdd}>
                    {addLabel}
                </button>
            )}
        </>
    );
}

export function ContactPhoneFields({
    draft,
    editable,
    updateField,
    renderPhoneAction,
}: Readonly<FieldProps & Pick<SimulatorPhoneContactDetailFormProps, 'renderPhoneAction'>>) {
    const screenLocale = useSimulatorLocale();
    const scalarNumber = draft.number ?? '';
    const formatNumber = usePhoneNumberFormatter();
    const label = screenLocale.t('screen.simulatorPhoneContactDetailForm.phone.number');
    if (draft.phoneNumbers) {
        return (
            <ContactValueList
                kind={ContactValueKind.Phone}
                title={label}
                values={draft.phoneNumbers}
                editable={editable}
                onChange={(phoneNumbers) =>
                    updateField({ phoneNumbers, number: phoneNumbers[0]?.number })
                }
                renderAction={
                    renderPhoneAction ? (phone) => renderPhoneAction(phone, draft) : undefined
                }
            />
        );
    }
    if (!editable && !scalarNumber.trim()) return null;
    return (
        <ScalarContactField
            fieldKey="number"
            label={label}
            inputType="tel"
            value={scalarNumber}
            display={formatNumber(scalarNumber)}
            editable={editable}
            addLabel={screenLocale.t('screen.simulatorPhoneContactDetailForm.add.phone.number')}
            onChange={(number) => updateField({ number })}
            onAdd={() =>
                updateField({
                    phoneNumbers: [
                        ...(draft.number
                            ? [{ label: '', value: draft.number, number: draft.number }]
                            : []),
                        { label: '', value: '' },
                    ],
                })
            }
        />
    );
}

export function ContactEmailFields({ draft, editable, updateField }: Readonly<FieldProps>) {
    const screenLocale = useSimulatorLocale();
    const scalarEmail = draft.email ?? '';
    const label = screenLocale.t('screen.simulatorPhoneContactDetailForm.email');
    if (draft.emailAddresses) {
        return (
            <ContactValueList
                kind={ContactValueKind.Email}
                title={label}
                values={draft.emailAddresses}
                editable={editable}
                onChange={(emailAddresses) =>
                    updateField({ emailAddresses, email: emailAddresses[0]?.value })
                }
            />
        );
    }
    if (!editable && !scalarEmail.trim()) return null;
    return (
        <ScalarContactField
            fieldKey="email"
            label={label}
            inputType="email"
            value={scalarEmail}
            display={scalarEmail}
            editable={editable}
            addLabel={screenLocale.t('screen.simulatorPhoneContactDetailForm.add.email')}
            onChange={(email) => updateField({ email })}
            onAdd={() =>
                updateField({
                    emailAddresses: [
                        ...(draft.email ? [{ label: '', value: draft.email }] : []),
                        { label: '', value: '' },
                    ],
                })
            }
        />
    );
}
