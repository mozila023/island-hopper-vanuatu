#!/bin/sh
# Rebuild index.html from the source parts
cd "$(dirname "$0")/.."
{ cat src/head.html; echo '<script>'; cat src/01-core.js src/02-chars.js src/03-maps.js src/04-objects.js src/05-scenes.js src/06-ui.js src/07-story.js src/08-flow.js; echo '</script>'; } > index.html
