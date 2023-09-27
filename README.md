<p align="center">
   <img src="/readmeImg/logo.svg" alt="codebeamer cards" width="480px"/>
</p>

<p align="center">
  <a href="https://github.com/codeBeamer-Extensions-and-Addons/codebeamer-lucidspark/blob/main/CHANGELOG.md">Changelog</a>
</p>

<h3 align="center">Visualize your codebeamer issues in Lucidspark</h3>

<p align="center">
    This is (going to be) a Plugin for <a href="https://lucidspark.com">Lucidspark</a> that allows you to sync Issues managed on a <a href="https://codebeamer.com">codeBeamer</a> instance, <br/> visualizing them as Cards on your boards.
</p>

# Contribute

Anyone can contribute. Just branch off of `develop` and create a Pull request when your feature is ready.  
If you want to propose a feature or report a bug instead, feel free to create an [Issue](https://github.com/codeBeamer-Extensions-and-Addons/codebeamer-lucidspark/issues).

## Tech Stack

-   The app is written in TypeScript and uses the [React](https://reactjs.org/) UI Framework.
-   Tests are [Cypress](https://cypress.io) Component tests written in TypeScript.

## Local setup

### Repository Structure

```bash
codebeamer-lucidspark/
│
│
├── editorextensions/ (custom extensions that interact with lucidspark)
│ ├── codebeamer-custom-ui/
│ │ ├── modal/
│ │ │ ├── ... (custom React code)
│ │ │ └── ...
│ │ └── ...
│ └── ...
└── ... (other project files)
```

### Setup

```bat
npm i                                                           // install dependencies
npx lucid-package test-editor-extension codebeamer-custom-ui    // run the integration
```

Open a second terminal

```bat
cd editorextensions\codebeamer-custom-ui\modal    // navigate to the custom React code directory
npm run build                                     // build the app with vite
```

To use the locally hosted app on Lucidspark, open a Lucidspark board and enable the `Load local extensions` option in the developer menu.
