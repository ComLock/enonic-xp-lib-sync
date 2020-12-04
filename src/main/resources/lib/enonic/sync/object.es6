export function asymmetricDiff(a, b) { // In a, but not in b.
    let diff = [];
    Object.keys(a).forEach(k => { if(!b.hasOwnProperty(k)) { diff.push(k); } });
    return diff;
}


//# Return the results of the in-line anonymous function we .call with the passed context
export function evalInContext({ js, context = this }) {
    //log.debug(`evalInContext({ js:${js}}, context:${toStr(context)} })`);
    return function () { return eval(js); }.call(context); // NOTE: This is the shortest syntax that I could get to work.
    //return function (str) { return eval(str); }.call(context, js); // closure
    //return (str => eval(str))(context, js); // Immediately Invoked Function Expression (JSON.stringify got a cyclic data structure)
    //return (str => { return eval(str); })(context, js); // Immediately Invoked Function Expression (JSON.stringify got a cyclic data structure)
} // function evalInContext


export function isNotSet(object) {
    return object === null || typeof object === 'undefined';
}


export function isSet(object) {
    return object !== null && typeof object !== 'undefined';
}


export function isObject(object) {
    return isSet(object) && !Array.isArray(object) && typeof object === 'object';
}


export function set({ object, path, value }) {
    const pList = path.split('.');
    const len = pList.length;
    for(var i = 0; i < len-1; i++) {
        const elem = pList[i];
        if( !object[elem] ) object[elem] = {}
        object = object[elem];
    }

    object[pList[len-1]] = value;
} // function set


export function toStr(object, replacer = null, space = 4) {
    return JSON.stringify(object, replacer, space);
}
