Let's Code: Test-Driven Javascript
==================================

"Let's Code: Test-Driven Javascript" is a screencast series focusing on
rigorous, professional web development. For more information, visit
http://letscodejavascript.com .

This repository contains the source code for WeeWikiPaint, the application
being developed in the series.

(Wondering why we check in things like `node_modules` or IDE settings? See "[The Reliable Build](http://www.letscodejavascript.com/v3/blog/2014/12/the_reliable_build)".)


Before building or running for the first time:
-----------------------------------

1. Install [Node.js](http://nodejs.org/download/)
2. Install [Git](http://git-scm.com/downloads)
3. Install [Firefox](http://getfirefox.com) (for smoke tests)
3. Clone source repository: `git clone https://github.com/jamesshore/lets_code_javascript.git`
4. All commands must run from root of repository: `cd lets_code_javascript`

*Note:* If you update the repository (with `git pull` or similar), be sure to erase generated files with `git clean -fdx` first. (Note that this will erase any files you've added, so be sure to check in what you want to keep first.)


Running old episodes:
---------------------

Every episode's source code has an associated `episodeXX` tag. You can check out and run those episodes, but some episodes' code won't work on the current version of Node. You'll need to install the exact version of Node the code was written for.

### To check out an old episode:

1. If you made any changes, check them in.
2. Erase generated files: `git clean -fdx`
3. Reset any changes: `git reset --hard`
4. Check out old version: `git checkout episodeXX` (For example, `git checkout episode200`.)

Compatibility notes:

* Episodes 1-9 don't work on case-sensitive file systems. To fix the problem, rename `jakefile.js` to `Jakefile.js` (with a capital 'J').
* Episodes 37-39 don't work on Windows. A workaround is included in the episode 37 video.


### To change Node versions and run the code:

1. Look at the `engines.node` property of `package.json` to see which version of Node the code runs on. Prior to episode 31, the Node version was documented in `readme.md`. Prior to episode 10, the version wasn't documented; those episodes used v0.6.17.

2. Install the correct version of Node. On Unix and Mac, [n](https://github.com/visionmedia/n) is a convenient tool for switching Node versions. On Windows, you can use [nvmw](https://github.com/hakobera/nvmw).

3. To see how to run the code, look at the episode's `readme.md` or watch the episode in question. Note that some episodes end with non-working code.


### Known version issues:

Node has introduced breaking changes with newer versions. Here are the issues we're aware of. I've included some workarounds, but the best way to run old code is to install the exact version of Node that the code was written for.

* Some episodes include a version of Jake that doesn't run on Node 0.10+. You might be able to resolve this problem by running `npm install jake`.

* Some episodes include a version of NodeUnit that relies on an internal 'evals' module that was removed in Node 0.12. (See Node.js [issue #291](https://github.com/caolan/nodeunit/issues/291).) You might be able to resolve this problem by running `npm install nodeunit`.

* Some episodes include a version of Testacular (now named "Karma") that crashes when you capture a browser in Node 0.10+. There's no easy workaround for this problem, so just install Node 0.8 if you want to run the code in those episodes.

* A few episodes rely on a feature of Node.js streams that was removed in Node 0.10. A workaround is included in the video for the episodes in question.

* Most episodes have a test that checks how [server.close()](http://nodejs.org/api/net.html#net_server_close_callback) handles errors. This behavior was changed in Node 0.12, so the test will fail. (In previous versions, it threw an exception, but now it passes an `err` object to the server.close callback.) You can just delete the test in question, or see [episode 14](http://www.letscodejavascript.com/v3/comments/live/14#comment-1870243150) for a workaround.


To build and test this episode:
-------------------------------

1. Run `./jake.sh karma` (Unix/Mac) or `jake karma` (Windows)
2. Navigate at least one browser to http://localhost:9876
3. Run `./jake.sh loose=true` (Unix/Mac) or `jake loose=true` (Windows)

You can also run `./jake.sh quick loose=true` for a faster but less thorough set of tests.

*Note:* The master branch is not guaranteed to build successfully. For a known-good build (tested on Mac and Windows, and assumed to work on Linux), use the integration branch. To change branches, follow the steps under "Running old episodes" (above), but replace `episodeXX` with `integration` (for the known-good integration branch) or `master` (for the latest code).


To run this episode locally:
----------------------------

1. Run `./jake.sh run` (Unix/Mac) or `jake run` (Windows)
2. Navigate a browser to http://localhost:5000

*Note:* The master branch is not guaranteed to run successfully. For a known-good build, use the integration branch as described above.


To deploy:
----------

Before deploying for the first time:

1. Make sure code is in Git repository (clone GitHub repo, or 'git init' yours)
2. Install [Heroku Toolbelt](https://toolbelt.heroku.com/)
3. Sign up for a [Heroku account](https://id.heroku.com/signup)
4. Run `heroku create <app_name>` (requires git repository and Heroku account)
5. Search codebase for `weewikipaint.herokuapp.com` URLs and change them to refer to `<app_name>`
6. Push known-good deploy to Heroku: `git push heroku episode200:master`

Then, to deploy:

1. Run `./jake.sh deploy` (Unix/Mac) or `jake deploy` (Windows) for instructions

*Note:* The master and integration branches are not guaranteed to deploy successfully. The last known-good deploy was commit 85c35e5ce5387d2814ceeb849e39eee8e5c1847e. We'll establish better deployment practices in a future chapter of the screencast.
