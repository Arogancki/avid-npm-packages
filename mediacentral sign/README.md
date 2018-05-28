# Motivation
A tool to sign pointed files or directories with RSA512 hash. 

## Usage

1. As a CLI (Install globally)

    npm i -g mediacentral-sign
  
2. As a js module

```js
const sign = require('mediacentral-sign')
sign(options)
```

## CLI tool help page  

Options:  
  --version       Show version number                       [boolean]  
  --help          Show help                                 [boolean]  
  -k, --key       path to a private key               	[default: "private.key"]  
  -m, --manifest  path to a new or existing manifest file	[default: "./manifest.json"]  
  -f, --file     path to a directory or file to sign		[default: "."]  
  -p, --password  password to the private key  
  -i, --id        developers ID (assigned by Avid)  

## Api

### `sign([, options])`

Parameters

- `options` -- options object with keys:
  - `key` -- path to a private key
  - `manifest` -- path to a new or existing manifest file
  - `file` -- path to a directory or file to sign
  - `password` -- optional, password to the private key 
  - `id` -- optional, developers ID (assigned by Avid)