export function capitalize(string) {
    return string.toLowerCase().replace(/\b[æøåa-z]/g, l => l.toUpperCase());
}


export function replace({
    string,
    pattern,
    replacement,
    flags = ''
}) {
    return string.replace(RegExp(pattern, flags), replacement);
}
