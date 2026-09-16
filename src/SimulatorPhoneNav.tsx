import { useId, useMemo, useRef } from "react";
import {
  useSimulatorCapabilities,
  useSimulatorLocale,
  useMessageComposeOptions,
  useEmailComposeOptions,
  createSimulatorNavigationDispatch,
  type SimulatorNavigationOptions,
  type SimulatorDispatchAction,
  type SimulatorSessionState,
} from "@signalsafe/simulator-react";
import SimulatorPhoneNavItem from "./SimulatorPhoneNavItem.js";
import { SIMULATOR_DEVICE_CLASS_NAMES as cls } from "./simulatorDeviceClasses.js";
import {
  dispatchSimulatorPhoneNavItem,
  resolveSimulatorPhoneNav,
  shouldHideHostPhoneNav,
  type SimulatorPhoneNavModel,
} from "./simulatorPhoneNavMapper.js";

export { shouldHideHostPhoneNav };

export interface SimulatorPhoneNavProps {
  state: SimulatorSessionState;
  onNavigation?: SimulatorNavigationOptions["onNavigation"];
  onNavigationEvent?: SimulatorNavigationOptions["onNavigationEvent"];
  dispatch: (action: SimulatorDispatchAction) => void;
}

function isActiveItem(model: SimulatorPhoneNavModel, itemId: string): boolean {
  if (model.mode === "primary") {
    return model.activeChannel === itemId;
  }
  if (model.mode === "secondary" || model.mode === "tertiary") {
    return model.activeId === itemId;
  }
  return false;
}

export default function SimulatorPhoneNav({
  state,
  dispatch: rawDispatch,
  onNavigation,
  onNavigationEvent,
}: Readonly<SimulatorPhoneNavProps>) {
  const locale = useSimulatorLocale();
  const { t } = locale;
  const capabilities = useSimulatorCapabilities();
  const messageCompose = useMessageComposeOptions();
  const reasonId = useId();
  const emailCompose = useEmailComposeOptions();
  const composingEmail = state.view.activeApp === "email" && state.view.email.screen === "compose";
  const newMessage =
    state.view.activeApp === "messages" && state.view.messages.screen === "new_thread";
  const sendCapability = composingEmail ? capabilities.sendEmail : capabilities.sendMessage;
  const sendReason =
    sendCapability && sendCapability.state !== "enabled"
      ? sendCapability.reason
      : composingEmail && !emailCompose?.onSend
        ? t("email.unconfigured")
        : newMessage && !messageCompose?.onSend
          ? t("messages.unconfigured")
          : "";
  const stateRef = useRef(state);
  stateRef.current = state;
  const dispatch = useMemo(
    () =>
      onNavigation === undefined && onNavigationEvent === undefined
        ? rawDispatch
        : createSimulatorNavigationDispatch({
            getState: () => stateRef.current,
            dispatch: rawDispatch,
            onNavigation,
            onNavigationEvent,
          }),
    [rawDispatch, onNavigation, onNavigationEvent],
  );
  const model = useMemo(() => resolveSimulatorPhoneNav(state, locale), [state, locale]);

  if (model.mode === "hidden") {
    return null;
  }

  const ariaLabel =
    model.mode === "primary"
      ? t("nav.simulatorChannels")
      : model.mode === "tertiary"
        ? t("nav.appTertiaryMenu")
        : t("nav.appSecondaryMenu");

  return (
    <nav
      className={cls.nav}
      aria-label={ariaLabel}
      data-testid="simulator-device-nav"
      data-nav-mode={model.mode}
    >
      <ul className={cls.navList}>
        {model.items.map((item) => (
          <li key={item.id} className={cls.navItem}>
            <SimulatorPhoneNavItem
              label={item.label}
              disabled={item.action === "submit" ? Boolean(sendReason) : item.disabled}
              describedBy={item.action === "submit" && sendReason ? reasonId : undefined}
              icon={item.icon}
              active={isActiveItem(model, item.id)}
              ariaLabel={item.label}
              onClick={(event) => {
                if (item.action === "submit") {
                  const form = event.currentTarget
                    .closest(".simulator-device-shell")
                    ?.querySelector<HTMLFormElement>(
                      composingEmail
                        ? "form.simulator-email__composer"
                        : "form.simulator-messages__composer",
                    );
                  form?.requestSubmit();
                } else dispatchSimulatorPhoneNavItem(dispatch, model, item, state);
              }}
            />
          </li>
        ))}
      </ul>
      {model.items.some((item) => item.action === "submit") && sendReason && (
        <small id={reasonId} className="simulator-action-reason">
          {sendReason}
        </small>
      )}
    </nav>
  );
}
