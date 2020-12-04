import { buildNode, buildQuery } from '/content-types/sync-config-oracle';
import Sync from '/lib/enonic/sync';
import { toStr } from '/lib/enonic/sync/object';
import Repo from '/lib/enonic/sync/repo';
import Sql from '/lib/enonic/sync/sql';
import { get as contentGet } from '/lib/xp/content';

const NAME       = 'oracle';
const TYPE       = 'service';
const LOG_PREFIX = `${NAME} ${TYPE}`;


export function get(request) {
    log.debug(`${LOG_PREFIX} request:${toStr(request)}`);

    const repo = new Repo({ id: 'cms-repo' });
    const result = repo.query({
        count: 1,
        explain: true,
        query: `_nodeType = 'content' AND type = '${app.name}:sync-config-oracle'`
        //query: `type = '${app.name}:sync-config-oracle'`
        //query: `_nodeType = 'content'`
    });
    log.debug(`${LOG_PREFIX} result:${toStr(result)}`);

    let configs = [];
    result.hits.forEach(hit => {
        log.debug(`${LOG_PREFIX} hit:${toStr(hit)}`);
        const node = repo.getNode({ key: hit.id });
        log.debug(`${LOG_PREFIX} node:${toStr(node)}`);
        configs.push(node.data);
    }); // hits.forEach


    const reports = configs.map(config => {
        log.debug(`${LOG_PREFIX} config:${toStr(config)}`);
        let report = { count: 0 };
        const queryString = buildQuery({ query: config.source.query });
        const sync = new Sync({ repoId: config.target.repoId });

        let connection = config.source.connection;
        connection.driver = 'oracle.jdbc.OracleDriver';
        connection.serverType = 'oracle:thin';
        const sql = new Sql(connection)
            .connect()
            .paginate({ queryString, cbRow: row => {
                const node = buildNode({ properties: config.target.properties, row });
                sync.modifyOrCreate(node);
                report.count += 1;
            }})
            .disconnect();
        return report;
    }); // configs.map

    return {
        body: {
            //configs
            reports
        },
        contentType: 'application/json; charset=utf-8'
    }
} // function get
