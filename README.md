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

<p align="center">
<a href="[https://www.npmjs.com/package/cypress](https://dashboard.cypress.io/projects/61hnzi/runs)">
    <img src="https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/detailed/61hnzi&style=flat&logo=cypress" alt="tests"/>
 </a>
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

## Publishing

In order to bundle the distribution package, run  

```sh
# build custom modal
cd editorextensions/codebeamer-custom-ui/modal
npm run build
cd ../../..

# build & bundle extension
npm run bundle
```

This will create a `package.zip` in the repo root, containing all extensions defined in the `manifest.json`, freshly built.  
The bundling also increments the (minor) version of each included extension.  

## CI/CD

### CD

`.github/workflows/cd.yml` defines a job that runs the [above-described build](#publishing), creating the `package.zip` as a downloadable artifact.  
Mind that in order for the versioning to resolve properly, you need to manually have either bundled or increased the (minor+) version of the extension(s) in question once since the last deployment.  
The pipeline will always produce the version currently in the `manifest.json` + 1 minor increase.

### CI  

Tests are run with cypress. 
