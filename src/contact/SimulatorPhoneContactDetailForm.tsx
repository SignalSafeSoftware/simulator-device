import {
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
import {} from '@signalsafe/simulator-react/contract/capabilities';
import {} from '@signalsafe/simulator-react/contract/phonePresentation';
import {} from '@signalsafe/simulator-react/ui/contacts/ContactValuesEditor';
import { SIMULATOR_DEVICE_CLASS_NAMES } from '../simulatorDeviceClasses.js';
import { useId } from 'react';
import { type SimulatorPhoneContactDetailFormProps } from './contactDetailTypes.js';
import {
    fieldId,
    ContactActions,
    ContactPhoneFields,
    ContactEmailFields,
} from './contactFormFields.js';
import { useContactFormState } from './useContactFormState.js';

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
