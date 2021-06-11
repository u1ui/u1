import {importCss} from './utils.js';
import {onElement} from '../js/onElement/mod.js';

//import 'https://cdn.jsdelivr.net/gh/nuxodin/lazyfill/mod.js';
//import 'https://cdn.jsdelivr.net/gh/nuxodin/lazyfill/htmlfills.js';


//const rootUrl = 'https://cdn.jsdelivr.net/gh/u1ui/';
const rootUrl = '../';
//const min = '.min';
const min = '';

// attr
'href parallax ico'.split(' ').forEach(attr=>{
    const selector = '[u1-'+attr+']';
    onElement(selector, function(el){
        import(rootUrl + attr + '.attr/' + attr + min + '.js');
    });
});


// class
'badge table unstyle auto-grid flex-gap input'.split(' ').forEach(name=>{
    const selector = '.u1-'+name;
    onElement(selector, function(el){
        importCss(rootUrl + name + '.class/' + name + min + '.css');
    });
});

// el
'ico tabs'.split(' ').forEach(name=>{
    const selector = 'u1-' + name;
    onElement(selector, function(el){
        import(rootUrl + name + '.el/' + name + min + '.js');
        importCss(rootUrl + name + '.el/' + name + min + '.css');
    });
});
