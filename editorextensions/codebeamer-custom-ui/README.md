## Serving

You'll have to open three terminals.

- At the repository root, run  
 ```bash
 npx lucid-package test-editor-extension codebeamer-custom-ui
 ```

- in `editorextensions/codebeamer-custom-ui`, run  

 ```bash
 npm run build:watch
 ```

- in `editorextensions/codebeamer-custom-ui/modal`, run
 ```bash
 npm run build
 ```
 `start` / `review` won't do it, I don't think, because lucid needs the built app in `public/modal`, where it only lands if we hard-build it, with vite at least.
