MediaGallery
============
> NOTE: Primary development is hosted on GitLab:  https://gitlab.com/steve-perkins/MediaGallery-electron.  If you're
> reading this on GitHub, then note that this repo is a mirror which can sometimes be slightly out of date.

A simple media viewer desktop application, written to explore [Electron](http://electron.atom.io/) and
[TypeScript](http://www.typescriptlang.org/) development.  When complete, this app will support:

1. Opening image or video files by drag-n-drop onto the window, by selection from a `File->Open` menu,
   or from startup parameters (e.g. dragging a file onto the application executable).
2. Recognizing all supported media files in the same directory as the selected file, and letting the
   user scroll through them with buttons or arrow keys.
3. Eventually... zoom and shrink, full-screen mode.

Electron applications involve two "processes".  The "main" process controls the native Electron shell
itself, while the "renderer" process controls the web application that is wrapped by Electron.  In this
project structure, those two processes execute `main.ts` and `renderer.ts` respectively.

So far I've already learned a handful of interesting quirks in Electron development:

1. How to build a native menu bar in the main process.
2. How to communicate from the main process to the renderer process (e.g. only the renderer process
   has access write log messages to the JavaScript console).
3. How to make the renderer process deal with a file that is drag-n-dropped onto the browser window,
   rather than allowing the browser to abandon the web application and load that file instead.
4. How to work with Node.js API's from within the renderer process, allowing your web application to
   escape the usual JavaScript security model constraints and interact directly with the native
   filesystem.
5. How to use TypeScript instead of JavaScript for both the main and renderer process code.

Setup and Running
-----------------

As prerequisites, this project requires Node.js and NPM to be installed, along with the TypeScript compiler (1.8+).
If you don't already have TypeScript installed as a global NPM package, then run this command:

`npm install -g typescript`

Now start by cloning this Git repository:

`git clone https://gitlab.com/steve-perkins/MediaGallery.git`

... and running the following command from the project root directory:

`npm install`

At this point, you can build and launch the application with:

`npm start`

Development Notes
-----------------

The type definition files used by this project are managed by the "typings" TypeScript Definition Manager,
version 1.0 or higher.  It is not necessary to have "typings" installed just to run this application.  However,
if you want to develop on your own fork, and have the ability to update the type definitions, then you'll need
to install "typings" as a global NPM module:

`npm install -g typings`

The type definitions are committed to source control, as the `typings.json` file and the `typings` subdirectory.
To get the latest type definitions, delete that file and subdirectory and replace them by running these two
commands:

`typings install dt~github-electron --save --global`

`typings install dt~node --save --global`

