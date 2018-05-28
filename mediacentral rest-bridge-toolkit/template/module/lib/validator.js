'use strict';

const Joi = require('joi');

class Validator {
    static validate(type, object, validation) {
        if (type === 'application/json'){
            const errors = applicationJson(object, validation.properties);
            if (errors){
                return {
                    errors
                };
            }
        }
        if (object){
            return {
                payload: object
            };
        }
    }
}

function applicationJson(object, validationScheme) {
    object = object || {};
    validationScheme = validationScheme || {};
    if (!Object.keys(validationScheme).length){
        return ;	
	}
    const joiScheme = {};
    let innerErrors = [];
    for (let prop in validationScheme){
        if (validationScheme.hasOwnProperty(prop) &&
            typeof validationScheme[prop] === 'object'){
            const name = validationScheme[prop].name || prop;
            joiScheme[name] = Joi;
            prop = validationScheme[prop];
            
            prop.type = Array.isArray(prop.type) ? prop.type[0] : prop.type;
            if (prop.type){
                switch (prop.type.toLowerCase()) {
                    case 'number':
                        joiScheme[name] = joiScheme[name].number();
                        break;
                    case 'boolean':
                        joiScheme[name] = joiScheme[name].boolean();
                        break;
                    case 'string':
                        joiScheme[name] = joiScheme[name].string();
                        break;
                    case 'object':
                        joiScheme[name] = joiScheme[name].object();
                        break;
                    case 'array':
                        joiScheme[name] = joiScheme[name].array();
                        break;
                }
            }

            if (prop.minLength){
                joiScheme[name] = joiScheme[name].max(prop.minLength);
            }

            if (prop.maxLength){
                joiScheme[name] = joiScheme[name].max(prop.maxLength);
            }

            if (prop.required){
                joiScheme[name] = joiScheme[name].required();
            }

            if (prop.properties){
                innerErrors = innerErrors.concat((applicationJson(object[name], prop.properties) || [])
                    .map(e=>e.substr(0, 1) + name + "." + e.substr(1)));
            }

            joiScheme[name] = joiScheme[name].allow(null)
        }
    }

    const error = Joi.validate(object, Joi.object().keys(joiScheme)).error;
    const errors = (error || {details: []}).details.map(d=>d.message).concat(innerErrors);
    if (errors.length){
        return errors;
    }
}

module.exports = Validator.validate;