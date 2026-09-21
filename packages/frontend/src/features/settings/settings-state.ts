import { create } from "zustand";

interface SettingsDialogState {
  open: boolean;
}

export const useSettingsDialogState = create<SettingsDialogState>()(() => ({
  open: false,
}));

export function showSettings() {
  useSettingsDialogState.setState({ open: true });
}

export function setSettingsOpen(open: boolean) {
  useSettingsDialogState.setState({ open });
}
