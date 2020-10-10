# List of known URLs for pixiv image hosting

## Domain Names

* `i.pximg.net`: Actually a wildcard, `*.pximg.net`. Servers use IP address range from IDC Frontier Inc.
* `i-cf.pximg.net`: Cloudflare CDN services, via DNS delegation.
* `imgaz.pixiv.net`: Backend servers? Using IP address range from IDC Frontier Inc, but different/smaller range than `i.pximg.net`.

## Illustration

Original image is at `https://i.pximg.net/img-original/img/YYYY/MM/DD/HH/MM/SS/NNNNNNNN_pN.jpg`

## Thumbnail

**bold** is unique size for image type

### Preserve aspect ratio

Image path: `…/img-master/img/YYYY/MM/DD/HH/MM/SS/NNNNNNNN_pN_master1200.jpg`

Image path prefixes:
* 100x100: `https://i.pximg.net/c/100x100`
* 128x128: `https://i.pximg.net/c/128x128`
* 150x150: `https://i.pximg.net/c/150x150`
* 240x240: `https://i.pximg.net/c/240x240`
* **240x480**: `https://i.pximg.net/c/240x480`
* 260x260: `https://i.pximg.net/c/260x260_80`
* 360x360: `https://i.pximg.net/c/360x360_70`
* 400x250: `https://i.pximg.net/c/400x250_80`
* 540x540: `https://i.pximg.net/c/540x540_70`
* 600x600: `https://i.pximg.net/c/600x600`
* **600x1200**: `https://i.pximg.net/c/600x1200_90`
* **768x1200**: `https://i.pximg.net/c/768x1200_80`
* 1200x1200: `https://i.pximg.net` (no `/c/` path specified, default size?)

### Square crop

Two possibilities for crop.

Either automatic crop (takes top left corner of image): `…/img-master/img/YYYY/MM/DD/HH/MM/SS/NNNNNNNN_pN_square1200.jpg`

Or uploader-set crop: `…/custom-thumb/img/YYYY/MM/DD/HH/MM/SS/NNNNNNNN_pN_custom1200.jpg`

* 100x100: `https://i.pximg.net/c/100x100`
* 128x128: `https://i.pximg.net/c/128x128`
* 150x150: `https://i.pximg.net/c/150x150`
* 240x240: `https://i.pximg.net/c/240x240`
* **250x250**: `https://i.pximg.net/c/250x250_80_a2`
* 260x260: `https://i.pximg.net/c/260x260_80`
* **288x288**: `https://i.pximg.net/c/288x288_80_a2`
* 360x360: `https://i.pximg.net/c/360x360_70`
* 540x540: `https://i.pximg.net/c/540x540_70`
* 600x600: `https://i.pximg.net/c/600x600`
* **1200x???**: `https://i.pximg.net/c/w1200_q80_a2_g1_u1_cr0:0.076:1:0.677`
* 1200x1200: `https://i.pximg.net` (no `/c/` path specified, default size?)

### Other shapes

* 300x200 crop (used on howto page): `https://i.pximg.net/c/300x200_a2/img-master/img/YYYY/MM/DD/HH/MM/SS/NNNNNNNN_pN_master1200.jpg`

## Notes

All sizes ending in `_a2` provide only cropped image, no original aspect ratio.
Unknown what `_70`, `_80`, and `_90` mean.
