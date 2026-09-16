import { describe, expect, it } from "vitest";
import {
  patchContactInDevicePayload,
  removeContactFromDevicePayload,
} from "../src/contact/patchContactsInDevicePayload.js";
import { buildHomeDeviceJson } from "./support/deviceJsonFixtures.js";

describe("patchContactsInDevicePayload", () => {
  it("patches an existing contact immutably", () => {
    const value = buildHomeDeviceJson();
    const next = patchContactInDevicePayload(value, {
      id: "c1",
      displayName: "Updated Helpdesk",
      number: "+1999",
      email: "help@example.com",
    });

    expect(value.contacts?.[0]?.display_name).toBe("IT Helpdesk");
    expect(next.contacts?.[0]?.display_name).toBe("Updated Helpdesk");
    expect(next.contacts?.[0]?.number).toBe("+1999");
  });

  it("removes a contact immutably", () => {
    const value = buildHomeDeviceJson();
    const next = removeContactFromDevicePayload(value, "c1");

    expect(value.contacts).toHaveLength(2);
    expect(next.contacts).toHaveLength(1);
    expect(next.contacts?.[0]?.id).toBe("c2");
  });
});

it("preserves labeled values and clears a removed primary number", () => {
  const value = {
    ...buildHomeDeviceJson(),
    contacts: [{ id: "multi", display_name: "Multi", number: "+12025550123" }],
  };
  const updated = patchContactInDevicePayload(value, {
    id: "multi",
    displayName: "Multi",
    phoneNumbers: [],
  });
  expect(updated.contacts?.[0]?.phone_numbers).toEqual([]);
  expect(updated.contacts?.[0]?.number).toBeUndefined();
});


it("preserves omitted values and clears explicit scalar values", () => {
  const value = {
    ...buildHomeDeviceJson(),
    contacts: [{ id: "c1", display_name: "Before", number: "+12025550123", email: "a@example.test" }],
  };
  const unchanged = patchContactInDevicePayload(value, { id: "c1", displayName: "After" });
  expect(unchanged.contacts?.[0]?.number).toBe("+12025550123");
  expect(unchanged.contacts?.[0]?.email).toBe("a@example.test");
  const cleared = patchContactInDevicePayload(value, { id: "c1", displayName: "After", number: "", email: "" });
  expect(cleared.contacts?.[0]?.number).toBe("");
  expect(cleared.contacts?.[0]?.email).toBe("");
  expect(value.contacts[0]?.number).toBe("+12025550123");
});

it("replaces stale lists when moving to scalar values and restores list precedence", () => {
  const value = {
    ...buildHomeDeviceJson(),
    contacts: [{ id: "c1", display_name: "Before", number: "+12025550123", phone_numbers: [{ label: "Home", value: "+12025550123", number: "+12025550123" }], email: "a@example.test", email_addresses: [{ label: "Home", value: "a@example.test" }] }],
  };
  const scalar = patchContactInDevicePayload(value, { id: "c1", displayName: "After", number: "+12025550124", email: "b@example.test" });
  expect(scalar.contacts?.[0]?.phone_numbers).toBeUndefined();
  expect(scalar.contacts?.[0]?.email_addresses).toBeUndefined();
  expect(scalar.contacts?.[0]?.number).toBe("+12025550124");
  const lists = patchContactInDevicePayload(scalar, { id: "c1", displayName: "After", number: "+12025550124", email: "b@example.test", phoneNumbers: [], emailAddresses: [] });
  expect(lists.contacts?.[0]?.number).toBeUndefined();
  expect(lists.contacts?.[0]?.email).toBeUndefined();
});
