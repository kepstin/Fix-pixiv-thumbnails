# Improve pixiv thumbnails

Stop pixiv from cropping thumbnails to a square. Use higher resolution thumbnails on Retina displays.

***2021-10-27** The [updated Discovery page](https://www.pixiv.net/info.php?id=7477) is already supported. No userscript update is required.*

Please note: this script will increase data usage on mobile devices.

I understand English and simple Japanese, please help translate :)

* [Github](https://github.com/kepstin/Fix-pixiv-thumbnails)
* [Changelog](https://github.com/kepstin/Fix-pixiv-thumbnails/releases)

## Example

> [![曙と雨 by ナユヒ](https://github.com/kepstin/Fix-pixiv-thumbnails/raw/master/pixiv-58811811-before-after.png)](https://www.pixiv.net/member_illust.php?mode=medium&illust_id=58811811)
>
> [曙と雨 by ナユヒ](https://www.pixiv.net/member_illust.php?mode=medium&illust_id=58811811)

## Preferences

User preferences can be configured by setting items in your userscript manager's value storage. (Previously these settings were configured in LocalStorage - they will automatically be migrated).

Before you can edit the settings, you should open `www.pixiv.net` at least once with this script active to initialize the defaults.

The method for editing the settings varies depending on which userscript manager you are using.

* **TamperMonkey**: Open the extension Dashboard then go to the "Installed userscripts" tab and click on the script name. Select the "Storage" tab. If the storage tab doesn't show up, you might need to click the top "Settings" tab and set "Config mode" to "Advanced".
* **ViolentMonkey**: Open the extension Dashboard, and click the Edit button (`</>`) under the script name. Select the "Values" tab at the top of the screen.
* **GreaseMonkey 4**: User preferences are not currently supported. You can edit the script to set the configuration variables.

### Allow custom thumbnails

Preference name: `allowCustom`

Pixiv allows artists to set custom square crops for thumbnails when they upload the image. If you would like to use custom cropped thumbnails, set the value to `true`

### Override image CDN domain

Preference name: `overrideDomain`

By default, images will be loaded from the domain name provided by pixiv. However, you can choose a different CDN to use by setting the value of this preference to a different domain name. This may improve image load speeds overseas. See the [list of domain names](https://github.com/kepstin/Fix-pixiv-thumbnails/blob/master/thumbnail_urls.md#domain-names) for more information.
