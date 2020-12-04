import { getAppConfig } from '/lib/enonic/sync/app/config';
import HtmlElement, { Html, Head, Title, H1, Form, Label, Option, Button } from '/lib/enonic/sync/htmlElement';
import { isSet, toStr } from '/lib/enonic/sync/object';
import Repo from '/lib/enonic/sync/repo';
import { getMultipartForm } from '/lib/xp/portal';


const NAME       = 'job-create';
const TYPE       = 'service';
const LOG_PREFIX = `${NAME} ${TYPE}`;
const TITLE      = 'Service Job Create';
const REPO_NAME  = 'app-sync-repo';


export function get(request) {
    log.debug(`${LOG_PREFIX} request:${toStr(request)}`);

    const appConfig = getAppConfig();
    log.debug(`${LOG_PREFIX} appConfig:${toStr(appConfig)}`);

    const model = {
        what: Object.keys(appConfig.service.sql)
    };
    log.debug(`${LOG_PREFIX} model:${toStr(model)}`);

    const body = new Html([
        new Head([
            new Title().addText(TITLE)
        ])
    ]).add('body', [
        new H1().addText(TITLE),
        new Form(
            { method: 'post' },
            [
                new Label({ style: 'display: block;' }).addText('Hour:').add('select', { name: 'hour' }, [
                    new Option({ selected: '', value: '*' }).addText('*')
                ].concat(...Array.apply(null, { length: 24 }).map(Number.call, Number).map(v => new Option({ value: v }).addText(v)))),
                new Label({ style: 'display: block;' }).addText('Minute:').add('select', { name: 'minute' }, [
                    new Option({ selected: '', value: '*' }).addText('*')
                ].concat(...Array.apply(null, { length: 60 }).map(Number.call, Number).map(v => new Option({ value: v }).addText(v)))),
                new Label({ style: 'display: block;' }).addText('What:').add('select', { name: 'what' }, model.what.map(w => new Option({ value: w }).addText(w))),
                new Button({ type: 'submit' }).addText('Create')
            ]
        ),
    ]).render();
    log.debug(`${LOG_PREFIX} body:${toStr(body)}`);

    return {
        body,
        contentType: 'text/html; charset=utf-8'
    };
} // function get


export function post(request) {
    log.debug(`${LOG_PREFIX} request:${toStr(request)}`);

    const multipartForm = getMultipartForm();
    log.debug(`${LOG_PREFIX} multipartForm:${toStr(multipartForm)}`);

    // TODO: Store the job to app-sync-repo
    const repo = new Repo({ id: REPO_NAME });
    repo.modifyOrCreateNode({
        _name: request.params.what,
        data: {
            hour: request.params.hour,
            minute: request.params.minute,
        }
    });

    return {
        body: 'Created',
        contentType: 'text/html; charset=utf-8'
    };
} // function post
