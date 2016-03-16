!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.lodash=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by Spadon on 14/10/2014.
 */

/** Defines types of expressions the objects in OWL namespace can work with.*/
ExpressionTypes = {
    /** SubClassOf axiom. */
    AXIOM_CLASS_SUB: 0,
    /** EquivalentClasses axiom. */
    AXIOM_CLASS_EQ: 1,
    /** DisjointClasses axiom */
    AXIOM_CLASS_DISJOINT: 2,
    /** SubObjectPropertyOf axiom. */
    AXIOM_OPROP_SUB: 3,
    /** EquivalentObjectProperties axiom. */
    AXIOM_OPROP_EQ: 4,
    /** ReflexiveObjectProperty axiom */
    AXIOM_OPROP_REFL: 5,
    /** TransitiveObjectProperty axiom */
    AXIOM_OPROP_TRAN: 6,
    /** ObjectIntersectionOf class expression. */
    CE_INTERSECT: 7,
    /** ObjectSomeValuesFrom class expression. */
    CE_OBJ_VALUES_FROM: 8,
    /** Class entity. */
    ET_CLASS: 9,
    /** ObjectProperty entity. */
    ET_OPROP: 10,
    /** (Named)Individual entity. */
    ET_INDIVIDUAL: 11,
    /** ClassAssertion fact. */
    FACT_CLASS: 12,
    /** ObjectPropertyAssertion fact. */
    FACT_OPROP: 13,
    /** SameIndividual fact */
    FACT_SAME_INDIVIDUAL: 14,
    /** DifferentIndividuals fact */
    FACT_DIFFERENT_INDIVIDUALS: 15,
    /** ObjectPropertyChain object property expression. */
    OPE_CHAIN: 16,
    /** Annotations **/
    ANNOTATION: 17,
    /** Object Exact Cardinality **/
    CE_OBJ_EXACT_CARD: 18,
    /** Object Min Cardinality **/
    CE_OBJ_MIN_CARD: 19,
    /** Data Exact Cardinality **/
    CE_DATA_EXACT_CARD: 20,
    /** Data Min Cardinality **/
    CE_DATA_MIN_CARD: 21,
    /** Data Property Entity **/
    ET_DPROP: 22,
    /** DataPropertyAssertion fact **/
    FACT_DPROP: 23,
    /** DataSomeValuesFrom class expression. */
    CE_DATA_VALUES_FROM: 24,
    /** Datatype */
    ET_DATATYPE: 25
};

IRIs = {
    /** Top concept. */
    THING: 'http://www.w3.org/2002/07/owl#Thing',
    /** Bottom concept. */
    NOTHING: 'http://www.w3.org/2002/07/owl#Nothing',
    /** Class */
    CLASS: 'http://www.w3.org/2002/07/owl#Class',
    /** Class */
    OPROP: 'http://www.w3.org/2002/07/owl#ObjectProperty',
    /** Class */
    DPROP: 'http://www.w3.org/2002/07/owl#DataProperty',
    /** Top object property. */
    TOP_OBJECT_PROPERTY: 'http://www.w3.org/2002/07/owl#topObjectProperty',
    /** Bottom object property. */
    BOTTOM_OBJECT_PROPERTY: 'http://www.w3.org/2002/07/owl#bottomObjectProperty',
    /** Top data property. */
    TOP_DATA_PROPERTY: 'http://www.w3.org/2002/07/owl#topDataProperty',
    /** Bottom data property. */
    BOTTOM_DATA_PROPERTY: 'http://www.w3.org/2002/07/owl#bottomDataProperty',
    /** Equivalent Classes axiom */
    EQUIVALENT_CLASS: 'http://www.w3.org/2002/07/owl#equivalentClass',
    /** Same as property */
    SAMEAS: 'http://www.w3.org/2002/07/owl#sameAs'
};

Prefixes = {
    "owl:sameAs": IRIs.SAMEAS,
    "owl:Thing": IRIs.THING,
    "owl:Nothing": IRIs.NOTHING,
    "owl:Class": IRIs.CLASS,
    "owl:ObjectProperty": IRIs.OPROP
};

module.exports = {
    ExpressionTypes: ExpressionTypes,
    IRIs: IRIs,
    Prefixes: Prefixes
};

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/JswOWL.js","/core")
},{"buffer":29,"pBGvAp":32}],2:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by Spadon on 14/10/2014.
 */

var JswOWL = _dereq_('./JswOWL'),
    JswRDF = _dereq_('./JswRDF'),
    Fact = _dereq_('./Logics/Fact');

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

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/JswOntology.js","/core")
},{"./JswOWL":1,"./JswRDF":6,"./Logics/Fact":14,"buffer":29,"pBGvAp":32}],3:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by Spadon on 17/10/2014.
 */

/** Pair storage can be used to hash 2-tuples by the values in them in some order. */
var PairStorage = function () {
    /** Data structure holding all pairs. */
    this.storage = {};
};

/** Prototype for all jsw.util.PairStorage objects. */
PairStorage.prototype = {
    /**
     * Adds a new tuple to the storage.
     *
     * @param first Value of the first element of the tuple.
     * @param second Value for the second element of the tuple.
     */
    add: function (first, second) {
        var storage = this.storage;

        if (!storage[first]) {
            storage[first] = {};
        }

        storage[first][second] = true;
    },

    /**
     * Removes part of the relation specified by the arguments.
     *
     * @param first First value in the pairs to remove.
     * @param second (optional) Second value in the pairs to remove.
     */
    remove: function (first, second) {
        var firstPairs = this.storage[first];

        if (!firstPairs) {
            return;
        }

        if (second) {
            delete firstPairs[second];
        } else {
            delete this.storage[first];
        }
    },

    /**
     * Checks if the tuple with the given values exists within the storage.
     *
     * @param first First value in the pair.
     * @param second Second value in the pair.
     * @return boolean if the tuple with the given value exists, false otherwise.
     */
    exists: function (first, second) {
        var firstPairs = this.storage[first];

        if (!firstPairs) {
            return false;
        }

        return firstPairs[second] || false;
    },

    /**
     * Checks if tuples with the given first value and all of the given second values exist within
     * the storage.
     *
     * @param first First value in the tuple.
     * @param second Array containing the values for second element in the tuple.
     * @return boolean true if the storage contains all the tuples, false otherwise.
     */
    existAll: function (first, second) {
        var secondPairs, secondValue;

        if (!second) {
            return true;
        }

        secondPairs = this.storage[first];

        if (!secondPairs) {
            return false;
        }

        for (secondValue in second) {
            if (!secondPairs[secondValue]) {
// Some entity from subsumers array is not a subsumer.
                return false;
            }
        }

        return true;
    },

    /**
     * Returns an object which can be used to access all pairs in the storage with (optionally)
     * the fixed value of the first element in all pairs.
     *
     * @param first (optional) The value of the first element of all pairs to be returned.
     * @return Object which can be used to access all pairs in the storage.
     */
    get: function (first) {
        if (!first) {
            return this.storage;
        }

        return this.storage[first] || {};
    },

    getAllBut: function(entity) {
        var others = [];
        for (var key in this.storage[entity]) {
            if (key != entity) others.push(key);
        }
        return others;
    }
};

module.exports = {
    pairStorage: PairStorage
};

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/JswPairStorage.js","/core")
},{"buffer":29,"pBGvAp":32}],4:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by Spadon on 14/10/2014.
 */

JswOWL = _dereq_('./JswOWL');
JswOntology = _dereq_('./JswOntology');
JswUtils = _dereq_('./JswUtils');
TextFile = _dereq_('./JswTextFile');

JswParser = {

    /**
     * Parses the given OWL/XML string into the Ontology object.
     * @param owlXml String containing OWL/XML to be parsed.
     * @param onError Function to be called in case if the parsing error occurs.
     * @return Ontology object representing the ontology parsed.
     */
    parse: function (owlXml, onError) {
        var exprTypes = JswOWL.ExpressionTypes, // Cash reference to the constants.
            node,                               // Will hold the current node being parsed.
            ontology = JswOntology.ontology(),             // The ontology to be returned.
            statements = ontology.axioms;       // Will contain all statements.

        /**
         * Parses XML element representing some entity into the object. Throws an exception if the
         * name of the given element is not equal to typeName.
         * @param type Type of the entity represented by the XML element.
         * @param typeName Name of the OWL/XML element which corresponds to the given entity type.
         * @param element XML element representing some entity.
         * @param isDeclared (optional) Indicates whether the entity has been just declared in the ontology.
         * False by default.
         * @return Object representing the entity parsed.
         */
        function parseEntity(type, typeName, element, isDeclared) {
            var abbrIri, colonPos, entity, iri;

            if (element.nodeName !== typeName) {
                throw typeName + ' element expected, but not found! Found ' + element.nodeName;
            }

            abbrIri = element.getAttribute('abbreviatedIRI');
            iri = element.getAttribute('IRI');

            // If both attributes or neither are defined on the entity, it is an error.

            if ((!iri && !abbrIri) || (iri && abbrIri)) {
                throw 'Exactly one of IRI or abbreviatedIRI attribute must be present in ' +
                    element.nodeName + ' element!';
            }

            if (!abbrIri) {
                entity = {
                    'type': type,
                    'IRI': iri
                };
            } else {
                colonPos = abbrIri.indexOf(':');

                if (colonPos < 0) {
                    throw 'Abbreviated IRI "' + abbrIri + '" does not contain a prefix name!';
                }

                if (colonPos === abbrIri.length - 1) {
                    throw 'Abbreviated IRI "' + abbrIri + '" does not contain anything after ' +
                        'the prefix!';
                }

                iri = ontology.resolveAbbreviatedIRI(
                    abbrIri.substring(0, colonPos),
                    abbrIri.substring(colonPos + 1)
                );

                // Store information about abbreviated entity IRI, so that it can be used when
                // writing the ontology back in OWL/XML.
                entity = {
                    'type': type,
                    'IRI': iri,
                    'abbrIRI': abbrIri
                };
            }

            ontology.registerEntityAddAxiom(type, iri, isDeclared);
            return entity;
        }

        /**
         * Parses XML element representing class intersection expression.
         * @param element XML element representing class intersection expression.
         * @return Object representing the class intersection expression.
         */
        function parseObjIntersectExpr(element) {
            var classExprs = [],
                node = element.firstChild;

            while (node) {
                if (node.nodeType === 1) {
                    classExprs.push(parseClassExpr(node));
                }

                node = node.nextSibling;
            }

            return {
                'type': exprTypes.CE_INTERSECT,
                'args': classExprs
            };
        }

        /**
         * Parses XML element representing ObjectSomeValuesFrom expression.
         * @param element XML element representing the ObjectSomeValuesFrom expression.
         * @return Object representing the expression parsed.
         */
        function parseSomeValuesFromExpr(element) {
            var oprop, classExpr, node;

            node = element.firstChild;

            while (node) {
                if (node.nodeType !== 1) {
                    node = node.nextSibling;
                    continue;
                }

                if (!oprop) {
                    oprop = parseEntity(exprTypes.ET_OPROP, 'ObjectProperty', node, false);
                } else if (!classExpr) {
                    classExpr = parseClassExpr(node);
                } else {
                    throw 'The format of ObjectSomeValuesFrom expression is incorrect!';
                }

                node = node.nextSibling;
            }

            if (!oprop || !classExpr) {
                throw 'The format of ObjectSomeValuesFrom expression is incorrect!';
            }

            return {
                'type': exprTypes.CE_OBJ_VALUES_FROM,
                'opropExpr': oprop,
                'classExpr': classExpr

            };
        }

        /**
         * Parses XML element representing ObjectExactCardinality expression.
         * @param element XML element representing the ObjectExactCardinality expression.
         * @return Object representing the expression parsed.
         * @author Mehdi Terdjimi
         */
        function parseObjExactCardExpr(element) {
            var node, card, oprop, classExpr;

            node = element.firstChild;

            for (var i=0; i<element.attributes.length; i++) {
                if (element.attributes[i].nodeName === 'cardinality') {
                    card = element.attributes[i].nodeValue;
                }
            }

            while (node) {
                if (node.nodeType !== 1) {
                    node = node.nextSibling;
                    continue;
                }

                if (!oprop) {
                    oprop = parseEntity(exprTypes.ET_OPROP, 'ObjectProperty', node, false);
                } else if (!classExpr) {
                    classExpr = parseClassExpr(node);
                } else {
                    throw 'The format of ObjectExactCardinality expression is incorrect!';
                }

                node = node.nextSibling;
            }

            return {
                'type': exprTypes.CE_OBJ_EXACT_CARD,
                'value': card,
                'opropExpr': oprop,
                'classExpr': classExpr
            }
        }

        /**
         * Parses XML element representing ObjectMinCardinality expression.
         * @param element XML element representing the ObjectMinCardinality expression.
         * @return Object representing the expression parsed.
         * @author Mehdi Terdjimi
         */
        function parseObjMinCardExpr(element) {
            var node, card, oprop, classExpr;

            node = element.firstChild;

            for (var i=0; i<element.attributes.length; i++) {
                if (element.attributes[i].nodeName === 'cardinality') {
                    card = element.attributes[i].nodeValue;
                }
            }

            while (node) {
                if (node.nodeType !== 1) {
                    node = node.nextSibling;
                    continue;
                }

                if (!oprop) {
                    oprop = parseEntity(exprTypes.ET_OPROP, 'ObjectProperty', node, false);
                } else if (!classExpr) {
                    classExpr = parseClassExpr(node);
                } else {
                    throw 'The format of ObjectMinCardinality expression is incorrect!';
                }

                node = node.nextSibling;
            }

            return {
                'type': exprTypes.CE_OBJ_MIN_CARD,
                'value': card,
                'opropExpr': oprop,
                'classExpr': classExpr
            }
        }

        /**
         * Parses XML element representing DataExactCardinality expression.
         * @param element XML element representing the DataExactCardinality expression.
         * @return Object representing the expression parsed.
         * @author Mehdi Terdjimi
         */
        function parseDataExactCardExpr(element) {
            var node, card, dprop, classExpr;

            node = element.firstChild;

            for (var i=0; i<element.attributes.length; i++) {
                if (element.attributes[i].nodeName === 'cardinality') {
                    card = element.attributes[i].nodeValue;
                }
            }

            while (node) {
                if (node.nodeType !== 1) {
                    node = node.nextSibling;
                    continue;
                }

                if (!dprop) {
                    dprop = parseEntity(exprTypes.ET_DPROP, 'DataProperty', node, false);
                } else if (!classExpr) {
                    classExpr = parseClassExpr(node);
                } else {
                    throw 'The format of DataExactCardinality expression is incorrect!';
                }

                node = node.nextSibling;
            }

            return {
                'type': exprTypes.CE_DATA_EXACT_CARD,
                'value': card,
                'dpropExpr': dprop,
                'classExpr': classExpr
            }
        }

        /**
         * Parses XML element representing DataMinCardinality expression.
         * @param element XML element representing the DataMinCardinality expression.
         * @return Object representing the expression parsed.
         * @author Mehdi Terdjimi
         */
        function parseDataMinCardExpr(element) {
            var node, card, dprop;

            node = element.firstChild;

            for (var i=0; i<element.attributes.length; i++) {
                if (element.attributes[i].nodeName === 'cardinality') {
                    card = element.attributes[i].nodeValue;
                }
            }

            while (node) {
                if (node.nodeType !== 1) {
                    node = node.nextSibling;
                    continue;
                }

                if (!dprop) {
                    dprop = parseEntity(exprTypes.ET_DPROP, 'DataProperty', node, false);
                } else {
                    throw 'The format of DataMinCardinality expression is incorrect!';
                }

                node = node.nextSibling;
            }

            return {
                'type': exprTypes.CE_DATA_MIN_CARD,
                'value': card,
                'dpropExpr': dprop
            }
        }

        /**
         * Parses XML element representing DataSomeValuesFrom expression.
         * @param element XML element representing the DataSomeValuesFrom expression.
         * @return Object representing the expression parsed.
         * @author Mehdi Terdjimi
         */
        function parseDataSomeValuesFrom(element) {
            var dprop, datatypeExpr, node;

            node = element.firstChild;

            while (node) {
                if (node.nodeType !== 1) {
                    node = node.nextSibling;
                    continue;
                }

                if (!dprop) {
                    dprop = parseEntity(exprTypes.ET_DPROP, 'DataProperty', node, false);
                } else if (!datatypeExpr) {
                    datatypeExpr = parseEntity(exprTypes.ET_DATATYPE, 'Datatype', node, false);
                } else {
                    throw 'The format of DataSomeValuesFrom expression is incorrect!';
                }

                node = node.nextSibling;
            }

            if (!dprop || !datatypeExpr) {
                throw 'The format of DataSomeValuesFrom expression is incorrect!';
            }

            return {
                'type': exprTypes.CE_DATA_VALUES_FROM,
                'dpropExpr': dprop,
                'datatypeExpr': datatypeExpr

            };
        }

        /**
         * Parses the given XML node into the class expression.
         * @param element XML node containing class expression to parse.
         * @return Object representing the class expression parsed.
         */
        function parseClassExpr(element) {
            switch (element.nodeName) {
                case 'ObjectIntersectionOf':
                    return parseObjIntersectExpr(element);
                case 'ObjectSomeValuesFrom':
                    return parseSomeValuesFromExpr(element);
                case 'ObjectExactCardinality':
                    return parseObjExactCardExpr(element);
                case 'ObjectMinCardinality':
                    return parseObjMinCardExpr(element);
                case 'DataMinCardinality':
                    return parseDataMinCardExpr(element);
                case 'DataSomeValuesFrom':
                    return parseDataSomeValuesFrom(element);
                default:
                    return parseEntity(exprTypes.ET_CLASS, 'Class', element, false);
            }
        }

        /**
         * Parses an XML element representing the object property chain into the object.
         * @param element Element representing an object property chain.
         * @return Object representing the object property chain parsed.
         */
        function parseOpropChain(element) {
            var args = [],
                node = element.firstChild,
                opropType = exprTypes.ET_OPROP;

            while (node) {
                if (node.nodeType === 1) {
                    args.push(parseEntity(opropType, 'ObjectProperty', node, false));
                }

                node = node.nextSibling;
            }

            if (args.length < 2) {
                throw 'The object property chain should contain at least 2 object properties!';
            }

            return {
                'type': exprTypes.OPE_CHAIN,
                'args': args
            };
        }

        /**
         * Parses XML element representing SubObjectPropertyOf axiom into the object.
         * @param element OWL/XML element representing SubObjectPropertyOf axiom.
         */
        function parseSubOpropAxiom(element) {
            var firstArg, secondArg, node, opropType;

            opropType = exprTypes.ET_OPROP;
            node = element.firstChild;

            while (node) {
                if (node.nodeType !== 1) {
                    node = node.nextSibling;
                    continue;
                }

                if (!firstArg) {
                    if (node.nodeName === 'ObjectPropertyChain') {
                        firstArg = parseOpropChain(node);
                    } else {
                        firstArg = parseEntity(opropType, 'ObjectProperty', node, false);
                    }
                } else if (!secondArg) {
                    secondArg = parseEntity(opropType, 'ObjectProperty', node, false);
                } else {
                    throw 'The format of SubObjectPropertyOf axiom is incorrect!';
                }

                node = node.nextSibling;
            }

            if (!firstArg || !secondArg) {
                throw 'The format of SubObjectPropertyOf axiom is incorrect!';
            }

            statements.push({
                'type': exprTypes.AXIOM_OPROP_SUB,
                'args': [firstArg, secondArg]
            });
        }

        /**
         * Parse XML element representing a class axiom into the object.
         * @param type Type of the class axiom to parse.
         * @param element XML element representing the class axiom to parse.
         * @param minExprCount Minimum number of times the class expressions should occur in the
         * axiom.
         * @param maxExprCount Maximum number of times the class expressions should occur in the
         * axiom.
         */
        function parseClassAxiom(type, element, minExprCount, maxExprCount) {
            var args = [],
                node = element.firstChild;


            while (node) {
                if (node.nodeType === 1) {
                    args.push(parseClassExpr(node));
                }

                node = node.nextSibling;
            }

            if (!isNaN(minExprCount) && args.length < minExprCount) {
                throw 'Class axiom contains less than ' + minExprCount + ' class expressions!';
            }

            if (!isNaN(maxExprCount) && args.length > maxExprCount) {
                throw 'Class axiom contains more than ' + maxExprCount + ' class expressions!';
            }

            statements.push({
                'type': type,
                'args': args
            });
        }

        /**
         * Parses EquivalentObjectProperties XML element into the corresponding object.
         * @param element OWL/XML element representing the EquivalentObjectProperties axiom.
         */
        function parseEqOpropAxiom(element) {
            var args = [],
                node = element.firstChild,
                opropType = exprTypes.ET_OPROP;

            while (node) {
                if (node.nodeType === 1) {
                    args.push(parseEntity(opropType, 'ObjectProperty', node, false));
                }

                node = node.nextSibling;
            }

            if (args.length < 2) {
                throw 'EquivalentObjectProperties axiom contains less than 2 child elements!';
            }

            statements.push({
                'type': exprTypes.AXIOM_OPROP_EQ,
                'args': args
            });
        }

        /**
         * Parses the given XML element into the object property axiom of the given type.
         * @param type Type of an object property axiom represented by the element.
         * @param element XML element to parse into the axiom object.
         */
        function parseOpropAxiom(type, element) {
            var node = element.firstChild,
                oprop;

            while (node) {
                if (node.nodeType === 1) {
                    if (!oprop) {
                        oprop = parseEntity(exprTypes.ET_OPROP, 'ObjectProperty', node, false);
                    } else {
                        throw 'Unexpected element ' + node.nodeName + ' found inside the object ' +
                            'property axiom element!';
                    }
                }

                node = node.nextSibling;
            }

            if (!oprop) {
                throw 'Object property axiom does not contain an argument!';
            }

            statements.push({
                'type': type,
                'objectProperty': oprop
            });
        }

        /**
         * Parses Declaration OWL/XML element into the corresponding entity object within the
         * ontology.
         * @param element OWL/XML Declaration element to parse.
         */
        function parseDeclaration(element) {
            var found = false,
                node = element.firstChild,
                nodeName;

            while (node) {
                if (node.nodeType === 1) {
                    nodeName = node.nodeName;

                    if (found) {
                        throw 'Unexpected element "' + nodeName + '" found in Declaration element!';
                    }

                    switch (nodeName) {
                        case 'Class':
                            parseEntity(exprTypes.ET_CLASS, 'Class', node, false);
                            found = true;
                            break;
                        case 'ObjectProperty':
                            parseEntity(exprTypes.ET_OPROP, 'ObjectProperty', node, false);
                            found = true;
                            break;
                        case 'DataProperty':
                            parseEntity(exprTypes.ET_DPROP, 'DataProperty', node, false);
                            found = true;
                            break;
                        case 'NamedIndividual':
                            parseEntity(exprTypes.ET_INDIVIDUAL, 'NamedIndividual', node, false);
                            found = true;
                            break;
                    }
                }

                node = node.nextSibling;
            }
        }

        /**
         * Parses ClassAssertion XML element into the corresponding object.
         * @param element OWL/XML ClassAssertion element.
         */
        function parseClassAssertion(element) {
            var classExpr, individual, node;

            node = element.firstChild;

            while (node) {
                if (node.nodeType !== 1) {
                    node = node.nextSibling;
                    continue;
                }

                if (!classExpr) {
                    classExpr = parseClassExpr(node);
                } else if (!individual) {
                    individual = parseEntity(exprTypes.ET_INDIVIDUAL, 'NamedIndividual', node, false);
                } else {
                    throw 'Incorrect format of the ClassAssertion element!';
                }

                node = node.nextSibling;
            }

            if (!classExpr || !individual) {
                throw 'Incorrect format of the ClassAssertion element!';
            }

            statements.push({
                'type': exprTypes.FACT_CLASS,
                'individual': individual,
                'classExpr': classExpr
            });
        }

        /**
         * Parses ObjectPropertyAssertion OWL/XML element into the corresponding object.
         *
         * @param element OWL/XML ObjectPropertyAssertion element to parse.
         */
        function parseObjectPropertyAssertion(element) {
            var individualType, leftIndividual, node, objectProperty, rightIndividual;

            individualType = exprTypes.ET_INDIVIDUAL;
            node = element.firstChild;

            while (node) {
                if (node.nodeType !== 1) {
                    node = node.nextSibling;
                    continue;
                }

                if (!objectProperty) {
                    objectProperty = parseEntity(exprTypes.ET_OPROP, 'ObjectProperty', node, false);
                } else if (!leftIndividual) {
                    leftIndividual = parseEntity(individualType, 'NamedIndividual', node, false);
                } else if (!rightIndividual) {
                    rightIndividual = parseEntity(individualType, 'NamedIndividual', node, false);
                } else {
                    throw 'Incorrect format of the ObjectPropertyAssertion element!';
                }

                node = node.nextSibling;
            }

            if (!objectProperty || !leftIndividual || !rightIndividual) {
                throw 'Incorrect format of the ObjectPropertyAssertion element!';
            }

            statements.push({
                'type': exprTypes.FACT_OPROP,
                'leftIndividual': leftIndividual,
                'objectProperty': objectProperty,
                'rightIndividual': rightIndividual
            });
        }

        /**
         * Parses OWL/XML element representing an assertion about individuals into the corresponding
         * object.
         * @param element OWL/XML element to parse.
         * @param type
         */
        function parseIndividualAssertion(element, type) {
            var individuals, individualType, node;

            individualType = exprTypes.ET_INDIVIDUAL;
            node = element.firstChild;
            individuals = [];

            while (node) {
                if (node.nodeType !== 1) {
                    node = node.nextSibling;
                    continue;
                }

                individuals.push(parseEntity(individualType, 'NamedIndividual', node, false));
                node = node.nextSibling;
            }

            if (individuals.length < 2) {
                throw 'Incorrect format of the ' + element.nodeName + ' element!';
            }

            statements.push({
                'type': type,
                'individuals': individuals
            });
        }

        /**
         * Parses the given OWL/XML Prefix element and adds the information about this prefix to the
         * ontology.
         * @param element OWL/XML Prefix element.
         */
        function parsePrefixDefinition(element) {
            var prefixName = element.getAttribute('name'),
                prefixIri = element.getAttribute('IRI');

            if (prefixName === null || !prefixIri) {
                throw 'Incorrect format of Prefix element!';
            }

            ontology.addPrefix(prefixName, prefixIri);
        }

        function parseAnnotation(node) {
            return;
        }

        function parseObjectPropertyDomain(node) {

        }

        function parseObjectPropertyRange(node) {

        }

        function parseDataPropertyDomain(node) {

        }

        function parseDataPropertyRange(node) {

        }

        function parseAnnotationAssertion(node) {

        }

        function parseImport(node) {

        }

        node = JswUtils.parseString(owlXml).documentElement.firstChild;

        // OWL/XML Prefix statements (if any) should be at the start of the document. We need them
        // to expand abbreviated entity IRIs.
        while (node) {
            if (node.nodeType === 1) {
                if (node.nodeName === 'Prefix') {
                    parsePrefixDefinition(node);
                } else {
                    break;
                }
            }

            node = node.nextSibling;
        }

        // Axioms / facts (if any) follow next.

        while (node) {
            if (node.nodeType !== 1) {
                node = node.nextSibling;
                continue;
            }

            try {
                switch (node.nodeName) {
                    case 'Declaration':
                        parseDeclaration(node);
                        break;
                    case 'SubClassOf':
                        parseClassAxiom(exprTypes.AXIOM_CLASS_SUB, node, 2, 2);
                        break;
                    case 'EquivalentClasses':
                        parseClassAxiom(exprTypes.AXIOM_CLASS_EQ, node, 2);
                        break;
                    case 'DisjointClasses':
                        parseClassAxiom(exprTypes.AXIOM_CLASS_DISJOINT, node, 2);
                        break;
                    case 'SubObjectPropertyOf':
                        parseSubOpropAxiom(node);
                        break;
                    case 'EquivalentObjectProperties':
                        parseEqOpropAxiom(node);
                        break;
                    case 'ReflexiveObjectProperty':
                        parseOpropAxiom(exprTypes.AXIOM_OPROP_REFL, node);
                        break;
                    case 'TransitiveObjectProperty':
                        parseOpropAxiom(exprTypes.AXIOM_OPROP_TRAN, node);
                        break;
                    case 'ClassAssertion':
                        parseClassAssertion(node);
                        break;
                    case 'ObjectPropertyAssertion':
                        parseObjectPropertyAssertion(node);
                        break;
                    case 'SameIndividual':
                        parseIndividualAssertion(node, exprTypes.FACT_SAME_INDIVIDUAL);
                        break;
                    case 'DifferentIndividuals':
                        parseIndividualAssertion(node, exprTypes.FACT_DIFFERENT_INDIVIDUALS);
                        break;
                    case 'Prefix':
                        throw 'Prefix elements should be at the start of the document!';
                        break;
                    case 'Annotation':
                        parseAnnotation(node);
                        break;
                    case 'ObjectPropertyDomain':
                        parseObjectPropertyDomain(node);
                        break;
                    case 'ObjectPropertyRange':
                        parseObjectPropertyRange(node);
                        break;
                    case 'DataPropertyDomain':
                        parseDataPropertyDomain(node);
                        break;
                    case 'DataPropertyRange':
                        parseDataPropertyRange(node);
                        break;
                    case 'AnnotationAssertion':
                        parseAnnotationAssertion(node);
                        break;
                    case 'Import':
                        parseImport(node);
                        break;
                }
            } catch (ex) {
                if (!onError || !onError(ex)) {
                    throw ex;
                }
            }

            node = node.nextSibling;
        }

        return ontology;
    },

    /**
     * Parses the OWL/XML ontology located at the given url.
     * @param url URL of the OWL/XML ontology to be parsed.
     * @param onError Function to be called in case if the parsing error occurs.
     * @return Ontology object representing the ontology parsed.
     */
    parseUrl: function (url, onError) {
        var newUrl = JswUtils.trim(url),
            owlXml;

        if (!JswUtils.isUrl(newUrl)) {
            throw '"' + url + '" is not a valid URL!';
        }

        owlXml = new TextFile(url).getText();
        return this.parse(owlXml, onError);
    }

};

module.exports = JswParser;

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/JswParser.js","/core")
},{"./JswOWL":1,"./JswOntology":2,"./JswTextFile":9,"./JswUtils":12,"buffer":29,"pBGvAp":32}],5:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by Spadon on 17/10/2014.
 */

/** Represents a queue implementing FIFO mechanism. */
var Queue = function () {
    this.queue = [];
    this.emptyElements = 0;
};

/** Prototype for all jsw.util.Queue objects. */
Queue.prototype = {
    /**
     * Checks if the queue has no objects.
     *
     * @return (boolean) True if there are no objects in the queue, fale otherwise.
     */
    isEmpty: function () {
        return this.queue.length === 0;
    },

    /**
     * Adds an object to the queue.
     *
     * @param obj Object to add to the queue.
     */
    enqueue: function (obj) {
        this.queue.push(obj);
    },

    /**
     * Removes the oldest object from the queue and returns it.
     *
     * @return The oldest object in the queue.
     */
    dequeue: function () {
        var element,
            emptyElements = this.emptyElements,
            queue = this.queue,
            queueLength = queue.length;

        if (queueLength === 0) {
            return null;
        }

        element = queue[emptyElements];
        emptyElements += 1;

        // If the queue has more than a half empty elements, shrink it.
        if (emptyElements << 1 >= queueLength - 1) {
            this.queue = queue.slice(emptyElements);
            this.emptyElements = 0;
        } else {
            this.emptyElements = emptyElements;
        }

        return element;
    }
};

module.exports = {
    queue: Queue
};


}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/JswQueue.js","/core")
},{"buffer":29,"pBGvAp":32}],6:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/JswRDF.js","/core")
},{"buffer":29,"pBGvAp":32}],7:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/JswRDFQuery.js","/core")
},{"buffer":29,"pBGvAp":32}],8:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by Spadon on 17/10/2014.
 */
JswXSD = _dereq_('./JswXSD');
JswRDFQuery = _dereq_('./JswRDFQuery');
xsd = new JswXSD.xsd();
rdfQuery = new JswRDFQuery.rdfQuery();

SPARQL = {
// ============================= SPARQL namespace =============================
    /**
     * An object which can be used to work with SPARQL queries.
     *
     * The features currently not supported by the parser:
     * - Proper relative IRI resolution;
     * - Blank Nodes;
     * - Comments;
     * - Nested Graph Patterns;
     * - FILTER expressions;
     * - ORDER BY: expressions other than variables;
     * - RDF Collections;
     * - OPTIONAL patterns;
     * - UNION of patterns;
     * - FROM clause (and, hence, GRAPH clause and named graphs).
     */
    /** Defines data types of literals which can be parsed */
    DataTypes: xsd.DataTypes,
    /** Defines types of expressions which can be parsed */
    ExpressionTypes: rdfQuery.prototype.ExpressionTypes,

    /** Regular expression for SPARQL absolute IRI references. */
    absoluteIriRegExp: null,
//AJOUT Lionel
    /** Regular expression for SPARQL local IRI references. */
    localIriRegExp: null,
    /** Regular expression for SPARQL boolean literals. */
    boolRegExp: null,
    /** Regular expression for SPARQL decimal literals. */
    decimalRegExp: null,
    /** Regular expression for SPARQL double literals. */
    doubleRegExp: null,
    /** Regular expression for SPARQL integer literals. */
    intRegExp: null,
    /** Regular expression for SPARQL IRI references. */
    iriRegExp: null,
    /** Regular expression representing one of the values in the ORDER BY clause. */
    orderByValueRegExp: null,
    /** Regular expression for SPARQL prefixed names. */
    prefixedNameRegExp: null,
    /** Regular expression for SPARQL prefix name. */
    prefixRegExp: null,
    /** Regular expression for RDF literals. */
    rdfLiteralRegExp: null,
    /** Regular expression for SPARQL variables. */
    varRegExp: null,

    /**
     * Expands the given prefixed name into the IRI reference.
     *
     * @param prefix Prefix part of the name.
     * @param localName Local part of the name.
     * @return IRI reference represented by the given prefix name.
     * @param query
     */
    expandPrefixedName: function (prefix, localName, query) {

        var iri;

        if (!prefix && !localName) {
            throw 'Can not expand the given prefixed name, since both prefix and local name are ' +
                'empty!';
        }

        prefix = prefix || '';
        localName = localName || '';

        iri = query.getPrefixIri(prefix);

        if (iri === null) {
            throw 'Prefix "' + prefix + '" has not been defined in the query!';
        }

        return iri + localName;
    },

    /** Initializes regular expressions used by parser. */
    init: function () {
        var pnCharsBase = "A-Za-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D" +
                "\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF" +
                "\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\u10000-\\uEFFFF",
            pnCharsU = pnCharsBase + "_",
            pnChars = pnCharsU + "0-9\\-\\u00B7\\u0300-\\u036F\\u203F-\\u2040",
            pnNameNs = "([" + pnCharsBase + "][" + pnChars + ".]*[" + pnChars + "])?:",
            pnLocal = "([" + pnCharsU + "0-9](?:[" + pnChars + ".]*[" + pnChars + "])?)?",
            varRegExp = "[?$][" + pnCharsU + "0-9][" + pnCharsU + "0-9\\u00B7\\u0300-\\u036F" +
                "\\u203F-\\u2040]*",
        //CHANGEMENT Lionel
        //Bug in \\[tbnrf\\\"'] -> not interpreted in JS as [\t\b\n...]
        //Added an echar variable (as in the spec) and used it in the string variable
            echar = "[\\t\\b\\n\\r\\f\\\\\\" + '"' + "\\']",
            string = "'((?:[^\\x27\\x5C\\xA\\xD]|" + echar + ")*)'|" +
                '"((?:[^\\x22\\x5C\\xA\\xD]|' + echar + ')*)"|' +
                '"""((?:(?:"|"")?(?:[^"\\]|' + echar + '))*)"""|' +
                "'''((?:(?:'|'')?(?:[^'\\]|" + echar + "))*)'''",
        //Ancien code
        //string = "'((?:[^\\x27\\x5C\\xA\\xD]|\\[tbnrf\\\"'])*)'|" +
        //'"((?:[^\\x22\\x5C\\xA\\xD]|\\[tbnrf\\"\'])*)"|' +
        //'"""((?:(?:"|"")?(?:[^"\\]|\\[tbnrf\\"\']))*)"""|' +
        //"'''((?:(?:'|'')?(?:[^'\\]|\\[tbnrf\\\"']))*)'''",
            iriRef = '<[^<>"{}|^`\\][\\x00-\\x20]*>',
            prefixedName = pnNameNs + pnLocal,
            exponent = '[eE][+-]?[0-9]+';

        this.absoluteIriRegExp = /^<\w*:\/\//; // TODO: This is not precise.
        //AJOUT Lionel
        this.localIriRegExp = /^<#.*>$/; // TODO: This is not precise.
        this.boolRegExp = /^true$|^false$/i;
        this.intRegExp = /^(?:\+|-)?[0-9]+$/;
        this.decimalRegExp = /^(?:\+|-)?(?:[0-9]+\.[0-9]*|\.[0-9]+)$/;
        this.doubleRegExp = new RegExp('^(?:\\+|-)?(?:[0-9]+\\.[0-9]*' + exponent + '|\\.[0-9]+' +
            exponent + '|[0-9]+' + exponent + ')$');
        this.iriRegExp = new RegExp('^' + iriRef + '$');
        this.orderByValueRegExp = new RegExp('^(ASC|DESC)\\((' + varRegExp + ')\\)$|^' + varRegExp +
            '$', "i");
        this.prefixRegExp = new RegExp("^" + pnNameNs + "$");
        this.prefixedNameRegExp = new RegExp("^" + prefixedName + "$");
        this.rdfLiteralRegExp = new RegExp('^(?:' + ''/*string */+ '.*)(?:@([a-zA-Z]+(?:-[a-zA-Z0-9]+)*)|' +
            '\\^\\^(' + iriRef + ')|\\^\\^' + prefixedName + ')?$');
        this.varRegExp = new RegExp('^' + varRegExp + '$');
    },

    /**
     * Parses the given SPARQL string into the query.
     *
     * @param queryTxt SPARQL string to parse into the query.
     * @return rdfQuery object representing the query parsed.
     */
    parse: function (queryTxt) {
        var iri, object, predicate, prefix, query, subject, token, tokens, tokenCount,
            tokenIndex, valueToRead, variable, vars;

        if (!queryTxt) {
            throw 'The query text is not specified!';
        }

        query = new rdfQuery();
        tokens = queryTxt.match(/[^\s"']+|"([^"]*)"|'([^']*)'/g);
        tokenCount = tokens.length;
        tokenIndex = 0;

        if (tokens[tokenIndex].toUpperCase() === 'BASE') {
            tokenIndex += 1;

            query.baseIri = this.parseAbsoluteIri(tokens[tokenIndex]);

            if (query.baseIri === null) {
                throw 'BASE statement does not contain a valid IRI reference!';
            }

            tokenIndex += 1;
        }

// Read all PREFIX statements...
        while (tokenIndex < tokenCount) {
            token = tokens[tokenIndex];

            if (token.toUpperCase() !== 'PREFIX') {
                break;
            }

            tokenIndex += 1;

            if (tokenIndex === tokenCount) {
                throw 'Prefix name expected, but end of the query text found!';
            }

            prefix = this.parsePrefixName(tokens[tokenIndex]);

            if (prefix === null) {
                throw 'Token "' + token + '" does not represent a valid IRI prefix!';
            }

            tokenIndex += 1;

            if (tokenIndex === tokenCount) {
                throw 'Prefix IRI expected, but end of the query text found!';
            }

            iri = this.parseIriRef(tokens[tokenIndex], query);

            if (iri === null) {
                throw 'Incorrect format of the IRI encountered!';
            }

            query.addPrefix(prefix, iri);

            tokenIndex += 1;
        }

// Parse SELECT, INSERT DATA or DELETE DATA clauses.
        if (tokenIndex === tokenCount) {
            return query;
        } else if (token.toUpperCase() == 'DELETE' || token.toUpperCase() == 'INSERT') {
            //  UPDATE STATEMENT @author Mehdi Terdjimi
            query.statementType = token;
            tokenIndex++;
            token = tokens[tokenIndex];

            if (token != 'DATA')  throw 'Expected DATA after ' + query.statementType +', having ' + token;

            tokenIndex++;
            token = tokens[tokenIndex];

            if (token != '{') throw 'Expected "{", having ' + token;

            for (tokenIndex++; tokenIndex < tokens.length; tokenIndex++) {
                token = tokens[tokenIndex];
                if(token.toUpperCase() == 'GRAPH') {
                    var parsed = this.parseGraph(tokens, tokenIndex, query),
                        query = parsed.query,
                        tokenIndex = parsed.index;
                    token = token[tokenIndex];
                } else if(!(token == '}' || token == '.')) {
                    var parsed = this.parseTriple(tokens, tokenIndex, query),
                        query = parsed.query,
                        tokenIndex = parsed.index;
                    token = tokens[tokenIndex];
                }
            }
        } else if (token.toUpperCase() !== 'SELECT') {
            throw 'SELECT, INSERT or DELETE statement expected, but "' + token + '" was found!';
        } else {
            query.statementType = 'SELECT';
            tokenIndex += 1;

            if (tokenIndex === tokenCount) {
                throw 'DISTINCT/REDUCED or variable declaration expected after "SELECT", but the end ' +
                    'of query text was found!';
            }

            token = tokens[tokenIndex].toUpperCase();

            if (token === 'DISTINCT') {
                query.distinctResults = true;
                tokenIndex += 1;
            } else if (token === 'REDUCED') {
                query.reducedResults = true;
                tokenIndex += 1;
            }

            if (tokenIndex === tokenCount) {
                throw 'Variable declarations are expected after DISTINCT/REDUCED, but the end of ' +
                    'the query text was found!';
            }

            token = tokens[tokenIndex];

            if (token === '*') {
                tokenIndex += 1;

                token = tokens[tokenIndex];
            } else {
                vars = [];

                // Parse SELECT variables.
                while (tokenIndex < tokenCount) {
                    token = tokens[tokenIndex];

                    if (token.toUpperCase() === 'WHERE' || token === '{' || token.toUpperCase() === 'FROM') {
                        break;
                    }

                    variable = this.parseVar(token);

                    if (variable) {
                        vars.push(variable);
                    } else {
                        throw 'The token "' + token + '" does not represent the valid variable!';
                    }

                    tokenIndex += 1;
                }

                if (vars.length === 0) {
                    throw 'No variable definitions found in the SELECT clause!';
                }

                query.variables = vars;
            }

            if (tokenIndex === tokenCount) {
                return query;
            }

            // Named graphs parsing
            query.graphs = [];
            while (tokens[tokenIndex] === 'FROM') {
                tokenIndex += 1;
                if (tokens[tokenIndex].toUpperCase() != 'NAMED') {
                    throw 'NAMED expected: only NAMED graphs are currently supported';
                }
                tokenIndex += 1;
                var graph = this.parseAbsoluteIri(tokens[tokenIndex]);
                query.graphs.push(graph);
                tokenIndex += 1;
            }

            if (tokens[tokenIndex].toUpperCase() === 'WHERE') {
                if (tokens[tokenIndex + 1] === '{') {
                    tokenIndex += 2; // Skip to the next token after '{'.
                } else {
                    throw 'WHERE clause should be surrounded with "{}"!';
                }
            } else if (tokens[tokenIndex] === '{') {
                tokenIndex += 1;
            } else {
                throw 'WHERE clause was expected, but "' + token + '" was found!';
            }

// Parsing WHERE clause.
            valueToRead = 0;

            while (tokenIndex < tokenCount) {
// TODO: Add parsing filters.
                token = tokens[tokenIndex];

                if (token === '}') {
                    if (valueToRead === 0) {
                        break;
                    } else {
                        throw 'RDF triple is not complete but the end of WHERE clause was found!';
                    }
                }

                if (valueToRead === 0) {
                    subject = this.parseVarOrTerm(token, query);

                    if (subject === null) {
                        throw 'Subject variable or term was expected but "' + token + '" was found!';
                    }

                    tokenIndex += 1;
                    valueToRead += 1;

                    if (tokenIndex === tokenCount) {
                        throw 'Predicate of the RDF triple expected, reached the end of text instead!';
                    }
                } else if (valueToRead === 1) {
                    predicate = this.parseVerb(token, query);

                    if (predicate === null) {
                        throw 'Predicate verb was expected but "' + token + '" was found!';
                    }

                    tokenIndex += 1;
                    valueToRead += 1;

                    if (tokenIndex === tokenCount) {
                        throw 'Object of the RDF triple expected, reached the end of text instead!';
                    }
                } else if (valueToRead === 2) {
                    object = this.parseVarOrTerm(token, query);

                    if (object === null) {
                        throw 'Object variable or term was expected but "' + token + '" was found!';
                    }

                    query.addTriple(subject, predicate, object);

                    valueToRead = 0;
                    tokenIndex += 1;

                    switch (tokens[tokenIndex]) {
                        case '.':
                            valueToRead = 0;
                            tokenIndex += 1;
                            break;
                        case ';':
                            valueToRead = 1;
                            tokenIndex += 1;
                            break;
                        case ',':
                            valueToRead = 2;
                            tokenIndex += 1;
                            break;
                    }
                }
            }

            if (tokenIndex === tokenCount) {
                throw '"}" expected but the end of query text found!';
            }

            tokenIndex += 1;

            if (tokenIndex === tokenCount) {
                return query;
            }

            if (tokens[tokenIndex].toUpperCase() === 'ORDER') {
                tokenIndex += 1;

                token = tokens[tokenIndex];


                if (token.toUpperCase() !== 'BY') {
                    throw '"BY" expected after "ORDER", but "' + token + '" was found!';
                }

                tokenIndex += 1;

                while (tokenIndex < tokenCount) {
                    token = tokens[tokenIndex];

                    if (token.toUpperCase() === 'LIMIT' || token.toUpperCase() === 'OFFSET') {
                        break;
                    }

                    variable = this.parseOrderByValue(token);

                    if (variable === null) {
                        throw 'Unknown token "' + token + '" was found in the ORDER BY clause!';
                    }

                    query.orderBy.push(variable);
                    tokenIndex += 1;
                }
            }

            while (tokenIndex < tokenCount) {
                token = tokens[tokenIndex].toUpperCase();

// Parse LIMIT clause.
                if (token === 'LIMIT') {
                    tokenIndex += 1;

                    if (tokenIndex === tokenCount) {
                        throw 'Integer expected after "LIMIT", but the end of query text found!';
                    }

                    token = tokens[tokenIndex];
                    query.limit = parseInt(token, 10);

                    if (isNaN(query.limit)) {
                        throw 'Integer expected after "LIMIT", but "' + token + '" found!';
                    }

                    tokenIndex += 1;
                } else if (token === 'OFFSET') {
// Parse OFFSET clause.
                    tokenIndex += 1;

                    if (tokenIndex === tokenCount) {
                        throw 'Integer expected after "OFFSET", but the end of query text found!';
                    }

                    token = tokens[tokenIndex];
                    query.offset = parseInt(token, 10);

                    if (isNaN(query.offset)) {
                        throw 'Integer expected after "OFFSET", but "' + token + '" found!';
                    }

                    tokenIndex += 1;
                } else {
                    throw 'Unexpected token "' + token + '" found!';
                }
            }
        }

        return query;
    },

    parseGraph: function(tokens, tokenIndex, query) {
        tokenIndex++;
        var token = tokens[tokenIndex], uri;
        try {
            uri = this.parseAbsoluteIri(token);
        } catch(e) {
            throw 'Expected URI, thrown ' + e.toString();
        }
        tokenIndex++;
        token = tokens[tokenIndex];
        if (token != '{') throw 'Expected "{", having ' + token;

        for (tokenIndex++; tokenIndex < tokens.length; tokenIndex++) {
            token = tokens[tokenIndex];
            if(token == '}') break;
            if(!(token == '}' || token == '.')) {
                var parsed = this.parseTriple(tokens, tokenIndex, query, uri),
                    query = parsed.query,
                    tokenIndex = parsed.index;
            }
        }

        return {
            index: tokenIndex,
            query: query
        }
    },

    parseTriple: function(tokens, tokenIndex, query, uri) {
        var subject, predicate, object, graphs,
            token = tokens[tokenIndex],
        subject = this.parseVarOrTerm(token, query);
        if(!uri) {
            graphs = [];
        } else {
            graphs = [uri];
        }

        tokenIndex++;
        token = tokens[tokenIndex];

        predicate = this.parseVarOrTerm(token, query);

        tokenIndex++;
        token = tokens[tokenIndex];

        object = this.parseVarOrTerm(token, query);
        query.addTriple(subject, predicate, object, graphs);

        return {
            index: tokenIndex,
            query: query
        }
    },

    /**
     * Parses the given string into the absolute IRI.
     *
     * @param token String containing the IRI.
     * @return Absolute IRI parsed from the string or null if the given string does not represent
     * an absolute IRI.
     */
    parseAbsoluteIri: function (token) {
        if (!this.iriRegExp) {
            this.init();
        }

        if (this.iriRegExp.test(token) && this.absoluteIriRegExp.test(token)) {
            return token.substring(1, token.length - 1);
        } else {
            return null;
        }
    },

    /**
     * Parses the given string into the object representing an IRI.
     *
     * @param token String containing the IRI.
     * @param baseIri IRI to use for resolving relative IRIs.
     * @return Object representing the IRI parsed or null if the given string does not represent an
     * IRI.
     */
    parseIriRef: function (token, baseIri) {
        var iriRef;

        if (!this.iriRegExp) {
            this.init();
        }

        if (!this.iriRegExp.test(token)) {
            return null;
        }

//CHANGEMENT Lionel : bug qui faisait qu'une IRI avec namespace était considérée comme une absolute IRI


        if (this.absoluteIriRegExp.test(token)) {
            iriRef = token.substring(1, token.length - 1);
        } else if (!!baseIri && this.localIriRegExp.test(token)) {
// TODO: This is very basic resolution!
            iriRef = baseIri + token.substring(1, token.length - 1);
        } else if (this.localIriRegExp.test(token)) { // Shouldn't do that without baseIri...
            iriRef = token.substring(1, token.length - 1);
        } else {
            return null;
        }

//ANCIEN CODE :
        /*
         if (!baseIri || this.absoluteIriRegExp.test(token)) {
         iriRef = token.substring(1, token.length - 1);
         } else {
         // TODO: This is very basic resolution!
         iriRef = baseIri + token.substring(1, token.length - 1);
         }
         */

        return {
            'type': this.ExpressionTypes.IRI_REF,
            'value': iriRef
        };
    },

    /**
     * Parses the given string into a literal.
     *
     * @param token String containing the literal.
     * @return (Object) {type: (exports.ExpressionTypes.LITERAL|*|rdfQuery.ExpressionTypes.LITERAL), value: *, lang: (*|null), dataType: null} parsed from the string or null if the token does not represent a valid
     * literal.
     * @param query
     */
    parseLiteral: function (token, query) {
        var dataTypeIri, localName, matches, matchIndex, prefix, value;
        //token = token.match(/(?:")(.+)(?:")/)[1];
        if (!this.rdfLiteralRegExp) {
            this.init();
        }

        matches = token.match(this.rdfLiteralRegExp);

        if (matches) {
            for (matchIndex = 0; matchIndex <= 4; matchIndex += 1) {
            //ancien code
            //for (matchIndex = 1; matchIndex <= 4; matchIndex += 1) {
                value = matches[matchIndex];

                if (value) {
                    break;
                }
            }

            dataTypeIri = matches[6] || null;

            if (!dataTypeIri) {
                prefix = matches[7] || '';
                localName = matches[8] || '';

                if (prefix !== '' || localName !== '') {
                    dataTypeIri = this.expandPrefixedName(prefix, localName, query);
                } else {
                    dataTypeIri = this.DataTypes.STRING;
                }
            }

            return {
                'type': this.ExpressionTypes.LITERAL,
                'value': value,
                'lang': matches[5] || null,
                'dataType': dataTypeIri
            };
        }

        if (this.intRegExp.test(token)) {
            return {
                'type': this.ExpressionTypes.LITERAL,
                'value': token,
                'dataType': this.DataTypes.INTEGER
            };
        }

        if (this.decimalRegExp.test(token)) {
            return {
                'type': this.ExpressionTypes.LITERAL,
                'value': token,
                'dataType': this.DataTypes.DECIMAL
            };
        }

        if (this.doubleRegExp.test(token)) {
            return {
                'type': this.ExpressionTypes.LITERAL,
                'value': token,
                'dataType': this.DataTypes.DOUBLE
            };
        }

        if (this.boolRegExp.test(token)) {
            return {
                'type': this.ExpressionTypes.LITERAL,
                'value': token,
                'dataType': this.DataTypes.BOOLEAN
            };
        }

        return null;
    },

    /**
     * Parses the given string into the object representing some value found in the order by clause.
     *
     * @param token String to parse.
     * @return Object representing the order by value parsed or null if token does not represent
     * a valid order by value.
     */
    parseOrderByValue: function (token) {
        // TODO: support not only variables in ORDER BY.
        var match, prefix;

        if (!this.orderByValueRegExp) {
            this.init();
        }

        match = token.match(this.orderByValueRegExp);

        if (match) {
            prefix = match[1];

            if (!prefix) {
                return {
                    'type': this.ExpressionTypes.VAR,
                    'value': match[0].substring(1), // remove the ? or $ in the variable
                    'order': 'ASC'
                };
            }

            return {
                'type': this.ExpressionTypes.VAR,
                'value': match[2].substring(1), // remove the ? or $ in the variable
                'order': match[1].toUpperCase()
            };
        }

        return null;
    },

    /**
     * Parses the given string into the IRI, assuming that it is a prefixed name.
     *
     * @param token String containing prefixed name.
     * @param query Query object with defined prefixes, which can be used for name expansion.
     * @return Object representing the prefixed name parsed or null if the token is not a prefixed
     * name.
     */
    parsePrefixedName: function (token, query) {
        var match, cleaned;

        //CHANGEMENTS Lionel
        //Conservait les caractères < et > dans le découpage du prefixed name...
        if (this.iriRegExp.test(token)) {
            cleaned = token.substring(1, token.length - 1);
        } else {
            cleaned = token;
        }

        if (!this.prefixedNameRegExp) {
            this.init();
        }

        match = cleaned.match(this.prefixedNameRegExp);

        if (!match) {
            return null;
        }

        return {
            'type': this.ExpressionTypes.IRI_REF,
            'value': this.expandPrefixedName(match[1], match[2], query)
        };
    },

    /**
     * Parses the given string into the string representing the prefix name.
     *
     * @param token String containing the prefix name.
     * @return Prefix name parsed or null if the given string does not contain a prefix name.
     */
    parsePrefixName: function (token) {
        if (!this.prefixRegExp) {
            this.init();
        }

        return (this.prefixRegExp.test(token)) ? token.substring(0, token.length - 1) : null;
    },

    /**
     * Returns a SPARQL variable or term represented by the given string.
     *
     * @param token String to parse into the variable or term.
     * @param query Reference to the query for which the variable or term is parsed.
     * @return Object representing the variable or a term parsed.
     */
    parseVarOrTerm: function (token, query) {
// See if it is a variable.
        var value = this.parseVar(token);

        if (value) {
            return value;
        }

// See if it is an IRI reference.
        value = this.parseIriRef(token, query.baseIri);

        if (value) {
            return value;
        }

// See if it is a prefixed name.
        value = this.parsePrefixedName(token, query);

        if (value) {
            return value;
        }

// See if it is a literal.
        value = this.parseLiteral(token, query);

        if (value) {
            return value;
        }

        return null;
    },

    /**
     * Parses a token into the variable.

     *
     * @param token Contains the text representing SPARQL variable.
     * @return Object representing the SPARQL variable, or null if the given token does not
     * represent a valid SPARQL variable.
     */
    parseVar: function (token) {
        if (this.varRegExp === null) {
            this.init();
        }

        if (!this.varRegExp.test(token)) {
            return null;
        }

        return {
            'type': this.ExpressionTypes.VAR,
            'value': token.substring(1) // Skip the initial '?' or '$'
        };
    },

    /**
     * Parses a token into the SPARQL verb.
     *
     * @param token String containing a SPARQL verb.
     * @param query Reference to the query for which the variable or term is parsed.
     * @return Object representing the SPARQL verb, or null if the given token does not represent a
     * valid SPARQL verb.
     */
    parseVerb: function (token, query) {
// See if it is a variable.
        var value = this.parseVar(token);

        if (value) {
            return value;
        }

// See if it is an IRI reference.
        value = this.parseIriRef(token, query.baseIri);

        if (value) {
            return value;
        }

// See if it is a prefixed name.
        value = this.parsePrefixedName(token, query);

        if (value) {
            return value;
        }

        if (token === 'a') {
            return {
                'type': this.ExpressionTypes.IRI_REF,
                'value': CONFIG.rdf.IRIs.TYPE
            };
        }

        return null;
    }
};

module.exports = {
    sparql: SPARQL
};

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/JswSPARQL.js","/core")
},{"./JswRDFQuery":7,"./JswXSD":13,"buffer":29,"pBGvAp":32}],9:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by Spadon on 14/10/2014.
 */

JswUtils = _dereq_('./JswUtils');

/**
 * TextFile objects allow loading the text content of the file specified by the url.
 *
 * @param url URL of the text file.
 */
var TextFile = function (url) {
    var newUrl = JswUtils.trim(url);

    if (!JswUtils.trim(newUrl)) {
        throw '"' + url + '" is not a valid url for a text file!';
    }

    /** URL of the file. */
    this.url = newUrl;
};

/** Prototype for all TextFile objects. */
// todo: re-adapt for nodejs application (no window object)
TextFile.prototype = {
    /**
     * Returns the content of the file as text.
     *
     * @returns Content of the file as text.
     */
    getText: function () {
        var newUrl = JswUtils.trim(this.url),
            xhr;

        if (!JswUtils.trim(newUrl)) {
            throw '"' + this.url + '" is not a valid url for a text file!';
        }

        if (window.XMLHttpRequest &&
            (window.location.protocol !== "file:" || !window.ActiveXObject)) {
            xhr = new XMLHttpRequest();
        } else {
            xhr = new window.ActiveXObject("Microsoft.XMLHTTP");
        }

        try {
            xhr.open('GET', this.url, false);
            xhr.send(null);
            return xhr.responseText;
        } catch (ex) {
            throw ex;
        }
    }
};

module.exports = TextFile;

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/JswTextFile.js","/core")
},{"./JswUtils":12,"buffer":29,"pBGvAp":32}],10:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by Spadon on 17/10/2014.
 */
var Fact = _dereq_('./Logics/Fact'),
    ReasoningEngine = _dereq_('./ReasoningEngine'),
    Utils = _dereq_('./Utils'),
    _ = _dereq_('lodash');

TrimPath = _dereq_('./TrimPathQuery'),
    rdf = _dereq_('./JswRDF'),
    owl = _dereq_('./JswOWL');

/** Allows to work with SQL representation of queries against RDF data. */
TrimQueryABox = function () {
    /** The object storing ABox data. */
    this.database = {
        ClassAssertion: [],
        ObjectPropertyAssertion: [],
        DataPropertyAssertion: []
    };

    /** The object which can be used to send queries against ABoxes. */
    this.queryLang = this.createQueryLang();
};

/** Prototype for all jsw.TrimQueryABox objects. */
TrimQueryABox.prototype = {
    processSql: function(queries) {
        var queryLang = this.createQueryLang(), responses = [];
        for (var key in queries) {
            var query = queries[key];
            responses.push(queryLang.parseSQL(query).filter(this.database));
        }
        return responses;
    },
    /**
     * Answers the given RDF query.
     *
     * @param query RDF query to answer.
     * @return Data set containing the results matching the query.
     */
    answerQuery: function (query, ontology, rules, RMethod) {
        var sql = this.createSql(query, ontology, rules, RMethod), sqlQueries = sql.split(';').slice(0,-1);
        return this.processSql(sqlQueries);
    },

    /**
     * Adds a class assertion to the database.
     *
     * @param individualIri IRI of the individual in the assertion.
     * @param classIri IRI of the class in the assertion.
     */
    addClassAssertion: function (individualIri, classIri) {
        var data = {
            individual: individualIri,
            className: classIri
        };

        if (JSON.stringify(this.database.ClassAssertion).indexOf(JSON.stringify(data)) === -1) {
            this.database.ClassAssertion.push(data);
        }
    },

    /**
     * Adds an object property assertion to the database.
     *
     * @param objectPropertyIri IRI of the object property in the assertion.
     * @param leftIndIri IRI of the left individual in the assertion.
     * @param rightIndIri IRI of the right individual in the assertion.
     */
    addObjectPropertyAssertion: function (objectPropertyIri, leftIndIri, rightIndIri) {
        var data = {
            objectProperty: objectPropertyIri,
            leftIndividual: leftIndIri,
            rightIndividual: rightIndIri
        };

        if (JSON.stringify(this.database.ObjectPropertyAssertion).indexOf(JSON.stringify(data)) === -1) {
            this.database.ObjectPropertyAssertion.push(data);
        }
    },

    /**
     * Adds data property assertion to the database.
     * @author Mehdi Terdjimi
     * @param dataPropertyIri IRI of the data property in the assertion.
     * @param leftIndIri IRI of the left individual in the assertion.
     * @param rightValue value of the data.
     */
    addDataPropertyAssertion: function (dataPropertyIri, leftIndIri, rightValue) {
        var data = {
            dataProperty: dataPropertyIri,
            leftIndividual: leftIndIri,
            rightValue: rightValue
        };

        if (JSON.stringify(this.database.DataPropertyAssertion).indexOf(JSON.stringify(data)) === -1) {
            this.database.DataPropertyAssertion.push(data);
        }
    },

    /**
     * Creates an object which can be used for sending queries against the database.
     *
     * @return Object which can be used for sending queries against the database.
     */
    createQueryLang: function () {
        return TrimPath.makeQueryLang({
            ClassAssertion: { individual: { type: 'String' },
                className: { type: 'String' },
                explicit: { type: 'Boolean' },
                obtainedFrom: { type: 'String'},
                graphs: { type: 'String' }},
            ObjectPropertyAssertion: { objectProperty: { type: 'String' },
                leftIndividual: { type: 'String' },
                rightIndividual: { type: 'String' },
                explicit: { type: 'Boolean' },
                obtainedFrom: { type: 'String'},
                graphs: { type: 'String' }},
            DataPropertyAssertion: { dataProperty: { type: 'String' },
                leftIndividual: { type: 'String' },
                rightValue: { type: 'String' },
                explicit: { type: 'Boolean' },
                obtainedFrom: { type: 'String'},
                graphs: { type: 'String' }}
        });
    },

    /** Appends a condition to the where clause based on the given expression.
     *

     * @param expr Expression to use for constructing a condition.
     * @param table Name of the table corresponding to the expression.
     * @param field Name of the field corresponding to the expression.
     */
    writeExprCondition: function(expr, table, field, where, varFields) {
        var type = expr.type,
            value = expr.value,
            varField;

        if (type === rdf.ExpressionTypes.IRI_REF || type === rdf.ExpressionTypes.LITERAL) {
            if(expr.graphs == true) {
                var values = Utils.unStringifyAddCommas(value);
                where += '(';
                for (var key in values) {
                    value = values[key].replace(/[\[\]"]/g, '');
                    where += table + '.' + field + " LIKE '" + value + "'";
                    if(key < values.length-1) where += ' OR ';
                }
                where += ') AND ';
            } else {
                if (type === rdf.ExpressionTypes.LITERAL) value = value.replace(/"/g, '\\"');
                where += table + '.' + field + "=='" + value + "' AND ";
            }
        } else if (type === rdf.ExpressionTypes.VAR) {
            varField = varFields[value];

            if (varField) {
                where += table + '.' + field + '==' + varField + ' AND ';
            } else {
                varFields[value] = table + '.' + field;
            }
        } else {
            throw 'Unknown type of expression found in the RDF query: ' + type + '!';
        }

        return {
            where: where,
            varFields: varFields
        };
    },

    /**
     * Returns an SQL representation of the given RDF query.
     *
     * @param query jsw.rdf.Query to return the SQL representation for.
     * @return string representation of the given RDF query.
     */
    createSql: function (query, ontology, R, RMethod) {
        var from, where, limit, object, objectField, objectType, orderBy, predicate, predicateType, predicateValue,
            predicateField, graphField, select, table, subjectField, table, triple, triples, tripleCount, tripleIndex, variable,
            vars, varCount, varField, varFields, varIndex, consequences, F, graphs;

        if (!RMethod) RMethod = ReasoningEngine.naive;

        if (query.statementType == 'DELETE') {
            F = this.convertAssertions();
            consequences = RMethod(new Array(), this.convertTriples(query.triples), F, R);
            query.triples = this.consequencesToTriples(consequences.updatedF, true);
            this.purgeABox();
            return this.createInsertStatement(query.triples).join('');

        } else if (query.statementType == 'INSERT') {
            F = this.convertAssertions();
            consequences = RMethod(this.convertTriples(query.triples), new Array(), F, R);
            query.triples = this.consequencesToTriples(consequences.updatedF, true);
            this.purgeABox();
            return this.createInsertStatement(query.triples).join('');

        } else if (query.statementType == 'SELECT') {
            from = '';
            where = '';
            varFields = {};
        } else {
                throw 'Statement type unrecognized.';
        }

        triples = query.triples;
        tripleCount = triples.length;

        for (tripleIndex = 0; tripleIndex < tripleCount; tripleIndex += 1) {
            triple = triples[tripleIndex];

            predicate = triple.predicate;
            object = triple.object;
            predicateType = predicate.type;
            predicateValue = predicate.value;
            objectType = object.type;
            subjectField = 'leftIndividual';
            objectField = 'rightIndividual';
            graphField = 'graphs';
            table = 't' + tripleIndex;
            graphs = {
                type: rdf.ExpressionTypes.LITERAL,
                value: Utils.stringifyNoComma(_.sortBy(query.graphs)),
                graphs: true
            };

            if (predicateValue === rdf.IRIs.TYPE) {
                from += 'ClassAssertion AS ' + table + ', ';
                subjectField = 'individual';
                objectField = 'className';
                // todo traiter le cas ou dprop n'est pas reference
            } else if (predicateValue in ontology.entities[owl.ExpressionTypes.ET_DPROP]) {
                objectField = 'rightValue';
                from += 'DataPropertyAssertion AS ' + table + ', ';
                varField = varFields[predicateValue];
                predicateField = 'dataProperty';
                if (varField) {
                    where += table + '.dataProperty==' + varField + ' AND ';
                } else {
                    varFields[predicateValue] = table + '.dataProperty';
                }

            // for now, we consider this...
            } else if (predicateType === rdf.ExpressionTypes.IRI_REF) {
                from += 'ObjectPropertyAssertion AS ' + table + ', ';
                varField = varFields[predicateValue];
                predicateField = 'objectProperty';
                if (varField) {
                    where += table + '.objectProperty==' + varField + ' AND ';
                } else {
                    varFields[predicateValue] = table + '.objectProperty';
                }
            } else {
                throw 'Unknown type of a predicate expression: ' + predicateType + '!';
            }

            var subjectCond = this.writeExprCondition(triple.subject, table, subjectField, where, varFields);
            where = subjectCond.where;
            varFields = subjectCond.varFields;

            if(predicateField) {
                var predicateCond = this.writeExprCondition(triple.predicate, table, predicateField, where, varFields);
                where = predicateCond.where;
                varFields = predicateCond.varFields;
            }

            if(graphs.value != '') {
                var graphCond = this.writeExprCondition(graphs, table, graphField, where, varFields);
                where = graphCond.where;
                varFields = graphCond.varFields;
            }

            var objectCond = this.writeExprCondition(triple.object, table, objectField, where, varFields);
            where = objectCond.where;
            varFields = objectCond.varFields;
        }

        if (tripleCount > 0) {
            from = ' FROM ' + from.substring(0, from.length - 2);
        }

        if (where.length > 0) {
            where = ' WHERE ' + where.substring(0, where.length - 5);
        }

        select = '';
        vars = query.variables;
        varCount = vars.length;

        if (varCount > 0) {
            for (varIndex = 0; varIndex < varCount; varIndex += 1) {
                variable = vars[varIndex].value;
                varField = varFields[variable];

                if (varField) {
                    select += varField + ' AS ' + variable + ', ';
                } else {
                    select += "'' AS " + variable + ', ';
                }
            }
        } else {
            for (variable in varFields) {
                if (varFields.hasOwnProperty(variable)) {
                    select += varFields[variable] + ' AS ' + variable + ', ';
                }
            }
        }

        if (select.length > 0) {
            select = select.substring(0, select.length - 2);
        } else {
            throw 'The given RDF query is in the wrong format!';
        }

        if (query.distinctResults) {
            select = 'SELECT DISTINCT ' + select;
        } else {
            select = 'SELECT ' + select;
        }

        orderBy = '';
        vars = query.orderBy;
        varCount = vars.length;

        for (varIndex = 0; varIndex < varCount; varIndex += 1) {
            variable = vars[varIndex];

            if (variable.type !== rdf.ExpressionTypes.VAR) {
                throw 'Unknown type of expression found in ORDER BY: ' + variable.type + '!';
            }

            orderBy += variable.value + ' ' + variable.order + ', ';
        }

        if (varCount > 0) {
            orderBy = ' ORDER BY ' + orderBy.substring(0, orderBy.length - 2);
        }

        limit = '';

        if (query.limit !== 0) {

            limit = ' LIMIT ';
            if (query.offset !== 0) {
                limit += query.offset + ', ';
            }
            limit += query.limit;
        } else if (query.offset !== 0) {
            limit = ' LIMIT ' + query.offset + ', ALL';
        }

        return select + from + where + orderBy + limit + ';';
    },

    /**
     * Convert JSW assertion facts into formal Logics.js facts
     * @author Mehdi Terdjimi
     */
    convertAssertions: function() {
        var assertion,
            facts = [],
            rdfType = rdf.IRIs.TYPE;

        for(var key in this.database.ClassAssertion) {
            assertion = this.database.ClassAssertion[key];
            facts.push(
                new Fact(rdfType,
                    assertion.individual,
                    assertion.className,
                    Utils.unStringifyAddCommas(assertion.obtainedFrom),
                    Utils.booleize(assertion.explicit),
                    Utils.unStringifyAddCommas(assertion.graphs)))
        }

        for(var key in this.database.ObjectPropertyAssertion) {
            assertion = this.database.ObjectPropertyAssertion[key];
            facts.push(
                new Fact(assertion.objectProperty,
                    assertion.leftIndividual,
                    assertion.rightIndividual,
                    Utils.unStringifyAddCommas(assertion.obtainedFrom),
                    Utils.booleize(assertion.explicit),
                    Utils.unStringifyAddCommas(assertion.graphs)))
        }

        for(var key in this.database.DataPropertyAssertion) {
            assertion = this.database.DataPropertyAssertion[key];
            facts.push(
                new Fact(assertion.dataProperty,
                    assertion.leftIndividual,
                    assertion.rightValue,
                    Utils.unStringifyAddCommas(assertion.obtainedFrom),
                    Utils.booleize(assertion.explicit),
                    Utils.unStringifyAddCommas(assertion.graphs)))
        }

        return facts;
    },

    /**
     * Convert JSW triples into formal Logics.js facts
     * @author Mehdi Terdjimi
     */
    convertTriples: function(triples) {
        var sub, pred, obj, graphs,
            newFacts = [];
        for(var key in triples) {
            var triple = triples[key];
            sub = triple.subject;
            pred = triple.predicate;
            obj = triple.object;
            graphs = triple.graphs;
            newFacts.push(new Fact(pred.value, sub.value, obj.value, [], true, graphs));
        }

        return newFacts;
    },

    /** Used to suit JSW requirements
     *
     * @param consequences
     * @returns {Array}
     */
    consequencesToTriples: function(consequences, explicit) {
        var triples = [];
        for(var key in consequences) {
            var fact = consequences[key];
            if(fact.object.match(/"[^"]*"/g)) {
                triples.push({
                    subject: {
                        value: fact.subject,
                        type: rdf.ExpressionTypes.IRI_REF
                    },
                    predicate : {
                        value: fact.predicate,
                        type: rdf.ExpressionTypes.IRI_REF
                    },
                    object: {
                        value: fact.object,
                        type: rdf.ExpressionTypes.LITERAL
                    },
                    explicit: explicit,
                    obtainedFrom: fact.causedBy,
                    graphs: fact.graphs
                });
            } else {
                triples.push({
                    subject: {
                        value: fact.subject,
                        type: rdf.ExpressionTypes.IRI_REF
                    },
                    predicate : {
                        value: fact.predicate,
                        type: rdf.ExpressionTypes.IRI_REF
                    },
                    object: {
                        value: fact.object,
                        type: rdf.ExpressionTypes.IRI_REF
                    },
                    explicit: explicit,
                    obtainedFrom: fact.causedBy,
                    graphs: fact.graphs
                });
            }
        }
        return triples;
    },

    createInsertStatement: function(triples) {
        var tuples, statement,
            insert = 'INSERT',
            into = ' INTO ',
            values = ' VALUES',
            statements = [],
            table;

        for (var tripleKey in triples) {
            var triple = triples[tripleKey];
            // If it is an assertion... //todo proposer une meilleure lisibilit�
            if (triple.predicate.value == rdf.IRIs.TYPE) {
                table = "ClassAssertion ('individual', 'className', 'explicit', 'obtainedFrom', 'graphs')";
                tuples = " ('" + triple.subject.value + "', '" + triple.object.value + "', '" + triple.explicit + "', '" + Utils.stringifyNoComma(triple.obtainedFrom) + "', '" + Utils.stringifyNoComma(_.sortBy(triple.graphs)).replace(/"/g, '\\"') + "')";
            } else if (triple.predicate.type == rdf.ExpressionTypes.IRI_REF && triple.object.type == rdf.ExpressionTypes.IRI_REF) {
                table = "ObjectPropertyAssertion ('objectProperty', 'leftIndividual', 'rightIndividual', 'explicit', 'obtainedFrom', 'graphs')";
                tuples = " ('" + triple.predicate.value + "', '" + triple.subject.value + "', '" + triple.object.value + "', '" + triple.explicit + "', '" + Utils.stringifyNoComma(triple.obtainedFrom) + "', '" + Utils.stringifyNoComma(_.sortBy(triple.graphs)).replace(/"/g, '\\"') + "')";
            } else if (triple.predicate.type == rdf.ExpressionTypes.IRI_REF && triple.object.type == rdf.ExpressionTypes.LITERAL) {
                table = "DataPropertyAssertion ('dataProperty', 'leftIndividual', 'rightValue', 'explicit', 'obtainedFrom', 'graphs')";
                tuples = " ('" + triple.predicate.value + "', '" + triple.subject.value + "', '" + triple.object.value + "', '" + triple.explicit + "', '" + Utils.stringifyNoComma(triple.obtainedFrom) + "', '" + Utils.stringifyNoComma(_.sortBy(triple.graphs)).replace(/"/g, '\\"') + "')";
            } else {
                throw 'Unrecognized assertion type.';
            }

            statement = insert + into + table + values + tuples + ";";
            statements.push(statement);
        }
        return statements;
    },

    purgeABox: function() {
        this.database.ClassAssertion = [];
        this.database.DataPropertyAssertion = [];
        this.database.ObjectPropertyAssertion = [];
    }

};


module.exports = {
    trimQueryABox: TrimQueryABox
};

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/JswTrimQueryABox.js","/core")
},{"./JswOWL":1,"./JswRDF":6,"./Logics/Fact":14,"./ReasoningEngine":20,"./TrimPathQuery":21,"./Utils":22,"buffer":29,"lodash":31,"pBGvAp":32}],11:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by Spadon on 17/10/2014.
 */

/**
 * Triple storage can be used to hash 3-tuples by the values in them in some order.
 *
 * @return Object which can be used to hash 3-tuples by the values in them in some order.
 */
var TripleStorage = function () {
    /**
     * Data structure holding all 3-tuples.
     */
    this.storage = {};
};

TripleStorage.prototype = {
    /**
     * Returns all Triples for a fixed value of the 1-st element in Triples and (optionally) the
     * 2-nd one.
     *
     * @param first Value of the first element of the returned Triples.
     * @param second (optional) Value of the second element of the returned Triples.
     * @return Object containing the Triples requested.
     */
    get: function (first, second) {
        var firstTuples;

        if (!first) {
            return this.storage;
        }

        firstTuples = this.storage[first];

        if (!firstTuples) {
            return {};
        }

        if (!second) {
            return firstTuples;
        }

        return firstTuples[second] || {};
    },

    /**
     * Adds the given Triple to the storage.
     *
     * @param first Value of the first element in the Triple.
     * @param second Value of the second element in the Triple.
     * @param third Value of the third element in the Triple.
     */
    add: function (first, second, third) {
        var storage = this.storage;

        if (!storage[first]) {
            storage[first] = {};
        }

        if (!storage[first][second]) {
            storage[first][second] = {};
        }

        storage[first][second][third] = true;
    },

    /**
     * Checks if the given Triple exists in the storage.
     *
     * @param first Value of the first element in the Triple.
     * @param second Value of the second element in the Triple.
     * @param third Value of the third element in the Triple.
     * @return (boolean) True if the value exists, false otherwise.
     */
    exists: function (first, second, third) {
        var storage = this.storage,
            firstStorage = storage[first],
            secondStorage;

        if (!firstStorage) {
            return false;
        }

        secondStorage = firstStorage[second];

        if (!secondStorage) {
            return false;
        }

        return secondStorage[third];


    }
};

module.exports = {
    tripleStorage: TripleStorage
};

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/JswTripleStorage.js","/core")
},{"buffer":29,"pBGvAp":32}],12:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by Spadon on 14/10/2014.
 */

DOMParser = _dereq_('./xmldom/dom-parser').DOMParser;

JswUtils = {

    /**
     * Parses string into the XML DOM object in a browser-independent way.
     * @param xml String containing the XML text to parse.
     * @return XML DOM object representing the parsed XML.
     */
    parseString: function (xml) {
        var xmlDoc;

        xml = this.trim(xml);
        xmlDoc = new DOMParser().parseFromString(xml, 'text/xml');

            if (xmlDoc.nodeName === 'parsererror') {
                throw xmlDoc.childNodes[0].nodeValue;
            } else if (xmlDoc.childNodes && xmlDoc.childNodes[0] &&
                xmlDoc.childNodes[0].childNodes &&
                xmlDoc.childNodes[0].childNodes[0] &&
                xmlDoc.childNodes[0].childNodes[0].nodeName === 'parsererror') {

                throw xmlDoc.childNodes[0].childNodes[0].childNodes[1].innerText;
            }

            return xmlDoc;
    },

    /**
     * Checks if the given string is a valid URL.
     * @param str String to check.
     * @return boolean : true if the given string is a URL, false otherwise.
     */
    isUrl: function (str) {
        var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
        return regexp.test(str);
    },

    /**
     * Removes space characters at the start and end of the given string.
     *
     * @param str String to trim.
     * @return New string with space characters removed from the start and the end.
     */
    trim: function (str) {
        return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }
};

module.exports = JswUtils;

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/JswUtils.js","/core")
},{"./xmldom/dom-parser":23,"buffer":29,"pBGvAp":32}],13:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by Spadon on 17/10/2014.
 */
XSD = function() {
// ============================== XSD namespace ===============================

    var xsd = {};

    /** Contains the URIs of (some) datatypes of XML Schema. */
    xsd.DataTypes = {
        /** IRI of boolean data type. */
        BOOLEAN: 'http://www.w3.org/2001/XMLSchema#boolean',
        /** IRI of decimal data type. */
        DECIMAL: 'http://www.w3.org/2001/XMLSchema#decimal',
        /** IRI of a double data type. */
        DOUBLE: 'http://www.w3.org/2001/XMLSchema#double',
        /** IRI of a integer data type. */
        INTEGER: 'http://www.w3.org/2001/XMLSchema#integer',
        /** IRI of a string data type. */
        STRING: 'http://www.w3.org/2001/XMLSchema#string'
    };

    return xsd;
};

module.exports = {
    xsd: function() {
        return new XSD();
    }
};

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/JswXSD.js","/core")
},{"buffer":29,"pBGvAp":32}],14:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by mt on 21/12/2015.
 */

/**
 * Fact in the form subClassOf(a, b)
 * @param name fact's/axiom name (e.g. subClassOf)
 * @param li left individual
 * @param ri right individual
 * @param originFacts array of facts causing this
 * @constructor
 */
Fact = function(name, li, ri, originConjs, expl, graphs) {
    if(originConjs === undefined) originConjs = [];
    if(graphs === undefined) graphs = [];

    this.predicate = name;
    this.subject = li;
    this.object = ri;
    this.causedBy = originConjs;
    this.explicit = expl;
    this.graphs = graphs;
    this.valid = true;
};

Fact.prototype = {

    /**
     * Convenient method to stringify a fact.
     * @returns {string}
     */
    toString: function() {
        var e;
        this.explicit ? e = 'E' : e = 'I';
        return e + '(' + this.subject + ', ' + this.predicate + ', ' + this.object + ')';
    },

    /**
     * Checks if the fact is equivalent to another fact.
     * @param fact
     * @returns {boolean}
     */
    equivalentTo: function(fact) {
        if ((this.subject != fact.subject) ||
            (this.predicate != fact.predicate) ||
            (this.object != fact.object)) {
            return false;
        }
        return true;
    },

    /**
     * Returns the fact if it appears in a set of facts.
     * Returns false otherwise.
     * @param factSet
     */
    appearsIn: function(factSet) {
        var that = this;
        for (var key in factSet) {
            if(that.equivalentTo(factSet[key])){
                return that;
            }
        }
        return false;
    },

    isValid: function(fe) {
        for (var key in this.causedBy) {
            var valid = true,
                conj = this.causedBy[key];
            for (var i = 0; i < conj.length; i++) {
                for (var j = 0; j < fe.length; j++) {
                    if(fe[j] == conj[i]) {
                        valid = valid && fe[j].valid;
                        break;
                    }
                }
            }
            if (valid) {
                return true;
            }
        }
        return false;
    },

    setCauses: function(conjunction) {
        this.causedBy = [[]];
        this.explicit = false;
        for (var i = 0; i < conjunction.length; i++) {
            if(conjunction[i].causedBy.length > 0) {
                for (var j = 0; j < conjunction[i].causedBy.length; j++) {
                    this.causedBy[0] = this.causedBy[0].concat((conjunction[i].causedBy[j]));
                }
            } else {
                this.causedBy[0].push(conjunction[i].toString());
            }
        }
    }
};

module.exports = Fact;


}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/Logics/Fact.js","/core/Logics")
},{"buffer":29,"pBGvAp":32}],15:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by MT on 11/09/2015.
 * Logics module
 */

/**
 * All necessary stuff around the Logics module
 * @type {{substractFactSets: Function, mergeFactSets: Function}}
 */
module.exports = {
    /**
     * Returns fs1 without the facts occuring in fs2.
     * If a fact in fs2 also appears on any graph not concerned by fs1,
     * it only removes the graph concerned by fs1
     * without removing the fact from fs2.
     * @param fs1
     * @param fs2
     */
    substractFactSets: function(fs1, fs2) {
        var fact, result = [], t = [];
        for (var i = 0; i < fs1.length; i++) {
            fact = fs1[i];
            if(!fact.appearsIn(fs2)) {
                result.push(fact);
            }
        }
        return result;
    },

    substractGraphSets: function(f1, f2) {
        var graphs = [];
        for(var key in f1.graphs) {
            var gf1 = f1.graphs[key];
            if(JSON.stringify(f2).indexOf(gf1) == -1) {
                graphs.push(gf1);
            }
        }
        f1.graphs = graphs;
        return f1;
    },

    restrictToGraphs: function(fs, gs) {
        var fr = [];
        if(!gs || gs.length == 0) return fs;
        for (var key in fs) {
            if(this.shareSomeGraph(fs[key].graphs, gs)) {
                fr.push(fs[key])
            }
        }
        return fr;
    },

    shareSomeGraph: function(gs1, gs2) {
        if(gs1.length == 0 && gs2.length == 0) return true;
        for (var key in gs1) {
            if(JSON.stringify(gs2).indexOf(JSON.stringify(gs1[key])) != -1) return true;
        }
        return false;
    },

    /**
     * True-like merge, which also merges
     * identical facts obtainedFrom properties.
     * @param fs1
     * @param fs2
     */
    mergeFactSets: function(fs1, fs2) {
        var fact,
            maxMin = this.maxMin(fs1, fs2),
            fsMax = maxMin.max,
            fsMin = maxMin.min;

        for (var i = 0; i < fsMin.length; i++) {
            fact = fsMin[i];
            fsMax = this.findAndMerge(fsMax, fact);
        }
        return fsMax;
    },

    mergeFactSetsIn: function(_set) {
        var that = this, fs,
            finalSet = [];
        for (var i = 0; i < _set.length; i++) {
            fs = _set[i];
            finalSet = that.mergeFactSets(fs, finalSet);
        }
        return finalSet;
    },

    getOnlyImplicitFacts: function(fs) {
        var fR = [];
        for (var key in fs) {
            var fact = fs[key];
            if(!fact.explicit) {
                fR.push(fact);
            }
        }
        return fR;
    },

    getOnlyExplicitFacts: function(fs) {
        var fR = [];
        for (var key in fs) {
            var fact = fs[key];
            if(fact.explicit) {
                fR.push(fact);
            }
        }
        return fR;
    },

    restrictFactSet: function(rule, fs) {
        var restriction = [];

        for (var k = 0; k < fs.length; k++) {
            var fact = fs[k];

            for (var i = 0; i < rule.causes.length; i++) {
                var cause = rule.causes[i];

                if (this.causeMatchesFact(cause, fact)) {
                    restriction.push(fact)
                    break;
                }
            }
        }

        return restriction;
    },

    restrictRuleSet: function(rs, fs) {
        var restriction = [];

        for (var i = 0; i < rs.length; i++) {
            var rule = rs[i], matches = false;

            for (var j = 0; j < rule.causes.length; j++) {
                var cause = rule.causes[j];

                for (var k = 0; k < fs.length; k++) {
                    var fact = fs[k];

                    if (this.causeMatchesFact(cause, fact)) {
                        matches = true;
                        break;
                    }
                }

                if (matches) {
                    restriction.push(rule);
                    break;
                }
            }
        }

        return restriction;
    },

    causeMatchesFact: function(cause, fact) {
        return this.causeMemberMatchesFactMember(cause.subject, fact.subject)
            && this.causeMemberMatchesFactMember(cause.predicate, fact.predicate)
            && this.causeMemberMatchesFactMember(cause.object, fact.object);
    },

    causeMemberMatchesFactMember: function(causeMember, factMember) {
        if (this.isVariable(causeMember)) {
            return true;
        } else if(causeMember == factMember) {
            return true;
        } else {
            return false;
        }
    },

    mergeGraphs: function(fs) {
        var graphs = [];
        for(var key in fs) {
            var f = fs[key];
            graphs = this.uniques(graphs, f.graphs);
        }
        return graphs;
    },

    graphsFrom: function(gs) {
        var graphs = [];
        for (var key in gs) {
            var currGraphs = gs[key].graphs;
            graphs = this.uniques(graphs, currGraphs);
        }
        return graphs;
    },

    restrictToGraphsFrom: function(fsRet, fsSrc) {
        return this.restrictToGraphs(fsRet, this.graphsFrom(fsSrc));
    },

    /**
     * Merges two facts' obtainedWith properties
     * if they are equivalent (otherwise, returns false).
     */
    mergeFacts: function(f1, f2) {
        if(!(f1.equivalentTo(f2))) {
            return false;
        } else {
            f1.causedBy = this.uniques(f1.causedBy, f2.causedBy);
            f1.graphs = this.uniques(f1.graphs, f2.graphs);
            return f1;
        }
    },

    /**
     * Finds the fact in the set
     * and merges their causes / graphs appearance.
     */
    findAndMerge: function(fs, fact) {
        var merged;
        for(var key in fs) {
            merged = this.mergeFacts(fs[key], fact);
            if (merged) {
                fs[key] = merged;
                return fs;
            }
        }

        fs.push(fact);
        return fs;
    },

    /**
     * Checks if a set of facts is a subset of another set of facts.
     * @param fs1 the superset
     * @param fs2 the potential subset
     */
    containsFacts: function(fs1, fs2) {
        if(!fs2 || (fs2.length > fs1.length)) return false;
        for (var key in fs2) {
            var fact = fs2[key];
            if(!(fact.appearsIn(fs1))) {
                return false;
            }
        }
        return true;
    },

    /**
     * Returns the max and min from two sets of facts
     * (cloning)
     * @param fs1
     * @param fs2
     * @returns {{max: *, min: *}}
     */
    maxMin: function(fs1, fs2) {
        if (fs1.length > fs2.length) return {
            max: fs1,
            min: fs2
        };
        return {
            max: fs2,
            min: fs1
        };
    },

    /**
     * Invalidates a fact.
     * @param fs1
     * @param fs2
     * @returns {Array}
     */
    invalidate: function(fs1, fs2) {
        var invalidated = [], f2;
        for (var i = 0; i < fs2.length; i++) {
            f2 = fs2[i];
            if(f2.appearsIn(fs1)) {
                f2.valid = false;
                invalidated.push(f2);
            }
        }
        return invalidated;
    },

    /**
     * @deprecated Computes each conjunction given a set of facts, order-independently
     * @param facts
     * @param max
     * @param imin
     * @returns {*}
     */
    computeConjunctions: function(facts, max, imin) {
        var conjs, others, combine;
        if(imin === undefined) {
            imin = 0;
        }
        if ((max == 0) || (imin == facts.length)) {
            return [];
        }
        conjs = [[facts[imin]]];
        others = this.computeConjunctions(facts, max, imin+1);

        for (var j = 0; j < others.length; j++) {
            if (others[j].length < max) {
                combine = others[j].slice();
                combine.push(facts[imin]);
                conjs.push(combine);
            }
        }
        return conjs.concat(others);
    },

    /**
     * Returns a set of elements
     * with distinct string representation.
     * @warning does not merge facts
     * @param _set1
     * @param _set2
     * @returns {Array}
     */
    uniques: function(_set1, _set2) {
        var hash = {}, uniq = [],
            fullSet = _set1.concat(_set2);

        for (var i = 0; i < fullSet.length; i++) {
            hash[fullSet[i].toString()] = fullSet[i];
        }

        for (var key in hash) {
            uniq.push(hash[key]);
        }
        return uniq;
    },

    minus: function(_set1, _set2) {
        var flagEquals,
            newSet = [];
        for (var i = 0; i < _set1.length; i++) {
            flagEquals = false;
            for(var j = 0; j < _set2.length; j++) {
                if (_set1[i].toString() == _set2[j].toString()) {
                    flagEquals = true;
                    break;
                }
            }
            if (!flagEquals) {
                newSet.push(_set1[i]);
            }
        }

        return newSet;
    },

    isVariable: function(str) {
        try {
            return (str.indexOf('?') === 0);
        } catch(e) {
            return false;
        }
    },
};
}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/Logics/Logics.js","/core/Logics")
},{"buffer":29,"pBGvAp":32}],16:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by mt on 21/12/2015.
 */

/**
 * Rule in the form subClassOf(a, b) ^ subClassOf(b, c) -> subClassOf(a, c)
 * i.e. conjunction of facts
 * @param slf set of (left side) conjunctive facts
 * @param ra the consequence facts
 * @constructor
 */
Rule = function(slf, srf) {
    this.causes = slf;
    this.consequences = srf;
};

Rule.prototype = {
    /**
     * Convenient method to stringify a rule.
     * @returns {string}
     */
    toString: function() {
        var factConj = '';
        for(var key in this.causes) {
            factConj += ' ^ ' + this.causes[key].toString();
        }
        return factConj.substr(3) + ' -> ' + this.consequences.toString();
    },

    orderCausesByMostRestrictive: function() {
        var orderedCauses = [],
            totalConstantOccurences = [];

        for (var i = 0; i < this.causes.length; i++) {
            var cause = this.causes[i],
                constantOccurences = 0;
            if (!(cause.subject.indexOf('?') === 0)) {
                constantOccurences++;
            }
            if (!(cause.predicate.indexOf('?') === 0)) {
                constantOccurences++;
            }
            if (!(cause.object.indexOf('?') === 0)) {
                constantOccurences++;
            }
            totalConstantOccurences.push({
                cause: cause,
                constantOccurences: constantOccurences
            });
        }

        totalConstantOccurences = totalConstantOccurences.sort(function(a, b) {
            var x = a.constantOccurences; var y = b.constantOccurences;
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        });

        for(var i = 0; i < totalConstantOccurences.length; i++) {
            orderedCauses.push(totalConstantOccurences[i].cause);
        }

        this.causes = orderedCauses;
    }
};

module.exports = Rule;
}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/Logics/Rule.js","/core/Logics")
},{"buffer":29,"pBGvAp":32}],17:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by pc on 27/01/2016.
 */

var Fact = _dereq_('./Fact');
var Logics = _dereq_('./Logics');

Solver = {

    evaluateRuleSet: function(rs, facts) {
        var newCons, cons = [];
        for (var key in rs) {
            newCons = this.evaluateThroughRestriction(rs[key], facts);
            cons = Logics.uniques(cons, newCons);
        }
        return cons;
    },

    evaluateThroughRestriction: function(rule, facts) {
        var pastConsequences = [],
            newConsequences,
            matchingFacts = {};

        rule.orderCausesByMostRestrictive();

        while ((newConsequences === undefined) || (newConsequences.length > pastConsequences.length)) {
            var j = 0,
                mapping = {};

            if (newConsequences === undefined) {
                newConsequences = [];
            } else {
                pastConsequences = newConsequences;
            }

            for (var i = 0; i < facts.length; i++) {
                var fact = facts[i],
                    cause = rule.causes[j],
                    consequences,
                    currentMatchingFacts = [];

                if(matchingFacts[fact.toString()] === undefined) {
                    matchingFacts[fact.toString()] = [];
                }

                if (matchingFacts[fact.toString()][j] === undefined) {
                    if (this.factMatchesCause(fact, cause, mapping)) { // updates mapping
                        matchingFacts[fact.toString()][j] = cause.toString();
                        currentMatchingFacts.push(fact);
                        i = -1; j++;
                    }
                }

                consequences = this.replaceMappings(mapping, rule, currentMatchingFacts);

                if (consequences.length > 0) {
                    newConsequences = Logics.uniques(pastConsequences, consequences);
                    break;
                }
            }
        }

        return newConsequences;
    },

    factMatchesCause: function(fact, cause, mapping) {
        var localMapping = {}; // so that global mapping is not altered in case of false returning

        if (Logics.isVariable(cause.subject)) {
            if (mapping[cause.subject] && (mapping[cause.subject] != fact.subject)) {
                return false;
            } else {
                localMapping[cause.subject] = fact.subject;
            }
        } else {
            if (fact.subject != cause.subject) {
                return false;
            }
        }

        if (Logics.isVariable(cause.predicate)) {
            if (mapping[cause.predicate] && (mapping[cause.predicate] != fact.predicate)) {
                return false;
            } else {
                localMapping[cause.predicate] = fact.predicate;
            }
        } else {
            if (fact.predicate != cause.predicate) {
                return false;
            }
        }

        if (Logics.isVariable(cause.object)) {
            if (mapping[cause.object] && (mapping[cause.object] != fact.object)) {
                return false;
            } else {
                localMapping[cause.object] = fact.object;
            }
        } else {
            if (fact.object != cause.object) {
                return false;
            }
        }

        for (var key in localMapping) {
            mapping[key] = localMapping[key];
        }
        return true;
    },

    replaceMappings: function(mapping, rule, matchingFacts) {
        var consequences = [],
            consequence;
        for (var i = 0; i < rule.consequences.length; i++) {
            consequence = this.replaceMapping(mapping, rule.consequences[i]);
            if(consequence) {
                consequence.causedBy = [];
                consequence.causedBy.push(matchingFacts);
                consequence.explicit = false;
                consequences.push(consequence);
            }
        }
        return consequences;
    },

    replaceMapping: function(mapping, ruleFact) {
        var consequence = new Fact();
        if (!mapping) {
            return false;
        }

        if(Logics.isVariable(ruleFact.subject)) {
            if (mapping[ruleFact.subject] !== undefined) {
                consequence.subject = mapping[ruleFact.subject]
            } else {
                return false;
            }
        }  else {
            consequence.subject = ruleFact.subject;
        }

        if(Logics.isVariable(ruleFact.predicate)) {
            if (mapping[ruleFact.predicate] !== undefined) {
                consequence.predicate = mapping[ruleFact.predicate]
            } else {
                return false;
            }
        } else {
            consequence.predicate = ruleFact.predicate;
        }

        if(Logics.isVariable(ruleFact.object)) {
            if (mapping[ruleFact.object] !== undefined) {
                consequence.object = mapping[ruleFact.object]
            } else {
                return false;
            }
        }  else {
            consequence.object = ruleFact.object;
        }

        return consequence;
    }
};

module.exports = Solver;
}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/Logics/Solver.js","/core/Logics")
},{"./Fact":14,"./Logics":15,"buffer":29,"pBGvAp":32}],18:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by MT on 17/09/2015.
 */

/**
 * OWL2RL spec from http://www.w3.org/TR/owl2-profiles
 * @author Mehdi Terdjimi
 * @type {{rules: *[]}}
 */

var Rule = _dereq_('./Logics/Rule'),
    Fact = _dereq_('./Logics/Fact'),
    JswRDF = _dereq_('./JswRDF'),
    JswOWL = _dereq_('./JswOWL');

OWL2RL = {
    rules: {
        classSubsumption: [
            // scm-sco
            new Rule([
                    new Fact(JswRDF.IRIs.SUBCLASS, '?c1', '?c2', [], true),
                    new Fact(JswRDF.IRIs.SUBCLASS, '?c2', '?c3', [], true)],
                [new Fact(JswRDF.IRIs.SUBCLASS, '?c1', '?c3', [], true)]),

            // cax-sco
            new Rule([
                    new Fact(JswRDF.IRIs.SUBCLASS, '?c1', '?c2', [], true),
                    new Fact(JswRDF.IRIs.TYPE, '?x', '?c1', [], true)],
                [new Fact(JswRDF.IRIs.TYPE, '?x', '?c2', [], true)])
        ],

        propertySubsumption: [
            // scm-spo
            new Rule([
                    new Fact('http://www.w3.org/2000/01/rdf-schema#subPropertyOf', '?p1', '?p2', [], true),
                    new Fact('http://www.w3.org/2000/01/rdf-schema#subPropertyOf', '?p2', '?p3', [], true)],
                [new Fact(JswRDF.IRIs.SUBCLASS, '?p1', '?p3', [], true)]),

            // prp-spo1
            new Rule([
                    new Fact('http://www.w3.org/2000/01/rdf-schema#subPropertyOf', '?p1', '?p2', [], true),
                    new Fact('?p1', '?x', '?y', [], true)],
                [new Fact('?p2', '?x', '?y', [], true)])
        ],

        transitivity: [
            // prp-trp
            new Rule([
                    new Fact('?p', '?x', '?y', [], true),
                    new Fact(JswRDF.IRIs.TYPE, '?p', 'http://www.w3.org/2002/07/owl#TransitiveProperty', [], true),
                    new Fact('?p', '?y', '?z', [], true)],
                [new Fact('?p', '?x', '?z', [], true)])
        ],

        inverse: [
            //prp-inv1
            new Rule([
                    new Fact('http://www.w3.org/2002/07/owl#inverseOf', '?p1', '?p2', [], true),
                    new Fact('?p1', '?x', '?y', [], true)],
                [new Fact('?p2', '?y', '?x', [], true)]),

            //prp-inv2
            new Rule([
                    new Fact('http://www.w3.org/2002/07/owl#inverseOf', '?p1', '?p2', [], true),
                    new Fact('?p2', '?x', '?y', [], true)],
                [new Fact('?p1', '?y', '?x', [], true)])
        ],

        equivalence: [
            //cax-eqc1
            new Rule([
                    new Fact('http://www.w3.org/2002/07/owl#equivalentClass', '?c1', '?c2', [], true),
                    new Fact(JswRDF.IRIs.TYPE, '?x', '?c1', [], true)],
                [new Fact(JswRDF.IRIs.TYPE, '?x', '?c2', [], true)]),

            //cax-eqc2
            new Rule([
                    new Fact('http://www.w3.org/2002/07/owl#equivalentClass', '?c1', '?c2', [], true),
                    new Fact(JswRDF.IRIs.TYPE, '?x', '?c2', [], true)],
                [new Fact(JswRDF.IRIs.TYPE, '?x', '?c1', [], true)]),

            //prp-eqp1
            new Rule([
                    new Fact('http://www.w3.org/2002/07/owl#equivalentProperty', '?p1', '?p2', [], true),
                    new Fact('?p1', '?x', 'y', [], true)],
                [new Fact('?p2', '?x', '?y', [], true)]),

            //prp-eqp2
            new Rule([
                    new Fact('http://www.w3.org/2002/07/owl#equivalentProperty', '?p1', '?p2', [], true),
                    new Fact('?p2', '?x', 'y', [], true)],
                [new Fact('?p1', '?x', '?y', [], true)])
        ],

        equality: [
            //eq-rep-s
            new Rule([
                    new Fact('http://www.w3.org/2002/07/owl#sameAs', '?s1', '?s2', [], true),
                    new Fact('?p', '?s1', '?o', [], true)],
                [new Fact('?p', '?s2', '?o', [], true)]),

            //eq-rep-p
            new Rule([
                    new Fact('http://www.w3.org/2002/07/owl#sameAs', '?p1', '?p2', [], true),
                    new Fact('?p1', '?s', '?o', [], true)],
                [new Fact('?p2', '?s', '?o', [], true)]),

            //eq-rep-o
            new Rule([
                    new Fact('http://www.w3.org/2002/07/owl#sameAs', '?o1', '?o2', [], true),
                    new Fact('?p', '?s', '?o1', [], true)],
                [new Fact('?p', '?s', '?o2', [], true)]),

            //eq-trans
            new Rule([
                    new Fact('http://www.w3.org/2002/07/owl#sameAs', '?x', '?y', [], true),
                    new Fact('http://www.w3.org/2002/07/owl#sameAs', '?y', '?z', [], true)],
                [new Fact('http://www.w3.org/2002/07/owl#sameAs', '?x', '?z', [], true)])
        ]

    }
};

module.exports = {
    rules: OWL2RL.rules.classSubsumption
        .concat(OWL2RL.rules.propertySubsumption)
        .concat(OWL2RL.rules.transitivity)
        .concat(OWL2RL.rules.inverse)
        .concat(OWL2RL.rules.equivalence)
        .concat(OWL2RL.rules.equality),

    subsumption: OWL2RL.rules.classSubsumption
        .concat(OWL2RL.rules.propertySubsumption),

    subsumptionTransitivity: OWL2RL.rules.classSubsumption
        .concat(OWL2RL.rules.propertySubsumption)
        .concat(OWL2RL.rules.transitivity),

    subsumptionInverse: OWL2RL.rules.classSubsumption
        .concat(OWL2RL.rules.propertySubsumption)
        .concat(OWL2RL.rules.transitivity)
};

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/OWL2RL.js","/core")
},{"./JswOWL":1,"./JswRDF":6,"./Logics/Fact":14,"./Logics/Rule":16,"buffer":29,"pBGvAp":32}],19:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
* Created by Spadon on 17/10/2014.
*/

var Queue = _dereq_('./JswQueue'),
    PairStorage = _dereq_('./JswPairStorage'),
    TripleStorage = _dereq_('./JswTripleStorage'),
    TrimQueryABox = _dereq_('./JswTrimQueryABox'),
    JswOWL = _dereq_('./JswOWL'),
    JswRDF = _dereq_('./JswRDF'),
    JswOntology = _dereq_('./JswOntology'),
    OWL2RL = _dereq_('./OWL2RL'),
    Logics = _dereq_('./Logics/Logics'),
    ReasoningEngine = _dereq_('./ReasoningEngine');

/**
 * Reasoner is an OWL-EL create. Currently, it has some limitations and does not allow
 * reasoning on full EL++, but it does cover EL+ and its minor extensions.
 */
Reasoner = function (ontology, RMethod) {
    var preConsequences, preTriplesImplicit,
        preTriplesExplicit, preInsertStatement,
        facts;

    if (!RMethod) RMethod = ReasoningEngine.naive;

    /** Including RL **/
    this.rules = OWL2RL.rules;

    /** Original ontology from which the create was built. */
    this.originalOntology = ontology;
    this.resultOntology = new JswOntology.ontology();
    this.normalizeOntology();

    /** Preparing the aBox */
    this.aBox = new TrimQueryABox.trimQueryABox();
    facts = Logics.mergeFactSets(this.resultOntology.convertEntities(), this.resultOntology.convertAxioms());
    preConsequences = RMethod(facts, [], [], this.rules);
    preTriplesImplicit = this.aBox.consequencesToTriples(Logics.getOnlyImplicitFacts(preConsequences.additions), false);
    preTriplesExplicit = this.aBox.consequencesToTriples(Logics.getOnlyExplicitFacts(preConsequences.additions), true);
    preInsertStatement = this.aBox.createInsertStatement(preTriplesExplicit.concat(preTriplesImplicit));
    this.aBox.processSql(preInsertStatement);
};

/** Prototype for all Reasoner objects. */
Reasoner.prototype = {
    /**
     * Builds a data property subsumption relation implied by the ontology.
     * @deprecated
     * @param ontology Normalized ontology to be use for building the subsumption relation.
     * @return PairStorage storage hashing the object property subsumption relation implied by the
     * ontology.
     */
    buildDataPropertySubsumerSets: function (ontology) {
        var args, axiom, axioms, axiomIndex, dataProperties, dataProperty,
            dataPropertySubsumers, dpropType, reqAxiomType, queue, subsumer, subsumers,
            topDataProperty;

        topDataProperty = JswOWL.IRIs.TOP_DATA_PROPERTY;
        dataPropertySubsumers = new PairStorage.pairStorage();
        dataPropertySubsumers.add(topDataProperty, topDataProperty);
        dataProperties = ontology.getDataProperties();

        for (dataProperty in dataProperties) {
            if (dataProperties.hasOwnProperty(dataProperty)) {
                dataPropertySubsumers.add(dataProperty, dataProperty);
                dataPropertySubsumers.add(dataProperty, topDataProperty);
            }
        }

        axioms = ontology.axioms;
        dpropType = JswOWL.ExpressionTypes.ET_DPROP;
        reqAxiomType = JswOWL.ExpressionTypes.AXIOM_OPROP_SUB; //todo verifier

        // Add object property subsumptions explicitly mentioned in the ontology.
        for (axiomIndex = axioms.length; axiomIndex--;) {
            axiom = axioms[axiomIndex];
            args = axiom.args;

            if (axiom.type !== reqAxiomType || args[0].type !== dpropType) {
                continue;
            }

            dataPropertySubsumers.add(args[0].IRI, args[1].IRI);
        }

        queue = new Queue.queue();

        for (dataProperty in dataProperties) {
            if (!dataProperties.hasOwnProperty(dataProperty)) {
                continue;
            }

            subsumers = dataPropertySubsumers.get(dataProperty);

            for (subsumer in subsumers) {
                if (subsumers.hasOwnProperty(subsumer)) {
                    queue.enqueue(subsumer);
                }
            }

            while (!queue.isEmpty()) {
                subsumers = dataPropertySubsumers.get(queue.dequeue());

                for (subsumer in subsumers) {
                    if (subsumers.hasOwnProperty(subsumer)) {
                        if (!dataPropertySubsumers.exists(dataProperty, subsumer)) {
                            dataPropertySubsumers.add(dataProperty, subsumer);
                            queue.enqueue(subsumer);
                        }
                    }
                }
            }
        }

        return dataPropertySubsumers;
    },

    /**
     * Builds an object property subsumption relation implied by the ontology.
     * @deprecated
     * @param ontology Normalized ontology to be use for building the subsumption relation.
     * @return PairStorage storage hashing the object property subsumption relation implied by the
     * ontology.
     */
    buildObjectPropertySubsumerSets: function (ontology) {
        var args, axiom, axioms, axiomIndex, objectProperties, objectProperty,
            objectPropertySubsumers, opropType, reqAxiomType, queue, subsumer, subsumers,
            topObjectProperty;

        topObjectProperty = JswOWL.IRIs.TOP_OBJECT_PROPERTY;
        objectPropertySubsumers = new PairStorage.pairStorage();
        objectPropertySubsumers.add(topObjectProperty, topObjectProperty);
        objectProperties = ontology.getObjectProperties();

        for (objectProperty in objectProperties) {
            if (objectProperties.hasOwnProperty(objectProperty)) {
                // Every object property is a subsumer for itself.
                objectPropertySubsumers.add(objectProperty, objectProperty);
                // Top object property is a subsumer for every other property.
                objectPropertySubsumers.add(objectProperty, topObjectProperty);
            }
        }

        axioms = ontology.axioms;
        opropType = JswOWL.ExpressionTypes.ET_OPROP;
        reqAxiomType = JswOWL.ExpressionTypes.AXIOM_OPROP_SUB;

        // Add object property subsumptions explicitly mentioned in the ontology.
        for (axiomIndex = axioms.length; axiomIndex--;) {
            axiom = axioms[axiomIndex];
            args = axiom.args;

            if (axiom.type !== reqAxiomType || args[0].type !== opropType) {
                continue;
            }

            objectPropertySubsumers.add(args[0].IRI, args[1].IRI);
        }

        queue = new Queue.queue();

        for (objectProperty in objectProperties) {
            if (!objectProperties.hasOwnProperty(objectProperty)) {
                continue;
            }

            subsumers = objectPropertySubsumers.get(objectProperty);

            for (subsumer in subsumers) {
                if (subsumers.hasOwnProperty(subsumer)) {
                    queue.enqueue(subsumer);
                }
            }

            // Discover implicit subsumptions via intermediate object properties.
            while (!queue.isEmpty()) {
                subsumers = objectPropertySubsumers.get(queue.dequeue());

                for (subsumer in subsumers) {
                    if (subsumers.hasOwnProperty(subsumer)) {
                    // If the objectProperty has subsumer added in its subsumer set, then that
                    // subsumer either was processed already or has been added to the queue - no
                    // need to process it for the second time.
                        if (!objectPropertySubsumers.exists(objectProperty, subsumer)) {
                            objectPropertySubsumers.add(objectProperty, subsumer);
                            queue.enqueue(subsumer);
                        }
                    }
                }
            }
        }

        return objectPropertySubsumers;
    },

    /**
     * Builds a class subsumption relation implied by the ontology.
     * @deprecated
     * @param ontology Ontology to use for building subsumer sets. The ontology has to be
     * normalized.
     * @return PairStorage storage containing the class subsumption relation implied by the ontology.
     */
    buildClassSubsumerSets: function (ontology) {
        var a,
            labelNodeIfAxioms1 = [],
            labelNodeIfAxioms2 = [],
            labelNodeAxioms = [],
            labelEdgeAxioms = [],
            labelNodeIfAxiom1Count,
            labelNodeIfAxiom2Count,
            labelNodeAxiomCount,
            labelEdgeAxiomCount,
            b,
            // Provides quick access to axioms like r o s <= q.
            chainSubsumers = this.buildChainSubsumerSets(),
            // Stores labels for each node.
            classSubsumers = new PairStorage.pairStorage(),
            // Stores labels for each edge.
            edgeLabels = new TripleStorage.tripleStorage(),
            instruction,
            leftChainSubsumers = chainSubsumers.left,
            node,
            nothing = JswOWL.IRIs.NOTHING,
            objectPropertySubsumers = this.objectPropertySubsumers,
            originalOntology = this.originalOntology,
            queue,
            queues = {},
            rightChainSubsumers = chainSubsumers.right,
            p,
            someInstructionFound;

        /**
         * Splits the axiom set of the ontology into several subsets used for different purposes.
         */
        function splitAxiomSet() {
            var axiom, axioms, axiomIndex, axiomType, classType, firstArgType,
                intersectType, reqAxiomType, secondArgType, someValuesType;

            reqAxiomType = JswOWL.ExpressionTypes.AXIOM_CLASS_SUB;
            classType = JswOWL.ExpressionTypes.ET_CLASS;
            intersectType = JswOWL.ExpressionTypes.CE_INTERSECT;
            someValuesType = JswOWL.ExpressionTypes.CE_OBJ_VALUES_FROM;
            axioms = ontology.axioms;

            for (axiomIndex = axioms.length; axiomIndex--;) {
                axiom = axioms[axiomIndex];
                axiomType = axiom.type;

                if (axiom.type !== reqAxiomType) {
                    continue;
                }

                secondArgType = axiom.args[1].type;

                if (secondArgType === classType) {
                    firstArgType = axiom.args[0].type;

                    if (firstArgType === classType) {
                        labelNodeIfAxioms1.push(axiom);
                    } else if (firstArgType === intersectType) {
                        labelNodeIfAxioms2.push(axiom);
                    } else if (firstArgType === someValuesType) {
                        labelNodeAxioms.push(axiom);
                    }
                } else if (secondArgType === someValuesType) {
                    if (axiom.args[0].type === classType) {
                        labelEdgeAxioms.push(axiom);
                    }
                }
            }

            labelNodeAxiomCount = labelNodeAxioms.length;
            labelNodeIfAxiom1Count = labelNodeIfAxioms1.length;
            labelNodeIfAxiom2Count = labelNodeIfAxioms2.length;
            labelEdgeAxiomCount = labelEdgeAxioms.length;
        }

        /**
         * Adds instructions
         *
         * 'Label B as C if it is labeled A1, A2, ..., Am already'
         *
         * to the queue of B for all axioms like
         *
         * A1 n A2 n ... n A n ... n Am <= C.
         *
         * @param a
         * @param b
         */
        function addLabelNodeIfInstructions(a, b) {
            var axioms, args, axiomIndex, canUse, classes, classCount, classIndex, classIri,
                reqLabels;

            axioms = labelNodeIfAxioms1;

            for (axiomIndex = labelNodeIfAxiom1Count; axiomIndex--;) {
                args = axioms[axiomIndex].args;

                if (args[0].IRI === a) {
                    queues[b].enqueue({
                        'type': 0,
                        'node': b,
                        'label': args[1].IRI,
                        'reqLabels': null
                    });
                }
            }

            axioms = labelNodeIfAxioms2;

            for (axiomIndex = labelNodeIfAxiom2Count; axiomIndex--;) {
                args = axioms[axiomIndex].args;
                classes = args[0].args;
                classCount = classes.length;
                canUse = false;

                for (classIndex = classCount; classIndex--;) {
                    if (classes[classIndex].IRI === a) {
                        canUse = true;
                        break;
                    }
                }

                if (!canUse) {
                // axiom does not contain A on the left side
                    continue;
                }

                reqLabels = {};

                for (classIndex = classCount; classIndex--;) {
                    classIri = classes[classIndex].IRI;

                    if (classIri !== a) {
                        reqLabels[classIri] = true;
                    }
                }

                queues[b].enqueue({
                    'type': 0,
                    'node': b,
                    'label': args[1].IRI,
                    'reqLabels': reqLabels
                });
            }
        }

        /**
         * Adds instructions
         *
         * 'Label B with C'
         *
         * to the queue of B for all axioms like
         *
         * E P.A <= C.
         *
         * @param p IRI of the object property to look for in axioms.
         * @param a IRI of the class to look for in the left part of axioms.
         * @param b IRI of the class to add instructions to.
         */
        function addLabelNodeInstructions(p, a, b) {
            var axioms, args, axiomIndex, firstArg;

            axioms = labelNodeAxioms;

            for (axiomIndex = labelNodeAxiomCount; axiomIndex--;) {
                args = axioms[axiomIndex].args;
                firstArg = args[0];

                if (firstArg.opropExpr.IRI === p && firstArg.classExpr.IRI === a) {
                    queues[b].enqueue({
                        'type': 0,
                        'node': b,
                        'label': args[1].IRI
                    });
                }
            }
        }

        /**
         * Adds instructions
         *
         * 'Label the edge (B, C) as P'
         *
         * to the queue of B for all axioms like
         *
         * A <= E P.C
         *
         * @param a
         * @param b
         */
        function addLabelEdgeInstructions(a, b) {
            var axioms, args, axiomIndex, secondArg;

            axioms = labelEdgeAxioms;

            for (axiomIndex = labelEdgeAxiomCount; axiomIndex--;) {
                args = axioms[axiomIndex].args;
                secondArg = args[1];

                if (args[0].IRI !== a) {
                    continue;
                }

                queues[b].enqueue({
                    'type': 1,
                    'node1': b, // IRI of the source node of the edge.
                    'node2': secondArg.classExpr.IRI, // IRI of the destination node of the edge.
                    'label': secondArg.opropExpr.IRI // IRI of the label to add to the edge.
                });
            }
        }

        /**
         * Adds instructions to the queue of class B for axioms involving class A.
         *
         * @param a IRI of the class to look for in axioms.
         * @param b IRI of the class to add instructions for.
         */
        function addInstructions(a, b) {
            addLabelNodeIfInstructions(a, b);
            addLabelEdgeInstructions(a, b);
        }

        /**
         * Initialises a single node of the graph before the subsumption algorithm is run.
         *
         * @param classIri IRI of the class to initialize a node for.
         */
        function initialiseNode(classIri) {
// Every class is a subsumer for itself.
            classSubsumers.add(classIri, classIri);

// Initialise an instruction queue for the node.
            queues[classIri] = new Queue.queue();

// Add any initial instructions about the class to the queue.
            addInstructions(classIri, classIri);
        }

        /**
         * Initialises data structures before the subsumption algorithm is run.
         */
        function initialise() {
            var classes = ontology.getClasses(),
                classIri,
                thing = JswOWL.IRIs.THING;

// Put different axioms into different 'baskets'.
            splitAxiomSet();

// Create a node for Thing (superclass).
            initialiseNode(thing);

            for (classIri in classes) {
                if (classes.hasOwnProperty(classIri) && !classes[classIri]) {
// Create a node for each class in the Ontology.
                    initialiseNode(classIri);

// Mark Thing as a subsumer of the class.
                    classSubsumers.add(classIri, thing);

// All axioms about Thing should also be true for any class.
                    addInstructions(thing, classIri);
                }
            }
        }

        /**
         * Adds subsumers sets for classes which have not been found in the TBox of the ontology.
         */
        function addRemainingSubsumerSets() {
            var classes = ontology.getClasses(),
                classIri,
                nothing = JswOWL.IRIs.NOTHING,
                originalClasses = originalOntology.getClasses(),
                thing = JswOWL.IRIs.THING;

                // We add Nothing to the subsumer sets only if some of the original classes has Nothing
                // as a subsumer.
            for (classIri in classSubsumers.get(null)) {
                if (originalClasses.hasOwnProperty(classIri) &&
                    classSubsumers.exists(classIri, nothing)) {
                // In principle, everything is a subsumer of Nothing, but we ignore it.
                    classSubsumers.add(nothing, nothing);
                    classSubsumers.add(nothing, thing);
                    break;
                }
            }

            for (classIri in ontology.getClasses()) {
                if (classes.hasOwnProperty(classIri) && classes[classIri]) {
                    classSubsumers.add(classIri, classIri);
                    classSubsumers.add(classIri, thing);
                }
            }
        }

        /**
         * Processes an instruction to add a new edge.
         *
         * @param a
         * @param b
         * @param p
         */
        function processNewEdge(a, b, p) {
            var bSubsumers, c, classes, edges, lChainSubsumers, q, r, rChainSubsumers, s;

            classes = classSubsumers.get(null);
            edges = edgeLabels;
            bSubsumers = classSubsumers.get(b);
            lChainSubsumers = leftChainSubsumers;
            rChainSubsumers = rightChainSubsumers;

            // For all subsumers of object property P, including P itself.
            for (q in objectPropertySubsumers.get(p)) {
            // Add q as a label between A and B.
                edges.add(a, b, q);

                // Since we discovered that A <= E Q.B, we know that A <= E Q.C, where C is any
                // subsumer of B. We therefore need to look for new subsumers D of A by checking
                // all axioms like E Q.C <= D.
                for (c in bSubsumers) {
                    addLabelNodeInstructions(q, c, a);
                }

                // We want to take care of object property chains. We now know that Q: A -> B.
                // If there is another property R: C -> A for some class C and property S, such that
                // R o Q <= S, we want to label edge (C, B) with S.
                for (r in rChainSubsumers.get(q)) {
                    for (s in rChainSubsumers.get(q, r)) {
                        for (c in classes) {
                            if (edges.exists(c, a, r) && !edges.exists(c, b, s)) {
                                processNewEdge(c, b, s);
                            }
                        }
                    }
                }

                // We want to take care of object property chains. We now know that Q: A -> B.
                // If there is another property R: B -> C for some class C and property S, such that
                // Q o R <= S, we want to label edge (A, C) with S.
                for (r in lChainSubsumers.get(q)) {
                    for (s in lChainSubsumers.get(q, r)) {
                        for (c in classes) {
                            if (edges.exists(b, c, r) && !edges.exists(a, c, s)) processNewEdge(a, c, s);
                        }
                    }
                }
            }
        }

        /**
         * Processes the given Label Edge instruction.
         *
         * @param instruction Label Edge instruction to process.
         */
        function processLabelEdgeInstruction(instruction) {
            var p = instruction.label,
                a = instruction.node1,
                b = instruction.node2;

// If the label exists already, no need to process the instruction.
            if (!edgeLabels.exists(a, b, p)) {
                processNewEdge(a, b, p);
            }
        }

        /**
         * Processes the given Label Node instruction.
         *
         * @param instruction Label Node instruction to process.
         */
        function processLabelNodeInstruction(instruction) {
            var a, b, c, edges, p, subsumers;

            a = instruction.node;
            b = instruction.label;
            edges = edgeLabels;
            subsumers = classSubsumers;

            if (subsumers.exists(a, b) || !subsumers.existAll(a, instruction.reqLabels)) {
// The node is not labeled with all required labels yet or it has been labeled
// with the new label already - there is no point to process the operation anyway.
                return;
            }

// Otherwise, add a label to the node.
            subsumers.add(a, b);

// Since B is a new discovered subsumer of A, all axioms about B apply to A as well -
// we need to update node instruction queue accordingly.
            addInstructions(b, a);

// We have discovered a new information about A, so we need to update all other nodes
// linked to it.
            for (c in edges.get(null, null)) {
                for (p in edges.get(c, a)) {
// For all C <= E P.A, we now know that C <= E P.B. And therefore C should have
// the same subsumers as E P.B.
                    addLabelNodeInstructions(p, b, c);
                }
            }
        }

// Initialise queues and labels.
        initialise();

        do {
            someInstructionFound = false;

// Get a queue which is not empty.
            for (node in queues) {

                queue = queues[node];

                if (!queue.isEmpty()) {
// Process the oldest instruction in the queue.
                    instruction = queue.dequeue();

                    switch (instruction.type) {
                        case 0:
                            processLabelNodeInstruction(instruction);
                            break;
                        case 1:
                            processLabelEdgeInstruction(instruction);
                            break;
                        default:
                            throw 'Unrecognized type of instruction found in the queue!';
                    }

                    someInstructionFound = true;
                    break;
                }
            }
        } while (someInstructionFound);

        do {
            someInstructionFound = false;

            for (a in edgeLabels.get(null, null)) {
                if (classSubsumers.exists(a, nothing)) {
                    continue;
                }

                for (b in edgeLabels.get(a, null)) {
                    for (p in edgeLabels.get(a, b)) {
                        if (classSubsumers.exists(b, nothing)) {
                            classSubsumers.add(a, nothing);
                        }
                    }
                }
            }
        } while (someInstructionFound);

// Add a subsumer set for every class which did not participate in TBox.
        addRemainingSubsumerSets();

        return classSubsumers;
    },

    /**
     * Removes from subsumer sets references to entities which have been introduced during
     * normalization stage.
     * @deprecated
     * @param subsumerSets Subsumer sets to remove the introduced entities from.
     * @param originalEntities Object containing IRIs of original entities as properties.
     * @param allowedEntities Array containing names of entites which should not be removed if they
     * are present in the subsumer sets.
     */
    removeIntroducedEntities: function (subsumerSets, originalEntities, allowedEntities) {
        var allowedCount = allowedEntities.length,
            entityIri,
            subsumerIri;

        /**
         * Checks if the given given entity IRI has been introduced during normalization stage.
         *
         * @param entityIri IRI of the entity to check.
         * @return boolean - true if the entity has been introduced, false otherwise.
         */
        function isIntroducedEntity(entityIri) {
            var index;

            if (originalEntities.hasOwnProperty(entityIri)) {
                return true;
            }

            for (index = allowedCount; index--;) {
                if (allowedEntities[index] === entityIri) {
                    return true;
                }
            }
        }

// Remove introduced entities from subsumer sets.
        for (entityIri in subsumerSets.get()) {
            if (!isIntroducedEntity(entityIri)) {
                subsumerSets.remove(entityIri);
                continue;
            }

            for (subsumerIri in subsumerSets.get(entityIri)) {
                if (!isIntroducedEntity(subsumerIri)) {
                    subsumerSets.remove(entityIri, subsumerIri);
                }
            }
        }
    },

    /**
     * Creates an object which hashes axioms like r o s <= q, so that all axioms related to either
     * q or s can be obtained efficiently. Normalized ontology containing the axioms to hash.
     * @return Object hashing all object property chain subsumptions.
     */
    buildChainSubsumerSets: function () {
        var args, axiom, axioms, axiomIndex, chainSubsumer, leftSubsumers, leftOprop,
            opropChainType, reqAxiomType, rightOprop, rightSubsumers;

        leftSubsumers = new TripleStorage.tripleStorage();

      axioms = this.originalOntology.axioms;
      rightSubsumers = new TripleStorage.tripleStorage();

        reqAxiomType = JswOWL.ExpressionTypes.AXIOM_OPROP_SUB;
        opropChainType = JswOWL.ExpressionTypes.OPE_CHAIN;

        for (axiomIndex = axioms.length; axiomIndex--;) {
            axiom = axioms[axiomIndex];

            if (axiom.type !== reqAxiomType || axiom.args[0].type !== opropChainType) {
                continue;
            }

            args = axiom.args[0].args;
            leftOprop = args[0].IRI;
            rightOprop = args[1].IRI;
            chainSubsumer = axiom.args[1].IRI;

            leftSubsumers.add(leftOprop, rightOprop, chainSubsumer);
            rightSubsumers.add(rightOprop, leftOprop, chainSubsumer);
        }

        return {
            'left': leftSubsumers,
            'right': rightSubsumers
        };
    },

    /**
     * Rewrites an ABox of the ontology into the relational database to use it for conjunctive query
     * answering.
     * @deprecated
     * @param ontology Normalized ontology containing the ABox to rewrite.
     * @return TrimQueryABox object containing the rewritten ABox.
     */
    rewriteAbox: function (ontology) {
        var axioms = ontology.axioms,
            axiomCount = axioms.length,
            classSubsumers = this.classSubsumers,
            aBox = new TrimQueryABox.trimQueryABox(),
            objectPropertySubsumers = this.objectPropertySubsumers,
            originalOntology = this.originalOntology;

        /**
         * Puts class assertions implied by the ontology into the database.
         *
         * @return Array containing all class assertions implied by the ontology.
         */
        function rewriteClassAssertions() {
            var axiom, axiomIndex, classFactType, classIri, individualClasses, individualIri,
                subsumerIri;

            individualClasses = new PairStorage.pairStorage();
            classFactType = JswOWL.ExpressionTypes.FACT_CLASS;

            for (axiomIndex = axiomCount; axiomIndex--;) {
                axiom = axioms[axiomIndex];

                if (axiom.type !== classFactType) {
                    continue;
                }

                individualIri = axiom.individual.IRI;
                classIri = axiom.classExpr.IRI;

                for (subsumerIri in classSubsumers.get(classIri)) {
                    if (originalOntology.containsClass(subsumerIri, JswOWL.IRIs)) {
                        individualClasses.add(individualIri, subsumerIri);
                    }
                }
            }

            // Put class assertions into the database.
            for (individualIri in individualClasses.get(null)) {
                for (classIri in individualClasses.get(individualIri)) {
                    aBox.addClassAssertion(individualIri, classIri);
                }
            }
        }

        /**
         * Puts role assertions implied by the ontology into the database.
         *
         * @return Array containing all object property assertions implied by the ontology.
         */
        function rewriteObjectPropertyAssertions() {
            var args, axiom, axiomIndex, centerInd, chainSubsumer, changesHappened, individual,
                individuals, opropSubsumer, leftInd, leftOprop, oprop, opropFactType,
                reflexiveOpropType, reqAxiomType, reqExprType, rightInd, rightOprop, storage;

            storage = new TripleStorage.tripleStorage();
            reflexiveOpropType = JswOWL.ExpressionTypes.AXIOM_OPROP_REFL;
            opropFactType = JswOWL.ExpressionTypes.FACT_OPROP;
            individuals = originalOntology.getIndividuals();

            for (axiomIndex = axiomCount; axiomIndex--;) {
                axiom = axioms[axiomIndex];

                // Reflexive object properties.
                if (axiom.type === reflexiveOpropType) {
                    for (opropSubsumer in objectPropertySubsumers.get(axiom.objectProperty.IRI)) {
                        for (individual in individuals) {
                            storage.add(opropSubsumer, individual, individual);
                        }
                    }
                } else if (axiom.type === opropFactType) {
                    leftInd = axiom.leftIndividual.IRI;
                    rightInd = axiom.rightIndividual.IRI;

                    for (opropSubsumer in objectPropertySubsumers.get(axiom.objectProperty.IRI)) {
                        storage.add(opropSubsumer, leftInd, rightInd);
                    }
                }
            }

            reqAxiomType = JswOWL.ExpressionTypes.AXIOM_OPROP_SUB;
            reqExprType = JswOWL.ExpressionTypes.OPE_CHAIN;

            do {
                changesHappened = false;

                for (axiomIndex = axiomCount; axiomIndex--;) {
                    axiom = ontology.axioms[axiomIndex];

                    if (axiom.type !== reqAxiomType || axiom.args[0].type !== reqExprType) {
                        continue;
                    }

                    args = axiom.args[0].args;
                    leftOprop = args[0].IRI;
                    rightOprop = args[1].IRI;
                    chainSubsumer = axiom.args[1].IRI;

                    for (leftInd in storage.get(leftOprop, null)) {
                        for (centerInd in storage.get(leftOprop, leftInd)) {
                            for (rightInd in storage.get(rightOprop, centerInd)) {
                                for (opropSubsumer in objectPropertySubsumers.get(chainSubsumer)) {
                                    if (!storage.exists(opropSubsumer, leftInd, rightInd)) {
                                        storage.add(opropSubsumer, leftInd, rightInd);
                                        changesHappened = true;
                                    }
                                }
                            }
                        }
                    }
                }
            } while (changesHappened);

            // Put object property assertions into the database.
            for (oprop in storage.get(null, null)) {
                if (!originalOntology.containsObjectProperty(oprop, JswOWL.IRIs)) {
                    continue;
                }

                for (leftInd in storage.get(oprop, null)) {
                    for (rightInd in storage.get(oprop, leftInd)) {
                        aBox.addObjectPropertyAssertion(oprop, leftInd, rightInd);
                    }
                }
            }
        }

      /**
       * Puts class subsumers implied by the ontology into the database.
       * @author Mehdi Terdjimi
       * @return Array containing all class subsumers implied by the ontology.
       */
      function rewriteClassSubsumers() {
        var classIri, classSubsumerIri, subsumerClasses, axiomIndex, axiom, axiomCount, axiomClassSubType;

        subsumerClasses = new PairStorage.pairStorage();
        axiomClassSubType = JswOWL.ExpressionTypes.AXIOM_CLASS_SUB;
        axiomCount = axioms.length;

        for (axiomIndex = axiomCount; axiomIndex--;) {
          axiom = axioms[axiomIndex];

          if (axiom.type !== axiomClassSubType) {
            continue;
          }

          classIri = axiom.args[0].IRI;

          for (classSubsumerIri in classSubsumers.get(classIri)) {
            if (originalOntology.containsClass(classSubsumerIri, JswOWL.IRIs)) {
              subsumerClasses.add(classIri, classSubsumerIri);
            }
          }
        }

        // Put class subsumers into the database.
        /* todo - deplacer en tbox
        for (classSubsumerIri in subsumerClasses.get(null)) {
          tBox.addClassSubsumer(classIri, classSubsumerIri);
        }
        */
      }

        rewriteClassAssertions();
        rewriteObjectPropertyAssertions();
        rewriteClassSubsumers();

        return aBox;
    },

    /**
     * Answers the given user query.
     *
     * @param query An object representing a query to be answered.
     */
    answerQuery: function (query, RMethod) {
        if (!query) {

            throw 'The query is not specified!';
        }

        if(query.statementType === 'SELECT') {

            //AJOUT Lionel
            //To separate SPARQL queries dedicated to ABoxes from class definitions
            if (query.triples.length !== 1) {
                throw 'Only one triple is currently allowed in sparql requests...';
            }

            //If the query is about class subsumption
            if (query.triples[0].predicate.value == JswRDF.IRIs.SUBCLASS) {
                var subject, object, subsumee, subsumer, result;

                result = [];
                subject = query.triples[0].subject.value;
                object = query.triples[0].object.value;

                //Find the variables in the subject and object
                for (var i = 0; i < query.variables.length; i++) {
                    var variable = query.variables[i];
                    if (variable.value == subject) {
                        subject = "*";
                    }
                    if (variable.value == object) {
                        object = "*";
                    }
                }

                //Find the correct pairs in the classSubsumers Pairstorage...
                if (subject != "*") {
                    //Looking for subsumers of the query subject
                    for (subsumer in this.classSubsumers.storage[subject]) {
                        result.push({"subject": query.triples[0].subject.value, "object": subsumer});
                    }
                } else {
                    //Looking for subsumees
                    for (subsumee in this.classSubsumers.storage) {
                        for (subsumer in this.classSubsumers.storage[subsumee]) {
                            if (object == "*" || object == subsumer) {
                                result.push({"subject": subsumee, "object": subsumer});
                            }
                        }
                    }
                }
                return result;
            }
        }

        var results = this.aBox.answerQuery(query, this.resultOntology, this.rules, RMethod);
        return results;
    },

    /**
     * ABox recalculation after INSERT or DELETE DATA (DEPRECATED)
     * @author Mehdi Terdjimi
     * @deprecated
     */
    recalculateABox: function() {
        for(var classAssertionKey in this.aBox.database.ClassAssertion) {
            var assertion = this.aBox.database.ClassAssertion[classAssertionKey],
                className = assertion.className,
                individual = assertion.individual,
                classSubsumers = this.classSubsumers.getAllBut(className);

           for (var key in classSubsumers) {
                this.aBox.addClassAssertion(individual, classSubsumers[key]);
           }
        }

        for(var objectPropertyAssertionKey in this.aBox.database.ObjectPropertyAssertion) {
            var assertion = this.aBox.database.ObjectPropertyAssertion[objectPropertyAssertionKey],
                objectProperty = assertion.objectProperty,
                leftIndividual = assertion.leftIndividual,
                rightIndividual = assertion.rightIndividual,
                objectPropertySubsumers = this.objectPropertySubsumers.getAllBut(objectProperty);

            for (var key in objectPropertySubsumers) {
                this.aBox.addObjectPropertyAssertion(objectPropertySubsumers[key], leftIndividual, rightIndividual);
            }
        }

        for(var dataPropertyAssertionKey in this.aBox.database.DataPropertyAssertion) {
            var assertion = this.aBox.database.DataPropertyAssertion[dataPropertyAssertionKey],
                dataProperty = assertion.dataProperty,
                leftIndividual = assertion.leftIndividual,
                rightValue = assertion.rightValue,
                dataPropertySubsumers = this.dataPropertySubsumers.getAllBut(dataProperty);

            for (var key in dataPropertySubsumers) {
                this.aBox.addDataPropertyAssertion(dataPropertySubsumers[key], leftIndividual, rightValue);
            }
        }
    },

    /**
     * Normalizes the given ontology.
     *
     * @return jsw Ontology ontology which is a normalized version of the given one.
     */
    normalizeOntology: function () {
        var axiom, axiomIndex, queue, nothingClass, resultAxioms,
            rules, ruleCount, ruleIndex, instanceClasses,
            ontology = this.originalOntology,
            resultOntology = this.resultOntology;

        /**
         * Copies all entities from the source ontology to the result ontology.
         */
        function copyEntities() {
            var entities, entitiesOfType, entityIri, entityType;

            entities = ontology.entities;

            for (entityType in entities) {
                if (entities.hasOwnProperty(entityType)) {
                    entitiesOfType = entities[entityType];

                    for (entityIri in entitiesOfType) {
                        if (entitiesOfType.hasOwnProperty(entityIri)) {
                            resultOntology.entities[entityType][entityIri] =
                                entitiesOfType[entityIri];
                        }
                    }
                }
            }
        }

        /**
         * Creates a new entity of the given type with a unique IRI and registers it in the result
         * ontology.
         *
         * @param type Type of the entity to create.
         * @return Object representing the entity created.
         */
        function createEntity(type) {
            var newIri = resultOntology.createUniqueIRI(type);

            resultOntology.registerEntityAddAxiom(type, newIri, false);

            return {
                'type': type,
                'IRI': newIri
            };
        }

        /**
         * Returns nominal class object representing the given individual. If the class object
         * has not been created for the given individual, creates it.
         *
         * @param individual Object representing individual to return the nominal class for.
         * @return Nominal class object for the given individual.
         */
        function getIndividualClass(individual) {
            var individualIri, newClass;

            individualIri = individual.IRI;
            newClass = instanceClasses[individualIri];

            if (!newClass) {
                newClass = createEntity(JswOWL.ExpressionTypes.ET_CLASS);
                instanceClasses[individualIri] = newClass;
            }

            return newClass;
        }

        /**
         * For the given DisjointClasses axiom involving class expressions A1 .. An, puts an
         * equivalent set of axioms Ai n Aj <= {}, for all i <> j to the queue.
         *
         * @param statement DisjointClasses statement.
         * @param queue Queue to which the equivalent statements should be put.
         */
        function replaceDisjointClassesAxiom(statement, queue) {
            var args, argIndex1, argIndex2, firstArg, intersectType, nothing,
                resultAxiomType;

            resultAxiomType = JswOWL.ExpressionTypes.AXIOM_CLASS_SUB;
            intersectType = JswOWL.ExpressionTypes.CE_INTERSECT;
            nothing = nothingClass;
            args = statement.args;

            for (argIndex1 = args.length; argIndex1--;) {
                firstArg = args[argIndex1];

                for (argIndex2 = argIndex1; argIndex2--;) {
                    queue.enqueue({
                        'type': resultAxiomType,
                        'args': [
                            {
                                'type': intersectType,
                                'args': [firstArg, args[argIndex2]]
                            },
                            nothing
                        ]
                    });
                }
            }
        }

        /**
         * For the given EquivalentClasses or EquivalentObjectProperties axiom involving expressions
         * A1 .. An, puts an equivalent set of all axioms Ai <= Aj to the given queue.
         *
         * @param axiom EquivalentClasses or EquivalentObjectProperties axiom.
         * @param resultAxiomType Type of the result axioms.
         * @param queue Queue to which the equivalent statements should be put.
         */
        function replaceEquivalenceAxiom(axiom, resultAxiomType, queue) {
            var args, argCount, argIndex1, argIndex2, firstArg;

            args = axiom.args;
            argCount = args.length;

            for (argIndex1 = argCount; argIndex1--;) {
                firstArg = args[argIndex1];

                for (argIndex2 = argCount; argIndex2--;) {
                    if (argIndex1 !== argIndex2) {
                        queue.enqueue({
                            type: resultAxiomType,
                            args: [firstArg, args[argIndex2]]
                        });
                    }
                }
            }
        }

        /**
         * For the given TransitiveObjectProperty for object property r, adds an equivalent axiom
         * r o r <= r to the given queue.
         *
         * @param axiom TransitiveObjectProperty axiom.
         * @param queue Queue to which the equivalent statements should be put.
         */
        function replaceTransitiveObjectPropertyAxiom(axiom, queue) {
            var oprop = axiom.objectProperty;

            queue.enqueue({
                'type': JswOWL.ExpressionTypes.AXIOM_OPROP_SUB,
                'args': [
                    {
                        'type': JswOWL.ExpressionTypes.OPE_CHAIN,
                        'args': [oprop, oprop]
                    },
                    oprop
                ]
            });
        }

        /**
         * For the given ClassAssertion statement in the form a <= A, where a is
         * individual and A is a class expression, puts the new statements a <= B and B <= A,
         * where B is a new atomic class, to the queue.
         *
         * @param statement ClassAssertion statement.
         * @param queue Queue to which the equivalent statements should be put.
         */
        function replaceClassAssertion(statement, queue) {
            var individual, newClass;

            individual = statement.individual;
            newClass = getIndividualClass(individual);

            queue.enqueue({
                'type': JswOWL.ExpressionTypes.AXIOM_CLASS_SUB,
                'args': [newClass, statement.classExpr]
            });
            queue.enqueue({
                'type': JswOWL.ExpressionTypes.FACT_CLASS,
                'individual': individual,
                'classExpr': newClass
            });
        }

        /**
         * For the given ObjectPropertyAssertion statement in the form r(a, b), where a and b are
         * individuals and r is an object property, adds axioms A <= E r.B to the given queue, where
         * A and B represent nominals {a} and {b}.
         *
         * @param statement ObjectPropertyAssertion statement.
         * @param queue Queue to which the equivalent statements should be put.
         */
        function replaceObjectPropertyAssertion(statement, queue) {
            queue.enqueue(statement);
            queue.enqueue({
                'type': JswOWL.ExpressionTypes.AXIOM_CLASS_SUB,
                'args': [getIndividualClass(statement.leftIndividual), {
                    'type': JswOWL.ExpressionTypes.CE_OBJ_VALUES_FROM,
                    'opropExpr': statement.objectProperty,
                    'classExpr': getIndividualClass(statement.rightIndividual)
                }]
            });
        }

        /**
         * @param statement DataPropertyAssertion statement.
         * @param queue Queue to which the equivalent statements should be put.
         * @author Mehdi Terdjimi
         * @todo
         */
        function replaceDataPropertyAssertion(statement, queue) {
            //
        }

        /**
         * Returns a queue with axioms which need to be normalized.
         */
        function createAxiomQueue() {
            var axiom, axioms, axiomIndex, classAssertion, disjointClasses, equivalentClasses,
                equivalentObjectProperties, objectPropertyAssertion, queue, subClassOf,
                subObjPropertyOf, transitiveObjectProperty, dataPropertyAssertion;

            disjointClasses = JswOWL.ExpressionTypes.AXIOM_CLASS_DISJOINT;
            equivalentClasses = JswOWL.ExpressionTypes.AXIOM_CLASS_EQ;
            equivalentObjectProperties = JswOWL.ExpressionTypes.AXIOM_OPROP_EQ;
            subObjPropertyOf = JswOWL.ExpressionTypes.AXIOM_OPROP_SUB;
            subClassOf = JswOWL.ExpressionTypes.AXIOM_CLASS_SUB;
            transitiveObjectProperty = JswOWL.ExpressionTypes.AXIOM_OPROP_TRAN;
            classAssertion = JswOWL.ExpressionTypes.FACT_CLASS;
            dataPropertyAssertion = JswOWL.ExpressionTypes.FACT_DPROP;
            objectPropertyAssertion = JswOWL.ExpressionTypes.FACT_OPROP;
            queue = new Queue.queue();
            axioms = ontology.axioms;

            for (axiomIndex = axioms.length; axiomIndex--;) {
                axiom = axioms[axiomIndex];

                switch (axiom.type) {
                    case disjointClasses:
                        replaceDisjointClassesAxiom(axiom, queue);
                        break;
                    case equivalentClasses:
                        replaceEquivalenceAxiom(axiom, subClassOf, queue);
                        break;
                    case equivalentObjectProperties:
                        replaceEquivalenceAxiom(axiom, subObjPropertyOf, queue);
                        break;
                    case transitiveObjectProperty:
                        replaceTransitiveObjectPropertyAxiom(axiom, queue);
                        break;
                    case classAssertion:
                        replaceClassAssertion(axiom, queue);
                        break;
                    case objectPropertyAssertion:
                        replaceObjectPropertyAssertion(axiom, queue);
                        break;
                    case dataPropertyAssertion:
                        replaceDataPropertyAssertion(axiom, queue);
                        break;
                    default:
                        queue.enqueue(axiom);
                }
            }

            return queue;
        }

        instanceClasses = {};
        nothingClass = {
            'type': JswOWL.ExpressionTypes.ET_CLASS,
            'IRI': JswOWL.IRIs.NOTHING
        };

        rules = [
            /**
             * Checks if the given axiom is in the form P1 o P2 o ... o Pn <= P, where Pi and P are
             * object property expressions. If this is the case, transforms it into the set of
             * equivalent axioms
             *
             * P1 o P2 <= U1
             * U1 o P3 <= U2
             * ...
             * Un-2 o Pn <= P,
             *
             * where Ui are the new object properties introduced.
             *
             * @param axiom Axiom to apply the rule to.
             * @return (Object) {type: (exports.ExpressionTypes.AXIOM_OPROP_SUB|*), args: *[]}[] of axioms which are result of applying the rule to the given axiom or
             * null if the rule could not be applied.
             */
                function (axiom) {
                var lastOpropIndex, newOprop, normalized, opropChainType, opropIndex, opropType,
                    prevOprop, reqAxiomType, srcChain;

                opropChainType = JswOWL.ExpressionTypes.OPE_CHAIN;
                reqAxiomType = JswOWL.ExpressionTypes.AXIOM_OPROP_SUB;

                if (axiom.type !== reqAxiomType || axiom.args[0].type !== opropChainType ||
                    axiom.args[0].args.length <= 2) {
                    return null;
                }

                opropType = JswOWL.ExpressionTypes.ET_OPROP;
                prevOprop = createEntity(opropType);
                srcChain = axiom.args[0].args;

                normalized = [
                    {
                        type: reqAxiomType,
                        args: [
                            {
                                type: opropChainType,
                                args: [srcChain[0], srcChain[1]]
                            },
                            prevOprop
                        ]
                    }
                ];

                lastOpropIndex = srcChain.length - 1;

                for (opropIndex = 2; opropIndex < lastOpropIndex; opropIndex += 1) {
                    newOprop = createEntity(opropType);
                    normalized.push({
                        type: reqAxiomType,
                        args: [
                            {
                                type: opropChainType,
                                args: [prevOprop, srcChain[opropIndex]]
                            },
                            newOprop
                        ]
                    });

                    prevOprop = newOprop;
                }

                normalized.push({
                    type: reqAxiomType,
                    args: [
                        {
                            type: opropChainType,
                            args: [prevOprop, srcChain[lastOpropIndex]]
                        },
                        axiom.args[1]
                    ]
                });

                return normalized;
            },

            /**
             * Checks if the given axiom is in the form A <= A1 n A2 n ... An., where A and Ai are
             * class expressions. If this is the case, transforms it into the set of equivalent
             * axioms
             *
             * A <= A1
             * A <= A2
             * ...
             * A <= An
             * .
             *
             * @param axiom Axiom to apply the rule to.
             * @return Array of axioms which are result of applying the rule to the given axiom or
             * null if the rule could not be applied.
             */
                function (axiom) {
                var exprs, exprIndex, firstArg, normalized, reqAxiomType;

                reqAxiomType = JswOWL.ExpressionTypes.AXIOM_CLASS_SUB;

                if (axiom.type !== reqAxiomType || axiom.args[1].type !== JswOWL.ExpressionTypes.CE_INTERSECT) {
                    return null;
                }

                exprs = axiom.args[1].args;

                normalized = [];
                firstArg = axiom.args[0];

                for (exprIndex = exprs.length; exprIndex--;) {
                    normalized.push({
                        type: reqAxiomType,
                        args: [firstArg, exprs[exprIndex]]
                    });
                }

                return normalized;
            },

            /**
             * Checks if the given axiom is in the form C <= D, where C and D are complex class
             * expressions. If this is the case, transforms the axiom into two equivalent axioms
             *
             * C <= A
             * A <= D
             *
             * where A is a new atomic class introduced.
             *
             * @param axiom Axiom to apply the rule to.
             * @return *[] of axioms which are result of applying the rule to the given axiom or
             * null if the rule could not be applied.
             */
                function (axiom) {
                var classType, newClassExpr, reqAxiomType;

                classType = JswOWL.ExpressionTypes.ET_CLASS;
                reqAxiomType = JswOWL.ExpressionTypes.AXIOM_CLASS_SUB;

                if (axiom.type !== reqAxiomType || axiom.args[0].type === classType ||
                    axiom.args[1].type === classType) {
                    return null;
                }

                newClassExpr = createEntity(classType);

                return [
                    {
                        type: reqAxiomType,
                        args: [axiom.args[0], newClassExpr]
                    },
                    {
                        type: reqAxiomType,
                        args: [newClassExpr, axiom.args[1]]
                    }
                ];
            },

            /**
             * Checks if the given axiom is in the form C1 n C2 n ... Cn <= C, where some Ci are
             * complex class expressions. If this is the case converts the axiom into the set of
             * equivalent axioms
             *
             * Ci <= Ai
             * ..
             * C1 n ... n Ai n ... Cn <= C
             *
             * where Ai are new atomic classes introduced to substitute complex class expressions
             * Ci in the original axiom.
             *
             * @param axiom Axiom to try to apply the rule to.
             * @return Array of axioms which are result of applying the rule to the given axiom or
             * null if the rule could not be applied.
             */
                function (axiom) {
                var args, argIndex, classExpr, classType, newClassExpr, newIntersectArgs,
                    normalized, reqAxiomType, reqExprType, ruleApplied;

                reqAxiomType = JswOWL.ExpressionTypes.AXIOM_CLASS_SUB;
                reqExprType = JswOWL.ExpressionTypes.CE_INTERSECT;
                classType = JswOWL.ExpressionTypes.ET_CLASS;

                if (axiom.type !== reqAxiomType || axiom.args[0].type !== reqExprType) {
                    return null;
                }

// All expressions in the intersection.
                args = axiom.args[0].args;

                normalized = [];
                newIntersectArgs = [];
                ruleApplied = false;

                for (argIndex = args.length; argIndex--;) {
                    classExpr = args[argIndex];

                    if (classExpr.type !== classType) {
                        ruleApplied = true;
                        newClassExpr = createEntity(classType);

                        normalized.push({
                            type: reqAxiomType,
                            args: [classExpr, newClassExpr]
                        });

                        newIntersectArgs.push(newClassExpr);
                    } else {
                        newIntersectArgs.push(classExpr);
                    }
                }

                if (ruleApplied) {
                    normalized.push({
                        type: reqAxiomType,
                        args: [
                            {
                                type: reqExprType,
                                args: newIntersectArgs
                            },
                            axiom.args[1]
                        ]
                    });

                    return normalized;
                } else {
                    return null;
                }
            },

            /**
             * Checks if the given axiom is in the form E P.A <= B, where A is a complex class
             * expression. If this is the case converts the axiom into two equivalent axioms
             * A <= A1 and E P.A1 <= B, where A1 is a new atomic class.
             *
             * @param axiom Axiom to try to apply the rule to.
             * @return *[] of axioms which are result of applying the rule to the given axiom or
             * null if the rule could not be applied.
             */
                function (axiom) {
                var firstArg, classType, newClassExpr, newObjSomeValuesExpr, reqAxiomType,
                    reqExprType;

                classType = JswOWL.ExpressionTypes.ET_CLASS;
                reqAxiomType = JswOWL.ExpressionTypes.AXIOM_CLASS_SUB;
                reqExprType = JswOWL.ExpressionTypes.CE_OBJ_VALUES_FROM;

                if (axiom.type !== reqAxiomType || axiom.args[0].type !== reqExprType ||
                    axiom.args[0].classExpr.type === classType) {
                    return null;
                }

                firstArg = axiom.args[0];

                newClassExpr = createEntity(classType);

                newObjSomeValuesExpr = {
                    'type': reqExprType,
                    'opropExpr': firstArg.opropExpr,
                    'classExpr': newClassExpr
                };

                return [
                    {
                        'type': reqAxiomType,
                        'args': [firstArg.classExpr, newClassExpr]
                    },
                    {
                        'type': reqAxiomType,
                        'args': [newObjSomeValuesExpr, axiom.args[1]]
                    }
                ];
            },

            /**
             * Checks if the given axiom is in the form A <= E P.B, where B is a complex class
             * expression. If this is the case converts the axiom into two equivalent axioms
             * B1 <= B and A <= E P.B1, where B1 is a new atomic class.
             *
             * @param axiom Axiom to try to apply the rule to.
             * @return *[] of axioms which are result of applying the rule to the given axiom or
             * null if the rule could not be applied.
             */
                function (axiom) {
                var classType, newClassExpr, reqAxiomType, reqExprType, secondArg;

                classType = JswOWL.ExpressionTypes.ET_CLASS;
                reqAxiomType = JswOWL.ExpressionTypes.AXIOM_CLASS_SUB;
                reqExprType = JswOWL.ExpressionTypes.CE_OBJ_VALUES_FROM;

                if (axiom.type !== reqAxiomType || axiom.args[1].type !== reqExprType ||
                    axiom.args[1].classExpr.type === classType) {
                    return null;
                }

                secondArg = axiom.args[1];

                newClassExpr = createEntity(classType);

                return [
                    {
                        'type': reqAxiomType,
                        'args': [newClassExpr, secondArg.classExpr]
                    },
                    {
                        'type': reqAxiomType,
                        'args': [axiom.args[0], {
                            'type': reqExprType,
                            'opropExpr': secondArg.opropExpr,
                            'classExpr': newClassExpr
                        }]
                    }
                ];
            },

            /**
             * Checks if the given statement is an axiom of the form Nothing <= A. If this is the
             * case, removes the axiom from the knowledge base (the axiom states an obvious thing).
             *
             * @param statement Statement to try to apply the rule to.
             * @return Array of statements which are the result of applying the rule to the given
             * statement or null if the rule could not be applied.
             */
                function (statement) {
                var firstArg;

                if (statement.type !== JswOWL.ExpressionTypes.AXIOM_CLASS_SUB) {
                    return null;
                }

                firstArg = statement.args[0];

                if (firstArg.type === JswOWL.ExpressionTypes.ET_CLASS && firstArg.IRI === JswOWL.IRIs.NOTHING) {
                    return [];
                }

                return null;
            }
        ];

// MAIN ALGORITHM

// Copy all entities from the source to the destination ontology first.
        copyEntities();

        queue = createAxiomQueue();
        ruleCount = rules.length;

        while (!queue.isEmpty()) {
            axiom = queue.dequeue();

            // Trying to find a rule to apply to the axiom.
            for (ruleIndex = ruleCount; ruleIndex--;) {
                resultAxioms = rules[ruleIndex](axiom);

                if (resultAxioms !== null) {
                // If applying the rule succeeded.
                    for (axiomIndex = resultAxioms.length; axiomIndex--;) {
                        queue.enqueue(resultAxioms[axiomIndex]);
                    }

                    break;
                }
            }

            if (ruleIndex < 0) {
            // If nothing can be done to the axiom, it is returned unchanged by all rule
            // functions and the axiom is in one of the normal forms already.
                this.resultOntology.axioms.push(axiom);
            }
        }

        return this.resultOntology;
    }
};

module.exports = {
    create: function(data, RMethod) {
        return new Reasoner(data, RMethod);
    }
};

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/Reasoner.js","/core")
},{"./JswOWL":1,"./JswOntology":2,"./JswPairStorage":3,"./JswQueue":5,"./JswRDF":6,"./JswTrimQueryABox":10,"./JswTripleStorage":11,"./Logics/Logics":15,"./OWL2RL":18,"./ReasoningEngine":20,"buffer":29,"pBGvAp":32}],20:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by Spadon on 11/09/2015.
 */

var Logics = _dereq_('./Logics/Logics'),
    Solver = _dereq_('./Logics/Solver');


ReasoningEngine = {
    /**
     * A naive reasoner that recalculates the entire knowledge base.
     * Concat is preferred over merge for evaluation purposes.
     * @param triplesIns
     * @param triplesDel
     * @param rules
     * @returns {{fi: *, fe: *}}
     */
    naive: function(FeAdd, FeDel, F, R) {
        var FiAdd = [], FiAddNew = [], additions, deletions,
            Fe = Logics.getOnlyExplicitFacts(F), FiAddNew = [];

        // Deletion
        if(FeDel && FeDel.length) {
            Fe = Logics.minus(Fe, FeDel);
        }

        // Insertion
        if(FeAdd && FeAdd.length) {
            Fe = Logics.uniques(Fe, FeAdd);
        }

        // Recalculation
        do {
            FiAdd = Logics.uniques(FiAdd, FiAddNew);
            FiAddNew = Solver.evaluateRuleSet(R, Logics.uniques(Fe, FiAdd));
        } while (!Logics.containsFacts(FiAdd, FiAddNew));

        additions = Logics.uniques(FeAdd, FiAdd);
        deletions = Logics.minus(F, Logics.uniques(Fe, FiAdd));

        F = Logics.uniques(Fe, FiAdd);

        return {
            additions: additions,
            deletions: deletions,
            updatedF: F
        };
    },

    /**
     * Incremental reasoning which avoids complete recalculation of facts.
     * Concat is preferred over merge for evaluation purposes.
     * @param R set of rules
     * @param F set of assertions
     * @param FeAdd set of assertions to be added
     * @param FeDel set of assertions to be deleted
     */
    incremental: function (FeAdd, FeDel, F, R) {
        var Rdel = [], Rred, Rins = [],
            FiDel = [], FiAdd = [],
            FiDelNew = [], FiAddNew = [],
            superSet = [],

            additions, deletions,

            Fe = Logics.getOnlyExplicitFacts(F),
            Fi = Logics.getOnlyImplicitFacts(F);

        if(FeDel && FeDel.length) {
            // Overdeletion
            do {
                FiDel = Logics.uniques(FiDel, FiDelNew);
                Rdel = Logics.restrictRuleSet(R, Logics.uniques(FeDel, FiDel));
                FiDelNew = Solver.evaluateRuleSet(Rdel, Logics.uniques(Logics.uniques(Fi, Fe), FeDel));
            } while (!Logics.containsFacts(FiDel, FiDelNew));
            Fe = Logics.minus(Fe, FeDel);
            Fi = Logics.minus(Fi, FiDel);

            // Rederivation
            do {
                FiAdd = Logics.uniques(FiAdd, FiAddNew);
                Rred = Logics.restrictRuleSet(R, FiDel);
                FiAddNew = Solver.evaluateRuleSet(Rred, Logics.uniques(Logics.uniques(Fe, Fi), FiAdd));
            } while(!Logics.containsFacts(FiAdd, FiAddNew));

        }

        // Insertion
        if(FeAdd && FeAdd.length) {
            do {
                FiAdd = Logics.uniques(FiAdd, FiAddNew);
                superSet = Logics.uniques(Logics.uniques(Logics.uniques(Fe, Fi), FeAdd), FiAdd);
                Rins = Logics.restrictRuleSet(R, superSet);
                FiAddNew = Solver.evaluateRuleSet(Rins, superSet);
            } while (!Logics.containsFacts(FiAdd, FiAddNew));
        }

        additions = Logics.uniques(FeAdd, FiAdd);
        deletions = Logics.uniques(FeDel, FiDel);

        F = Logics.uniques(F, additions);
        F = Logics.minus(F, deletions);

        return {
            additions: additions,
            deletions: deletions,
            updatedF: F
        };
    },

    tagFilter: function(F, refs) {
        var validSet = [], kb_fe = Logics.getOnlyExplicitFacts(refs), f;
        for (var i = 0; i < F.length; i++) {
            f = F[i];
            if(f.explicit && f.valid) {
                validSet.push(f);
            } else if(f.isValid(kb_fe)) {
                validSet.push(f)
            }
        }
        return validSet;
    },

    tagging: function(FeAdd, FeDel, F, R) {
        var FiAddNew = [],
            FiAdd = [],
            Rins = [],
            Fe = Logics.getOnlyExplicitFacts(F),
            Fi = Logics.getOnlyImplicitFacts(F),
            superSet, conjunctions;

        if(FeDel.length > 0) {
            FeDel = Logics.invalidate(Fe, FeDel);
        }

        if(FeAdd.length > 0) {
            if(!Logics.containsFacts(Fe, FeAdd)) {
                do {
                    FiAdd = Logics.mergeFactSets(FiAdd, FiAddNew);
                    superSet = Logics.mergeFactSetsIn([Fe, Fi, FeAdd, FiAdd]);
                    Rins = Logics.restrictRuleSet(R, superSet);
                    FiAddNew = Solver.evaluateRuleSet(Rins, superSet);

                } while (!Logics.containsFacts(FiAdd, FiAddNew));
            }
        }

        return {
            additions: Logics.mergeFactSetsIn([FeDel, FeAdd, FiAdd])
        };
    }
};

module.exports = {
    naive: ReasoningEngine.naive,
    incremental: ReasoningEngine.incremental,
    tagging: ReasoningEngine.tagging,
    tagFilter: ReasoningEngine.tagFilter
};
}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/ReasoningEngine.js","/core")
},{"./Logics/Logics":15,"./Logics/Solver":17,"buffer":29,"pBGvAp":32}],21:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var Utils = _dereq_('./Utils');

/**
 * TrimPath Query. Release 1.1.14.
 * Copyright (C) 2004 - 2007 TrimPath.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the
 * implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
 */
if (typeof(TrimPath) == 'undefined')
    TrimPath = {};
QueryLang = function () {
};

(function () { // Using a closure to keep global namespace clean.
    var theEval = eval;
    var theString = String;
    var theArray = Array;

    QueryLang.prototype.parseSQL = function (sqlQueryIn, paramsArr) { // From sql to tql.
        var sqlQuery = sqlQueryIn.replace(/\n/g, ' ').replace(/\r/g, '');

        if (paramsArr != null) { // Convert " ?" to args from optional paramsArr.
            if (paramsArr instanceof theArray == false)
                paramsArr = [paramsArr];

            var sqlParts = sqlQuery.split(' ?');
            for (var i = 0; i < sqlParts.length - 1; i++)
                sqlParts[i] = sqlParts[i] + ' ' + cleanString(paramsArr[i], true);
            sqlQuery = sqlParts.join('');
        }

        sqlQuery = sqlQuery.replace(/ AS ([_a-zA-z0-9]+)/g, ".AS('$1')");

        var err = function (errMsg) {
            throw ("[ERROR: " + errMsg + " in query: " + sqlQueryIn + "]");
        };

        var query_type = sqlQuery.split(/\s+/)[0];
        if (query_type == 'DELETE')
            query_type = 'DESTROY';

        if (!arrayInclude(['SELECT', 'DESTROY', 'UPDATE', 'INSERT'], query_type))
            err("not a valid query type");

        var strip_whitespace = function (str) {
            return str.replace(/\s+/g, '');
        }

        if (query_type == 'SELECT' || query_type == 'DESTROY') {

            var fromSplit = sqlQuery.substring(7).split(" FROM ");
            if (fromSplit.length != 2)
                err("missing a FROM clause");

            //SELECT Invoice.*, Customer.* FROM Invoice, Customer
            //SELECT * FROM Invoice, Customer
            //DELETE things, relationships FROM relationships LEFT OUTER JOIN things ON things.relationship_id = relationships.id WHERE relationships.id = 2
            //SELECT * FROM relationships LEFT OUTER JOIN users ON relationships.created_by = users.id AND relationships.updated_by = users.id LEFT OUTER JOIN things ON things.relatedrelationship_id = relationships.id  ORDER BY relationships.updated_at DESC LIMIT 0, 20
            var columnsClause = fromSplit[0].replace(/\.\*/g, ".ALL");
            var remaining = fromSplit[1];
            var fromClause = findClause(remaining, /\sWHERE\s|\sGROUP BY\s|\sHAVING\s|\sORDER BY\s|\sLIMIT/);
            var fromTableClause = findClause(fromClause, /\sLEFT OUTER JOIN\s/);
            var fromTables = strip_whitespace(fromTableClause).split(',');
            remaining = remaining.substring(fromClause.length);

            var fromClauseSplit = fromClause.split(" LEFT OUTER JOIN ");
            var fromClauseParts = [fromClauseSplit[0]];
            var leftJoinComponents;
            for (var i = 1; i < fromClauseSplit.length; i++) {
                leftJoinComponents = /(\w+)\sON\s(.+)/.exec(fromClauseSplit[i]);
                fromTables.push(leftJoinComponents[1]);
                fromClauseParts.push('(' + leftJoinComponents[1] + ')' + '.ON(WHERE_SQL("' + leftJoinComponents[2] + '"))');
            }
            fromClause = fromClauseParts.join(", LEFT_OUTER_JOIN");

            if (strip_whitespace(columnsClause) == '*') {
                var new_columns = [];
                for (var i = 0; i < fromTables.length; i++) {
                    new_columns.push(fromTables[i] + '.ALL')
                }
                columnsClause = columnsClause.replace(/\*/, new_columns.join(', '))
            }
            var whereClause = findClause(remaining, /\sGROUP BY\s|\sHAVING\s|\sORDER BY\s|\sLIMIT/);
            remaining = remaining.substring(whereClause.length);
            var groupByClause = findClause(remaining, /\sHAVING\s|\sORDER BY\s|\sLIMIT /);
            remaining = remaining.substring(groupByClause.length);
            var havingClause = findClause(remaining, /\sORDER BY\s|\sLIMIT /);
            remaining = remaining.substring(havingClause.length);
            var orderByClause = findClause(remaining, /\sLIMIT /).replace(/\sASC/g, ".ASC").replace(/\sDESC/g, ".DESC");
            remaining = remaining.substring(orderByClause.length);
            var limitClause = remaining;

            var tql = ['SELECT(FROM(', fromClause, '), ', columnsClause];
            if (whereClause.length > 0)
                tql.push(', WHERE_SQL("' + whereClause.substring(7) + '")');
            if (groupByClause.length > 0)
                tql.push(', GROUP_BY(' + groupByClause.substring(10) + ')');
            if (havingClause.length > 0)
                tql.push(', HAVING_SQL("' + havingClause.substring(8) + '")');
            if (orderByClause.length > 0)
                tql.push(', ORDER_BY(' + orderByClause.substring(10) + ')');
            if (limitClause.length > 0)
                tql.push(', LIMIT(' + limitClause.substring(7) + ')');
            tql.push(')');
        }
        else if (query_type == "INSERT") {
            // accepts sql of the format: INSERT INTO things (field1, field2) VALUES ('value1', 'value2')
            var intoSplit = sqlQuery.substring(6).split(" INTO ");
            if (intoSplit.length != 2)
                err("missing an INTO clause");
            var insertion_regex = /^\s*(\w+)\s*\((.+)\)\s+VALUES\s+\((.+)\)/
            var parsed_sql = intoSplit[1].match(insertion_regex);
            var table_name = parsed_sql[1];
            var fields = strip_whitespace(parsed_sql[2]).split(',');
            var values = parsed_sql[3].split(',');
            if (fields.length != values.length)
                err("values and fields must have same number of elements");

            tql = ['INSERT(', table_name, ',', simpleJson(fields, values), ')'];
        }
        else if (query_type == "UPDATE") {
            // UPDATE things SET relatedrelationship_id=2, name="poop" WHERE things.relatedrelationship_id=1
            //var tql = ['UPDATE(FROM(things ), {"relatedrelationship_id": "2"}, WHERE_SQL("things.relatedrelationship_id = 1"))'];
            var setSplit = sqlQuery.substring(7).split(" SET ");
            if (setSplit.length != 2)
                err("missing a SET clause");
            var fromClause = setSplit[0];
            var remaining = setSplit[1];
            var assignmentClause = findClause(remaining, /\sWHERE\s/);
            remaining = remaining.substring(assignmentClause.length);
            var whereClause = remaining;
            var assignmentArray = assignmentClause.split(',');
            var fields = [];
            var values = [];
            for (var i = 0; i < assignmentArray.length; i++) {
                var components = assignmentArray[i].split('=');
                fields.push(strip(components[0]));
                values.push(strip(components[1]));
            }
            var update_regex = /^UPDATE\s+(\w+)\s+SET\s+(\w+\s*=\s*\w+)/
            var update_regex = /^UPDATE\s+(\w+)\s+SET\s+(\w+\s*=\s*\w+)/
            var parsed_sql = sqlQuery.match(update_regex);

            var tql = ['UPDATE(FROM(', fromClause, '), ', simpleJson(fields, values)];
            tql.push(', WHERE_SQL("' + whereClause.substring(7) + '")');
            tql.push(')');
        }
        if (query_type == 'DESTROY') {
            tql.unshift('DESTROY(');
            tql.push(')');
        }
        with (this) {
            try {
                return eval(tql.join(''));
            } catch(e) {
                throw e.toString();
            }
        }
    };

    TrimPath.TEST = TrimPath.TEST || {}; // For exposing to testing only.

    var arrayUniq = function (arr) {
        var result = [];
        for (var i = 0; i < arr.length; i++) {
            if (arrayInclude(result, arr[i]) == false)
                result.push(arr[i]);
        }
        return result;
    };

    var arrayInclude = function (arr, val) {
        for (var j = 0; j < arr.length; j++) {
            if (arr[j] == val)
                return true;
        }
        return false;
    }

    var arrayCompact = function (arr) {
        var result = [];
        for (var i = 0; i < arr.length; i++)
            if (arr[i] != null)
                result.push(arr[i])
        return result;
    }

    var simpleJson = function (fields, values) { // The fields and values are arrays of strings.
        var json = ['{'];
        for (var i = 0; i < fields.length; i++) {
            if (i > 0)
                json.push(',');
            json.push(fields[i]);
            json.push(':');
            if (values[i]) {
                json.push('"');
                json.push(values[i].replace(/(["\\])/g, '\\$1').replace(/\r/g, '').replace(/\n/g, '\\n'));
                json.push('"');
            } else
                json.push(null);
        }
        json.push('}');
        return json.join('');
    }

    var hashKeys = function (object) {
        var keys = [];
        for (var property in object)
            keys.push(property);
        return keys;
    }

    var hashValues = function (object) {
        var values = [];
        for (var property in object)
            values.push(object[property]);
        return values;
    }

    var strip = function (str) {
        return str.replace(/^\s+/, '').replace(/\s+$/, '');
    }

    TrimPath.makeQueryLang_etc = {};
    TrimPath.makeQueryLang_etc.Error = function (message, stmt) { // The stmt can be null, a String, or an Object.
        this.message = message;
        this.stmt = stmt;
    }
    TrimPath.makeQueryLang_etc.Error.prototype.toString = function () {
        return ("TrimPath query Error in " + (this.stmt != null ? this.stmt : "[unknown]") + ": " + this.message);
    }

    var TODO = function () {
        throw "currently unsupported";
    };
    var USAGE = function () {
        throw "incorrect keyword usage";
    };

    TrimPath.makeQueryLang = function (tableInfos, etc) {
        if (etc == null)
            etc = TrimPath.makeQueryLang_etc;

        var aliasArr = []; // Used after SELECT to clean up the queryLang for reuse.
        var aliasReg = function (aliasKey, scope, obj) {
            if (scope[aliasKey] != null)
                throw new etc.Error("alias redefinition: " + aliasKey);
            aliasArr.push({aliasKey: aliasKey, scope: scope, orig: scope[aliasKey]});
            scope[aliasKey] = obj;
            return obj;
        };

        var queryLang = new QueryLang();

        var checkArgs = function (args, minLength, maxLength, name, typeCheck) {
            args = cleanArray(args);
            if (minLength == null)
                minLength = 1;
            if (args == null || args.length < minLength)
                throw new etc.Error("not enough arguments for " + name);
            if (maxLength != null && args.length > maxLength)
                throw new etc.Error("too many arguments for " + name);
            if (typeCheck != null)
                for (var k in args)
                    if (typeof(args[k]) != "function" && // Ignore functions because other libraries like to extend Object.prototype.
                        args[k] instanceof typeCheck == false)
                        throw new etc.Error("wrong type for " + args[k] + " to " + name);
            return args;
        }

        var sql_date_to_js_date = function (data) {
            if (typeof data == "string" && data.match(/\d{4}-\d{1,2}-\d{1,2}/)) {
                var dateArr = data.match(/\d{4}-\d{1,2}-\d{1,2}/)[0].split('-');
                var date = new Date(parseInt(dateArr[0], 10), (parseInt(dateArr[1], 10) - 1), parseInt(dateArr[2], 10));
                return date;
            }
            return data;
        }

        var data_insertion = function (table_info, field_name, data, column_ref) {
            if (table_info[field_name]) {
                var data = eval(data);
                if (table_info[field_name].type && table_info[field_name].type == 'Number')
                    data = Number(data, 10);
                else if (table_info[field_name].type && table_info[field_name].type == 'Date')
                    data = sql_date_to_js_date(data);
                column_ref[field_name] = data;
            }
        }

        var NodeType = { // Constructor functions for SELECT statement tree nodes.
            select: function (args) {
                var columns = [];
                var nodes = {
                    from: null, where: null, groupBy: null, having: null, orderBy: null,
                    limit: null
                };

                for (var i = 0; i < args.length; i++) { // Parse args into columns and nodes.
                    var arg = args[i];
                    var argIsNode = false;
                    for (var nodeTypeName in nodes) {
                        if (arg instanceof NodeType[nodeTypeName]) {
                            if (nodes[nodeTypeName] != null)
                                throw new etc.Error("too many " + nodeTypeName.toUpperCase() + " clauses");
                            nodes[nodeTypeName] = arg;
                            argIsNode = true;
                            break;
                        }
                    }
                    if (argIsNode == false) // Then the arg must be a column.
                        columns.push(arg);
                }
                columns = checkArgs(columns, 1, null, "COLUMNS");
                if (nodes.from == null)
                    throw new etc.Error("missing FROM clause");

                var joinDriver = null;
                var joinFilter = null;
                var whereFilter = null;
                var columnConvertor = null;
                var orderByComparator = null;
                var groupByCalcValues = null;
                var havingFilter = null;

                var typeConverter = function (results) {
                    for (var i = 0; i < results.length; i++) {
                        var result = results[i];
                        for (var attr in result) {
                            var value = result[attr];
                            if (value instanceof Date)
                                results[i][attr] = dateToString(value);
                        }
                    }
                }

                this.prepareFilter = function () {
                    if (joinDriver == null)
                        joinDriver = compileJoinDriver(nodes.from.tables);
                    if (joinFilter == null)
                        joinFilter = compileFilter(compileFilterForJoin, nodes.from.tables);
                    if (whereFilter == null)
                        whereFilter = compileFilter(compileFilterForWhere, nodes.from.tables, nodes.where != null ? nodes.where.exprs : null);
                    if (groupByCalcValues == null && nodes.groupBy != null)
                        groupByCalcValues = compileGroupByCalcValues(nodes.from.tables, nodes.groupBy.exprs);
                    if (havingFilter == null && nodes.having != null)
                        havingFilter = compileFilter(compileFilterForWhere, [], nodes.having.exprs, {aliasOnly: true});
                    if (columnConvertor == null)
                        columnConvertor = compileColumnConvertor(nodes.from.tables, columns);
                    if (orderByComparator == null && nodes.orderBy != null)
                        orderByComparator = compileOrderByComparator(nodes.orderBy.exprs);
                }

                /* params is a list of parameters including:
                 * with_table: if set to true, the results will include table_name+'.'+field_name
                 * return_reference: used by update and delete queries, if set to true, returns reference of data rather than copies,
                 *                   returns the result of the joinDriver
                 */
                this.filter = function (dataTables, bindings, params) {
                    this.prepareFilter();
                    if (bindings == null)
                        bindings = {};
                    if (params == null)
                        params = {};

                    var resultOfFromWhere = joinDriver(dataTables, joinFilter, whereFilter, bindings);

                    if (groupByCalcValues != null) {
                        for (var i = 0; i < resultOfFromWhere.length; i++)
                            resultOfFromWhere[i].groupByValues = groupByCalcValues.apply(null, resultOfFromWhere[i]);
                        resultOfFromWhere.sort(groupByComparator);
                    }

                    if (params.return_reference)
                        return resultOfFromWhere;

                    var groupByAccum = {}; // Accumlation area for aggregate functions.
                    var groupByFuncs = {
                        SUM: function (key, val) {
                            groupByAccum[key] = zeroDefault(groupByAccum[key]) + zeroDefault(val);
                            return groupByAccum[key];
                        },
                        COUNT: function (key) {
                            groupByAccum[key] = zeroDefault(groupByAccum[key]) + 1;
                            return groupByAccum[key];
                        },
                        AVG: function (key, val) {
                            return groupByFuncs.SUM(key, val) / groupByFuncs.COUNT("_COUNT" + key);
                        }
                    };

                    var result = [], prevItem = null, currItem;
                    for (var i = 0; i < resultOfFromWhere.length; i++) {
                        currItem = resultOfFromWhere[i];
                        currItem[0] = groupByFuncs;
                        if (prevItem != null &&
                            groupByComparator(prevItem, currItem) != 0) {
                            if (havingFilter == null ||
                                havingFilter(prevItem.record) == true)
                                result.push(prevItem.record);
                            groupByAccum = {};
                        }
                        currItem.record = columnConvertor.apply(null, currItem.concat([params.with_table])); // Must visit every item to calculate aggregates.
                        prevItem = currItem;
                    }
                    if (prevItem != null &&
                        (havingFilter == null ||
                        havingFilter(prevItem.record) == true))
                        result.push(prevItem.record);

                    if (orderByComparator != null)
                        result.sort(orderByComparator);
                    if (nodes.limit != null) {
                        if (nodes.limit.total == 0)
                            return [];
                        var start = (nodes.limit.offset != null ? nodes.limit.offset : 0);
                        result = result.slice(start, start + (nodes.limit.total > 0 ? nodes.limit.total : result.length));
                    }

                    typeConverter(result)
                    return result;
                }

                setSSFunc(this, function () {
                    var sqlArr = ["SELECT", map(columns, toSqlWithAlias).join(", "), nodes.from.toSql()];
                    if (nodes.where != null)
                        sqlArr.push(nodes.where.toSql());
                    if (nodes.groupBy != null)
                        sqlArr.push(nodes.groupBy.toSql());
                    if (nodes.having != null)
                        sqlArr.push(nodes.having.toSql());
                    if (nodes.orderBy != null)
                        sqlArr.push(nodes.orderBy.toSql());
                    if (nodes.limit != null)
                        sqlArr.push(nodes.limit.toSql());
                    return sqlArr.join(" ");
                });

                for (var i = 0; i < aliasArr.length; i++) { // TODO: In nested select, parent's aliases are incorrectly reset.
                    var aliasItem = aliasArr[i];
                    aliasItem.scope[aliasItem.aliasKey] = aliasItem.orig;
                }
                aliasArr = [];
            },
            insert: function (args) {
                var table_info = args[0];
                var object = args[1];
                this.filter = function (dataTables, bindings) {
                    var table_name = table_info['.name'];
                    if (!dataTables[table_name])
                        dataTables[table_name] = [];
                    dataTables[table_name].push({});
                    for (var field_name in object) {
                        data_insertion(table_info, field_name, object[field_name], dataTables[table_name][dataTables[table_name].length - 1]);
                    }
                    return true;
                }

                setSSFunc(this, function () {
                    var sqlArr = ["INSERT INTO", table_info.toSql(), '(' + hashKeys(object).join(', ') + ')',
                        'VALUES', '(' + hashValues(object).join(', ') + ')'];
                    return sqlArr.join(" ");
                });
            },
            update: function (args) {
                var from_node = args[0];
                var assignments = args[1];
                var where_node = args[2];
                this.filter = function (dataTables, bindings) {
                    var table_info = from_node.tables[0];
                    var resultOfFromWhere = queryLang.SELECT(from_node, where_node, 1).filter(dataTables, null, {return_reference: true});
                    for (var i = 0; i < resultOfFromWhere.length; i++) {
                        var object = resultOfFromWhere[i][1];
                        for (var field in assignments) {
                            var fieldSplit = field.split('.');
                            var field_name = field;
                            if (fieldSplit.length == 2)
                                field_name = fieldSplit[1];
                            data_insertion(table_info, field_name, assignments[field], object);
                        }
                    }
                    return true;
                }

                setSSFunc(this, function () {
                    var sqlArr = ["UPDATE", from_node.toSql()];
                    var assignmentsArr = [];
                    for (var attr in assignments) {
                        assignmentsArr.push(attr + '=' + assignments[attr])
                    }
                    sqlArr.push(assignmentsArr.join(', '));
                    if (where_node != null)
                        sqlArr.push(where_node.toSql());
                    return sqlArr.join(" ");
                });
            },
            destroy: function (args) {
                var select_node = args[0];
                this.filter = function (dataTables, bindings) {
                    var resultOfFromWhere = select_node.filter(dataTables, null, {return_reference: true});
                    // now go through each object, go through each attribute of it and delete it
                    for (var i = 0; i < resultOfFromWhere.length; i++) {
                        var record = resultOfFromWhere[i];
                        for (var j = 1; j < record.length; j++) {
                            var object = record[j];
                            for (var attr in object) {
                                delete object[attr];
                            }
                        }
                    }
                    // then go through each table in the dataTables, each record, deleting any records that are empty objects
                    for (var table_name in dataTables) {
                        var table = dataTables[table_name]
                        for (var i = 0; i < table.length; i++) {
                            if (hashKeys(table[i]).length == 0)
                                delete table[i];
                        }
                    }
                    // then compact each table and save it back as itself
                    for (var table_name in dataTables) {
                        dataTables[table_name] = arrayCompact(dataTables[table_name]);
                    }

                    return true;
                }

                setSSFunc(this, function () {
                    var sqlArr = ["DELETE", select_node.toSql()];
                    return sqlArr.join(" ").replace(/SELECT\s/, '');
                });
            },
            from: function (tables) {
                this.tables = checkArgs(tables, 1, null, "FROM", NodeType.tableDef);
            },
            where: function (exprs) {
                this.exprs = checkArgs(exprs, 1, null, "WHERE", NodeType.expression);
            },
            groupBy: function (exprs) {
                this.exprs = checkArgs(exprs, 1, null, "GROUP_BY");
            },
            having: function (exprs) {
                this.exprs = checkArgs(exprs, 1, null, "HAVING", NodeType.expression);
            },
            orderBy: function (exprs) {
                this.exprs = checkArgs(exprs, 1, null, "ORDER_BY");
            },
            expression: function (args, name, opFix, sqlText, minArgs, maxArgs, jsText, alias) {
                var theExpr = this;
                this.args = checkArgs(args, minArgs, maxArgs, name);
                this[".name"] = name;
                this[".alias"] = alias != null ? alias : name;
                this.opFix = opFix;
                this.sqlText = sqlText != null ? sqlText : this[".name"];
                this.jsText = jsText != null ? jsText : this.sqlText;
                this.AS = function (aliasArg) {
                    this[".alias"] = this.ASC[".alias"] = this.DESC[".alias"] = aliasArg;
                    return aliasReg(aliasArg, queryLang, this);
                }
                this.ASC = setSSFunc({".name": name, ".alias": theExpr[".alias"], order: "ASC"},
                    function () {
                        return theExpr[".alias"] + " ASC";
                    });
                this.DESC = setSSFunc({".name": name, ".alias": theExpr[".alias"], order: "DESC"},
                    function () {
                        return theExpr[".alias"] + " DESC";
                    });
                this.COLLATE = TODO;
            },
            aggregate: function () {
                NodeType.expression.apply(this, arguments);
            },
            limit: function (offset, total) {
                if (total == null) { // if only one parameter, it is the total
                    this.total = cleanString(offset);
                } else {
                    this.total = cleanString(total);
                    this.offset = cleanString(offset);
                }
            },
            tableDef: function (name, columnInfos, alias) {
                this[".name"] = name;
                this[".alias"] = alias != null ? alias : name;
                this[".allColumns"] = [];
                for (var columnName in columnInfos) {
                    this[columnName] = new NodeType.columnDef(columnName, columnInfos[columnName], this);
                    this[".allColumns"].push(this[columnName]);
                }
                setSSFunc(this, function () {
                    return name;
                });
                this.AS = function (alias) {
                    return aliasReg(alias, queryLang, new NodeType.tableDef(name, columnInfos, alias));
                }
                this.ALL = new NodeType.columnDef("*", null, this);
                this.ALL.AS = null; // SELECT T.* AS X FROM T is not legal.
            },
            columnDef: function (name, columnInfo, tableDef, alias) { // The columnInfo & tableDef might be null.
                var theColumnDef = this;
                this[".name"] = name;
                this[".alias"] = alias != null ? alias : name;
                this.tableDef = tableDef;
                setSSFunc(this, function (flags) {
                    if (flags != null && flags.aliasOnly == true)
                        return this[".alias"];
                    return tableDef != null ? ((tableDef[".alias"]) + "." + name) : name;
                });
                this.AS = function (aliasArg) {
                    return aliasReg(aliasArg, queryLang, new NodeType.columnDef(name, columnInfo, tableDef, aliasArg));
                }
                if (columnInfo && columnInfo.type)
                    this.type = columnInfo.type
                else
                    this.type = "String";
                this.ASC = setSSFunc({
                        ".name": name,
                        ".alias": theColumnDef[".alias"],
                        tableDef: tableDef,
                        order: "ASC"
                    },
                    function () {
                        return theColumnDef.toSql() + " ASC";
                    });
                this.DESC = setSSFunc({
                        ".name": name,
                        ".alias": theColumnDef[".alias"],
                        tableDef: tableDef,
                        order: "DESC"
                    },
                    function () {
                        return theColumnDef.toSql() + " DESC";
                    });
                this.COLLATE = TODO;
            },
            join: function (joinType, tableDef) {
                var theJoin = this;
                this.joinType = joinType;
                this.fromSeparator = " " + joinType + " JOIN ";
                for (var k in tableDef)
                    this[k] = tableDef[k];
                this.ON = function () {
                    theJoin.ON_exprs = checkArgs(arguments, 1, null, "ON");
                    return theJoin;
                };
                this.USING = function () {
                    theJoin.USING_exprs = cleanArray(arguments, false);
                    return theJoin;
                };
                this.fromSuffix = function () {
                    if (theJoin.ON_exprs != null)
                        return (" ON " + map(theJoin.ON_exprs, toSql).join(" AND "));
                    if (theJoin.USING_exprs != null)
                        return (" USING (" + theJoin.USING_exprs.join(", ") + ")");
                    return "";
                }
            }
        }

        var setSSFunc = function (obj, func) {
            obj.toSql = obj.toJs = obj.toString = func;
            return obj;
        };

        setSSFunc(NodeType.from.prototype, function () {
            var sqlArr = ["FROM "];
            for (var i = 0; i < this.tables.length; i++) {
                if (i > 0) {
                    var sep = this.tables[i].fromSeparator;
                    if (sep == null)
                        sep = ", "
                    sqlArr.push(sep);
                }
                sqlArr.push(toSqlWithAlias(this.tables[i]));
                if (this.tables[i].fromSuffix != null)
                    sqlArr.push(this.tables[i].fromSuffix());
            }
            return sqlArr.join("");
        });

        setSSFunc(NodeType.where.prototype, function () {
            return "WHERE " + map(this.exprs, toSql).join(" AND ");
        });
        setSSFunc(NodeType.orderBy.prototype, function () {
            return "ORDER BY " + map(this.exprs, toSql).join(", ");
        });
        setSSFunc(NodeType.groupBy.prototype, function () {
            return "GROUP BY " + map(this.exprs, toSql).join(", ");
        });
        setSSFunc(NodeType.having.prototype, function () {
            return "HAVING " + map(this.exprs, toSql, {aliasOnly: true}).join(" AND ");
        });
        setSSFunc(NodeType.limit.prototype, function () {
            return "LIMIT " + (this.total < 0 ? "ALL" : this.total) +
                (this.offset != null ? (" OFFSET " + this.offset) : "");
        });

        var makeToFunc = function (toFunc, opText) {
            return function (flags) {
                if (flags != null && flags.aliasOnly == true && this[".alias"] != this[".name"])
                    return this[".alias"];
                if (this.opFix < 0) // prefix
                    return this[opText] + " (" + map(this.args, toFunc, flags).join(") " + this[opText] + " (") + ")";
                if (this.opFix > 0) // suffix
                    return "(" + map(this.args, toFunc, flags).join(") " + this[opText] + " (") + ") " + this[opText];
                return "(" + map(this.args, toFunc, flags).join(") " + this[opText] + " (") + ")"; // infix
            }
        }

        NodeType.expression.prototype.toSql = makeToFunc(toSql, "sqlText");
        NodeType.expression.prototype.toJs = makeToFunc(toJs, "jsText");

        NodeType.aggregate.prototype = new NodeType.expression([], null, null, null, 0);
        NodeType.aggregate.prototype.toJs = function (flags) {
            if (flags != null && flags.aliasOnly == true && this[".alias"] != this[".name"])
                return this[".alias"];
            return this.jsText + " ('" + this[".alias"] + "', (" + map(this.args, toJs).join("), (") + "))";
        }

        NodeType.join.prototype = new NodeType.tableDef();

        NodeType.whereSql = function (sql) {
            this.exprs = [new NodeType.rawSql(sql)];
        };
        NodeType.whereSql.prototype = new NodeType.where([new NodeType.expression([0], null, 0, null, 0, null, null, null)]);

        NodeType.havingSql = function (sql) {
            this.exprs = [new NodeType.rawSql(sql)];
        };
        NodeType.havingSql.prototype = new NodeType.having([new NodeType.expression([0], null, 0, null, 0, null, null, null)]);

        NodeType.rawSql = function (sql) {
            this.sql = sql;
        }
        NodeType.rawSql.prototype.toSql = function (flags) {
            return this.sql;
        }
        NodeType.rawSql.prototype.toJs = function (flags) {
            var js = this.sql;
            js = js.replace(/ AND /g, " && ");
            js = js.replace(/ OR /g, " || ");
            js = js.replace(/ = /g, " == ");
            js = js.replace(/ IS NULL/g, " == null");
            js = js.replace(/ IS NOT NULL/g, " != null");
            js = js.replace(/ NOT /g, " ! ");

            var LIKE_regex = /(\S+)\sLIKE\s'(\S+)'/g;
            var matchArr;
            while (matchArr = LIKE_regex.exec(js)) {
                matchArr[2] = matchArr[2].replace(/%/, '.*');
                js = js.replace(LIKE_regex, "$1.match(/" + Utils.escapeRegExp(matchArr[2]) + "/)");
            }

            // replace date-like strings with date object constructor
            var DATE_regex = /'(\d{4})-(\d{1,2})-(\d{1,2})'/g;
            while (matchArr = DATE_regex.exec(js)) {
                var dateArr = [parseInt(matchArr[1], 10).toString(), (parseInt(matchArr[2], 10) - 1).toString(), parseInt(matchArr[3], 10).toString()];
                var replacement = '(new Date(' + dateArr.join(', ') + ').valueOf())';
                js = js.replace(matchArr[0], replacement);
            }

            // NOTE: The following messes up IS NULL queries. -- steve.yen
            // >>> // replace all table+'.'+column with valueOf()
            // >>> js = js.replace(/(\w+\.\w+)/g, "$1 && $1.valueOf()");

            return js;
        }

        var keywords = {
            INSERT: function () {
                return new NodeType.insert(arguments);
            },
            UPDATE: function () {
                return new NodeType.update(arguments);
            },
            DESTROY: function () {
                return new NodeType.destroy(arguments);
            },
            SELECT_ALL: function () {
                return new NodeType.select(arguments);
            },
            SELECT_DISTINCT: TODO,
            ALL: USAGE, // We use ALL in different syntax, like SELECT_ALL.
            FROM: function () {
                return new NodeType.from(arguments);
            },
            WHERE: function () {
                return new NodeType.where(arguments);
            },
            AND: function () {
                return new NodeType.expression(arguments, "AND", 0, null, 1, null, "&&");
            },
            OR: function () {
                return new NodeType.expression(arguments, "OR", 0, null, 1, null, "||");
            },
            NOT: function () {
                return new NodeType.expression(arguments, "NOT", -1, null, 1, 1, "!");
            },
            EQ: function () {
                return new NodeType.expression(arguments, "EQ", 0, "=", 2, 2, "==");
            },
            NEQ: function () {
                return new NodeType.expression(arguments, "NEQ", 0, "!=", 2, 2);
            },
            LT: function () {
                return new NodeType.expression(arguments, "LT", 0, "<", 2, 2);
            },
            GT: function () {
                return new NodeType.expression(arguments, "GT", 0, ">", 2, 2);
            },
            LTE: function () {
                return new NodeType.expression(arguments, "LTE", 0, "<=", 2, 2);
            },
            GTE: function () {
                return new NodeType.expression(arguments, "GTE", 0, ">=", 2, 2);
            },
            IS_NULL: function () {
                return new NodeType.expression(arguments, "IS_NULL", 1, "IS NULL", 1, 1, "== null");
            },
            IS_NOT_NULL: function () {
                return new NodeType.expression(arguments, "IS_NOT_NULL", 1, "IS NOT NULL", 1, 1, "!= null");
            },
            ADD: function () {
                return new NodeType.expression(arguments, "ADD", 0, "+", 2, null);
            },
            SUBTRACT: function () {
                return new NodeType.expression(arguments, "SUBTRACT", 0, "-", 2, null);
            },
            NEGATE: function () {
                return new NodeType.expression(arguments, "NEGATE", -1, "-", 1, 1);
            },
            MULTIPLY: function () {
                return new NodeType.expression(arguments, "MULTIPLY", 0, "*", 2, null);
            },
            DIVIDE: function () {
                return new NodeType.expression(arguments, "DIVIDE", 0, "/", 2, null);
            },
            PAREN: function () {
                return new NodeType.expression(arguments, "PAREN", 0, "", 1, 1);
            },
            LIKE: function () {
                return new NodeType.expression(arguments, "LIKE", 0, "LIKE", 2, 2, "match");
            },
            BETWEEN: TODO,
            AVG: function () {
                return new NodeType.aggregate(arguments, "AVG", -1, null, 1, 1);
            },
            AVG_ALL: TODO,
            AVG_DISTINCT: TODO,
            SUM: function () {
                return new NodeType.aggregate(arguments, "SUM", -1, null, 1, 1);
            },
            SUM_ALL: TODO,
            SUM_DISTINCT: TODO,
            COUNT: function () {
                return new NodeType.aggregate(arguments, "COUNT", -1, null, 1, 1);
            },
            COUNT_ALL: TODO,
            COUNT_DISTINCT: TODO,
            AS: USAGE, // We use expression.AS(), table.AS(), and column.AS() instead.
            IN: TODO,
            UNION: TODO,
            UNION_ALL: TODO,
            EXCEPT: TODO,
            EXCEPT_ALL: TODO,
            INTERSECT: TODO,
            INTERSECT_ALL: TODO,
            CROSS_JOIN: function (tableDef) {
                return tableDef;
            },
            INNER_JOIN: function (tableDef) {
                return new NodeType.join("INNER", tableDef);
            },
            LEFT_OUTER_JOIN: function (tableDef) {
                return new NodeType.join("LEFT OUTER", tableDef);
            },
            RIGHT_OUTER_JOIN: TODO,
            FULL_OUTER_JOIN: TODO,
            ON: USAGE, // We use LEFT_OUTER_JOIN(x).ON() syntax instead.
            USING: USAGE, // We use LEFT_OUTER_JOIN(x).USING() syntax instead.
            GROUP_BY: function () {
                return new NodeType.groupBy(arguments);
            },
            HAVING: function () {
                return new NodeType.having(arguments);
            },
            ORDER_BY: function () {
                return new NodeType.orderBy(arguments);
            },
            LIMIT: function (offset, total) {
                return new NodeType.limit(offset, total);
            },
            LIMIT_ALL: function (offset) {
                return queryLang.LIMIT(-1, offset);
            },
            OFFSET: USAGE, // We use the shortcut comma-based syntax of "LIMIT count, offset".
            ANY_SELECT: TODO,  // TODO: Consider using syntax of LT.ANY(Invoice.total, SELECT(...))
            ALL_SELECT: TODO,
            EXISTS: TODO,
            WHERE_SQL: function (sql) {
                return new NodeType.whereSql(sql);
            },
            HAVING_SQL: function (sql) {
                return new NodeType.havingSql(sql);
            }
        };

        keywords.SELECT = keywords.SELECT_ALL;

        for (var k in keywords)
            queryLang[k] = keywords[k];
        for (var tableName in tableInfos)
            queryLang[tableName] = new NodeType.tableDef(tableName, tableInfos[tableName]);
        return queryLang;
    }

    /////////////////////////////////////////////////////

    var compileJoinDriver = function (tables) { // The join driver naively visits the cross-product.
        var funcText = ["var TrimPath_query_tmpJD = function(dataTables, joinFilter, whereFilter, bindings) {",
            "var result = [], filterArgs = [ bindings ];"];
        for (var i = 0; i < tables.length; i++)
            funcText.push("var T" + i + " = dataTables['" + tables[i][".name"] + "'] || [];");
        for (var i = 0; i < tables.length; i++) {
            funcText.push("for (var t" + i + " = 0; t" + i + " < T" + i + ".length; t" + i + "++) {");
            funcText.push("var resultLength" + i + " = result.length;");
            funcText.push("filterArgs[" + (i + 1) + "] = T" + i + "[t" + i + "];");
        }
        funcText.push("if ((joinFilter == null || joinFilter.apply(null, filterArgs) == true) && ");
        funcText.push("    (whereFilter == null || whereFilter.apply(null, filterArgs) == true))");
        funcText.push("result.push(filterArgs.slice(0));");
        for (var i = tables.length - 1; i >= 0; i--) {
            funcText.push("}");
            if (i >= 1 && tables[i].joinType == "LEFT OUTER") {
                funcText.push("if (resultLength" + (i - 1) + " == result.length) {");
                for (var j = i; j < tables.length; j++)
                    funcText.push("filterArgs[" + (j + 1) + "] = ");
                funcText.push("{}; if (whereFilter == null || whereFilter.apply(null, filterArgs) == true) result.push(filterArgs.slice(0)); }");
            }
        }
        funcText.push("return result; }; TrimPath_query_tmpJD");
        return theEval(funcText.join(""));
    }

    var compileFilter = function (bodyFunc, tables, whereExpressions, flags) { // Used for WHERE and HAVING.
        var funcText = ["var TrimPath_query_tmpWF = function(_BINDINGS"];
        for (var i = 0; i < tables.length; i++)
            funcText.push(", " + tables[i][".alias"]);
        funcText.push("){ with(_BINDINGS) {");
        bodyFunc(funcText, tables, whereExpressions, flags);
        funcText.push("return true; }}; TrimPath_query_tmpWF");
        try {
            return theEval(funcText.join(""));
        } catch (e) {
            throw e.toString();
        }
    }

    var compileFilterForJoin = function (funcText, tables, whereExpressions, flags) {
        for (var i = 0; i < tables.length; i++) { // Emit JOIN ON/USING clauses.
            if (tables[i].joinType != null) {
                if (tables[i].ON_exprs != null || tables[i].USING_exprs != null) {
                    funcText.push("if (!(");
                    if (tables[i].ON_exprs != null && tables[i].ON_exprs[0].exprs != null) {
                        funcText.push(tables[i].ON_exprs[0].exprs[0].toJs())
                    } else if (tables[i].ON_exprs != null)
                        funcText.push(map(tables[i].ON_exprs, toJs).join(" && "));
                    if (tables[i].USING_exprs != null)
                        funcText.push(map(tables[i].USING_exprs, function (col) {
                            return "(" + tables[i - 1][".alias"] + "." + col + " == " + tables[i][".alias"] + "." + col + ")";
                        }).join(" && "));
                    funcText.push(")) return false;");
                }
            }
        }
    }

    var compileFilterForWhere = function (funcText, tables, whereExpressions, flags) {
        if (whereExpressions != null) {
            funcText.push("if (!(("); // Emit the main WHERE clause test.
            for (var i = 0; i < whereExpressions.length; i++) {
                if (i > 0)
                    funcText.push(") && (");
                funcText.push(toJs(whereExpressions[i], flags));
            }
            funcText.push("))) return false;");
        }
    }
    var compileColumnConvertor = function (tables, columnExpressions) {
        var funcText = ["var TrimPath_query_tmpCC = function(_BINDINGS, "];
        var table_aliases = [];
        for (var i = 0; i < tables.length; i++)
            table_aliases.push(tables[i][".alias"]);
        funcText.push(arrayUniq(table_aliases).join(', '));
        funcText.push(", with_table){ with(_BINDINGS) {");
        funcText.push("var _RESULT = {};");
        funcText.push("if(with_table) {");
        compileColumnConvertorHelper(funcText, columnExpressions, true);
        funcText.push("} else {");
        compileColumnConvertorHelper(funcText, columnExpressions, false);
        funcText.push("}");
        funcText.push("return _RESULT; }}; TrimPath_query_tmpCC");
        return theEval(funcText.join(""));
    }

    var test = function (stuff) {
        var i;
    }
    var compileColumnConvertorHelper = function (funcText, columnExpressions, with_table) {
        for (var i = 0; i < columnExpressions.length; i++) {
            var columnExpression = columnExpressions[i];
            if (columnExpression[".name"] == "*") {
                compileColumnConvertorHelper(funcText, columnExpression.tableDef[".allColumns"], with_table);
            } else {
                funcText.push("_RESULT['"); // TODO: Should we add _RESULT[i] as assignee?
                if (with_table == true) {
                    funcText.push(columnExpression.toString());
                } else {
                    funcText.push(columnExpression[".alias"]);
                }
                funcText.push("'] = (");
                funcText.push(toJs(columnExpression));
                funcText.push(");");
            }
        }
    }

    var dateToString = function (date) {
        if (typeof date == 'object')
            return [date.getFullYear(), '-', (date.getMonth() + 1), '-', date.getDate()].join('');
        if (date == null)
            return null;
    }

    var compileOrderByComparator = function (orderByExpressions) {
        var funcText = ["var TrimPath_query_tmpOC = function(A, B) { var a, b; "];
        for (var i = 0; i < orderByExpressions.length; i++) {
            var orderByExpression = orderByExpressions[i];
            if (orderByExpression.tableDef) {
                funcText.push("a = A['" + orderByExpression[".alias"] + "'] || A['" +
                orderByExpression.tableDef['.alias'] + '.' + orderByExpression[".alias"] + "'] || '';");
                funcText.push("b = B['" + orderByExpression[".alias"] + "'] || B['" +
                orderByExpression.tableDef['.alias'] + '.' + orderByExpression[".alias"] + "'] || '';");
            } else {
                funcText.push("a = A['" + orderByExpression[".alias"] + "'] || '';");
                funcText.push("b = B['" + orderByExpression[".alias"] + "'] || '';");
            }
            var sign = (orderByExpression.order == "DESC" ? -1 : 1);
            funcText.push("if (a.valueOf() < b.valueOf()) return " + (sign * -1) + ";");
            funcText.push("if (a.valueOf() > b.valueOf()) return " + (sign * 1) + ";");
        }
        funcText.push("return 0; }; TrimPath_query_tmpOC");
        return theEval(funcText.join(""));
    }

    var compileGroupByCalcValues = function (tables, groupByExpressions) {
        var funcText = ["var TrimPath_query_tmpGC = function(_BINDINGS"];
        for (var i = 0; i < tables.length; i++)
            funcText.push(", " + tables[i][".alias"]);
        funcText.push("){ var _RESULT = [];");
        for (var i = 0; i < groupByExpressions.length; i++) {
            funcText.push("_RESULT.push(");
            funcText.push(toJs(groupByExpressions[i]));
            funcText.push(");");
        }
        funcText.push("return _RESULT; }; TrimPath_query_tmpGC");
        return theEval(funcText.join(""));
    }

    /////////////////////////////////////////////////////

    var groupByComparator = function (a, b) {
        return arrayCompare(a.groupByValues, b.groupByValues);
    }

    var arrayCompare = function (x, y) {
        if (x == null || y == null) return -1; // Required behavior on null for GROUP_BY to work.
        for (var i = 0; i < x.length && i < y.length; i++) {
            if (x[i] < y[i]) return -1;
            if (x[i] > y[i]) return 1;
        }
        return 0;
    }

    var toSqlWithAlias = function (obj, flags) {
        var res = toSql(obj, flags);
        if (obj[".alias"] != null &&
            obj[".alias"] != obj[".name"])
            return res + " AS " + obj[".alias"];
        return res;
    }
    var toSql = function (obj, flags) {
        return toX(obj, "toSql", flags);
    }
    var toJs = function (obj, flags) {
        return toX(obj, "toJs", flags);
    }
    var toX = function (obj, funcName, flags) {
        if (typeof(obj) == "object" && obj[funcName] != null)
            return obj[funcName].call(obj, flags);
        return theString(obj);
    }

    var zeroDefault = function (x) {
        return (x != null ? x : 0);
    }

    var map = function (arr, func, arg2) { // Lisp-style map function on an Array.
        for (var result = [], i = 0; i < arr.length; i++)
            result.push(func(arr[i], arg2));
        return result;
    }

    var cleanArray = function (src, quotes) {
        for (var result = [], i = 0; i < src.length; i++)
            result.push(cleanString(src[i], quotes));
        return result;
    }

    var cleanString = TrimPath.TEST.cleanString = function (src, quotes) { // Example: "hello" becomes "'hello'"
        if (src instanceof theString || typeof(src) == "string") {
            src = theString(src).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            if (quotes != false) // Handles null as true.
                src = "'" + src + "'";
        }
        return src;
    }

    var findClause = function (str, regexp) {
        var clauseEnd = str.search(regexp);
        if (clauseEnd < 0)
            clauseEnd = str.length;
        return str.substring(0, clauseEnd);
    }

})();

module.exports = {
    makeQueryLang: TrimPath.makeQueryLang,
    QueryLang: QueryLang
};

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/TrimPathQuery.js","/core")
},{"./Utils":22,"buffer":29,"pBGvAp":32}],22:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by Spadon on 13/02/2015.
 */

var _ = _dereq_('lodash');

module.exports = {

    ESCAPE_CHAR: '-----',

    escapeRegExp: function(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    },

    booleize: function(str) {
        if (str === 'true') {
            return true;
        } else {
            return false;
        }
    },

    /**
     * Transforms a object into a stringified version
     * and replaces commas by '-' to avoid TrimPath exceptions.
     * @param json
     * @returns {*}
     */
    stringifyNoComma: function(json) {
        if(json.length == 0) return '';
        var str =JSON.stringify(json);
        return str.replace(/,/g, this.ESCAPE_CHAR)
                .replace(/"/g, '\"');
    },

    /**
     * Reversed stringifyNoComma function.
     * @param str
     */
    unStringifyAddCommas: function(str) {
        try {
            return JSON.parse(str.replace(/\\"/g, '"')
                                .replace(new RegExp(this.ESCAPE_CHAR, 'g'), ','));
        } catch(e) {
            return [];
        }
    },

    /**
     * Get the key referring to a value in a JSON object.
     * @param obj
     * @param value
     * @returns {*}
     */
    getKeyByValue: function(obj, value) {
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop) ) {
                if(obj[prop] === value )
                    return obj;
            }
        }
        return false;
    },

    /**
     * Merges two maps.
     * @param mapToComplete
     * @param mapCompleter
     * @returns {{}}
     */
    completeMap: function(mapToComplete, mapCompleter) {
        var newMap = {}
        for(var key in mapToComplete) {
            newMap[key] = mapToComplete[key];
        }
        for(var key in mapCompleter) {
            var candidate = mapCompleter[key];
            if(!(this.getKeyByValue(newMap,candidate))) newMap[key] = mapCompleter[key];
        }
        return newMap;
    },

    /**
     * Simple HelloWorld
     * @param req
     * @param res
     */
    hello: function(req, res) {
        res.send('hello world');
    },

    /**
     * CORS Middleware
     * @param req
     * @param res
     */
    allowCrossDomain: function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    },

    /** Current server time */
    time: function(req, res) {
        res.send({
            milliseconds: new Date().getTime()
        });
    }

};

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/Utils.js","/core")
},{"buffer":29,"lodash":31,"pBGvAp":32}],23:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
function DOMParser(options){
	this.options = options ||{locator:{}};
	
}
DOMParser.prototype.parseFromString = function(source,mimeType){	
	var options = this.options;
	var sax =  new XMLReader();
	var domBuilder = options.domBuilder || new DOMHandler();//contentHandler and LexicalHandler
	var errorHandler = options.errorHandler;
	var locator = options.locator;
	var defaultNSMap = options.xmlns||{};
	var entityMap = {'lt':'<','gt':'>','amp':'&','quot':'"','apos':"'"}
	if(locator){
		domBuilder.setDocumentLocator(locator)
	}
	
	sax.errorHandler = buildErrorHandler(errorHandler,domBuilder,locator);
	sax.domBuilder = options.domBuilder || domBuilder;
	if(/\/x?html?$/.test(mimeType)){
		entityMap.nbsp = '\xa0';
		entityMap.copy = '\xa9';
		defaultNSMap['']= 'http://www.w3.org/1999/xhtml';
	}
	defaultNSMap.xml = defaultNSMap.xml || 'http://www.w3.org/XML/1998/namespace';
	if(source){
		sax.parse(source,defaultNSMap,entityMap);
	}else{
		sax.errorHandler.error("invalid document source");
	}
	return domBuilder.document;
}
function buildErrorHandler(errorImpl,domBuilder,locator){
	if(!errorImpl){
		if(domBuilder instanceof DOMHandler){
			return domBuilder;
		}
		errorImpl = domBuilder ;
	}
	var errorHandler = {}
	var isCallback = errorImpl instanceof Function;
	locator = locator||{}
	function build(key){
		var fn = errorImpl[key];
		if(!fn && isCallback){
			fn = errorImpl.length == 2?function(msg){errorImpl(key,msg)}:errorImpl;
		}
		errorHandler[key] = fn && function(msg){
			fn('[xmldom '+key+']\t'+msg+_locator(locator));
		}||function(){};
	}
	build('warning');
	build('error');
	build('fatalError');
	return errorHandler;
}

//console.log('#\n\n\n\n\n\n\n####')
/**
 * +ContentHandler+ErrorHandler
 * +LexicalHandler+EntityResolver2
 * -DeclHandler-DTDHandler 
 * 
 * DefaultHandler:EntityResolver, DTDHandler, ContentHandler, ErrorHandler
 * DefaultHandler2:DefaultHandler,LexicalHandler, DeclHandler, EntityResolver2
 * @link http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
 */
function DOMHandler() {
    this.cdata = false;
}
function position(locator,node){
	node.lineNumber = locator.lineNumber;
	node.columnNumber = locator.columnNumber;
}
/**
 * @see org.xml.sax.ContentHandler#startDocument
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
 */ 
DOMHandler.prototype = {
	startDocument : function() {
    	this.document = new DOMImplementation().createDocument(null, null, null);
    	if (this.locator) {
        	this.document.documentURI = this.locator.systemId;
    	}
	},
	startElement:function(namespaceURI, localName, qName, attrs) {
		var doc = this.document;
	    var el = doc.createElementNS(namespaceURI, qName||localName);
	    var len = attrs.length;
	    appendElement(this, el);
	    this.currentElement = el;
	    
		this.locator && position(this.locator,el)
	    for (var i = 0 ; i < len; i++) {
	        var namespaceURI = attrs.getURI(i);
	        var value = attrs.getValue(i);
	        var qName = attrs.getQName(i);
			var attr = doc.createAttributeNS(namespaceURI, qName);
			if( attr.getOffset){
				position(attr.getOffset(1),attr)
			}
			attr.value = attr.nodeValue = value;
			el.setAttributeNode(attr)
	    }
	},
	endElement:function(namespaceURI, localName, qName) {
		var current = this.currentElement
	    var tagName = current.tagName;
	    this.currentElement = current.parentNode;
	},
	startPrefixMapping:function(prefix, uri) {
	},
	endPrefixMapping:function(prefix) {
	},
	processingInstruction:function(target, data) {
	    var ins = this.document.createProcessingInstruction(target, data);
	    this.locator && position(this.locator,ins)
	    appendElement(this, ins);
	},
	ignorableWhitespace:function(ch, start, length) {
	},
	characters:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
		//console.log(chars)
		if(this.currentElement && chars){
			if (this.cdata) {
				var charNode = this.document.createCDATASection(chars);
				this.currentElement.appendChild(charNode);
			} else {
				var charNode = this.document.createTextNode(chars);
				this.currentElement.appendChild(charNode);
			}
			this.locator && position(this.locator,charNode)
		}
	},
	skippedEntity:function(name) {
	},
	endDocument:function() {
		this.document.normalize();
	},
	setDocumentLocator:function (locator) {
	    if(this.locator = locator){// && !('lineNumber' in locator)){
	    	locator.lineNumber = 0;
	    }
	},
	//LexicalHandler
	comment:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
	    var comm = this.document.createComment(chars);
	    this.locator && position(this.locator,comm)
	    appendElement(this, comm);
	},
	
	startCDATA:function() {
	    //used in characters() methods
	    this.cdata = true;
	},
	endCDATA:function() {
	    this.cdata = false;
	},
	
	startDTD:function(name, publicId, systemId) {
		var impl = this.document.implementation;
	    if (impl && impl.createDocumentType) {
	        var dt = impl.createDocumentType(name, publicId, systemId);
	        this.locator && position(this.locator,dt)
	        appendElement(this, dt);
	    }
	},
	/**
	 * @see org.xml.sax.ErrorHandler
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
	 */
	warning:function(error) {
		//console.warn('[xmldom warning]\t'+error,_locator(this.locator));
	},
	error:function(error) {
		throw (error + ' at line ' + this.locator.lineNumber);
	},
	fatalError:function(error) {
		throw (error + ' at line ' + this.locator.lineNumber);
	}
}
function _locator(l){
	if(l){
		return '\n@'+(l.systemId ||'')+'#[line:'+l.lineNumber+',col:'+l.columnNumber+']'
	}
}
function _toString(chars,start,length){
	if(typeof chars == 'string'){
		return chars.substr(start,length)
	}else{//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
		if(chars.length >= start+length || start){
			return new java.lang.String(chars,start,length)+'';
		}
		return chars;
	}
}

/*
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
 * used method of org.xml.sax.ext.LexicalHandler:
 *  #comment(chars, start, length)
 *  #startCDATA()
 *  #endCDATA()
 *  #startDTD(name, publicId, systemId)
 *
 *
 * IGNORED method of org.xml.sax.ext.LexicalHandler:
 *  #endDTD()
 *  #startEntity(name)
 *  #endEntity(name)
 *
 *
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html
 * IGNORED method of org.xml.sax.ext.DeclHandler
 * 	#attributeDecl(eName, aName, type, mode, value)
 *  #elementDecl(name, model)
 *  #externalEntityDecl(name, publicId, systemId)
 *  #internalEntityDecl(name, value)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
 * IGNORED method of org.xml.sax.EntityResolver2
 *  #resolveEntity(String name,String publicId,String baseURI,String systemId)
 *  #resolveEntity(publicId, systemId)
 *  #getExternalSubset(name, baseURI)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
 * IGNORED method of org.xml.sax.DTDHandler
 *  #notationDecl(name, publicId, systemId) {};
 *  #unparsedEntityDecl(name, publicId, systemId, notationName) {};
 */
"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){
	DOMHandler.prototype[key] = function(){return null}
})

/* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
function appendElement (hander,node) {
    if (!hander.currentElement) {
        hander.document.appendChild(node);
    } else {
        hander.currentElement.appendChild(node);
    }
}//appendChild and setAttributeNS are preformance key

if(typeof _dereq_ == 'function'){
	var XMLReader = _dereq_('./sax').XMLReader;
	var DOMImplementation = exports.DOMImplementation = _dereq_('./dom').DOMImplementation;
	exports.XMLSerializer = _dereq_('./dom').XMLSerializer ;
	exports.DOMParser = DOMParser;
}

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/xmldom/dom-parser.js","/core/xmldom")
},{"./dom":24,"./sax":25,"buffer":29,"pBGvAp":32}],24:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*
 * DOM Level 2
 * Object DOMException
 * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
 */

function copy(src,dest){
	for(var p in src){
		dest[p] = src[p];
	}
}
/**
^\w+\.prototype\.([_\w]+)\s*=\s*((?:.*\{\s*?[\r\n][\s\S]*?^})|\S.*?(?=[;\r\n]));?
^\w+\.prototype\.([_\w]+)\s*=\s*(\S.*?(?=[;\r\n]));?
 */
function _extends(Class,Super){
	var pt = Class.prototype;
	if(Object.create){
		var ppt = Object.create(Super.prototype)
		pt.__proto__ = ppt;
	}
	if(!(pt instanceof Super)){
		function t(){};
		t.prototype = Super.prototype;
		t = new t();
		copy(pt,t);
		Class.prototype = pt = t;
	}
	if(pt.constructor != Class){
		if(typeof Class != 'function'){
			console.error("unknow Class:"+Class)
		}
		pt.constructor = Class
	}
}
var htmlns = 'http://www.w3.org/1999/xhtml' ;
// Node Types
var NodeType = {}
var ELEMENT_NODE                = NodeType.ELEMENT_NODE                = 1;
var ATTRIBUTE_NODE              = NodeType.ATTRIBUTE_NODE              = 2;
var TEXT_NODE                   = NodeType.TEXT_NODE                   = 3;
var CDATA_SECTION_NODE          = NodeType.CDATA_SECTION_NODE          = 4;
var ENTITY_REFERENCE_NODE       = NodeType.ENTITY_REFERENCE_NODE       = 5;
var ENTITY_NODE                 = NodeType.ENTITY_NODE                 = 6;
var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
var COMMENT_NODE                = NodeType.COMMENT_NODE                = 8;
var DOCUMENT_NODE               = NodeType.DOCUMENT_NODE               = 9;
var DOCUMENT_TYPE_NODE          = NodeType.DOCUMENT_TYPE_NODE          = 10;
var DOCUMENT_FRAGMENT_NODE      = NodeType.DOCUMENT_FRAGMENT_NODE      = 11;
var NOTATION_NODE               = NodeType.NOTATION_NODE               = 12;

// ExceptionCode
var ExceptionCode = {}
var ExceptionMessage = {};
var INDEX_SIZE_ERR              = ExceptionCode.INDEX_SIZE_ERR              = ((ExceptionMessage[1]="Index size error"),1);
var DOMSTRING_SIZE_ERR          = ExceptionCode.DOMSTRING_SIZE_ERR          = ((ExceptionMessage[2]="DOMString size error"),2);
var HIERARCHY_REQUEST_ERR       = ExceptionCode.HIERARCHY_REQUEST_ERR       = ((ExceptionMessage[3]="Hierarchy request error"),3);
var WRONG_DOCUMENT_ERR          = ExceptionCode.WRONG_DOCUMENT_ERR          = ((ExceptionMessage[4]="Wrong document"),4);
var INVALID_CHARACTER_ERR       = ExceptionCode.INVALID_CHARACTER_ERR       = ((ExceptionMessage[5]="Invalid character"),5);
var NO_DATA_ALLOWED_ERR         = ExceptionCode.NO_DATA_ALLOWED_ERR         = ((ExceptionMessage[6]="No data allowed"),6);
var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = ((ExceptionMessage[7]="No modification allowed"),7);
var NOT_FOUND_ERR               = ExceptionCode.NOT_FOUND_ERR               = ((ExceptionMessage[8]="Not found"),8);
var NOT_SUPPORTED_ERR           = ExceptionCode.NOT_SUPPORTED_ERR           = ((ExceptionMessage[9]="Not supported"),9);
var INUSE_ATTRIBUTE_ERR         = ExceptionCode.INUSE_ATTRIBUTE_ERR         = ((ExceptionMessage[10]="Attribute in use"),10);
//level2
var INVALID_STATE_ERR        	= ExceptionCode.INVALID_STATE_ERR        	= ((ExceptionMessage[11]="Invalid state"),11);
var SYNTAX_ERR               	= ExceptionCode.SYNTAX_ERR               	= ((ExceptionMessage[12]="Syntax error"),12);
var INVALID_MODIFICATION_ERR 	= ExceptionCode.INVALID_MODIFICATION_ERR 	= ((ExceptionMessage[13]="Invalid modification"),13);
var NAMESPACE_ERR            	= ExceptionCode.NAMESPACE_ERR           	= ((ExceptionMessage[14]="Invalid namespace"),14);
var INVALID_ACCESS_ERR       	= ExceptionCode.INVALID_ACCESS_ERR      	= ((ExceptionMessage[15]="Invalid access"),15);


function DOMException(code, message) {
	if(message instanceof Error){
		var error = message;
	}else{
		error = this;
		Error.call(this, ExceptionMessage[code]);
		this.message = ExceptionMessage[code];
		if(Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
	}
	error.code = code;
	if(message) this.message = this.message + ": " + message;
	return error;
};
DOMException.prototype = Error.prototype;
copy(ExceptionCode,DOMException)
/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-536297177
 * The NodeList interface provides the abstraction of an ordered collection of nodes, without defining or constraining how this collection is implemented. NodeList objects in the DOM are live.
 * The items in the NodeList are accessible via an integral index, starting from 0.
 */
function NodeList() {
};
NodeList.prototype = {
	/**
	 * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
	 * @standard level1
	 */
	length:0, 
	/**
	 * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
	 * @standard level1
	 * @param index  unsigned long 
	 *   Index into the collection.
	 * @return Node
	 * 	The node at the indexth position in the NodeList, or null if that is not a valid index. 
	 */
	item: function(index) {
		return this[index] || null;
	},
	toString:function(){
		for(var buf = [], i = 0;i<this.length;i++){
			serializeToString(this[i],buf);
		}
		return buf.join('');
	}
};
function LiveNodeList(node,refresh){
	this._node = node;
	this._refresh = refresh
	_updateLiveList(this);
}
function _updateLiveList(list){
	var inc = list._node._inc || list._node.ownerDocument._inc;
	if(list._inc != inc){
		var ls = list._refresh(list._node);
		//console.log(ls.length)
		__set__(list,'length',ls.length);
		copy(ls,list);
		list._inc = inc;
	}
}
LiveNodeList.prototype.item = function(i){
	_updateLiveList(this);
	return this[i];
}

_extends(LiveNodeList,NodeList);
/**
 * 
 * Objects implementing the NamedNodeMap interface are used to represent collections of nodes that can be accessed by name. Note that NamedNodeMap does not inherit from NodeList; NamedNodeMaps are not maintained in any particular order. Objects contained in an object implementing NamedNodeMap may also be accessed by an ordinal index, but this is simply to allow convenient enumeration of the contents of a NamedNodeMap, and does not imply that the DOM specifies an order to these Nodes.
 * NamedNodeMap objects in the DOM are live.
 * used for attributes or DocumentType entities 
 */
function NamedNodeMap() {
};

function _findNodeIndex(list,node){
	var i = list.length;
	while(i--){
		if(list[i] === node){return i}
	}
}

function _addNamedNode(el,list,newAttr,oldAttr){
	if(oldAttr){
		list[_findNodeIndex(list,oldAttr)] = newAttr;
	}else{
		list[list.length++] = newAttr;
	}
	if(el){
		newAttr.ownerElement = el;
		var doc = el.ownerDocument;
		if(doc){
			oldAttr && _onRemoveAttribute(doc,el,oldAttr);
			_onAddAttribute(doc,el,newAttr);
		}
	}
}
function _removeNamedNode(el,list,attr){
	var i = _findNodeIndex(list,attr);
	if(i>=0){
		var lastIndex = list.length-1
		while(i<lastIndex){
			list[i] = list[++i]
		}
		list.length = lastIndex;
		if(el){
			var doc = el.ownerDocument;
			if(doc){
				_onRemoveAttribute(doc,el,attr);
				attr.ownerElement = null;
			}
		}
	}else{
		throw DOMException(NOT_FOUND_ERR,new Error())
	}
}
NamedNodeMap.prototype = {
	length:0,
	item:NodeList.prototype.item,
	getNamedItem: function(key) {
//		if(key.indexOf(':')>0 || key == 'xmlns'){
//			return null;
//		}
		var i = this.length;
		while(i--){
			var attr = this[i];
			if(attr.nodeName == key){
				return attr;
			}
		}
	},
	setNamedItem: function(attr) {
		var el = attr.ownerElement;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		var oldAttr = this.getNamedItem(attr.nodeName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},
	/* returns Node */
	setNamedItemNS: function(attr) {// raises: WRONG_DOCUMENT_ERR,NO_MODIFICATION_ALLOWED_ERR,INUSE_ATTRIBUTE_ERR
		var el = attr.ownerElement, oldAttr;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		oldAttr = this.getNamedItemNS(attr.namespaceURI,attr.localName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},

	/* returns Node */
	removeNamedItem: function(key) {
		var attr = this.getNamedItem(key);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
		
		
	},// raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
	
	//for level2
	removeNamedItemNS:function(namespaceURI,localName){
		var attr = this.getNamedItemNS(namespaceURI,localName);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
	},
	getNamedItemNS: function(namespaceURI, localName) {
		var i = this.length;
		while(i--){
			var node = this[i];
			if(node.localName == localName && node.namespaceURI == namespaceURI){
				return node;
			}
		}
		return null;
	}
};
/**
 * @see http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-102161490
 */
function DOMImplementation(/* Object */ features) {
	this._features = {};
	if (features) {
		for (var feature in features) {
			 this._features = features[feature];
		}
	}
};

DOMImplementation.prototype = {
	hasFeature: function(/* string */ feature, /* string */ version) {
		var versions = this._features[feature.toLowerCase()];
		if (versions && (!version || version in versions)) {
			return true;
		} else {
			return false;
		}
	},
	// Introduced in DOM Level 2:
	createDocument:function(namespaceURI,  qualifiedName, doctype){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR,WRONG_DOCUMENT_ERR
		var doc = new Document();
		doc.implementation = this;
		doc.childNodes = new NodeList();
		doc.doctype = doctype;
		if(doctype){
			doc.appendChild(doctype);
		}
		if(qualifiedName){
			var root = doc.createElementNS(namespaceURI,qualifiedName);
			doc.appendChild(root);
		}
		return doc;
	},
	// Introduced in DOM Level 2:
	createDocumentType:function(qualifiedName, publicId, systemId){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR
		var node = new DocumentType();
		node.name = qualifiedName;
		node.nodeName = qualifiedName;
		node.publicId = publicId;
		node.systemId = systemId;
		// Introduced in DOM Level 2:
		//readonly attribute DOMString        internalSubset;
		
		//TODO:..
		//  readonly attribute NamedNodeMap     entities;
		//  readonly attribute NamedNodeMap     notations;
		return node;
	}
};


/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
 */

function Node() {
};

Node.prototype = {
	firstChild : null,
	lastChild : null,
	previousSibling : null,
	nextSibling : null,
	attributes : null,
	parentNode : null,
	childNodes : null,
	ownerDocument : null,
	nodeValue : null,
	namespaceURI : null,
	prefix : null,
	localName : null,
	// Modified in DOM Level 2:
	insertBefore:function(newChild, refChild){//raises 
		return _insertBefore(this,newChild,refChild);
	},
	replaceChild:function(newChild, oldChild){//raises 
		this.insertBefore(newChild,oldChild);
		if(oldChild){
			this.removeChild(oldChild);
		}
	},
	removeChild:function(oldChild){
		return _removeChild(this,oldChild);
	},
	appendChild:function(newChild){
		return this.insertBefore(newChild,null);
	},
	hasChildNodes:function(){
		return this.firstChild != null;
	},
	cloneNode:function(deep){
		return cloneNode(this.ownerDocument||this,this,deep);
	},
	// Modified in DOM Level 2:
	normalize:function(){
		var child = this.firstChild;
		while(child){
			var next = child.nextSibling;
			if(next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE){
				this.removeChild(next);
				child.appendData(next.data);
			}else{
				child.normalize();
				child = next;
			}
		}
	},
  	// Introduced in DOM Level 2:
	isSupported:function(feature, version){
		return this.ownerDocument.implementation.hasFeature(feature,version);
	},
    // Introduced in DOM Level 2:
    hasAttributes:function(){
    	return this.attributes.length>0;
    },
    lookupPrefix:function(namespaceURI){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			for(var n in map){
    				if(map[n] == namespaceURI){
    					return n;
    				}
    			}
    		}
    		el = el.nodeType == 2?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    lookupNamespaceURI:function(prefix){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			if(prefix in map){
    				return map[prefix] ;
    			}
    		}
    		el = el.nodeType == 2?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    isDefaultNamespace:function(namespaceURI){
    	var prefix = this.lookupPrefix(namespaceURI);
    	return prefix == null;
    }
};


function _xmlEncoder(c){
	return c == '<' && '&lt;' ||
         c == '>' && '&gt;' ||
         c == '&' && '&amp;' ||
         c == '"' && '&quot;' ||
         '&#'+c.charCodeAt()+';'
}


copy(NodeType,Node);
copy(NodeType,Node.prototype);

/**
 * @param callback return true for continue,false for break
 * @return boolean true: break visit;
 */
function _visitNode(node,callback){
	if(callback(node)){
		return true;
	}
	if(node = node.firstChild){
		do{
			if(_visitNode(node,callback)){return true}
        }while(node=node.nextSibling)
    }
}



function Document(){
}
function _onAddAttribute(doc,el,newAttr){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		el._nsMap[newAttr.prefix?newAttr.localName:''] = newAttr.value
	}
}
function _onRemoveAttribute(doc,el,newAttr,remove){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		delete el._nsMap[newAttr.prefix?newAttr.localName:'']
	}
}
function _onUpdateChild(doc,el,newChild){
	if(doc && doc._inc){
		doc._inc++;
		//update childNodes
		var cs = el.childNodes;
		if(newChild){
			cs[cs.length++] = newChild;
		}else{
			//console.log(1)
			var child = el.firstChild;
			var i = 0;
			while(child){
				cs[i++] = child;
				child =child.nextSibling;
			}
			cs.length = i;
		}
	}
}

/**
 * attributes;
 * children;
 * 
 * writeable properties:
 * nodeValue,Attr:value,CharacterData:data
 * prefix
 */
function _removeChild(parentNode,child){
	var previous = child.previousSibling;
	var next = child.nextSibling;
	if(previous){
		previous.nextSibling = next;
	}else{
		parentNode.firstChild = next
	}
	if(next){
		next.previousSibling = previous;
	}else{
		parentNode.lastChild = previous;
	}
	_onUpdateChild(parentNode.ownerDocument,parentNode);
	return child;
}
/**
 * preformance key(refChild == null)
 */
function _insertBefore(parentNode,newChild,nextChild){
	var cp = newChild.parentNode;
	if(cp){
		cp.removeChild(newChild);//remove and update
	}
	if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
		var newFirst = newChild.firstChild;
		if (newFirst == null) {
			return newChild;
		}
		var newLast = newChild.lastChild;
	}else{
		newFirst = newLast = newChild;
	}
	var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;

	newFirst.previousSibling = pre;
	newLast.nextSibling = nextChild;
	
	
	if(pre){
		pre.nextSibling = newFirst;
	}else{
		parentNode.firstChild = newFirst;
	}
	if(nextChild == null){
		parentNode.lastChild = newLast;
	}else{
		nextChild.previousSibling = newLast;
	}
	do{
		newFirst.parentNode = parentNode;
	}while(newFirst !== newLast && (newFirst= newFirst.nextSibling))
	_onUpdateChild(parentNode.ownerDocument||parentNode,parentNode);
	//console.log(parentNode.lastChild.nextSibling == null)
	if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
		newChild.firstChild = newChild.lastChild = null;
	}
	return newChild;
}
function _appendSingleChild(parentNode,newChild){
	var cp = newChild.parentNode;
	if(cp){
		var pre = parentNode.lastChild;
		cp.removeChild(newChild);//remove and update
		var pre = parentNode.lastChild;
	}
	var pre = parentNode.lastChild;
	newChild.parentNode = parentNode;
	newChild.previousSibling = pre;
	newChild.nextSibling = null;
	if(pre){
		pre.nextSibling = newChild;
	}else{
		parentNode.firstChild = newChild;
	}
	parentNode.lastChild = newChild;
	_onUpdateChild(parentNode.ownerDocument,parentNode,newChild);
	return newChild;
	//console.log("__aa",parentNode.lastChild.nextSibling == null)
}
Document.prototype = {
	//implementation : null,
	nodeName :  '#document',
	nodeType :  DOCUMENT_NODE,
	doctype :  null,
	documentElement :  null,
	_inc : 1,
	
	insertBefore :  function(newChild, refChild){//raises 
		if(newChild.nodeType == DOCUMENT_FRAGMENT_NODE){
			var child = newChild.firstChild;
			while(child){
				var next = child.nextSibling;
				this.insertBefore(child,refChild);
				child = next;
			}
			return newChild;
		}
		if(this.documentElement == null && newChild.nodeType == 1){
			this.documentElement = newChild;
		}
		
		return _insertBefore(this,newChild,refChild),(newChild.ownerDocument = this),newChild;
	},
	removeChild :  function(oldChild){
		if(this.documentElement == oldChild){
			this.documentElement = null;
		}
		return _removeChild(this,oldChild);
	},
	// Introduced in DOM Level 2:
	importNode : function(importedNode,deep){
		return importNode(this,importedNode,deep);
	},
	// Introduced in DOM Level 2:
	getElementById :	function(id){
		var rtv = null;
		_visitNode(this.documentElement,function(node){
			if(node.nodeType == 1){
				if(node.getAttribute('id') == id){
					rtv = node;
					return true;
				}
			}
		})
		return rtv;
	},
	
	//document factory method:
	createElement :	function(tagName){
		var node = new Element();
		node.ownerDocument = this;
		node.nodeName = tagName;
		node.tagName = tagName;
		node.childNodes = new NodeList();
		var attrs	= node.attributes = new NamedNodeMap();
		attrs._ownerElement = node;
		return node;
	},
	createDocumentFragment :	function(){
		var node = new DocumentFragment();
		node.ownerDocument = this;
		node.childNodes = new NodeList();
		return node;
	},
	createTextNode :	function(data){
		var node = new Text();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createComment :	function(data){
		var node = new Comment();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createCDATASection :	function(data){
		var node = new CDATASection();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createProcessingInstruction :	function(target,data){
		var node = new ProcessingInstruction();
		node.ownerDocument = this;
		node.tagName = node.target = target;
		node.nodeValue= node.data = data;
		return node;
	},
	createAttribute :	function(name){
		var node = new Attr();
		node.ownerDocument	= this;
		node.name = name;
		node.nodeName	= name;
		node.localName = name;
		node.specified = true;
		return node;
	},
	createEntityReference :	function(name){
		var node = new EntityReference();
		node.ownerDocument	= this;
		node.nodeName	= name;
		return node;
	},
	// Introduced in DOM Level 2:
	createElementNS :	function(namespaceURI,qualifiedName){
		var node = new Element();
		var pl = qualifiedName.split(':');
		var attrs	= node.attributes = new NamedNodeMap();
		node.childNodes = new NodeList();
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.tagName = qualifiedName;
		node.namespaceURI = namespaceURI;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		attrs._ownerElement = node;
		return node;
	},
	// Introduced in DOM Level 2:
	createAttributeNS :	function(namespaceURI,qualifiedName){
		var node = new Attr();
		var pl = qualifiedName.split(':');
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.name = qualifiedName;
		node.namespaceURI = namespaceURI;
		node.specified = true;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		return node;
	}
};
_extends(Document,Node);


function Element() {
	this._nsMap = {};
};
Element.prototype = {
	nodeType : ELEMENT_NODE,
	hasAttribute : function(name){
		return this.getAttributeNode(name)!=null;
	},
	getAttribute : function(name){
		var attr = this.getAttributeNode(name);
		return attr && attr.value || '';
	},
	getAttributeNode : function(name){
		return this.attributes.getNamedItem(name);
	},
	setAttribute : function(name, value){
		var attr = this.ownerDocument.createAttribute(name);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	removeAttribute : function(name){
		var attr = this.getAttributeNode(name)
		attr && this.removeAttributeNode(attr);
	},
	
	//four real opeartion method
	appendChild:function(newChild){
		if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
			return this.insertBefore(newChild,null);
		}else{
			return _appendSingleChild(this,newChild);
		}
	},
	setAttributeNode : function(newAttr){
		return this.attributes.setNamedItem(newAttr);
	},
	setAttributeNodeNS : function(newAttr){
		return this.attributes.setNamedItemNS(newAttr);
	},
	removeAttributeNode : function(oldAttr){
		return this.attributes.removeNamedItem(oldAttr.nodeName);
	},
	//get real attribute name,and remove it by removeAttributeNode
	removeAttributeNS : function(namespaceURI, localName){
		var old = this.getAttributeNodeNS(namespaceURI, localName);
		old && this.removeAttributeNode(old);
	},
	
	hasAttributeNS : function(namespaceURI, localName){
		return this.getAttributeNodeNS(namespaceURI, localName)!=null;
	},
	getAttributeNS : function(namespaceURI, localName){
		var attr = this.getAttributeNodeNS(namespaceURI, localName);
		return attr && attr.value || '';
	},
	setAttributeNS : function(namespaceURI, qualifiedName, value){
		var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	getAttributeNodeNS : function(namespaceURI, localName){
		return this.attributes.getNamedItemNS(namespaceURI, localName);
	},
	
	getElementsByTagName : function(tagName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType == ELEMENT_NODE && (tagName === '*' || node.tagName == tagName)){
					ls.push(node);
				}
			});
			return ls;
		});
	},
	getElementsByTagNameNS : function(namespaceURI, localName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === '*' || node.namespaceURI === namespaceURI) && (localName === '*' || node.localName == localName)){
					ls.push(node);
				}
			});
			return ls;
		});
	}
};
Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;


_extends(Element,Node);
function Attr() {
};
Attr.prototype.nodeType = ATTRIBUTE_NODE;
_extends(Attr,Node);


function CharacterData() {
};
CharacterData.prototype = {
	data : '',
	substringData : function(offset, count) {
		return this.data.substring(offset, offset+count);
	},
	appendData: function(text) {
		text = this.data+text;
		this.nodeValue = this.data = text;
		this.length = text.length;
	},
	insertData: function(offset,text) {
		this.replaceData(offset,0,text);
	
	},
	appendChild:function(newChild){
		//if(!(newChild instanceof CharacterData)){
			throw new Error(ExceptionMessage[3])
		//}
		return Node.prototype.appendChild.apply(this,arguments)
	},
	deleteData: function(offset, count) {
		this.replaceData(offset,count,"");
	},
	replaceData: function(offset, count, text) {
		var start = this.data.substring(0,offset);
		var end = this.data.substring(offset+count);
		text = start + text + end;
		this.nodeValue = this.data = text;
		this.length = text.length;
	}
}
_extends(CharacterData,Node);
function Text() {
};
Text.prototype = {
	nodeName : "#text",
	nodeType : TEXT_NODE,
	splitText : function(offset) {
		var text = this.data;
		var newText = text.substring(offset);
		text = text.substring(0, offset);
		this.data = this.nodeValue = text;
		this.length = text.length;
		var newNode = this.ownerDocument.createTextNode(newText);
		if(this.parentNode){
			this.parentNode.insertBefore(newNode, this.nextSibling);
		}
		return newNode;
	}
}
_extends(Text,CharacterData);
function Comment() {
};
Comment.prototype = {
	nodeName : "#comment",
	nodeType : COMMENT_NODE
}
_extends(Comment,CharacterData);

function CDATASection() {
};
CDATASection.prototype = {
	nodeName : "#cdata-section",
	nodeType : CDATA_SECTION_NODE
}
_extends(CDATASection,CharacterData);


function DocumentType() {
};
DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
_extends(DocumentType,Node);

function Notation() {
};
Notation.prototype.nodeType = NOTATION_NODE;
_extends(Notation,Node);

function Entity() {
};
Entity.prototype.nodeType = ENTITY_NODE;
_extends(Entity,Node);

function EntityReference() {
};
EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
_extends(EntityReference,Node);

function DocumentFragment() {
};
DocumentFragment.prototype.nodeName =	"#document-fragment";
DocumentFragment.prototype.nodeType =	DOCUMENT_FRAGMENT_NODE;
_extends(DocumentFragment,Node);


function ProcessingInstruction() {
}
ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
_extends(ProcessingInstruction,Node);
function XMLSerializer(){}
XMLSerializer.prototype.serializeToString = function(node,attributeSorter){
	return node.toString(attributeSorter);
}
Node.prototype.toString =function(attributeSorter){
	var buf = [];
	serializeToString(this,buf,attributeSorter);
	return buf.join('');
}
function serializeToString(node,buf,attributeSorter,isHTML){
	switch(node.nodeType){
	case ELEMENT_NODE:
		var attrs = node.attributes;
		var len = attrs.length;
		var child = node.firstChild;
		var nodeName = node.tagName;
		isHTML =  (htmlns === node.namespaceURI) ||isHTML 
		buf.push('<',nodeName);
		if(attributeSorter){
			buf.sort.apply(attrs, attributeSorter);
		}
		for(var i=0;i<len;i++){
			serializeToString(attrs.item(i),buf,attributeSorter,isHTML);
		}
		if(child || isHTML && !/^(?:meta|link|img|br|hr|input|button)$/i.test(nodeName)){
			buf.push('>');
			//if is cdata child node
			if(isHTML && /^script$/i.test(nodeName)){
				if(child){
					buf.push(child.data);
				}
			}else{
				while(child){
					serializeToString(child,buf,attributeSorter,isHTML);
					child = child.nextSibling;
				}
			}
			buf.push('</',nodeName,'>');
		}else{
			buf.push('/>');
		}
		return;
	case DOCUMENT_NODE:
	case DOCUMENT_FRAGMENT_NODE:
		var child = node.firstChild;
		while(child){
			serializeToString(child,buf,attributeSorter,isHTML);
			child = child.nextSibling;
		}
		return;
	case ATTRIBUTE_NODE:
		return buf.push(' ',node.name,'="',node.value.replace(/[<&"]/g,_xmlEncoder),'"');
	case TEXT_NODE:
		return buf.push(node.data.replace(/[<&]/g,_xmlEncoder));
	case CDATA_SECTION_NODE:
		return buf.push( '<![CDATA[',node.data,']]>');
	case COMMENT_NODE:
		return buf.push( "<!--",node.data,"-->");
	case DOCUMENT_TYPE_NODE:
		var pubid = node.publicId;
		var sysid = node.systemId;
		buf.push('<!DOCTYPE ',node.name);
		if(pubid){
			buf.push(' PUBLIC "',pubid);
			if (sysid && sysid!='.') {
				buf.push( '" "',sysid);
			}
			buf.push('">');
		}else if(sysid && sysid!='.'){
			buf.push(' SYSTEM "',sysid,'">');
		}else{
			var sub = node.internalSubset;
			if(sub){
				buf.push(" [",sub,"]");
			}
			buf.push(">");
		}
		return;
	case PROCESSING_INSTRUCTION_NODE:
		return buf.push( "<?",node.target," ",node.data,"?>");
	case ENTITY_REFERENCE_NODE:
		return buf.push( '&',node.nodeName,';');
	//case ENTITY_NODE:
	//case NOTATION_NODE:
	default:
		buf.push('??',node.nodeName);
	}
}
function importNode(doc,node,deep){
	var node2;
	switch (node.nodeType) {
	case ELEMENT_NODE:
		node2 = node.cloneNode(false);
		node2.ownerDocument = doc;
		//var attrs = node2.attributes;
		//var len = attrs.length;
		//for(var i=0;i<len;i++){
			//node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
		//}
	case DOCUMENT_FRAGMENT_NODE:
		break;
	case ATTRIBUTE_NODE:
		deep = true;
		break;
	//case ENTITY_REFERENCE_NODE:
	//case PROCESSING_INSTRUCTION_NODE:
	////case TEXT_NODE:
	//case CDATA_SECTION_NODE:
	//case COMMENT_NODE:
	//	deep = false;
	//	break;
	//case DOCUMENT_NODE:
	//case DOCUMENT_TYPE_NODE:
	//cannot be imported.
	//case ENTITY_NODE:
	//case NOTATION_NODE：
	//can not hit in level3
	//default:throw e;
	}
	if(!node2){
		node2 = node.cloneNode(false);//false
	}
	node2.ownerDocument = doc;
	node2.parentNode = null;
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(importNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}
//
//var _relationMap = {firstChild:1,lastChild:1,previousSibling:1,nextSibling:1,
//					attributes:1,childNodes:1,parentNode:1,documentElement:1,doctype,};
function cloneNode(doc,node,deep){
	var node2 = new node.constructor();
	for(var n in node){
		var v = node[n];
		if(typeof v != 'object' ){
			if(v != node2[n]){
				node2[n] = v;
			}
		}
	}
	if(node.childNodes){
		node2.childNodes = new NodeList();
	}
	node2.ownerDocument = doc;
	switch (node2.nodeType) {
	case ELEMENT_NODE:
		var attrs	= node.attributes;
		var attrs2	= node2.attributes = new NamedNodeMap();
		var len = attrs.length
		attrs2._ownerElement = node2;
		for(var i=0;i<len;i++){
			node2.setAttributeNode(cloneNode(doc,attrs.item(i),true));
		}
		break;;
	case ATTRIBUTE_NODE:
		deep = true;
	}
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(cloneNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}

function __set__(object,key,value){
	object[key] = value
}
//do dynamic
try{
	if(Object.defineProperty){
		Object.defineProperty(LiveNodeList.prototype,'length',{
			get:function(){
				_updateLiveList(this);
				return this.$$length;
			}
		});
		Object.defineProperty(Node.prototype,'textContent',{
			get:function(){
				return getTextContent(this);
			},
			set:function(data){
				switch(this.nodeType){
				case 1:
				case 11:
					while(this.firstChild){
						this.removeChild(this.firstChild);
					}
					if(data || String(data)){
						this.appendChild(this.ownerDocument.createTextNode(data));
					}
					break;
				default:
					//TODO:
					this.data = data;
					this.value = value;
					this.nodeValue = data;
				}
			}
		})
		
		function getTextContent(node){
			switch(node.nodeType){
			case 1:
			case 11:
				var buf = [];
				node = node.firstChild;
				while(node){
					if(node.nodeType!==7 && node.nodeType !==8){
						buf.push(getTextContent(node));
					}
					node = node.nextSibling;
				}
				return buf.join('');
			default:
				return node.nodeValue;
			}
		}
		__set__ = function(object,key,value){
			//console.log(value)
			object['$$'+key] = value
		}
	}
}catch(e){//ie8
}

if(typeof _dereq_ == 'function'){
	exports.DOMImplementation = DOMImplementation;
	exports.XMLSerializer = XMLSerializer;
}

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/xmldom/dom.js","/core/xmldom")
},{"buffer":29,"pBGvAp":32}],25:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
//[4]   	NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
//[4a]   	NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
//[5]   	Name	   ::=   	NameStartChar (NameChar)*
var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]///\u10000-\uEFFFF
var nameChar = new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\u00B7\u0300-\u036F\\u203F-\u2040]");
var tagNamePattern = new RegExp('^'+nameStartChar.source+nameChar.source+'*(?:\:'+nameStartChar.source+nameChar.source+'*)?$');
//var tagNamePattern = /^[a-zA-Z_][\w\-\.]*(?:\:[a-zA-Z_][\w\-\.]*)?$/
//var handlers = 'resolveEntity,getExternalSubset,characters,endDocument,endElement,endPrefixMapping,ignorableWhitespace,processingInstruction,setDocumentLocator,skippedEntity,startDocument,startElement,startPrefixMapping,notationDecl,unparsedEntityDecl,error,fatalError,warning,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,comment,endCDATA,endDTD,endEntity,startCDATA,startDTD,startEntity'.split(',')

//S_TAG,	S_ATTR,	S_EQ,	S_V
//S_ATTR_S,	S_E,	S_S,	S_C
var S_TAG = 0;//tag name offerring
var S_ATTR = 1;//attr name offerring 
var S_ATTR_S=2;//attr name end and space offer
var S_EQ = 3;//=space?
var S_V = 4;//attr value(no quot value only)
var S_E = 5;//attr value end and no space(quot end)
var S_S = 6;//(attr value end || tag end ) && (space offer)
var S_C = 7;//closed el<el />

function XMLReader(){
	
}

XMLReader.prototype = {
	parse:function(source,defaultNSMap,entityMap){
		var domBuilder = this.domBuilder;
		domBuilder.startDocument();
		_copy(defaultNSMap ,defaultNSMap = {})
		parse(source,defaultNSMap,entityMap,
				domBuilder,this.errorHandler);
		domBuilder.endDocument();
	}
}
function parse(source,defaultNSMapCopy,entityMap,domBuilder,errorHandler){
  function fixedFromCharCode(code) {
		// String.prototype.fromCharCode does not supports
		// > 2 bytes unicode chars directly
		if (code > 0xffff) {
			code -= 0x10000;
			var surrogate1 = 0xd800 + (code >> 10)
				, surrogate2 = 0xdc00 + (code & 0x3ff);

			return String.fromCharCode(surrogate1, surrogate2);
		} else {
			return String.fromCharCode(code);
		}
	}
	function entityReplacer(a){
		var k = a.slice(1,-1);
		if(k in entityMap){
			return entityMap[k]; 
		}else if(k.charAt(0) === '#'){
			return fixedFromCharCode(parseInt(k.substr(1).replace('x','0x')))
		}else{
			errorHandler.error('entity not found:'+a);
			return a;
		}
	}
	function appendText(end){//has some bugs
		if(end>start){
			var xt = source.substring(start,end).replace(/&#?\w+;/g,entityReplacer);
			locator&&position(start);
			domBuilder.characters(xt,0,end-start);
			start = end
		}
	}
	function position(p,m){
		while(p>=lineEnd && (m = linePattern.exec(source))){
			lineStart = m.index;
			lineEnd = lineStart + m[0].length;
			locator.lineNumber++;
			//console.log('line++:',locator,startPos,endPos)
		}
		locator.columnNumber = p-lineStart+1;
	}
	var lineStart = 0;
	var lineEnd = 0;
	var linePattern = /.+(?:\r\n?|\n)|.*$/g
	var locator = domBuilder.locator;
	
	var parseStack = [{currentNSMap:defaultNSMapCopy}]
	var closeMap = {};
	var start = 0;
	while(true){
		try{
			var tagStart = source.indexOf('<',start);
			if(tagStart<0){
				if(!source.substr(start).match(/^\s*$/)){
					var doc = domBuilder.document;
	    			var text = doc.createTextNode(source.substr(start));
	    			doc.appendChild(text);
	    			domBuilder.currentElement = text;
				}
				return;
			}
			if(tagStart>start){
				appendText(tagStart);
			}
			switch(source.charAt(tagStart+1)){
			case '/':
				var end = source.indexOf('>',tagStart+3);
				var tagName = source.substring(tagStart+2,end);
				var config = parseStack.pop();
				var localNSMap = config.localNSMap;
		        if(config.tagName != tagName){
		            errorHandler.fatalError("end tag name: "+tagName+' is not match the current start tagName:'+config.tagName );
		        }
				domBuilder.endElement(config.uri,config.localName,tagName);
				if(localNSMap){
					for(var prefix in localNSMap){
						domBuilder.endPrefixMapping(prefix) ;
					}
				}
				end++;
				break;
				// end elment
			case '?':// <?...?>
				locator&&position(tagStart);
				end = parseInstruction(source,tagStart,domBuilder);
				break;
			case '!':// <!doctype,<![CDATA,<!--
				locator&&position(tagStart);
				end = parseDCC(source,tagStart,domBuilder,errorHandler);
				break;
			default:
			
				locator&&position(tagStart);
				
				var el = new ElementAttributes();
				
				//elStartEnd
				var end = parseElementStartPart(source,tagStart,el,entityReplacer,errorHandler);
				var len = el.length;
				
				if(locator){
					if(len){
						//attribute position fixed
						for(var i = 0;i<len;i++){
							var a = el[i];
							position(a.offset);
							a.offset = copyLocator(locator,{});
						}
					}
					position(end);
				}
				if(!el.closed && fixSelfClosed(source,end,el.tagName,closeMap)){
					el.closed = true;
					if(!entityMap.nbsp){
						errorHandler.warning('unclosed xml attribute');
					}
				}
				appendElement(el,domBuilder,parseStack);
				
				
				if(el.uri === 'http://www.w3.org/1999/xhtml' && !el.closed){
					end = parseHtmlSpecialContent(source,end,el.tagName,entityReplacer,domBuilder)
				}else{
					end++;
				}
			}
		}catch(e){
			errorHandler.error('element parse error: '+e);
			end = -1;
		}
		if(end>start){
			start = end;
		}else{
			//TODO: 这里有可能sax回退，有位置错误风险
			appendText(Math.max(tagStart,start)+1);
		}
	}
}
function copyLocator(f,t){
	t.lineNumber = f.lineNumber;
	t.columnNumber = f.columnNumber;
	return t;
}

/**
 * @see #appendElement(source,elStartEnd,el,selfClosed,entityReplacer,domBuilder,parseStack);
 * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
 */
function parseElementStartPart(source,start,el,entityReplacer,errorHandler){
	var attrName;
	var value;
	var p = ++start;
	var s = S_TAG;//status
	while(true){
		var c = source.charAt(p);
		switch(c){
		case '=':
			if(s === S_ATTR){//attrName
				attrName = source.slice(start,p);
				s = S_EQ;
			}else if(s === S_ATTR_S){
				s = S_EQ;
			}else{
				//fatalError: equal must after attrName or space after attrName
				throw new Error('attribute equal must after attrName');
			}
			break;
		case '\'':
		case '"':
			if(s === S_EQ){//equal
				start = p+1;
				p = source.indexOf(c,start)
				if(p>0){
					value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					el.add(attrName,value,start-1);
					s = S_E;
				}else{
					//fatalError: no end quot match
					throw new Error('attribute value no end \''+c+'\' match');
				}
			}else if(s == S_V){
				value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
				//console.log(attrName,value,start,p)
				el.add(attrName,value,start);
				//console.dir(el)
				errorHandler.warning('attribute "'+attrName+'" missed start quot('+c+')!!');
				start = p+1;
				s = S_E
			}else{
				//fatalError: no equal before
				throw new Error('attribute value must after "="');
			}
			break;
		case '/':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_E:
			case S_S:
			case S_C:
				s = S_C;
				el.closed = true;
			case S_V:
			case S_ATTR:
			case S_ATTR_S:
				break;
			//case S_EQ:
			default:
				throw new Error("attribute invalid close char('/')")
			}
			break;
		case ''://end document
			//throw new Error('unexpected end of input')
			errorHandler.error('unexpected end of input');
		case '>':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_E:
			case S_S:
			case S_C:
				break;//normal
			case S_V://Compatible state
			case S_ATTR:
				value = source.slice(start,p);
				if(value.slice(-1) === '/'){
					el.closed  = true;
					value = value.slice(0,-1)
				}
			case S_ATTR_S:
				if(s === S_ATTR_S){
					value = attrName;
				}
				if(s == S_V){
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value.replace(/&#?\w+;/g,entityReplacer),start)
				}else{
					errorHandler.warning('attribute "'+value+'" missed value!! "'+value+'" instead!!')
					el.add(value,value,start)
				}
				break;
			case S_EQ:
				throw new Error('attribute value missed!!');
			}
//			console.log(tagName,tagNamePattern,tagNamePattern.test(tagName))
			return p;
		/*xml space '\x20' | #x9 | #xD | #xA; */
		case '\u0080':
			c = ' ';
		default:
			if(c<= ' '){//space
				switch(s){
				case S_TAG:
					el.setTagName(source.slice(start,p));//tagName
					s = S_S;
					break;
				case S_ATTR:
					attrName = source.slice(start,p)
					s = S_ATTR_S;
					break;
				case S_V:
					var value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value,start)
				case S_E:
					s = S_S;
					break;
				//case S_S:
				//case S_EQ:
				//case S_ATTR_S:
				//	void();break;
				//case S_C:
					//ignore warning
				}
			}else{//not space
//S_TAG,	S_ATTR,	S_EQ,	S_V
//S_ATTR_S,	S_E,	S_S,	S_C
				switch(s){
				//case S_TAG:void();break;
				//case S_ATTR:void();break;
				//case S_V:void();break;
				case S_ATTR_S:
					errorHandler.warning('attribute "'+attrName+'" missed value!! "'+attrName+'" instead!!')
					el.add(attrName,attrName,start);
					start = p;
					s = S_ATTR;
					break;
				case S_E:
					errorHandler.warning('attribute space is required"'+attrName+'"!!')
				case S_S:
					s = S_ATTR;
					start = p;
					break;
				case S_EQ:
					s = S_V;
					start = p;
					break;
				case S_C:
					throw new Error("elements closed character '/' and '>' must be connected to");
				}
			}
		}
		p++;
	}
}
/**
 * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
 */
function appendElement(el,domBuilder,parseStack){
	var tagName = el.tagName;
	var localNSMap = null;
	var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
	var i = el.length;
	while(i--){
		var a = el[i];
		var qName = a.qName;
		var value = a.value;
		var nsp = qName.indexOf(':');
		if(nsp>0){
			var prefix = a.prefix = qName.slice(0,nsp);
			var localName = qName.slice(nsp+1);
			var nsPrefix = prefix === 'xmlns' && localName
		}else{
			localName = qName;
			prefix = null
			nsPrefix = qName === 'xmlns' && ''
		}
		//can not set prefix,because prefix !== ''
		a.localName = localName ;
		//prefix == null for no ns prefix attribute 
		if(nsPrefix !== false){//hack!!
			if(localNSMap == null){
				localNSMap = {}
				//console.log(currentNSMap,0)
				_copy(currentNSMap,currentNSMap={})
				//console.log(currentNSMap,1)
			}
			currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
			a.uri = 'http://www.w3.org/2000/xmlns/'
			domBuilder.startPrefixMapping(nsPrefix, value) 
		}
	}
	var i = el.length;
	while(i--){
		a = el[i];
		var prefix = a.prefix;
		if(prefix){//no prefix attribute has no namespace
			if(prefix === 'xml'){
				a.uri = 'http://www.w3.org/XML/1998/namespace';
			}if(prefix !== 'xmlns'){
				a.uri = currentNSMap[prefix]
				
				//{console.log('###'+a.qName,domBuilder.locator.systemId+'',currentNSMap,a.uri)}
			}
		}
	}
	var nsp = tagName.indexOf(':');
	if(nsp>0){
		prefix = el.prefix = tagName.slice(0,nsp);
		localName = el.localName = tagName.slice(nsp+1);
	}else{
		prefix = null;//important!!
		localName = el.localName = tagName;
	}
	//no prefix element has default namespace
	var ns = el.uri = currentNSMap[prefix || ''];
	domBuilder.startElement(ns,localName,tagName,el);
	//endPrefixMapping and startPrefixMapping have not any help for dom builder
	//localNSMap = null
	if(el.closed){
		domBuilder.endElement(ns,localName,tagName);
		if(localNSMap){
			for(prefix in localNSMap){
				domBuilder.endPrefixMapping(prefix) 
			}
		}
	}else{
		el.currentNSMap = currentNSMap;
		el.localNSMap = localNSMap;
		parseStack.push(el);
	}
}
function parseHtmlSpecialContent(source,elStartEnd,tagName,entityReplacer,domBuilder){
	if(/^(?:script|textarea)$/i.test(tagName)){
		var elEndStart =  source.indexOf('</'+tagName+'>',elStartEnd);
		var text = source.substring(elStartEnd+1,elEndStart);
		if(/[&<]/.test(text)){
			if(/^script$/i.test(tagName)){
				//if(!/\]\]>/.test(text)){
					//lexHandler.startCDATA();
					domBuilder.characters(text,0,text.length);
					//lexHandler.endCDATA();
					return elEndStart;
				//}
			}//}else{//text area
				text = text.replace(/&#?\w+;/g,entityReplacer);
				domBuilder.characters(text,0,text.length);
				return elEndStart;
			//}
			
		}
	}
	return elStartEnd+1;
}
function fixSelfClosed(source,elStartEnd,tagName,closeMap){
	//if(tagName in closeMap){
	var pos = closeMap[tagName];
	if(pos == null){
		//console.log(tagName)
		pos = closeMap[tagName] = source.lastIndexOf('</'+tagName+'>')
	}
	return pos<elStartEnd;
	//} 
}
function _copy(source,target){
	for(var n in source){target[n] = source[n]}
}
function parseDCC(source,start,domBuilder,errorHandler){//sure start with '<!'
	var next= source.charAt(start+2)
	switch(next){
	case '-':
		if(source.charAt(start + 3) === '-'){
			var end = source.indexOf('-->',start+4);
			//append comment source.substring(4,end)//<!--
			if(end>start){
				domBuilder.comment(source,start+4,end-start-4);
				return end+3;
			}else{
				errorHandler.error("Unclosed comment");
				return -1;
			}
		}else{
			//error
			return -1;
		}
	default:
		if(source.substr(start+3,6) == 'CDATA['){
			var end = source.indexOf(']]>',start+9);
			domBuilder.startCDATA();
			domBuilder.characters(source,start+9,end-start-9);
			domBuilder.endCDATA() 
			return end+3;
		}
		//<!DOCTYPE
		//startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId) 
		var matchs = split(source,start);
		var len = matchs.length;
		if(len>1 && /!doctype/i.test(matchs[0][0])){
			var name = matchs[1][0];
			var pubid = len>3 && /^public$/i.test(matchs[2][0]) && matchs[3][0]
			var sysid = len>4 && matchs[4][0];
			var lastMatch = matchs[len-1]
			domBuilder.startDTD(name,pubid && pubid.replace(/^(['"])(.*?)\1$/,'$2'),
					sysid && sysid.replace(/^(['"])(.*?)\1$/,'$2'));
			domBuilder.endDTD();
			
			return lastMatch.index+lastMatch[0].length
		}
	}
	return -1;
}



function parseInstruction(source,start,domBuilder){
	var end = source.indexOf('?>',start);
	if(end){
		var match = source.substring(start,end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
		if(match){
			var len = match[0].length;
			domBuilder.processingInstruction(match[1], match[2]) ;
			return end+2;
		}else{//error
			return -1;
		}
	}
	return -1;
}

/**
 * @param source
 */
function ElementAttributes(source){
	
}
ElementAttributes.prototype = {
	setTagName:function(tagName){
		if(!tagNamePattern.test(tagName)){
			throw new Error('invalid tagName:'+tagName)
		}
		this.tagName = tagName
	},
	add:function(qName,value,offset){
		if(!tagNamePattern.test(qName)){
			throw new Error('invalid attribute:'+qName)
		}
		this[this.length++] = {qName:qName,value:value,offset:offset}
	},
	length:0,
	getLocalName:function(i){return this[i].localName},
	getOffset:function(i){return this[i].offset},
	getQName:function(i){return this[i].qName},
	getURI:function(i){return this[i].uri},
	getValue:function(i){return this[i].value}
//	,getIndex:function(uri, localName)){
//		if(localName){
//			
//		}else{
//			var qName = uri
//		}
//	},
//	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
//	getType:function(uri,localName){}
//	getType:function(i){},
}




function _set_proto_(thiz,parent){
	thiz.__proto__ = parent;
	return thiz;
}
if(!(_set_proto_({},_set_proto_.prototype) instanceof _set_proto_)){
	_set_proto_ = function(thiz,parent){
		function p(){};
		p.prototype = parent;
		p = new p();
		for(parent in thiz){
			p[parent] = thiz[parent];
		}
		return p;
	}
}

function split(source,start){
	var match;
	var buf = [];
	var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
	reg.lastIndex = start;
	reg.exec(source);//skip <
	while(match = reg.exec(source)){
		buf.push(match);
		if(match[1])return buf;
	}
}

if(typeof _dereq_ == 'function'){
	exports.XMLReader = XMLReader;
}


}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/core/xmldom/sax.js","/core/xmldom")
},{"buffer":29,"pBGvAp":32}],26:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Created by Spadon on 02/10/2014.
 */

var fs = _dereq_('fs');

    JswParser = _dereq_('./core/JswParser'),
    JswReasoner = _dereq_('./core/Reasoner'),
    JswSPARQL = _dereq_('./core/JswSPARQL'),
    ReasoningEngine = _dereq_('./core/ReasoningEngine'),
    OWL2RL = _dereq_('./core/OWL2RL'),

        ClassificationData = null;

module.exports = {
    /**
     * Classifies an ontology
     * @param filepath The full path of the owl file
     */
    classify: function(filepath) {
        var rdfXml, ontology, reasoner, RMethod = ReasoningEngine.incremental;

        rdfXml = fs.readFileSync(filepath).toString().replace(/(&)([a-z0-9]+)(;)/gi, '$2:');
    
        ontology = JswParser.parse(rdfXml, function(err) {
            if(err) {
                throw err;
            }
        });

        reasoner = new JswReasoner.create(ontology, RMethod);

        if (!reasoner) {
            throw 'Error while classifying';
        } else {
            ClassificationData = {
                reasoner: reasoner,
                ontology: ontology
            };

            return ClassificationData;
        }
    },

    /**
     * Answers a SPARQL query against the reasoner instance
     * @param query The query text
     */
    query: function(query) {
        var sparql = JswSPARQL.sparql,
                results, RMethod = ReasoningEngine.incremental,
                parsedQuery = sparql.parse(query);

        if(!ClassificationData) {
            throw 'Reasoner not initialized!';
        } else {
            results = ClassificationData.reasoner.aBox.answerQuery(parsedQuery, ClassificationData.reasoner.resultOntology, OWL2RL.rules, RMethod);
            return {
                data : results                
            };
        }
    }    
};

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_f7172690.js","/")
},{"./core/JswParser":4,"./core/JswSPARQL":8,"./core/OWL2RL":18,"./core/Reasoner":19,"./core/ReasoningEngine":20,"buffer":29,"fs":28,"pBGvAp":32}],27:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/base64-js/lib/b64.js","/../node_modules/base64-js/lib")
},{"buffer":29,"pBGvAp":32}],28:[function(_dereq_,module,exports){

},{"buffer":29,"pBGvAp":32}],29:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = _dereq_('base64-js')
var ieee754 = _dereq_('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/buffer/index.js","/../node_modules/buffer")
},{"base64-js":27,"buffer":29,"ieee754":30,"pBGvAp":32}],30:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/ieee754/index.js","/../node_modules/ieee754")
},{"buffer":29,"pBGvAp":32}],31:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * @license
 * Lo-Dash 2.4.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern -o ./dist/lodash.js`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
;(function() {

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /** Used to pool arrays and objects used internally */
  var arrayPool = [],
      objectPool = [];

  /** Used to generate unique IDs */
  var idCounter = 0;

  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
  var keyPrefix = +new Date + '';

  /** Used as the size when optimizations are enabled for large arrays */
  var largeArraySize = 75;

  /** Used as the max size of the `arrayPool` and `objectPool` */
  var maxPoolSize = 40;

  /** Used to detect and test whitespace */
  var whitespace = (
    // whitespace
    ' \t\x0B\f\xA0\ufeff' +

    // line terminators
    '\n\r\u2028\u2029' +

    // unicode category "Zs" space separators
    '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'
  );

  /** Used to match empty string literals in compiled template source */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /**
   * Used to match ES6 template delimiters
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-literals-string-literals
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match regexp flags from their coerced string values */
  var reFlags = /\w*$/;

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to match "interpolate" template delimiters */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to match leading whitespace and zeros to be removed */
  var reLeadingSpacesAndZeros = RegExp('^[' + whitespace + ']*0+(?=.$)');

  /** Used to ensure capturing order of template delimiters */
  var reNoMatch = /($^)/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Used to match unescaped characters in compiled string literals */
  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

  /** Used to assign default `context` object properties */
  var contextProps = [
    'Array', 'Boolean', 'Date', 'Function', 'Math', 'Number', 'Object',
    'RegExp', 'String', '_', 'attachEvent', 'clearTimeout', 'isFinite', 'isNaN',
    'parseInt', 'setTimeout'
  ];

  /** Used to make template sourceURLs easier to identify */
  var templateCounter = 0;

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      funcClass = '[object Function]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used to identify object classifications that `_.clone` supports */
  var cloneableClasses = {};
  cloneableClasses[funcClass] = false;
  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
  cloneableClasses[boolClass] = cloneableClasses[dateClass] =
  cloneableClasses[numberClass] = cloneableClasses[objectClass] =
  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;

  /** Used as an internal `_.debounce` options object */
  var debounceOptions = {
    'leading': false,
    'maxWait': 0,
    'trailing': false
  };

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    'configurable': false,
    'enumerable': false,
    'value': null,
    'writable': false
  };

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  /** Used to escape characters for inclusion in compiled string literals */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /** Used as a reference to the global object */
  var root = (objectTypes[typeof window] && window) || this;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports` */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = objectTypes[typeof global] && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The base implementation of `_.indexOf` without support for binary searches
   * or `fromIndex` constraints.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the matched value or `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * An implementation of `_.contains` for cache objects that mimics the return
   * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.
   *
   * @private
   * @param {Object} cache The cache object to inspect.
   * @param {*} value The value to search for.
   * @returns {number} Returns `0` if `value` is found, else `-1`.
   */
  function cacheIndexOf(cache, value) {
    var type = typeof value;
    cache = cache.cache;

    if (type == 'boolean' || value == null) {
      return cache[value] ? 0 : -1;
    }
    if (type != 'number' && type != 'string') {
      type = 'object';
    }
    var key = type == 'number' ? value : keyPrefix + value;
    cache = (cache = cache[type]) && cache[key];

    return type == 'object'
      ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)
      : (cache ? 0 : -1);
  }

  /**
   * Adds a given value to the corresponding cache object.
   *
   * @private
   * @param {*} value The value to add to the cache.
   */
  function cachePush(value) {
    var cache = this.cache,
        type = typeof value;

    if (type == 'boolean' || value == null) {
      cache[value] = true;
    } else {
      if (type != 'number' && type != 'string') {
        type = 'object';
      }
      var key = type == 'number' ? value : keyPrefix + value,
          typeCache = cache[type] || (cache[type] = {});

      if (type == 'object') {
        (typeCache[key] || (typeCache[key] = [])).push(value);
      } else {
        typeCache[key] = true;
      }
    }
  }

  /**
   * Used by `_.max` and `_.min` as the default callback when a given
   * collection is a string value.
   *
   * @private
   * @param {string} value The character to inspect.
   * @returns {number} Returns the code unit of given character.
   */
  function charAtCallback(value) {
    return value.charCodeAt(0);
  }

  /**
   * Used by `sortBy` to compare transformed `collection` elements, stable sorting
   * them in ascending order.
   *
   * @private
   * @param {Object} a The object to compare to `b`.
   * @param {Object} b The object to compare to `a`.
   * @returns {number} Returns the sort order indicator of `1` or `-1`.
   */
  function compareAscending(a, b) {
    var ac = a.criteria,
        bc = b.criteria,
        index = -1,
        length = ac.length;

    while (++index < length) {
      var value = ac[index],
          other = bc[index];

      if (value !== other) {
        if (value > other || typeof value == 'undefined') {
          return 1;
        }
        if (value < other || typeof other == 'undefined') {
          return -1;
        }
      }
    }
    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
    // that causes it, under certain circumstances, to return the same value for
    // `a` and `b`. See https://github.com/jashkenas/underscore/pull/1247
    //
    // This also ensures a stable sort in V8 and other engines.
    // See http://code.google.com/p/v8/issues/detail?id=90
    return a.index - b.index;
  }

  /**
   * Creates a cache object to optimize linear searches of large arrays.
   *
   * @private
   * @param {Array} [array=[]] The array to search.
   * @returns {null|Object} Returns the cache object or `null` if caching should not be used.
   */
  function createCache(array) {
    var index = -1,
        length = array.length,
        first = array[0],
        mid = array[(length / 2) | 0],
        last = array[length - 1];

    if (first && typeof first == 'object' &&
        mid && typeof mid == 'object' && last && typeof last == 'object') {
      return false;
    }
    var cache = getObject();
    cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

    var result = getObject();
    result.array = array;
    result.cache = cache;
    result.push = cachePush;

    while (++index < length) {
      result.push(array[index]);
    }
    return result;
  }

  /**
   * Used by `template` to escape characters for inclusion in compiled
   * string literals.
   *
   * @private
   * @param {string} match The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeStringChar(match) {
    return '\\' + stringEscapes[match];
  }

  /**
   * Gets an array from the array pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Array} The array from the pool.
   */
  function getArray() {
    return arrayPool.pop() || [];
  }

  /**
   * Gets an object from the object pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Object} The object from the pool.
   */
  function getObject() {
    return objectPool.pop() || {
      'array': null,
      'cache': null,
      'criteria': null,
      'false': false,
      'index': 0,
      'null': false,
      'number': null,
      'object': null,
      'push': null,
      'string': null,
      'true': false,
      'undefined': false,
      'value': null
    };
  }

  /**
   * Releases the given array back to the array pool.
   *
   * @private
   * @param {Array} [array] The array to release.
   */
  function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
      arrayPool.push(array);
    }
  }

  /**
   * Releases the given object back to the object pool.
   *
   * @private
   * @param {Object} [object] The object to release.
   */
  function releaseObject(object) {
    var cache = object.cache;
    if (cache) {
      releaseObject(cache);
    }
    object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
    if (objectPool.length < maxPoolSize) {
      objectPool.push(object);
    }
  }

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used instead of `Array#slice` to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|string} collection The collection to slice.
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Create a new `lodash` function using the given context object.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Object} [context=root] The context object.
   * @returns {Function} Returns the `lodash` function.
   */
  function runInContext(context) {
    // Avoid issues with some ES3 environments that attempt to use values, named
    // after built-in constructors like `Object`, for the creation of literals.
    // ES5 clears this up by stating that literals must use built-in constructors.
    // See http://es5.github.io/#x11.1.5.
    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root; 
 if (typeof context.Object !== "function") context = this;

    /** Native constructor references */
    var Array = context.Array,
        Boolean = context.Boolean,
        Date = context.Date,
        Function = context.Function,
        Math = context.Math,
        Number = context.Number,
        Object = context.Object,
        RegExp = context.RegExp,
        String = context.String,
        TypeError = context.TypeError;

    /**
     * Used for `Array` method references.
     *
     * Normally `Array.prototype` would suffice, however, using an array literal
     * avoids issues in Narwhal.
     */
    var arrayRef = [];

    /** Used for native method references */
    var objectProto = Object.prototype;

    /** Used to restore the original `_` reference in `noConflict` */
    var oldDash = context._;

    /** Used to resolve the internal [[Class]] of values */
    var toString = objectProto.toString;

    /** Used to detect if a method is native */
    var reNative = RegExp('^' +
      String(toString)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/toString| for [^\]]+/g, '.*?') + '$'
    );

    /** Native method shortcuts */
    var ceil = Math.ceil,
        clearTimeout = context.clearTimeout,
        floor = Math.floor,
        fnToString = Function.prototype.toString,
        getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
        hasOwnProperty = objectProto.hasOwnProperty,
        push = arrayRef.push,
        setTimeout = context.setTimeout,
        splice = arrayRef.splice,
        unshift = arrayRef.unshift;

    /** Used to set meta data on functions */
    var defineProperty = (function() {
      // IE 8 only accepts DOM elements
      try {
        var o = {},
            func = isNative(func = Object.defineProperty) && func,
            result = func(o, o, o) && func;
      } catch(e) { }
      return result;
    }());

    /* Native method shortcuts for methods with the same name as other `lodash` methods */
    var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,
        nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
        nativeIsFinite = context.isFinite,
        nativeIsNaN = context.isNaN,
        nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,
        nativeMax = Math.max,
        nativeMin = Math.min,
        nativeParseInt = context.parseInt,
        nativeRandom = Math.random;

    /** Used to lookup a built-in constructor by [[Class]] */
    var ctorByClass = {};
    ctorByClass[arrayClass] = Array;
    ctorByClass[boolClass] = Boolean;
    ctorByClass[dateClass] = Date;
    ctorByClass[funcClass] = Function;
    ctorByClass[objectClass] = Object;
    ctorByClass[numberClass] = Number;
    ctorByClass[regexpClass] = RegExp;
    ctorByClass[stringClass] = String;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object which wraps the given value to enable intuitive
     * method chaining.
     *
     * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
     * and `unshift`
     *
     * Chaining is supported in custom builds as long as the `value` method is
     * implicitly or explicitly included in the build.
     *
     * The chainable wrapper functions are:
     * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
     * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,
     * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,
     * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
     * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
     * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
     * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,
     * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,
     * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,
     * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,
     * and `zip`
     *
     * The non-chainable wrapper functions are:
     * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,
     * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,
     * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
     * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,
     * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,
     * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,
     * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,
     * `template`, `unescape`, `uniqueId`, and `value`
     *
     * The wrapper functions `first` and `last` return wrapped values when `n` is
     * provided, otherwise they return unwrapped values.
     *
     * Explicit chaining can be enabled by using the `_.chain` method.
     *
     * @name _
     * @constructor
     * @category Chaining
     * @param {*} value The value to wrap in a `lodash` instance.
     * @returns {Object} Returns a `lodash` instance.
     * @example
     *
     * var wrapped = _([1, 2, 3]);
     *
     * // returns an unwrapped value
     * wrapped.reduce(function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * // returns a wrapped value
     * var squares = wrapped.map(function(num) {
     *   return num * num;
     * });
     *
     * _.isArray(squares);
     * // => false
     *
     * _.isArray(squares.value());
     * // => true
     */
    function lodash(value) {
      // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor
      return (value && typeof value == 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__'))
       ? value
       : new lodashWrapper(value);
    }

    /**
     * A fast path for creating `lodash` wrapper objects.
     *
     * @private
     * @param {*} value The value to wrap in a `lodash` instance.
     * @param {boolean} chainAll A flag to enable chaining for all methods
     * @returns {Object} Returns a `lodash` instance.
     */
    function lodashWrapper(value, chainAll) {
      this.__chain__ = !!chainAll;
      this.__wrapped__ = value;
    }
    // ensure `new lodashWrapper` is an instance of `lodash`
    lodashWrapper.prototype = lodash.prototype;

    /**
     * An object used to flag environments features.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    var support = lodash.support = {};

    /**
     * Detect if functions can be decompiled by `Function#toString`
     * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext);

    /**
     * Detect if `Function#name` is supported (all but IE).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcNames = typeof Function.name == 'string';

    /**
     * By default, the template delimiters used by Lo-Dash are similar to those in
     * embedded Ruby (ERB). Change the following template settings to use alternative
     * delimiters.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    lodash.templateSettings = {

      /**
       * Used to detect `data` property values to be HTML-escaped.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'escape': /<%-([\s\S]+?)%>/g,

      /**
       * Used to detect code to be evaluated.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'evaluate': /<%([\s\S]+?)%>/g,

      /**
       * Used to detect `data` property values to inject.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'interpolate': reInterpolate,

      /**
       * Used to reference the data object in the template text.
       *
       * @memberOf _.templateSettings
       * @type string
       */
      'variable': '',

      /**
       * Used to import variables into the compiled template.
       *
       * @memberOf _.templateSettings
       * @type Object
       */
      'imports': {

        /**
         * A reference to the `lodash` function.
         *
         * @memberOf _.templateSettings.imports
         * @type Function
         */
        '_': lodash
      }
    };

    /*--------------------------------------------------------------------------*/

    /**
     * The base implementation of `_.bind` that creates the bound function and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new bound function.
     */
    function baseBind(bindData) {
      var func = bindData[0],
          partialArgs = bindData[2],
          thisArg = bindData[4];

      function bound() {
        // `Function#bind` spec
        // http://es5.github.io/#x15.3.4.5
        if (partialArgs) {
          // avoid `arguments` object deoptimizations by using `slice` instead
          // of `Array.prototype.slice.call` and not assigning `arguments` to a
          // variable as a ternary expression
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        // mimic the constructor's `return` behavior
        // http://es5.github.io/#x13.2.2
        if (this instanceof bound) {
          // ensure `new bound` is an instance of `func`
          var thisBinding = baseCreate(func.prototype),
              result = func.apply(thisBinding, args || arguments);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisArg, args || arguments);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.clone` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates clones with source counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, isDeep, callback, stackA, stackB) {
      if (callback) {
        var result = callback(value);
        if (typeof result != 'undefined') {
          return result;
        }
      }
      // inspect [[Class]]
      var isObj = isObject(value);
      if (isObj) {
        var className = toString.call(value);
        if (!cloneableClasses[className]) {
          return value;
        }
        var ctor = ctorByClass[className];
        switch (className) {
          case boolClass:
          case dateClass:
            return new ctor(+value);

          case numberClass:
          case stringClass:
            return new ctor(value);

          case regexpClass:
            result = ctor(value.source, reFlags.exec(value));
            result.lastIndex = value.lastIndex;
            return result;
        }
      } else {
        return value;
      }
      var isArr = isArray(value);
      if (isDeep) {
        // check for circular references and return corresponding clone
        var initedStack = !stackA;
        stackA || (stackA = getArray());
        stackB || (stackB = getArray());

        var length = stackA.length;
        while (length--) {
          if (stackA[length] == value) {
            return stackB[length];
          }
        }
        result = isArr ? ctor(value.length) : {};
      }
      else {
        result = isArr ? slice(value) : assign({}, value);
      }
      // add array properties assigned by `RegExp#exec`
      if (isArr) {
        if (hasOwnProperty.call(value, 'index')) {
          result.index = value.index;
        }
        if (hasOwnProperty.call(value, 'input')) {
          result.input = value.input;
        }
      }
      // exit for shallow clone
      if (!isDeep) {
        return result;
      }
      // add the source value to the stack of traversed objects
      // and associate it with its clone
      stackA.push(value);
      stackB.push(result);

      // recursively populate clone (susceptible to call stack limits)
      (isArr ? forEach : forOwn)(value, function(objValue, key) {
        result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);
      });

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} prototype The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    function baseCreate(prototype, properties) {
      return isObject(prototype) ? nativeCreate(prototype) : {};
    }
    // fallback for browsers without `Object.create`
    if (!nativeCreate) {
      baseCreate = (function() {
        function Object() {}
        return function(prototype) {
          if (isObject(prototype)) {
            Object.prototype = prototype;
            var result = new Object;
            Object.prototype = null;
          }
          return result || context.Object();
        };
      }());
    }

    /**
     * The base implementation of `_.createCallback` without support for creating
     * "_.pluck" or "_.where" style callbacks.
     *
     * @private
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     */
    function baseCreateCallback(func, thisArg, argCount) {
      if (typeof func != 'function') {
        return identity;
      }
      // exit early for no `thisArg` or already bound by `Function#bind`
      if (typeof thisArg == 'undefined' || !('prototype' in func)) {
        return func;
      }
      var bindData = func.__bindData__;
      if (typeof bindData == 'undefined') {
        if (support.funcNames) {
          bindData = !func.name;
        }
        bindData = bindData || !support.funcDecomp;
        if (!bindData) {
          var source = fnToString.call(func);
          if (!support.funcNames) {
            bindData = !reFuncName.test(source);
          }
          if (!bindData) {
            // checks if `func` references the `this` keyword and stores the result
            bindData = reThis.test(source);
            setBindData(func, bindData);
          }
        }
      }
      // exit early if there are no `this` references or `func` is bound
      if (bindData === false || (bindData !== true && bindData[1] & 1)) {
        return func;
      }
      switch (argCount) {
        case 1: return function(value) {
          return func.call(thisArg, value);
        };
        case 2: return function(a, b) {
          return func.call(thisArg, a, b);
        };
        case 3: return function(value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
        case 4: return function(accumulator, value, index, collection) {
          return func.call(thisArg, accumulator, value, index, collection);
        };
      }
      return bind(func, thisArg);
    }

    /**
     * The base implementation of `createWrapper` that creates the wrapper and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new function.
     */
    function baseCreateWrapper(bindData) {
      var func = bindData[0],
          bitmask = bindData[1],
          partialArgs = bindData[2],
          partialRightArgs = bindData[3],
          thisArg = bindData[4],
          arity = bindData[5];

      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          key = func;

      function bound() {
        var thisBinding = isBind ? thisArg : this;
        if (partialArgs) {
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        if (partialRightArgs || isCurry) {
          args || (args = slice(arguments));
          if (partialRightArgs) {
            push.apply(args, partialRightArgs);
          }
          if (isCurry && args.length < arity) {
            bitmask |= 16 & ~32;
            return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
          }
        }
        args || (args = arguments);
        if (isBindKey) {
          func = thisBinding[key];
        }
        if (this instanceof bound) {
          thisBinding = baseCreate(func.prototype);
          var result = func.apply(thisBinding, args);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisBinding, args);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.difference` that accepts a single array
     * of values to exclude.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {Array} [values] The array of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     */
    function baseDifference(array, values) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          isLarge = length >= largeArraySize && indexOf === baseIndexOf,
          result = [];

      if (isLarge) {
        var cache = createCache(values);
        if (cache) {
          indexOf = cacheIndexOf;
          values = cache;
        } else {
          isLarge = false;
        }
      }
      while (++index < length) {
        var value = array[index];
        if (indexOf(values, value) < 0) {
          result.push(value);
        }
      }
      if (isLarge) {
        releaseObject(values);
      }
      return result;
    }

    /**
     * The base implementation of `_.flatten` without support for callback
     * shorthands or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
     * @param {number} [fromIndex=0] The index to start from.
     * @returns {Array} Returns a new flattened array.
     */
    function baseFlatten(array, isShallow, isStrict, fromIndex) {
      var index = (fromIndex || 0) - 1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];

        if (value && typeof value == 'object' && typeof value.length == 'number'
            && (isArray(value) || isArguments(value))) {
          // recursively flatten arrays (susceptible to call stack limits)
          if (!isShallow) {
            value = baseFlatten(value, isShallow, isStrict);
          }
          var valIndex = -1,
              valLength = value.length,
              resIndex = result.length;

          result.length += valLength;
          while (++valIndex < valLength) {
            result[resIndex++] = value[valIndex];
          }
        } else if (!isStrict) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.isEqual`, without support for `thisArg` binding,
     * that allows partial "_.where" style comparisons.
     *
     * @private
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
     * @param {Array} [stackA=[]] Tracks traversed `a` objects.
     * @param {Array} [stackB=[]] Tracks traversed `b` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
      // used to indicate that when comparing objects, `a` has at least the properties of `b`
      if (callback) {
        var result = callback(a, b);
        if (typeof result != 'undefined') {
          return !!result;
        }
      }
      // exit early for identical values
      if (a === b) {
        // treat `+0` vs. `-0` as not equal
        return a !== 0 || (1 / a == 1 / b);
      }
      var type = typeof a,
          otherType = typeof b;

      // exit early for unlike primitive values
      if (a === a &&
          !(a && objectTypes[type]) &&
          !(b && objectTypes[otherType])) {
        return false;
      }
      // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
      // http://es5.github.io/#x15.3.4.4
      if (a == null || b == null) {
        return a === b;
      }
      // compare [[Class]] names
      var className = toString.call(a),
          otherClass = toString.call(b);

      if (className == argsClass) {
        className = objectClass;
      }
      if (otherClass == argsClass) {
        otherClass = objectClass;
      }
      if (className != otherClass) {
        return false;
      }
      switch (className) {
        case boolClass:
        case dateClass:
          // coerce dates and booleans to numbers, dates to milliseconds and booleans
          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
          return +a == +b;

        case numberClass:
          // treat `NaN` vs. `NaN` as equal
          return (a != +a)
            ? b != +b
            // but treat `+0` vs. `-0` as not equal
            : (a == 0 ? (1 / a == 1 / b) : a == +b);

        case regexpClass:
        case stringClass:
          // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
          // treat string primitives and their corresponding object instances as equal
          return a == String(b);
      }
      var isArr = className == arrayClass;
      if (!isArr) {
        // unwrap any `lodash` wrapped values
        var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
            bWrapped = hasOwnProperty.call(b, '__wrapped__');

        if (aWrapped || bWrapped) {
          return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
        }
        // exit for functions and DOM nodes
        if (className != objectClass) {
          return false;
        }
        // in older versions of Opera, `arguments` objects have `Array` constructors
        var ctorA = a.constructor,
            ctorB = b.constructor;

        // non `Object` object instances with different constructors are not equal
        if (ctorA != ctorB &&
              !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
              ('constructor' in a && 'constructor' in b)
            ) {
          return false;
        }
      }
      // assume cyclic structures are equal
      // the algorithm for detecting cyclic structures is adapted from ES 5.1
      // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
      var initedStack = !stackA;
      stackA || (stackA = getArray());
      stackB || (stackB = getArray());

      var length = stackA.length;
      while (length--) {
        if (stackA[length] == a) {
          return stackB[length] == b;
        }
      }
      var size = 0;
      result = true;

      // add `a` and `b` to the stack of traversed objects
      stackA.push(a);
      stackB.push(b);

      // recursively compare objects and arrays (susceptible to call stack limits)
      if (isArr) {
        // compare lengths to determine if a deep comparison is necessary
        length = a.length;
        size = b.length;
        result = size == length;

        if (result || isWhere) {
          // deep compare the contents, ignoring non-numeric properties
          while (size--) {
            var index = length,
                value = b[size];

            if (isWhere) {
              while (index--) {
                if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
                  break;
                }
              }
            } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
              break;
            }
          }
        }
      }
      else {
        // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
        // which, in this case, is more costly
        forIn(b, function(value, key, b) {
          if (hasOwnProperty.call(b, key)) {
            // count the number of properties.
            size++;
            // deep compare each property value.
            return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
          }
        });

        if (result && !isWhere) {
          // ensure both objects have the same number of properties
          forIn(a, function(value, key, a) {
            if (hasOwnProperty.call(a, key)) {
              // `size` will be `-1` if `a` has more properties than `b`
              return (result = --size > -1);
            }
          });
        }
      }
      stackA.pop();
      stackB.pop();

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.merge` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates values with source counterparts.
     */
    function baseMerge(object, source, callback, stackA, stackB) {
      (isArray(source) ? forEach : forOwn)(source, function(source, key) {
        var found,
            isArr,
            result = source,
            value = object[key];

        if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
          // avoid merging previously merged cyclic sources
          var stackLength = stackA.length;
          while (stackLength--) {
            if ((found = stackA[stackLength] == source)) {
              value = stackB[stackLength];
              break;
            }
          }
          if (!found) {
            var isShallow;
            if (callback) {
              result = callback(value, source);
              if ((isShallow = typeof result != 'undefined')) {
                value = result;
              }
            }
            if (!isShallow) {
              value = isArr
                ? (isArray(value) ? value : [])
                : (isPlainObject(value) ? value : {});
            }
            // add `source` and associated `value` to the stack of traversed objects
            stackA.push(source);
            stackB.push(value);

            // recursively merge objects and arrays (susceptible to call stack limits)
            if (!isShallow) {
              baseMerge(value, source, callback, stackA, stackB);
            }
          }
        }
        else {
          if (callback) {
            result = callback(value, source);
            if (typeof result == 'undefined') {
              result = source;
            }
          }
          if (typeof result != 'undefined') {
            value = result;
          }
        }
        object[key] = value;
      });
    }

    /**
     * The base implementation of `_.random` without argument juggling or support
     * for returning floating-point numbers.
     *
     * @private
     * @param {number} min The minimum possible value.
     * @param {number} max The maximum possible value.
     * @returns {number} Returns a random number.
     */
    function baseRandom(min, max) {
      return min + floor(nativeRandom() * (max - min + 1));
    }

    /**
     * The base implementation of `_.uniq` without support for callback shorthands
     * or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function} [callback] The function called per iteration.
     * @returns {Array} Returns a duplicate-value-free array.
     */
    function baseUniq(array, isSorted, callback) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          result = [];

      var isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf,
          seen = (callback || isLarge) ? getArray() : result;

      if (isLarge) {
        var cache = createCache(seen);
        indexOf = cacheIndexOf;
        seen = cache;
      }
      while (++index < length) {
        var value = array[index],
            computed = callback ? callback(value, index, array) : value;

        if (isSorted
              ? !index || seen[seen.length - 1] !== computed
              : indexOf(seen, computed) < 0
            ) {
          if (callback || isLarge) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      if (isLarge) {
        releaseArray(seen.array);
        releaseObject(seen);
      } else if (callback) {
        releaseArray(seen);
      }
      return result;
    }

    /**
     * Creates a function that aggregates a collection, creating an object composed
     * of keys generated from the results of running each element of the collection
     * through a callback. The given `setter` function sets the keys and values
     * of the composed object.
     *
     * @private
     * @param {Function} setter The setter function.
     * @returns {Function} Returns the new aggregator function.
     */
    function createAggregator(setter) {
      return function(collection, callback, thisArg) {
        var result = {};
        callback = lodash.createCallback(callback, thisArg, 3);

        var index = -1,
            length = collection ? collection.length : 0;

        if (typeof length == 'number') {
          while (++index < length) {
            var value = collection[index];
            setter(result, value, callback(value, index, collection), collection);
          }
        } else {
          forOwn(collection, function(value, key, collection) {
            setter(result, value, callback(value, key, collection), collection);
          });
        }
        return result;
      };
    }

    /**
     * Creates a function that, when called, either curries or invokes `func`
     * with an optional `this` binding and partially applied arguments.
     *
     * @private
     * @param {Function|string} func The function or method name to reference.
     * @param {number} bitmask The bitmask of method flags to compose.
     *  The bitmask may be composed of the following flags:
     *  1 - `_.bind`
     *  2 - `_.bindKey`
     *  4 - `_.curry`
     *  8 - `_.curry` (bound)
     *  16 - `_.partial`
     *  32 - `_.partialRight`
     * @param {Array} [partialArgs] An array of arguments to prepend to those
     *  provided to the new function.
     * @param {Array} [partialRightArgs] An array of arguments to append to those
     *  provided to the new function.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new function.
     */
    function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          isPartial = bitmask & 16,
          isPartialRight = bitmask & 32;

      if (!isBindKey && !isFunction(func)) {
        throw new TypeError;
      }
      if (isPartial && !partialArgs.length) {
        bitmask &= ~16;
        isPartial = partialArgs = false;
      }
      if (isPartialRight && !partialRightArgs.length) {
        bitmask &= ~32;
        isPartialRight = partialRightArgs = false;
      }
      var bindData = func && func.__bindData__;
      if (bindData && bindData !== true) {
        // clone `bindData`
        bindData = slice(bindData);
        if (bindData[2]) {
          bindData[2] = slice(bindData[2]);
        }
        if (bindData[3]) {
          bindData[3] = slice(bindData[3]);
        }
        // set `thisBinding` is not previously bound
        if (isBind && !(bindData[1] & 1)) {
          bindData[4] = thisArg;
        }
        // set if previously bound but not currently (subsequent curried functions)
        if (!isBind && bindData[1] & 1) {
          bitmask |= 8;
        }
        // set curried arity if not yet set
        if (isCurry && !(bindData[1] & 4)) {
          bindData[5] = arity;
        }
        // append partial left arguments
        if (isPartial) {
          push.apply(bindData[2] || (bindData[2] = []), partialArgs);
        }
        // append partial right arguments
        if (isPartialRight) {
          unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
        }
        // merge flags
        bindData[1] |= bitmask;
        return createWrapper.apply(null, bindData);
      }
      // fast path for `_.bind`
      var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
      return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
    }

    /**
     * Used by `escape` to convert characters to HTML entities.
     *
     * @private
     * @param {string} match The matched character to escape.
     * @returns {string} Returns the escaped character.
     */
    function escapeHtmlChar(match) {
      return htmlEscapes[match];
    }

    /**
     * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
     * customized, this method returns the custom method, otherwise it returns
     * the `baseIndexOf` function.
     *
     * @private
     * @returns {Function} Returns the "indexOf" function.
     */
    function getIndexOf() {
      var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;
      return result;
    }

    /**
     * Checks if `value` is a native function.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
     */
    function isNative(value) {
      return typeof value == 'function' && reNative.test(value);
    }

    /**
     * Sets `this` binding data on a given function.
     *
     * @private
     * @param {Function} func The function to set data on.
     * @param {Array} value The data array to set.
     */
    var setBindData = !defineProperty ? noop : function(func, value) {
      descriptor.value = value;
      defineProperty(func, '__bindData__', descriptor);
      descriptor.value = null;
    };

    /**
     * A fallback implementation of `isPlainObject` which checks if a given value
     * is an object created by the `Object` constructor, assuming objects created
     * by the `Object` constructor have no inherited enumerable properties and that
     * there are no `Object.prototype` extensions.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     */
    function shimIsPlainObject(value) {
      var ctor,
          result;

      // avoid non Object objects, `arguments` objects, and DOM elements
      if (!(value && toString.call(value) == objectClass) ||
          (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor))) {
        return false;
      }
      // In most environments an object's own properties are iterated before
      // its inherited properties. If the last iterated property is an object's
      // own property then there are no inherited enumerable properties.
      forIn(value, function(value, key) {
        result = key;
      });
      return typeof result == 'undefined' || hasOwnProperty.call(value, result);
    }

    /**
     * Used by `unescape` to convert HTML entities to characters.
     *
     * @private
     * @param {string} match The matched character to unescape.
     * @returns {string} Returns the unescaped character.
     */
    function unescapeHtmlChar(match) {
      return htmlUnescapes[match];
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Checks if `value` is an `arguments` object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
     * @example
     *
     * (function() { return _.isArguments(arguments); })(1, 2, 3);
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == argsClass || false;
    }

    /**
     * Checks if `value` is an array.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
     * @example
     *
     * (function() { return _.isArray(arguments); })();
     * // => false
     *
     * _.isArray([1, 2, 3]);
     * // => true
     */
    var isArray = nativeIsArray || function(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == arrayClass || false;
    };

    /**
     * A fallback implementation of `Object.keys` which produces an array of the
     * given object's own enumerable property names.
     *
     * @private
     * @type Function
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     */
    var shimKeys = function(object) {
      var index, iterable = object, result = [];
      if (!iterable) return result;
      if (!(objectTypes[typeof object])) return result;
        for (index in iterable) {
          if (hasOwnProperty.call(iterable, index)) {
            result.push(index);
          }
        }
      return result
    };

    /**
     * Creates an array composed of the own enumerable property names of an object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     * @example
     *
     * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
     * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
     */
    var keys = !nativeKeys ? shimKeys : function(object) {
      if (!isObject(object)) {
        return [];
      }
      return nativeKeys(object);
    };

    /**
     * Used to convert characters to HTML entities:
     *
     * Though the `>` character is escaped for symmetry, characters like `>` and `/`
     * don't require escaping in HTML and have no special meaning unless they're part
     * of a tag or an unquoted attribute value.
     * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
     */
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    /** Used to convert HTML entities to characters */
    var htmlUnescapes = invert(htmlEscapes);

    /** Used to match HTML entities and HTML characters */
    var reEscapedHtml = RegExp('(' + keys(htmlUnescapes).join('|') + ')', 'g'),
        reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');

    /*--------------------------------------------------------------------------*/

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object. Subsequent sources will overwrite property assignments of previous
     * sources. If a callback is provided it will be executed to produce the
     * assigned values. The callback is bound to `thisArg` and invoked with two
     * arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @type Function
     * @alias extend
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize assigning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
     * // => { 'name': 'fred', 'employer': 'slate' }
     *
     * var defaults = _.partialRight(_.assign, function(a, b) {
     *   return typeof a == 'undefined' ? b : a;
     * });
     *
     * var object = { 'name': 'barney' };
     * defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var assign = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {
        var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);
      } else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {
        callback = args[--argsLength];
      }
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
        }
        }
      }
      return result
    };

    /**
     * Creates a clone of `value`. If `isDeep` is `true` nested objects will also
     * be cloned, otherwise they will be assigned by reference. If a callback
     * is provided it will be executed to produce the cloned values. If the
     * callback returns `undefined` cloning will be handled by the method instead.
     * The callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var shallow = _.clone(characters);
     * shallow[0] === characters[0];
     * // => true
     *
     * var deep = _.clone(characters, true);
     * deep[0] === characters[0];
     * // => false
     *
     * _.mixin({
     *   'clone': _.partialRight(_.clone, function(value) {
     *     return _.isElement(value) ? value.cloneNode(false) : undefined;
     *   })
     * });
     *
     * var clone = _.clone(document.body);
     * clone.childNodes.length;
     * // => 0
     */
    function clone(value, isDeep, callback, thisArg) {
      // allows working with "Collections" methods without using their `index`
      // and `collection` arguments for `isDeep` and `callback`
      if (typeof isDeep != 'boolean' && isDeep != null) {
        thisArg = callback;
        callback = isDeep;
        isDeep = false;
      }
      return baseClone(value, isDeep, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates a deep clone of `value`. If a callback is provided it will be
     * executed to produce the cloned values. If the callback returns `undefined`
     * cloning will be handled by the method instead. The callback is bound to
     * `thisArg` and invoked with one argument; (value).
     *
     * Note: This method is loosely based on the structured clone algorithm. Functions
     * and DOM nodes are **not** cloned. The enumerable properties of `arguments` objects and
     * objects created by constructors other than `Object` are cloned to plain `Object` objects.
     * See http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the deep cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var deep = _.cloneDeep(characters);
     * deep[0] === characters[0];
     * // => false
     *
     * var view = {
     *   'label': 'docs',
     *   'node': element
     * };
     *
     * var clone = _.cloneDeep(view, function(value) {
     *   return _.isElement(value) ? value.cloneNode(true) : undefined;
     * });
     *
     * clone.node == view.node;
     * // => false
     */
    function cloneDeep(value, callback, thisArg) {
      return baseClone(value, true, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates an object that inherits from the given `prototype` object. If a
     * `properties` object is provided its own enumerable properties are assigned
     * to the created object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} prototype The object to inherit from.
     * @param {Object} [properties] The properties to assign to the object.
     * @returns {Object} Returns the new object.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * function Circle() {
     *   Shape.call(this);
     * }
     *
     * Circle.prototype = _.create(Shape.prototype, { 'constructor': Circle });
     *
     * var circle = new Circle;
     * circle instanceof Circle;
     * // => true
     *
     * circle instanceof Shape;
     * // => true
     */
    function create(prototype, properties) {
      var result = baseCreate(prototype);
      return properties ? assign(result, properties) : result;
    }

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object for all destination properties that resolve to `undefined`. Once a
     * property is set, additional defaults of the same property will be ignored.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param- {Object} [guard] Allows working with `_.reduce` without using its
     *  `key` and `object` arguments as sources.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var object = { 'name': 'barney' };
     * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var defaults = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (typeof result[index] == 'undefined') result[index] = iterable[index];
        }
        }
      }
      return result
    };

    /**
     * This method is like `_.findIndex` except that it returns the key of the
     * first element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': false },
     *   'fred': {    'age': 40, 'blocked': true },
     *   'pebbles': { 'age': 1,  'blocked': false }
     * };
     *
     * _.findKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => 'barney' (property order is not guaranteed across environments)
     *
     * // using "_.where" callback shorthand
     * _.findKey(characters, { 'age': 1 });
     * // => 'pebbles'
     *
     * // using "_.pluck" callback shorthand
     * _.findKey(characters, 'blocked');
     * // => 'fred'
     */
    function findKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwn(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * This method is like `_.findKey` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': true },
     *   'fred': {    'age': 40, 'blocked': false },
     *   'pebbles': { 'age': 1,  'blocked': true }
     * };
     *
     * _.findLastKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => returns `pebbles`, assuming `_.findKey` returns `barney`
     *
     * // using "_.where" callback shorthand
     * _.findLastKey(characters, { 'age': 40 });
     * // => 'fred'
     *
     * // using "_.pluck" callback shorthand
     * _.findLastKey(characters, 'blocked');
     * // => 'pebbles'
     */
    function findLastKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwnRight(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over own and inherited enumerable properties of an object,
     * executing the callback for each property. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, key, object). Callbacks may exit
     * iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forIn(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
     */
    var forIn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        for (index in iterable) {
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forIn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forInRight(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'move', 'y', and 'x' assuming `_.forIn ` logs 'x', 'y', and 'move'
     */
    function forInRight(object, callback, thisArg) {
      var pairs = [];

      forIn(object, function(value, key) {
        pairs.push(key, value);
      });

      var length = pairs.length;
      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(pairs[length--], pairs[length], object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Iterates over own enumerable properties of an object, executing the callback
     * for each property. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, key, object). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
     */
    var forOwn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forOwn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwnRight({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs 'length', '1', and '0' assuming `_.forOwn` logs '0', '1', and 'length'
     */
    function forOwnRight(object, callback, thisArg) {
      var props = keys(object),
          length = props.length;

      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        var key = props[length];
        if (callback(object[key], key, object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Creates a sorted array of property names of all enumerable properties,
     * own and inherited, of `object` that have function values.
     *
     * @static
     * @memberOf _
     * @alias methods
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names that have function values.
     * @example
     *
     * _.functions(_);
     * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
     */
    function functions(object) {
      var result = [];
      forIn(object, function(value, key) {
        if (isFunction(value)) {
          result.push(key);
        }
      });
      return result.sort();
    }

    /**
     * Checks if the specified property name exists as a direct property of `object`,
     * instead of an inherited property.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to check.
     * @returns {boolean} Returns `true` if key is a direct property, else `false`.
     * @example
     *
     * _.has({ 'a': 1, 'b': 2, 'c': 3 }, 'b');
     * // => true
     */
    function has(object, key) {
      return object ? hasOwnProperty.call(object, key) : false;
    }

    /**
     * Creates an object composed of the inverted keys and values of the given object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to invert.
     * @returns {Object} Returns the created inverted object.
     * @example
     *
     * _.invert({ 'first': 'fred', 'second': 'barney' });
     * // => { 'fred': 'first', 'barney': 'second' }
     */
    function invert(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = {};

      while (++index < length) {
        var key = props[index];
        result[object[key]] = key;
      }
      return result;
    }

    /**
     * Checks if `value` is a boolean value.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a boolean value, else `false`.
     * @example
     *
     * _.isBoolean(null);
     * // => false
     */
    function isBoolean(value) {
      return value === true || value === false ||
        value && typeof value == 'object' && toString.call(value) == boolClass || false;
    }

    /**
     * Checks if `value` is a date.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a date, else `false`.
     * @example
     *
     * _.isDate(new Date);
     * // => true
     */
    function isDate(value) {
      return value && typeof value == 'object' && toString.call(value) == dateClass || false;
    }

    /**
     * Checks if `value` is a DOM element.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a DOM element, else `false`.
     * @example
     *
     * _.isElement(document.body);
     * // => true
     */
    function isElement(value) {
      return value && value.nodeType === 1 || false;
    }

    /**
     * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
     * length of `0` and objects with no own enumerable properties are considered
     * "empty".
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object|string} value The value to inspect.
     * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
     * @example
     *
     * _.isEmpty([1, 2, 3]);
     * // => false
     *
     * _.isEmpty({});
     * // => true
     *
     * _.isEmpty('');
     * // => true
     */
    function isEmpty(value) {
      var result = true;
      if (!value) {
        return result;
      }
      var className = toString.call(value),
          length = value.length;

      if ((className == arrayClass || className == stringClass || className == argsClass ) ||
          (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
        return !length;
      }
      forOwn(value, function() {
        return (result = false);
      });
      return result;
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent to each other. If a callback is provided it will be executed
     * to compare values. If the callback returns `undefined` comparisons will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (a, b).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var copy = { 'name': 'fred' };
     *
     * object == copy;
     * // => false
     *
     * _.isEqual(object, copy);
     * // => true
     *
     * var words = ['hello', 'goodbye'];
     * var otherWords = ['hi', 'goodbye'];
     *
     * _.isEqual(words, otherWords, function(a, b) {
     *   var reGreet = /^(?:hello|hi)$/i,
     *       aGreet = _.isString(a) && reGreet.test(a),
     *       bGreet = _.isString(b) && reGreet.test(b);
     *
     *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;
     * });
     * // => true
     */
    function isEqual(a, b, callback, thisArg) {
      return baseIsEqual(a, b, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 2));
    }

    /**
     * Checks if `value` is, or can be coerced to, a finite number.
     *
     * Note: This is not the same as native `isFinite` which will return true for
     * booleans and empty strings. See http://es5.github.io/#x15.1.2.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is finite, else `false`.
     * @example
     *
     * _.isFinite(-101);
     * // => true
     *
     * _.isFinite('10');
     * // => true
     *
     * _.isFinite(true);
     * // => false
     *
     * _.isFinite('');
     * // => false
     *
     * _.isFinite(Infinity);
     * // => false
     */
    function isFinite(value) {
      return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
    }

    /**
     * Checks if `value` is a function.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     */
    function isFunction(value) {
      return typeof value == 'function';
    }

    /**
     * Checks if `value` is the language type of Object.
     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(1);
     * // => false
     */
    function isObject(value) {
      // check if the value is the ECMAScript language type of Object
      // http://es5.github.io/#x8
      // and avoid a V8 bug
      // http://code.google.com/p/v8/issues/detail?id=2291
      return !!(value && objectTypes[typeof value]);
    }

    /**
     * Checks if `value` is `NaN`.
     *
     * Note: This is not the same as native `isNaN` which will return `true` for
     * `undefined` and other non-numeric values. See http://es5.github.io/#x15.1.2.4.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `NaN`, else `false`.
     * @example
     *
     * _.isNaN(NaN);
     * // => true
     *
     * _.isNaN(new Number(NaN));
     * // => true
     *
     * isNaN(undefined);
     * // => true
     *
     * _.isNaN(undefined);
     * // => false
     */
    function isNaN(value) {
      // `NaN` as a primitive is the only value that is not equal to itself
      // (perform the [[Class]] check first to avoid errors with some host objects in IE)
      return isNumber(value) && value != +value;
    }

    /**
     * Checks if `value` is `null`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `null`, else `false`.
     * @example
     *
     * _.isNull(null);
     * // => true
     *
     * _.isNull(undefined);
     * // => false
     */
    function isNull(value) {
      return value === null;
    }

    /**
     * Checks if `value` is a number.
     *
     * Note: `NaN` is considered a number. See http://es5.github.io/#x8.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a number, else `false`.
     * @example
     *
     * _.isNumber(8.4 * 5);
     * // => true
     */
    function isNumber(value) {
      return typeof value == 'number' ||
        value && typeof value == 'object' && toString.call(value) == numberClass || false;
    }

    /**
     * Checks if `value` is an object created by the `Object` constructor.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * _.isPlainObject(new Shape);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     */
    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
      if (!(value && toString.call(value) == objectClass)) {
        return false;
      }
      var valueOf = value.valueOf,
          objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

      return objProto
        ? (value == objProto || getPrototypeOf(value) == objProto)
        : shimIsPlainObject(value);
    };

    /**
     * Checks if `value` is a regular expression.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a regular expression, else `false`.
     * @example
     *
     * _.isRegExp(/fred/);
     * // => true
     */
    function isRegExp(value) {
      return value && typeof value == 'object' && toString.call(value) == regexpClass || false;
    }

    /**
     * Checks if `value` is a string.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
     * @example
     *
     * _.isString('fred');
     * // => true
     */
    function isString(value) {
      return typeof value == 'string' ||
        value && typeof value == 'object' && toString.call(value) == stringClass || false;
    }

    /**
     * Checks if `value` is `undefined`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.
     * @example
     *
     * _.isUndefined(void 0);
     * // => true
     */
    function isUndefined(value) {
      return typeof value == 'undefined';
    }

    /**
     * Creates an object with the same keys as `object` and values generated by
     * running each own enumerable property of `object` through the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new object with values of the results of each `callback` execution.
     * @example
     *
     * _.mapValues({ 'a': 1, 'b': 2, 'c': 3} , function(num) { return num * 3; });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     *
     * var characters = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // using "_.pluck" callback shorthand
     * _.mapValues(characters, 'age');
     * // => { 'fred': 40, 'pebbles': 1 }
     */
    function mapValues(object, callback, thisArg) {
      var result = {};
      callback = lodash.createCallback(callback, thisArg, 3);

      forOwn(object, function(value, key, object) {
        result[key] = callback(value, key, object);
      });
      return result;
    }

    /**
     * Recursively merges own enumerable properties of the source object(s), that
     * don't resolve to `undefined` into the destination object. Subsequent sources
     * will overwrite property assignments of previous sources. If a callback is
     * provided it will be executed to produce the merged values of the destination
     * and source properties. If the callback returns `undefined` merging will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var names = {
     *   'characters': [
     *     { 'name': 'barney' },
     *     { 'name': 'fred' }
     *   ]
     * };
     *
     * var ages = {
     *   'characters': [
     *     { 'age': 36 },
     *     { 'age': 40 }
     *   ]
     * };
     *
     * _.merge(names, ages);
     * // => { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
     *
     * var food = {
     *   'fruits': ['apple'],
     *   'vegetables': ['beet']
     * };
     *
     * var otherFood = {
     *   'fruits': ['banana'],
     *   'vegetables': ['carrot']
     * };
     *
     * _.merge(food, otherFood, function(a, b) {
     *   return _.isArray(a) ? a.concat(b) : undefined;
     * });
     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot] }
     */
    function merge(object) {
      var args = arguments,
          length = 2;

      if (!isObject(object)) {
        return object;
      }
      // allows working with `_.reduce` and `_.reduceRight` without using
      // their `index` and `collection` arguments
      if (typeof args[2] != 'number') {
        length = args.length;
      }
      if (length > 3 && typeof args[length - 2] == 'function') {
        var callback = baseCreateCallback(args[--length - 1], args[length--], 2);
      } else if (length > 2 && typeof args[length - 1] == 'function') {
        callback = args[--length];
      }
      var sources = slice(arguments, 1, length),
          index = -1,
          stackA = getArray(),
          stackB = getArray();

      while (++index < length) {
        baseMerge(object, sources[index], callback, stackA, stackB);
      }
      releaseArray(stackA);
      releaseArray(stackB);
      return object;
    }

    /**
     * Creates a shallow clone of `object` excluding the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` omitting the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The properties to omit or the
     *  function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object without the omitted properties.
     * @example
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, 'age');
     * // => { 'name': 'fred' }
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, function(value) {
     *   return typeof value == 'number';
     * });
     * // => { 'name': 'fred' }
     */
    function omit(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var props = [];
        forIn(object, function(value, key) {
          props.push(key);
        });
        props = baseDifference(props, baseFlatten(arguments, true, false, 1));

        var index = -1,
            length = props.length;

        while (++index < length) {
          var key = props[index];
          result[key] = object[key];
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (!callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * Creates a two dimensional array of an object's key-value pairs,
     * i.e. `[[key1, value1], [key2, value2]]`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns new array of key-value pairs.
     * @example
     *
     * _.pairs({ 'barney': 36, 'fred': 40 });
     * // => [['barney', 36], ['fred', 40]] (property order is not guaranteed across environments)
     */
    function pairs(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        var key = props[index];
        result[index] = [key, object[key]];
      }
      return result;
    }

    /**
     * Creates a shallow clone of `object` composed of the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` picking the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The function called per
     *  iteration or property names to pick, specified as individual property
     *  names or arrays of property names.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object composed of the picked properties.
     * @example
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');
     * // => { 'name': 'fred' }
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, function(value, key) {
     *   return key.charAt(0) != '_';
     * });
     * // => { 'name': 'fred' }
     */
    function pick(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var index = -1,
            props = baseFlatten(arguments, true, false, 1),
            length = isObject(object) ? props.length : 0;

        while (++index < length) {
          var key = props[index];
          if (key in object) {
            result[key] = object[key];
          }
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * An alternative to `_.reduce` this method transforms `object` to a new
     * `accumulator` object which is the result of running each of its own
     * enumerable properties through a callback, with each callback execution
     * potentially mutating the `accumulator` object. The callback is bound to
     * `thisArg` and invoked with four arguments; (accumulator, value, key, object).
     * Callbacks may exit iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] The custom accumulator value.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var squares = _.transform([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(result, num) {
     *   num *= num;
     *   if (num % 2) {
     *     return result.push(num) < 3;
     *   }
     * });
     * // => [1, 9, 25]
     *
     * var mapped = _.transform({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     * });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function transform(object, callback, accumulator, thisArg) {
      var isArr = isArray(object);
      if (accumulator == null) {
        if (isArr) {
          accumulator = [];
        } else {
          var ctor = object && object.constructor,
              proto = ctor && ctor.prototype;

          accumulator = baseCreate(proto);
        }
      }
      if (callback) {
        callback = lodash.createCallback(callback, thisArg, 4);
        (isArr ? forEach : forOwn)(object, function(value, index, object) {
          return callback(accumulator, value, index, object);
        });
      }
      return accumulator;
    }

    /**
     * Creates an array composed of the own enumerable property values of `object`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property values.
     * @example
     *
     * _.values({ 'one': 1, 'two': 2, 'three': 3 });
     * // => [1, 2, 3] (property order is not guaranteed across environments)
     */
    function values(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        result[index] = object[props[index]];
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array of elements from the specified indexes, or keys, of the
     * `collection`. Indexes may be specified as individual arguments or as arrays
     * of indexes.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {...(number|number[]|string|string[])} [index] The indexes of `collection`
     *   to retrieve, specified as individual indexes or arrays of indexes.
     * @returns {Array} Returns a new array of elements corresponding to the
     *  provided indexes.
     * @example
     *
     * _.at(['a', 'b', 'c', 'd', 'e'], [0, 2, 4]);
     * // => ['a', 'c', 'e']
     *
     * _.at(['fred', 'barney', 'pebbles'], 0, 2);
     * // => ['fred', 'pebbles']
     */
    function at(collection) {
      var args = arguments,
          index = -1,
          props = baseFlatten(args, true, false, 1),
          length = (args[2] && args[2][args[1]] === collection) ? 1 : props.length,
          result = Array(length);

      while(++index < length) {
        result[index] = collection[props[index]];
      }
      return result;
    }

    /**
     * Checks if a given value is present in a collection using strict equality
     * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the
     * offset from the end of the collection.
     *
     * @static
     * @memberOf _
     * @alias include
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {*} target The value to check for.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {boolean} Returns `true` if the `target` element is found, else `false`.
     * @example
     *
     * _.contains([1, 2, 3], 1);
     * // => true
     *
     * _.contains([1, 2, 3], 1, 2);
     * // => false
     *
     * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');
     * // => true
     *
     * _.contains('pebbles', 'eb');
     * // => true
     */
    function contains(collection, target, fromIndex) {
      var index = -1,
          indexOf = getIndexOf(),
          length = collection ? collection.length : 0,
          result = false;

      fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
      if (isArray(collection)) {
        result = indexOf(collection, target, fromIndex) > -1;
      } else if (typeof length == 'number') {
        result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
      } else {
        forOwn(collection, function(value) {
          if (++index >= fromIndex) {
            return !(result = value === target);
          }
        });
      }
      return result;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` through the callback. The corresponding value
     * of each key is the number of times the key was returned by the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy(['one', 'two', 'three'], 'length');
     * // => { '3': 2, '5': 1 }
     */
    var countBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1);
    });

    /**
     * Checks if the given callback returns truey value for **all** elements of
     * a collection. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias all
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if all elements passed the callback check,
     *  else `false`.
     * @example
     *
     * _.every([true, 1, null, 'yes']);
     * // => false
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.every(characters, 'age');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.every(characters, { 'age': 36 });
     * // => false
     */
    function every(collection, callback, thisArg) {
      var result = true;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if (!(result = !!callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return (result = !!callback(value, index, collection));
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning an array of all elements
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias select
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that passed the callback check.
     * @example
     *
     * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [2, 4, 6]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.filter(characters, 'blocked');
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     *
     * // using "_.where" callback shorthand
     * _.filter(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     */
    function filter(collection, callback, thisArg) {
      var result = [];
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            result.push(value);
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result.push(value);
          }
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning the first element that
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias detect, findWhere
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.find(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => { 'name': 'barney', 'age': 36, 'blocked': false }
     *
     * // using "_.where" callback shorthand
     * _.find(characters, { 'age': 1 });
     * // =>  { 'name': 'pebbles', 'age': 1, 'blocked': false }
     *
     * // using "_.pluck" callback shorthand
     * _.find(characters, 'blocked');
     * // => { 'name': 'fred', 'age': 40, 'blocked': true }
     */
    function find(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            return value;
          }
        }
      } else {
        var result;
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result = value;
            return false;
          }
        });
        return result;
      }
    }

    /**
     * This method is like `_.find` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * _.findLast([1, 2, 3, 4], function(num) {
     *   return num % 2 == 1;
     * });
     * // => 3
     */
    function findLast(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forEachRight(collection, function(value, index, collection) {
        if (callback(value, index, collection)) {
          result = value;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over elements of a collection, executing the callback for each
     * element. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * Note: As with other "Collections" methods, objects with a `length` property
     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
     * may be used for object iteration.
     *
     * @static
     * @memberOf _
     * @alias each
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
     * // => logs each number and returns '1,2,3'
     *
     * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
     * // => logs each number and returns the object (property order is not guaranteed across environments)
     */
    function forEach(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (++index < length) {
          if (callback(collection[index], index, collection) === false) {
            break;
          }
        }
      } else {
        forOwn(collection, callback);
      }
      return collection;
    }

    /**
     * This method is like `_.forEach` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias eachRight
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEachRight(function(num) { console.log(num); }).join(',');
     * // => logs each number from right to left and returns '3,2,1'
     */
    function forEachRight(collection, callback, thisArg) {
      var length = collection ? collection.length : 0;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (length--) {
          if (callback(collection[length], length, collection) === false) {
            break;
          }
        }
      } else {
        var props = keys(collection);
        length = props.length;
        forOwn(collection, function(value, key, collection) {
          key = props ? props[--length] : --length;
          return callback(collection[key], key, collection);
        });
      }
      return collection;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of a collection through the callback. The corresponding value
     * of each key is an array of the elements responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * // using "_.pluck" callback shorthand
     * _.groupBy(['one', 'two', 'three'], 'length');
     * // => { '3': ['one', 'two'], '5': ['three'] }
     */
    var groupBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
    });

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of the collection through the given callback. The corresponding
     * value of each key is the last element responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * var keys = [
     *   { 'dir': 'left', 'code': 97 },
     *   { 'dir': 'right', 'code': 100 }
     * ];
     *
     * _.indexBy(keys, 'dir');
     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(keys, function(key) { return String.fromCharCode(key.code); });
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(characters, function(key) { this.fromCharCode(key.code); }, String);
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     */
    var indexBy = createAggregator(function(result, value, key) {
      result[key] = value;
    });

    /**
     * Invokes the method named by `methodName` on each element in the `collection`
     * returning an array of the results of each invoked method. Additional arguments
     * will be provided to each invoked method. If `methodName` is a function it
     * will be invoked for, and `this` bound to, each element in the `collection`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|string} methodName The name of the method to invoke or
     *  the function invoked per iteration.
     * @param {...*} [arg] Arguments to invoke the method with.
     * @returns {Array} Returns a new array of the results of each invoked method.
     * @example
     *
     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
     * // => [[1, 5, 7], [1, 2, 3]]
     *
     * _.invoke([123, 456], String.prototype.split, '');
     * // => [['1', '2', '3'], ['4', '5', '6']]
     */
    function invoke(collection, methodName) {
      var args = slice(arguments, 2),
          index = -1,
          isFunc = typeof methodName == 'function',
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);
      });
      return result;
    }

    /**
     * Creates an array of values by running each element in the collection
     * through the callback. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias collect
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of the results of each `callback` execution.
     * @example
     *
     * _.map([1, 2, 3], function(num) { return num * 3; });
     * // => [3, 6, 9]
     *
     * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
     * // => [3, 6, 9] (property order is not guaranteed across environments)
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(characters, 'name');
     * // => ['barney', 'fred']
     */
    function map(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        var result = Array(length);
        while (++index < length) {
          result[index] = callback(collection[index], index, collection);
        }
      } else {
        result = [];
        forOwn(collection, function(value, key, collection) {
          result[++index] = callback(value, key, collection);
        });
      }
      return result;
    }

    /**
     * Retrieves the maximum value of a collection. If the collection is empty or
     * falsey `-Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the maximum value.
     * @example
     *
     * _.max([4, 2, 8, 6]);
     * // => 8
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.max(characters, function(chr) { return chr.age; });
     * // => { 'name': 'fred', 'age': 40 };
     *
     * // using "_.pluck" callback shorthand
     * _.max(characters, 'age');
     * // => { 'name': 'fred', 'age': 40 };
     */
    function max(collection, callback, thisArg) {
      var computed = -Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value > result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current > computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the minimum value of a collection. If the collection is empty or
     * falsey `Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the minimum value.
     * @example
     *
     * _.min([4, 2, 8, 6]);
     * // => 2
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.min(characters, function(chr) { return chr.age; });
     * // => { 'name': 'barney', 'age': 36 };
     *
     * // using "_.pluck" callback shorthand
     * _.min(characters, 'age');
     * // => { 'name': 'barney', 'age': 36 };
     */
    function min(collection, callback, thisArg) {
      var computed = Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value < result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current < computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the value of a specified property from all elements in the collection.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {string} property The name of the property to pluck.
     * @returns {Array} Returns a new array of property values.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.pluck(characters, 'name');
     * // => ['barney', 'fred']
     */
    var pluck = map;

    /**
     * Reduces a collection to a value which is the accumulated result of running
     * each element in the collection through the callback, where each successive
     * callback execution consumes the return value of the previous execution. If
     * `accumulator` is not provided the first element of the collection will be
     * used as the initial `accumulator` value. The callback is bound to `thisArg`
     * and invoked with four arguments; (accumulator, value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @alias foldl, inject
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var sum = _.reduce([1, 2, 3], function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     *   return result;
     * }, {});
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function reduce(collection, callback, accumulator, thisArg) {
      if (!collection) return accumulator;
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);

      var index = -1,
          length = collection.length;

      if (typeof length == 'number') {
        if (noaccum) {
          accumulator = collection[++index];
        }
        while (++index < length) {
          accumulator = callback(accumulator, collection[index], index, collection);
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          accumulator = noaccum
            ? (noaccum = false, value)
            : callback(accumulator, value, index, collection)
        });
      }
      return accumulator;
    }

    /**
     * This method is like `_.reduce` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias foldr
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var list = [[0, 1], [2, 3], [4, 5]];
     * var flat = _.reduceRight(list, function(a, b) { return a.concat(b); }, []);
     * // => [4, 5, 2, 3, 0, 1]
     */
    function reduceRight(collection, callback, accumulator, thisArg) {
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);
      forEachRight(collection, function(value, index, collection) {
        accumulator = noaccum
          ? (noaccum = false, value)
          : callback(accumulator, value, index, collection);
      });
      return accumulator;
    }

    /**
     * The opposite of `_.filter` this method returns the elements of a
     * collection that the callback does **not** return truey for.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that failed the callback check.
     * @example
     *
     * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [1, 3, 5]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.reject(characters, 'blocked');
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     *
     * // using "_.where" callback shorthand
     * _.reject(characters, { 'age': 36 });
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     */
    function reject(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);
      return filter(collection, function(value, index, collection) {
        return !callback(value, index, collection);
      });
    }

    /**
     * Retrieves a random element or `n` random elements from a collection.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to sample.
     * @param {number} [n] The number of elements to sample.
     * @param- {Object} [guard] Allows working with functions like `_.map`
     *  without using their `index` arguments as `n`.
     * @returns {Array} Returns the random sample(s) of `collection`.
     * @example
     *
     * _.sample([1, 2, 3, 4]);
     * // => 2
     *
     * _.sample([1, 2, 3, 4], 2);
     * // => [3, 1]
     */
    function sample(collection, n, guard) {
      if (collection && typeof collection.length != 'number') {
        collection = values(collection);
      }
      if (n == null || guard) {
        return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;
      }
      var result = shuffle(collection);
      result.length = nativeMin(nativeMax(0, n), result.length);
      return result;
    }

    /**
     * Creates an array of shuffled values, using a version of the Fisher-Yates
     * shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to shuffle.
     * @returns {Array} Returns a new shuffled collection.
     * @example
     *
     * _.shuffle([1, 2, 3, 4, 5, 6]);
     * // => [4, 1, 6, 3, 5, 2]
     */
    function shuffle(collection) {
      var index = -1,
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        var rand = baseRandom(0, ++index);
        result[index] = result[rand];
        result[rand] = value;
      });
      return result;
    }

    /**
     * Gets the size of the `collection` by returning `collection.length` for arrays
     * and array-like objects or the number of own enumerable properties for objects.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to inspect.
     * @returns {number} Returns `collection.length` or number of own enumerable properties.
     * @example
     *
     * _.size([1, 2]);
     * // => 2
     *
     * _.size({ 'one': 1, 'two': 2, 'three': 3 });
     * // => 3
     *
     * _.size('pebbles');
     * // => 7
     */
    function size(collection) {
      var length = collection ? collection.length : 0;
      return typeof length == 'number' ? length : keys(collection).length;
    }

    /**
     * Checks if the callback returns a truey value for **any** element of a
     * collection. The function returns as soon as it finds a passing value and
     * does not iterate over the entire collection. The callback is bound to
     * `thisArg` and invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias any
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if any element passed the callback check,
     *  else `false`.
     * @example
     *
     * _.some([null, 0, 'yes', false], Boolean);
     * // => true
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.some(characters, 'blocked');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.some(characters, { 'age': 1 });
     * // => false
     */
    function some(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if ((result = callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return !(result = callback(value, index, collection));
        });
      }
      return !!result;
    }

    /**
     * Creates an array of elements, sorted in ascending order by the results of
     * running each element in a collection through the callback. This method
     * performs a stable sort, that is, it will preserve the original sort order
     * of equal elements. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an array of property names is provided for `callback` the collection
     * will be sorted by each property value.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Array|Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of sorted elements.
     * @example
     *
     * _.sortBy([1, 2, 3], function(num) { return Math.sin(num); });
     * // => [3, 1, 2]
     *
     * _.sortBy([1, 2, 3], function(num) { return this.sin(num); }, Math);
     * // => [3, 1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'barney',  'age': 26 },
     *   { 'name': 'fred',    'age': 30 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(_.sortBy(characters, 'age'), _.values);
     * // => [['barney', 26], ['fred', 30], ['barney', 36], ['fred', 40]]
     *
     * // sorting by multiple properties
     * _.map(_.sortBy(characters, ['name', 'age']), _.values);
     * // = > [['barney', 26], ['barney', 36], ['fred', 30], ['fred', 40]]
     */
    function sortBy(collection, callback, thisArg) {
      var index = -1,
          isArr = isArray(callback),
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      if (!isArr) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      forEach(collection, function(value, key, collection) {
        var object = result[++index] = getObject();
        if (isArr) {
          object.criteria = map(callback, function(key) { return value[key]; });
        } else {
          (object.criteria = getArray())[0] = callback(value, key, collection);
        }
        object.index = index;
        object.value = value;
      });

      length = result.length;
      result.sort(compareAscending);
      while (length--) {
        var object = result[length];
        result[length] = object.value;
        if (!isArr) {
          releaseArray(object.criteria);
        }
        releaseObject(object);
      }
      return result;
    }

    /**
     * Converts the `collection` to an array.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to convert.
     * @returns {Array} Returns the new converted array.
     * @example
     *
     * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
     * // => [2, 3, 4]
     */
    function toArray(collection) {
      if (collection && typeof collection.length == 'number') {
        return slice(collection);
      }
      return values(collection);
    }

    /**
     * Performs a deep comparison of each element in a `collection` to the given
     * `properties` object, returning an array of all elements that have equivalent
     * property values.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Object} props The object of property values to filter by.
     * @returns {Array} Returns a new array of elements that have the given properties.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * _.where(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'pets': ['hoppy'] }]
     *
     * _.where(characters, { 'pets': ['dino'] });
     * // => [{ 'name': 'fred', 'age': 40, 'pets': ['baby puss', 'dino'] }]
     */
    var where = filter;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array with all falsey values removed. The values `false`, `null`,
     * `0`, `""`, `undefined`, and `NaN` are all falsey.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to compact.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.compact([0, 1, false, 2, '', 3]);
     * // => [1, 2, 3]
     */
    function compact(array) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * Creates an array excluding all values of the provided arrays using strict
     * equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {...Array} [values] The arrays of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
     * // => [1, 3, 4]
     */
    function difference(array) {
      return baseDifference(array, baseFlatten(arguments, true, true, 1));
    }

    /**
     * This method is like `_.find` except that it returns the index of the first
     * element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.findIndex(characters, function(chr) {
     *   return chr.age < 20;
     * });
     * // => 2
     *
     * // using "_.where" callback shorthand
     * _.findIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findIndex(characters, 'blocked');
     * // => 1
     */
    function findIndex(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        if (callback(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * This method is like `_.findIndex` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': true },
     *   { 'name': 'fred',    'age': 40, 'blocked': false },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': true }
     * ];
     *
     * _.findLastIndex(characters, function(chr) {
     *   return chr.age > 30;
     * });
     * // => 1
     *
     * // using "_.where" callback shorthand
     * _.findLastIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findLastIndex(characters, 'blocked');
     * // => 2
     */
    function findLastIndex(array, callback, thisArg) {
      var length = array ? array.length : 0;
      callback = lodash.createCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(array[length], length, array)) {
          return length;
        }
      }
      return -1;
    }

    /**
     * Gets the first element or first `n` elements of an array. If a callback
     * is provided elements at the beginning of the array are returned as long
     * as the callback returns truey. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias head, take
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the first element(s) of `array`.
     * @example
     *
     * _.first([1, 2, 3]);
     * // => 1
     *
     * _.first([1, 2, 3], 2);
     * // => [1, 2]
     *
     * _.first([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false, 'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.first(characters, 'blocked');
     * // => [{ 'name': 'barney', 'blocked': true, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.first(characters, { 'employer': 'slate' }), 'name');
     * // => ['barney', 'fred']
     */
    function first(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = -1;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[0] : undefined;
        }
      }
      return slice(array, 0, nativeMin(nativeMax(0, n), length));
    }

    /**
     * Flattens a nested array (the nesting can be to any depth). If `isShallow`
     * is truey, the array will only be flattened a single level. If a callback
     * is provided each element of the array is passed through the callback before
     * flattening. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new flattened array.
     * @example
     *
     * _.flatten([1, [2], [3, [[4]]]]);
     * // => [1, 2, 3, 4];
     *
     * _.flatten([1, [2], [3, [[4]]]], true);
     * // => [1, 2, 3, [[4]]];
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.flatten(characters, 'pets');
     * // => ['hoppy', 'baby puss', 'dino']
     */
    function flatten(array, isShallow, callback, thisArg) {
      // juggle arguments
      if (typeof isShallow != 'boolean' && isShallow != null) {
        thisArg = callback;
        callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;
        isShallow = false;
      }
      if (callback != null) {
        array = map(array, callback, thisArg);
      }
      return baseFlatten(array, isShallow);
    }

    /**
     * Gets the index at which the first occurrence of `value` is found using
     * strict equality for comparisons, i.e. `===`. If the array is already sorted
     * providing `true` for `fromIndex` will run a faster binary search.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {boolean|number} [fromIndex=0] The index to search from or `true`
     *  to perform a binary search on a sorted array.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 1
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 4
     *
     * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);
     * // => 2
     */
    function indexOf(array, value, fromIndex) {
      if (typeof fromIndex == 'number') {
        var length = array ? array.length : 0;
        fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0);
      } else if (fromIndex) {
        var index = sortedIndex(array, value);
        return array[index] === value ? index : -1;
      }
      return baseIndexOf(array, value, fromIndex);
    }

    /**
     * Gets all but the last element or last `n` elements of an array. If a
     * callback is provided elements at the end of the array are excluded from
     * the result as long as the callback returns truey. The callback is bound
     * to `thisArg` and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.initial([1, 2, 3]);
     * // => [1, 2]
     *
     * _.initial([1, 2, 3], 2);
     * // => [1]
     *
     * _.initial([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [1]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.initial(characters, 'blocked');
     * // => [{ 'name': 'barney',  'blocked': false, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.initial(characters, { 'employer': 'na' }), 'name');
     * // => ['barney', 'fred']
     */
    function initial(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : callback || n;
      }
      return slice(array, 0, nativeMin(nativeMax(0, length - n), length));
    }

    /**
     * Creates an array of unique values present in all provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of shared values.
     * @example
     *
     * _.intersection([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2]
     */
    function intersection() {
      var args = [],
          argsIndex = -1,
          argsLength = arguments.length,
          caches = getArray(),
          indexOf = getIndexOf(),
          trustIndexOf = indexOf === baseIndexOf,
          seen = getArray();

      while (++argsIndex < argsLength) {
        var value = arguments[argsIndex];
        if (isArray(value) || isArguments(value)) {
          args.push(value);
          caches.push(trustIndexOf && value.length >= largeArraySize &&
            createCache(argsIndex ? args[argsIndex] : seen));
        }
      }
      var array = args[0],
          index = -1,
          length = array ? array.length : 0,
          result = [];

      outer:
      while (++index < length) {
        var cache = caches[0];
        value = array[index];

        if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
          argsIndex = argsLength;
          (cache || seen).push(value);
          while (--argsIndex) {
            cache = caches[argsIndex];
            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
              continue outer;
            }
          }
          result.push(value);
        }
      }
      while (argsLength--) {
        cache = caches[argsLength];
        if (cache) {
          releaseObject(cache);
        }
      }
      releaseArray(caches);
      releaseArray(seen);
      return result;
    }

    /**
     * Gets the last element or last `n` elements of an array. If a callback is
     * provided elements at the end of the array are returned as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the last element(s) of `array`.
     * @example
     *
     * _.last([1, 2, 3]);
     * // => 3
     *
     * _.last([1, 2, 3], 2);
     * // => [2, 3]
     *
     * _.last([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [2, 3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.last(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.last(characters, { 'employer': 'na' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function last(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[length - 1] : undefined;
        }
      }
      return slice(array, nativeMax(0, length - n));
    }

    /**
     * Gets the index at which the last occurrence of `value` is found using strict
     * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
     * as the offset from the end of the collection.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=array.length-1] The index to search from.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 4
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 1
     */
    function lastIndexOf(array, value, fromIndex) {
      var index = array ? array.length : 0;
      if (typeof fromIndex == 'number') {
        index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;
      }
      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * Removes all provided values from the given array using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {...*} [value] The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3, 1, 2, 3];
     * _.pull(array, 2, 3);
     * console.log(array);
     * // => [1, 1]
     */
    function pull(array) {
      var args = arguments,
          argsIndex = 0,
          argsLength = args.length,
          length = array ? array.length : 0;

      while (++argsIndex < argsLength) {
        var index = -1,
            value = args[argsIndex];
        while (++index < length) {
          if (array[index] === value) {
            splice.call(array, index--, 1);
            length--;
          }
        }
      }
      return array;
    }

    /**
     * Creates an array of numbers (positive and/or negative) progressing from
     * `start` up to but not including `end`. If `start` is less than `stop` a
     * zero-length range is created unless a negative `step` is specified.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @param {number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns a new range array.
     * @example
     *
     * _.range(4);
     * // => [0, 1, 2, 3]
     *
     * _.range(1, 5);
     * // => [1, 2, 3, 4]
     *
     * _.range(0, 20, 5);
     * // => [0, 5, 10, 15]
     *
     * _.range(0, -4, -1);
     * // => [0, -1, -2, -3]
     *
     * _.range(1, 4, 0);
     * // => [1, 1, 1]
     *
     * _.range(0);
     * // => []
     */
    function range(start, end, step) {
      start = +start || 0;
      step = typeof step == 'number' ? step : (+step || 1);

      if (end == null) {
        end = start;
        start = 0;
      }
      // use `Array(length)` so engines like Chakra and V8 avoid slower modes
      // http://youtu.be/XAqIpGU8ZZk#t=17m25s
      var index = -1,
          length = nativeMax(0, ceil((end - start) / (step || 1))),
          result = Array(length);

      while (++index < length) {
        result[index] = start;
        start += step;
      }
      return result;
    }

    /**
     * Removes all elements from an array that the callback returns truey for
     * and returns an array of removed elements. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of removed elements.
     * @example
     *
     * var array = [1, 2, 3, 4, 5, 6];
     * var evens = _.remove(array, function(num) { return num % 2 == 0; });
     *
     * console.log(array);
     * // => [1, 3, 5]
     *
     * console.log(evens);
     * // => [2, 4, 6]
     */
    function remove(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        var value = array[index];
        if (callback(value, index, array)) {
          result.push(value);
          splice.call(array, index--, 1);
          length--;
        }
      }
      return result;
    }

    /**
     * The opposite of `_.initial` this method gets all but the first element or
     * first `n` elements of an array. If a callback function is provided elements
     * at the beginning of the array are excluded from the result as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias drop, tail
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.rest([1, 2, 3]);
     * // => [2, 3]
     *
     * _.rest([1, 2, 3], 2);
     * // => [3]
     *
     * _.rest([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true, 'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.rest(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.rest(characters, { 'employer': 'slate' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function rest(array, callback, thisArg) {
      if (typeof callback != 'number' && callback != null) {
        var n = 0,
            index = -1,
            length = array ? array.length : 0;

        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : nativeMax(0, callback);
      }
      return slice(array, n);
    }

    /**
     * Uses a binary search to determine the smallest index at which a value
     * should be inserted into a given sorted array in order to maintain the sort
     * order of the array. If a callback is provided it will be executed for
     * `value` and each element of `array` to compute their sort ranking. The
     * callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedIndex([20, 30, 50], 40);
     * // => 2
     *
     * // using "_.pluck" callback shorthand
     * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
     * // => 2
     *
     * var dict = {
     *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }
     * };
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return dict.wordToNumber[word];
     * });
     * // => 2
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return this.wordToNumber[word];
     * }, dict);
     * // => 2
     */
    function sortedIndex(array, value, callback, thisArg) {
      var low = 0,
          high = array ? array.length : low;

      // explicitly reference `identity` for better inlining in Firefox
      callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
      value = callback(value);

      while (low < high) {
        var mid = (low + high) >>> 1;
        (callback(array[mid]) < value)
          ? low = mid + 1
          : high = mid;
      }
      return low;
    }

    /**
     * Creates an array of unique values, in order, of the provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of combined values.
     * @example
     *
     * _.union([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2, 3, 5, 4]
     */
    function union() {
      return baseUniq(baseFlatten(arguments, true, true));
    }

    /**
     * Creates a duplicate-value-free version of an array using strict equality
     * for comparisons, i.e. `===`. If the array is sorted, providing
     * `true` for `isSorted` will use a faster algorithm. If a callback is provided
     * each element of `array` is passed through the callback before uniqueness
     * is computed. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias unique
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a duplicate-value-free array.
     * @example
     *
     * _.uniq([1, 2, 1, 3, 1]);
     * // => [1, 2, 3]
     *
     * _.uniq([1, 1, 2, 2, 3], true);
     * // => [1, 2, 3]
     *
     * _.uniq(['A', 'b', 'C', 'a', 'B', 'c'], function(letter) { return letter.toLowerCase(); });
     * // => ['A', 'b', 'C']
     *
     * _.uniq([1, 2.5, 3, 1.5, 2, 3.5], function(num) { return this.floor(num); }, Math);
     * // => [1, 2.5, 3]
     *
     * // using "_.pluck" callback shorthand
     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    function uniq(array, isSorted, callback, thisArg) {
      // juggle arguments
      if (typeof isSorted != 'boolean' && isSorted != null) {
        thisArg = callback;
        callback = (typeof isSorted != 'function' && thisArg && thisArg[isSorted] === array) ? null : isSorted;
        isSorted = false;
      }
      if (callback != null) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      return baseUniq(array, isSorted, callback);
    }

    /**
     * Creates an array excluding all provided values using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to filter.
     * @param {...*} [value] The values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
     * // => [2, 3, 4]
     */
    function without(array) {
      return baseDifference(array, slice(arguments, 1));
    }

    /**
     * Creates an array that is the symmetric difference of the provided arrays.
     * See http://en.wikipedia.org/wiki/Symmetric_difference.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of values.
     * @example
     *
     * _.xor([1, 2, 3], [5, 2, 1, 4]);
     * // => [3, 5, 4]
     *
     * _.xor([1, 2, 5], [2, 3, 5], [3, 4, 5]);
     * // => [1, 4, 5]
     */
    function xor() {
      var index = -1,
          length = arguments.length;

      while (++index < length) {
        var array = arguments[index];
        if (isArray(array) || isArguments(array)) {
          var result = result
            ? baseUniq(baseDifference(result, array).concat(baseDifference(array, result)))
            : array;
        }
      }
      return result || [];
    }

    /**
     * Creates an array of grouped elements, the first of which contains the first
     * elements of the given arrays, the second of which contains the second
     * elements of the given arrays, and so on.
     *
     * @static
     * @memberOf _
     * @alias unzip
     * @category Arrays
     * @param {...Array} [array] Arrays to process.
     * @returns {Array} Returns a new array of grouped elements.
     * @example
     *
     * _.zip(['fred', 'barney'], [30, 40], [true, false]);
     * // => [['fred', 30, true], ['barney', 40, false]]
     */
    function zip() {
      var array = arguments.length > 1 ? arguments : arguments[0],
          index = -1,
          length = array ? max(pluck(array, 'length')) : 0,
          result = Array(length < 0 ? 0 : length);

      while (++index < length) {
        result[index] = pluck(array, index);
      }
      return result;
    }

    /**
     * Creates an object composed from arrays of `keys` and `values`. Provide
     * either a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`
     * or two arrays, one of `keys` and one of corresponding `values`.
     *
     * @static
     * @memberOf _
     * @alias object
     * @category Arrays
     * @param {Array} keys The array of keys.
     * @param {Array} [values=[]] The array of values.
     * @returns {Object} Returns an object composed of the given keys and
     *  corresponding values.
     * @example
     *
     * _.zipObject(['fred', 'barney'], [30, 40]);
     * // => { 'fred': 30, 'barney': 40 }
     */
    function zipObject(keys, values) {
      var index = -1,
          length = keys ? keys.length : 0,
          result = {};

      if (!values && length && !isArray(keys[0])) {
        values = [];
      }
      while (++index < length) {
        var key = keys[index];
        if (values) {
          result[key] = values[index];
        } else if (key) {
          result[key[0]] = key[1];
        }
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that executes `func`, with  the `this` binding and
     * arguments of the created function, only after being called `n` times.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {number} n The number of times the function must be called before
     *  `func` is executed.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var saves = ['profile', 'settings'];
     *
     * var done = _.after(saves.length, function() {
     *   console.log('Done saving!');
     * });
     *
     * _.forEach(saves, function(type) {
     *   asyncSave({ 'type': type, 'complete': done });
     * });
     * // => logs 'Done saving!', after all saves have completed
     */
    function after(n, func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (--n < 1) {
          return func.apply(this, arguments);
        }
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with the `this`
     * binding of `thisArg` and prepends any additional `bind` arguments to those
     * provided to the bound function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to bind.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var func = function(greeting) {
     *   return greeting + ' ' + this.name;
     * };
     *
     * func = _.bind(func, { 'name': 'fred' }, 'hi');
     * func();
     * // => 'hi fred'
     */
    function bind(func, thisArg) {
      return arguments.length > 2
        ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
        : createWrapper(func, 1, null, null, thisArg);
    }

    /**
     * Binds methods of an object to the object itself, overwriting the existing
     * method. Method names may be specified as individual arguments or as arrays
     * of method names. If no method names are provided all the function properties
     * of `object` will be bound.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object to bind and assign the bound methods to.
     * @param {...string} [methodName] The object method names to
     *  bind, specified as individual method names or arrays of method names.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var view = {
     *   'label': 'docs',
     *   'onClick': function() { console.log('clicked ' + this.label); }
     * };
     *
     * _.bindAll(view);
     * jQuery('#docs').on('click', view.onClick);
     * // => logs 'clicked docs', when the button is clicked
     */
    function bindAll(object) {
      var funcs = arguments.length > 1 ? baseFlatten(arguments, true, false, 1) : functions(object),
          index = -1,
          length = funcs.length;

      while (++index < length) {
        var key = funcs[index];
        object[key] = createWrapper(object[key], 1, null, null, object);
      }
      return object;
    }

    /**
     * Creates a function that, when called, invokes the method at `object[key]`
     * and prepends any additional `bindKey` arguments to those provided to the bound
     * function. This method differs from `_.bind` by allowing bound functions to
     * reference methods that will be redefined or don't yet exist.
     * See http://michaux.ca/articles/lazy-function-definition-pattern.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object the method belongs to.
     * @param {string} key The key of the method.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var object = {
     *   'name': 'fred',
     *   'greet': function(greeting) {
     *     return greeting + ' ' + this.name;
     *   }
     * };
     *
     * var func = _.bindKey(object, 'greet', 'hi');
     * func();
     * // => 'hi fred'
     *
     * object.greet = function(greeting) {
     *   return greeting + 'ya ' + this.name + '!';
     * };
     *
     * func();
     * // => 'hiya fred!'
     */
    function bindKey(object, key) {
      return arguments.length > 2
        ? createWrapper(key, 19, slice(arguments, 2), null, object)
        : createWrapper(key, 3, null, null, object);
    }

    /**
     * Creates a function that is the composition of the provided functions,
     * where each function consumes the return value of the function that follows.
     * For example, composing the functions `f()`, `g()`, and `h()` produces `f(g(h()))`.
     * Each function is executed with the `this` binding of the composed function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {...Function} [func] Functions to compose.
     * @returns {Function} Returns the new composed function.
     * @example
     *
     * var realNameMap = {
     *   'pebbles': 'penelope'
     * };
     *
     * var format = function(name) {
     *   name = realNameMap[name.toLowerCase()] || name;
     *   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
     * };
     *
     * var greet = function(formatted) {
     *   return 'Hiya ' + formatted + '!';
     * };
     *
     * var welcome = _.compose(greet, format);
     * welcome('pebbles');
     * // => 'Hiya Penelope!'
     */
    function compose() {
      var funcs = arguments,
          length = funcs.length;

      while (length--) {
        if (!isFunction(funcs[length])) {
          throw new TypeError;
        }
      }
      return function() {
        var args = arguments,
            length = funcs.length;

        while (length--) {
          args = [funcs[length].apply(this, args)];
        }
        return args[0];
      };
    }

    /**
     * Creates a function which accepts one or more arguments of `func` that when
     * invoked either executes `func` returning its result, if all `func` arguments
     * have been provided, or returns a function that accepts one or more of the
     * remaining `func` arguments, and so on. The arity of `func` can be specified
     * if `func.length` is not sufficient.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var curried = _.curry(function(a, b, c) {
     *   console.log(a + b + c);
     * });
     *
     * curried(1)(2)(3);
     * // => 6
     *
     * curried(1, 2)(3);
     * // => 6
     *
     * curried(1, 2, 3);
     * // => 6
     */
    function curry(func, arity) {
      arity = typeof arity == 'number' ? arity : (+arity || func.length);
      return createWrapper(func, 4, null, null, null, arity);
    }

    /**
     * Creates a function that will delay the execution of `func` until after
     * `wait` milliseconds have elapsed since the last time it was invoked.
     * Provide an options object to indicate that `func` should be invoked on
     * the leading and/or trailing edge of the `wait` timeout. Subsequent calls
     * to the debounced function will return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the debounced function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to debounce.
     * @param {number} wait The number of milliseconds to delay.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.
     * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // avoid costly calculations while the window size is in flux
     * var lazyLayout = _.debounce(calculateLayout, 150);
     * jQuery(window).on('resize', lazyLayout);
     *
     * // execute `sendMail` when the click event is fired, debouncing subsequent calls
     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * });
     *
     * // ensure `batchLog` is executed once after 1 second of debounced calls
     * var source = new EventSource('/stream');
     * source.addEventListener('message', _.debounce(batchLog, 250, {
     *   'maxWait': 1000
     * }, false);
     */
    function debounce(func, wait, options) {
      var args,
          maxTimeoutId,
          result,
          stamp,
          thisArg,
          timeoutId,
          trailingCall,
          lastCalled = 0,
          maxWait = false,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      wait = nativeMax(0, wait) || 0;
      if (options === true) {
        var leading = true;
        trailing = false;
      } else if (isObject(options)) {
        leading = options.leading;
        maxWait = 'maxWait' in options && (nativeMax(wait, options.maxWait) || 0);
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      var delayed = function() {
        var remaining = wait - (now() - stamp);
        if (remaining <= 0) {
          if (maxTimeoutId) {
            clearTimeout(maxTimeoutId);
          }
          var isCalled = trailingCall;
          maxTimeoutId = timeoutId = trailingCall = undefined;
          if (isCalled) {
            lastCalled = now();
            result = func.apply(thisArg, args);
            if (!timeoutId && !maxTimeoutId) {
              args = thisArg = null;
            }
          }
        } else {
          timeoutId = setTimeout(delayed, remaining);
        }
      };

      var maxDelayed = function() {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        maxTimeoutId = timeoutId = trailingCall = undefined;
        if (trailing || (maxWait !== wait)) {
          lastCalled = now();
          result = func.apply(thisArg, args);
          if (!timeoutId && !maxTimeoutId) {
            args = thisArg = null;
          }
        }
      };

      return function() {
        args = arguments;
        stamp = now();
        thisArg = this;
        trailingCall = trailing && (timeoutId || !leading);

        if (maxWait === false) {
          var leadingCall = leading && !timeoutId;
        } else {
          if (!maxTimeoutId && !leading) {
            lastCalled = stamp;
          }
          var remaining = maxWait - (stamp - lastCalled),
              isCalled = remaining <= 0;

          if (isCalled) {
            if (maxTimeoutId) {
              maxTimeoutId = clearTimeout(maxTimeoutId);
            }
            lastCalled = stamp;
            result = func.apply(thisArg, args);
          }
          else if (!maxTimeoutId) {
            maxTimeoutId = setTimeout(maxDelayed, remaining);
          }
        }
        if (isCalled && timeoutId) {
          timeoutId = clearTimeout(timeoutId);
        }
        else if (!timeoutId && wait !== maxWait) {
          timeoutId = setTimeout(delayed, wait);
        }
        if (leadingCall) {
          isCalled = true;
          result = func.apply(thisArg, args);
        }
        if (isCalled && !timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
        return result;
      };
    }

    /**
     * Defers executing the `func` function until the current call stack has cleared.
     * Additional arguments will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to defer.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.defer(function(text) { console.log(text); }, 'deferred');
     * // logs 'deferred' after one or more milliseconds
     */
    function defer(func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 1);
      return setTimeout(function() { func.apply(undefined, args); }, 1);
    }

    /**
     * Executes the `func` function after `wait` milliseconds. Additional arguments
     * will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay execution.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.delay(function(text) { console.log(text); }, 1000, 'later');
     * // => logs 'later' after one second
     */
    function delay(func, wait) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 2);
      return setTimeout(function() { func.apply(undefined, args); }, wait);
    }

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided it will be used to determine the cache key for storing the result
     * based on the arguments provided to the memoized function. By default, the
     * first argument provided to the memoized function is used as the cache key.
     * The `func` is executed with the `this` binding of the memoized function.
     * The result cache is exposed as the `cache` property on the memoized function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] A function used to resolve the cache key.
     * @returns {Function} Returns the new memoizing function.
     * @example
     *
     * var fibonacci = _.memoize(function(n) {
     *   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
     * });
     *
     * fibonacci(9)
     * // => 34
     *
     * var data = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // modifying the result cache
     * var get = _.memoize(function(name) { return data[name]; }, _.identity);
     * get('pebbles');
     * // => { 'name': 'pebbles', 'age': 1 }
     *
     * get.cache.pebbles.name = 'penelope';
     * get('pebbles');
     * // => { 'name': 'penelope', 'age': 1 }
     */
    function memoize(func, resolver) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var memoized = function() {
        var cache = memoized.cache,
            key = resolver ? resolver.apply(this, arguments) : keyPrefix + arguments[0];

        return hasOwnProperty.call(cache, key)
          ? cache[key]
          : (cache[key] = func.apply(this, arguments));
      }
      memoized.cache = {};
      return memoized;
    }

    /**
     * Creates a function that is restricted to execute `func` once. Repeat calls to
     * the function will return the value of the first call. The `func` is executed
     * with the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var initialize = _.once(createApplication);
     * initialize();
     * initialize();
     * // `initialize` executes `createApplication` once
     */
    function once(func) {
      var ran,
          result;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (ran) {
          return result;
        }
        ran = true;
        result = func.apply(this, arguments);

        // clear the `func` variable so the function may be garbage collected
        func = null;
        return result;
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with any additional
     * `partial` arguments prepended to those provided to the new function. This
     * method is similar to `_.bind` except it does **not** alter the `this` binding.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var greet = function(greeting, name) { return greeting + ' ' + name; };
     * var hi = _.partial(greet, 'hi');
     * hi('fred');
     * // => 'hi fred'
     */
    function partial(func) {
      return createWrapper(func, 16, slice(arguments, 1));
    }

    /**
     * This method is like `_.partial` except that `partial` arguments are
     * appended to those provided to the new function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var defaultsDeep = _.partialRight(_.merge, _.defaults);
     *
     * var options = {
     *   'variable': 'data',
     *   'imports': { 'jq': $ }
     * };
     *
     * defaultsDeep(options, _.templateSettings);
     *
     * options.variable
     * // => 'data'
     *
     * options.imports
     * // => { '_': _, 'jq': $ }
     */
    function partialRight(func) {
      return createWrapper(func, 32, null, slice(arguments, 1));
    }

    /**
     * Creates a function that, when executed, will only call the `func` function
     * at most once per every `wait` milliseconds. Provide an options object to
     * indicate that `func` should be invoked on the leading and/or trailing edge
     * of the `wait` timeout. Subsequent calls to the throttled function will
     * return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the throttled function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to throttle.
     * @param {number} wait The number of milliseconds to throttle executions to.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * // avoid excessively updating the position while scrolling
     * var throttled = _.throttle(updatePosition, 100);
     * jQuery(window).on('scroll', throttled);
     *
     * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes
     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
     *   'trailing': false
     * }));
     */
    function throttle(func, wait, options) {
      var leading = true,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      if (options === false) {
        leading = false;
      } else if (isObject(options)) {
        leading = 'leading' in options ? options.leading : leading;
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      debounceOptions.leading = leading;
      debounceOptions.maxWait = wait;
      debounceOptions.trailing = trailing;

      return debounce(func, wait, debounceOptions);
    }

    /**
     * Creates a function that provides `value` to the wrapper function as its
     * first argument. Additional arguments provided to the function are appended
     * to those provided to the wrapper function. The wrapper is executed with
     * the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {*} value The value to wrap.
     * @param {Function} wrapper The wrapper function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var p = _.wrap(_.escape, function(func, text) {
     *   return '<p>' + func(text) + '</p>';
     * });
     *
     * p('Fred, Wilma, & Pebbles');
     * // => '<p>Fred, Wilma, &amp; Pebbles</p>'
     */
    function wrap(value, wrapper) {
      return createWrapper(wrapper, 16, [value]);
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var getter = _.constant(object);
     * getter() === object;
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    /**
     * Produces a callback bound to an optional `thisArg`. If `func` is a property
     * name the created callback will return the property value for a given element.
     * If `func` is an object the created callback will return `true` for elements
     * that contain the equivalent object properties, otherwise it will return `false`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // wrap to create custom callback shorthands
     * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
     *   return !match ? func(callback, thisArg) : function(object) {
     *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
     *   };
     * });
     *
     * _.filter(characters, 'age__gt38');
     * // => [{ 'name': 'fred', 'age': 40 }]
     */
    function createCallback(func, thisArg, argCount) {
      var type = typeof func;
      if (func == null || type == 'function') {
        return baseCreateCallback(func, thisArg, argCount);
      }
      // handle "_.pluck" style callback shorthands
      if (type != 'object') {
        return property(func);
      }
      var props = keys(func),
          key = props[0],
          a = func[key];

      // handle "_.where" style callback shorthands
      if (props.length == 1 && a === a && !isObject(a)) {
        // fast path the common case of providing an object with a single
        // property containing a primitive value
        return function(object) {
          var b = object[key];
          return a === b && (a !== 0 || (1 / a == 1 / b));
        };
      }
      return function(object) {
        var length = props.length,
            result = false;

        while (length--) {
          if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
            break;
          }
        }
        return result;
      };
    }

    /**
     * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
     * corresponding HTML entities.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escape('Fred, Wilma, & Pebbles');
     * // => 'Fred, Wilma, &amp; Pebbles'
     */
    function escape(string) {
      return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
    }

    /**
     * This method returns the first argument provided to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.identity(object) === object;
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * Adds function properties of a source object to the destination object.
     * If `object` is a function methods will be added to its prototype as well.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Function|Object} [object=lodash] object The destination object.
     * @param {Object} source The object of functions to add.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.chain=true] Specify whether the functions added are chainable.
     * @example
     *
     * function capitalize(string) {
     *   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
     * }
     *
     * _.mixin({ 'capitalize': capitalize });
     * _.capitalize('fred');
     * // => 'Fred'
     *
     * _('fred').capitalize().value();
     * // => 'Fred'
     *
     * _.mixin({ 'capitalize': capitalize }, { 'chain': false });
     * _('fred').capitalize();
     * // => 'Fred'
     */
    function mixin(object, source, options) {
      var chain = true,
          methodNames = source && functions(source);

      if (!source || (!options && !methodNames.length)) {
        if (options == null) {
          options = source;
        }
        ctor = lodashWrapper;
        source = object;
        object = lodash;
        methodNames = functions(source);
      }
      if (options === false) {
        chain = false;
      } else if (isObject(options) && 'chain' in options) {
        chain = options.chain;
      }
      var ctor = object,
          isFunc = isFunction(ctor);

      forEach(methodNames, function(methodName) {
        var func = object[methodName] = source[methodName];
        if (isFunc) {
          ctor.prototype[methodName] = function() {
            var chainAll = this.__chain__,
                value = this.__wrapped__,
                args = [value];

            push.apply(args, arguments);
            var result = func.apply(object, args);
            if (chain || chainAll) {
              if (value === result && isObject(result)) {
                return this;
              }
              result = new ctor(result);
              result.__chain__ = chainAll;
            }
            return result;
          };
        }
      });
    }

    /**
     * Reverts the '_' variable to its previous value and returns a reference to
     * the `lodash` function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @returns {Function} Returns the `lodash` function.
     * @example
     *
     * var lodash = _.noConflict();
     */
    function noConflict() {
      context._ = oldDash;
      return this;
    }

    /**
     * A no-operation function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.noop(object) === undefined;
     * // => true
     */
    function noop() {
      // no operation performed
    }

    /**
     * Gets the number of milliseconds that have elapsed since the Unix epoch
     * (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var stamp = _.now();
     * _.defer(function() { console.log(_.now() - stamp); });
     * // => logs the number of milliseconds it took for the deferred function to be called
     */
    var now = isNative(now = Date.now) && now || function() {
      return new Date().getTime();
    };

    /**
     * Converts the given value into an integer of the specified radix.
     * If `radix` is `undefined` or `0` a `radix` of `10` is used unless the
     * `value` is a hexadecimal, in which case a `radix` of `16` is used.
     *
     * Note: This method avoids differences in native ES3 and ES5 `parseInt`
     * implementations. See http://es5.github.io/#E.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} value The value to parse.
     * @param {number} [radix] The radix used to interpret the value to parse.
     * @returns {number} Returns the new integer value.
     * @example
     *
     * _.parseInt('08');
     * // => 8
     */
    var parseInt = nativeParseInt(whitespace + '08') == 8 ? nativeParseInt : function(value, radix) {
      // Firefox < 21 and Opera < 15 follow the ES3 specified implementation of `parseInt`
      return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, '') : value, radix || 0);
    };

    /**
     * Creates a "_.pluck" style function, which returns the `key` value of a
     * given object.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} key The name of the property to retrieve.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var characters = [
     *   { 'name': 'fred',   'age': 40 },
     *   { 'name': 'barney', 'age': 36 }
     * ];
     *
     * var getName = _.property('name');
     *
     * _.map(characters, getName);
     * // => ['barney', 'fred']
     *
     * _.sortBy(characters, getName);
     * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
     */
    function property(key) {
      return function(object) {
        return object[key];
      };
    }

    /**
     * Produces a random number between `min` and `max` (inclusive). If only one
     * argument is provided a number between `0` and the given number will be
     * returned. If `floating` is truey or either `min` or `max` are floats a
     * floating-point number will be returned instead of an integer.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} [min=0] The minimum possible value.
     * @param {number} [max=1] The maximum possible value.
     * @param {boolean} [floating=false] Specify returning a floating-point number.
     * @returns {number} Returns a random number.
     * @example
     *
     * _.random(0, 5);
     * // => an integer between 0 and 5
     *
     * _.random(5);
     * // => also an integer between 0 and 5
     *
     * _.random(5, true);
     * // => a floating-point number between 0 and 5
     *
     * _.random(1.2, 5.2);
     * // => a floating-point number between 1.2 and 5.2
     */
    function random(min, max, floating) {
      var noMin = min == null,
          noMax = max == null;

      if (floating == null) {
        if (typeof min == 'boolean' && noMax) {
          floating = min;
          min = 1;
        }
        else if (!noMax && typeof max == 'boolean') {
          floating = max;
          noMax = true;
        }
      }
      if (noMin && noMax) {
        max = 1;
      }
      min = +min || 0;
      if (noMax) {
        max = min;
        min = 0;
      } else {
        max = +max || 0;
      }
      if (floating || min % 1 || max % 1) {
        var rand = nativeRandom();
        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand +'').length - 1)))), max);
      }
      return baseRandom(min, max);
    }

    /**
     * Resolves the value of property `key` on `object`. If `key` is a function
     * it will be invoked with the `this` binding of `object` and its result returned,
     * else the property value is returned. If `object` is falsey then `undefined`
     * is returned.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to resolve.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = {
     *   'cheese': 'crumpets',
     *   'stuff': function() {
     *     return 'nonsense';
     *   }
     * };
     *
     * _.result(object, 'cheese');
     * // => 'crumpets'
     *
     * _.result(object, 'stuff');
     * // => 'nonsense'
     */
    function result(object, key) {
      if (object) {
        var value = object[key];
        return isFunction(value) ? object[key]() : value;
      }
    }

    /**
     * A micro-templating method that handles arbitrary delimiters, preserves
     * whitespace, and correctly escapes quotes within interpolated code.
     *
     * Note: In the development build, `_.template` utilizes sourceURLs for easier
     * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
     *
     * For more information on precompiling templates see:
     * https://lodash.com/custom-builds
     *
     * For more information on Chrome extension sandboxes see:
     * http://developer.chrome.com/stable/extensions/sandboxingEval.html
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} text The template text.
     * @param {Object} data The data object used to populate the text.
     * @param {Object} [options] The options object.
     * @param {RegExp} [options.escape] The "escape" delimiter.
     * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
     * @param {Object} [options.imports] An object to import into the template as local variables.
     * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
     * @param {string} [sourceURL] The sourceURL of the template's compiled source.
     * @param {string} [variable] The data object variable name.
     * @returns {Function|string} Returns a compiled function when no `data` object
     *  is given, else it returns the interpolated text.
     * @example
     *
     * // using the "interpolate" delimiter to create a compiled template
     * var compiled = _.template('hello <%= name %>');
     * compiled({ 'name': 'fred' });
     * // => 'hello fred'
     *
     * // using the "escape" delimiter to escape HTML in data property values
     * _.template('<b><%- value %></b>', { 'value': '<script>' });
     * // => '<b>&lt;script&gt;</b>'
     *
     * // using the "evaluate" delimiter to generate HTML
     * var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the ES6 delimiter as an alternative to the default "interpolate" delimiter
     * _.template('hello ${ name }', { 'name': 'pebbles' });
     * // => 'hello pebbles'
     *
     * // using the internal `print` function in "evaluate" delimiters
     * _.template('<% print("hello " + name); %>!', { 'name': 'barney' });
     * // => 'hello barney!'
     *
     * // using a custom template delimiters
     * _.templateSettings = {
     *   'interpolate': /{{([\s\S]+?)}}/g
     * };
     *
     * _.template('hello {{ name }}!', { 'name': 'mustache' });
     * // => 'hello mustache!'
     *
     * // using the `imports` option to import jQuery
     * var list = '<% jq.each(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] }, { 'imports': { 'jq': jQuery } });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the `sourceURL` option to specify a custom sourceURL for the template
     * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });
     * compiled(data);
     * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
     *
     * // using the `variable` option to ensure a with-statement isn't used in the compiled template
     * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });
     * compiled.source;
     * // => function(data) {
     *   var __t, __p = '', __e = _.escape;
     *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';
     *   return __p;
     * }
     *
     * // using the `source` property to inline compiled templates for meaningful
     * // line numbers in error messages and a stack trace
     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
     *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
     * ');
     */
    function template(text, data, options) {
      // based on John Resig's `tmpl` implementation
      // http://ejohn.org/blog/javascript-micro-templating/
      // and Laura Doktorova's doT.js
      // https://github.com/olado/doT
      var settings = lodash.templateSettings;
      text = String(text || '');

      // avoid missing dependencies when `iteratorTemplate` is not defined
      options = defaults({}, options, settings);

      var imports = defaults({}, options.imports, settings.imports),
          importsKeys = keys(imports),
          importsValues = values(imports);

      var isEvaluating,
          index = 0,
          interpolate = options.interpolate || reNoMatch,
          source = "__p += '";

      // compile the regexp to match each delimiter
      var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
      , 'g');

      text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);

        // escape characters that cannot be included in string literals
        source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);

        // replace delimiters with snippets
        if (escapeValue) {
          source += "' +\n__e(" + escapeValue + ") +\n'";
        }
        if (evaluateValue) {
          isEvaluating = true;
          source += "';\n" + evaluateValue + ";\n__p += '";
        }
        if (interpolateValue) {
          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
        }
        index = offset + match.length;

        // the JS engine embedded in Adobe products requires returning the `match`
        // string in order to produce the correct `offset` value
        return match;
      });

      source += "';\n";

      // if `variable` is not specified, wrap a with-statement around the generated
      // code to add the data object to the top of the scope chain
      var variable = options.variable,
          hasVariable = variable;

      if (!hasVariable) {
        variable = 'obj';
        source = 'with (' + variable + ') {\n' + source + '\n}\n';
      }
      // cleanup code by stripping empty strings
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');

      // frame code as the function body
      source = 'function(' + variable + ') {\n' +
        (hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') +
        "var __t, __p = '', __e = _.escape" +
        (isEvaluating
          ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
          : ';\n'
        ) +
        source +
        'return __p\n}';

      // Use a sourceURL for easier debugging.
      // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
      var sourceURL = '\n/*\n//# sourceURL=' + (options.sourceURL || '/lodash/template/source[' + (templateCounter++) + ']') + '\n*/';

      try {
        var result = Function(importsKeys, 'return ' + source + sourceURL).apply(undefined, importsValues);
      } catch(e) {
        e.source = source;
        throw e;
      }
      if (data) {
        return result(data);
      }
      // provide the compiled function's source by its `toString` method, in
      // supported environments, or the `source` property as a convenience for
      // inlining compiled templates during the build process
      result.source = source;
      return result;
    }

    /**
     * Executes the callback `n` times, returning an array of the results
     * of each callback execution. The callback is bound to `thisArg` and invoked
     * with one argument; (index).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} n The number of times to execute the callback.
     * @param {Function} callback The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns an array of the results of each `callback` execution.
     * @example
     *
     * var diceRolls = _.times(3, _.partial(_.random, 1, 6));
     * // => [3, 6, 4]
     *
     * _.times(3, function(n) { mage.castSpell(n); });
     * // => calls `mage.castSpell(n)` three times, passing `n` of `0`, `1`, and `2` respectively
     *
     * _.times(3, function(n) { this.cast(n); }, mage);
     * // => also calls `mage.castSpell(n)` three times
     */
    function times(n, callback, thisArg) {
      n = (n = +n) > -1 ? n : 0;
      var index = -1,
          result = Array(n);

      callback = baseCreateCallback(callback, thisArg, 1);
      while (++index < n) {
        result[index] = callback(index);
      }
      return result;
    }

    /**
     * The inverse of `_.escape` this method converts the HTML entities
     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to their
     * corresponding characters.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to unescape.
     * @returns {string} Returns the unescaped string.
     * @example
     *
     * _.unescape('Fred, Barney &amp; Pebbles');
     * // => 'Fred, Barney & Pebbles'
     */
    function unescape(string) {
      return string == null ? '' : String(string).replace(reEscapedHtml, unescapeHtmlChar);
    }

    /**
     * Generates a unique ID. If `prefix` is provided the ID will be appended to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} [prefix] The value to prefix the ID with.
     * @returns {string} Returns the unique ID.
     * @example
     *
     * _.uniqueId('contact_');
     * // => 'contact_104'
     *
     * _.uniqueId();
     * // => '105'
     */
    function uniqueId(prefix) {
      var id = ++idCounter;
      return String(prefix == null ? '' : prefix) + id;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object that wraps the given value with explicit
     * method chaining enabled.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to wrap.
     * @returns {Object} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'pebbles', 'age': 1 }
     * ];
     *
     * var youngest = _.chain(characters)
     *     .sortBy('age')
     *     .map(function(chr) { return chr.name + ' is ' + chr.age; })
     *     .first()
     *     .value();
     * // => 'pebbles is 1'
     */
    function chain(value) {
      value = new lodashWrapper(value);
      value.__chain__ = true;
      return value;
    }

    /**
     * Invokes `interceptor` with the `value` as the first argument and then
     * returns `value`. The purpose of this method is to "tap into" a method
     * chain in order to perform operations on intermediate results within
     * the chain.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @returns {*} Returns `value`.
     * @example
     *
     * _([1, 2, 3, 4])
     *  .tap(function(array) { array.pop(); })
     *  .reverse()
     *  .value();
     * // => [3, 2, 1]
     */
    function tap(value, interceptor) {
      interceptor(value);
      return value;
    }

    /**
     * Enables explicit method chaining on the wrapper object.
     *
     * @name chain
     * @memberOf _
     * @category Chaining
     * @returns {*} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // without explicit chaining
     * _(characters).first();
     * // => { 'name': 'barney', 'age': 36 }
     *
     * // with explicit chaining
     * _(characters).chain()
     *   .first()
     *   .pick('age')
     *   .value();
     * // => { 'age': 36 }
     */
    function wrapperChain() {
      this.__chain__ = true;
      return this;
    }

    /**
     * Produces the `toString` result of the wrapped value.
     *
     * @name toString
     * @memberOf _
     * @category Chaining
     * @returns {string} Returns the string result.
     * @example
     *
     * _([1, 2, 3]).toString();
     * // => '1,2,3'
     */
    function wrapperToString() {
      return String(this.__wrapped__);
    }

    /**
     * Extracts the wrapped value.
     *
     * @name valueOf
     * @memberOf _
     * @alias value
     * @category Chaining
     * @returns {*} Returns the wrapped value.
     * @example
     *
     * _([1, 2, 3]).valueOf();
     * // => [1, 2, 3]
     */
    function wrapperValueOf() {
      return this.__wrapped__;
    }

    /*--------------------------------------------------------------------------*/

    // add functions that return wrapped values when chaining
    lodash.after = after;
    lodash.assign = assign;
    lodash.at = at;
    lodash.bind = bind;
    lodash.bindAll = bindAll;
    lodash.bindKey = bindKey;
    lodash.chain = chain;
    lodash.compact = compact;
    lodash.compose = compose;
    lodash.constant = constant;
    lodash.countBy = countBy;
    lodash.create = create;
    lodash.createCallback = createCallback;
    lodash.curry = curry;
    lodash.debounce = debounce;
    lodash.defaults = defaults;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.difference = difference;
    lodash.filter = filter;
    lodash.flatten = flatten;
    lodash.forEach = forEach;
    lodash.forEachRight = forEachRight;
    lodash.forIn = forIn;
    lodash.forInRight = forInRight;
    lodash.forOwn = forOwn;
    lodash.forOwnRight = forOwnRight;
    lodash.functions = functions;
    lodash.groupBy = groupBy;
    lodash.indexBy = indexBy;
    lodash.initial = initial;
    lodash.intersection = intersection;
    lodash.invert = invert;
    lodash.invoke = invoke;
    lodash.keys = keys;
    lodash.map = map;
    lodash.mapValues = mapValues;
    lodash.max = max;
    lodash.memoize = memoize;
    lodash.merge = merge;
    lodash.min = min;
    lodash.omit = omit;
    lodash.once = once;
    lodash.pairs = pairs;
    lodash.partial = partial;
    lodash.partialRight = partialRight;
    lodash.pick = pick;
    lodash.pluck = pluck;
    lodash.property = property;
    lodash.pull = pull;
    lodash.range = range;
    lodash.reject = reject;
    lodash.remove = remove;
    lodash.rest = rest;
    lodash.shuffle = shuffle;
    lodash.sortBy = sortBy;
    lodash.tap = tap;
    lodash.throttle = throttle;
    lodash.times = times;
    lodash.toArray = toArray;
    lodash.transform = transform;
    lodash.union = union;
    lodash.uniq = uniq;
    lodash.values = values;
    lodash.where = where;
    lodash.without = without;
    lodash.wrap = wrap;
    lodash.xor = xor;
    lodash.zip = zip;
    lodash.zipObject = zipObject;

    // add aliases
    lodash.collect = map;
    lodash.drop = rest;
    lodash.each = forEach;
    lodash.eachRight = forEachRight;
    lodash.extend = assign;
    lodash.methods = functions;
    lodash.object = zipObject;
    lodash.select = filter;
    lodash.tail = rest;
    lodash.unique = uniq;
    lodash.unzip = zip;

    // add functions to `lodash.prototype`
    mixin(lodash);

    /*--------------------------------------------------------------------------*/

    // add functions that return unwrapped values when chaining
    lodash.clone = clone;
    lodash.cloneDeep = cloneDeep;
    lodash.contains = contains;
    lodash.escape = escape;
    lodash.every = every;
    lodash.find = find;
    lodash.findIndex = findIndex;
    lodash.findKey = findKey;
    lodash.findLast = findLast;
    lodash.findLastIndex = findLastIndex;
    lodash.findLastKey = findLastKey;
    lodash.has = has;
    lodash.identity = identity;
    lodash.indexOf = indexOf;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isBoolean = isBoolean;
    lodash.isDate = isDate;
    lodash.isElement = isElement;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isNaN = isNaN;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isPlainObject = isPlainObject;
    lodash.isRegExp = isRegExp;
    lodash.isString = isString;
    lodash.isUndefined = isUndefined;
    lodash.lastIndexOf = lastIndexOf;
    lodash.mixin = mixin;
    lodash.noConflict = noConflict;
    lodash.noop = noop;
    lodash.now = now;
    lodash.parseInt = parseInt;
    lodash.random = random;
    lodash.reduce = reduce;
    lodash.reduceRight = reduceRight;
    lodash.result = result;
    lodash.runInContext = runInContext;
    lodash.size = size;
    lodash.some = some;
    lodash.sortedIndex = sortedIndex;
    lodash.template = template;
    lodash.unescape = unescape;
    lodash.uniqueId = uniqueId;

    // add aliases
    lodash.all = every;
    lodash.any = some;
    lodash.detect = find;
    lodash.findWhere = find;
    lodash.foldl = reduce;
    lodash.foldr = reduceRight;
    lodash.include = contains;
    lodash.inject = reduce;

    mixin(function() {
      var source = {}
      forOwn(lodash, function(func, methodName) {
        if (!lodash.prototype[methodName]) {
          source[methodName] = func;
        }
      });
      return source;
    }(), false);

    /*--------------------------------------------------------------------------*/

    // add functions capable of returning wrapped and unwrapped values when chaining
    lodash.first = first;
    lodash.last = last;
    lodash.sample = sample;

    // add aliases
    lodash.take = first;
    lodash.head = first;

    forOwn(lodash, function(func, methodName) {
      var callbackable = methodName !== 'sample';
      if (!lodash.prototype[methodName]) {
        lodash.prototype[methodName]= function(n, guard) {
          var chainAll = this.__chain__,
              result = func(this.__wrapped__, n, guard);

          return !chainAll && (n == null || (guard && !(callbackable && typeof n == 'function')))
            ? result
            : new lodashWrapper(result, chainAll);
        };
      }
    });

    /*--------------------------------------------------------------------------*/

    /**
     * The semantic version number.
     *
     * @static
     * @memberOf _
     * @type string
     */
    lodash.VERSION = '2.4.2';

    // add "Chaining" functions to the wrapper
    lodash.prototype.chain = wrapperChain;
    lodash.prototype.toString = wrapperToString;
    lodash.prototype.value = wrapperValueOf;
    lodash.prototype.valueOf = wrapperValueOf;

    // add `Array` functions that return unwrapped values
    forEach(['join', 'pop', 'shift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        var chainAll = this.__chain__,
            result = func.apply(this.__wrapped__, arguments);

        return chainAll
          ? new lodashWrapper(result, chainAll)
          : result;
      };
    });

    // add `Array` functions that return the existing wrapped value
    forEach(['push', 'reverse', 'sort', 'unshift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        func.apply(this.__wrapped__, arguments);
        return this;
      };
    });

    // add `Array` functions that return new wrapped values
    forEach(['concat', 'slice', 'splice'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);
      };
    });

    return lodash;
  }

  /*--------------------------------------------------------------------------*/

  // expose Lo-Dash
  var _ = runInContext();

  // some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Lo-Dash to the global object even when an AMD loader is present in
    // case Lo-Dash is loaded with a RequireJS shim config.
    // See http://requirejs.org/docs/api.html#config-shim
    root._ = _;

    // define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module
    define(function() {
      return _;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Node.js or RingoJS
    if (moduleExports) {
      (freeModule.exports = _)._ = _;
    }
    // in Narwhal or Rhino -require
    else {
      freeExports._ = _;
    }
  }
  else {
    // in a browser or Rhino
    root._ = _;
  }
}.call(this));

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/lodash/dist/lodash.js","/../node_modules/lodash/dist")
},{"buffer":29,"pBGvAp":32}],32:[function(_dereq_,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,_dereq_("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/process/browser.js","/../node_modules/process")
},{"buffer":29,"pBGvAp":32}]},{},[26])
(26)
});