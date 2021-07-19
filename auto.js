let rootUrl = 'https://cdn.jsdelivr.net/gh/u1ui/';
let min = '.min';
// local testing:
rootUrl =  import.meta.url + '/../../'; min = ''; console.warn('uncomment localhost!');


//import 'https://cdn.jsdelivr.net/gh/nuxodin/lazyfill/mod.js';
//import 'https://cdn.jsdelivr.net/gh/nuxodin/lazyfill/htmlfills.js';

import {importCss} from './utils.js';
import {onElement} from 'https://cdn.jsdelivr.net/gh/u1ui/js@1.8.0/onElement/mod.js';



/* hints helper */
let prio = 1;
setTimeout(()=>prio = 2);
setTimeout(()=>prio = 3, 2000);
const needed = { js:{}, css:{} };
function impJs(url){
    if (url in needed.js) return;
    needed.js[url] = prio;
    /* zzz
    var scriptEl = document.createElement('script');
    scriptEl.type='module';
    scriptEl.src = url;
    document.head.append(scriptEl);
    */
    return import(url)
}
function impCss(url, options={}){
    if (url in needed.css) return;
    importCss(url, options).then(res=>{
        if (res.available) needed.css[url]=0; // already loaded
    }).catch(() => needed.css[url]=0 ); // failed
    needed.css[url] = prio
}


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
impCss(rootUrl+'classless.css/aria'+min+'.css');
//impCss(rootUrl+'classless.css/simple'+min+'.css');

impJs(rootUrl+'js/init'+min+'.js');


// attr
'href parallax ico'.split(' ').forEach(attr=>{
    const selector = '[u1-'+attr+']';
    onElement(selector, {immediate:function(el){
        // todo: how to check if already added manually?
        impJs(rootUrl + attr + '.attr/' + attr + min + '.js');
    }});
});

// class
'badge table unstyle auto-grid flex-gap input width'.split(' ').forEach(name=>{
    const selector = '.u1-'+name;
    onElement(selector, {immediate:function(el){
        impCss(rootUrl + name + '.class/' + name + min + '.css');
    }});
});

// el
'ico tabs carousel parallax-bg time'.split(' ').forEach(name=>{
    onElement('u1-'+name, {immediate:function(el){
        if (customElements.get('u1-'+name)) return; // skip if registred
        const base = rootUrl + name + '.el/' + name + min;
        impCss(base + '.css');
        impJs(base + '.js');
    }});
});






function latest(url, {notify}={}) {
    url = new URL(url).toString();
    url = url.replace(/u1ui\/([^\/]+)\//, function(x,repoVers){
        let [repo, vers] = repoVers.split('@');
        let newVers = repos[repo].release_latest.tag_name.replace('v','');
        if (notify && vers && vers !== newVers) console.log('new version for: '+url+' :'+newVers)
        return repo + '@' + newVers + '/';
    });
    return url;
}


let repos = null;
async function loadReposJson(){
    if (repos) return repos;
    repos = {};
    const data = await fetch(import.meta.url + '/../repos.json').then(res=>res.json());
    const entries = data.forEach(repo=>{
        repos[repo.name] = repo;
    });
}

window.u1 = Object.create(null);

window.u1.hints = async function(){
    await loadReposJson();
    let strCss = Object.entries(needed.css).filter(([,prio])=>prio===1).map(([url,prio])=>'<link rel="stylesheet" href="'+latest(url)+'" crossorigin>').join('\n');
    let strJs  = Object.entries(needed.js).map(([url,prio])=>'<script src="'+latest(url)+'" type=module crossorigin></script>').join('\n');
    let strCssNonCritical = Object.entries(needed.css).filter(([,prio])=>prio>1).map(([url,prio])=>'<link rel="stylesheet" href="'+latest(url)+'" crossorigin>').join('\n');
    console.log(
        strCss +'\n'+
        strJs + '\n' +
        '\n<!-- non critical at the end -->\n' + strCssNonCritical);
}


window.u1.versionCheck = async function(){
    await loadReposJson();
    document.querySelectorAll('script').forEach(el=>{
        const url = el.src;
        if (!url.match('u1ui')) return;
        latest(url, {notify:true});
    })
    document.querySelectorAll('link[rel=stylesheet]').forEach(el=>{
        const url = el.href;
        if (!url.match('u1ui')) return;
        latest(url, {notify:true});
    })

}
