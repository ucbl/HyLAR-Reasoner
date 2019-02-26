/**
 * Created by mt on 23/11/2015.
 */

/**
 * Main prefixes used in the store.
 * @type {{OWL: string, RDF: string, RDFS: string, FIPA: string}}
 */

const RegularExpressions = require('./RegularExpressions')

class Prefixes {
    constructor() {
        this.counter = 0
        this.prefixes = {
            owl: 'http://www.w3.org/2002/07/owl#',
            rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
            rdfs: 'http://www.w3.org/2000/01/rdf-schema#'
        }
    }

    forgeCustomPrefix() {
        return `h${this.counter++}`
    }

    add(prefix, uri) {
        this.prefixes[prefix] = uri
    }

    get(prefix) {
        return this.prefixes.hasOwnProperty(prefix) ? this.prefixes[prefix] : `${prefix}:`
    }

    entries() {
        return this.prefixes
    }

    replacePrefixWithUri(prefixedUri, prefix) {
        return prefixedUri.replace(new RegExp(`^${prefix}:`), this.get(prefix))
    }

    registerPrefixFrom(fact) {
        let prefixedURIs = Object.values(this.prefixes)
        for (let triple of [fact.subject, fact.predicate, fact.object]) {
            if (!prefixedURIs.includes(triple)) {
                this.add(this.forgeCustomPrefix(), triple)
            }
        }
    }
}

module.exports = new Prefixes()