/**
 * Created by aifb on 06.04.16.
 */

var should = require('should');
var fs = require('fs');
var path = require('path');
var mime = require('mime-types');

var H = require('../hylar/core/Hylar');
var Hylar = new H();

describe('RDFSTORE FILTER', function () {
    it('should filter', function () {
        var data = fs.readFileSync(path.resolve(__dirname + '/ontologies/functionalities.jsonld')),
            extension = path.extname(path.resolve(__dirname + '/ontologies/functionalities.jsonld')),
            owl, query =
            'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
            'PREFIX asawoo: <http://localhost:3232/vocab#>' +
            'SELECT ?funct WHERE { ' +
            '{  ?funct rdf:type asawoo:Functionality ; ' +
            '          asawoo:isImplementedBy ?capab . ' +
            '   ?appliance asawoo:hasCapability ?capab . ' +
            '} UNION {' +
            '   ?funct rdf:type asawoo:Functionality ; ' +
            '          asawoo:isComposedOf ?functComposite . ' +
            '   ?functComposite asawoo:isImplementedBy ?capab . ' +
            '   ?appliance asawoo:hasCapability ?capab . ' +
            '} }';

        mimeType = mime.contentType(extension);
        if(mimeType) {
            mimeType = mimeType.replace(/;.*/g, '');
        }
        owl = data.toString().replace(/(&)([a-z0-9]+)(;)/gi, '$2:');

        return Hylar.load(owl, mimeType)
            .then(function() {
                return Hylar.query(query)
            })
            .then(function(r) {
                1;
            })
    });
});