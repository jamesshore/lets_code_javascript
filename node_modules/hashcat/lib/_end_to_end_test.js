"use strict";

var test = require("tape");
var temp = require("temp");
var path = require("path");
var fs = require("fs");
var exec = require("sync-exec");

// --------------------------------------------------
var htmlSource = [
    "<!DOCTYPE html>",
    "<html>",
    "  <head>",
    "    <!-- #cat assets/min.css -->",
    "    <link rel=\"stylesheet\" href=\"first.css\"/>",
    "    <link rel=\"stylesheet\" href=\"css/second.css\" />",
    "    <!-- endcat -->",
    "",
    "    <!-- #cat assets/min.js -->",
    "    <script src=\"first.js\"></script>",
    "    <script src=\"js/second.js\"></script>",
    "    <!-- endcat -->",
    "  </head>",
    "  <body>",
    "  </body>",
    "</html>"
].join("\n");

// --------------------------------------------------
var expectedHtmlOutput = [
    "<!DOCTYPE html>",
    "<html>",
    "  <head>",
    "    <link rel=\"stylesheet\" href=\"assets/376733a7.min.css\" />",
    "",
    "    <script src=\"assets/9c105d47.min.js\"></script>",
    "  </head>",
    "  <body>",
    "  </body>",
    "</html>"
].join("\n");

// --------------------------------------------------
var firstCss = [
    "body {",
    "  color: red;",
    "}"
].join("\n");

// --------------------------------------------------
var secondCss = [
    "h1 {",
    "  margin: 0;",
    "}"
].join("\n");

// --------------------------------------------------
var firstJs = [
    "function hello(subject) {",
    "  return 'Hello, ' + subject + '!';",
    "}"
].join("\n");

// --------------------------------------------------
var secondJs = [
    "console.log(hello('World'));"
].join("\n");


test("End-to-end success", function (assert) {
    temp.track();

    try {
        var tmpDir = temp.mkdirSync("hashcat-test-");
        var tmpPath = path.relative(process.cwd(), tmpDir);

        fs.mkdirSync(path.join(tmpPath, "css"));
        fs.mkdirSync(path.join(tmpPath, "js"));
        fs.mkdirSync(path.join(tmpPath, "assets"));

        fs.writeFileSync(path.join(tmpPath, "index.html"), htmlSource);
        fs.writeFileSync(path.join(tmpPath, "first.css"), firstCss);
        fs.writeFileSync(path.join(tmpPath, "css", "second.css"), secondCss);
        fs.writeFileSync(path.join(tmpPath, "first.js"), firstJs);
        fs.writeFileSync(path.join(tmpPath, "js", "second.js"), secondJs);

        var binary = path.join("bin", "hashcat.js");
        var inputFile = path.join(tmpPath, "index.html");
        var outputFile = path.join(tmpPath, "output.html");
        var result = exec("node " + binary + " " + inputFile + " " + outputFile);

        var htmlOutput = fs.readFileSync(outputFile).toString();
        var combinedCssFile = path.join(tmpPath, "assets", "376733a7.min.css");
        var combinedJsFile = path.join(tmpPath, "assets", "9c105d47.min.js");

        assert.equal(result.status, 0, "should exit with status code 0");
        assert.equal(htmlOutput, expectedHtmlOutput, "should transform HTML source");
        assert.ok(fs.existsSync(combinedCssFile), "should create combined CSS file");
        assert.ok(fs.existsSync(combinedJsFile), "should create combined JS file");

        assert.end();
    }
    finally {
        temp.cleanupSync();
    }
});

test("End-to-end failure", function (assert) {
    temp.track();

    try {
        var tmpDir = temp.mkdirSync("hashcat-test-");
        var tmpPath = path.relative(process.cwd(), tmpDir);

        fs.writeFileSync(path.join(tmpPath, "index.html"), htmlSource);

        var binary = path.join("bin", "hashcat.js");
        var inputFile = path.join(tmpPath, "index.html");
        var result = exec("node " + binary + " " + inputFile);

        assert.notEqual(result.status, 0, "should report error code");

        assert.end();
    }
    finally {
        temp.cleanupSync();
    }
});
