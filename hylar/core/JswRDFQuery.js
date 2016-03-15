/**
 * Created by Spadon on 17/10/2014.
 */
var RDFQuery = function() {
    /** Represents a query to the RDF data. */
    var rdfQuery = function () {
        /** IRI to serve as a base of all IRI references in the query. */
        this.baseIri = null;
        /** Indicates that all non-unique matches should be eliminated from the results. */
        this.distinctResults = false;
        /** Number of results the query should return. */
        this.limit = 0;
        /** The number of a record to start returning results from. */
        this.offset = 0;
        /** Array of values to sort the query results by. */
        this.orderBy = [];
        /** An array containing all prefix definitions for the query. */
        this.prefixes = [];
        /** Indicates if some of the non-unique matches can be eliminated from the results. */
        this.reducedResults = false;
        /** An array of RDF triples which need to be matched. */
        this.triples = [];

        /**
         * Array containing the names of variables to return as a result of a query run. If the array is
         * empty, all variables in the query need to be returned.
         */
        this.variables = [];
    };

    /** Prototype for all jsw.rdf.Query objects. */
    rdfQuery.prototype = {
        /** Defines constants by which different expressions can be distinguished in the query. */
        ExpressionTypes: {
            VAR: 0,
            LITERAL: 1,
            IRI_REF: 2
        },

        /**
         * Adds the given prefix to the query. Throws an error if the prefix with the given name but
         * different IRI has been defined already.
         *
         * @param prefixName Name of the prefix to add.
         * @param iri IRI associated with the prefix.
         */
        addPrefix: function (prefixName, iri) {
            var existingIri = this.getPrefixIri(prefixName);

            if (existingIri === null) {
                this.prefixes.push({
                    'prefixName': prefixName,
                    'iri': iri
                });
            } else if (iri !== existingIri) {
                throw 'The prefix "' + prefixName + '" has been defined already in the query!';
            }
        },

        /**
         * Adds an RDF triple which needs to be matched to the query.
         */
        addTriple: function (subject, predicate, object, graphs) {
            if(!graphs) graphs = [];
            this.triples.push({
                'subject': subject,
                'predicate': predicate,
                'object': object,
                'graphs': graphs
            });
        },

        /**
         * Returns IRI for the prefix with the given name in the query.
         *
         * @param prefixName Name of the prefix.
         * @return IRI associated with the given prefix name in the query or null if no prefix with the
         * given name is defined.
         */
        getPrefixIri: function (prefixName) {
            var prefix,
                prefixes = this.prefixes,
                prefixIndex;

            for (prefixIndex = prefixes.length; prefixIndex--;) {
                prefix = prefixes[prefixIndex];

                if (prefix.prefixName === prefixName) {
                    return prefix.iri.value;
                }
            }

            return null;
        }
    };

    return rdfQuery;
};

module.exports = {
    rdfQuery: function() {
        return new RDFQuery();
    }
};
