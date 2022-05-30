import 'https://cdn.jsdelivr.net/gh/nuxodin/lazyfill@x/mod.min.js';
import 'https://cdn.jsdelivr.net/gh/nuxodin/lazyfill@x/htmlfills.min.js';
import 'https://cdn.jsdelivr.net/gh/nuxodin/cleanup.js@x/mod.min.js'


document.head.insertAdjacentHTML(
    'afterbegin',`
<style>
button {
    text-align: left;
    --line-height:1.3em;
    padding: .5em .75em;
    margin: .5em 0;
}
button::after {
    content: attr(onclick);
    display: block;
    font-size: .7rem;
    font-family:monospace;
    opacity:.8;
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