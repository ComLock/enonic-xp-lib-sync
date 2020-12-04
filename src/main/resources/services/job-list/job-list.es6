import HtmlElement, { Html, Head, Title, H1, Form, Label, Option, Button } from '/lib/enonic/sync/htmlElement';
import { isSet, toStr } from '/lib/enonic/sync/object';
import Repo from '/lib/enonic/sync/repo';
import { getMultipartForm } from '/lib/xp/portal';


const NAME       = 'job-list';
const TYPE       = 'service';
const LOG_PREFIX = `${NAME} ${TYPE}`;
const TITLE      = 'Service Job List';
const REPO_NAME  = 'app-sync-repo';


export function get(request) {
    log.debug(`${LOG_PREFIX} request:${toStr(request)}`);

    const repo = new Repo({ id: REPO_NAME });

    const paths = Object.keys(repo.getAllPaths()).slice(1);
    log.debug(`${LOG_PREFIX} paths:${toStr(paths)}`);

    const nodes = repo.getNodes({ keys: paths }).map(n => {
        return {
            hour: n.data.hour,
            minute: n.data.minute,
            what: n._name
        };
    });
    log.debug(`${LOG_PREFIX} nodes:${toStr(nodes)}`);

    return {
        body: new Html([
            new Head([ new Title().addText(TITLE) ])
        ]).add('body', [
            new H1().addText(TITLE),
            new HtmlElement('table', [
                new HtmlElement('tr',[
                    new HtmlElement('th').addText('Hour'),
                    new HtmlElement('th').addText('Minute'),
                    new HtmlElement('th').addText('What')
                ])
                ].concat(nodes.map(n => new HtmlElement('tr', [
                    new HtmlElement('td').addText(n.hour),
                    new HtmlElement('td').addText(n.minute),
                    new HtmlElement('td').addText(n.what)
                ])))
            )
        ]).render(),
        contentType: 'text/html; charset=utf-8'
    };
} // function get
