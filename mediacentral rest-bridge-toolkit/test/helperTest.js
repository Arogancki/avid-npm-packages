'use strict'
let should = require('should');
let sut = require('../lib/helper');

describe('Helper', () => {
    it('Should return the path', () => {
        sut.getPath('/my/test/path/').should.equal('/my/test/path/');
    });

    it('Should add the tailing slash when its missing', () => {
        sut.getPath('/my/test/path').should.equal('/my/test/path/');
    });
});