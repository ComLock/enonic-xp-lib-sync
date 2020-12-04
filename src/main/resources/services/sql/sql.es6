import { buildNode, buildQuery } from '/content-types/sync-config-oracle';
import Sync from '/lib/enonic/sync';
import { getAppConfig } from '/lib/enonic/sync/app/config';
import { sanitizeNodeName } from '/lib/enonic/sync/node'
import { evalInContext, toStr } from '/lib/enonic/sync/object';
import Sql from '/lib/enonic/sync/sql';

const NAME       = 'sql';
const TYPE       = 'service';
const LOG_PREFIX = `${NAME} ${TYPE}`;


export function get(request) {
    log.debug(`${LOG_PREFIX} request:${toStr(request)}`);

    const what = request.params.what ? request.params.what.replace(/ /g, '').split(','): [];
    log.debug(`${LOG_PREFIX} what:${toStr(what)}`);

    const appConfig = getAppConfig();
    log.debug(`${LOG_PREFIX} appConfig:${toStr(appConfig)}`);

    what.forEach(w => {
        let config = appConfig.service.sql[w];
        const obj = JSON.parse(config.json);
        Object.keys(obj).forEach(k => {
            config[k] = obj[k];
        });
        log.debug(`${LOG_PREFIX} config:${toStr(config)}`);

        const queryString = buildQuery({ query: config.source.query });
        log.debug(`${LOG_PREFIX} queryString:${queryString}`);

        const sync = new Sync({ repoId: config.target.repoId });

        const sql = new Sql(config.source.connection)
            .connect()
            .paginate({ queryString, cbRow: row => {
                const node = buildNode({
                    properties: config.target.properties,
                    row
                });
                sync.modifyOrCreate(node);
            }})
            .disconnect();
    }); // forEach what

    return {
        body: {
            what//,
            //appConfig // NOTE: This is a security risk that could expose credentials...
        },
        contentType: 'application/json; charset=utf-8'
    }
}
