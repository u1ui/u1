
import {dump, encode} from 'https://cdn.jsdelivr.net/gh/nuxodin/dump.js@1.2.1/mod.min.js';

function customRender(obj){
    let isElement = false;
    try {
        isElement = obj instanceof Element && obj.tagName;
    } catch {}
    if (isElement) {
        return encode(obj.outerHTML.substring(0, 50))+"...";
    }
}

//import {alert} from 'https://cdn.jsdelivr.net/gh/u1ui/dialog.js@2.0.4/dialog.min.js';
import {alert} from '../../dialog.js/dialog.js';

export class EventsExplorer {
    constructor(into, el, events) {
        this.into = into;
        this.el = el;
        this.events = events;
        this.into.innerHTML =
            `<div style="display:flex; justify-content:end"><button class=-clearbtn>clear</button></div>
            <div class=-listWrapper style="overflow:auto;max-height:18rem">
                <table style="border-collapse:collapse">
                    <thead>
                        <tr>
                            <th>Event
                            <th>Target
                            <th>Phase
                    <tbody>
                </table>
            </div>`;
        this.tbody = this.into.querySelector('tbody');

        this.into.querySelector('.-clearbtn').addEventListener('click', () => this.clear() );
    }
    clear(){
        this.tbody.innerHTML = '';
    }
    scrollToEnd() {
        const div = this.into.querySelector('.-listWrapper');
        div.scrollTop = div.scrollHeight;
//        this.into.querySelector('div').scrollTo({
    }
    start() {
        this.clear();
        let grow = 1;
        let activeTr = null;
        setInterval(() => {
            if (!activeTr || grow > 20) return;
            activeTr.style.borderBottomWidth = (grow++)+'px';
            this.scrollToEnd();
        },700);
        let renderEvent = (event)=>{
            let tr = document.createElement('tr');
            activeTr = tr;
            grow = 0;
            tr.style.borderBottom = '0px solid black';
            tr.innerHTML = `<td>${event.type}<td>&lt;${event.target.tagName.toLowerCase()}&gt;<td>${event.eventPhase}<td class=-dump><button style="font-size:12px; margin:0">inspect</button>`;

            tr.querySelector('.-dump').addEventListener('click', () => {
                alert({body:dump(event, {depth:2, customRender})});
                dump(event, {depth:2})
            });

            this.tbody.append(tr);
            this.scrollToEnd();
        }
        for (const ev of this.events) {
            //this.el.addEventListener(ev, renderEvent, false);
            this.el.addEventListener(ev, renderEvent, true);
        }
    }
}