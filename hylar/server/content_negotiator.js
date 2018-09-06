const xml2js = require('xml2js')
const builder = new xml2js.Builder({ "rootName": "sparql" })

/**
 * Standard sparql xml tag attributes
 * @type {{xmlns: string, "xmlns:xsi": string, "xsi:schemaLocation": string}}
 */
let xmlSparqlAttributes = {
    "xmlns": "http://www.w3.org/2005/sparql-results#",
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "xsi:schemaLocation": "http://www.w3.org/2001/sw/DataAccess/rf1/result2.xsd"
}

/**
 * Accepted contents by hylar server
 * @type {{sparql_results_xml: string, sparql_results_json: string}}
 */
let acceptedContents = {
    sparql_results_xml: 'application/sparql-results+xml',
    sparql_results_json: 'application/sparql-results+json'
}

/**
 * Generates a brand new empty json object of sparql results
 * @returns {{head: {link: string[], vars: string[]}, results: {bindings: string[]}}}
 */
const generateJsonSparqlResults = () => {
    return {
        "head": {
            "link": [''],
            "vars": ['']
        },
        "results": {
            "bindings": ['']
        }
    }
}

module.exports = {
    /**
     * Sends
     * @param clientHttpRequest: The original request received from the controller
     * @param httpResponse: The response, with expected content type, sent back to the client
     */
    answerSparqlWithContentNegotiation: function(clientHttpRequest, httpResponse, additionalParams = { hylar_meta: {}, response: {}}) {
        let sparqlJson = generateJsonSparqlResults()

        // Build results as W3C sparql result standardization
        if (additionalParams.results.length > 0) {
            sparqlJson.head.vars = Object.keys(additionalParams.results[0])
            sparqlJson.results.bindings = additionalParams.results
        }

        // Content negotiation
        if (clientHttpRequest.accepts('application/sparql-results+xml')) {

            // Deal with sparql results xml
            let xmlVariables = [], xmlResults = []
            // Provide sparql xml tag
            sparqlJson.$ = xmlSparqlAttributes

            // Prepare head
            sparqlJson.head.vars.forEach(_var => {
                if (_var.length != '') {
                    xmlVariables.push({
                        $: {name: _var}
                    })
                }
            })

            // Prepare sparql results
            sparqlJson.results.bindings.forEach(binding => {
                let xmlBindings = []
                sparqlJson.head.vars.forEach(_var => {
                    if (binding.hasOwnProperty(_var)) {
                        let xmlBinding = {
                            binding: {
                                $: { name: _var }
                            }
                        }
                        xmlBinding.binding[binding[_var]["token"]] = binding[_var]["value"]
                        xmlBindings.push(xmlBinding)
                    }
                })
                if (xmlBindings.length > 0) xmlResults.push(xmlBindings)
            })


            // Apply vars
            delete sparqlJson.head.vars
            if (xmlVariables.length > 0) sparqlJson.head.variable = xmlVariables
            // Apply results
            sparqlJson.results = {
                $: {
                    distinct: false,
                    ordered: true
                }
            }
            if (xmlResults.length > 0) sparqlJson.results.result = xmlResults

            // Send response to client
            httpResponse.set('Content-Type', acceptedContents.sparql_results_xml)
            httpResponse.send(builder.buildObject(sparqlJson));
        } else {
            // Default is sparql json
            httpResponse.set('Content-Type', 'application/sparql-results+json');
            httpResponse.send(sparqlJson);
        }
    }
}