#!/bin/sh

[ ! -f node_modules/.bin/jake ] && echo "Installing modules:" && npm install
node_modules/.bin/jake $*
