let rootUrl = 'https://cdn.jsdelivr.net/gh/u1ui/';
let min = '.min';

// local testing:
//rootUrl =  import.meta.url + '/../../'; min = ''; console.warn('uncomment localhost!');


//import 'https://cdn.jsdelivr.net/gh/nuxodin/lazyfill/mod.js';
//import 'https://cdn.jsdelivr.net/gh/nuxodin/lazyfill/htmlfills.js';

import {importCss} from './utils.js';
// import '../js/init.js';
//import {onElement} from '../js/onElement/mod.js';
import 'https://cdn.jsdelivr.net/gh/u1ui/js@1.3.0/init.js';
import {onElement} from 'https://cdn.jsdelivr.net/gh/u1ui/js@1.3.0/onElement/mod.js';



let prio = 1;
setTimeout(()=>prio = 2);
setTimeout(()=>prio = 3, 2000);

const needed = {
    js:{},
    css:{},
};

// attr
'href parallax ico'.split(' ').forEach(attr=>{
    const selector = '[u1-'+attr+']';
    onElement(selector, {immediate:function(el){
        const url = rootUrl + attr + '.attr/' + attr + min + '.js';
        if (needed.js[url]) return;
        import(url);
        needed.js[url] = prio;
    }});
});


// class
'badge table unstyle auto-grid flex-gap input width'.split(' ').forEach(name=>{
    const selector = '.u1-'+name;
    onElement(selector, {immediate:function(el){
        let url = rootUrl + name + '.class/' + name + min + '.css';
        if (needed.css[url]) return;
        importCss(url).catch(()=> needed.css[url]=0 ); // could not load
        needed.css[url] = prio;
    }});
});

// el
'ico tabs carousel parallax-bg time'.split(' ').forEach(name=>{
    onElement('u1-'+name, {immediate:function(el){
        if (customElements.get('u1-'+name)) return; // skip if registred
        const url = rootUrl + name + '.el/' + name + min;
        if (needed.js[url+'.js']) return;
        import(url+'.js');
        importCss(url+'.css').catch(()=> needed.css[url+'.css']=0 ); // could not load
        needed.css[url+'.css'] = prio;
        needed.js[url+'.js'] = prio;
    }});
});

window.u1Debug = function(){
    let strCss = Object.entries(needed.css).filter(([,prio])=>prio===1).map(([url,prio])=>'<link rel="stylesheet" href="'+url+'">').join('\n');
    let strJs  = Object.entries(needed.js).map(([url,prio])=>'<script src="'+url+'" type=module></script>').join('\n');
    let strCssNonCritical = Object.entries(needed.css).filter(([,prio])=>prio>1).map(([url,prio])=>'<link rel="stylesheet" href="'+url+'">').join('\n');
    console.log(
        strCss +'\n'+
        strJs + '\n' +
        '\n<!-- non critical at the end -->\n' + strCssNonCritical);
}
