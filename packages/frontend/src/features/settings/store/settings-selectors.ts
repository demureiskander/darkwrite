import type { RootState } from "@/features/store/types";

export const selectSettings = (state: RootState) => state.settings;

export const selectAppearanceSettings = (state: RootState) =>
  state.settings.appearance;

export const selectFontSettings = (state: RootState) =>
  state.settings.appearance.fonts;

export const selectEditorSettings = (state: RootState) =>
  state.settings.editor;
