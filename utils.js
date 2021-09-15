///////////////////////////
// cssImport

var cssImported = [];
export function importCss(url) {
    return new Promise((resolve, reject) => {
        var link = _importCss(url);
        if (link==null) resolve({available:true}); // already loaded
        else {
            link.onload  = e=>resolve({available:false}); // todo, remove eventlisteners?
            link.onerror = e=>reject();
        }
    });
}

let styleWrapper = document.createElement('div');
document.head.prepend(styleWrapper);

function _importCss(url, options={}){
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
    if (cssImported[url]) return; // check if imported already
    cssImported[url] = true;
    for (let el of document.querySelectorAll('link[rel=stylesheet]')) { // check if manually added
        if (el.href === url) return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    if (options.media) link.media = options.media;
    link.href = url;
    //document.head.append(link);
    styleWrapper.append(link);
    return link;
}