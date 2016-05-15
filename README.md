MediaGallery
============

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
5. How to use TypeScript instead of JavaScript for both the main and renderer process code... sorta.
   This is a work in progress, see the notes in the next section.

Notes on TypeScript
-------------------

At the time of this writing, there are very few simple examples online of mixing TypeScript with
Electron, and none that are up to date.  So the current state of my code resulted from a lot of
frustrating trial-and-error, and there is much about it that I don't fully understand.  I would LOVE
any feedback and suggestions that others might offer!

* Unlike most examples that I've found online... I'm using the [typings](https://github.com/typings/typings)
  definition manager (rather than the deprecated [tsd](http://definitelytyped.org/tsd/)) to install the
  type definition files needed by TypeScript to understand Electron and Node.js imports.

  * I ran the following console commands, from the root of this project structure:

`npm install -g typings`

`typings install github-electron --ambient --save`

`typings install node --ambient --save`

* Under the `typings/` subdirectory, `main` and `browser` type definitions are installed... for working
  with native Node.js and client-side code respectively.  At first I tried creating a standard
  `tsconfig.json` file to configure the TypeScript compiler, but it went nuts because `main` and `browser`
  contain a lot of duplicate definitions.

  * Some online advice suggests adding an `exclude` to your `tsconfig.json`, to resolve the duplicates
    by forcing TypeScript to ignore either the `main` or `browser` definitions.  That makes sense in a
    typical project where you are writing native OR browser-based code, but in an Electron project you're
    doing both.

  * Other online advice suggest structuring your project with separate directories (and separate
    `tsconfig.json` files) for the main process stuff and the renderer process stuff.  This feels like it
    might be the best way to go, but setting up a project structure like that is a bit beyond my current
    NPM and TypeScript experience level.  Feedback and suggestions in this area would be especially
    appreciated.

  * Ultimately, I ended up eliminating the `tsconfig.json` file *altogether*... and tweaking the
    `package.json` scripts so that NPM runs the `tsc` compiler on `main.ts` and `renderer.ts` separately.
    This requires putting three-slash directives at the top of both TypeScript files, telling them
    which definitions file to reference.

* I experimented with different types of `import` statements to pull Electron and Node modules into my
  TypeScript files.  Ultimately, what worked is the usual `let electron = require("electron")` statement
  seen in vanilla JavaScript projects.  It works, but I have no idea how TypeScript knows what's going
  on... or why I'm able to reference Node.js globals such as `process` or `__dirname` in the main process
  without any Node.js import statements.

