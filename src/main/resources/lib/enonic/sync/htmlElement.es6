import { isObject, isSet, toStr } from '/lib/enonic/sync/object';
import { isArray } from '/lib/enonic/sync/array';


const NAME       = 'htmlElement';
const TYPE       = 'lib';
const LOG_PREFIX = `${NAME} ${TYPE}`;


export class TextNode {

    constructor(text) {
        this.text = text;
    }

    render() {
        return this.text;
    }

} // export class TextNode


export default class HtmlElement {

    static renderAttributes(attributes = {}) {
        //log.debug(`${LOG_PREFIX} renderAttributes({ attributes:${toStr(attributes)}})`);
        const attributeKeys = Object.keys(attributes);
        //log.debug(`${LOG_PREFIX} renderAttributes() attributeKeys:${toStr(attributeKeys)}`);
        if(!attributeKeys.length) { return ''; }
        const keysWithValue = attributeKeys.filter(k => isSet(attributes[k]));
        if(!keysWithValue.length) { return ''; }
        return ' ' + keysWithValue.map(k => `${k}="${attributes[k]}"`).join(' ');
    } // static renderAttributes


    static render(
        tagName,
        {
            attributes  = {},
            content     = null
        } = {}
    ) {
        return `<${tagName}${HtmlElement.renderAttributes(attributes)}`
            + (isSet(content) ? `>${content}</${tagName}` : '/') + '>';
    } // static renderElement


    constructor(
        tagName,
        p1 = null,
        p2 = null
    ) {
        //log.debug(`${LOG_PREFIX} constructor( tagName: ${tagName}, p1: ${toStr(p1)}, p2: ${toStr(p2)} )`);
        this.tagName = tagName;
        // Function overloading
        this.elements = isArray(p1) ? p1 : (isArray(p2) ? p2 : []);
        this.attributes = isObject(p1) ? p1 : (isObject(p2) ? p2 : {});
        //log.debug(`${LOG_PREFIX} this: ${toStr(this)}`);
    } // constructor


    add(
        tagName,
        p1 = null,
        p2 = null
    ) {
        this.elements.push(new HtmlElement(tagName, p1, p2));
        return this; // chainable
    } // add


    addText(text) {
        this.elements.push(new TextNode(text));
        return this; // chainable
    } // addText


    render() {
        return HtmlElement.render(
            this.tagName,
            {
                attributes: this.attributes,
                content:    this.elements.map(e => e.render()).join('') // Render all children
            }
        );
    } // render

} // class HtmlElement


export class Html extends HtmlElement {
    constructor(
        elements   = [],
        attributes = {}
    ) {
        return super('html', elements, attributes);
    }
} // class Html


export class Head extends HtmlElement {
    constructor(
        elements   = [],
        attributes = {}
    ) {
        return super('head', elements, attributes);
    }
} // class Head


export class Title extends HtmlElement {
    constructor(
        elements   = [],
        attributes = {}
    ) {
        return super('title', elements, attributes);
    }
} // class Title


export class Body extends HtmlElement {
    constructor(
        elements   = [],
        attributes = {}
    ) {
        return super('body', elements, attributes);
    }
} // class Body


export class H1 extends HtmlElement {
    constructor(
        elements   = [],
        attributes = {}
    ) {
        return super('h1', elements, attributes);
    }
} // class H1


export class Form extends HtmlElement {
    constructor(
        elements   = [],
        attributes = {}
    ) {
        return super('form', elements, attributes);
    }
} // class Form


export class Label extends HtmlElement {
    constructor(
        elements   = [],
        attributes = {}
    ) {
        return super('label', elements, attributes);
    }
} // class Label


export class Option extends HtmlElement {
    constructor(
        elements   = [],
        attributes = {}
    ) {
        return super('option', elements, attributes);
    }
} // class Option


export class Button extends HtmlElement {
    constructor(
        elements   = [],
        attributes = {}
    ) {
        return super('button', elements, attributes);
    }
} // class Button
