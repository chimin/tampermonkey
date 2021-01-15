// ==UserScript==
// @name         setnmh
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.setnmh.com/series-*
// @grant        none
// @run-at       document-start
// ==/UserScript==

function waitUntil<T>(success: () => T) {
    return new Promise<T>(resolve => {
        var resolved = false;
        var timer = setInterval(() => {
            if (resolved) {
                return;
            }

            var r = success();
            if (r) {
                resolve(r);
                resolved = true;
                clearInterval(timer);
            }
        }, 1000);
    });
}

var last: Element;

window.addEventListener('message', event => {
    if (window.parent != window) {
        window.parent.postMessage(event.data, '*');
    } else {
        if (!last) {
            const divs = document.querySelectorAll('div.ptview');
            last = divs.item(divs.length - 1);
        }
        if (event.data.outerHTML) {
            const n = last.parentNode.insertBefore(document.createElement('div'), last.nextSibling);
            n.outerHTML = event.data.outerHTML;
            last = undefined;
        }
        if (event.data.loading) {
            const n = last.parentNode.insertBefore(document.createElement('a'), last.nextSibling);
            n.style.display = 'block';
            n.style.textAlign = 'center';
            n.href = event.data.loading;
            n.innerText = event.data.loading;
            last = n;
        }
    }
});

waitUntil(() => document.querySelector('div.ptview>img'))
    .then(img => {
        if (window.parent != window) {
            window.parent.postMessage({ outerHTML: img.parentElement.outerHTML }, '*');
        }
    })
    .then(() => waitUntil(() => document.querySelector<HTMLAnchorElement>('div.setnmh-pagedos>div.setnmh-nextpage:last-child>a')))
    .then(a => a.getAttribute('href') && a)
    .then(a => {
        var iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        document.body.appendChild(iframe);
        iframe.src = a.href;

        console.log('Loading ' + a.href);
        window.parent.postMessage({ loading: a.href }, '*');
    });