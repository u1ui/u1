const rootUrl = 'https://cdn.jsdelivr.net/gh/u1ui/';
const min = 'min';

'href parallax'.split(' ').forEach(attr=>{
    const selector = '[u1-'+attr+']';
    onElement(selector, function(el){
        import(rootUrl+'attr-'+attr+'/'+attr'.'+min+'.js');
    });
});

/*
'alert'.split(' ').forEach(element=>{
    const selector = 'u1-'+element;
    onElement(selector, function(el){
        import(rootUrl+'el-'+element+'/'+element'.'+min+'.js');
    });
});
*/
