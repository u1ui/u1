// similiar: https://github.com/Polymer/tools/tree/master/packages/analyzer

// hooks
{
    /*
    const aEL = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(...args){
        !this.__events && (this.__events = []);
        this.__events.push(args[0]);
        return aEL.apply(this, args);
    }
    */
    // collect all dispatched events
    window.__dispatchedEvents = new Set();
    const dE = EventTarget.prototype.dispatchEvent;
    EventTarget.prototype.dispatchEvent = function(...args){
        const ev = args[0];
        if (!ev.detail || !ev.detail.__test) {
            //!this.__events && (this.__events = {});
            //this.__events[args[0].type] = 1;
            __dispatchedEvents.add(args[0].type);
        }
        return dE.apply(this, args);
    }

    // requested css properties
    const gCS = getComputedStyle;
    window.getComputedStyle = function(...args){
        style = gCS.apply(this, args);
        style._computedFor = args[0];
        return style;
    }
    const gPV = CSS2Properties.prototype.getPropertyValue;
    CSS2Properties.prototype.getPropertyValue = function(...args){
        // collect requested properties args[0]
        const computedFor = this._computedFor;
        if (computedFor) {
            !computedFor.__requestedProperties && (computedFor.__requestedProperties = []);
            computedFor.__requestedProperties.push(args[0]);
        }
        return gPV.apply(this, args);
    }
}


function fromElement(el) {

    // el.outerHTML = el.outerHTML; // trigger changes

    const tagName = el.tagName.toLowerCase();
    var klass = el.constructor;


    // better: walk stylsheets and search for `xy-element { --x:y; };`
    var cps = Object.values(getComputedStyle(el)).filter(style=>{
        if (!style.startsWith) return;
        if (style.startsWith('--'+tagName)) return true;
    });
    const cssProperties = cps.map(name=>{
        return {
            name,
            default:'',
            summary:'',
            description:'',
        }
    });

    var attris = klass.observedAttributes;
    var attributes = (attris??[]).map(attr=>{
        return {
            name:attr,
            summary:'',
            description:'',
            inheritedFrom:null,
            type: null,
            default:'',
            fieldName:null
        };
    });


    // events
    // trigger different native events
    function triggerNativeEvents(){
        const options = {bubbles:true, detail:{__test:1}};
        const eNames = ['click','mouseover','mouseenter','keydown','drop','input','change','focus','blur'];
        const containEls = el.querySelectorAll('*');
        const shadowEls = el.shadowRoot ? el.shadowRoot.querySelectorAll('*') : [];
        eNames.forEach(eName=>{
            el.dispatchEvent(new CustomEvent(eName, options));
            containEls.forEach(el=>el.dispatchEvent(new CustomEvent(eName, options)))
            shadowEls.forEach(el=>el.dispatchEvent(new CustomEvent(eName, options)))
        })
    }
    // trigger native events to collect custom events
    triggerNativeEvents();
    // listen for every collected events
    var triggeredEvents = new Set();
    for (let eventName of __dispatchedEvents) {
        el.addEventListener(eventName,()=>triggeredEvents.add(eventName));
    }
    // again trigger native events to collect them on my custom element
    triggerNativeEvents();

    const events = [...triggeredEvents].map(name=>{
    //const events = Object.keys(el.__events??[]).map(name=>{
        return {
            name,
            summary: '',
            description: '',
            type: null,
            inheritedFrom: null,
        }
    });

    // slots
    var slotEls = el.shadowRoot ? el.shadowRoot.querySelectorAll('slot') : [];
    const slots = Array.from(slotEls).map(el=>{
        return {
            name: el.name,
            summary: '',
            description: '',
        };
    })


    // CSS Shadow Parts
    var partEls = el.shadowRoot ? el.shadowRoot.querySelectorAll('[part]') : [];
    const cssParts = Array.from(partEls).map(el=>{
        return {
            name: el.getAttribute('part'),
            summary: '',
            description: '',
        };
    })


    // members
    const membersObj = {}
    let proto = klass.prototype
    while (1) {
        Object.entries(Object.getOwnPropertyDescriptors(proto)).map(([name, desc])=>{
            if (membersObj[name]) return;
            if (name === 'connectedCallback') return;
            if (name === 'disconnectedCallback') return;
            if (name === 'attributeChangedCallback') return;

            const writeable = !desc.value && desc.set;
            const readable = !desc.value && desc.get;
            const obj = {
                name,
                summary: (readable?'readable':'')+' '+(readable?'writable':''),
                description: '',
                static: false,
                privacy: 'public',
                //inheritedFrom: null,
                //source : null,
            };
            if (desc.value && typeof desc.value === 'function') {
                obj.kind = 'method';
                // obj.parameters: Parameter[];
                // obj.return = {
                //   type = Type,
                //   description = string,
                // };
            } else {
                obj.kind = 'field';
                // obj.type = Type;
                // obj.default = string;
            }
            membersObj[name] = obj;
        })
        proto = Object.getPrototypeOf(proto);
        if (!proto) break;
        if (proto === HTMLElement.prototype) break;
        if (proto[Symbol.toStringTag] === 'HTMLElement') break;
        if (proto === Object.prototype) break;
    };
    const members = Object.values(membersObj);


    return {
        /* ce extends classLikes */
        name: klass.name || tagName,
        summary: klass.formAssociated ? 'form element' : '',
        description: '',
        //superclass: null,
        //mixins: [],
        members,
        source: 'https://',

        tagName,
        attributes,
        events,
        slots,
        cssParts,
        cssProperties,
        demos:[{
            url: location.href,
            description: document.title,
            source: '',
        }],
        customElement:true,

    };

}