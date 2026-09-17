import { useSimulatorLocale } from "@signalsafe/simulator-react";
import BackgroundImageField from "./BackgroundImageField.js";
import { useState, type CSSProperties } from "react";

export interface SimulatorAppearance {
  background: string;
  accent: string;
  backgroundImage?: string;
}
export interface SimulatorAppearancePreset extends SimulatorAppearance {
  id: string;
  label: string;
}

/** Controlled host persistence; preview changes never modify the device until Apply. */
export default function SimulatorAppearanceSettings({
  value,
  presets,
  onApply,
  onReset,
}: {
  value: SimulatorAppearance;
  presets: readonly SimulatorAppearancePreset[];
  onApply: (value: SimulatorAppearance) => void;
  onReset: () => void;
}) {
  const screenLocale = useSimulatorLocale();

  const [draft, setDraft] = useState<SimulatorAppearance>(() => ({
    background: value.background,
    accent: value.accent,
    ...(value.backgroundImage ? { backgroundImage: value.backgroundImage } : {}),
  }));
  const [imageReset, setImageReset] = useState(0);
  const [message, setMessage] = useState("");
  const selected =
    presets.find((item) => item.background === draft.background && item.accent === draft.accent)
      ?.id ?? "";
  const preview: CSSProperties = {
    backgroundColor: draft.background,
    backgroundImage: draft.backgroundImage ? `url("${draft.backgroundImage}")` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: appearanceTextColor(draft.background),
    border: `2px solid ${draft.accent}`,
    padding: "1rem",
    borderRadius: "0.75rem",
  };
  return (
    <section
      className="simulator-appearance"
      aria-label={screenLocale.t("screen.simulatorAppearanceSettings.appearance")}
    >
      <h3>{screenLocale.t("screen.simulatorAppearanceSettings.appearance")}</h3>
      <p>
        {screenLocale.t(
          "screen.simulatorAppearanceSettings.preview.the.phone.background.and.colors.then.apply",
        )}
      </p>
      <label>
        {screenLocale.t("screen.simulatorAppearanceSettings.theme")}
        <select
          value={selected}
          onChange={(event) => {
            const preset = presets.find((item) => item.id === event.target.value);
            if (preset) {
              setDraft((current) => ({
                ...current,
                background: preset.background,
                accent: preset.accent,
              }));
              setMessage("");
            }
          }}
        >
          <option value="" disabled>
            {screenLocale.t("screen.simulatorAppearanceSettings.custom")}
          </option>
          {presets.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        {screenLocale.t("screen.simulatorAppearanceSettings.background.color")}
        <input
          type="color"
          aria-label={screenLocale.t("screen.simulatorAppearanceSettings.background.color")}
          value={draft.background}
          onChange={(event) => {
            setDraft({ ...draft, background: event.target.value });
            setMessage("");
          }}
        />
        <span>{draft.background}</span>
      </label>
      <label>
        {screenLocale.t("screen.simulatorAppearanceSettings.accent.color")}
        <input
          type="color"
          aria-label={screenLocale.t("screen.simulatorAppearanceSettings.accent.color")}
          value={draft.accent}
          onChange={(event) => {
            setDraft({ ...draft, accent: event.target.value });
            setMessage("");
          }}
        />
        <span>{draft.accent}</span>
      </label>
      <BackgroundImageField
        key={imageReset}
        value={draft.backgroundImage}
        onChange={(backgroundImage) => setDraft((current) => ({ ...current, backgroundImage }))}
      />
      <div
        aria-label={screenLocale.t("screen.simulatorAppearanceSettings.theme.preview")}
        style={preview}
      >
        <strong>{screenLocale.t("screen.simulatorAppearanceSettings.phone.preview")}</strong>
        <p>
          {screenLocale.t("screen.simulatorAppearanceSettings.your.contacts.messages.and.calls")}
        </p>
        <span
          style={{
            display: "inline-block",
            background: draft.accent,
            color: appearanceTextColor(draft.accent),
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
          }}
        >
          {screenLocale.t("screen.simulatorAppearanceSettings.selected.item")}
        </span>
      </div>
      <div className="simulator-appearance__actions">
        <button
          type="button"
          onClick={() => {
            onApply(draft);
            setMessage(screenLocale.t("screen.simulatorAppearanceSettings.appearance.applied"));
          }}
        >
          {screenLocale.t("screen.simulatorAppearanceSettings.apply.appearance")}
        </button>
        <button
          type="button"
          onClick={() => {
            setImageReset((current) => current + 1);
            onReset();
            const preset = presets[0];
            if (preset) setDraft({ background: preset.background, accent: preset.accent });
            setMessage(
              screenLocale.t("screen.simulatorAppearanceSettings.default.appearance.restored"),
            );
          }}
        >
          {screenLocale.t("screen.simulatorAppearanceSettings.reset.appearance")}
        </button>
      </div>
      <output>{message}</output>
    </section>
  );
}

/** Choose the higher-contrast black/white foreground for an opaque sRGB color. */
export function appearanceTextColor(hex: string): string {
  const linear = [1, 3, 5].map((start) => {
    const value = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance =
    linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  return luminance > 0.179 ? "#17211c" : "#ffffff";
}
