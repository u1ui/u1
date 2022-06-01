const myUrl = new URL(import.meta.url);
const debug = myUrl.searchParams.get('debug');


//let root = new URL(myUrl.origin + myUrl.pathname + '/../../');
let root = new URL('https://cdn.jsdelivr.net/gh/u1ui/');
let rootUrl = root.toString();

let min = '.min';
let useLatest = true;
if (root.host === 'localhost') {
    min = '';
    useLatest = false;
}

// get faster cdn updates? https://purge.jsdelivr.net/gh/nuxodin/cleanup.js@latest/

// local testing:
// rootUrl =  import.meta.url + '/../../'; min = ''; useLatest = false; console.log('%cuncomment localhost!','color:red;font-size:1.2em');


if (debug) { // top level await safari >= 15.1
    await Promise.all([
        import('https://cdn.jsdelivr.net/gh/nuxodin/lazyfill@x/mod.min.js'),
        import('https://cdn.jsdelivr.net/gh/nuxodin/lazyfill@x/htmlfills.min.js'),
        import('https://cdn.jsdelivr.net/gh/nuxodin/cleanup.js@x/mod.min.js'),
    ]);
}

import {importCss} from './utils.js';
import {latestUrlCached, repos} from './u1.js';

await repos();

let prio = 1;
setTimeout(()=>prio = 2);
setTimeout(()=>prio = 3, 2000);
const needed = { js:{}, css:{} };
function impJs(url){
    if (useLatest) url = latestUrlCached(url);
    if (!url || url in needed.js) return;
    needed.js[url] = prio;
    return import(url);
}
function impCss(url, options={}){
    if (useLatest) url = latestUrlCached(url)
    if (!url || url in needed.css) return;
    importCss(url, options).then(res=>{
        if (res.available) needed.css[url]=0; // already loaded
    }).catch(() => needed.css[url]=0 ); // failed
    needed.css[url] = prio
}

window.u1 = Object.create(null);
window.u1.needed = needed;

////////////////////////////////////////////////////////////////
//
//  Import defaults
//
////////////////////////////////////////////////////////////////

impCss(rootUrl+'norm.css/norm'+min+'.css');
impCss(rootUrl+'norm.css/beta'+min+'.css');
impCss(rootUrl+'base.css/base'+min+'.css');
impCss(rootUrl+'base.css/beta'+min+'.css');
setTimeout(()=>{
    impCss(rootUrl+'base.css/print.css', {media:'print'});
    impCss(rootUrl+'base.css/nomotion.css', {media:'prefers-reduced-motion'});
})
impCss(rootUrl+'classless.css/variables'+min+'.css');
impCss(rootUrl+'classless.css/classless'+min+'.css');
impCss(rootUrl+'classless.css/more'+min+'.css');
//impCss(rootUrl+'classless.css/aria'+min+'.css');
//impCss(rootUrl+'classless.css/simple'+min+'.css');

impJs(rootUrl+'js/init'+min+'.js');

////////////////////////////////////////////////////////////////
//
//  Autoimport
//
////////////////////////////////////////////////////////////////


function newNode(node){
    if (node.tagName.startsWith('U1-')) {
        let name = node.tagName.substring(3).toLowerCase();
        if (customElements.get('u1-'+name)) return; // skip if registred
        const base = rootUrl + name + '.el/' + name + min;
        impCss(base + '.css'/*, {for:node}*/);
        impJs(base + '.js');
    }
    let classList = node.classList;
    for (let i=0, l=classList.length; i<l; i++) {
        let klass = classList[i]
        if (!klass.startsWith('u1-')) continue;
        let name = klass.substring(3);
        impCss(rootUrl + name + '.class/' + name + min + '.css');
    }
    const attris = node.attributes;
    for (let i=0, l=attris.length; i<l; i++) {
        let attr = attris[i]
        if (!attr.name.startsWith('u1-')) continue;
        let name = attr.name.substring(3).replace(/-.*/,''); // example: u1-href-target => href
        // todo: how to check if already added manually?
        impJs(rootUrl + name + '.attr/' + name + min + '.js');
    }
}
function newNodeRoot(node){
    if (!node.tagName) return;
    newNode(node);
    node.querySelectorAll('*').forEach(newNode);
}
var mo = new MutationObserver((entries)=>{
    for (let i=0, l=entries.length; i<l; i++) {
        let nodes = entries[i].addedNodes;
        for (let j=0, l2=nodes.length; j<l2; j++) {
            newNodeRoot(nodes[j]);
        }
    }
});

export function addShadowRoot(rootNode){
    mo.observe(rootNode,{childList:true, subtree:true, characterData:false});
    newNodeRoot(rootNode);
}
addShadowRoot(document.documentElement)

////////////////////////////////////////////////////////////////
//
//  UI
//
////////////////////////////////////////////////////////////////

addEventListener('keydown',e=>{
    if (e.ctrlKey && e.key ==='F12') {
        import('./auto.ui.js').then(ui=>ui.open())
    }
});

////////////////////////////////////////////////////////////////
//
//  save used files
//
////////////////////////////////////////////////////////////////

/* save all */
function mergeNewlyNeeded(){
    let allNeeded = localStorage.getItem('u1-needed');
    allNeeded = JSON.parse(allNeeded) || {};
    allNeeded.js = Object.assign(allNeeded.js||{}, needed.js);
    allNeeded.css = Object.assign(allNeeded.css||{}, needed.css);
    //Object.assign(allNeeded, needed);
    localStorage.setItem('u1-needed', JSON.stringify(allNeeded));
}

document.addEventListener('DOMContentLoaded',mergeNewlyNeeded);
addEventListener('pagehide',mergeNewlyNeeded);


////////////////////////////////////////////////////////////////
//
//  ready
//
////////////////////////////////////////////////////////////////

console.log('%c%s','color:#2c8898;xfont-size:1.3em', '💡 press ctrl+F12 to configure the U1-design-system!');
