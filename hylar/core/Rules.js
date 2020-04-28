/**
 * Created by MT on 17/09/2015.
 */

/**
 * @author Mehdi Terdjimi
 * @type {{rules: *[]}}
 */

const Logics = require('./Logics/Logics')
const Rule = require('./Logics/Rule')

Rules = {
    rdfs: Logics.parseRules([
        "rdf1 = (?uuu ?aaa ?yyy) -> (?aaa rdf:type rdf:Property)",
        "rdfs2 = (?aaa rdfs:domain ?xxx) ^ (?uuu ?aaa ?yyy) -> (?uuu rdf:type ?xxx)",
        "rdfs3 = (?aaa rdfs:range ?xxx) ^ (?uuu ?aaa ?vvv) -> (?vvv rdf:type ?xxx)",
        "rdfs4a = (?uuu ?aaa ?xxx) -> (?uuu rdf:type rdfs:Resource)",
        "rdfs4b = (?uuu ?aaa ?vvv) -> (?vvv rdf:type rdfs:Resource)",
        "rdfs5 = (?uuu rdfs:subPropertyOf ?vvv) ^ (?vvv rdfs:subPropertyOf ?xxx) -> (?uuu rdfs:subPropertyOf ?xxx)",
        "rdfs6 = (?uuu rdf:type rdf:Property) -> (?uuu rdfs:subPropertyOf ?uuu)",
        "rdfs7 = (?aaa rdfs:subPropertyOf ?bbb) ^ (?uuu ?aaa ?yyy) -> (?uuu ?bbb ?yyy)",
        "rdfs8 = (?uuu rdf:type rdfs:Class) -> (?uuu rdfs:subClassOf rdfs:Resource)",
        "rdfs9 = (?uuu rdfs:subClassOf ?xxx) ^ (?vvv rdf:type ?uuu) -> (?vvv rdf:type ?xxx)",
        "rdfs10 = (?uuu rdf:type rdfs:Class) -> (?uuu rdfs:subClassOf ?uuu)",
        "rdfs11 = (?uuu rdfs:subClassOf ?vvv) ^ (?vvv rdfs:subClassOf ?xxx) -> (?uuu rdfs:subClassOf ?xxx)",
        "rdfs12 = (?uuu rdf:type rdfs:ContainerMembershipProperty) -> (?uuu rdfs:subPropertyOf rdfs:member)",
        "rdfs13 = (?uuu rdf:type rdfs:Datatype) -> (?uuu rdfs:subClassOf rdfs:Literal)"
    ], Rule.types.RDFS),
    owl2rl: Logics.parseRules([
        "prp-dom = (?p http://www.w3.org/2000/01/rdf-schema#domain ?c) ^ (?x ?p ?y) -> (?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c)",
        "prp-rng = (?p http://www.w3.org/2000/01/rdf-schema#range ?c) ^ (?x ?p ?y) -> (?y http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c)",
        "prp-fp = (?p http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://www.w3.org/2002/07/owl#FunctionalProperty) ^ (?x ?p ?y1) ^ (?x ?p ?y2) -> (?y1 http://www.w3.org/2002/07/owl#sameAs ?y2)",
        "prp-ifp = (?p http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://www.w3.org/2002/07/owl#InverseFunctionalProperty) ^ (?x1 ?p ?y) ^ (?x2 ?p ?y) -> (?x1 http://www.w3.org/2002/07/owl#sameAs ?x2)",
        "prp-irp = (?p http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://www.w3.org/2002/07/owl#IrreflexiveProperty) ^ (?x ?p ?x) -> false",
        "prp-symp = (?p http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://www.w3.org/2002/07/owl#SymmetricProperty) ^ (?x ?p ?y) -> (?y ?p ?x)",
        "prp-asyp = (?p http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://www.w3.org/2002/07/owl#AsymmetricProperty) ^ (?x ?p ?y) ^ (?y ?p ?x) -> false",
        "prp-trp = (?p http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://www.w3.org/2002/07/owl#TransitiveProperty) ^ (?x ?p ?y) ^ (?y ?p ?z) -> (?x ?p ?z)",
        "prp-spo1 = (?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p2) ^ (?x ?p1 ?y) -> (?x ?p2 ?y)",
        "prp-spo2 = (?x ?p1 ?y) ^ (?p2 http://www.w3.org/2002/07/owl#propertyChainAxiom ?n) ^ (?n http://www.w3.org/1999/02/22-rdf-syntax-ns#first ?p1) ^ (?n http://www.w3.org/1999/02/22-rdf-syntax-ns#rest ?n2) ^ (?n2 http://www.w3.org/1999/02/22-rdf-syntax-ns#first ?p2) ^ (?y ?p2 ?z) -> (?x ?p2 ?z)",
        "prp-eqp1 = (?p1 http://www.w3.org/2002/07/owl#equivalentProperty ?p2) ^ (?x ?p1 ?y) -> (?x ?p2 ?y)",
        "prp-eqp2 = (?p1 http://www.w3.org/2002/07/owl#equivalentProperty ?p2) ^ (?x ?p2 ?y) -> (?x ?p1 ?y)",
        "prp-pdw = (?p1 http://www.w3.org/2002/07/owl#propertyDisjointWith ?p2) ^ (?x ?p1 ?y) ^ (?x ?p2 ?y) -> false",
        "prp-inv1 = (?p1 http://www.w3.org/2002/07/owl#inverseOf ?p2) ^ (?x ?p1 ?y) -> (?y ?p2 ?x)",
        "prp-inv2 = (?p1 http://www.w3.org/2002/07/owl#inverseOf ?p2) ^ (?x ?p2 ?y) -> (?y ?p1 ?x)",
        "prp-npa1 = (?x http://www.w3.org/2002/07/owl#sourceIndividual ?i1) ^ (?x http://www.w3.org/2002/07/owl#assertionProperty ?p) ^ (?x http://www.w3.org/2002/07/owl#targetIndividual ?i2) ^ (?i1 ?p ?i2) -> false",
        "prp-npa2 = (?x http://www.w3.org/2002/07/owl#sourceIndividual ?i) ^ (?x http://www.w3.org/2002/07/owl#assertionProperty ?p) ^ (?x http://www.w3.org/2002/07/owl#targetValue ?lt) ^ (?i ?p ?lt) -> false",
        "cls-nothing2 = (?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://www.w3.org/2002/07/owl#Nothing) -> false",
        "cls-com = (?c1 http://www.w3.org/2002/07/owl#complementOf ?c2) ^ (?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c1) ^ (?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c2) -> false",
        "cls-svf1 = (?x http://www.w3.org/2002/07/owl#someValuesFrom ?y) ^ (?x http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?u ?p ?v) ^ (?v http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?y) -> (?u http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?x)",
        "cls-svf2 = (?x http://www.w3.org/2002/07/owl#someValuesFrom http://www.w3.org/2002/07/owl#Thing) ^ (?x http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?u ?p ?v) -> (?u http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?x)",
        "cls-avf = (?x http://www.w3.org/2002/07/owl#allValuesFrom ?y) ^ (?x http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?u http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?x) ^ (?u ?p ?v) -> (?v http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?y)",
        "cls-hv1 = (?x http://www.w3.org/2002/07/owl#hasValue ?y) ^ (?x http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?u http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?x) -> (?u ?p ?y)",
        "cls-hv2 = (?x http://www.w3.org/2002/07/owl#hasValue ?y) ^ (?x http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?u ?p ?y) -> (?u http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?x)",
        "cls-maxc1 = (?x http://www.w3.org/2002/07/owl#maxCardinality \"0\"^^xsd:nonNegativeInteger) ^ (?x http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?u http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?x) ^ (?u ?p ?y) -> false",
        "cls-maxc2 = (?x http://www.w3.org/2002/07/owl#maxCardinality \"1\"^^xsd:nonNegativeInteger) ^ (?x http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?u http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?x) ^ (?u ?p ?y1) ^ (?u ?p ?y2) -> (?y1 http://www.w3.org/2002/07/owl#sameAs ?y2)",
        "cls-maxqc1 = (?x http://www.w3.org/2002/07/owl#maxQualifiedCardinality \"0\"^^xsd:nonNegativeInteger) ^ (?x http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?x http://www.w3.org/2002/07/owl#onClass ?c) ^ (?u http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?x) ^ (?u ?p ?y) ^ (?y http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c) -> false",
        "cls-maxqc2 = (?x http://www.w3.org/2002/07/owl#maxQualifiedCardinality \"0\"^^xsd:nonNegativeInteger) ^ (?x http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?x http://www.w3.org/2002/07/owl#onClass http://www.w3.org/2002/07/owl#Thing) ^ (?u http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?x) ^ (?u ?p ?y) -> false",
        "cls-maxqc3 = (?x http://www.w3.org/2002/07/owl#maxQualifiedCardinality \"1\"^^xsd:nonNegativeInteger) ^ (?x http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?x http://www.w3.org/2002/07/owl#onClass ?c) ^ (?u http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?x) ^ (?u ?p ?y1) ^ (?y1 http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c) ^ (?u ?p ?y2) ^ (?y2 http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c) -> (?y1 http://www.w3.org/2002/07/owl#sameAs ?y2)",
        "cls-maxqc4 = (?x http://www.w3.org/2002/07/owl#maxQualifiedCardinality \"1\"^^xsd:nonNegativeInteger) ^ (?x http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?x http://www.w3.org/2002/07/owl#onClass http://www.w3.org/2002/07/owl#Thing) ^ (?u http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?x) ^ (?u ?p ?y1) ^ (?u ?p ?y2) -> (?y1 http://www.w3.org/2002/07/owl#sameAs ?y2)",
        "cax-sco = (?c1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c2) ^ (?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c1) -> (?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c2)",
        "cax-eqc1 = (?c1 http://www.w3.org/2002/07/owl#equivalentClass ?c2) ^ (?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c1) -> (?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c2)",
        "cax-eqc2 = (?c1 http://www.w3.org/2002/07/owl#equivalentClass ?c2) ^ (?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c2) -> (?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c1)",
        "cax-dw = (?c1 http://www.w3.org/2002/07/owl#disjointWith ?c2) ^ (?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c1) ^ (?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type ?c2) -> false",
        "scm-cls = (?c http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://www.w3.org/2002/07/owl#Class) -> (?c http://www.w3.org/2000/01/rdf-schema#subClassOf ?c) ^ (?c http://www.w3.org/2002/07/owl#equivalentClass ?c) ^ (?c http://www.w3.org/2000/01/rdf-schema#subClassOf http://www.w3.org/2002/07/owl#Thing) ^ (http://www.w3.org/2002/07/owl#Nothing http://www.w3.org/2000/01/rdf-schema#subClassOf ?c)",
        "scm-sco = (?c1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c2) ^ (?c2 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c3) -> (?c1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c3)",
        "scm-eqc1 = (?c1 http://www.w3.org/2002/07/owl#equivalentClass ?c2) -> (?c1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c2) ^ (?c2 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c1)",
        "scm-eqc2 = (?c1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c2) ^ (?c2 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c1) -> (?c1 http://www.w3.org/2002/07/owl#equivalentClass ?c2)",
        "scm-op = (?p http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://www.w3.org/2002/07/owl#ObjectProperty) -> (?p http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p) ^ (?p http://www.w3.org/2002/07/owl#equivalentProperty ?p)",
        "scm-dp = (?p http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://www.w3.org/2002/07/owl#DatatypeProperty) -> (?p http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p) ^ (?p http://www.w3.org/2002/07/owl#equivalentProperty ?p)",
        "scm-spo = (?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p2) ^ (?p2 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p3) -> (?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p3)",
        "scm-eqp1 = (?p1 http://www.w3.org/2002/07/owl#equivalentProperty ?p2) -> (?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p2) ^ (?p2 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p1)",
        "scm-eqp2 = (?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p2) ^ (?p2 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p1) -> (?p1 http://www.w3.org/2002/07/owl#equivalentProperty ?p2)",
        "scm-dom1 = (?p http://www.w3.org/2000/01/rdf-schema#domain ?c1) ^ (?c1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c2) -> (?p http://www.w3.org/2000/01/rdf-schema#domain ?c2)",
        "scm-dom2 = (?p2 http://www.w3.org/2000/01/rdf-schema#domain ?c) ^ (?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p2) -> (?p1 http://www.w3.org/2000/01/rdf-schema#domain ?c)",
        "scm-rng1 = (?p http://www.w3.org/2000/01/rdf-schema#range ?c1) ^ (?c1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c2) -> (?p http://www.w3.org/2000/01/rdf-schema#range ?c2)",
        "scm-rng2 = (?p2 http://www.w3.org/2000/01/rdf-schema#range ?c) ^ (?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p2) -> (?p1 http://www.w3.org/2000/01/rdf-schema#range ?c)",
        "scm-hv = (?c1 http://www.w3.org/2002/07/owl#hasValue ?i) ^ (?c1 http://www.w3.org/2002/07/owl#onProperty ?p1) ^ (?c2 http://www.w3.org/2002/07/owl#hasValue ?i) ^ (?c2 http://www.w3.org/2002/07/owl#onProperty ?p2) ^ (?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p2) -> (?c1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c2)",
        "scm-svf1 = (?c1 http://www.w3.org/2002/07/owl#someValuesFrom ?y1) ^ (?c1 http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?c2 http://www.w3.org/2002/07/owl#someValuesFrom ?y2) ^ (?c2 http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?y1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?y2) -> (?c1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c2)",
        "scm-svf2 = (?c1 http://www.w3.org/2002/07/owl#someValuesFrom ?y) ^ (?c1 http://www.w3.org/2002/07/owl#onProperty ?p1) ^ (?c2 http://www.w3.org/2002/07/owl#someValuesFrom ?y) ^ (?c2 http://www.w3.org/2002/07/owl#onProperty ?p2) ^ (?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p2) -> (?c1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c2)",
        "scm-avf1 = (?c1 http://www.w3.org/2002/07/owl#allValuesFrom ?y1) ^ (?c1 http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?c2 http://www.w3.org/2002/07/owl#allValuesFrom ?y2) ^ (?c2 http://www.w3.org/2002/07/owl#onProperty ?p) ^ (?y1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?y2) -> (?c1 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c2)",
        "scm-avf2 = (?c1 http://www.w3.org/2002/07/owl#allValuesFrom ?y) ^ (?c1 http://www.w3.org/2002/07/owl#onProperty ?p1) ^ (?c2 http://www.w3.org/2002/07/owl#allValuesFrom ?y) ^ (?c2 http://www.w3.org/2002/07/owl#onProperty ?p2) ^ (?p1 http://www.w3.org/2000/01/rdf-schema#subPropertyOf ?p2) -> (?c2 http://www.w3.org/2000/01/rdf-schema#subClassOf ?c1)"
    ], Rule.types.OWL2RL)
}

module.exports = Rules

