// zzz deno run -A --unstable .\update.repos.json.js
// with username / password:
// deno run -A --unstable ./u1/tools\update.repos.json.js nuxodin yourtoken

let username = Deno.args[0];
let token = Deno.args[1];

if (!username) console.error('GITHUB_USERNAME not set');
if (!token) console.error('GITHUB_TOKEN not set');

let url = 'https://api.github.com/orgs/u1ui/repos?per_page=100';
let headers = new Headers();
headers.append('Authorization', 'Basic ' + btoa(username + ":" + token));

const repos = await fetch(url, {method:'GET', headers}).then(res => res.json());

var data = [];
var reposData = new Map();
for await (let repo of repos) {
    let releasesUrl = repo.releases_url.replace('{/id}','?per_page=1');
    const releases = await fetch(releasesUrl, {method:'GET', headers}).then(res=>res.json());
    const release = releases[0];
    if (!releases[0]) {
        console.warn('no release found for ' + repo.name);
        continue;
    }
    const obj = {
        pushed_at:        repo.pushed_at,
        name:             repo.name,
        description:      repo.description,
        open_issues:      repo.open_issues,
        stargazers_count: repo.stargazers_count,
        release_latest:{
            tag_name:     release.tag_name,
            published_at: release.published_at,
        }
    }

    reposData.set(repo.name, obj);
    data.push(obj)
}

var str = JSON.stringify(data, null, '  ');
const write = Deno.writeTextFile("./u1/repos.json", str);
write.then(() => console.log("File written!"));


// automate contents

const base = './';

import * as fs from 'https://deno.land/std@0.100.0/fs/mod.ts';

for await (const entry of Deno.readDir(base)) {
    if (!entry.isDirectory) continue;

    writeReadMe(entry);

    // const readme = base+entry.name+'/README.md';
    // await fs.ensureFile(readme);
    // let text = await Deno.readTextFile(readme);
    // if (!text.match(/## Demo/)) text += '\n## Demo';
    // try {
    //     let tests = [];
    //     for await (const test of Deno.readDir(`./${entry.name}/tests/`)) tests.push(test);

    //     tests = tests.filter(test=>test.isFile && test.name.endsWith('.html'));
    //     const testsTxt = tests.map(test=>{
    //         return `https://raw.githack.com/u1ui/${entry.name}/main/tests/${test.name}  `;
    //     }).join('\n');
    //     text = text.replace(/## Demo[^#]*/, '## Demo'+(tests.length>1?'s':'')+'\n'+testsTxt+'\n\n');
    //     const write = Deno.writeTextFile(readme, text);
    // } catch(e) {
    //     //console.log(e)
    // }
}


async function writeReadMe(entry) {

    const readme = base+entry.name+'/README.md';
    await fs.ensureFile(readme);
    let text = await Deno.readTextFile(readme);
    text = text.trim();

    const parts = {};

    // split by h2 headings
    const rawParts = text.split(/[\n^]#{1,2} /);
    const intro = rawParts.shift();

    for (let part of rawParts) {
        const lines = part.split('\n');
        let firstLine = lines[0];
        let content = lines.slice(1).join('\n').trim();
        let title = firstLine.replaceAll('#', '').trim();
        parts[title] = content;
    }

    // tmp:
    delete parts.Demo;

    parts.Ussage = await ussagePart(entry);
    parts.Install = installPart(entry);
    parts.Demos = await demoPart(entry);
    parts.About = aboutPart();


    const orderedParts = {};
    if (parts.Features) orderedParts.Features = parts.Features;
    if (parts.Ussage) orderedParts.Ussage = parts.Ussage;
    if (parts.API) orderedParts.API = parts.API;
    if (parts.Install) orderedParts.Install = parts.Install;
    if (parts.Demos) orderedParts.Demos = parts.Demos;
    for (let key of Object.keys(parts)) {
        if (orderedParts[key]) continue;
        if (key === 'About') continue;
        if (key === 'Thanks') continue;
        orderedParts[key] = parts[key];
    }
    if (parts.About) orderedParts.About = parts.About;
    if (parts.Thanks) orderedParts.Thanks = parts.Thanks;

    // remove first 2 lines from into
    let githubData = reposData.get(entry.name);
    let introContent = intro.split('\n').slice(2).join('\n').trim();
    let content = dedent(`
        # ${repoH1(entry)}
        ${githubData?.description}

        ${introContent}
        `)+'\n\n';

    Object.entries(orderedParts).forEach(([key, value])=>{
        if (value) content += `## ${key}\n\n${value}\n\n`;
    })

    Deno.writeTextFile(readme, content);

}






async function ussagePart(entry){
    const name = entry.name;
    const blankName = name.replace(/\.[^.]+$/, '');

    let code = null
    try {
        code = await Deno.readTextFile('./'+entry.name+'/tests/minimal.html');
    } catch(e) {
        console.log(e)
    }
    if (code) code = code.split('<body>')[1];


    let content = '';

    if (code) {
        let js = code.split(/<script[^>]*>/)?.[1]?.split?.('<\/script>')?.[0];
        if (js) {
            content += '```js\n'+dedent(js).trim()+'\n```\n\n';
        }

        let html = code.split('<section>')[1].split('<\/section>')[0];
        if (html) {
            html = dedent(html);
            content += '```html\n'+html+'\n```\n\n';
        }

        let css = code.split(/<style[^>]*>/)?.[1]?.split?.('<\/style>')?.[0];
        if (css) {
            content += '```css\n'+dedent(css).trim()+'\n```\n\n';
        }
    }

    if (name.endsWith('.js')) {
        // let version = reposData.get(entry.name)?.release_latest.tag_name;
        // version = version ? version.replace('v','') : 'x.x.x';
        // let docUrl = `https://doc.deno.land/https://cdn.jsdelivr.net/gh/u1ui/${name}@${version}/${blankName}.js`;
        let docUrl = `https://doc.deno.land/https://cdn.jsdelivr.net/gh/u1ui/${name}@x/${blankName}.js`;
        content += '[doc]('+docUrl+')  \n';
    }

    return content.trim();

}

function installPart(entry, path) {
    const name = entry.name;
    const blankName = name.replace(/\.[^.]+$/, '');

    // let version = reposData.get(entry.name)?.release_latest.tag_name;
    // version = version ? version.replace('v','') : 'x.x.x';
    let version = 'x.x.x';

    let html = '';
    if (name.endsWith('.el')) {
        html = dedent(`
        <link href="https://cdn.jsdelivr.net/gh/u1ui/${name}@${version}/${blankName}.min.css" rel=stylesheet>
        <script src="https://cdn.jsdelivr.net/gh/u1ui/${name}@${version}/${blankName}.min.js" type=module></script>`);
    }
    if (name.endsWith('.class')) {
        html = `<link href="https://cdn.jsdelivr.net/gh/u1ui/${name}@${version}/${blankName}.min.css" rel=stylesheet>`;
    }
    if (name.endsWith('.attr')) {
        html = `<script src="https://cdn.jsdelivr.net/gh/u1ui/${name}@${version}/${blankName}.min.js" type=module></script>`;
    }
    if (name.endsWith('.js')) {
        const js = `import * as module from "https://cdn.jsdelivr.net/gh/u1ui/${name}@${version}/${blankName}.min.js"`;
        return '```js\n'+js+'\n```';
    }
    return html ? '```html\n'+html+'\n```' : null;
}

function repoH1(entry){
    const name = entry.name;
    const blankName = name.replace(/\.[^.]+$/, '');
    if (name.endsWith('.el')) return `&lt;u1-${blankName}&gt; - element`;
    if (name.endsWith('.class')) return `.u1-${blankName} - class`;
    if (name.endsWith('.attr')) return `[u1-${blankName}] - attribute`;
    return name;
}

async function demoPart(entry){
    try {
        let tests = [];
        for await (const test of Deno.readDir(`./${entry.name}/tests/`)) tests.push(test);

        tests = tests.filter(test=>test.isFile && test.name.endsWith('.html'));
        return tests.map(test=>{



            return `[${test.name}](http://gcdn.li/u1ui/${entry.name}@main/tests/${test.name})  `

            //return `[${test.name}](https://raw.githack.com/u1ui/${entry.name}/main/tests/${test.name})  `

            // alternatives:
            // https://gitcdn.link/
            // https://cdn.statically.io/gh/u1ui/ico.el/main/tests/ico-directory.html
            // https://gitcdn.link/repo/u1ui/ico.el/main/tests/ico-directory.html
            // https://www.gitcdn.xyz/repo/u1ui/ico.el/main/tests/ico-directory.html
            // https://ghcdn.rawgit.org/u1ui/ico.el/main/tests/ico-directory.html
            // https://combinatronics.com/u1ui/ico.el/main/tests/ico-directory.html
            //return 'https://htmlpreview.github.io/?' + encodeURI(`https://github.com/u1ui/${entry.name}/blob/main/tests/${test.name}  `);
        }).join('\n');
    } catch(e) {
        //console.log(e)
    }
}
function aboutPart(){
    return dedent(`
        - MIT License, Copyright (c) 2022 <u1> (like all repositories in this organization) <br>
        - Suggestions, ideas, finding bugs and making pull requests make us very happy. ♥
        `);
}


/* helpers */
function dedent(text) {
    text = trimLines(text);
    const lines = text.split('\n');
    const secondLine = lines[0];
    if (!secondLine) return text;
    const indent = secondLine.match(/^\s*/)[0];
    if (indent.length === 0) return text;
    return lines.map(line=>line.replace(new RegExp(`^${indent}`), '')).join('\n').trim();
}
function trimLines(text){
    const lines = text.split('\n');
    while(1) {
        const line = lines[0];
        if (line==null) break;
        if (line.match(/^\s*$/)) lines.shift();
        else break;
    }
    return lines.join('\n');
}
