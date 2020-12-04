export default class AppConfig {


    // https://stackoverflow.com/questions/7793811/convert-javascript-dot-notation-object-to-nested-object
    // NOTE: This is risky if you have a same-name top level property. Wrap from t=oo; to t[key] = o[k] in if (k.indexOf('.') !== -1) ... – brandonscript Apr 14 '14 at 19:14
    // NOTE: It also doesn't work if you have more than one top-level key. – brandonscript Apr 14 '14 at 19:15
    static deepen(o) {
        var oo = {}, t, parts, part;
        for (var k in o) {
            t = oo;
            parts = k.split('.');
            var key = parts.pop();
            while (parts.length) {
                part = parts.shift();
                t = t[part] = t[part] || {};
            }
            t[key] = o[k]
        }
        return oo;
    } // static deepen


    static get() {
        return AppConfig.deepen(app.config);
    }


} // default class AppConfig


export const getAppConfig = AppConfig.get;
