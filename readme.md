Let's Code: Test-Driven Javascript
==================================

"Let's Code: Test-Driven Javascript" is a screencast series focusing on
rigorous, professional web development. For more information, visit
http://letscodejavascript.com .

This repository contains the source code for WeeWikiPaint, the application
being developed in the series.

Before building for the first time:
-----------------------------------

1. Install [Node.js](http://nodejs.org/download/)
2. Install [Git](http://git-scm.com/downloads)
3. Clone source repository: `git clone https://github.com/jamesshore/lets_code_javascript.git`
4. All commands must run from root of repository: `cd lets_code_javascript`

*Note:* If you update the repository (with `git pull` or similar), be sure to run `npm rebuild` afterwards.

To build:
---------

1. Run `./jake.sh karma` (Unix/Mac) or `jake karma` (Windows)
2. Navigate at least one browser to [http://localhost:8080]()
3. Run `./jake.sh loose=true` (Unix/Mac) or `jake loose=true` (Windows)

*Note:* The master branch is not guaranteed to build successfully. For a known-good build (tested on Mac and Windows, and assumed to work on Linux), use the integration branch:

1. Change to the integration branch: `git checkout integration`
2. Build using the steps above
3. Change back to development branch when you're done: `git checkout master`

Before deploying for first time:
--------------------------------

1. Make sure code is in Git repository (clone GitHub repo, or 'git init' yours)
2. Install [Heroku Toolbelt](https://toolbelt.heroku.com/)
3. Sign up for a [Heroku account](https://id.heroku.com/signup)
4. Run `heroku create <app_name>` (requires git repository and Heroku account)
5. Search codebase for `weewikipaint.herokuapp.com` URLs and change them to refer to <app_name>

To deploy:
----------

1. Run `./jake.sh deploy` (Unix/Mac) or `jake deploy` (Windows)

