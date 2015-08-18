var fs = require("fs");
var path = require("path");
var crypto = require("crypto");
var debug = require("debug")("hashcat");
var HTMLProcessor = require("../lib/htmlprocessor");

exports.hashcatify = function hashcatify(options) {
    var inputFile = path.join(process.cwd(), options.htmlFile);
    var outputFile = path.join(process.cwd(), options.outputHtmlFile);
    var sourceHtml = readFileSync(inputFile);

    if (sourceHtml.length <= 0) {
        throw new Error("ERROR reading " + inputFile + ", it appears to be empty");
    }

    var basePath = path.dirname(inputFile);
    var destHtml = processHtml(sourceHtml, basePath);

    debug("Writing to HTML source file");
    fs.writeFileSync(outputFile, destHtml, "utf8");

    debug("Hashcat complete");
};

function processHtml(sourceHtml, basePath) {
    var processedHtml = new HTMLProcessor(basePath, null, sourceHtml);
    var replacements = processedHtml.blocks.map(processBlock(processedHtml));
    return replacements.reduce(replace, sourceHtml);
}

function processBlock(processedHtml) {
    return function (block) {
        debug("-----");
        debug("Processing block for " + block.dest);

        var fileContents = (block.type === "css")
                ? combineCss(block.src)
                : combineJs(block.src);

        debug("Creating copy with hashed filename");
        var revPath = hashFilename(block.dest, fileContents);
        fs.writeFileSync(revPath, fileContents);

        var blockLine = block.raw.join(processedHtml.linefeed);
        var replacement = processedHtml.replaceWith(block);
        replacement = replacement.replace(path.basename(block.relativeDest), path.basename(revPath));
        debug("New reference: " + replacement);

        return {
            source: blockLine,
            dest: replacement
        };
    };
}

function combineCss(sources) {
    var cleanCSS = require("clean-css");

    debug("Concatenating CSS");
    var concatenatedCss = sources.map(readFileSync).reduce(concat, "");

    debug("Minifying CSS");
    return cleanCSS.process(concatenatedCss);
}

function combineJs(sources) {
    var uglify = require("uglify-js");

    debug("Minifying JS");
    var uglified = uglify.minify(sources, {compress: false});
    return uglified.code;
}

function hashFilename(filename, content) {
    debug("Getting hash of file");
    var hash = crypto.createHash("md5").update(content).digest("hex");
    return path.join(path.dirname(filename), hash.substr(0, 8) + "." + path.basename(filename));
}

function readFileSync(file) {
    return fs.readFileSync(file).toString();
}

function concat(a, b) {
    return a + b;
}

function replace(string, replacement) {
    return string.replace(replacement.source, replacement.dest);
}
