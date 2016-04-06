/**
 * Created by aifb on 06.04.16.
 */

var should = require('should');
var fs = require('fs');
var path = require('path');
var mime = require('mime-types');
var q = require('q');
var rdfstore = require('rdfstore');

var create = function() {
    var deferred = q.defer();

    rdfstore.create(function(err, store) {
        deferred.resolve(store);
    });

    return deferred.promise;
};

var load = function(store, owl, mimetype) {
    var deferred = q.defer();

    store.load(mimetype, owl, function(err, results) {
        deferred.resolve(results);
    });

    return deferred.promise;
};

var query = function(store, query) {
    var deferred = q.defer();

    store.execute(query, function (err, r) {
        deferred.resolve(r);
    });

    return deferred.promise;
};

describe('RDFSTORE FILTER', function () {
    it('should filter', function () {
        var data = fs.readFileSync(path.resolve(__dirname + '/ontologies/functionalities.jsonld')),
            extension = path.extname(path.resolve(__dirname + '/ontologies/functionalities.jsonld')),
            owl, store;

        mimeType = mime.contentType(extension);
        if(mimeType) {
            mimeType = mimeType.replace(/;.*/g, '');
        }
        owl = data.toString().replace(/(&)([a-z0-9]+)(;)/gi, '$2:');



        return create()
            .then(function(storage) {
                store = storage;
                return load(store, owl, mimeType);
            })
            .then(function() {
                return query(store, 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX fipa: <http://sites.google.com/site/smartappliancesproject/ontologies/fipa#> SELECT ?a WHERE { ?a rdf:type fipa:Device FILTER NOT EXISTS { ?a rdf:type fipa:Device } }')
            })
            .then(function(r) {
                1;
            })
    });
});