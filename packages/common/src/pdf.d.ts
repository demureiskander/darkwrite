/** All in inches, unfortunately */
export interface Margins {
    top: number;
    left: number;
    right: number;
    bottom: number;
}
export declare const PageMargins: {
    A4: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    Letter: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    A3: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    A5: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    Legal: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    Tabloid: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
};
export type PageSize = keyof typeof PageMargins;
