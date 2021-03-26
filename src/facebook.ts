// ==UserScript==
// @name         facebook
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.facebook.com/*
// @grant        none
// ==/UserScript==

(() => {
    setInterval(() => processPage(), 200);

    const isProcesseds: unknown[] = [];

    function processPage() {
        document.querySelectorAll<HTMLDivElement>('div[aria-label=More][role=button]')
            .forEach(button => {
                if (registerIsProcessed(button)) {
                    processMoreButton(button);
                }
            });

        document.querySelectorAll<HTMLDivElement>('div[aria-label="Actions for this post"][role=button]')
            .forEach(button => {
                if (registerIsProcessed(button)) {
                    processAdMoreButton(button);
                }
            });

        document.querySelectorAll<HTMLDivElement>('div[role=article]')
            .forEach(div => {
                processArticle(div);
            });
    }

    function registerIsProcessed(e: unknown) {
        if (isProcesseds.includes(e)) {
            return false;
        }

        isProcesseds.push(e);
        return true;
    }

    async function waitUntil<T>(action: () => T) {
        for (let i = 0; i < 30; i++) {
            const r = action();
            if (r) {
                return r;
            }

            await new Promise<void>(resolve => setTimeout(resolve, 1000));
        }
        throw 'Timed out';
    }

    function processMoreButton(button: HTMLDivElement) {
        const mainFeedContainer = button.closest<HTMLDivElement>('div[data-pagelet=MainFeed]');
        if (!mainFeedContainer) {
            return;
        }

        const itemContainer = button.parentElement.parentElement.parentElement.parentElement;
        itemContainer.style.position = 'relative';
        itemContainer.appendChild(createHideButton(button));

        function createHideButton(moreButton: HTMLDivElement) {
            const button = document.createElement('button');
            button.type = 'button';
            button.innerText = 'Hide';
            button.style.position = 'absolute';
            button.style.top = '15px';
            button.style.right = '120px';
            button.addEventListener('click', async () => {
                moreButton.click();

                (await waitUntil(() =>
                    Array.from(document.querySelectorAll<HTMLDivElement>('div[role=menuitem]'))
                        .find(div => Array.from(div.querySelectorAll('span'))
                            .find(span => span.innerText.trim() == 'Hide Video')))).click();
            });
            return button;
        }
    }

    function processAdMoreButton(button: HTMLDivElement) {
        const mainFeedContainer = button.closest<HTMLDivElement>('div[data-pagelet=MainFeed]');
        if (!mainFeedContainer) {
            return;
        }

        const itemContainer = button.parentElement.parentElement.parentElement.parentElement.parentElement;
        itemContainer.style.position = 'relative';
        itemContainer.appendChild(createHideButton(button));

        function createHideButton(moreButton: HTMLDivElement) {
            const button = document.createElement('button');
            button.type = 'button';
            button.innerText = 'Hide';
            button.style.position = 'absolute';
            button.style.top = '15px';
            button.style.right = '120px';
            button.addEventListener('click', async () => {
                moreButton.click();

                (await waitUntil(() =>
                    Array.from(document.querySelectorAll<HTMLDivElement>('div[role=menuitem]'))
                        .find(div => Array.from(div.querySelectorAll('span'))
                            .find(span => span.innerText.trim() == 'Why am I seeing this ad?')))).click();

                (await waitUntil(() => document.querySelector<HTMLElement>('div[aria-label=Hide][role=button]'))).click();

                (await waitUntil(() => document.querySelector<HTMLElement>('div[aria-label=Close][role=button]'))).click();
            });
            return button;
        }
    }

    function processArticle(div: HTMLDivElement) {
        if (div.querySelector('[data-send-to-eff]') || div.parentElement.closest('div[role=article]')) {
            return;
        }

        const url = Array.from(div
            .querySelectorAll<HTMLAnchorElement>('a[role=link]'))
            .find(e => e.href.includes('/posts/') || e.href.includes('/permalink/') || e.href.includes('/permalink.php'))?.href;
        if (!url) {
            return;
        }

        div.style.position = 'relative';
        div.appendChild(createSendToEffButton());

        function createSendToEffButton() {
            const button = document.createElement('button');
            button.type = 'button';
            button.innerText = 'Send to EFF';
            button.style.position = 'absolute';
            button.style.top = '15px';
            button.style.right = '120px';
            button.style.zIndex = '999999999';
            button.setAttribute('data-send-to-eff', '');
            button.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                const webSocket = new WebSocket('ws://localhost:3100');
                webSocket.addEventListener('open', () => {
                    webSocket.send(JSON.stringify({ url, body: div.outerHTML }));
                    webSocket.close();
                    button.innerText = 'Sent';
                });
            });
            return button;
        }
    }
})();