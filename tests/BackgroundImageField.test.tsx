import { fireEvent, render, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import BackgroundImageField from "../src/appearance/BackgroundImageField.js";

it("reads a selected image locally and allows removing it", async () => {
  const onChange = vi.fn();
  const { getByLabelText, rerender, getByRole } = render(
    <BackgroundImageField onChange={onChange} />,
  );
  fireEvent.change(getByLabelText("Background image"), {
    target: { files: [new File(["png fixture"], "wallpaper.png", { type: "image/png" })] },
  });
  await waitFor(() => expect(onChange).toHaveBeenCalledOnce());
  expect(onChange.mock.calls[0]?.[0]).toMatch(/^data:image\/png;base64,/);
  rerender(<BackgroundImageField onChange={onChange} value={onChange.mock.calls[0]?.[0]} />);
  fireEvent.click(getByRole("button", { name: "Remove background image" }));
  expect(onChange).toHaveBeenLastCalledWith(undefined);
});
it("rejects unsupported files and images above the size limit without changing the preview", () => {
  const onChange = vi.fn();
  const { getByLabelText, getByText } = render(<BackgroundImageField onChange={onChange} />);
  for (const file of [
    new File(["svg"], "image.svg", { type: "image/svg+xml" }),
    new File([new Uint8Array(2 * 1024 * 1024 + 1)], "large.png", { type: "image/png" }),
  ]) {
    fireEvent.change(getByLabelText("Background image"), { target: { files: [file] } });
    expect(getByText("Choose a PNG, JPEG, or WebP image up to 2 MiB.")).toBeTruthy();
  }
  expect(onChange).not.toHaveBeenCalled();
});
