import showdown from "showdown";
import { stringify } from "yaml";
import { deserializeRange, PropertyType, } from "./note";
const convertMarkdownToHTML = (markdown) => {
    const converter = new showdown.Converter({}), html = converter.makeHtml(markdown);
    return html;
};
const stringifyRange = (range) => {
    if (!range.from)
        return "";
    if (!range.to || range.from.valueOf() === range.to?.valueOf())
        return range.from.toISOString();
    return `${range.from.toISOString()} / ${range.to.toISOString()}`;
};
const getYamlExportValue = (prop) => {
    switch (prop.type) {
        case PropertyType.Text:
            return prop.value;
        case PropertyType.Date:
            return deserializeRange(prop.value).match((range) => stringifyRange(range), () => prop.value);
        case PropertyType.Checkbox:
            return prop.value;
    }
};
/**
 * Convert a note's properties into Markdown frontmatter, preserving order.
 * @param properties
 * @param order
 * @returns complete frontmatter wrapped in `---` delimiters, with all strings wrapped in double quotes.
 */
const propertiesToFrontmatter = (properties, order) => {
    const map = new Map();
    for (const name of order) {
        // order list has deleted entries
        if (!Object.hasOwn(properties, name))
            continue;
        map.set(name, getYamlExportValue(properties[name]));
    }
    return `---\n${stringify(map, { defaultStringType: "QUOTE_DOUBLE" })}---\n`;
};
export const MarkdownConverter = {
    convertMarkdownToHTML,
    propertiesToFrontmatter,
};
