import Sync                            from '/lib/enonic/sync';
import { getAppConfig                } from '/lib/enonic/sync/app/config';
import { evalInContext, isSet, toStr } from '/lib/enonic/sync/object';
import Sql                             from '/lib/enonic/sync/sql';
import { capitalize, replace         } from '/lib/enonic/sync/string';


const NAME       = 'exampleService';
const TYPE       = 'service';
const LOG_PREFIX = `${NAME} ${TYPE}`;


function doWithRow({
    row,
    config,
    sync
}) {
        log.debug(`${LOG_PREFIX} row:${toStr(row)}`);
        let node = {
            id: row[config.id],
            data: {}
        };
        Object.keys(config.mapping).forEach(k => {
            const field = config.mapping[k];
            const column = field.column;
            let value = row[column];
            if(isSet(value)) { // Columns may be nullable
                if(field.mapping && field.mapping.hasOwnProperty(value) ) {
                    value = field.mapping[value];
                } else {
                    if(field.transform === 'capitalize') {
                        const capitalized = capitalize(value);
                        log.debug(`${LOG_PREFIX} capitalize value:${value} capitalized:${capitalized}`);
                        value = capitalized;
                    }
                    if(field.replace) {
                        field.replace.forEach(rule => {
                            const replaced = replace({
                                string: value,
                                pattern: rule.pattern,
                                replacement: rule.replacement,
                                flags: rule.flags||''
                            });
                            log.debug(`${LOG_PREFIX} replace value:${value} replaced:${replaced}`);
                            value = replaced;
                        });
                    }
                }
            }
            node.data[k] = value;
        }); // each mapping
        log.debug(`${LOG_PREFIX} node:${toStr(node)}`);
        Object.keys(config.aggregate).forEach(k => {
            node.data[k] = evalInContext({ js: `'' + ${config.aggregate[k]}`, context: node.data });
        });
        log.debug(`${LOG_PREFIX} node with aggregates:${toStr(node)}`);
        sync.modifyOrCreate(node);
} // function doWithRow


export function get(request) {
    log.debug(`${LOG_PREFIX} request:${toStr(request)}`);

    const what = request.params.what ? request.params.what.replace(/ /g, '').split(','): [];
    log.debug(`${LOG_PREFIX} what:${toStr(what)}`);

    const appConfig = getAppConfig();
    log.debug(`${LOG_PREFIX} appConfig:${toStr(appConfig)}`);

    what.forEach(w => {
        const config = appConfig.service.exampleService[w];
        Object.keys(config.mapping).forEach(k => {
            config.mapping[k] = JSON.parse(config.mapping[k]);
        });
        log.debug(`${LOG_PREFIX} config:${toStr(config)}`);

        const repoId = config.repoId;
        const sync = new Sync({ repoId });

        const where = config.where ? ` WHERE ${config.where}` : '';
        const queryString = `SELECT * FROM ${config.from}${where}`;
        log.debug(`${LOG_PREFIX} queryString:${toStr(queryString)}`);

        const sql = new Sql({
            driver:   config.driver,
            url:      config.url,
            user:     config.username,
            password: config.password
        })
            .connect()
            .paginate({ queryString, cbRow: row => doWithRow({ row, config, sync }) })
            .disconnect();
        sync.deleteNodesThatNoLongerExistInSource();
    }); // forEach what

    return {
        body: {
            what//,
            //appConfig // NOTE: This is a security risk that could expose credentials...
        },
        contentType: 'application/json; charset=utf-8'
    }
} // function get
