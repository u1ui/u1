///////////////////////////
// cssImport

var cssImported = [];
export function importCss(url, options={}) {
    return new Promise((resolve, reject) => {
        var link = _importCss(url, options);
        if (link==null) resolve({available:true}); // already loaded
        else {
            link.onload  = e=>resolve({available:false}); // todo, remove eventlisteners?
            link.onerror = e=>reject();
        }
    });
}

//let styleWrapper = document.createElement('div');
//document.head.prepend(styleWrapper);

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


    const rootNode = options.for ?? document.documentElement;

    if (cssImported[url]) return; // check if imported already
    cssImported[url] = true;

    for (let el of rootNode.querySelectorAll('link[rel=stylesheet]')) { // check if manually added
        if (el.href === url) return;
    }
    const link = rootNode.ownerDocument.createElement('link');
    link.rel = 'stylesheet';
    if (options.media) link.media = options.media;

    link.href = url;
    rootGetStyleWrapper(rootNode).append(link);
    //styleWrapper.append(link);
    return link;
}


const styleWrappers = new WeakMap();
function rootGetStyleWrapper(root) {
    if (!styleWrappers.has(root)) {
        let styleWrapper = document.createElement('div');
        root.prepend(styleWrapper);
        styleWrappers.set(root, styleWrapper);
    }
    return styleWrappers.get(root);
}