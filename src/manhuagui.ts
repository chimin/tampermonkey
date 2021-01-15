// ==UserScript==
// @name         manhuagui
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        https://www.manhuagui.com/update/*
// @grant GM_setValue
// @grant GM_getValue
// ==/UserScript==

declare function GM_getValue(key: string): string;
declare function GM_setValue(key: string, value: string): void;

let notifyUpdateTimer: ReturnType<typeof setTimeout>;

document.querySelectorAll<HTMLLIElement>('.latest-cont .latest-list li')
    .forEach(li => {
        const title = li.querySelector<HTMLAnchorElement>('a[title]').title;
        li.style.position = 'relative';
        li.appendChild(createCloseButton(li, title));
    });

document.body.appendChild(createToolbar());
update();

function createCloseButton(li: HTMLLIElement, title: string) {
    const button = document.createElement('button');
    button.textContent = 'X';
    button.style.padding = '1px 5px';
    button.style.position = 'absolute';
    button.style.top = '0';
    button.style.right = '28px';
    button.style.zIndex = '99999';
    button.onclick = e => getHideList().includes(title) ? show(title) : hide(title);
    return button;
}

function createToolbar() {
    const div = document.createElement('div');
    div.style.backgroundColor = '#fff';
    div.style.padding = '10px';
    div.style.position = 'fixed';
    div.style.right = '10px';
    div.style.bottom = '10px';
    div.style.zIndex = '999999';
    div.appendChild(createToggleButton());
    return div;
}

function createToggleButton() {
    const button = document.createElement('button');
    button.textContent = 'Toggle';
    button.style.padding = '1px 5px';
    button.onclick = () => toggleHide();
    return button;
}

function shouldHide() {
    return (GM_getValue('shouldHide') || '1') == '1';
}

function toggleHide() {
    GM_setValue('shouldHide', !shouldHide() ? '1' : '0');
    update();
}

function getHideList() {
    return parseJson<string[]>(GM_getValue('hideList')) || [];
}

function hide(title: string) {
    let list = getHideList();
    list = list.filter(a => a != title).concat(title);
    GM_setValue('hideList', JSON.stringify(list));
    update();
}

function show(title: string) {
    let list = getHideList();
    list = list.filter(a => a != title);
    GM_setValue('hideList', JSON.stringify(list));
    update();
}

function clear() {
    localStorage.removeItem('hideList');
    update();
}

function update() {
    const hideList = getHideList();
    const nowShouldHide = shouldHide();
    document.querySelectorAll<HTMLLIElement>('.latest-cont .latest-list li')
        .forEach(li => {
            const title = li.querySelector<HTMLAnchorElement>('a[title]').title;
            if (nowShouldHide && hideList.includes(title)) {
                li.style.display = 'none';
            } else {
                li.style.display = '';
                li.style.opacity = hideList.includes(title) ? '.3' : '';
            }

            clearTimeout(notifyUpdateTimer);
            notifyUpdateTimer = setTimeout(() => window.dispatchEvent(new Event('scroll')), 500);
        });
}

function parseJson<T>(str: string): T {
    try {
        return JSON.parse(str);
    } catch (e) {
        return null;
    }
}