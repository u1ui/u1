import {render, html, svg} from 'https://unpkg.com/uhtml@2.8.0/esm/index.js?module';
import {repos, latestUrlCached, latestUrl, parseUrl} from './u1.js';

export function open(){
    if (window['u1-config'] && !window['u1-config'].closed) window['u1-config'].close();

    const win = window.open('about:blank', 'u1-config', 'popup,width=800,height=640');
    win.focus()
    const doc = win.document;

    doc.write (
        `<!DOCTYPE html>
        <html lang=en>
            <head>
                <meta charset=utf-8>
                <script>import('https://cdn.jsdelivr.net/gh/u1ui/u1/auto.min.js')<\/script>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/u1ui/ico.el@x.x.x/font/Material Icons.css">
                <style>
                    html {
                        font-size:14px;
                        padding:2rem;
                    }
                    body {
                        font-size:inherit;
                    }
                    pre {
                        font-size:12px;
                        max-height:70vh;
                    }
                </style>
            <body>`
    );

    setTimeout(()=>{
        renderUi(doc.body);
    }, 10);

}

async function renderUi(el){
    const code = await exportCode();
    const repoVersions = await versionCheck();
    render(el,
        html`
        <details>
            <summary>Versioncheck</summary>
            <div style="overflow:auto; max-height:70vh">
                <table>
                    <thead>
                        <th>Repo
                        <th>New version
                        <th>Old version
                    <tbody>
                    ${Object.entries(repoVersions).map(([repo, v])=>{
                        return html`
                        <tr>
                            <td>${repo}
                            <td>${v.newVersion}
                            <td>${v.oldVersions.map(data=>{
                                return html`
                                <span style="display:inline-block">${data.vers||'no version'}
                                    <button title="view in console" onclick="${()=>console.log(data.node)}" class=u1-unstyle><u1-ico>info</u1-ico></button>
                                </span> &nbsp; `
                            })}
                            `
                    })}
                </table>
            </div>
        </details>
        <details>
            <summary>needed HTML</summary>
            <pre>${code}</pre>
        </details>
        `
    );
}




const needed = window.u1.needed;


const exportCode = async function(){
    await repos();
    let strCss = Object.entries(needed.css).filter(([,prio])=>prio===1).map(([url,prio])=>'<link href="'+latestUrlCached(url)+'" rel="stylesheet" crossorigin>').join('\n');
    let strJs  = Object.entries(needed.js).map(([url,prio])=>'<script src="'+latestUrlCached(url)+'" type=module crossorigin></script>').join('\n');
    let strCssNonCritical = Object.entries(needed.css).filter(([,prio])=>prio>1).map(([url,prio])=>'<link rel="stylesheet" href="'+latestUrlCached(url)+'" crossorigin>').join('\n');
    return strCss +'\n' + strJs + '\n' + '\n<!-- non critical at the end -->\n' + strCssNonCritical;
}


const versionCheck = async function(){
    await repos();
    const urls = [];
    document.querySelectorAll('script').forEach(el=>{
        urls.push({url:el.src, node:el});
    })
    document.querySelectorAll('link[rel=stylesheet]').forEach(el=>{
        urls.push({url:el.href,node:el});
    })

    const reposObj = {};
    urls.forEach(obj=>{
        const {url, node} = obj;
        if (!url.match('u1ui')) return;
        const newUrl = latestUrlCached(url);
        if (!newUrl) return;
        if (newUrl === url) return;

        const {repo, oldVers} = parseUrl(url);
        const newVers = parseUrl(newUrl).vers;
        if (oldVers === newVers) return;
        reposObj[repo] ??= {}
        reposObj[repo].newVersion = newVers;
        reposObj[repo].oldVersions ??= [];
        reposObj[repo].oldVersions.push({oldVers, node});
    });
    return reposObj;
}
