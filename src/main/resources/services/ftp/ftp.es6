import { toStr } from '/lib/enonic/sync/object';
import Ftp from '/lib/enonic/sync/ftp';


const DEBUG = true;
const NAME = 'ftp';
const TYPE = 'service';
const LOG_PREFIX = `${NAME} ${TYPE}`;


export function get(request) {
    const ftp = new Ftp({
        host: 'speedtest.tele2.net',
        username: 'anonymous',
        password: 'anonymous@example.com'
    }).connect().login();
    //ftp.getMListDir();
    const names = ftp.getNames();
    ftp.retrieveFile({ remote: '/1KB.zip' });
    ftp.logout().disconnect();

    return {
        body: {
            names
        },
        contentType: 'application/json; charset=utf-8'
    };
} // function get
