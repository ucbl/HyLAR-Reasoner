/**
 * Created by pc on 20/11/2015.
 */

var ParsingInterface = require('./ParsingInterface');
var Prefixes = require('./Prefixes');

var rdfstore = require('../rdfstore');
var q = require('q');

var storage;

/**
 * Interface used for triple storage.
 * Relies on antonio garrote's rdfstore.js
 */

module.exports = {

    /**
     * Initializes the triplestore.
     * Register owl, rdfs and rdfs prefixes.
     * @returns {*}
     */
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

    /**
     * Suitable function to load rdf/xml ontologies
     * using rdf-ext parser.
     * @param data
     * @returns {*|Promise}
     */
    loadRdfXml: function(data) {
        var that = this;

        return ParsingInterface.rdfXmlToTurtle(data)
        .then(function(ttl) {
            return that.load(ttl, 'text/turtle');
        }, function(error) {
            console.error(error);
            throw error;
        })
    },

    /**
     * Launches a query against the triplestore.
     * @param query
     * @returns {*}
     */
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

    /**
     * Loads an ontology in the store.
     * @param data Raw ontology (str)
     * @param format Ontology mimetype
     * @returns {*}
     */
    load: function(data, format) {
        var deferred = q.defer();

        storage.load(format, data, function (err, r) {
            console.notify(r + ' triples loaded.');
            if(err) {
                deferred.reject(err);
            } else {
                deferred.resolve(r);
            }
        });
        return deferred.promise;
    },

    /**
     * Empties the entire store.
     * @returns {*}
     */
    clear: function()  {
        return this.query('DELETE { ?a ?b ?c } WHERE { ?a ?b ?c }');
    },

    /**
     * Launches an insert query against
     * the triplestore.
     * @param ttl Triples to insert, in turtle.
     * @returns {*}
     */
    insert: function(ttl) {
        return this.query('INSERT DATA { ' + ttl + ' }');
    },

    /**
     * Launches a delete query against
     * the triplestore.
     * @param ttl Triples to insert, in turtle.
     * @returns {*}
     */
    delete: function(ttl) {
        return this.query('DELETE DATA { ' + ttl + ' }');
    },

    /**
     * Returns the content of the store,
     * for export purposes.
     * @returns {*}
     */
    getContent: function() {
        return this.query('CONSTRUCT { ?a ?b ?c } WHERE { ?a ?b ?c }');
    },

    /**
     * Loads content in the store,
     * for import purposes.
     * @param ttl Triples to import, in turtle.
     * @returns {*|Promise}
     */
    createStoreWith: function(ttl) {
        return this.clear().then(function() {
            return this.insert(ttl)
        });
    }
};