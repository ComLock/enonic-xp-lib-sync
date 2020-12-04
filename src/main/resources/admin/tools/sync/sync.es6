import { toStr } from '/lib/enonic/sync/object';
import { getResource, readText } from '/lib/xp/io';
import { serviceUrl } from '/lib/xp/portal';
import {
    get as getTask,
    list as listTasks,
    sleep,
    submit as submitTask
} from '/lib/xp/task';
import { render } from '/lib/xp/thymeleaf';


const NAME = 'sync';
const TYPE = 'admin-tool';
const LOG_PREFIX = `${NAME} ${TYPE}`;
const VIEW_FILE = resolve(`${NAME}.th.html`);
const INLINE_SVG = readText(getResource(resolve(`${NAME}.svg`)).getStream());
const STATE_FINISHED = 'FINISHED';

let activeTaskId = null;


function sleepUntil({ conditionCb, delay = 1000 }) {
    while(!conditionCb()) { sleep(delay); }
    return;
}


function scheduler({
    cron = {
        hour: 999, // Will never match, so tasks without cron won't be started
        minute: 0//,
        //second: 0
    },
    taskDescription = 'noop',
    taskCb = () => { log.debug(`${LOG_PREFIX} default noop taskCb`); },
    delay = 60000 // milliseconds (Once a minute)
} = {}) { //log.debug(`${LOG_PREFIX} scheduler({ delay:${delay} })`);
    submitTask({
        description: 'Scheduler',
        task: () => {
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            //const second = now.getSeconds();
            if( // TODO: What if some other process makes the scheduler skips a minute??? I guess that means load is too high anyway.
                (cron.hour === '*' || minute === cron.hour)
                && (cron.minute === '*' || minute === cron.minute)
                //&& (cron.second === '*' || second === cron.second)
            ) {
                //log.debug(`${LOG_PREFIX} scheduler() cron match ${hour}:${minute}:${second} === ${cron.hour}:${cron.minute}:${cron.second}`);
                log.debug(`${LOG_PREFIX} scheduler() cron match ${hour}:${minute} === ${cron.hour}:${cron.minute}`);

                // Do not start new job if previous of same description is not finished...
                sleepUntil({ conditionCb: () => {
                    const unfinishedTasksWithDescription = listTasks().filter((t)=>{ return t.description === taskDescription && t.state !== STATE_FINISHED }); log.debug(`${LOG_PREFIX} scheduler() unfinishedTasksWithDescription:${toStr(unfinishedTasksWithDescription)}`);
                    return unfinishedTasksWithDescription.length ? false : true;
                } });

                const newTaskId = submitTask({
                    description: taskDescription,
                    task: taskCb
                }); log.debug(`${LOG_PREFIX} scheduler() newTaskId:${toStr(newTaskId)}`);
            } else {
                //log.debug(`${LOG_PREFIX} scheduler() NO cron match ${hour}:${minute}:${second} !== ${cron.hour}:${cron.minute}:${cron.second}`);
                log.debug(`${LOG_PREFIX} scheduler() NO cron match ${hour}:${minute} !== ${cron.hour}:${cron.minute}`);
            } // cron
            log.debug(`${LOG_PREFIX} scheduler sleeping for ${delay}ms`);
            sleep(delay); // Let the scheduler sleep, before starting another.
            scheduler({ cron, taskDescription, taskCb, delay }) // "recurse"
        } // task
    });
} // function scheduler


export function get(request) {
    log.debug(`${LOG_PREFIX} request:${toStr(request)}`);

    const model = {
        inlineSvg: INLINE_SVG,
        serviceUrl: serviceUrl({ service: 'sql' })
    };
    log.debug(`${LOG_PREFIX} model:${toStr(model)}`);

    /*scheduler({
        cron: {
            hour:   2,
            minute: 30//,
            //second: '*'
        },
        taskDescription: 'Sync something',
        taskCb: () => {
            log.debug(`${LOG_PREFIX} The actual sync job.`);
        }
    });*/

    return {
        body:        render(VIEW_FILE, model),
        contentType: 'text/html; charset=utf-8'
    };
} // function get
