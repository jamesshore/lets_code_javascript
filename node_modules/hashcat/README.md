hashcat [![Build Status](https://travis-ci.org/mendhak/node-hashcat.svg?branch=master)](https://travis-ci.org/mendhak/node-hashcat)
============

A commandline utility to concatenate, minify and cache-bust your Javascript and CSS references in HTML.

It works by parsing the HTML file for special markup.  It then concatenates, minifies, hashes and replaces references to those files.  It is ideal for use with a build tool as part of your CI pipeline.


##Install

    npm install -g hashcat

##Usage

Prepare your references by surrounding them with special comment blocks.

    <!-- #cat app-min.js -->
    <script src="1.js" />
    <script type="text/javascript" src="other-folder/3.js"></script>
    <!-- endcat -->

     <!-- #cat min.css -->
     <link rel="stylesheet" type="text/css" href="first.css"/>
     <link rel="stylesheet" href="second.css" />
     <!-- endcat -->

Pass the HTML file to hashcat

    hashcat app/index.html

After processing, the above reference should be replaced with something like this:

    <link rel="stylesheet" href="ec784ace.min.css" />
    <script src="d41d8cd9.app-min.js"></script>

You can have hashcat output to another file as well

    hashcat app/index.html app/outputFile.html

##How

Hashcat parses the HTML files, looks for the `#cat` blocks and gathers the files up.
The Javascript/CSS files are concatenated and minified into a single file.
A hash of the resulting file's contents is then taken and the first 8 characters are prepended to the file's name.
Finally, the reference blocks in the HTML are replaced with this new file.

The concatenation and minification allow for multiple files during development but a smaller, simpler asset in production.

The hash rename provides cache busting by changing the file name on each deployment if the contents have changed.


##About

This tool is similar to the [grunt-usemin](https://github.com/yeoman/grunt-usemin) task.

In our case, using grunt as part of a CI pipeline meant having to run `npm install` hundreds of times a day which was not desirable.
This standalone tool solves this specific problem by reducing the external dependencies and does not leave the build agent in a transient state.
