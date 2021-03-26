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


interface State {
    showAll: boolean;
    items: Record<string, 'LIKED' | 'HIDDEN'>;
}

const appStateObservers: ((state: State) => void)[] = [];
let cachedState: State;
let clearCachedStateRequest: ReturnType<typeof setTimeout>;
let refreshRequest: ReturnType<typeof setTimeout>;

function observeAppState(callback: (state: State) => void) {
    appStateObservers.push(callback);
    callback(loadAppState());
}

function updateAppState(callback: (state: State) => State) {
    const newState = callback(loadAppState());
    saveAppState(newState);
    appStateObservers.forEach(callback => callback(newState));
}

function refresh() {
    clearTimeout(refreshRequest);
    refreshRequest = setTimeout(() => window.dispatchEvent(new Event('scroll')), 500);
}

function loadAppState(): State {
    return cachedState || parseJson<State>(localStorage.getItem('__appState'));
}

function saveAppState(state: State) {
    localStorage.setItem('__appState', JSON.stringify(state));
    cachedState = state;
    clearTimeout(clearCachedStateRequest);
    clearCachedStateRequest = setTimeout(() => cachedState = null, 100);
}

function like(title: string) {
    updateAppState(state => ({ ...state, items: { ...state?.items, [title]: 'LIKED' } }));
}

function show(title: string) {
    updateAppState(state => ({ ...state, items: { ...state?.items, [title]: undefined } }));
}

function hide(title: string) {
    updateAppState(state => {
        if (state?.items?.[title] == 'LIKED' && !confirm(`Are you sure you want to hide ${title}?`)) {
            return state;
        }
        return { ...state, items: { ...state?.items, [title]: 'HIDDEN' } };
    });
}

function showAll() {
    updateAppState(state => ({ ...state, showAll: true }));
}

function hideUnwanted() {
    updateAppState(state => ({ ...state, showAll: undefined }));
}


document.querySelectorAll<HTMLLIElement>('.latest-cont .latest-list li')
    .forEach(li => processItem(li));
document.body.appendChild(createToolbar());
observeAppState(() => refresh());

function processItem(li: HTMLLIElement) {
    const title = li.querySelector<HTMLAnchorElement>('a[title]').title;
    li.style.position = 'relative';
    li.appendChild(createItemToolbar(title));

    observeAppState(state => {
        const isHidden = state?.items?.[title] == 'HIDDEN';
        const show = state?.showAll || !isHidden;
        li.style.opacity = isHidden ? '.5' : '';
        li.style.display = show ? '' : 'none';
    });
}

function createItemToolbar(title: string) {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.right = '28px';
    div.style.top = '0';
    div.style.zIndex = '99999';
    div.appendChild(createLikeButton(title));
    div.appendChild(createShowButton(title));
    div.appendChild(createHideButton(title));
    return div;
}

function createLikeButton(title: string) {
    const button = document.createElement('button');
    button.textContent = 'Like';
    button.style.padding = '1px 5px';
    button.onclick = () => like(title);

    observeAppState(state => {
        const show = state?.items?.[title] != 'LIKED';
        button.style.display = show ? '' : 'none';
    });

    return button;
}

function createShowButton(title: string) {
    const button = document.createElement('button');
    button.textContent = 'Show';
    button.style.padding = '1px 5px';
    button.onclick = () => show(title);

    observeAppState(state => {
        const show = state?.items?.[title] == 'HIDDEN';
        button.style.display = show ? '' : 'none';
    });

    return button;
}

function createHideButton(title: string) {
    const button = document.createElement('button');
    button.textContent = 'Hide';
    button.style.padding = '1px 5px';
    button.onclick = () => hide(title);

    observeAppState(state => {
        const show = state?.items?.[title] != 'HIDDEN';
        button.style.display = show ? '' : 'none';
    });

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
    div.appendChild(createShowAllButton());
    div.appendChild(createHideUnwantedButton());
    return div;
}

function createShowAllButton() {
    const button = document.createElement('button');
    button.textContent = 'Show all';
    button.style.padding = '1px 5px';
    button.onclick = () => showAll();

    observeAppState(state => {
        const show = !state?.showAll;
        button.style.display = show ? '' : 'none';
    });

    return button;
}

function createHideUnwantedButton() {
    const button = document.createElement('button');
    button.textContent = 'Hide unwanted';
    button.style.padding = '1px 5px';
    button.onclick = () => hideUnwanted();

    observeAppState(state => {
        const show = state?.showAll;
        button.style.display = show ? '' : 'none';
    });

    return button;
}


function parseJson<T>(str: string): T {
    if (!str) {
        return null;
    }

    try {
        return JSON.parse(str);
    } catch (e) {
        return null;
    }
}