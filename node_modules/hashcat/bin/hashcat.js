#!/usr/bin/env node
var path = require('path');
var fs = require('fs');
var lib = path.join(path.dirname(fs.realpathSync(__filename)), '../lib');
var pjson = require(path.join(path.dirname(fs.realpathSync(__filename)), '../package.json'));

console.log("Hashcat version " + pjson.version);

hcat = require(lib + '/libhashcat.js');

if(process.argv.length < 3 || process.argv[2][0] == '-')
{
    console.log('Usage: hashcat yourfile.html' + '\r\n' + 'See: http://github.com/mendhak/node-hashcat/');
    process.exit(1);
}

var options = {
    htmlFile: process.argv[2],
    outputHtmlFile: process.argv[3] || process.argv[2]
}

hcat.hashcatify(options);
