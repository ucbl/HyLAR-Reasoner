/**
 * Created by Spadon on 14/10/2014.
 */

JswUtils = require('./JswUtils');

/**
 * TextFile objects allow loading the text content of the file specified by the url.
 *
 * @param url URL of the text file.
 */
var TextFile = function (url) {
    var newUrl = JswUtils.trim(url);

    if (!JswUtils.trim(newUrl)) {
        throw '"' + url + '" is not a valid url for a text file!';
    }

    /** URL of the file. */
    this.url = newUrl;
};

/** Prototype for all TextFile objects. */
// todo: re-adapt for nodejs application (no window object)
TextFile.prototype = {
    /**
     * Returns the content of the file as text.
     *
     * @returns Content of the file as text.
     */
    getText: function () {
        var newUrl = JswUtils.trim(this.url),
            xhr;

        if (!JswUtils.trim(newUrl)) {
            throw '"' + this.url + '" is not a valid url for a text file!';
        }

        if (window.XMLHttpRequest &&
            (window.location.protocol !== "file:" || !window.ActiveXObject)) {
            xhr = new XMLHttpRequest();
        } else {
            xhr = new window.ActiveXObject("Microsoft.XMLHTTP");
        }

        try {
            xhr.open('GET', this.url, false);
            xhr.send(null);
            return xhr.responseText;
        } catch (ex) {
            throw ex;
        }
    }
};

module.exports = TextFile;
