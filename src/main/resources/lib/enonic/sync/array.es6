export function asymmetricDiff(a, b) {
    //[...a].filter(x => !b.has(x))); // Set
    //return [...a].filter(x => !b.includes(x))); // Ecmascript 2015
    return [...a].filter(x => b.indexOf(x) !== -1); // Ecmascript 5.1 (ECMA 262) JavaScript 1.6
}


export function inFirstButNotInSecond(a1, a2) {
    let a2obj = {};
    a2.forEach(v2 => {
        a2obj[v2] = true;
    });
    return a1.filter(v1 => {
        return !a2obj.hasOwnProperty(v1);
        //return (!(v in obj));
    });
} // inFirstButNotInSecond


export function isArray(object) {
    return Array.isArray(object);
}
