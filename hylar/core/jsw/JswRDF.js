/**
 * Created by Spadon on 17/10/2014.
 */

JswRDF = {

    ExpressionTypes: {
        VAR: 0,
        LITERAL: 1,
        IRI_REF: 2
    },

    IRIs: {
        /** IRI by which the type concept is referred to in RDF. */
        TYPE: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',

        //AJOUT Lionel
        /** IRI of the OWL class subsumption property */
        SUBCLASS: 'http://www.w3.org/2000/01/rdf-schema#subClassOf'
    }
};

module.exports = JswRDF;
