// ==UserScript==
// @name           Improve pixiv thumbnails
// @name:ja        pixivサムネイルを改善する
// @namespace      https://www.kepstin.ca/userscript/
// @license        MIT; https://spdx.org/licenses/MIT.html
// @version        20200321.2
// @updateURL      https://raw.githubusercontent.com/kepstin/Fix-pixiv-thumbnails/master/Fix-pixiv-thumbnails.user.js
// @description    Stop pixiv from cropping thumbnails to a square. Use higher resolution thumbnails on Retina displays.
// @description:ja 正方形にトリミングされて表示されるのを防止します。Retinaディスプレイで高解像度のサムネイルを使用します。
// @author         Calvin Walton
// @match          https://www.pixiv.net/*
// @match          https://dic.pixiv.net/*
// @match          https://en-dic.pixiv.net/*
// @exclude        https://www.pixiv.net/fanbox*
// @grant          none
// ==/UserScript==

// Copyright © 2020 Calvin Walton <calvin.walton@kepstin.ca>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice (including the next paragraph) shall be included in all copies or
// substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
// IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

(function () {
    'use strict';

    // The src suffix for thumbnails
    const thumb_suffix = '_master1200.jpg';
    // A regular expression that matches pixiv thumbnail urls
    // Has 4 captures:
    // $1: domain name
    // $2: thumbnail width (optional)
    // $3: thumbnail height (optional)
    // $4: everything in the URL after the thumbnail size up to the image suffix
    const src_regexp = /https?:\/\/(i[^.]*\.pximg\.net)(?:\/c\/(\d+)x(\d+)(?:_[^\/]*)?)?\/(?:custom-thumb|img-master)\/(.*)_(?:custom|master|square)1200.jpg/;

    // List of image sizes and paths possible for original aspect thumbnail images
    // This must be in order from small to large for the image set generation to work
    const image_sizes = [
        { size: 150, path: '/c/150x150' },
        { size: 240, path: '/c/240x240' },
        { size: 360, path: '/c/360x360_70' },
        { size: 600, path: '/c/600x600' },
        { size: 1200, path: '' }
    ];

    // Generate a list of original thumbnail images in various sizes for an image,
    // and determine a default image based on the display size and screen resolution
    function genImageSet(size, m) {
        let set = [];
        for (const image_size of image_sizes) {
            set.push({
                src: `https://${m.domain}${image_size.path}/img-master/${m.path}${thumb_suffix}`,
                scale: image_size.size / size
            });
        }
        let defaultSrc = null;
        for (const image of set) {
            if (image.scale >= window.devicePixelRatio) {
                defaultSrc = image.src;
                break;
            }
        }
        if (!defaultSrc) {
            defaultSrc = set[set.length - 1].src;
        }
        return { set, defaultSrc };
    }

    // Create a srcset= attribute on the img, with appropriate dpi scaling values
    // Also update the src= attribute to a value appropriate for current dpi
    function imgSrcset(img, size, m) {
        let imageSet = genImageSet(size, m);
        img.srcset = imageSet.set.map(image => `${image.src} ${image.scale}x`).join(', ');
        img.src = imageSet.defaultSrc;
        if (!img.attributes.width && !img.style.width) { img.style.width = `${size}px`; }
        if (!img.attributes.height && !img.style.height) { img.style.height = `${size}px`; }
    }

    // Set up a css background-image with image-set() where supported, falling back
    // to a single image
    function cssImageSet(node, size, m) {
        let imageSet = genImageSet(size, m);
        let cssImageList = imageSet.set.map(image => `url("${image.src}") ${image.scale}x`).join(', ');
        node.style.backgroundSize = 'contain';
        // The way the style properties work, if you try to assign an unsupported value, it does not
        // take effect, but a supported value replaces the old value. So assign in order of worst
        // to best
        // Fallback single image
        node.style.backgroundImage = `url("${imageSet.defaultSrc}")`;
        // webkit/blink prefixed image-set
        node.style.backgroundImage = `-webkit-image-set(${cssImageList})`;
        // CSS4 proposed standard image-set
        node.style.backgroundImage = `image-set(${cssImageList})`;
    }

    // Look for a URL pattern for a thumbnail image in a string and return its properties
    // Returns null if no image found, otherwise a structure containing the domain, width, height, path.
    function matchThumbnail(str) {
        let m = str.match(src_regexp);
        if (!m) { return null; }

        let [_, domain, width, height, path] = m;

        // The 1200 size does not include size in the URL, so fill in the values here when missing
        width = width || 1200;
        height = height || 1200;

        return { domain, width, height, path };
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
            if (!e.parentElement) { return 0; }
            e = e.parentElement;
        }
    }

    function handleImg(node) {
        if (node.dataset.kepstinThumbnail == 'bad') { return; }

        let m = matchThumbnail(node.src);
        if (!m) { node.dataset.kepstinThumbnail = 'bad'; return; }
        if (node.dataset.kepstinThumbnail == m.path) { return; }

        let size = findParentSize(node);
        if (size < 16) { size = Math.max(node.clientWidth, node.clientHeight); }
        if (size < 16) { size = Math.max(m.width, m.height); }
        imgSrcset(node, size, m);
        node.style.objectFit = 'contain';

        node.dataset.kepstinThumbnail = m.path;
    }

    function handleLayoutThumbnail(node) {
        if (node.dataset.kepstinThumbnail == 'bad') { return; }
        // Check for lazy-loaded images, which have a temporary URL
        // They'll be updated later when the src is set
        if (node.src.startsWith('data:') || node.src.endsWith('transparent.gif')) { return; }

        let m = matchThumbnail(node.src);
        if (!m) { node.dataset.kepstinThumbnail = 'bad'; return; }
        if (node.dataset.kepstinThumbnail == m.path) { return; }

        let width = m.width;
        let height = m.height;
        let size = Math.max(width, height);

        node.width = node.style.width = width;
        node.height = node.style.height = height;

        imgSrcset(node, size, m);
        node.style.objectFit = 'contain';

        node.dataset.kepstinThumbnail = m.path;
    }

    function handleDivBackground(node) {
        if (node.dataset.kepstinThumbnail == 'bad') { return; }
        // Check for lazy-loaded images
        // They'll be updated later when the background image (in style attribute) is set
        if (node.classList.contains('js-lazyload') || node.classList.contains('lazyloaded') || node.classList.contains('lazyloading')) { return; }

        let m = matchThumbnail(node.style.backgroundImage);
        if (!m) { node.dataset.kepstinThumbnail = 'bad'; return; }
        if (node.dataset.kepstinThumbnail == m.path) { return; }

        let size = Math.max(node.clientWidth, node.clientHeight);
        if (size == 0) { size = Math.max(m.width, m.height); }

        if (node.firstElementChild) {
            // There's other stuff inside the DIV, don't do image replacement
            cssImageSet(node, size, m);
            node.dataset.kepstinThumbnail = m.path;
            return;
        }

        // Use IMG tags for images!
        let img = document.createElement('IMG');
        imgSrcset(img, size, m);
        img.class = node.class;
        img.alt = node.getAttribute('alt');
        img.style.width = node.style.width;
        img.style.height = node.style.height;
        img.style.objectFit = 'contain';

        img.dataset.kepstinThumbnail = m.path;

        node.replaceWith(img);
    }

    function handleABackground(node) {
        if (node.dataset.kepstinThumbnail == 'bad') { return; }

        let m = matchThumbnail(node.style.backgroundImage);
        if (!m) { node.dataset.kepstinThumbnail = 'bad'; return; }
        if (node.dataset.kepstinThumbnail == m.path) { return; }

        let size = Math.max(node.clientWidth, node.clientHeight);
        if (size == 0) { size = Math.max(m.width, m.height); }

        // Don't do image replacement on A, it breaks the History page
        cssImageSet(node, size, m);
        node.dataset.kepstinThumbnail = m.path;
        return;
    }

    function onetimeThumbnails(parentNode) {
        for (let node of parentNode.querySelectorAll('IMG')) {
            if (node.parentElement.classList.contains('_layout-thumbnail')) {
                handleLayoutThumbnail(node);
            } else {
                handleImg(node);
            }
        }
        for (let node of parentNode.querySelectorAll('DIV[style*=background-image]')) {
            handleDivBackground(node);
        }
        for (let node of parentNode.querySelectorAll('A[style*=background-image]')) {
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
                        } else if (node.nodeName == 'SECTION' || node.nodeName == 'LI' || node.nodeName == 'FIGURE') {
                            onetimeThumbnails(node);
                        }
                    }
                    break;
                case 'attributes':
                    if (mutation.target.nodeName == 'DIV') {
                        if (mutation.target.style.backgroundImage) {
                            handleDivBackground(mutation.target);
                        }
                    } else if (mutation.target.nodeName == 'A') {
                        if (mutation.target.style.backgroundImage) {
                            handleABackground(mutation.target);
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
        window.kepstinThumbnailObserver.observe(document.firstElementChild, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'src', 'style']
        });
    }
})();
