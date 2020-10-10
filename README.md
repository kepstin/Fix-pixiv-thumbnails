# Improve pixiv thumbnails

Stop pixiv from cropping thumbnails to a square. Use higher resolution thumbnails on Retina displays.

I understand English and simple Japanese, please help translate :)

* [Github](https://github.com/kepstin/Fix-pixiv-thumbnails)
* [Changelog](https://github.com/kepstin/Fix-pixiv-thumbnails/releases)

## Example

> [![曙と雨 by ナユヒ](https://github.com/kepstin/Fix-pixiv-thumbnails/raw/master/pixiv-58811811-before-after.png)](https://www.pixiv.net/member_illust.php?mode=medium&illust_id=58811811)
>
> [曙と雨 by ナユヒ](https://www.pixiv.net/member_illust.php?mode=medium&illust_id=58811811)

## Preferences

User preferences can be configured by setting items in the web browser's LocalStorage. To set preferences, go to `www.pixiv.net` and open the Web Inspector (usually `Ctrl-Shift-I`). Type in one of these statements in the Javascript console at the bottom:

To add a preference:
```js
window.localStorage.addItem('Preference name', 'value')
```
To remove a preference:
```js
window.localStorage.removeItem('Preference name')
```

### Allow custom thumbnails

Preference name: `kepstinAllowCustom`

Pixiv allows artists to set custom square crops for thumbnails when they upload the image. If you would like to use custom cropped thumbnails, set the value to `true`

### Override image CDN domain

Preference name: `kepstinOverrideDomain`

By default, images will be loaded from the domain name provided by pixiv. However, you can choose a different CDN to use by setting the value of this preference to a different domain name. This may improve image load speeds overseas. See the [list of domain names](https://github.com/kepstin/Fix-pixiv-thumbnails/blob/master/thumbnail_urls.md#domain-names) for more information.
