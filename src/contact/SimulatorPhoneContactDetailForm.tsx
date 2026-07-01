import { useCallback, useState } from 'react';
import type { SimulatorPhoneContactDetailFormProps, SimulatorPhoneContactDetailValues } from './contactDetailTypes.js';

function fieldId(suffix: string, contactId: string): string {
    return `simulator-phone-contact-detail-${suffix}-${contactId}`;
}

export default function SimulatorPhoneContactDetailForm({
    contact: initialContact,
    mode,
    onBack,
    onSave,
    onDelete,
    renderExtraFields,
    renderActions,
    context,
}: Readonly<SimulatorPhoneContactDetailFormProps>) {
    const [draft, setDraft] = useState<SimulatorPhoneContactDetailValues>(initialContact);
    const editable = mode === 'editable';

    const updateField = useCallback(
        (patch: Partial<SimulatorPhoneContactDetailValues>) => {
            setDraft((prev) => ({ ...prev, ...patch }));
        },
        [],
    );

    const handleSave = useCallback(() => {
        onSave?.(draft);
    }, [draft, onSave]);

    const handleDelete = useCallback(() => {
        onDelete?.(draft);
    }, [draft, onDelete]);

    const defaultActions = (
        <div className="simulator-phone-contact-detail__actions">
            <button
                type="button"
                className="simulator-phone-contact-detail__button simulator-phone-contact-detail__button--back"
                aria-label="Back to contacts list"
                onClick={onBack}
            >
                Back
            </button>
            {editable && onSave != null && (
                <button
                    type="button"
                    className="simulator-phone-contact-detail__button simulator-phone-contact-detail__button--save"
                    onClick={handleSave}
                >
                    Save
                </button>
            )}
            {onDelete != null && (
                <button
                    type="button"
                    className="simulator-phone-contact-detail__button simulator-phone-contact-detail__button--delete"
                    onClick={handleDelete}
                    disabled={!editable}
                    aria-disabled={!editable}
                >
                    Delete
                </button>
            )}
        </div>
    );

    return (
        <div className="simulator-phone-contact-detail" data-testid="simulator-phone-contact-detail">
            <div className="simulator-phone-contact-detail__header">
                <span className="simulator-phone-contact-detail__title">
                    {editable ? 'Edit Contact' : 'Contact'}
                </span>
            </div>

            <div className="simulator-phone-contact-detail__form">
                <div className="simulator-phone-contact-detail__field">
                    <label
                        className="simulator-phone-contact-detail__label"
                        htmlFor={fieldId('display-name', draft.id)}
                    >
                        Display name
                    </label>
                    {editable ? (
                        <input
                            id={fieldId('display-name', draft.id)}
                            className="simulator-phone-contact-detail__input"
                            type="text"
                            value={draft.displayName}
                            onChange={(event) => updateField({ displayName: event.target.value })}
                        />
                    ) : (
                        <span className="simulator-phone-contact-detail__value">{draft.displayName}</span>
                    )}
                </div>

                <div className="simulator-phone-contact-detail__field">
                    <label
                        className="simulator-phone-contact-detail__label"
                        htmlFor={fieldId('number', draft.id)}
                    >
                        Phone number
                    </label>
                    {editable ? (
                        <input
                            id={fieldId('number', draft.id)}
                            className="simulator-phone-contact-detail__input"
                            type="tel"
                            value={draft.number ?? ''}
                            onChange={(event) => updateField({ number: event.target.value })}
                        />
                    ) : (
                        <span className="simulator-phone-contact-detail__value">{draft.number ?? ''}</span>
                    )}
                </div>

                <div className="simulator-phone-contact-detail__field">
                    <label
                        className="simulator-phone-contact-detail__label"
                        htmlFor={fieldId('email', draft.id)}
                    >
                        Email
                    </label>
                    {editable ? (
                        <input
                            id={fieldId('email', draft.id)}
                            className="simulator-phone-contact-detail__input"
                            type="email"
                            value={draft.email ?? ''}
                            onChange={(event) => updateField({ email: event.target.value })}
                        />
                    ) : (
                        <span className="simulator-phone-contact-detail__value">{draft.email ?? ''}</span>
                    )}
                </div>

                {renderExtraFields?.({
                    contact: draft,
                    updateContact: updateField,
                    context,
                })}
            </div>

            {renderActions?.({
                contact: draft,
                onBack,
                onSave: onSave != null ? handleSave : undefined,
                onDelete: onDelete != null ? handleDelete : undefined,
                context,
            }) ?? defaultActions}
        </div>
    );
}
