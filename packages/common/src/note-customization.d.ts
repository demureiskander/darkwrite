export declare enum FontStyle {
    SANS = "sans",
    SERIF = "serif",
    MONO = "mono",
    CUSTOM = "custom"
}
export declare const FONT_VARS: Record<FontStyle, string>;
export interface NoteCustomization {
    font?: FontStyle;
    customFont?: string;
    largeText?: boolean;
    backgroundColor?: string | null;
    textColor?: string | null;
    /** This can be an embed ID (format //TODO),
     * a base64 encoded image (discouraged) or any image that is accessible via a URL.
     * Replaces the `coverEmbedId` field from the previous iteration.
     * */
    coverImageSource?: string | null;
    widePage?: boolean;
}
export declare function getDefaultNoteCustomization(): NoteCustomization;
