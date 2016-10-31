
'use strict';

var expect = require('chai').expect;
var rewire = require('rewire');
var db = rewire('../db.js');


var mockClient = {
    query: function(str,params, callback) {
        console.log('query');
        expect(str).to.equal('INSERT into comments(comment,image_id,username_comment) VALUES($1,$2,$3) RETURNING id');
        expect(params).to.eql(["hey all",26,'yael']);
        expect(callback).to.be.a('function');
        callback(null, {body: 'hello'});
    }
}

db.__set__('client', mockClient);


describe('insertCommet', function () {

    it('inserts a comment', function (done) {
        db.insertComment("hey all",26,'yael')
        .then(function(result) {
            expect(result).to.deep.equal({body: 'hello'});
            done();
        }).catch(function(err) {
            if(err) {
                console.log(err);
            }
        });

    });
})
