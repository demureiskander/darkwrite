import { CatppuccinMocha, CatppuccinLatte, CatppuccinMacchiato, CatppuccinFrappe, } from "./catppuccin";
import { DarkwriteDim } from "./darkwrite-black";
import { DarkwriteDefault } from "./darkwrite-default";
export const DEFAULT_THEME_LIST = [
    DarkwriteDim,
    DarkwriteDefault,
    CatppuccinFrappe,
    CatppuccinMacchiato,
    CatppuccinLatte,
    CatppuccinMocha,
];
export const DEFAULT_THEMES = DEFAULT_THEME_LIST.reduce((acc, value) => {
    acc[value.id] = value;
    return acc;
}, {});
