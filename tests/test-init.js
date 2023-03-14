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