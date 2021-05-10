/* Copyright (c) 2016 Tobias Buschor https://goo.gl/gl0mbf | MIT License https://goo.gl/HgajeK */
/*
c1.href = {
	ignoreSelector: '[onmousedown]'
};
*/
document.addEventListener('click', function (e) {
	//if (e.which !== 1) return;
	if (e.button !== 0) return; // only left-click
	if (e.defaultPrevented) return; // not if prevented
	var sel = getSelection();
	if (!sel.isCollapsed) { // only if the selection is collapsed.
		var textSelected = sel.anchorNode.nodeType === 3 || sel.focusNode.nodeType === 3;
		var shadowElSelected = sel.focusNode.nodeType === 11; // svg-use-element, firefox
		if (textSelected && !shadowElSelected) return;
	}
	if (!e.target.closest) return; // some targets have no closest method?
	var A = e.target.closest('[u1-href]'); // find 
	if (!A) return;
	if (e.target.closest('a,input,textarea,select,button')) return;
	if (e.target.closest('[onclick]')) return; // remove fn
	//if (e.target.closest(c1.href.ignoreSelector)) return;
	if (e.target.isContentEditable) return; // not if contenteditable
	var href = A.getAttribute('u1-href'); // get the url
	if (!href) return;
	var target = A.getAttribute('u1-target'); // get the target
	if (e.ctrlKey) target = '_blank'; // better random-string?
    /*
	var event = new CustomEvent('u1-href-navigate', { // trigger custom event with the ability to prevent Navigation
		cancelable: true,
		detail: {
			url: href,
			target: target,
		}
	});
	window.dispatchEvent(event);
	if (event.defaultPrevented) return;
    */
	if (target) {
		window.open(href, target, 'noopener');
		//!e.ctrlKey && win.focus(); // not needed in chrome, not working in ff
	} else {
		location.href = href;
	}
});
document.head.insertAdjacentHTML('afterbegin', '<style>[u1-href]{cursor:pointer},[u1-href=""]{cursor:normal}</style>');
//document.head.insertAdjacentHTML('beforeend', '<style>[u1-href]{cursor:pointer},[u1-href=""]{cursor:normal}</style>');
