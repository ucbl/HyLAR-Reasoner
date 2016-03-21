/**
 * Created by pc on 20/11/2015.
 */

var ParsingInterface = require('./ParsingInterface');
var Prefixes = require('./Prefixes');

var rdfstore = require('rdfstore');
var q = require('q');

var storage;

module.exports = {

    init: function() {
        var deferred = q.defer();
        rdfstore.create(function(err, store) {
            if(err) {
                deferred.reject(err);
            } else {
                storage = store;
                storage.setPrefix('owl', Prefixes.OWL);
                storage.setPrefix('rdf', Prefixes.RDF);
                storage.setPrefix('rdfs', Prefixes.RDFS);
                deferred.resolve();
            }
        });
        return deferred.promise;
    },

    loadRdfXml: function(data) {
        var that = this;

        return ParsingInterface.rdfXmlToTurtle(data)
        .then(function(ttl) {
            return that.load(ttl, 'text/turtle');
        })
    },

    query: function(query) {
        var deferred = q.defer();

        storage.execute(query, function (err, r) {
            if(err) {
                deferred.reject(err);
            } else {
                deferred.resolve(r);
            }
        });
        return deferred.promise;
    },

    load: function(data, format) {
        var deferred = q.defer();

        storage.load(format, data, function (err, r) {
            if(err) {
                deferred.reject(err);
            } else {
                deferred.resolve(r);
            }
        });
        return deferred.promise;
    },

    clear: function()  {
        return this.query('DELETE { ?a ?b ?c } WHERE { ?a ?b ?c }');
    },

    insert: function(ttl) {
        return this.query('INSERT DATA { ' + ttl + ' }');
    },

    delete: function(ttl) {
        return this.query('DELETE DATA { ' + ttl + ' }');
    },

    // Storage import or export

    getContent: function() {
        return this.query('CONSTRUCT { ?a ?b ?c } WHERE { ?a ?b ?c }');
    },

    createStoreWith: function(ttl) {
        return this.clear().then(function() {
            return this.insert(ttl)
        });
    }
};