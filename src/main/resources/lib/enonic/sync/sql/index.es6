import { toStr } from '/lib/enonic/sync/object';
import {
    connect as libSqlConnect,
    dispose as libSqlDispose
} from '/lib/sql';


const NAME       = 'sql';
const TYPE       = 'lib'
const LOG_PREFIX = `${NAME} ${TYPE}`;


export default class Sql {


    constructor({
        driver,
        serverType = '', // oracle:thin, sqlite
        host       = '', // @localhost
        port       = '',
        user       = '',
        password   = '',
        database   = '', // TODO: support short name "server"?
        properties = `${user ? ';user=' + user : ''}${password ? ';password=' + password : ''}`,
        url        = `jdbc:${serverType}:@${host}${port ? ':' + port : ''}${database ? ':' + database : ''}`,
        //url        = `jdbc:${serverType}://${host}${port ? ':' + port : ''}${database ? ':' + database : ''}`,
    }) {
        if(!driver) throw new Error(`${LOG_PREFIX} Sql.constructor(): Required parameter driver missing!`);
        if(!url   ) throw new Error(`${LOG_PREFIX} Sql.constructor(): Required parameter url missing!`   );
        this.connectionParams = {
            driver,
            url,//: `${url}${properties}`
            user,
            password
        }
    } // constructor


    connect() {
        log.debug(`${LOG_PREFIX} Sql.connect(${toStr(this.connectionParams)})`);
        this.handle = libSqlConnect(this.connectionParams);
        return this; // Chainable
    }


    query({
        string,
        limit = null
    }) {
        //this
        return this.handle.query(string, limit);
    } // query


    getCount({
        table,
        expression = '*'
    }) {
        const selectList = `count(${expression})`;
        return this.query({ string: `SELECT ${selectList} FROM ${table};` }).result[0][selectList];
    } // getCount


    paginate({
        queryString,
        cbRow
    }) {
        const queryResult = this.query({ string: queryString });
        queryResult.result.forEach(row => cbRow(row));
        return this; // Chainable
    } // paginate


    disconnect() {
        libSqlDispose();
        //this.handle.dispose();
        return this; // Chainable
    }


} // default class Sql
