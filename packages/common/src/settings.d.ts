import type { PageSize } from "./pdf";
export type ThemeMode = "light" | "dark" | "system";
export declare const APP_SHORTCUT_IDS: readonly ["newNote", "quickSwitch", "openSettings", "duplicate", "toggleFavorite", "moveToTrash", "quickPreview", "gridView", "listView", "parentFolder", "historyBack", "historyForward", "undo", "redo", "toggleSidebar", "zoomIn", "zoomOut", "zoomReset"];
export type AppShortcutId = (typeof APP_SHORTCUT_IDS)[number];
export type AppShortcutSettings = Record<AppShortcutId, string>;
export declare const DEFAULT_APP_SHORTCUTS: AppShortcutSettings;
export declare const DEFAULT_THEME_SETTINGS: {
    themeMode: ThemeMode;
    lightColorScheme: string;
    darkColorScheme: string;
    accentColor: string;
    useSystemWindowFrame: boolean;
    useSystemAccentColor: boolean;
    fonts: {
        sans: string;
        serif: string;
        code: string;
        ui: string;
    };
    experimental: {
        /** @deprecated no longer used */
        darwinCustomTitlebarEnabled: boolean;
    };
    customCSS: string;
};
export declare const DEFAULT_EDITOR_SETTINGS: {
    spellcheckerEnabled: boolean;
    codeIndentSize: number;
    wordCountHudEnabled: boolean;
    disabledCommandItems: string[];
    preferredPageSize: PageSize;
    showTextDirectionControls: boolean;
    openFilesOnDoubleClick: boolean;
};
export declare const DEFAULT_CLIENT_SETTINGS: {
    autoUpdateCheck: boolean;
    canvasWidthPx: number;
    openItemsOnDoubleClick: boolean;
    language: string;
    zoomFactor: number;
    shortcuts: AppShortcutSettings;
};
export type ThemeSettings = typeof DEFAULT_THEME_SETTINGS;
export type EditorSettings = typeof DEFAULT_EDITOR_SETTINGS;
export type ClientSettings = typeof DEFAULT_CLIENT_SETTINGS;
export type DarkwriteUserSettings = {
    appearance: ThemeSettings;
    editor: EditorSettings;
    client: ClientSettings;
    version: 3;
};
export declare const getDefaultUserSettings: () => {
    appearance: {
        themeMode: ThemeMode;
        lightColorScheme: string;
        darkColorScheme: string;
        accentColor: string;
        useSystemWindowFrame: boolean;
        useSystemAccentColor: boolean;
        fonts: {
            sans: string;
            serif: string;
            code: string;
            ui: string;
        };
        experimental: {
            /** @deprecated no longer used */
            darwinCustomTitlebarEnabled: boolean;
        };
        customCSS: string;
    };
    client: {
        autoUpdateCheck: boolean;
        language: string;
        zoomFactor: number;
        shortcuts: AppShortcutSettings;
    };
    editor: {
        spellcheckerEnabled: boolean;
        codeIndentSize: number;
        wordCountHudEnabled: boolean;
        disabledCommandItems: string[];
        preferredPageSize: PageSize;
        showTextDirectionControls: boolean;
        openFilesOnDoubleClick: boolean;
    };
    version: 3;
};
export declare const mergeUserSettings: (settings: Partial<DarkwriteUserSettings>) => DarkwriteUserSettings;
