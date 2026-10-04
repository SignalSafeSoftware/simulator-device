import {
    SIM_PHONE_CONTACT_DETAIL_ACTIONS,
    SIM_PHONE_CONTACT_DETAIL_FIELD,
    SIM_PHONE_CONTACT_DETAIL_FORM,
    SIM_PHONE_CONTACT_DETAIL_HEADER,
    SIM_PHONE_CONTACT_DETAIL_IDENTITY,
    SIM_PHONE_CONTACT_DETAIL_INPUT,
    SIM_PHONE_CONTACT_DETAIL_LABEL,
    SIM_PHONE_CONTACT_DETAIL_PANEL,
    SIM_PHONE_CONTACT_DETAIL_TITLE,
    SIM_PHONE_CONTACT_DETAIL_VALUE,
} from '@signalsafe/simulator-react/ui/styles/semanticSimulatorClasses';
import { SimulatorPage } from '@signalsafe/simulator-react/ui/layout/SimulatorPage';
import { useSimulatorLocale } from '@signalsafe/simulator-react/i18n/SimulatorLocale';
import { useSimulatorCapabilities } from '@signalsafe/simulator-react/contract/capabilities';
import { usePhoneNumberFormatter } from '@signalsafe/simulator-react/contract/phonePresentation';
import ContactValueList from './ContactValueList.js';
import { SIMULATOR_DEVICE_CLASS_NAMES } from '../simulatorDeviceClasses.js';
import { useCallback, useId, useRef, useState } from 'react';
import {
    ContactDetailMode,
    type SimulatorPhoneContactDetailFormProps,
    type SimulatorPhoneContactDetailValues,
} from './contactDetailTypes.js';

function fieldId(suffix: string, contactId: string): string {
    return `simulator-phone-contact-detail-${suffix}-${contactId}`;
}

type FieldProps = {
    draft: SimulatorPhoneContactDetailValues;
    editable: boolean;
    updateField: (patch: Partial<SimulatorPhoneContactDetailValues>) => void;
};

function useContactFormState({
    contact: initialContact,
    mode,
    onBack,
    onSave,
    onDelete,
}: Pick<
    SimulatorPhoneContactDetailFormProps,
    'contact' | 'mode' | 'onBack' | 'onSave' | 'onDelete'
>) {
    const capability = useSimulatorCapabilities().editContact;
    const { t } = useSimulatorLocale();
    const unavailable = capability && capability.state !== 'enabled' ? capability.reason : '';
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const inFlight = useRef(false);
    const [state, setState] = useState({
        source: initialContact,
        draft: initialContact,
    });
    const sameSource = JSON.stringify(state.source) === JSON.stringify(initialContact);
    const pristine = JSON.stringify(state.draft) === JSON.stringify(state.source);
    if (
        !sameSource &&
        (pristine ||
            JSON.stringify(state.draft) === JSON.stringify(initialContact) ||
            state.source.id !== initialContact.id)
    ) {
        setState({ source: initialContact, draft: initialContact });
    }
    const draft = mode === ContactDetailMode.ReadOnly ? initialContact : state.draft;
    const conflict =
        mode === ContactDetailMode.Editable &&
        !sameSource &&
        !pristine &&
        state.source.id === initialContact.id;
    const editable = mode === ContactDetailMode.Editable;

    const updateField = useCallback((patch: Partial<SimulatorPhoneContactDetailValues>) => {
        setState((prev) => ({ ...prev, draft: { ...prev.draft, ...patch } }));
    }, []);

    const run = async (callback: typeof onSave) => {
        if (!callback || inFlight.current || conflict || unavailable || !editable) return;
        inFlight.current = true;
        setPending(true);
        setError('');
        try {
            await callback(draft);
        } catch (error_) {
            setError(error_ instanceof Error ? error_.message : t('app.contact.saveFailed'));
        } finally {
            inFlight.current = false;
            setPending(false);
        }
    };
    const handleSave = () => {
        void run(onSave);
    };
    const handleDelete = () => {
        void run(onDelete);
    };
    const back = () => {
        if (!inFlight.current) onBack();
    };

    return {
        draft,
        editable,
        conflict,
        pending,
        error,
        unavailable,
        updateField,
        handleSave,
        handleDelete,
        back,
        reload: () => setState({ source: initialContact, draft: initialContact }),
    };
}

function ContactActions({
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

function ContactPhoneFields({
    draft,
    editable,
    updateField,
    renderPhoneAction,
}: Readonly<FieldProps & Pick<SimulatorPhoneContactDetailFormProps, 'renderPhoneAction'>>) {
    const screenLocale = useSimulatorLocale();
    const instanceId = useId();
    const scalarNumber = draft.number ?? '';
    const formatNumber = usePhoneNumberFormatter();
    if (draft.phoneNumbers) {
        return (
            <ContactValueList
                kind="phone"
                title={screenLocale.t('screen.simulatorPhoneContactDetailForm.phone.number')}
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
        <>
            <div className={SIM_PHONE_CONTACT_DETAIL_FIELD}>
                <label
                    className={SIM_PHONE_CONTACT_DETAIL_LABEL}
                    htmlFor={fieldId('number', instanceId)}
                >
                    {screenLocale.t('screen.simulatorPhoneContactDetailForm.phone.number')}
                </label>
                {editable ? (
                    <input
                        id={fieldId('number', instanceId)}
                        className={SIM_PHONE_CONTACT_DETAIL_INPUT}
                        type="tel"
                        value={scalarNumber}
                        onChange={(event) => updateField({ number: event.target.value })}
                    />
                ) : (
                    <span className={SIM_PHONE_CONTACT_DETAIL_VALUE}>
                        {formatNumber(scalarNumber)}
                    </span>
                )}
            </div>
            {editable && (
                <button
                    type="button"
                    onClick={() =>
                        updateField({
                            phoneNumbers: [
                                ...(draft.number
                                    ? [{ label: '', value: draft.number, number: draft.number }]
                                    : []),
                                { label: '', value: '' },
                            ],
                        })
                    }
                >
                    {screenLocale.t('screen.simulatorPhoneContactDetailForm.add.phone.number')}
                </button>
            )}
        </>
    );
}

function ContactEmailFields({ draft, editable, updateField }: Readonly<FieldProps>) {
    const screenLocale = useSimulatorLocale();
    const instanceId = useId();
    const scalarEmail = draft.email ?? '';
    if (draft.emailAddresses) {
        return (
            <ContactValueList
                kind="email"
                title={screenLocale.t('screen.simulatorPhoneContactDetailForm.email')}
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
        <>
            <div className={SIM_PHONE_CONTACT_DETAIL_FIELD}>
                <label
                    className={SIM_PHONE_CONTACT_DETAIL_LABEL}
                    htmlFor={fieldId('email', instanceId)}
                >
                    {screenLocale.t('screen.simulatorPhoneContactDetailForm.email')}
                </label>
                {editable ? (
                    <input
                        id={fieldId('email', instanceId)}
                        className={SIM_PHONE_CONTACT_DETAIL_INPUT}
                        type="email"
                        value={scalarEmail}
                        onChange={(event) => updateField({ email: event.target.value })}
                    />
                ) : (
                    <span className={SIM_PHONE_CONTACT_DETAIL_VALUE}>{scalarEmail}</span>
                )}
            </div>
            {editable && (
                <button
                    type="button"
                    onClick={() =>
                        updateField({
                            emailAddresses: [
                                ...(draft.email ? [{ label: '', value: draft.email }] : []),
                                { label: '', value: '' },
                            ],
                        })
                    }
                >
                    {screenLocale.t('screen.simulatorPhoneContactDetailForm.add.email')}
                </button>
            )}
        </>
    );
}

export default function SimulatorPhoneContactDetailForm({
    contact: initialContact,
    mode,
    onBack,
    onSave,
    onDelete,
    renderIdentityImage,
    renderPhoneAction,
    renderExtraFields,
    renderActions,
    context,
}: Readonly<SimulatorPhoneContactDetailFormProps>) {
    const screenLocale = useSimulatorLocale();
    const instanceId = useId();

    const {
        draft,
        editable,
        conflict,
        pending,
        error,
        unavailable,
        updateField,
        handleSave,
        handleDelete,
        back,
        reload,
    } = useContactFormState({
        contact: initialContact,
        mode,
        onBack,
        onSave,
        onDelete,
    });

    return (
        <SimulatorPage
            className={SIMULATOR_DEVICE_CLASS_NAMES.contactDetail}
            data-testid="simulator-phone-contact-detail"
            header={
                <div className={SIM_PHONE_CONTACT_DETAIL_HEADER}>
                    <span tabIndex={-1} className={SIM_PHONE_CONTACT_DETAIL_TITLE}>
                        {editable
                            ? screenLocale.t('screen.simulatorPhoneContactDetailForm.edit.contact')
                            : screenLocale.t('screen.simulatorPhoneContactDetailForm.contact')}
                    </span>
                </div>
            }
        >
            {pending && (
                <output>
                    {screenLocale.t('screen.simulatorPhoneContactDetailForm.saving.contact')}
                </output>
            )}
            {error && <p role="alert">{error}</p>}
            {unavailable && <output>{unavailable}</output>}
            {onDelete && !editable && (
                <p>
                    {screenLocale.t(
                        'screen.simulatorPhoneContactDetailForm.open.editing.mode.to.delete.this.contact',
                    )}
                </p>
            )}
            {conflict && (
                <output>
                    {screenLocale.t(
                        'screen.simulatorPhoneContactDetailForm.this.contact.changed.while.you.were.editing.your.d',
                    )}
                    <button type="button" disabled={pending} onClick={reload}>
                        {screenLocale.t(
                            'screen.simulatorPhoneContactDetailForm.discard.draft.and.reload.contact',
                        )}
                    </button>
                </output>
            )}
            <div className={SIM_PHONE_CONTACT_DETAIL_PANEL}>
                <fieldset
                    className={SIM_PHONE_CONTACT_DETAIL_FORM}
                    disabled={editable && (pending || Boolean(unavailable))}
                >
                    <div className={SIM_PHONE_CONTACT_DETAIL_IDENTITY}>
                        {renderIdentityImage?.(draft)}
                        <div className={SIM_PHONE_CONTACT_DETAIL_FIELD}>
                            <label
                                className={SIM_PHONE_CONTACT_DETAIL_LABEL}
                                htmlFor={fieldId('display-name', instanceId)}
                            >
                                {screenLocale.t(
                                    'screen.simulatorPhoneContactDetailForm.display.name',
                                )}
                            </label>
                            {editable ? (
                                <input
                                    id={fieldId('display-name', instanceId)}
                                    className={SIM_PHONE_CONTACT_DETAIL_INPUT}
                                    type="text"
                                    value={draft.displayName}
                                    onChange={(event) =>
                                        updateField({ displayName: event.target.value })
                                    }
                                />
                            ) : (
                                <span className={SIM_PHONE_CONTACT_DETAIL_VALUE}>
                                    {draft.displayName}
                                </span>
                            )}
                        </div>
                    </div>
                    <ContactPhoneFields
                        draft={draft}
                        editable={editable}
                        updateField={updateField}
                        renderPhoneAction={renderPhoneAction}
                    />

                    <ContactEmailFields
                        draft={draft}
                        editable={editable}
                        updateField={updateField}
                    />

                    {renderExtraFields?.({
                        contact: draft,
                        updateContact: updateField,
                        context,
                    })}
                </fieldset>

                {renderActions?.({
                    contact: draft,
                    onBack: back,
                    onSave: onSave != null ? handleSave : undefined,
                    onDelete: onDelete != null ? handleDelete : undefined,
                    context,
                }) ?? (
                    <ContactActions
                        editable={editable}
                        pending={pending}
                        conflict={conflict}
                        unavailable={unavailable}
                        onSave={onSave}
                        onDelete={onDelete}
                        handleSave={handleSave}
                        handleDelete={handleDelete}
                        back={back}
                    />
                )}
            </div>
        </SimulatorPage>
    );
}
