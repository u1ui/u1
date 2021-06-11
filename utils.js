///////////////////////////
// cssImport

var cssImported = [];
export function importCss(url) { // todo: handle absolute urls
    // handle relative urls
    if (url.indexOf('./') === 0) {
        // better?
        // const e = new Error();
        // const lines = e.stack.split('\n');
        // lines[0] === 'Error' && lines.shift();
        // const calledFile = lines[1].match(/[a-z]+:[^?:]+/);
        // url = new URL(calledFile[0]+'/.'+url).toString();
        const e = new Error();
        const calledFile = e.stack.split('\n')[2].match(/[a-z]+:[^:]+/);
        const calledUrl = new URL(calledFile);
        calledUrl.search = '';
        const url = new URL(url, calledUrl).toString();
    }
    // check if imported already
    if (cssImported[url]) return;
    cssImported[url] = true;
    // check if manually added
    for (let el of document.querySelectorAll('link[rel=stylesheet]')) {
        if (el.href === url) return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.append(link);
    // todo: return promise
}
