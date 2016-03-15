/**
 * Created by Spadon on 17/10/2014.
 */
XSD = function() {
// ============================== XSD namespace ===============================

    var xsd = {};

    /** Contains the URIs of (some) datatypes of XML Schema. */
    xsd.DataTypes = {
        /** IRI of boolean data type. */
        BOOLEAN: 'http://www.w3.org/2001/XMLSchema#boolean',
        /** IRI of decimal data type. */
        DECIMAL: 'http://www.w3.org/2001/XMLSchema#decimal',
        /** IRI of a double data type. */
        DOUBLE: 'http://www.w3.org/2001/XMLSchema#double',
        /** IRI of a integer data type. */
        INTEGER: 'http://www.w3.org/2001/XMLSchema#integer',
        /** IRI of a string data type. */
        STRING: 'http://www.w3.org/2001/XMLSchema#string'
    };

    return xsd;
};

module.exports = {
    xsd: function() {
        return new XSD();
    }
};
