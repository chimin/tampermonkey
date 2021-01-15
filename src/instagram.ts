// ==UserScript==
// @name         instagram
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.instagram.com/*
// @grant        none
// ==/UserScript==

setInterval(() => processPage(), 100);

function processPage() {
    document.querySelectorAll('img')
        .forEach(e => processImageElement(e));
}


const processedImageElements: HTMLImageElement[] = [];

function processImageElement(img: HTMLImageElement) {
    if (processedImageElements.includes(img)) {
        return;
    }
    processedImageElements.push(img);

    const div = findContainer(img);
    if (!div) {
        return;
    }

    div.appendChild(createViewButton());

    function createViewButton() {
        const button = document.createElement('button');
        button.type = 'button';
        button.innerText = 'View';
        button.style.position = 'absolute';
        button.style.top = '.1rem';
        button.style.right = '.1rem ';
        button.onclick = e => {
            e.preventDefault();
            e.stopPropagation();
            window.open(img.src);
        };
        return button;
    }

    function findContainer(img: HTMLImageElement) {
        return findContainerForNormalImg(img) || findContainerForMultipleImg(img);
    }

    function findContainerForNormalImg(img: HTMLImageElement) {
        const div = img.parentElement?.parentElement?.parentElement;
        return div?.getAttribute('role') == 'button' ? div : undefined;
    }

    function findContainerForMultipleImg(img: HTMLImageElement) {
        const div = img.parentElement?.parentElement?.parentElement?.parentElement;
        return div?.getAttribute('role') == 'button' ? div : undefined;
    }
}