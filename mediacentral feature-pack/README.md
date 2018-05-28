# Motivation
A feature pack tool for mediacentral cloud-ux projects

## Usage

1. As a CLI (Install globally)

    npm i -g mediacentral-feature-pack
  
2. As a js module

```js
const fp = require('mediacentral-feature-pack')
fp(options)
```

## CLI tool help page  

Options:  
  --version       a version tag                             [boolean] [required]  
  --help          Show help                                            [boolean]  
  -m, --metadata  path to a metadata file based on the feature pack definition [required]  
  -h, --helm      path to a helm chart file                           [required]  
  -d, --docker    a docker image file with the contents of build      [required]  
  -t, --tag       a version tag                                       [required]  
  -o, --output    an output directory                                    [default: "."]  

## Api

### `fp([, options])`

Parameters  

- `options` -- options object with keys:  
  - `metadata` -- path to a metadata file based on the feature pack definition  
  - `helm` -- path to a helm chart file  
  - `docker` -- a docker image file with the contents of build  
  - `tag` -- a version tag  
  - `output` -- an output directory 
  