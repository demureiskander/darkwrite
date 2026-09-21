import { describe, expect, it } from "vitest";
import { hexToRgb, normalizeFolderColor, rgbToHex } from "./folder-color";

describe("folder colors", () => {
  it("normalizes valid six-digit hex colors", () => {
    expect(normalizeFolderColor("AABBCC")).toBe("#aabbcc");
    expect(normalizeFolderColor("#12ef90")).toBe("#12ef90");
  });

  it("rejects values that are not complete hex colors", () => {
    expect(normalizeFolderColor("#abc")).toBeNull();
    expect(normalizeFolderColor("blue")).toBeNull();
  });

  it("converts between hex and RGB while clamping channels", () => {
    expect(hexToRgb("#0a84ff")).toEqual({
      red: 10,
      green: 132,
      blue: 255,
    });
    expect(rgbToHex(-4, 128, 999)).toBe("#0080ff");
  });
});
