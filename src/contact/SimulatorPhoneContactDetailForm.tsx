import { useSimulatorLocale } from "@signalsafe/simulator-react";
import {
  SimulatorPage,
  useSimulatorCapabilities,
  usePhoneNumberFormatter,
} from "@signalsafe/simulator-react";
import ContactValueList from "./ContactValueList.js";
import { useCallback, useRef, useState } from "react";
import type {
  SimulatorPhoneContactDetailFormProps,
  SimulatorPhoneContactDetailValues,
} from "./contactDetailTypes.js";

function fieldId(suffix: string, contactId: string): string {
  return `simulator-phone-contact-detail-${suffix}-${contactId}`;
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

  const capability = useSimulatorCapabilities().editContact;
  const unavailable = capability && capability.state !== "enabled" ? capability.reason : "";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const formatNumber = usePhoneNumberFormatter();
  const [state, setState] = useState({ source: initialContact, draft: initialContact });
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
  const draft = mode === "read-only" ? initialContact : state.draft;
  const conflict =
    mode === "editable" && !sameSource && !pristine && state.source.id === initialContact.id;
  const editable = mode === "editable";
  const scalarNumber = draft.number ?? "";
  const scalarEmail = draft.email ?? "";

  const updateField = useCallback((patch: Partial<SimulatorPhoneContactDetailValues>) => {
    setState((prev) => ({ ...prev, draft: { ...prev.draft, ...patch } }));
  }, []);

  const run = async (callback: typeof onSave) => {
    if (!callback || inFlight.current || conflict || unavailable || !editable) return;
    inFlight.current = true;
    setPending(true);
    setError("");
    try {
      await callback(draft);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Contact could not be saved. Your draft is preserved.",
      );
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

  const defaultActions = (
    <div className="simulator-phone-contact-detail__actions">
      <button
        type="button"
        className="simulator-phone-contact-detail__button simulator-phone-contact-detail__button--back"
        aria-label={screenLocale.t("screen.simulatorPhoneContactDetailForm.back.to.contacts.list")}
        onClick={back}
        disabled={pending}
      >
        {screenLocale.t("screen.simulatorPhoneContactDetailForm.back")}
      </button>
      {editable && onSave != null && (
        <button
          type="button"
          className="simulator-phone-contact-detail__button simulator-phone-contact-detail__button--save"
          onClick={handleSave}
          disabled={conflict || pending || Boolean(unavailable)}
        >
          {screenLocale.t("screen.simulatorPhoneContactDetailForm.save")}
        </button>
      )}
      {onDelete != null && (
        <button
          type="button"
          className="simulator-phone-contact-detail__button simulator-phone-contact-detail__button--delete"
          onClick={handleDelete}
          disabled={!editable || conflict || pending || Boolean(unavailable)}
          aria-disabled={!editable || conflict || pending || Boolean(unavailable)}
        >
          {screenLocale.t("screen.simulatorPhoneContactDetailForm.delete")}
        </button>
      )}
    </div>
  );

  return (
    <SimulatorPage
      className="simulator-phone-contact-detail"
      data-testid="simulator-phone-contact-detail"
      header={
        <div className="simulator-phone-contact-detail__header">
          <span tabIndex={-1} className="simulator-phone-contact-detail__title">
            {editable
              ? screenLocale.t("screen.simulatorPhoneContactDetailForm.edit.contact")
              : screenLocale.t("screen.simulatorPhoneContactDetailForm.contact")}
          </span>
        </div>
      }
    >
      {pending && (
        <p role="status">
          {screenLocale.t("screen.simulatorPhoneContactDetailForm.saving.contact")}
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      {unavailable && <p role="status">{unavailable}</p>}
      {onDelete && !editable && (
        <p>
          {screenLocale.t(
            "screen.simulatorPhoneContactDetailForm.open.editing.mode.to.delete.this.contact",
          )}
        </p>
      )}
      {conflict && (
        <div role="status">
          {screenLocale.t(
            "screen.simulatorPhoneContactDetailForm.this.contact.changed.while.you.were.editing.your.d",
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => setState({ source: initialContact, draft: initialContact })}
          >
            {screenLocale.t(
              "screen.simulatorPhoneContactDetailForm.discard.draft.and.reload.contact",
            )}
          </button>
        </div>
      )}
      <div className="simulator-phone-contact-detail__panel">
        <fieldset
          className="simulator-phone-contact-detail__form"
          disabled={editable && (pending || Boolean(unavailable))}
        >
          <div className="simulator-phone-contact-detail__identity">
            {renderIdentityImage?.(draft)}
            <div className="simulator-phone-contact-detail__field">
              <label
                className="simulator-phone-contact-detail__label"
                htmlFor={fieldId("display-name", draft.id)}
              >
                {screenLocale.t("screen.simulatorPhoneContactDetailForm.display.name")}
              </label>
              {editable ? (
                <input
                  id={fieldId("display-name", draft.id)}
                  className="simulator-phone-contact-detail__input"
                  type="text"
                  value={draft.displayName}
                  onChange={(event) => updateField({ displayName: event.target.value })}
                />
              ) : (
                <span className="simulator-phone-contact-detail__value">{draft.displayName}</span>
              )}
            </div>
          </div>
          {draft.phoneNumbers ? (
            <ContactValueList
              kind="phone"
              title={screenLocale.t("screen.simulatorPhoneContactDetailForm.phone.number")}
              values={draft.phoneNumbers}
              editable={editable}
              onChange={(phoneNumbers) =>
                updateField({ phoneNumbers, number: phoneNumbers[0]?.number })
              }
              renderAction={
                renderPhoneAction ? (phone) => renderPhoneAction(phone, draft) : undefined
              }
            />
          ) : editable || scalarNumber.trim() ? (
            <>
              <div className="simulator-phone-contact-detail__field">
                <label
                  className="simulator-phone-contact-detail__label"
                  htmlFor={fieldId("number", draft.id)}
                >
                  {screenLocale.t("screen.simulatorPhoneContactDetailForm.phone.number")}
                </label>
                {editable ? (
                  <input
                    id={fieldId("number", draft.id)}
                    className="simulator-phone-contact-detail__input"
                    type="tel"
                    value={scalarNumber}
                    onChange={(event) => updateField({ number: event.target.value })}
                  />
                ) : (
                  <span className="simulator-phone-contact-detail__value">
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
                          ? [{ label: "", value: draft.number, number: draft.number }]
                          : []),
                        { label: "", value: "" },
                      ],
                    })
                  }
                >
                  {screenLocale.t("screen.simulatorPhoneContactDetailForm.add.phone.number")}
                </button>
              )}
            </>
          ) : null}

          {draft.emailAddresses ? (
            <ContactValueList
              kind="email"
              title={screenLocale.t("screen.simulatorPhoneContactDetailForm.email")}
              values={draft.emailAddresses}
              editable={editable}
              onChange={(emailAddresses) =>
                updateField({ emailAddresses, email: emailAddresses[0]?.value })
              }
            />
          ) : editable || scalarEmail.trim() ? (
            <>
              <div className="simulator-phone-contact-detail__field">
                <label
                  className="simulator-phone-contact-detail__label"
                  htmlFor={fieldId("email", draft.id)}
                >
                  {screenLocale.t("screen.simulatorPhoneContactDetailForm.email")}
                </label>
                {editable ? (
                  <input
                    id={fieldId("email", draft.id)}
                    className="simulator-phone-contact-detail__input"
                    type="email"
                    value={scalarEmail}
                    onChange={(event) => updateField({ email: event.target.value })}
                  />
                ) : (
                  <span className="simulator-phone-contact-detail__value">{scalarEmail}</span>
                )}
              </div>
              {editable && (
                <button
                  type="button"
                  onClick={() =>
                    updateField({
                      emailAddresses: [
                        ...(draft.email ? [{ label: "", value: draft.email }] : []),
                        { label: "", value: "" },
                      ],
                    })
                  }
                >
                  {screenLocale.t("screen.simulatorPhoneContactDetailForm.add.email")}
                </button>
              )}
            </>
          ) : null}

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
        }) ?? defaultActions}
      </div>
    </SimulatorPage>
  );
}
