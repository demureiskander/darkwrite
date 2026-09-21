import en from "@darkwrite/i18n/locales/en/translation.json";
import ru from "@darkwrite/i18n/locales/ru/translation.json";
import { describe, expect, it } from "vitest";
import i18n from "./i18n";

function flattenStrings(value: object, prefix = ""): Record<string, string> {
  return Object.entries(value).reduce<Record<string, string>>(
    (result, [key, child]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (typeof child === "string") result[path] = child;
      else if (child && typeof child === "object") {
        Object.assign(result, flattenStrings(child, path));
      }
      return result;
    },
    {},
  );
}

describe("Russian translations", () => {
  it("can be selected as the active language", async () => {
    const previousLanguage = i18n.language;
    await i18n.changeLanguage("ru");
    expect(i18n.t("settings.workspace.languageText")).toBe("Язык");
    await i18n.changeLanguage(previousLanguage);
  });

  it("covers every English key without an empty value", () => {
    const english = flattenStrings(en);
    const russian = flattenStrings(ru);

    expect(Object.keys(russian).sort()).toEqual(Object.keys(english).sort());
    expect(Object.values(russian).every((value) => value.trim().length > 0))
      .toBe(true);
  });

  it("preserves variables and component placeholders", () => {
    const english = flattenStrings(en);
    const russian = flattenStrings(ru);
    const tokens = (value: string) =>
      [...value.matchAll(/\{\{[^}]+\}\}|<\/?\d+>/g)]
        .map(([token]) => token)
        .sort();

    for (const [key, value] of Object.entries(english)) {
      expect(tokens(russian[key]), key).toEqual(tokens(value));
    }
  });
});
