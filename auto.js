import {importCss} from './utils.js';
import '../js/init.js';
import {onElement} from '../js/onElement/mod.js';

//import 'https://cdn.jsdelivr.net/gh/nuxodin/lazyfill/mod.js';
//import 'https://cdn.jsdelivr.net/gh/nuxodin/lazyfill/htmlfills.js';


let rootUrl = 'https://cdn.jsdelivr.net/gh/u1ui/';
let min = '.min';

// local testing:
//rootUrl =  import.meta.url + '/../../'; min = ''; console.warn('uncomment localhost!');

// attr
'href parallax ico'.split(' ').forEach(attr=>{
    const selector = '[u1-'+attr+']';
    onElement(selector, {immediate:function(el){
        import(rootUrl + attr + '.attr/' + attr + min + '.js');
    }});
});


// class
'badge table unstyle auto-grid flex-gap input width'.split(' ').forEach(name=>{
    const selector = '.u1-'+name;
    onElement(selector, {immediate:function(el){
        let url = rootUrl + name + '.class/' + name + min + '.css';
        console.log(url)
        importCss(url);
    }});
});

// el
'ico tabs carousel parallax-bg time'.split(' ').forEach(name=>{
    onElement('u1-'+name, {immediate:function(el){
        import(rootUrl + name + '.el/' + name + min + '.js');
        let cssURL = rootUrl + name + '.el/' + name + min + '.css';
        console.log(cssURL)
        importCss(cssURL);
    }});
});
