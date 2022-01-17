#!/bin/sh

## for pwa
/usr/bin/inkscape "logo.svg" -w 120  -o "../public/icons/apple-icon-120x120.png"
/usr/bin/inkscape "logo.svg" -w 152  -o "../public/icons/apple-icon-152x152.png"
/usr/bin/inkscape "logo.svg" -w 167  -o "../public/icons/apple-icon-167x167.png"
/usr/bin/inkscape "logo.svg" -w 180  -o "../public/icons/apple-icon-180x180.png"
/usr/bin/inkscape "logo.svg" -w 16  -o "../public/icons/favicon-16x16.png"
/usr/bin/inkscape "logo.svg" -w 32  -o "../public/icons/favicon-32x32.png"
/usr/bin/inkscape "logo.svg" -w 96  -o "../public/icons/favicon-96x96.png"
/usr/bin/inkscape "logo.svg" -w 128  -o "../public/icons/favicon-128x128.png"
/usr/bin/inkscape "logo.svg" -w 128  -o "../public/icons/icon-128x128.png"
/usr/bin/inkscape "logo.svg" -w 192  -o "../public/icons/icon-192x192.png"
/usr/bin/inkscape "logo.svg" -w 256  -o "../public/icons/icon-256x256.png"
/usr/bin/inkscape "logo.svg" -w 384  -o "../public/icons/icon-384x384.png"
/usr/bin/inkscape "logo.svg" -w 512  -o "../public/icons/icon-512x512.png"
/usr/bin/inkscape "logo.svg" -w 144  -o "../public/icons/ms-icon-144x144.png"
cp logo.svg ../public/icons/safari-pinned-tab.svg

## for electron
/usr/bin/inkscape "logo.svg" -w 512  -o "../src-electron/icons/icon.png"

/usr/bin/inkscape "logo.svg" -w 16  -o "icon_16.png"
/usr/bin/inkscape "logo.svg" -w 32  -o "icon_32.png"
/usr/bin/inkscape "logo.svg" -w 48  -o "icon_48.png"
/usr/bin/inkscape "logo.svg" -w 128  -o "icon_128.png"
/usr/bin/inkscape "logo.svg" -w 256  -o "icon_256.png"

convert icon_16.png icon_32.png icon_48.png icon_128.png icon_256.png ../src-electron/icons/icon.ico
# apt install icnsutils -- for mac
png2icns ../src-electron/icons/icon.icns icon_16.png icon_32.png icon_48.png icon_128.png icon_256.png

## for web
convert icon_16.png icon_32.png icon_48.png icon_128.png icon_256.png ../public/favicon.ico

rm -v icon_*.png
