# Triple Storage Manager
*/core/TripleStorageManager.js*

The Triple Storage Manager is in charge of querying the triplestore for updates (from INSERT or DELETE queries) or selection (from SELECT or CONSTRUCT queries). It serves as an interface between the HyLAR main module and the triplestore (currently rdfstore.js).

## init ()

> **Params**
>   *none*

This method initializes the triplestore (required before any operation). It returns a promise, which is rejected if any error occurred at rdfstore side.

## loadRdfXml (*data*)

> **Params**
>   *data (RDF/XML-serialized ontology as a string)*

Allows loading an ontology with RDF/XML serialization. As rdfstore does not naturally allow it, it relies on the [Parsing Interface](#pars) to convert it in turtle format and load it afterwards. Returns a promise.

```[RDF/XML Ontology Loading]
let data = `
	<!-- Code: RDF/XML -->
	<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
		xmlns:feature="http://www.linkeddatatools.com/clothing-features#">
		<rdf:Description rdf:about="http://www.linkeddatatools.com/clothes#t-shirt">
			<feature:size>12</feature:size>
			<feature:color rdf:resource="http://www.linkeddatatools.com/colors#white"/>
		</rdf:Description>
	</rdf:RDF>
`;

let hylar = new Hylar();

function load(hylar, ontologyTxt) {
	return hylar.sm.loadRdfXml(ontologyTxt)
}

load(hylar, data)
	.then(function(done) {
		hylar.query('SELECT * { ?s ?p ?o }')
			.then(function(bindings) {
				alert(`Contains: ${bindings.length}`);
			});
	});
```

## query (*query*)

> **Params**
> *query (the actual SPARQL query to be executed)*

This method is called by HyLAR. It does not provide inferencing at this level, as it is a direct call to rdfstore *Store.execute()* method. Hence, its execution is straightforward, and works for any kind of SPARQL query currently supported by rdfstore.

```[INSERT and CONSTRUCT queries]
let hylar = new Hylar();

hylar.sm
	.query(`
		PREFIX ex: <http://example.com> 
		INSERT DATA { 
			ex:Lion a ex:Animal .
			ex:Julia a ex:Human .
		}
	`)
	.then(function(done) {
		alert(`Insert state: ${done}`);
		return hylar.sm
			.query(`
				PREFIX ex: <http://example.com>
				CONSTRUCT {
					?s a ex:LivingBeing .
				} WHERE {
					{
						?s a ex:Human .
					} UNION {
						?s a ex:Animal .
					}
				}
			`)			
	})
	.then(function(data) {
		alert(`Graph content: \n ${data.triples.toString()}`);
	});
```

## clear ()

> **Params**
> *none*

Clears the triplestore using a *DELETE WHERE { ?s ?p ?o }* SPARQL query.

## 

# Side Store Features

The side store allows generating a temporary triplestore to process scope-limited queries.


