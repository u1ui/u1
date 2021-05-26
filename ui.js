const rootUrl = 'https://cdn.jsdelivr.net/gh/u1ui/';
const min = 'min';

'href parallax'.split(' ').forEach(attr=>{
    const selector = '[u1-'+attr+']';
    onElement(selector, function(el){
        import(rootUrl + attr + '.attr/' + attr + '.' + min + '.js');
    });
});


/*

'badge'.split(' ').forEach(attr=>{
    const selector = '.'+class;
    onElement(selector, function(el){
        import(rootUrl + attr + '.class/' + attr + '.' + min + '.css');
    });
});

'alert'.split(' ').forEach(element=>{
    const selector = 'u1-'+element;
    onElement(selector, function(el){
        import(rootUrl+element+'.el/'+element'.'+min+'.js');
    });
});

function importCss(url){
    urls[url]
    document.createElement('link')
}

*/