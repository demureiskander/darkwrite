import { describe, expect, it } from "vitest";
import { initI18n, setLanguage, t } from "./i18n";

describe("desktop Russian translations", () => {
  it("localizes menu and backup dialogs after a language change", () => {
    initI18n("en");
    expect(setLanguage("ru")).toBe(true);
    expect(t("menu.newNote")).toBe("Новая заметка");
    expect(t("backup.chooseArchive")).toBe("Выберите резервную копию");
  });
});
