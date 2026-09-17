import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ContactValuesEditor,
  PhoneContactEditor,
  SimulatorCapabilitiesContext,
  SimulatorListLoadingContext,
  MessageComposeContext,
  simulatorSessionReducer,
  type SimulatorDispatchAction,
  type EditableContactValue,
  type SimulatorScreenOverrideProps,
} from "@signalsafe/simulator-react";
import SimulatorPhoneDevice from "../src/SimulatorPhoneDevice.js";
import { fixture, type GalleryState } from "./fixtures.js";
import "@signalsafe/simulator-theme-bootstrap/styles.css";
import "./styles.css";

function EditContact({ onBack }: SimulatorScreenOverrideProps) {
  const [values, setValues] = useState<EditableContactValue[]>([
    { id: "one", label: "Mobile", value: "+12025550123" },
  ]);
  const [preferred, setPreferred] = useState<string | null>("one");
  return (
    <PhoneContactEditor
      defaultName="Synthetic person"
      valueFields={
        <ContactValuesEditor
          kind="phone"
          values={values}
          preferredId={preferred}
          createId={() => crypto.randomUUID()}
          onChange={(next, id) => {
            setValues(next);
            setPreferred(id);
          }}
        />
      }
      onCancel={onBack}
      onSubmit={(event) => {
        event.preventDefault();
        onBack();
      }}
    />
  );
}
function Gallery() {
  const [mode, setMode] = useState<GalleryState>("populated");
  const [state, setState] = useState(() => fixture("populated"));
  const [theme, setTheme] = useState("light");
  const [width, setWidth] = useState("375");
  const [scale, setScale] = useState("100");
  const [message, setMessage] = useState({ phoneNumber: "", messageBody: "" });
  const [status, setStatus] = useState("");
  const navigate = (
    action: Extract<SimulatorDispatchAction, { type: "NAV_LOCAL" }>,
  ) =>
    setState((current) =>
      simulatorSessionReducer(
        simulatorSessionReducer(current, {
          type: "SWITCH_APP",
          app: action.app,
        }),
        action,
      ),
    );
  const disabled = mode === "disabled" || mode === "loading";
  const capabilities = useMemo(() => {
    const capability = disabled
      ? {
          state: "unavailable" as const,
          reason:
            "Synthetic unavailable state. Change the gallery state to enable actions.",
        }
      : { state: "enabled" as const };
    return {
      call: capability,
      sendEmail: capability,
      sendMessage: capability,
      editContact: capability,
      changePhoto: capability,
    };
  }, [disabled]);
  const messageCompose = useMemo(
    () => ({
      draft: message,
      onChange: setMessage,
      onAccepted: () => setStatus("Accepted by this preview only."),
    }),
    [message],
  );
  return (
    <main data-theme={theme}>
      <style>{`:root { font-size: ${scale}%; }`}</style>
      <h1>Simulator UI gallery</h1>
      <p>
        Synthetic fixtures only. Actions stay in this page; no calls, messages,
        or API requests are made.
      </p>
      <div className="gallery-controls">
        <label>
          State{" "}
          <select
            value={mode}
            onChange={(event) => {
              const next = event.target.value as GalleryState;
              setMode(next);
              setState(fixture(next));
              setStatus("");
            }}
          >
            {["populated", "empty", "loading", "disabled", "error"].map(
              (value) => (
                <option key={value}>{value}</option>
              ),
            )}
          </select>
        </label>
        <label>
          Theme{" "}
          <select
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
          >
            <option>light</option>
            <option>dark</option>
            <option>high contrast</option>
          </select>
        </label>
        <label>
          Width{" "}
          <select
            value={width}
            onChange={(event) => setWidth(event.target.value)}
          >
            {["320", "375", "430", "520"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Text size{" "}
          <select
            value={scale}
            onChange={(event) => setScale(event.target.value)}
          >
            {["100", "150", "200"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="gallery-controls" aria-label="Preview screens">
        {(["dial", "contacts", "history", "add_contact"] as const).map(
          (screen) => (
            <button
              key={screen}
              onClick={() =>
                navigate({ type: "NAV_LOCAL", app: "phone", screen })
              }
            >
              {screen.replace("_", " ")}
            </button>
          ),
        )}
        <button
          onClick={() =>
            navigate({
              type: "NAV_LOCAL",
              app: "messages",
              screen: "thread_detail",
            })
          }
        >
          messages
        </button>
        <button
          onClick={() =>
            navigate({ type: "NAV_LOCAL", app: "email", screen: "compose" })
          }
        >
          email compose
        </button>
      </div>
      <output>{status}</output>
      {mode === "error" && (
        <p role="alert">
          Synthetic refresh failed. Existing preview data remains visible.
        </p>
      )}
      <div
        className="simulator-root simulator-host-device"
        style={{ width: `${width}px`, maxWidth: "100%" }}
      >
        <SimulatorCapabilitiesContext.Provider value={capabilities}>
          <SimulatorListLoadingContext.Provider value={mode === "loading"}>
            <MessageComposeContext.Provider value={messageCompose}>
              <SimulatorPhoneDevice
                state={state}
                dispatch={(action) => {
                  setState((current) =>
                    simulatorSessionReducer(current, action),
                  );
                  if (action.type === "SIMULATOR_ACTION") {
                    setStatus(`Preview action: ${action.action.type}`);
                  }
                }}
                contactDetail={{
                  mode: "editable",
                  onSave: () => setStatus("Contact accepted in preview only."),
                }}
                screenOverrides={{ phone: { add_contact: EditContact } }}
                emailCompose={{
                  onSend: async () => {
                    if (mode === "error") {
                      throw new Error(
                        "Synthetic send failure. Your draft is preserved.",
                      );
                    }
                    setStatus("Email accepted in preview only.");
                  },
                }}
              />
            </MessageComposeContext.Provider>
          </SimulatorListLoadingContext.Provider>
        </SimulatorCapabilitiesContext.Provider>
      </div>
    </main>
  );
}
const root = document.getElementById("root");
if (!root) {
  throw new Error("Gallery root missing");
}
createRoot(root).render(<Gallery />);
