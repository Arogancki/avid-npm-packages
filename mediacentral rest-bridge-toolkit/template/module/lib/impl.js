'use strict';

const Base = require('./base');
const schemes = require('./schemes');

class Impl extends Base {
    constructor(baseUri) {
        super(baseUri);
    }
<% for(var method in ops) {%>
    <%= method -%> (args) {
        return this._<%= ops[method].method %>('<%= ops[method].path %>', args, schemes.<%= method -%>);
    }
<% } %>
}

module.exports = Impl;
