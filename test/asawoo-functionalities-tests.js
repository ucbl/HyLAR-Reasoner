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
        var data = fs.readFileSync(path.resolve(__dirname + '/ontologies/modified_functionalities2.jsonld')),
            extension = path.extname(path.resolve(__dirname + '/ontologies/modified_functionalities2.jsonld')),
            owl, query =
            'PREFIX asawoo: <http://liris.cnrs.fr/asawoo/vocab#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT DISTINCT ?fun WHERE { ?fun asawoo:isComposedOf ?funComp . FILTER NOT EXISTS { ?funComp rdf:type asawoo:Functionality . } }';

        mimeType = mime.contentType(extension);
        if(mimeType) {
            mimeType = mimeType.replace(/;.*/g, '');
        }
        owl = data.toString().replace(/(&)([a-z0-9]+)(;)/gi, '$2:');

        return Hylar.load(owl, mimeType, 'tagBased')
            .then(function(r) {
                return Hylar.query(query);
            })
            .then(function(r) {
                r.length.should.equal(2)
                r[0]['fun']['value'].should.equal('http://liris.cnrs.fr/asawoo/functionality/temperatureRegulation')
                r[1]['fun']['value'].should.equal('http://liris.cnrs.fr/asawoo/functionality/temperatureRegulationBySMS')
            })
    });
});