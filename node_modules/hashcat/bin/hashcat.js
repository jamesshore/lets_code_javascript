#!/usr/bin/env node

var GetOpt = require("node-getopt");
var path = require("path");
var fs = require("fs");

var binDir = path.dirname(fs.realpathSync(__filename));
var libDir = path.join(binDir, "../lib");
var pjson = require(path.join(binDir, "../package.json"));

var getopt = GetOpt
        .create([
            ["h", "help",    "Display this help"],
            ["v", "verbose", "Enable debug output"]
        ])
        .setHelp([
            "Hashcat version " + pjson.version,
            "",
            "Usage: node " + path.basename(__filename) + " [OPTION] inputFile [outputFile]",
            "",
            "[[OPTIONS]]",
            "",
            "http://github.com/mendhak/node-hashcat/"
        ].join("\n"))
        .bindHelp();
var opt = getopt.parseSystem();

if (opt.argv.length < 1) {
    getopt.showHelp();
    process.exit(1);
}

if (opt.options.verbose) {
    process.env.DEBUG = "*";
}

var hcat = require(libDir + "/libhashcat.js");
var htmlFile = opt.argv[0];
var outputHtmlFile = opt.argv[1] || htmlFile;

hcat.hashcatify({
    htmlFile: htmlFile,
    outputHtmlFile: outputHtmlFile
});
