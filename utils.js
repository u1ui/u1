/* Copyright (c) 2016 Tobias Buschor https://goo.gl/gl0mbf | MIT License https://goo.gl/HgajeK */

var listeners = [],
    //root = document.documentElement,
    root = document,
    Observer;

export function onElement (selector, options/*, disconnectedCallback*/) {
	if (typeof options === 'function') {
		options = { parsed:options }
	}
    var listener = {
        selector: selector,
		immediate: options.immediate,
        //disconnectedCallback: disconnectedCallback,
        elements: new WeakSet(),
    };
	if (options.parsed) {
    	listener.parsed = function(el){
			requestAnimationFrame(function(){
				options.parsed(el);
			});
		}
	}
	try {
	    var els = root.querySelectorAll(listener.selector), i=0, el;
	} catch(e) {
		console.error('invalid selector: "'+listener.selector+'"');
		return;
	}
    while (el = els[i++]) {
        listener.elements.add(el);
        listener.parsed    && listener.parsed.call(el, el);
        listener.immediate && listener.immediate.call(el, el);
    }

    listeners.push(listener);
    if (!Observer) {
        Observer = new MutationObserver(checkMutations);
        Observer.observe(root, {
            childList: true,
            subtree: true
        });
    }
    checkListener(listener);
};
function checkListener(listener, target) {
    var i=0, el, els = [];
    target && target.matches(listener.selector) && els.push(target);
    if (loaded) { // ok? check inside node on innerHTML - only when loaded
        Array.prototype.push.apply(els, (target||root).querySelectorAll(listener.selector));
    }
    while (el = els[i++]) {
        if (listener.elements.has(el)) continue;
        listener.elements.add(el);
        //listener.connectedCallback.call(el, el);
        listener.parsed    && listener.parsed.call(el, el);
        listener.immediate && listener.immediate.call(el, el);
    }
}
function checkListeners(inside) {
    var i=0, listener;
    while (listener = listeners[i++]) checkListener(listener, inside);
}
function checkMutations(mutations) {
    var j=0, i, mutation, nodes, target;
    while (mutation = mutations[j++]) {
        nodes = mutation.addedNodes, i=0;
        while (target=nodes[i++]) target.nodeType === 1 && checkListeners(target);
    }
}

var loaded = false;
document.addEventListener('DOMContentLoaded',function(){
    loaded = true;
});

///////////////////////////
// cssImport

var cssImported = [];
export function importCss (url) { // todo: handle absolute urls
    // handle relative urls
    if (url.indexOf('./') === 0) {
        // better?
        // const e = new Error();
        // const lines = e.stack.split('\n');
        // lines[0] === 'Error' && lines.shift();
        // const calledFile = lines[1].match(/[a-z]+:[^?:]+/);
        // url = new URL(calledFile[0]+'/.'+url).toString();
        const e = new Error();
        const calledFile = e.stack.split('\n')[2].match(/[a-z]+:[^:]+/);
        const calledUrl = new URL(calledFile);
        calledUrl.search = '';
        const url = new URL(url, calledUrl).toString();
    }
    // check if imported already
    if (cssImported[url]) return;
    cssImported[url] = true;
    // check if manually added
    for (let el of document.querySelectorAll('link[rel=stylesheet]')) {
        if (el.href === url) return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.append(link);
    // todo: return promise
}
