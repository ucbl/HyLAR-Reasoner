/**
 * Created by Spadon on 14/10/2014.
 */

var JswOWL = require('./JswOWL'),
    JswRDF = require('./JswRDF'),
    Fact = require('./Logics/Fact');

/** Ontology represents a set of statements about some domain of interest. */
Ontology = function() {
    var exprTypes = JswOWL.ExpressionTypes,
        classType = exprTypes.ET_CLASS,
        individualType = exprTypes.ET_INDIVIDUAL,
        opropType = exprTypes.ET_OPROP,
        dpropType = exprTypes.ET_DPROP,
        datatype = exprTypes.ET_DATATYPE;

    /** Sets of entity IRIs of different types found in the ontology. */
    this.entities = [];
    this.entities[opropType] = {};
    this.entities[classType] = {};
    this.entities[dpropType] = {};
    this.entities[datatype] = {};
    this.entities[individualType] = {};

    /** Contains all axioms in the ontology. */
    this.axioms = [];

    /**
     * Contains all prefixes used in abbreviated entity IRIs in the ontology.
     * By default, contains standard prefixes defined by OWL 2 Structural Specification document.
     */
    this.prefixes = {
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
        owl: 'http://www.w3.org/2002/07/owl#'
    };

    // Contains the numbers to be used in IRIs of next auto-generated entities.
    this.nextEntityNos = {};
    this.nextEntityNos[opropType] = 1;
    this.nextEntityNos[classType] = 1;
    this.nextEntityNos[dpropType] = 1;
    this.nextEntityNos[datatype] = 1;
    this.nextEntityNos[individualType] = 1;

    // Contains number of entities of each type in the ontology.
    this.entityCount = [];
    this.entityCount[opropType] = 0;
    this.entityCount[classType] = 0;
    this.entityCount[dpropType] = 0;
    this.entityCount[datatype] = 0;
    this.entityCount[individualType] = 0;
};

Ontology.prototype = {
    /** Types of expressions which the ontology can contain. */
    exprTypes: JswOWL.ExpressionTypes,

    /**
     * Adds the given prefix to the ontology, so that the abbreviated IRIs of entities with this
     * prefix can be expanded.
     *
     * @param prefixName Name of the prefix.
     * @param iri IRI to use in abbreviated IRI expansion involving the prefix name.
     */
    addPrefix: function (prefixName, iri) {
        if (!this.prefixes[prefixName]) {
            this.prefixes[prefixName] = iri;
        }
    },

    /**
     * Allows generating a new unique IRI for the entity of the given type.
     *
     * @param type Type of the entity to generate a new unique IRI for.
     * @return string unique IRI.
     */
    createUniqueIRI: function (type) {
        var entities,
            entityPrefix = this.getEntityAutoPrefix(type),
            nextEntityNo = this.entityCount[type] + 1,
            iri;

        entities = this.entities[type];
        iri = '';

        do {
            iri = entityPrefix + nextEntityNo;
            nextEntityNo += 1;
        } while (entities.hasOwnProperty(iri));

        return iri;
    },

    /**
     * Registers the given entity in the ontology.
     *
     * @param type Type of the entity to register.
     * @param iri IRI of the entity.
     * @param isDeclared (optional) Indicates whether the entity has just been declared in the ontology and
     * not used in axioms yet. False by default.
     * todo axiom/fact separation?
     */
    registerEntityAddAxiom: function (type, iri, isDeclared) {
        var iris = JswOWL.IRIs, entityType, axiom;

        // We don't want to register default entity IRIs.
        if (type === this.exprTypes.ET_CLASS) {
            if (iri === iris.THING || iri === iris.NOTHING) {
                return;
            }
            entityType = this.exprTypes.ET_CLASS;
            iriType = JswOWL.IRIs.CLASS

        } else if (type === this.exprTypes.ET_OPROP) {
            if (iri === iris.TOP_OBJECT_PROPERTY || iri === iris.BOTTOM_OBJECT_PROPERTY) {
                return;
            }
            entityType = this.exprTypes.ET_OPROP;
            iriType = JswOWL.IRIs.OPROP;

        } else if (type === this.exprTypes.ET_DPROP) {
            if (iri === iris.TOP_DATA_PROPERTY || iri === iris.BOTTOM_DATA_PROPERTY) {
                return;
            }
            entityType = this.exprTypes.ET_DPROP;
            iriType = JswOWL.IRIs.DPROP;
        }

        axiom = {
            type: entityType,
            args: new Array({
                IRI: iri,
                type: entityType
            })
        };

        if(!(axiom in this.axioms)) this.axioms.push(axiom);

        if (!this.entities[type].hasOwnProperty(iri)) {
            this.entityCount[type] += 1;
            this.entities[type][iri] = (isDeclared);
        } else if (!isDeclared) {
            this.entities[type][iri] = false;
        }
    },

    /**
     * Checks if the ontology contains any references to the class with the given IRI.
     *
     * @param iri IRI of the class to check.
     * @return boolean - true if the ontology has reverences to the class, false otherwise.
     * @param owlIris
     */
    containsClass: function (iri, owlIris) {
        return !!(iri === owlIris.THING || iri === owlIris.NOTHING ||
            this.entities[this.exprTypes.ET_CLASS].hasOwnProperty(iri));
    },

    /**

     * Checks if the ontology contains any references to the object property with the given IRI.
     *
     * @param iri IRI of the object property to check.
     * @return boolean if the ontology has reverences to the object property, false otherwise.
     * @param owlIris
     */
    containsObjectProperty: function (iri, owlIris) {
        return !!(iri === owlIris.TOP_OBJECT_PROPERTY ||
            iri === owlIris.BOTTOM_OBJECT_PROPERTY ||
            this.entities[this.exprTypes.ET_OPROP].hasOwnProperty(iri));
    },

    /**

     * Checks if the ontology contains any references to the data property with the given IRI.
     *
     * @param iri IRI of the data property to check.
     * @return boolean if the ontology has reverences to the data property, false otherwise.
     * @param owlIris
     * @author Mehdi Terdjimi
     */
    containsDataProperty: function (iri, owlIris) {
        return !!(iri === owlIris.TOP_DATA_PROPERTY ||
            iri === owlIris.BOTTOM_DATA_PROPERTY ||
            this.entities[this.exprTypes.ET_DPROP].hasOwnProperty(iri));
    },

    /**
     * Returns an 'associative array' of all classes in the ontology.
     *
     * @return (Array) 'Associative array' of all classes in the ontology.
     */
    getClasses: function () {
        return this.entities[this.exprTypes.ET_CLASS];
    },

    /**
     * Returns a prefix to be used in the automatically generated nams for entities of the given
     * type.
     *
     * @param type Integer specifying the type of entity to get the name prefix for.
     * @return string prefix to be used in the automatically generated nams for entities of the given
     * type.
     */
    getEntityAutoPrefix: function (type) {
        var exprTypes = this.exprTypes;

        switch (type) {
            case exprTypes.ET_CLASS:
                return 'C_';
            case exprTypes.ET_OPROP:
                return 'OP_';
            case exprTypes.ET_INDIVIDUAL:
                return 'I_';
            default:
                throw 'Unknown entity type "' + type + '"!';
        }
    },

    /**
     * Returns an 'associative array' of all object properties in the ontology.
     *
     * @return (Array) 'Associative array' of all object properties in the ontology.
     */
    getObjectProperties: function () {
        return this.entities[this.exprTypes.ET_OPROP];
    },

    /**
     * Returns an 'associative array' of all data properties in the ontology.
     * @author Mehdi Terdjimi
     * @return (Array) 'Associative array' of all data properties in the ontology.
     */
    getDataProperties: function () {
        return this.entities[this.exprTypes.ET_DPROP];
    },

    /**
     * Returns an 'associative array' of all individuals in the ontology.
     *
     * @return (Array) 'Associative array' of all individuals in the ontology.
     */
    getIndividuals: function () {
        return this.entities[this.exprTypes.ET_INDIVIDUAL];
    },

    /**
     * Resolves the given prefixName and otherPart to a full IRI. Checks if the prefix with the
     * given name is defined in the ontology.
     *
     * @param prefixName Name of the prefix.
     * @param otherPart Other (non-prefix) part of the abbreviated IRI.
     * @return Full IRI resolved.
     */
    resolveAbbreviatedIRI: function (prefixName, otherPart) {
        if (!this.prefixes[prefixName]) {
            throw 'Unknown IRI prefix "' + prefixName + '!"';
        }

        return this.prefixes[prefixName] + otherPart;
    },

    /**
     * Convert JSW axioms into formal Logics.js axioms
     * @author Mehdi Terdjimi
     */
    convertAxioms: function() {
        var subClassOf = JswRDF.IRIs.SUBCLASS,
            type = JswRDF.IRIs.TYPE,
            axiomName, leftPart, rightPart,
            newAxioms = [];

        for(var key in this.axioms) {
            var axiom = this.axioms[key];
            switch(axiom.type) {
                case 0:
                    axiomName = subClassOf;
                    var left = axiom.args[0],
                        right = axiom.args[1];
                    if(left.type == right.type) {
                        leftPart = left.IRI;
                        rightPart = right.IRI;
                        newAxioms.push(new Fact(axiomName, leftPart, rightPart, [], true));
                    }
                default:
                    break;
            }
        }

        return newAxioms;
    },

    convertEntities: function() {
        var newFacts = [];
        for (var key in this.entities[JswOWL.ExpressionTypes.ET_CLASS]) {
            newFacts.push(new Fact(JswRDF.IRIs.TYPE, key, JswOWL.IRIs.CLASS, [], true));
        }
        for (var key in this.entities[JswOWL.ExpressionTypes.ET_OPROP]) {
            newFacts.push(new Fact(JswRDF.IRIs.TYPE, key, JswOWL.IRIs.OPROP, [], true));
        }
        for (var key in this.entities[JswOWL.ExpressionTypes.ET_DPROP]) {
            newFacts.push(new Fact(JswRDF.IRIs.TYPE, key, JswOWL.IRIs.DPROP, [], true));
        }
        return newFacts;
    }
};

module.exports = {
    ontology: function() {
        return new Ontology();
    }
};
