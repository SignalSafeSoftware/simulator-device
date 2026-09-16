import type { ReactNode } from "react";
import type {
  SimulatorDispatchAction,
  SimulatorSessionContact,
  SimulatorSessionState,
} from "@signalsafe/simulator-react";

export interface SimulatorPhoneContactDetailValues extends SimulatorSessionContact {}

export interface SimulatorPhoneContactDetailContext {
  state: SimulatorSessionState;
  dispatch: (action: SimulatorDispatchAction) => void;
  originalContact: SimulatorSessionContact;
}

export interface SimulatorPhoneDeviceContactDetailOptions {
  mode?: "read-only" | "editable";
  renderIdentityImage?: (contact: SimulatorPhoneContactDetailValues) => ReactNode;
  renderPhoneAction?: (
    phone: NonNullable<SimulatorSessionContact["phoneNumbers"]>[number],
    contact: SimulatorPhoneContactDetailValues,
  ) => ReactNode;
  onSave?: (
    contact: SimulatorPhoneContactDetailValues,
    context: SimulatorPhoneContactDetailContext,
  ) => void | Promise<void>;
  onDelete?: (
    contact: SimulatorPhoneContactDetailValues,
    context: SimulatorPhoneContactDetailContext,
  ) => void | Promise<void>;
  renderExtraFields?: (props: {
    contact: SimulatorPhoneContactDetailValues;
    updateContact: (patch: Partial<SimulatorPhoneContactDetailValues>) => void;
    context: SimulatorPhoneContactDetailContext;
  }) => ReactNode;
  renderActions?: (props: {
    contact: SimulatorPhoneContactDetailValues;
    onBack: () => void;
    onSave?: () => void;
    onDelete?: () => void;
    context: SimulatorPhoneContactDetailContext;
  }) => ReactNode;
}

export interface SimulatorPhoneContactDetailFormProps {
  contact: SimulatorPhoneContactDetailValues;
  mode: "read-only" | "editable";
  onBack: () => void;
  onSave?: (contact: SimulatorPhoneContactDetailValues) => void | Promise<void>;
  onDelete?: (contact: SimulatorPhoneContactDetailValues) => void | Promise<void>;
  renderIdentityImage?: SimulatorPhoneDeviceContactDetailOptions["renderIdentityImage"];
  renderPhoneAction?: SimulatorPhoneDeviceContactDetailOptions["renderPhoneAction"];
  renderExtraFields?: SimulatorPhoneDeviceContactDetailOptions["renderExtraFields"];
  renderActions?: SimulatorPhoneDeviceContactDetailOptions["renderActions"];
  context: SimulatorPhoneContactDetailContext;
}
