// ==UserScript==
// @name           Improve pixiv thumbnails
// @name:ja        pixivサムネイルを改善する
// @namespace      https://www.kepstin.ca/userscript/
// @license        MIT; https://spdx.org/licenses/MIT.html
// @version        20201007.6
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
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
// modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice (including the next paragraph) shall be included in all copies or
// substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
// WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

(function kepstinFixPixivThumbnails () {
  'use strict'

  // Use an alternate domain (CDN) to load images
  // Configure this by setting `kepstinDomainOverride` in LocalStorage
  let domainOverride = null

  // Browser feature detection for CSS 4 image-set
  let imageSetSupported = false
  let imageSetPrefix = ''
  if (CSS.supports('background-image', 'image-set(url("image1") 1x, url("image2") 2x)')) {
    imageSetSupported = true
  } else if (CSS.supports('background-image', '-webkit-image-set(url("image1") 1x, url("image2") 2x)')) {
    imageSetSupported = true
    imageSetPrefix = '-webkit-'
  }

  // The src suffix for thumbnails
  const thumbSuffix = '_master1200.jpg'

  // A regular expression that matches pixiv thumbnail urls
  // Has 4 captures:
  // $1: domain name
  // $2: thumbnail width (optional)
  // $3: thumbnail height (optional)
  // $4: everything in the URL after the thumbnail size up to the image suffix
  // eslint-disable-next-line max-len
  const srcRegexp = /https?:\/\/(i[^.]*\.pximg\.net)(?:\/c\/(\d+)x(\d+)(?:_[^/]*)?)?\/(?:custom-thumb|img-master)\/(.*?)_(?:custom|master|square)1200.jpg/

  // List of image sizes and paths possible for original aspect thumbnail images
  // This must be in order from small to large for the image set generation to work
  const imageSizes = [
    { size: 150, path: '/c/150x150' },
    { size: 240, path: '/c/240x240' },
    { size: 360, path: '/c/360x360_70' },
    { size: 600, path: '/c/600x600' },
    { size: 1200, path: '' }
  ]

  // Generate a list of original thumbnail images in various sizes for an image,
  // and determine a default image based on the display size and screen resolution
  function genImageSet (size, m) {
    const set = imageSizes.map((imageSize) => (
      {
        src: `https://${m.domain}${imageSize.path}/img-master/${m.path}${thumbSuffix}`,
        scale: imageSize.size / size
      }
    ))

    const defaultSrc = set.find((image) => image.scale >= window.devicePixelRatio) || set[set.length - 1]

    return { set, defaultSrc }
  }

  // Create a srcset= attribute on the img, with appropriate dpi scaling values
  // Also update the src= attribute to a value appropriate for current dpi
  function imgSrcset (img, size, m) {
    const imageSet = genImageSet(size, m)
    img.srcset = imageSet.set.map((image) => `${image.src} ${image.scale}x`).join(', ')
    img.src = imageSet.defaultSrc.src
    if (!img.attributes.width && !img.style.width) { img.style.width = `${size}px` }
    if (!img.attributes.height && !img.style.height) { img.style.height = `${size}px` }
  }

  // Set up a css background-image with image-set() where supported, falling back
  // to a single image
  function cssImageSet (node, size, m) {
    const imageSet = genImageSet(size, m)
    const cssImageList = imageSet.set.map((image) => `url("${image.src}") ${image.scale}x`).join(', ')
    node.style.backgroundSize = 'contain'
    node.style.backgroundPosition = 'center'
    node.style.backgroundRepeat = 'no-repeat'
    if (imageSetSupported) {
      node.style.backgroundImage = `${imageSetPrefix}image-set(${cssImageList})`
    } else {
      node.style.backgroundImage = `url("${imageSet.defaultSrc.src}")`
    }
  }

  // Look for a URL pattern for a thumbnail image in a string and return its properties
  // Returns null if no image found, otherwise a structure containing the domain, width, height, path.
  function matchThumbnail (str) {
    const m = str.match(srcRegexp)
    if (!m) { return null }

    let [_, domain, width, height, path] = m

    // The 1200 size does not include size in the URL, so fill in the values here when missing
    width = width || 1200
    height = height || 1200

    if (domainOverride) {
      domain = domainOverride
    }

    return {
      domain, width, height, path
    }
  }

  function cssPx (value) {
    if (!value.endsWith('px')) {
      return NaN
    }
    return +value.replace(/[^\d.-]/g, '')
  }

  function findParentSize (node) {
    let e = node
    while (e.parentElement) {
      let size = Math.max(node.getAttribute('width'), node.getAttribute('height'))
      if (size > 0) { return size }

      size = Math.max(cssPx(node.style.width), cssPx(node.style.height))
      if (size > 0) { return size }

      e = e.parentElement
    }
    e = node
    while (e.parentElement) {
      const cstyle = window.getComputedStyle(node)
      const size = Math.max(cssPx(cstyle.width), cssPx(cstyle.height))
      if (size > 0) { return size }

      e = e.parentElement
    }
    return 0
  }

  function handleImg (node) {
    if (node.dataset.kepstinThumbnail === 'bad') { return }

    const m = matchThumbnail(node.src)
    if (!m) { node.dataset.kepstinThumbnail = 'bad'; return }
    if (node.dataset.kepstinThumbnail === m.path) { return }

    let size = findParentSize(node)
    if (!(size > 16)) { size = Math.max(m.width, m.height) }
    imgSrcset(node, size, m)
    node.style.objectFit = 'contain'

    node.dataset.kepstinThumbnail = m.path
  }

  function handleLayoutThumbnail (node) {
    if (node.dataset.kepstinThumbnail === 'bad') { return }
    // Check for lazy-loaded images, which have a temporary URL
    // They'll be updated later when the src is set
    if (node.src.startsWith('data:') || node.src.endsWith('transparent.gif')) { return }

    const m = matchThumbnail(node.src)
    if (!m) { node.dataset.kepstinThumbnail = 'bad'; return }
    if (node.dataset.kepstinThumbnail === m.path) { return }

    const { width, height } = m
    const size = Math.max(width, height)

    imgSrcset(node, size, m)
    node.style.objectFit = 'contain'

    node.dataset.kepstinThumbnail = m.path
  }

  function handleCSSBackground (node) {
    if (node.dataset.kepstinThumbnail === 'bad') { return }
    // Check for lazy-loaded images
    // They'll be updated later when the background image (in style attribute) is set
    if (
      node.classList.contains('js-lazyload') ||
      node.classList.contains('lazyloaded') ||
      node.classList.contains('lazyloading')
    ) {
      return
    }

    const m = matchThumbnail(node.style.backgroundImage)
    if (!m) { node.dataset.kepstinThumbnail = 'bad'; return }
    if (node.dataset.kepstinThumbnail === m.path) { return }

    node.style.backgroundImage = ''
    let size = Math.max(cssPx(node.style.width), cssPx(node.style.height))
    if (!(size > 0)) {
      const cstyle = window.getComputedStyle(node)
      size = Math.max(cssPx(cstyle.width), cssPx(cstyle.height))
    }
    if (!(size > 0)) { size = Math.max(m.width, m.height) }

    cssImageSet(node, size, m)
    node.dataset.kepstinThumbnail = m.path
  }

  function onetimeThumbnails (parentNode) {
    parentNode.querySelectorAll('IMG').forEach((node) => {
      if (node.parentElement.classList.contains('_layout-thumbnail')) {
        handleLayoutThumbnail(node)
      } else {
        handleImg(node)
      }
    })
    parentNode.querySelectorAll('DIV[style*=background-image]').forEach((node) => {
      handleCSSBackground(node)
    })
    parentNode.querySelectorAll('A[style*=background-image]').forEach((node) => {
      handleCSSBackground(node)
    })
  }

  function mutationObserverCallback (mutationList, _observer) {
    mutationList.forEach((mutation) => {
      switch (mutation.type) {
        case 'childList':
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === 'IMG') {
              handleImg(node)
            } else if (
              (node.nodeName === 'DIV' || node.nodeName === 'A') &&
              node.style.backgroundImage
            ) {
              handleCSSBackground(node)
            } else if (
              node.nodeName === 'DIV' || node.nodeName === 'SECTION' || node.nodeName === 'LI' || node.nodeName === 'FIGURE'
            ) {
              onetimeThumbnails(node)
            }
          })
          break
        case 'attributes':
          if (
            (mutation.target.nodeName === 'DIV' || mutation.target.nodeName === 'A') &&
            mutation.target.style.backgroundImage
          ) {
            handleCSSBackground(mutation.target)
          } else if (
            mutation.target.nodeName === 'IMG' &&
            mutation.target.parentElement.classList.contains('_layout-thumbnail')
          ) {
            handleLayoutThumbnail(mutation.target)
          }
          break
        // no default
      }
    })
  }

  function updateSettings () {
    try {
      domainOverride = localStorage.getItem('kepstinDomainOverride')
    } catch (e) {
      console.log(`Error loading Fix-pixiv-thumbnails settings: ${e}`)
    }
  }

  if (!window.kepstinThumbnailObserver) {
    updateSettings()
    // Disabled temporarily? It's inconsistant and there's no UI yet.
    // window.addEventListener('storage', updateSettings);

    onetimeThumbnails(document.firstElementChild)
    window.kepstinThumbnailObserver = new MutationObserver(mutationObserverCallback)
    window.kepstinThumbnailObserver.observe(document.firstElementChild, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'src', 'style']
    })
  }
}())
