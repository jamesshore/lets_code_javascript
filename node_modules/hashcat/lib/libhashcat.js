var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var HTMLProcessor = require('../lib/htmlprocessor');
var lockFile = require('lockfile');
var cleanCSS = require('clean-css');

var proc;
var options;

var hashcatify = function (settings) {

    options = settings;
    options.htmlFile = path.join(process.cwd(),settings.htmlFile);
    options.outputHtmlFile = path.join(process.cwd(),settings.outputHtmlFile);
    console.log(options);
    begin();
};


var begin = function () {

    fs.readFile(options.htmlFile, 'utf8', function (err, data) {

        if(err){
            console.log('Error while reading the file contents: ');
            console.log(err);
            return;
        }

        proc = new HTMLProcessor(path.dirname(options.htmlFile), null, data);
        var sourceHtml = fs.readFileSync(options.htmlFile, {encoding:'utf8'});
        proc.blocks.forEach(function (block) {
            console.log('-----');
            console.log("Processing block for " + block.dest);
            var platform = require('os').platform();
            var prefix = (platform === 'win32') ? 'node ' : '';

            if(block.type=='css')
            {

                try{
                    console.log("Concatenating CSS");
                    var concatenatedCss = '';
                    //Concatenate CSS file contents
                    block.src.forEach(function (css){
                        var fs  = require("fs");
                        concatenatedCss += fs.readFileSync(css).toString();
                    });

                    console.log("Minifying CSS");
                    //Minify using clean-css
                    var minimized = cleanCSS.process(concatenatedCss);
                    fs.writeFileSync(block.dest, minimized);
                }
                catch(e){
                    console.log("ERROR while minifying CSS: ");
                    console.log(e);
                    return;
                }
            }
            else
            {

                try{
                    console.log("Minifying JS");
                    var uglify = require("uglify-js");
                    var uglified = uglify.minify(block.src, {compress:false});
                    fs.writeFileSync(block.dest, uglified.code);
                }
                catch(e){
                    console.log("ERROR while minifying JS: ");
                    console.log(e);
                    return;
                }

            }

            try{
                var fileContents = fs.readFileSync(block.dest, {encoding:'utf8'});

                console.log("Getting hash of file");
                var hash = crypto.createHash('md5').update(fileContents).digest("hex");
                var revPath = (path.join(path.dirname(block.dest), hash.substr(0, 8) + '.' + path.basename(block.dest)));

                console.log("Creating copy with hashed filename");
                fs.createReadStream(block.dest).pipe(fs.createWriteStream(revPath));
            }
            catch(e){
                console.log("ERROR while hashing: ");
                console.log(e);
                return;
            }

            try{
                var blockLine = block.raw.join(proc.linefeed);
                var replacement = blockLine.replace(blockLine, proc.replaceWith(block));
                replacement = replacement.replace(path.basename(block.relativeDest), path.basename(revPath));
                console.log('New reference: ' + replacement);

                lockFile.lockSync('lockfile.lock', {retries:10});

                if(sourceHtml.length <= 0){
                    console.log("ERROR reading " + options.htmlFile + ", it appears to be empty");
                    return;
                }

                sourceHtml = sourceHtml.replace(blockLine, replacement);
            }
            catch(e){
                console.log("ERROR while creating new reference: ");
                console.log(e);
                return;
            }
            finally{
                // Clean up
                lockFile.unlockSync('lockfile.lock');
            }

        });
        console.log("Writing to HTML source file");
        fs.writeFileSync(options.outputHtmlFile, sourceHtml, 'utf8');
        console.log("Hashcat complete")
    });
};


exports.hashcatify = hashcatify;
