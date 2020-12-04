import { isNotSet, toStr } from '/lib/enonic/sync/object';
import { forceArray } from '/lib/enonic/util/data';
import { connect as libXpNodeConnect } from '/lib/xp/node';
import {
    create       as libXpRepoCreate,
    createBranch as libXpRepoCreateBranch,
    deleteBranch as libXpRepoDeleteBranch,
    get          as libXpRepoGet
} from '/lib/xp/repo';


const NAME       = 'repo';
const TYPE       = 'class';
const LOG_PREFIX = `${NAME} ${TYPE}`;


export default class Repo {

    //──────────────────────────────────────────────────────────────────────────
    // Class/Static methods
    //──────────────────────────────────────────────────────────────────────────

    static connect({ branch, id }) {
        if(!branch) throw new Error(`${LOG_PREFIX} connect: Required parameter branch missing!`);
        if(!id) throw new Error(`${LOG_PREFIX} connect: Required parameter id missing!`);
        let repoConnection;
        try {
            repoConnection = libXpNodeConnect({
                repoId: id,
                branch
            });
            //log.debug(`${LOG_PREFIX} repoConnection:${toStr(repoConnection)}`); // {}
        } catch (e) { throw e; }
        return repoConnection;
    } // static connect


    static createBranch({ branch, id }) {
        if(!branch) throw new Error(`${LOG_PREFIX} createBranch: Required parameter branch missing!`);
        if(!id) throw new Error(`${LOG_PREFIX} createBranch: Required parameter id missing!`);
        try {
            const createBranchResult = libXpRepoCreateBranch({ branchId: branch, repoId: id });
            log.debug(`${LOG_PREFIX} createBranchResult:${toStr(createBranchResult)}`);
        } catch (e) {
            if(e.message === `Branch [{${branch}}] already exists`) {
                log.debug(`${LOG_PREFIX} createBranch: branch:${branch} in repo:${id} already exists.`);
            } else {
                log.debug(`${LOG_PREFIX} createBranch: Something went wrong when trying to create branch:${branch} in repo:${id}: ${e.message}`);
                throw e;
            }
        }
    } // static createBranch


    static createRepo({ id }) {
        if(!id) throw new Error(`${LOG_PREFIX} createRepo: Required parameter id missing!`);
        log.info(`${LOG_PREFIX}: Repository with id:${id} does not exist, creating...`);
        const repo = libXpRepoCreate({ id });
        log.info(`${LOG_PREFIX}: Repository with id:${id} created.`);
        return repo;
    } // static createRepo


    static deleteBranch({ branch, id }) {
        if(!branch) throw new Error(`${LOG_PREFIX} deleteBranch: Required parameter branch missing!`);
        if(!id) throw new Error(`${LOG_PREFIX} deleteBranch: Required parameter id missing!`);
        try {
            const deleteBranchResult = libXpRepoCreateBranch({ branchId: branch, repoId: id });
            log.debug(`${LOG_PREFIX} deleteBranchResult:${toStr(deleteBranchResult)}`);
        } catch (e) {
            log.debug(`${LOG_PREFIX} deleteBranch: Something went wrong when trying to delete branch:${branch} in repo:${id}: ${e.message}`);
            throw e;
        }
    } // static deleteBranch


    // TODO static deleteRepo


    static get({ id }) {
        return libXpRepoGet(id);
    } // static get


    //──────────────────────────────────────────────────────────────────────────
    // Constructor
    //──────────────────────────────────────────────────────────────────────────

    constructor({ id, branch = 'master' }) {
        if(!id) throw new Error(`${LOG_PREFIX} constructor: Required parameter id missing!`);
        if(!branch || branch === '') throw new Error(`${LOG_PREFIX} constructor: Optional parameter branch must be a string!`);
        this.id = id;
        this.branch = branch;
        this.set().createBranch().connect();
    } // constructor

    //──────────────────────────────────────────────────────────────────────────
    // Instance methods
    //──────────────────────────────────────────────────────────────────────────

    connect() {
        this.connection = Repo.connect({ branch: this.branch, id: this.id });
        return this; // chainable
    } // connect


    createBranch() {
        Repo.createBranch({ branch: this.branch, id: this.id });
        return this; // chainable
    } // createBranch


    createRepo() {
        this.repo = Repo.createRepo({ id: this.id });
        return this; // chainable
    } // createRepo


    deleteBranch() {
        Repo.deleteBranch({ branch: this.branch, id: this.id });
        return this; // chainable
    } // deleteBranch


    get() {
        if(!this.repo) { this.repo = Repo.get({ id: this.id }) || Repo.createRepo({ id: this.id }) }
        return this.repo; // NOTE: Not chainable
    } // get


    set() {
        this.get();
        return this; // chainable
    } // set

    //──────────────────────────────────────────────────────────────────────────
    // Instance methods related to Nodes
    //──────────────────────────────────────────────────────────────────────────

    createNode(params) {
        log.debug(`${LOG_PREFIX} createNode params:${toStr(params)}`);
        if(!params._name) throw new Error(`${LOG_PREFIX} createNode: Required parameter _name missing!`);
        let node;
        try {
            node = this.connection.create(params);
            //log.debug(`${LOG_PREFIX} created node:${toStr(node)}`);
        } catch (e) {
            log.error(`${LOG_PREFIX} something went wrong when trying to create node with id:${id}! : ${e.message}`);
            if(e.class.name === 'com.enonic.xp.node.NodeAlreadyExistAtPathException') {
                //node = this.connection.get(id);
                log.error(`${LOG_PREFIX} node on id:${id} with id:${node._id} already exists!`);
            } else {
                log.error(`${LOG_PREFIX} something went wrong when trying to create node with id:${id}! : ${e.message}`);
            }
            throw e;
        } // catch
        return node;
    } // createNode


    modifyOrCreateNode(params) {
        if(!params._name) throw new Error(`${LOG_PREFIX} modifyOrCreateNode: Required parameter _name missing!`);
        const path = `${params._parentPath||''.replace(/\/$/, '')}/${params._name}`;
        //log.debug(`${LOG_PREFIX} createOrModifyNode: id:${id}`);
        // TODO: is get faster?
        let modifiedNode;
        try {
            modifiedNode = this.connection.modify({
                key:    path, //id, // TODO: https://github.com/enonic/xp/issues/4887
                editor: node => {
                    Object.keys(params).forEach(k => {
                        node[k] = params[k];
                    })
                    return node;
                }
            });
        } catch (e) {
            // com.enonic.xp.node.NodeNotFoundException: Cannot modify node with key: [/8207921]
            //log.error(`${LOG_PREFIX} createOrModifyNode: something went wrong when trying to modify node with id:${id}! : ${e.message}`);
            if(e.class.name === 'com.enonic.xp.node.NodeNotFoundException') {
                modifiedNode = this.createNode(params);
            } else {
                log.error(`${LOG_PREFIX} createOrModifyNode: something went wrong when trying to modify node with id:${id}! : ${e.message}`);
                throw e;
            }
        }
        return modifiedNode;
    } // modifyOrCreateNode


    query(...args) { log.debug(`${LOG_PREFIX} query(${toStr(args)})`); // Rest
        //return this.connection.query(args[0]);
        return this.connection.query(...args); // Spread does not work yet.
    } // query


    getCount({
        query = '',
        queryParams = {
            query
        }
    } = {}) { log.debug(`${LOG_PREFIX} getCount()`);
        queryParams.count = 0;
        const total = this.query(queryParams).total;
        log.debug(`${LOG_PREFIX} getCount() --> ${total}`);
        return total;
    } // getCount


    paginate({
        cbPage, // callback to execute per page (result)
        count = -1,
        query = '',
        queryParams = {
            query
        },
        pageSize = 1000
    }) { log.debug(`${LOG_PREFIX} paginate()`);
        let howManyToGet = queryParams.count || this.getCount({ queryParams }); // Handle count <1
        if(isNotSet(queryParams.start)) { queryParams.start = 0; }
        let queryResult;
        let seenCount = 0;
        do {
            const remaining = howManyToGet - seenCount;
            queryParams.count = pageSize < remaining ? pageSize : remaining; // So we don't fetch more than howManyToGet
            log.debug(`${LOG_PREFIX} paginate() queryParams:${toStr(queryParams)}`);
            queryResult = this.query(queryParams);
            //log.debug(`${LOG_PREFIX} paginate() queryParams:${toStr(queryParams)} queryResult:${toStr(queryResult)}`);
            cbPage(queryResult);
            queryParams.start = queryParams.start + pageSize; // Where to start in next page
            seenCount += queryResult.count;
        } while (queryResult.count > 0 && seenCount < howManyToGet);
        return this; // Chainable
    } // paginate


    getNodes({ keys }) { log.debug(`${LOG_PREFIX} getNodes({ keys: ${toStr(keys)} })`);
        const nodes = forceArray(this.connection.get(...keys)); // Spread
        //log.debug(`${LOG_PREFIX} getNodes({ keys: ${toStr(keys)} }) --> ${toStr(nodes)}`);
        return nodes;
    } // getNodes


    getNode({ key }) { log.debug(`${LOG_PREFIX} getNode({ key: ${key} })`);
        return this.getNodes({ keys: [ key] })[0];
    } // getNode


    getAllPaths() { log.debug(`${LOG_PREFIX} getAllPaths()`);
        let pathsObj = {};
        this.paginate({
            cbPage: result => {
                const nodes = this.getNodes({ keys: result.hits.map(hit => hit.id) });
                nodes.forEach(node => {
                    pathsObj[node._path] = true;
                });
            } // cbPage
        });
        return pathsObj;
    } // getAllPaths


} // class Repo
