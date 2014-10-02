Let's Code: Test-Driven Javascript
==================================

"Let's Code: Test-Driven Javascript" is a screencast series focusing on
rigorous, professional web development. For more information, visit
http://letscodejavascript.com .

This repository contains the source code for WeeWikiPaint, the application
being developed in the series.

Before building or running for the first time:
-----------------------------------

1. Install [Node.js](http://nodejs.org/download/)
2. Install [Git](http://git-scm.com/downloads)
3. Clone source repository: `git clone https://github.com/jamesshore/lets_code_javascript.git`
4. All commands must run from root of repository: `cd lets_code_javascript`

*Note:* If you update the repository (with `git pull` or similar), be sure to erase generated files with `git clean -fdx` afterwards. (Note that this will erase any files you've added, so be sure to check in what you want to keep first.)

A note about Node versions:
------------------

Some episodes' source code was written for old versions of Node. You can check which version of Node the code expects by running `./jake.sh nodeVersion`, or `jake nodeVersion` on Windows. The build will fail if you're using a different version than expected. (Episodes 1-16 didn't support that command. They expected v0.6.17 or v0.8.4; either should work.)

If you're having trouble getting the code to work properly, especially if the code expects Node 0.8 or earlier, try installing the exact version of Node the code expects. Convenient tools for changing Node versions include [nvm](https://github.com/creationix/nvm) and [n](https://github.com/visionmedia/n) on Mac/Linux, and [nvmw](https://github.com/hakobera/nvmw) and [nodist](https://github.com/marcelklehr/nodist) on Windows.


To build and test:
------------------

1. Run `./jake.sh karma` (Unix/Mac) or `jake karma` (Windows)
2. Navigate at least one browser to http://localhost:9876
3. Run `./jake.sh loose=true` (Unix/Mac) or `jake loose=true` (Windows)

*Note:* The master branch is not guaranteed to build successfully. For a known-good build (tested on Mac and Windows, and assumed to work on Linux), use the integration branch:

1. Change to the integration branch: `git checkout integration`
2. Erase generated files: `git clean -fdx` (Note that this will erase *all* new files, so be sure to check in anything you want to keep.)
3. Stop Karma, if it's running
4. Build using the steps above
5. To change back to the development branch, follow these steps again using `git checkout master`

To run locally:
---------------

1. Run `./jake.sh run` (Unix/Mac) or `jake run` (Windows)
2. Navigate a browser to http://localhost:5000

*Note:* The master branch is not guaranteed to run successfully. For a known-good build, use the integration branch as described above.

Before deploying for first time:
--------------------------------

1. Make sure code is in Git repository (clone GitHub repo, or 'git init' yours)
2. Install [Heroku Toolbelt](https://toolbelt.heroku.com/)
3. Sign up for a [Heroku account](https://id.heroku.com/signup)
4. Run `heroku create <app_name>` (requires git repository and Heroku account)
5. Search codebase for `weewikipaint.herokuapp.com` URLs and change them to refer to `<app_name>`
6. Push known-good deploy to Heroku: `git push heroku episode200:master`

To deploy:
----------

1. Run `./jake.sh deploy` (Unix/Mac) or `jake deploy` (Windows) for instructions

*Note:* The master and integration branches are not guaranteed to deploy successfully. The last known-good deploy was commit 85c35e5ce5387d2814ceeb849e39eee8e5c1847e. We'll establish better deployment practices in a future chapter of the screencast.
