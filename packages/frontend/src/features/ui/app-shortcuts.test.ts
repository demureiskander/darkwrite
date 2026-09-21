// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  formatShortcut,
  matchesShortcut,
  shortcutFromKeyboardEvent,
} from "./app-shortcuts";

const keyEvent = (overrides: Partial<KeyboardEvent> = {}) => ({
  altKey: false,
  code: "KeyK",
  ctrlKey: false,
  key: "k",
  metaKey: false,
  shiftKey: false,
  ...overrides,
});

describe("application shortcuts", () => {
  it("records physical command shortcuts independently of keyboard layout", () => {
    expect(
      shortcutFromKeyboardEvent(
        keyEvent({ code: "Digit1", key: "&", altKey: true }),
      ),
    ).toBe("Alt+1");
  });

  it("matches command on macOS and control on other platforms", () => {
    expect(matchesShortcut(keyEvent({ metaKey: true }), "CmdOrCtrl+K")).toBe(
      true,
    );
    expect(matchesShortcut(keyEvent({ ctrlKey: true }), "CmdOrCtrl+K")).toBe(
      true,
    );
  });

  it("keeps plain Backspace compatible with forward Delete", () => {
    expect(
      matchesShortcut(keyEvent({ code: "Delete", key: "Delete" }), "Backspace"),
    ).toBe(true);
  });

  it("formats macOS shortcuts compactly", () => {
    expect(formatShortcut("CmdOrCtrl+Shift+Z", true)).toBe("⌘⇧Z");
    expect(formatShortcut("CmdOrCtrl+Comma", true)).toBe("⌘,");
  });

  it("recognizes the settings shortcut by physical comma key", () => {
    expect(
      matchesShortcut(
        keyEvent({ code: "Comma", key: ",", metaKey: true }),
        "CmdOrCtrl+Comma",
      ),
    ).toBe(true);
  });
});
