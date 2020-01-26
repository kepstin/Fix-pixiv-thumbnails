// ==UserScript==
// @name           Improve pixiv thumbnails
// @name:ja        pixivサムネイルを改善する
// @namespace      https://www.kepstin.ca/userscript/
// @license        MIT; https://spdx.org/licenses/MIT.html
// @version        20190913.5
// @description    Stop pixiv from cropping thumbnails to a square. Use higher resolution thumbnails on Retina displays.
// @description:ja 正方形にトリミングされて表示されるのを防止します。Retinaディスプレイで高解像度のサムネイルを使用します。
// @author         Calvin Walton
// @match          https://www.pixiv.net/
// @match          https://www.pixiv.net/bookmark.php*
// @match          https://www.pixiv.net/bookmark_add.php*
// @match          https://www.pixiv.net/bookmark_new_illust.php*
// @match          https://www.pixiv.net/discovery
// @match          https://www.pixiv.net/discovery/users
// @match          https://www.pixiv.net/howto*
// @match          https://www.pixiv.net/member.php*
// @match          https://www.pixiv.net/member_illust.php*
// @match          https://www.pixiv.net/new_illust.php*
// @match          https://www.pixiv.net/new_illust_r18.php*
// @match          https://www.pixiv.net/ranking.php*
// @match          https://www.pixiv.net/search.php*
// @match          https://www.pixiv.net/stacc*
// @grant          none
// ==/UserScript==

(function() {
    'use strict';

    // The src prefix: scheme and domain
    let src_prefix = 'https://i.pximg.net';
    // The src suffix for thumbnails
    let thumb_suffix = '_master1200.jpg';
    // A regular expression that matches pixiv thumbnail urls
    // Has 3 captures:
    // $1: thumbnail width (optional)
    // $2: thumbnail height (optional)
    // $3: everything in the URL after the thumbnail size up to the image suffix
    let src_regexp = /https?:\/\/i\.pximg\.net(?:\/c\/(\d+)x(\d+)(?:_[^\/]*)?)?\/(?:custom-thumb|img-master)\/(.*)_(?:custom|master|square)1200.jpg/;

    // Create a srcset= attribute on the img, with appropriate dpi scaling values
    function imgSrcset(img, size, url_stuff) {
        img.srcset = `${src_prefix}/c/150x150/img-master/${url_stuff}${thumb_suffix} ${150 / size}x,
                      ${src_prefix}/c/240x240/img-master/${url_stuff}${thumb_suffix} ${240 / size}x,
                      ${src_prefix}/c/360x360_70/img-master/${url_stuff}${thumb_suffix} ${360 / size}x,
                      ${src_prefix}/c/600x600/img-master/${url_stuff}${thumb_suffix} ${600 / size}x,
                      ${src_prefix}/img-master/${url_stuff}${thumb_suffix} ${1200 / size}x`;
        if (150 / size >= window.devicePixelRatio) {
            img.src = `${src_prefix}/c/150x150/img-master/${url_stuff}${thumb_suffix}`;
        } else if (240 / size >= window.devicePixelRatio) {
            img.src = `${src_prefix}/c/240x240/img-master/${url_stuff}${thumb_suffix}`;
        } else if (360 / size >= window.devicePixelRatio) {
            img.src = `${src_prefix}/c/360x360_70/img-master/${url_stuff}${thumb_suffix}`;
        } else if (600 / size >= window.devicePixelRatio) {
            img.src = `${src_prefix}/c/600x600/img-master/${url_stuff}${thumb_suffix}`;
        } else { /* 1200 */
            img.src = `${src_prefix}/img-master/${url_stuff}${thumb_suffix}`;
        }
    }

    function findParentSize(node) {
        let size = 0;
        let e = node;
        while (!size) {
            if (e.attributes.width && e.attributes.height) {
                let width = +e.attributes.width.value;
                let height = +e.attributes.height.value;
                if (width && width > size) { size = width; }
                if (height && height > size) { size = height; }
                return size;
            }
            if (!e.parentElement) {
                console.log("Couldn't find a parent node with size set for", node);
                return size;
            }
            e = e.parentElement;
        }
    }

    function handleImg(node) {
        if (node.dataset.kepstinThumbnail) { return; }

        if (!node.src.startsWith(src_prefix)) { node.dataset.kepstinThumbnail = 'skip'; return; }

        let m = node.src.match(src_regexp);
        if (!m) { node.dataset.kepstinThumbnail = 'bad'; return; }

        let size = findParentSize(node);
        imgSrcset(node, size, m[3]);
        node.style.objectFit = 'contain';

        node.dataset.kepstinThumbnail = 'ok';
    }

    function handleLayoutThumbnail(node) {
        if (node.dataset.kepstinThumbnail) { return; }

        // Check for lazy-loaded images, which have a temporary URL
        // They'll be updated later when the src is set
        if (node.src.startsWith('data:') || node.src.endsWith('transparent.gif')) { return; }

        if (!node.src.startsWith(src_prefix)) { node.dataset.kepstinThumbnail = 'skip'; return; }

        let m = node.src.match(src_regexp);
        if (!m) { node.dataset.kepstinThumbnail = 'bad'; return; }

        let size = Math.max(m[1], m[2]);
        if (!size) { size = 1200 };
        imgSrcset(node, size, m[3]);
        node.width = node.style.width = m[1];
        node.height = node.style.height = m[2];
        node.style.objectFit = 'contain';

        node.dataset.kepstinThumbnail = 'ok';
    }

    function handleDivBackground(node) {
        if (node.dataset.kepstinThumbnail) { return; }

        // Check for lazy-loaded images
        // They'll be updated later when the background image (in style attribute) is set
        if (node.classList.contains('js-lazyload') || node.classList.contains('lazyloaded') || node.classList.contains('lazyloading')) { return; }

        if (node.style.backgroundImage.indexOf(src_prefix) == -1) { node.dataset.kepstinThumbnail = 'skip'; return; }
        let m = node.style.backgroundImage.match(src_regexp);
        if (!m) { node.dataset.kepstinThumbnail = 'bad'; return; }
        let size = Math.max(node.clientWidth, node.clientHeight);

        let parentNode = node.parentElement;
        let img = document.createElement('IMG');
        imgSrcset(img, size, m[3]);
        img.class = node.class;
        img.alt = node.getAttribute('alt');
        img.style.width = node.style.width;
        img.style.height = node.style.height;
        img.style.objectFit = 'contain';
        img.dataset.kepstinThumbnail = 'ok';

        node.replaceWith(img);
    }

    function handleABackground(node) {
        if (node.dataset.kepstinThumbnail) { return; }

        if (node.style.backgroundImage.indexOf(src_prefix) == -1) { node.dataset.kepstinThumbnail = 'skip'; return; }
        let m = node.style.backgroundImage.match(src_regexp);
        if (!m) { node.dataset.kepstinThumbnail = 'bad'; return; }
        let size = Math.max(node.clientWidth, node.clientHeight);

        let img = document.createElement('IMG');
        imgSrcset(img, size, m[3]);
        img.alt = '';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        img.style.position = 'absolute';
        img.dataset.kepstinThumbnail = 'ok';

        node.style.backgroundImage = '';
        node.prepend(img);
    }

    function onetimeThumbnails(parentNode) {
        for (let node of parentNode.querySelectorAll('img')) {
            if (node.parentElement.classList.contains('_layout-thumbnail')) {
                handleLayoutThumbnail(node);
            } else {
                handleImg(node);
            }
        }
        for (let node of parentNode.querySelectorAll('div[style*=background-image]')) {
            handleDivBackground(node);
        }
        for (let node of parentNode.querySelectorAll('a[style*=background-image]')) {
            handleABackground(node);
        }
    }

    function mutationObserverCallback(mutationList, observer) {
        for (let mutation of mutationList) {
            switch (mutation.type) {
                case 'childList':
                    for (let node of mutation.addedNodes) {
                        if (node.nodeName == 'IMG') {
                            handleImg(node);
                        } else if (node.nodeName == 'DIV') {
                            if (node.style.backgroundImage) {
                                handleDivBackground(node);
                            } else {
                                onetimeThumbnails(node);
                            }
                        } else if (node.nodeName == 'A') {
                            if (node.style.backgroundImage) {
                                handleABackground(node);
                            }
                        } else if (node.nodeName == 'SECTION' || node.nodeName == 'LI') {
                            onetimeThumbnails(node);
                        }
                    }
                    break;
                case 'attributes':
                    if (mutation.target.nodeName == 'DIV') {
                        if (mutation.target.style.backgroundImage) {
                            handleDivBackground(mutation.target);
                        }
                    } else if (mutation.target.nodeName == 'IMG') {
                        if (mutation.target.parentElement.classList.contains('_layout-thumbnail')) {
                            handleLayoutThumbnail(mutation.target);
                        }
                    }
                    break;
            }
        }
    }

    if (!window.kepstinThumbnailObserver) {
        onetimeThumbnails(document.firstElementChild);
        window.kepstinThumbnailObserver = new MutationObserver(mutationObserverCallback);
        window.kepstinThumbnailObserver.observe(document.firstElementChild, { childList: true, subtree: true, attributes: true, attributeFilter: [ 'class', 'src' ] });
    }
})();
