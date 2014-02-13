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
6. Push known-good deploy to Heroku: `git push heroku episode32:master`

To deploy:
----------

1. Run `./jake.sh deploy` (Unix/Mac) or `jake deploy` (Windows)

*Note:* The master and integration branches are not guaranteed to deploy successfully. The last known-good deploy was commit eccf8da793aef7871ab1fcc104b7f64d79986681. We'll establish better deployment practices in a future chapter of the screencast.
