# Storage Manager

The Storage Manager is in charge of querying the triplestore for updates (from INSERT or DELETE queries) or selection (from SELECT or CONSTRUCT queries). It serves as an interface between the HyLAR main module and the triplestore (currently rdfstore.js).

## init ()

> **Params**
>   *none*

This method initializes the triplestore (required before any operation). It returns a promise, which is rejected if any error occurred at rdfstore side.

## loadRdfXml (*data*)

> **Params**
>   *data (RDF/XML-serialized ontology as a string)*

Allows loading an ontology with RDF/XML serialization. As rdfstore does not naturally allow it, it relies on the [Parsing Interface](#pars) to convert it in turtle format and load it afterwards. Returns a promise.