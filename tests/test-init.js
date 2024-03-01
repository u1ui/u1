import 'https://cdn.jsdelivr.net/gh/nuxodin/lazyfill/mod.min.js';
import 'https://cdn.jsdelivr.net/gh/nuxodin/lazyfill/htmlfills.min.js';
import 'https://cdn.jsdelivr.net/gh/nuxodin/cleanup.js/mod.min.js'

document.head.insertAdjacentHTML(
    'afterend',`
<style>
button[onclick] {
    text-align: left;
    --line-height:1.3em;
    padding: .5em .75em;
    margin: .5em 0;
}
button[onclick]::after {
    content: attr(onclick);
    display: block;
    font-size: .7rem;
    font-family:monospace;
    opacity:.8;
}
:is(style,script)[contenteditable] {
    display:block;
}
u1-code {
    margin:2em 0;
    max-height: 40em;
    font-size:13.5px;
    border:1px solid #ccc;
    padding:1em;
    box-shadow: 0 0 10px rgba(0,0,0,.1);    
}
</style>
`);


/*
addEventListener('DOMContentLoaded', ()=>{
    const head = document.createElement('header');
    head.style.width = '100%';
    head.innerHTML = '';
    document.body.prepend(head);
})
*/