//import { asymmetricDiff } from '/lib/enonic/sync/array';
import { asymmetricDiff, toStr } from '/lib/enonic/sync/object';
import Repo                      from '/lib/enonic/sync/repo';


const NAME       = 'sync';
const TYPE       = 'class';
const LOG_PREFIX = `${NAME} ${TYPE}`;


export default class Sync {


    constructor({
        repoId
    }) {
        this.repo = new Repo({ id: repoId });
        this.sourceKeys = {};
    }


    modifyOrCreate(...args) { // Rest
        const node = this.repo.modifyOrCreateNode(...args); // Spread
        if(this.sourceKeys[node._path]) { log.warning(`${LOG_PREFIX} modifyOrCreate: Path already processed: ${node._path}`); }
        this.sourceKeys[node._path] = true;
        return node;
    }


    deleteNodesThatNoLongerExistInSource() { log.debug(`${LOG_PREFIX} deleteNodesThatNoLongerExistInSource()`);
        const targetKeys = this.repo.getAllPaths();
        log.debug(`${LOG_PREFIX} deleteNodesThatNoLongerExistInSource: targetKeys: ${toStr(targetKeys)}`);
        const pathsToDelete = asymmetricDiff(targetKeys, this.sourceKeys); // In target, but no longer in source.
        //log.debug(`${LOG_PREFIX} deleteNodesThatNoLongerExistInSource: pathsToDelete: ${toStr(pathsToDelete)}`);
    }


} // default class Sync
