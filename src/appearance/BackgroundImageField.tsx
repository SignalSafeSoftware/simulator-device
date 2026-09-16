import { useSimulatorLocale } from "@signalsafe/simulator-react";
import { useEffect, useRef, useState } from "react";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export default function BackgroundImageField({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string | undefined) => void;
}) {
  const screenLocale = useSimulatorLocale();

  const [message, setMessage] = useState("");
  const reader = useRef<FileReader | null>(null);
  useEffect(() => () => reader.current?.abort(), []);
  return (
    <div className="simulator-background-image">
      <label>
        {screenLocale.t("screen.backgroundImageField.background.image")}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => {
            reader.current?.abort();
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            if (!IMAGE_TYPES.has(file.type) || file.size > MAX_IMAGE_BYTES) {
              setMessage(
                screenLocale.t(
                  "screen.backgroundImageField.choose.a.png.jpeg.or.webp.image.up.to.2.mib",
                ),
              );
              return;
            }
            const next = new FileReader();
            reader.current = next;
            setMessage(screenLocale.t("screen.backgroundImageField.loading.image"));
            next.onload = () => {
              if (reader.current !== next) return;
              if (typeof next.result === "string") {
                onChange(next.result);
                setMessage(
                  screenLocale.t(
                    "screen.backgroundImageField.image.ready.to.preview.apply.appearance.to.save.it",
                  ),
                );
              }
            };
            next.onerror = () =>
              setMessage(
                screenLocale.t(
                  "screen.backgroundImageField.the.image.could.not.be.read.choose.another.file",
                ),
              );
            next.readAsDataURL(file);
          }}
        />
      </label>
      <p>
        {screenLocale.t(
          "screen.backgroundImageField.png.jpeg.or.webp.up.to.2.mib.the.image.stays.in.th",
        )}
      </p>
      {value && (
        <button
          type="button"
          onClick={() => {
            reader.current?.abort();
            reader.current = null;
            onChange(undefined);
            setMessage(
              screenLocale.t(
                "screen.backgroundImageField.image.removed.from.preview.apply.appearance.to.sav",
              ),
            );
          }}
        >
          {screenLocale.t("screen.backgroundImageField.remove.background.image")}
        </button>
      )}
      <output>{message}</output>
    </div>
  );
}
