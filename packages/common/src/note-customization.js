// We are using string enums here to maintain compatibility with the previous iteration.
export var FontStyle;
(function (FontStyle) {
    FontStyle["SANS"] = "sans";
    FontStyle["SERIF"] = "serif";
    FontStyle["MONO"] = "mono";
    FontStyle["CUSTOM"] = "custom";
})(FontStyle || (FontStyle = {}));
export const FONT_VARS = {
    sans: "--darkwrite-sans",
    serif: "--darkwrite-serif",
    mono: "--darkwrite-mono",
    custom: "--darkwrite-sans",
};
export function getDefaultNoteCustomization() {
    return {
        font: FontStyle.SANS,
        largeText: false,
    };
}
