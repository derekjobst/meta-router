var expect = require('chai').expect;
var nodePath = require('path');

describe('matcher' , function() {
    it('should match sample routes correctly', function() {
        var metaRouter = require('../');
        var matcher = metaRouter.buildMatcher([
            {
                "path": "GET /users/:user",
                "handler": function(req, res) {
                    res.end('Hello user: ' + req.params.user);
                },
                // Arbitrary metadata:
                "foo": "bar"
            },
            {
                path: "POST /users/:user/picture",
                handler: function(req, res) {
                    res.end('User profile picture updated!');
                }
            }
        ]);

        var match = matcher.match('/users/123', 'GET');
        expect(match != null).to.equal(true);
        expect(match.path).to.equal('/users/123');
        expect(match.params).to.deep.equal({ user: '123' });
        expect(match.config.path).to.equal('/users/:user');
        expect(match.config.handler).to.be.a('function');
        expect(match.config.methods).to.deep.equal(['GET']);
        expect(match.config.foo).to.equal('bar');

        match = matcher.match('/usersINVALID/123', 'GET');

        expect(match == null).to.equal(true);

        match = matcher.match('/users/123', 'POST');
        expect(match == null).to.equal(true);

        match = matcher.match('/users/123/picture', 'POST');
        expect(match != null).to.equal(true);
        expect(match.path).to.equal('/users/123/picture');
        expect(match.params).to.deep.equal({ user: '123' });
        expect(match.config.path).to.equal('/users/:user/picture');
        expect(match.config.handler).to.be.a('function');
        expect(match.config.methods).to.deep.equal(['POST']);

    });

    it('should allow exact matches', function() {
        var metaRouter = require('../');
        var matcher = metaRouter.buildMatcher([
            {
                "path": "GET /exact",
                "handler": function(req, res) {
                    res.end('Hello user: ' + req.params.user);
                },
                "foo": "bar"
            }
        ]);

        var match = matcher.match('/exact', 'GET');
        expect(match != null).to.equal(true);

        match = matcher.match('/exact/not', 'GET');
        expect(match == null).to.equal(true);
    });

    it('should allow start matches', function() {
        var metaRouter = require('../');
        var matcher = metaRouter.buildMatcher([
            {
                "path": "GET /first",
                "handler": function(req, res) {
                    res.end('Hello user: ' + req.params.user);
                },
                "foo": "bar",
                matchOptions: {
                    end: false
                }
            }
        ]);

        var match = matcher.match('/first', 'GET');
        expect(match != null).to.equal(true);

        match = matcher.match('/first/second', 'GET');
        expect(match != null).to.equal(true);
    });

    it('should provide routes correctly', function() {
        var metaRouter = require('../');
        var matcher = metaRouter.buildMatcher([
            {
                "path": "GET /users/:user",
                "handler": function(req, res) {
                    res.end('Hello user: ' + req.params.user);
                },
                // Arbitrary metadata:
                "foo": "bar"
            },
            {
                path: "POST /users/:user/picture",
                handler: function(req, res) {
                    res.end('User profile picture updated!');
                }
            },
            {
                path: "PATCH,POST /more",
                handler: function(req, res) {
                    res.end('User more things updated');
                }
            },
            {
                path: "ALL /others",
                handler: function(req, res) {
                    res.end('Users support ALL');
                }
            }
        ]);

        var routes = matcher.routes;
        expect(routes.length).to.equal(4);
        expect(routes[0].path).to.equal('/users/:user');
        expect(routes[1].path).to.equal('/users/:user/picture');
        expect(routes[2].path).to.equal('/more');
        expect(routes[3].path).to.equal('/others');
        expect(routes[0].methods.length).to.equal(1);
        expect(routes[1].methods.length).to.equal(1);
        expect(routes[2].methods.length).to.equal(2);
        expect(routes[3].methods.length).to.equal(1);
        expect(routes[0].methods[0]).to.equal('GET');
        expect(routes[1].methods[0]).to.equal('POST');
        expect(routes[2].methods[0]).to.equal('PATCH');
        expect(routes[2].methods[1]).to.equal('POST');
        expect(routes[3].methods[0]).to.equal('*');

    });

    it('should allow buildMatcher to be called with a path and callback', function(done) {
        var metaRouter = require('../');
        metaRouter.buildMatcher(nodePath.join(__dirname, 'fixtures/routes.json'), function(err, matcher) {
            if (err) {
                return done(err);
            }

            var match = matcher.match('/users/123', 'GET');
            expect(match != null).to.equal(true);
            expect(match.params).to.deep.equal({ user: '123' });

            match = matcher.match('/bar', 'GET');
            expect(match != null).to.equal(true);
            expect(match.config.handler != null).to.equal(true);
            expect(match.config.handler).to.equal(require('./fixtures/user').bar);

            done();
        });
    });

    it('should allow method to be optional', function() {
        var metaRouter = require('../');
        var matcher = metaRouter.buildMatcher([
            {
                path: "/users/:user/picture",
                handler: function(req, res) {
                    res.end('User profile picture updated!');
                }
            },
            {
                "path": "/users/:user",
                "handler": function(req, res) {
                    res.end('Hello user: ' + req.params.user);
                },
                // Arbitrary metadata:
                "foo": "bar"
            }
        ]);

        var match = matcher.match('/users/123');
        expect(match != null).to.equal(true);
        expect(match.path).to.equal('/users/123');
        expect(match.params).to.deep.equal({ user: '123' });
        expect(match.config.path).to.equal('/users/:user');
        expect(match.config.handler).to.be.a('function');
        expect(match.config.foo).to.equal('bar');

        match = matcher.match('/usersINVALID/123');
        expect(match == null).to.equal(true);

        match = matcher.match('/users/123/picture');
        expect(match != null).to.equal(true);
        expect(match.path).to.equal('/users/123/picture');
        expect(match.params).to.deep.equal({ user: '123' });
        expect(match.config.path).to.equal('/users/:user/picture');
        expect(match.config.handler).to.be.a('function');
    });
});