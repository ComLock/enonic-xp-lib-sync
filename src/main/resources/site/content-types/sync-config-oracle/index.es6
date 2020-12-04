import { evalInContext, set, toStr } from '/lib/enonic/sync/object';
import { capitalize, replace } from '/lib/enonic/sync/string';
import { forceArray } from '/lib/enonic/util/data';


const NAME       = 'sync-oracle-config';
const TYPE       = 'content';
const LOG_PREFIX = `${NAME} ${TYPE}`;


export function buildQuery({
    config = {},
    source = config.source,
    query  = source.query
}) { log.debug(`${LOG_PREFIX} buildQuery({ query: ${toStr(query)})`);
    let queryString = `SELECT ${forceArray(query.columns).join(', ')}
FROM ${query.from}${query.where ? "\nWHERE " + query.where : ''}${query.groupBy ? "\nGROUP BY " + query.groupBy : ''}${query.orderBy ? "\nORDER BY " + query.orderBy : ''}`;
    log.debug(`${LOG_PREFIX} queryString:\n${queryString}`);
    return queryString;
} // function buildQuery


function applyFilters({ filters, value }) {
    if(!filters) { return value; }
    filters = forceArray(filters);
    log.debug(`${LOG_PREFIX} applyFilters({ filters: ${toStr(filters)} value: ${toStr(value)})`);
    filters.forEach(filter => {
        switch (filter._selected) {
            case 'capitalize': value = capitalize(value); break;
            case 'mapping':
                forceArray(filter.mapping.rules).forEach(rule => {
                    const flags = rule.flags ? (Object.keys(rule.flags).map(f => rule.flags[f] === true ? f : '').join('')) : '';
                    const re = RegExp(rule.match, flags);
                    //const result = re.exec(value);
                    var myArray;
                    while ((myArray = re.exec(value)) !== null) {
                        const newValue = evalInContext({ js: rule.result, context: { result: myArray }});
                        log.debug(`${LOG_PREFIX} applyFilters({ value: ${toStr(value)} newValue: ${toStr(newValue)})`);
                        value = newValue;
                    }
                })
                break; // mapping
            default:
                log.warning(`${LOG_PREFIX} applyFilters: unhandeled filter: ${filter._selected}`);
        } // switch
    }); // filters
    return value;
} // function applyFilters


export function buildNode({
    config = {},
    target = config.target,
    properties = target.properties,
    row,
    context = {
        source: row,
        target: {}
    }
}) {
    properties = forceArray(properties);
    log.debug(`${LOG_PREFIX} buildNode({ properties: ${toStr(properties)}, row: ${toStr(row)})`);
    properties.forEach(property => {
        const path = evalInContext({ js: property.path, context});
        log.debug(`${LOG_PREFIX} buildNode() path: ${toStr(path)}`);

        let value = applyFilters({
            filters: property.filter ? property.filter : null,
            value: evalInContext({ js: property.value, context })
        });
        log.debug(`${LOG_PREFIX} buildNode() value: ${toStr(value)}`);

        set({ object: context.target, path, value });
    }); // properties.forEach
    log.debug(`${LOG_PREFIX} buildNode() --> node: ${toStr(context.target)}`);
    return context.target;
} // function buildNode
