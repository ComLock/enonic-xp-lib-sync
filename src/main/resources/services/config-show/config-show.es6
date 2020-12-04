import { buildQuery } from '/content-types/sync-config-oracle';
import { getAppConfig } from '/lib/enonic/sync/app/config';
import { toStr } from '/lib/enonic/sync/object';


const NAME       = 'config-show';
const TYPE       = 'service';
const LOG_PREFIX = `${NAME} ${TYPE}`;


export function get(request) {
    log.debug(`${LOG_PREFIX} request:${toStr(request)}`);

    const appConfig = getAppConfig();
    log.debug(`${LOG_PREFIX} appConfig:${toStr(appConfig)}`);

    let model = {};
    Object.keys(appConfig.service.sql).forEach(w => {
        const config = appConfig.service.sql[w];

        const obj = JSON.parse(config.json);
        delete config.json;
        Object.keys(obj).forEach(k => {
            config[k] = obj[k];
        });

        const queryString = buildQuery({ query: config.source.query });
        log.debug(`${LOG_PREFIX} queryString:${queryString}`);
        config.source.queryString = queryString;
        //delete config.source.query;

        log.debug(`${LOG_PREFIX} config:${toStr(config)}`);
        model[w] = config;
    });

    return {
        body: model,
        contentType: 'application/json; charset=utf-8'
    };
} // function get
