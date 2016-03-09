/**
* Created by Spadon on 17/10/2014.
*/

var Queue = require('./JswQueue'),
    PairStorage = require('./JswPairStorage'),
    TripleStorage = require('./JswTripleStorage'),
    TrimQueryABox = require('./JswTrimQueryABox'),
    JswOWL = require('./JswOWL'),
    JswRDF = require('./JswRDF'),
    JswOntology = require('./JswOntology'),
    OWL2RL = require('./OWL2RL'),
    Logics = require('./Logics/Logics'),
    ReasoningEngine = require('./ReasoningEngine');

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
    preTriplesImplicit = this.aBox.consequencesToTriples(preConsequences.fi, false);
    preTriplesExplicit = this.aBox.consequencesToTriples(preConsequences.fe, true);
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
