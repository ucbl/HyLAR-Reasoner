/**
 * Created by Spadon on 14/10/2014.
 */

DOMParser = require('xmldom').DOMParser;

JswUtils = {

    /**
     * Parses string into the XML DOM object in a browser-independent way.
     * @param xml String containing the XML text to parse.
     * @return XML DOM object representing the parsed XML.
     */
    parseString: function (xml) {
        var xmlDoc;

        xml = this.trim(xml);
        xmlDoc = new DOMParser().parseFromString(xml, 'text/xml');

            if (xmlDoc.nodeName === 'parsererror') {
                throw xmlDoc.childNodes[0].nodeValue;
            } else if (xmlDoc.childNodes && xmlDoc.childNodes[0] &&
                xmlDoc.childNodes[0].childNodes &&
                xmlDoc.childNodes[0].childNodes[0] &&
                xmlDoc.childNodes[0].childNodes[0].nodeName === 'parsererror') {

                throw xmlDoc.childNodes[0].childNodes[0].childNodes[1].innerText;
            }

            return xmlDoc;
    },

    /**
     * Checks if the given string is a valid URL.
     * @param str String to check.
     * @return boolean : true if the given string is a URL, false otherwise.
     */
    isUrl: function (str) {
        var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
        return regexp.test(str);
    },

    /**
     * Removes space characters at the start and end of the given string.
     *
     * @param str String to trim.
     * @return New string with space characters removed from the start and the end.
     */
    trim: function (str) {
        return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }
};

module.exports = JswUtils;
