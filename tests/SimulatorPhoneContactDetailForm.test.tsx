import { SimulatorLocaleProvider } from "@signalsafe/simulator-react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import SimulatorPhoneContactDetailForm from "../src/contact/SimulatorPhoneContactDetailForm.js";
import type { SimulatorPhoneContactDetailContext } from "../src/contact/contactDetailTypes.js";
import { buildState } from "./support/sessionFixtures.js";

const context: SimulatorPhoneContactDetailContext = {
  state: buildState(),
  dispatch: vi.fn(),
  originalContact: {
    id: "c1",
    displayName: "Alice Chen",
    number: "+1-555-100-2000",
    email: "alice@example.com",
  },
};

describe("SimulatorPhoneContactDetailForm", () => {
  it("renders displayName, number, and email", () => {
    const { getByText } = render(
      <SimulatorPhoneContactDetailForm
        contact={{
          id: "c1",
          displayName: "Alice Chen",
          number: "+1-555-100-2000",
          email: "alice@example.com",
        }}
        mode="read-only"
        onBack={vi.fn()}
        context={context}
      />,
    );

    expect(getByText("Alice Chen")).toBeTruthy();
    expect(getByText("+1-555-100-2000")).toBeTruthy();
    expect(getByText("alice@example.com")).toBeTruthy();
  });

  it("read-only mode renders non-editable values", () => {
    const { queryByRole } = render(
      <SimulatorPhoneContactDetailForm
        contact={{ id: "c1", displayName: "Bob", number: "555", email: "bob@example.com" }}
        mode="read-only"
        onBack={vi.fn()}
        context={context}
      />,
    );

    expect(queryByRole("textbox")).toBeNull();
  });

  it("editable mode updates form state", () => {
    const { getByLabelText } = render(
      <SimulatorPhoneContactDetailForm
        contact={{ id: "c1", displayName: "Alice", number: "111", email: "a@example.com" }}
        mode="editable"
        onBack={vi.fn()}
        onSave={vi.fn()}
        context={context}
      />,
    );

    fireEvent.change(getByLabelText("Display name"), { target: { value: "Alice Updated" } });
    expect(getByLabelText("Display name")).toHaveProperty("value", "Alice Updated");
  });

  it("Save calls onSave with updated values", () => {
    const onSave = vi.fn();
    const { getByLabelText, getByRole } = render(
      <SimulatorPhoneContactDetailForm
        contact={{ id: "c1", displayName: "Alice", number: "111", email: "a@example.com" }}
        mode="editable"
        onBack={vi.fn()}
        onSave={onSave}
        context={context}
      />,
    );

    fireEvent.change(getByLabelText("Email"), { target: { value: "new@example.com" } });
    fireEvent.click(getByRole("button", { name: "Save" }));

    expect(onSave).toHaveBeenCalledWith({
      id: "c1",
      displayName: "Alice",
      number: "111",
      email: "new@example.com",
    });
  });

  it("Delete calls onDelete with current values", () => {
    const onDelete = vi.fn();
    const { getByRole } = render(
      <SimulatorPhoneContactDetailForm
        contact={{ id: "c1", displayName: "Alice", number: "111", email: "a@example.com" }}
        mode="editable"
        onBack={vi.fn()}
        onSave={vi.fn()}
        onDelete={onDelete}
        context={context}
      />,
    );

    fireEvent.click(getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith({
      id: "c1",
      displayName: "Alice",
      number: "111",
      email: "a@example.com",
    });
  });

  it("Back calls onBack", () => {
    const onBack = vi.fn();
    const { getByRole } = render(
      <SimulatorPhoneContactDetailForm
        contact={{ id: "c1", displayName: "Alice", number: "111", email: "a@example.com" }}
        mode="read-only"
        onBack={onBack}
        context={context}
      />,
    );

    fireEvent.click(getByRole("button", { name: "Back to contacts list" }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renderExtraFields renders and can update contact state", () => {
    const { getByTestId, getByLabelText, getByRole } = render(
      <SimulatorPhoneContactDetailForm
        contact={{ id: "c1", displayName: "Alice", number: "111", email: "a@example.com" }}
        mode="editable"
        onBack={vi.fn()}
        onSave={vi.fn()}
        context={context}
        renderExtraFields={({ contact, updateContact }) => (
          <div data-testid="extra-fields">
            <span>{contact.displayName}</span>
            <button type="button" onClick={() => updateContact({ displayName: "Extra Updated" })}>
              Patch name
            </button>
          </div>
        )}
      />,
    );

    expect(getByTestId("extra-fields")).toBeTruthy();
    fireEvent.click(getByRole("button", { name: "Patch name" }));
    expect(getByLabelText("Display name")).toHaveProperty("value", "Extra Updated");
  });

  it("renderActions overrides default actions", () => {
    const { getByTestId, queryByRole } = render(
      <SimulatorPhoneContactDetailForm
        contact={{ id: "c1", displayName: "Alice", number: "111", email: "a@example.com" }}
        mode="editable"
        onBack={vi.fn()}
        onSave={vi.fn()}
        context={context}
        renderActions={() => <div data-testid="custom-actions">Custom</div>}
      />,
    );

    expect(getByTestId("custom-actions")).toBeTruthy();
    expect(queryByRole("button", { name: "Save" })).toBeNull();
  });
});

it("renders each labeled number and its own host action", () => {
  const { getByText, getAllByRole } = render(
    <SimulatorPhoneContactDetailForm
      contact={{
        id: "multi",
        displayName: "Multi",
        phoneNumbers: [
          { label: "Mobile", value: "+12025550123" },
          { label: "CAR", value: "2025550124" },
          { label: "", value: "2025550125" },
        ],
      }}
      mode="read-only"
      onBack={vi.fn()}
      context={context}
      renderPhoneAction={(phone) => <button>Call {phone.value}</button>}
    />,
  );
  expect(getByText("Mobile")).toBeTruthy();
  expect(getByText("CAR")).toBeTruthy();
  expect(getByText("Unlabeled")).toBeTruthy();
  expect(getAllByRole("button", { name: /^Call/ })).toHaveLength(3);
});

it("adds, edits and removes labeled numbers without retaining a stale dialable number", () => {
  const onSave = vi.fn();
  const { getByRole, getByLabelText } = render(
    <SimulatorPhoneContactDetailForm
      contact={{
        id: "edit-multi",
        displayName: "Multi",
        phoneNumbers: [{ label: "Mobile", value: "+12025550123", number: "+12025550123" }],
      }}
      mode="editable"
      onBack={vi.fn()}
      context={context}
      onSave={onSave}
    />,
  );
  fireEvent.change(getByLabelText("Phone number 1"), { target: { value: "2025550124" } });
  fireEvent.click(getByRole("button", { name: "Add phone number" }));
  fireEvent.change(getByLabelText("Phone number label 2"), { target: { value: "CAR" } });
  fireEvent.change(getByLabelText("Phone number 2"), { target: { value: "2025550125" } });
  fireEvent.click(getByRole("button", { name: "Remove phone number 1" }));
  fireEvent.click(getByRole("button", { name: "Save" }));
  expect(onSave.mock.calls[0]?.[0].phoneNumbers).toEqual([{ label: "CAR", value: "2025550125" }]);
});


it("refreshes read-only values for the same contact", () => {
  const contact = { id: "c1", displayName: "Before", number: "111" };
  const { rerender, getByText, queryByText } = render(<SimulatorPhoneContactDetailForm contact={contact} mode="read-only" onBack={vi.fn()} context={context} />);
  rerender(<SimulatorPhoneContactDetailForm contact={{ ...contact, displayName: "After", number: "222" }} mode="read-only" onBack={vi.fn()} context={context} />);
  expect(getByText("After")).toBeTruthy();
  expect(getByText("222")).toBeTruthy();
  expect(queryByText("Before")).toBeNull();
});

it("preserves a dirty draft and requires explicit reload after an external update", () => {
  const onSave = vi.fn();
  const contact = { id: "c1", displayName: "Before", number: "111" };
  const { rerender, getByLabelText, getByRole } = render(<SimulatorPhoneContactDetailForm contact={contact} mode="editable" onBack={vi.fn()} onSave={onSave} context={context} />);
  fireEvent.change(getByLabelText("Display name"), { target: { value: "My draft" } });
  rerender(<SimulatorPhoneContactDetailForm contact={{ ...contact, displayName: "External" }} mode="editable" onBack={vi.fn()} onSave={onSave} context={context} />);
  expect(getByLabelText("Display name")).toHaveProperty("value", "My draft");
  fireEvent.click(getByRole("button", { name: "Save" }));
  expect(onSave).not.toHaveBeenCalled();
  fireEvent.click(getByRole("button", { name: "Discard draft and reload contact" }));
  expect(getByLabelText("Display name")).toHaveProperty("value", "External");
  fireEvent.click(getByRole("button", { name: "Save" }));
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ displayName: "External" }));
});


it("omits empty read-only contact sections and keeps editing controls", () => {
  const contact = { id: "c1", displayName: "No values", phoneNumbers: [], emailAddresses: [] };
  const { rerender, queryByText, getByRole } = render(<SimulatorPhoneContactDetailForm contact={contact} mode="read-only" onBack={vi.fn()} context={context} />);
  expect(queryByText("Phone numbers")).toBeNull();
  expect(queryByText("Email addresses")).toBeNull();
  rerender(<SimulatorPhoneContactDetailForm contact={contact} mode="editable" onBack={vi.fn()} context={context} />);
  expect(getByRole("button", { name: "Add phone number" })).toBeTruthy();
  expect(getByRole("button", { name: "Add email" })).toBeTruthy();
});

it("keeps phone and email input kinds when visible labels are overridden", () => {
  const { getByLabelText } = render(
    <SimulatorLocaleProvider messages={{
      "screen.simulatorPhoneContactDetailForm.phone.number": "Telephone",
      "screen.simulatorPhoneContactDetailForm.email": "Mail address",
    }}>
      <SimulatorPhoneContactDetailForm
        contact={{ id: "localized", displayName: "Synthetic", phoneNumbers: [{ label: "Home", value: "+12025550123", number: "+12025550123" }], emailAddresses: [{ label: "Work", value: "synthetic@example.test" }] }}
        mode="editable" onBack={vi.fn()} onSave={vi.fn()} context={context}
      />
    </SimulatorLocaleProvider>,
  );
  expect(getByLabelText("Telephone 1")).toHaveProperty("type", "tel");
  expect(getByLabelText("Mail address 1")).toHaveProperty("type", "email");
});
