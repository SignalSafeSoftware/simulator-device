import { fireEvent, render } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import SimulatorAppearanceSettings, {
  appearanceTextColor,
} from "../src/appearance/SimulatorAppearanceSettings.js";

it("previews a preset without applying it until requested and can reset", () => {
  const onApply = vi.fn(),
    onReset = vi.fn();
  const presets = [
    { id: "light", label: "Light", background: "#ffffff", accent: "#005500" },
    { id: "dark", label: "Dark", background: "#111111", accent: "#aaffaa" },
  ];
  const { getByLabelText, getByRole } = render(
    <SimulatorAppearanceSettings
      value={presets[0]!}
      presets={presets}
      onApply={onApply}
      onReset={onReset}
    />,
  );
  fireEvent.change(getByLabelText("Theme"), { target: { value: "dark" } });
  expect(onApply).not.toHaveBeenCalled();
  expect(getByLabelText("Theme preview").style.backgroundColor).toBe("rgb(17, 17, 17)");
  fireEvent.click(getByRole("button", { name: "Apply appearance" }));
  expect(onApply).toHaveBeenCalledWith({ background: "#111111", accent: "#aaffaa" });
  fireEvent.click(getByRole("button", { name: "Reset appearance" }));
  expect(onReset).toHaveBeenCalledOnce();
  expect(getByLabelText("Background color")).toHaveProperty("value", "#ffffff");
});

it("chooses contrasting foregrounds for light and dark colors", () => {
  expect(appearanceTextColor("#ffffff")).not.toBe("#ffffff");
  expect(appearanceTextColor("#000000")).toBe("#ffffff");
});
