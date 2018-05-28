'use strict';

const bus = require('proxy-bal');
const Service = bus.Service;

class ServiceHost extends Service {
    constructor(access, api, impl) {
        super(access, api);
        this._impl = impl;
    }
    
<% for(var method in ops) {-%>
    <%= method -%>(m, responder) {
        <% var path = ((ops[method].path || '').match(/\{[^}]+\}/gi) ||[]).map(s => {return s.replace(/[{}]/gi,'')}).filter(Boolean); -%>
        <% if (path && path.length > 0) { -%>            
            <% for(var i=0; i<path.length; i++) { -%>
            if (!m || !m.paramSet || !m.paramSet.path || !m.paramSet.path.<%= path[i] -%>)  {
                throw new Error('Parameter \'paramSet.path.<%= path[i] -%>\' is required');
            }
            <% } -%>
        <% } -%>
    this._impl.<%= method -%>(m.paramSet)
            .then(result => {                        
                return responder.reply({
                        resultSet: {
                            result: result
                        }
                    });
            })
            .catch(ex => {
                return responder.error(ex);
            });        
    }
<% } -%>
    
}

module.exports = ServiceHost;
