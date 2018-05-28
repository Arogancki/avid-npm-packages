'use strict';

const assert = require('assert');
const qs = require('querystring');
const RestClient = require('node-rest-client').Client;
const validator = require('./validator');

class Base {
    constructor(baseUri) {
        this._client = new RestClient();
        this._baseUri = baseUri;
    }

    _createUrl(path, param_path, param_query) {
        let p = path || '';
        for(let name in param_path) {
            p = p.replace(`{${name}}`, param_path[name])
        }
        return `${this._baseUri}${p}?${qs.stringify(param_query || '')}`;
    }

    _initArgs(args) {
        const _args = args || {};

        const DefaultHeader = Object.freeze({
            "Content-type": "application/json",
            "Accept": "application/json"
        });

        if (!('body' in _args)) {
            _args.body = {};
        }

        if (!('headers' in _args.body)) {
            _args.body.headers = {};
        }

        const props = Object.keys(_args.body.headers).map(name => name.toLowerCase());
        
        for(let name in DefaultHeader) {
            if (props.indexOf(name.toLowerCase()) === -1) {
                _args.body.headers[name] = DefaultHeader[name];
            }
        }

        return _args;
    }

    _request(method, path, args, validations) {

        assert(method);
        assert(method in this._client);

        return new Promise(
            (resolve, reject) => {
                args = this._initArgs(args);
                const url = this._createUrl(path, args.path, args.query);
                this._client[method](url, args.body, (data, response) => {
                    let responseContentType = response.headers['content-type'].split(';')[0] || "";
                    if (validations.length){
                        // validation scheme is present
                        for (let validation of validations){
                            if (validation.code === response.statusCode
                                && (!validation.type 
                                    || validation.type.toLowerCase() === responseContentType.toLowerCase())){
                                // params validation 
                                return resolve(
                                    Object.assign({
                                        statusCode: response.statusCode
                                    }, validator(responseContentType, data, validation))
                                );
                            }
                        }
                        // no match found
                        return resolve({
                            statusCode: response.statusCode,
                            type: responseContentType,
                            error: `Invalid status code or Content-type`
                        });
                    }
                    // validation object not set
                    return resolve({
                        statusCode: response.statusCode,
                        payload: args.body.headers['Accept'] === 'application/json' ? data : data.toString()
                    }); 
                }).on('error', err => {
                    return reject(err);
                });
            }
        );
    }
    _get(path, args, validation) {
        return this._request('get', path, args, validation);
    }
    _post(path, args, validation) {
        return this._request('post', path, args, validation);
    }
    _put(path, args, validation) {
        return this._request('put', path, args, validation);
    }
    _delete(path, args, validation) {
        return this._request('del', path, args, validation);
    }
}

module.exports = Base;
