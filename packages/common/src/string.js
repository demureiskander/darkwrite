const newlineMatcher = /(\r\n|\n|\r)/gm;
export const removeLinebreaks = (str, sub = " ") => str.replace(newlineMatcher, sub);
