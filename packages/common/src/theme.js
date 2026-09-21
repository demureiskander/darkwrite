import colorString from "color-string";
const allowedKeys = [
    "--background",
    "--foreground",
    "--view-1",
    "--view-2",
    "--card",
    "--card-foreground",
    "--popover",
    "--popover-foreground",
    "--primary",
    "--primary-foreground",
    "--primary-text",
    "--secondary",
    "--secondary-foreground",
    "--muted",
    "--muted-foreground",
    "--accent",
    "--accent-foreground",
    "--destructive",
    "--destructive-foreground",
    "--disabled",
    "--border",
    "--input",
    "--radius",
    "--star",
    "--ring",
    "--editor-text-red",
    "--editor-text-orange",
    "--editor-text-yellow",
    "--editor-text-green",
    "--editor-text-cyan",
    "--editor-text-blue",
    "--editor-text-indigo",
    "--editor-text-purple",
    "--editor-text-pink",
    "--editor-highlight-red",
    "--editor-highlight-orange",
    "--editor-highlight-yellow",
    "--editor-highlight-green",
    "--editor-highlight-cyan",
    "--editor-highlight-blue",
    "--editor-highlight-indigo",
    "--editor-highlight-purple",
    "--editor-highlight-pink",
];
export function isValidCssColor(color) {
    return colorString.get(color) != null;
}
export function isTheme(maybeTheme) {
    if (typeof maybeTheme !== "object" || maybeTheme == null)
        return false;
    if (!("id" in maybeTheme && "name" in maybeTheme))
        return false;
    if (typeof maybeTheme.id !== "string" || typeof maybeTheme.name !== "string")
        return false;
    if (!("colors" in maybeTheme))
        return false;
    if (maybeTheme.colors == null || typeof maybeTheme.colors !== "object")
        return false;
    const colors = maybeTheme.colors;
    // check invalid key definitions
    for (const key in colors) {
        if (!allowedKeys.includes(key))
            return false;
        const value = colors[key];
        if (!isValidCssColor(value))
            return false;
    }
    return true;
}
export const cssTextColorVariables = allowedKeys.filter((key) => key.startsWith("--editor-text-"));
export const csshighlightColorVariables = allowedKeys.filter((key) => key.startsWith("--editor-highlight-"));
export function stripAlpha(rgbaHexColor) {
    return rgbaHexColor.substring(0, 6);
}
