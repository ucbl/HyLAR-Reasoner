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
