# Motivation
A tool to publish a project to avid marketplace

## Usage

1. As a CLI (Install globally)

    npm i -g mediacentral-publish
  
2. As a js module

```js
const publish = require('mediacentral-publish')
publish(options)
```

## CLI tool help page  

Options:  
  --version       Show version number                       [boolean]  
  --help          Show help                                 [boolean]  
  -p, --project  path to a project config file              [required]  
  -n, --name     project name (optional if the name is in a project/src/project.json file under identity.appName)  
  -c, --config   path to a project config file (optional if the config is project/src/project.act)    
  -s, --password password to ssh private key  

## Api

### `publish([, options])`

Parameters

- `options` -- options object with keys:
  - `project` -- path to a project config file  
  - `config` -- path to a project config file (optional if the config is project/src/project.act)  
  - `name` -- project name (optional if the name is in a project/src/project.json file under identity.appName)  
  - `password` -- password to ssh private key  
  - `didProgress` -- A function that runs every time when publish process proceed, takes an error if occured, a name of the current step, an amount of remaining steps and