# Github Integrations
## Using automated script generation

- Install node.js (tested on v14.15.0) and npm, using your favourite method. 
  - Suggested to use nvm-windows for Windows or nvm for Unix systems.
  - Installation tips [available here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
  - Run `nvm install 14.15.0` to install node v14.15.0 and npm v6.14.8
  - Run the following commands to check that nvm, node and npm is installed with the correct versions
    - `nvm -v` should show at least 14.15.0 is installed (use `nvm use 14.15.0` to use this version of node)
    - `npm -v` should show 6.14.8 is installed and in use
- Open a CMD prompt in administrator mode and browse to the ./app-js directory
- Run the following commands to setup the package dependencies:
  - `npm install`

## Generate test script

- Ensure that the directory .\Releases\vX.XX.XX.XX\docs contains the relevant .md files (example in template folder)
- Run the following command with the version number to generate the PDF file:
- npm run docs {vX.XX.XX.XX}
- File should be generated in .\Releases\vX.XX.XX.XX\docs

## Generate release notes

- Ensure access token is created and placed as plain text in a file
  - e.g. token.txt contains the plain text token in the root directory of the repo clone
- Ensure that the directory .\Releases\vX.XX.XX.XX\docs contains the relevant .md and release.json files (example in template folder)
- Run the following command with the version number to generate the PDF file:
- npm run release {vX.XX.XX.XX} {token location in directory}
- Release should be created in github