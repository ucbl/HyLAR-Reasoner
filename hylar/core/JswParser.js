/**
 * Created by Spadon on 14/10/2014.
 */

JswOWL = require('./JswOWL');
JswOntology = require('./JswOntology');
JswUtils = require('./JswUtils');
TextFile = require('./JswTextFile');

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
