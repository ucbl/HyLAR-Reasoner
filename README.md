# HyLAR-server- # 

HyLAR-server- is a server-side OWL 2 RL reasoner that uses [JSW and OWLReasoner](https://code.google.com/p/owlreasoner/) as a triplestore and provides an additional incremental reasoning engine. The full implementation of HyLAR is available [here](https://github.com/ucbl/HyLAR).

## Getting started ##

Install each necessary package first

`npm install`

Run HyLAR (initial port: 3000)

`node hylar/hylar.js`

## Usage ##

Once HyLAR is launched, it can be requested as follows:

(GET) `/classify`
> Parameters
`filename` (the absolute path of the ontology file to be processed)

Parses and classify an ontology (RDF/XML). Supports Classes, ObjectProperties and DatatypeProperties. This step has to be done before sending any SPARQL query (but only once, as the reasoner instance is kept in-memory).

(GET) `/query`
> Parameters
`query` (the SPARQL query string)

Processes a SPARQL query on the reasoner. Supports SELECT, INSERT, DELETE queries as well as NAMED GRAPHS.
