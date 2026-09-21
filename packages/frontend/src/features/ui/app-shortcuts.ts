const MODIFIER_KEYS = new Set(["Alt", "Control", "Meta", "Shift"]);

const codeToKey = (event: Pick<KeyboardEvent, "code" | "key">) => {
  if (/^Key[A-Z]$/.test(event.code)) return event.code.slice(3);
  if (/^Digit[0-9]$/.test(event.code)) return event.code.slice(5);
  if (/^F(?:[1-9]|1[0-2])$/.test(event.code)) return event.code;

  const keys: Record<string, string> = {
    ArrowDown: "Down",
    ArrowLeft: "Left",
    ArrowRight: "Right",
    ArrowUp: "Up",
    Backspace: "Backspace",
    BracketLeft: "BracketLeft",
    BracketRight: "BracketRight",
    Comma: "Comma",
    Delete: "Delete",
    End: "End",
    Enter: "Return",
    Home: "Home",
    Minus: "Minus",
    PageDown: "PageDown",
    PageUp: "PageUp",
    Space: "Space",
    Tab: "Tab",
  };
  if (event.code === "Equal" && event.key === "+") return "Plus";
  return keys[event.code] ?? null;
};

/** Convert a physical keyboard event into a portable application shortcut. */
export const shortcutFromKeyboardEvent = (
  event: Pick<
    KeyboardEvent,
    "altKey" | "code" | "ctrlKey" | "key" | "metaKey" | "shiftKey"
  >,
) => {
  if (MODIFIER_KEYS.has(event.key)) return null;
  const key = codeToKey(event);
  if (!key) return null;

  const parts: string[] = [];
  if (event.metaKey || event.ctrlKey) parts.push("CmdOrCtrl");
  if (event.altKey) parts.push("Alt");
  if (event.shiftKey && key !== "Plus") parts.push("Shift");

  const canStandAlone =
    ["Backspace", "Delete", "Space"].includes(key) || key.startsWith("F");
  if (parts.length === 0 && !canStandAlone) return null;
  return [...parts, key].join("+");
};

const eventKey = (event: Pick<KeyboardEvent, "code" | "key">) =>
  codeToKey(event);

/** Match a keyboard event against a portable application shortcut. */
export const matchesShortcut = (
  event: Pick<
    KeyboardEvent,
    "altKey" | "code" | "ctrlKey" | "key" | "metaKey" | "shiftKey"
  >,
  shortcut: string,
) => {
  const parts = shortcut.split("+");
  const key = parts.at(-1);
  if (!key) return false;

  const wantsCommand = parts.includes("CmdOrCtrl");
  const wantsAlt = parts.includes("Alt");
  const wantsShift = parts.includes("Shift");
  const actualKey = eventKey(event);
  const matchesDeleteAlias = key === "Backspace" && actualKey === "Delete";
  const implicitPlusShift = key === "Plus" && event.shiftKey;

  return (
    (actualKey === key || matchesDeleteAlias) &&
    (event.metaKey || event.ctrlKey) === wantsCommand &&
    event.altKey === wantsAlt &&
    (implicitPlusShift || event.shiftKey === wantsShift)
  );
};

/** Render a portable shortcut with familiar macOS-style modifier glyphs. */
export const formatShortcut = (
  shortcut: string,
  isMac = navigator.platform.includes("Mac"),
) => {
  const labels: Record<string, string> = {
    Alt: "⌥",
    Backspace: "⌫",
    BracketLeft: "[",
    BracketRight: "]",
    CmdOrCtrl: isMac ? "⌘" : "Ctrl+",
    Comma: ",",
    Delete: "⌦",
    Down: "↓",
    Left: "←",
    Minus: "−",
    Plus: "+",
    Return: "↩",
    Shift: "⇧",
    Space: "Space",
    Up: "↑",
    Right: "→",
  };
  return shortcut
    .split("+")
    .map((part) => labels[part] ?? part)
    .join("");
};
