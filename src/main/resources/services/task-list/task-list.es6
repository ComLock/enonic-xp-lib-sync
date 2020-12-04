import { toStr } from '/lib/enonic/sync/object';
import { list as listTasks } from '/lib/xp/task';


const NAME       = 'task-list';
const TYPE       = 'service';
const LOG_PREFIX = `${NAME} ${TYPE}`;


export function get(request) {
    log.debug(`${LOG_PREFIX} request:${toStr(request)}`);

    const model = { tasks: listTasks() };

    return {
        body: model,
        contentType: 'application/json; charset=utf-8'
    };
} // function get
