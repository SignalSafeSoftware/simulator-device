import {
  useSimulatorLocale,
  usePhoneNumberFormatter,
  type SimulatorSessionContact,
} from "@signalsafe/simulator-react";
import { useRef, type ReactNode } from "react";

type Value = NonNullable<SimulatorSessionContact["phoneNumbers"]>[number];

export default function ContactValueList({
  title,
  kind,
  values,
  editable,
  onChange,
  renderAction,
}: Readonly<{
  title: string;
  kind: "phone" | "email";
  values: Value[];
  editable: boolean;
  onChange: (values: Value[]) => void;
  renderAction?: (value: Value) => ReactNode;
}>) {
  const screenLocale = useSimulatorLocale();

  const formatNumber = usePhoneNumberFormatter();
  const rowKeys = useRef(new WeakMap<Value, string>());
  const nextKey = useRef(0);
  const rowKey = (value: Value): string => {
    const existing = rowKeys.current.get(value);
    if (existing !== undefined) return existing;
    const key = `contact-value-${nextKey.current++}`;
    rowKeys.current.set(value, key);
    return key;
  };
  const replaceValue = (original: Value, replacement: Value): Value => {
    rowKeys.current.set(replacement, rowKey(original));
    return replacement;
  };
  if (!editable && !values.some((item) => item.value.trim())) return null;
  return (
    <fieldset className="simulator-phone-contact-detail__values">
      <legend>
        {kind === "email"
          ? screenLocale.t("screen.contactValueList.email.addresses")
          : screenLocale.t("screen.contactValueList.phone.numbers")}
      </legend>
      {values.map((item, index) => (
        <div
          className="simulator-phone-contact-detail__field"
          key={rowKey(item)}
        >
          {editable ? (
            <>
              <label>
                {title}
                {screenLocale.t("screen.contactValueList.label")}
                {index + 1}
                <input
                  value={item.label}
                  onChange={(event) =>
                    onChange(
                      values.map((entry, position) =>
                        position === index
                          ? replaceValue(entry, {
                              ...entry,
                              label: event.target.value,
                            })
                          : entry,
                      ),
                    )
                  }
                />
              </label>
              <label>
                {title} {index + 1}
                <input
                  type={kind === "email" ? "email" : "tel"}
                  value={item.value}
                  onChange={(event) =>
                    onChange(
                      values.map((entry, position) =>
                        position === index
                          ? replaceValue(entry, {
                              label: entry.label,
                              value: event.target.value,
                            })
                          : entry,
                      ),
                    )
                  }
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  onChange(values.filter((_, position) => position !== index))
                }
              >
                {screenLocale.t("screen.contactValueList.remove")}
                {title.toLowerCase()} {index + 1}
              </button>
            </>
          ) : (
            <>
              <span className="simulator-phone-contact-detail__label">
                {item.label.trim() ||
                  screenLocale.t("screen.contactValueList.unlabeled")}
              </span>
              <span className="simulator-phone-contact-detail__value">
                {kind === "phone" ? formatNumber(item.value) : item.value}
              </span>
              {renderAction?.(item)}
            </>
          )}
        </div>
      ))}
      {editable && (
        <button
          type="button"
          onClick={() => onChange([...values, { label: "", value: "" }])}
        >
          {screenLocale.t("screen.contactValueList.add")}
          {title.toLowerCase()}
        </button>
      )}
    </fieldset>
  );
}
