# Motivation
A tool to upload a feature pack to avid marketplace

## Usage

1. As a CLI (Install globally)

    npm i -g mediacentral-upload
  
2. As a js module

```js
const upload = require('mediacentral-upload')
upload(options)
```

## CLI tool help page  

Options:  
  --version       Show version number                       [boolean]  
  --help          Show help                                 [boolean]  
  -m, --manifest  path to a manifest file           [default: "./manifest.json"]  
  -p, --pack      path to a feature pack to upload                    [required]  
  -i, --id        MyApplication id for your project                   [required]  

## Api

### `upload([, options])`

Parameters

- `options` -- options object with keys:
  - `manifest` -- path to a manifest file
  - `pack` -- path to a feature pack to upload
  - `id` -- MyApplication id for your project