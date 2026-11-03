#!/bin/sh
# Rebuild index.html from the source parts
cd "$(dirname "$0")/.."
{ echo '<!doctype html>'; echo '<html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"><meta name="theme-color" content="#c4513a"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="description" content="Island Hopper Vanuatu - เกมพิกเซลเที่ยว 6 เกาะวานูอาตู"></head><body>'
  cat src/head.html; echo '<script>'
  cat src/00-assets.js src/01-core.js src/02-chars.js src/03-maps.js src/04-objects.js src/05-scenes.js src/06-ui.js src/07-story.js src/07b-extras.js src/08-flow.js
  echo '</script></body></html>'; } > index.html
