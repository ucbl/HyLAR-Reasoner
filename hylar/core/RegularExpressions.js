/**
 * Created by aifb on 25.07.16.
 */


module.exports = {
    LITERAL: /^("[\s\S]*")(@([a-zA-Z\-]+)|\^\^<?.+>?)?$/i,
    LITERAL_UNFORMATTED: /("[\s\S]*"\^\^)([^<].+[^>])$/i,
    BLANK_NODE: /^_:/i,
    VARIABLE: /^\?/i,
    DATATYPE_TYPE: /^<.+>$/i,
    DBLQUOTED_STRING: /^(")([\s\S]*)(".*)$/i,
    END_OF_TRIPLE: /^(.+)(> \.)/i,
    TRIPLE: /(\([^\s]+?\s[^\s]+?\s[^\s]+?\))|false/gi,
    ATOM: /\(([^\s]+)\s([^\s]+)\s([^\s]+)\)/i,
    LITERAL_WITHOUT_TYPE:/^(".*").*$/i,
    LITERAL_RAW_VALUE: /^"(.*)".*$/i,
    NO_BRACKET_BODYQUERY: /^[^\{]*\{([^\{\}]*)\}\s*$/i,
    SINGLE_BRACKET_BODYQUERY: /^[^\{]*\{[^\{\}]*\{([^\{\}]*)\}\s*\}\s*$/i,
    CONSTRUCT_BODYQUERY_WITH_BRACKETS: /\s*CONSTRUCT\s*\{.*\}\s*WHERE\s*(.*)/i,
    DELETE_OR_INSERT_STATEMENT: /^[\s]*(delete|insert)(.+)$/i,
    CONSTRUCT_GRAPH_1ST_PATTERN: /(CONSTRUCT \{ )GRAPH <.+> \{( .+ )\}( \} WHERE.+)/i,
    URI_AFTER_HASH_OR_SLASH: /[^/#]+$/g,
    PREFIXED_URI: /([a-z0-9]+)\:[^/]{2}.*/i

};