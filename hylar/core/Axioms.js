const ParsingInterface = require('./ParsingInterface')

class Axioms {
    constructor() {
        this.rdfs = `
            <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .
            <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
            <http://www.w3.org/2000/01/rdf-schema#range> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
            <http://www.w3.org/2000/01/rdf-schema#subPropertyOf> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
            <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Class> .
            <http://www.w3.org/1999/02/22-rdf-syntax-ns#subject> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement> .
            <http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement> .
            <http://www.w3.org/1999/02/22-rdf-syntax-ns#object> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement> .
            <http://www.w3.org/2000/01/rdf-schema#member> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> . 
            <http://www.w3.org/1999/02/22-rdf-syntax-ns#first> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/1999/02/22-rdf-syntax-ns#List> .
            <http://www.w3.org/1999/02/22-rdf-syntax-ns#rest> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/1999/02/22-rdf-syntax-ns#List> .
            <http://www.w3.org/2000/01/rdf-schema#seeAlso> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .
            <http://www.w3.org/2000/01/rdf-schema#isDefinedBy> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .
            <http://www.w3.org/2000/01/rdf-schema#comment> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .
            <http://www.w3.org/2000/01/rdf-schema#label> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .
            <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .
            
            <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#range> <http://www.w3.org/2000/01/rdf-schema#Class> .
            <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#range> <http://www.w3.org/2000/01/rdf-schema#Class> .
            <http://www.w3.org/2000/01/rdf-schema#range> <http://www.w3.org/2000/01/rdf-schema#range> <http://www.w3.org/2000/01/rdf-schema#Class> .
            <http://www.w3.org/2000/01/rdf-schema#subPropertyOf> <http://www.w3.org/2000/01/rdf-schema#range> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
            <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://www.w3.org/2000/01/rdf-schema#range> <http://www.w3.org/2000/01/rdf-schema#Class> .
            <http://www.w3.org/1999/02/22-rdf-syntax-ns#subject> <http://www.w3.org/2000/01/rdf-schema#range> <http://www.w3.org/2000/01/rdf-schema#Resource> .
            <http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate> <http://www.w3.org/2000/01/rdf-schema#range> <http://www.w3.org/2000/01/rdf-schema#Resource> .
            <http://www.w3.org/1999/02/22-rdf-syntax-ns#object> <http://www.w3.org/2000/01/rdf-schema#range> <http://www.w3.org/2000/01/rdf-schema#Resource> .
            <http://www.w3.org/2000/01/rdf-schema#member> <http://www.w3.org/2000/01/rdf-schema#range> <http://www.w3.org/2000/01/rdf-schema#Resource> .
            <http://www.w3.org/1999/02/22-rdf-syntax-ns#first> <http://www.w3.org/2000/01/rdf-schema#range> <http://www.w3.org/2000/01/rdf-schema#Resource> .
            <http://www.w3.org/1999/02/22-rdf-syntax-ns#rest> <http://www.w3.org/2000/01/rdf-schema#range> <http://www.w3.org/1999/02/22-rdf-syntax-ns#List> .
            <http://www.w3.org/2000/01/rdf-schema#seeAlso> <http://www.w3.org/2000/01/rdf-schema#range> <http://www.w3.org/2000/01/rdf-schema#Resource> .
            <http://www.w3.org/2000/01/rdf-schema#isDefinedBy> <http://www.w3.org/2000/01/rdf-schema#range> <http://www.w3.org/2000/01/rdf-schema#Resource> .
            <http://www.w3.org/2000/01/rdf-schema#comment> <http://www.w3.org/2000/01/rdf-schema#range> <http://www.w3.org/2000/01/rdf-schema#Literal> .
            <http://www.w3.org/2000/01/rdf-schema#label> <http://www.w3.org/2000/01/rdf-schema#range> <http://www.w3.org/2000/01/rdf-schema#Literal> .
            <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> <http://www.w3.org/2000/01/rdf-schema#range> <http://www.w3.org/2000/01/rdf-schema#Resource> .
            
            <http://www.w3.org/1999/02/22-rdf-syntax-ns#Alt> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://www.w3.org/2000/01/rdf-schema#Container> .
            <http://www.w3.org/1999/02/22-rdf-syntax-ns#Bag> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://www.w3.org/2000/01/rdf-schema#Container> .
            <http://www.w3.org/1999/02/22-rdf-syntax-ns#Seq> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://www.w3.org/2000/01/rdf-schema#Container> .
            <http://www.w3.org/2000/01/rdf-schema#ContainerMembershipProperty> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
            
            <http://www.w3.org/2000/01/rdf-schema#isDefinedBy> <http://www.w3.org/2000/01/rdf-schema#subPropertyOf> <http://www.w3.org/2000/01/rdf-schema#seeAlso> .
            
            <http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Datatype> .
            <http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://www.w3.org/2000/01/rdf-schema#Literal> . 
            <http://www.w3.org/2000/01/rdf-schema#Datatype> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://www.w3.org/2000/01/rdf-schema#Class> .
        `
    }

    getAxioms(entailment) {
        let axioms = []
        if (this.hasOwnProperty(entailment)) {
            axioms = ParsingInterface.turtleToFacts(this[entailment]).map((axiom) => {
                axiom.isAxiom = true;
                return axiom
            })
        }
        return axioms
    }
}

module.exports = new Axioms();
