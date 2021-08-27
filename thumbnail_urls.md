# List of known URLs for pixiv image hosting

## Domain Names

* `i.pximg.net`: Actually a wildcard, `*.pximg.net`. Servers in Japan using IP address range from IDC Frontier Inc.
* `i-cf.pximg.net`: Cloudflare global CDN services, via DNS delegation.
* `imgaz.pixiv.net`: Backend servers? Using IP address range from IDC Frontier Inc, but different/smaller range than `i.pximg.net`.

## Illustration

Original image is at `/img-original/img/YYYY/MM/DD/HH/MM/SS/NNNNNNNN_pN.jpg` (or `.png`)

## Thumbnail

Thumbnails are always lossy resized/recompressed images.

The following variants of thumbnails are available:

* **standard**: Scaled thumbnails that preserve aspect ratio. Image path is `…/img-master/img/YYYY/MM/DD/HH/MM/SS/NNNNNNNN_pN_master1200.jpg`
* **square**: Cropped thumbnails to fit a square. Image path is `…/img-master/img/YYYY/MM/DD/HH/MM/SS/NNNNNNNN_pN_square1200.jpg`. If a custom (uploader-provided) crop is available, it will have the image path `…/custom-thumb/img/YYYY/MM/DD/HH/MM/SS/NNNNNNNN_pN_custom1200.jpg`
* **crop**: An endpoint that always crops images. Usually odd/custom sizes. Image path is the same as **standard**.
* **webp**: The images served from this variant are webp. The image paths are unchanged, and still end in `.jpg`.

Image path prefixes:
* 100x100: `/c/100x100` **standard** **square**
* 128x128: `/c/128x128` **standard** **square**
* 150x150: `/c/150x150` **standard** **square**
* 240x240: `/c/240x240` **standard** **square**
* 240x480: `/c/240x480` **standard**
* 250x250: `/c/250x250_80_a2` **square**
* 260x260: `/c/260x260_80` **standard** **square**
* 288x288: `/c/288x288_80_a2` **square**
* 300x200: `/c/300x200_a2` **crop**
* 360x360: `/c/360x360_70` **standard** **square**, `/c/360x360_10_webp` **standard** **square** **webp**
* 400x250: `/c/400x250_80` **standard**
* 540x540: `/c/540x540_70` **standard** **square**, `c/540x540_10_webp` **standard** **square** **webp**
* 600x600: `/c/600x600` **standard**
* 600x1200: `/c/600x1200_90` **standard**, `/c/600x1200_90_webp` **standard** **webp** (**square** gives 600x600)
* 768x1200: `/c/768x1200_80` **standard**
* 1080x600: `/c/1080x600_10_a2_u1_webp` **crop** **webp**
* 1200x1200: *no prefix* **standard** **square**
* 1200x???: `/c/w1200_q80_a2_g1_u1_cr0:N.NNN:N:N.NNN` **crop**

## Notes

All sizes containing in `_a2` provide only cropped image, no original aspect ratio.
Unknown what `_70`, `_80`, and `_90` mean.
