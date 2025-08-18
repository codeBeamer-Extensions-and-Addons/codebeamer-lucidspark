to run in dev environment:

1. npx lucid-package test-editor-extension codebeamer-custom-ui
2. cd dataconnectors\codebeamer
3. npx nodemon debug-server.ts

extra files needed:
in root dir google.credentials.local
{
"clientId": "",
"clientSecret": ""
}
