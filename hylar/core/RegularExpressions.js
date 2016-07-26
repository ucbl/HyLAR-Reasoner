/**
 * Created by aifb on 25.07.16.
 */


module.exports = {
    LITERAL: /^("[\s\S]*")(@([a-zA-Z]+)|\^\^<?.+>?)?$/i,
    LITERAL_UNFORMATTED: /("[\s\S]*"\^\^)([^<].+[^>])$/i,
    BLANK_NODE: /^_:/i,
    VARIABLE: /^\?/i,
    DATATYPE_TYPE: /^<.+>$/i,
    DBLQUOTED_STRING: /^(")([\s\S]*)(".*)$/i,
    END_OF_TRIPLE: /^(.+)(> \.)/i,
    TRIPLE: /(\([^\s]+?\s[^\s]+?\s[^\s]+?\))/gi,
    ATOM: /\(([^\s]+)\s([^\s]+)\s([^\s]+)\)/i,
    LITERAL_WITHOUT_TYPE:/^(".*").*$/i,
    LITERAL_RAW_VALUE: /^"(.*)".*$/i
};