/**
 * Эмулятор jQuery.ajax с минимальным набором возможностей для корректной работы XHRTransport
 * Удалиться после перехода на Fetch-Api + Promise
 * https://online.sbis.ru/opendoc.html?guid=c2d85f9e-0839-4c08-a64f-4e32a5d90733
 */
define('Transport/ajax-emulator', [], function () {
    'use strict';

    /**
     * @typedef {Object} Types
     * @property {String} html
     * @property {String} xml
     * @property {String} json
     */
    /**
     * @typedef {Object} fakeXHR
     * @property {String} html
     * @property {String} xml
     * @property {String} json
     */
    /**
     * @typedef {Object} Accepts
     * @extends Types
     * @property {String} *
     * @property {String} text
     */
    /**
     * @typedef {Object} Converters
     * @property {Function} "* text"
     * @property {Function} "text html"
     * @property {Function} "text json"
     * @property {Function} "text xml"
     */

    /**
     * @typedef {Object} Options
     * @property {Number} [timeout]
     * @property {*} [data]
     * @property {String | false} [dataType]
     * @property {String} [type]
     * @property {*} [cache]
     * @property {Boolean} [throws]
     * @property {Boolean} [traditional]
     * @property {Object} [headers]
     * @property {Boolean} [async]
     *
     * @property {Function} [beforeSend]
     * @property {Function} [success]
     * @property {Function} [error]
     *
     */
    /**
     * @typedef {Object} Settings
     * @property {String} url
     * @property {String} type
     * @property {String} isLocal
     * @property {Boolean} isLocal
     * @property {Boolean} global
     * @property {Boolean} processData
     * @property {String} contentType
     * @property {Accepts} accepts
     * @property {Types} contents
     * @property {Types} responseFields
     * @property {Converters} converters
     *
     * @property {Array<String>} dataTypes
     * @property {Boolean} hasContent
     */
    /** Handles responses to an ajax request:
     * - finds the right dataType (mediates between content-type and expected dataType)
     * - returns the corresponding response
     * @param {Object} setting
     * @param {fakeXHR} xhr
     * @param {*} responses
     */
    function ajaxHandleResponses(setting, xhr, responses) {

        var ct, type, finalDataType, firstDataType,
            contents = setting.contents,
            dataTypes = setting.dataTypes;

        // Remove auto dataType and get content-type in the process
        while (dataTypes[0] === "*") {
            dataTypes.shift();
            if (ct === undefined) {
                ct = setting.mimeType || xhr.getResponseHeader("Content-Type");
            }
        }

        // Check if we're dealing with a known content-type
        if (ct) {
            for (type in contents) {
                if (contents[type] && contents[type].test(ct)) {
                    dataTypes.unshift(type);
                    break;
                }
            }
        }

        // Check to see if we have a response for the expected dataType
        if (dataTypes[0] in responses) {
            finalDataType = dataTypes[0];
        } else {

            // Try convertible dataTypes
            for (type in responses) {
                if (!dataTypes[0] || setting.converters[type + " " + dataTypes[0]]) {
                    finalDataType = type;
                    break;
                }
                if (!firstDataType) {
                    firstDataType = type;
                }
            }

            // Or just use first one
            finalDataType = finalDataType || firstDataType;
        }

        // If we found a dataType
        // We add the dataType to the list if needed
        // and return the corresponding response
        if (finalDataType) {
            if (finalDataType !== dataTypes[0]) {
                dataTypes.unshift(finalDataType);
            }
            return responses[finalDataType];
        }
    }

    /** Chain conversions given the request and the original response
     * Also sets the responseXXX fields on the jqXHR instance
     * @param {Object} setting
     * @param {*} response
     * @param {fakeXHR} xhr
     * @param {Boolean} isSuccess
     * @return {{state: "success" | "parsererror", [data]: *, [error]: Error}}
     */
    function ajaxConvert(setting, response, xhr, isSuccess) {
        var conv2, current, conv, tmp, prev,
            converters = {},

            // Work with a copy of dataTypes in case we need to modify it for conversion
            dataTypes = setting.dataTypes.slice();

        // Create converters map with lowercased keys
        if (dataTypes[1]) {
            for (conv in setting.converters) {
                converters[conv.toLowerCase()] = setting.converters[conv];
            }
        }

        current = dataTypes.shift();

        // Convert to each sequential dataType
        while (current) {

            if (setting.responseFields[current]) {
                xhr[setting.responseFields[current]] = response;
            }

            prev = current;
            current = dataTypes.shift();

            if (current) {

                // There's only work to do if current dataType is non-auto
                if (current === "*") {

                    current = prev;

                    // Convert response if prev dataType is non-auto and differs from current
                } else if (prev !== "*" && prev !== current) {

                    // Seek a direct converter
                    conv = converters[prev + " " + current] || converters["* " + current];

                    // If none found, seek a pair
                    if (!conv) {
                        for (conv2 in converters) {

                            // If conv2 outputs current
                            tmp = conv2.split(" ");
                            if (tmp[1] === current) {

                                // If prev can be converted to accepted input
                                conv = converters[prev + " " + tmp[0]] ||
                                    converters["* " + tmp[0]];
                                if (conv) {

                                    // Condense equivalence converters
                                    if (conv === true) {
                                        conv = converters[conv2];

                                        // Otherwise, insert the intermediate dataType
                                    } else if (converters[conv2] !== true) {
                                        current = tmp[0];
                                        dataTypes.unshift(tmp[1]);
                                    }
                                    break;
                                }
                            }
                        }
                    }

                    // Apply converter (if not an equivalence)
                    if (conv !== true) {

                        // Unless errors are allowed to bubble, catch and return them
                        if (conv && setting.throws) {
                            response = conv(response);
                        } else {
                            try {
                                response = conv(response);
                            } catch (e) {
                                return {
                                    state: "parsererror",
                                    error: conv ?
                                        e :
                                        new Error("No conversion from " + prev + " to " + current)
                                };
                            }
                        }
                    }
                }
            }
        }

        return {state: "success", data: response};
    }
    function getHeaders(setting) {
        var headers = setting.headers || {};

        // Set the correct header, if data is being sent
        if ( setting.data && setting.hasContent && setting.contentType !== false || setting.contentType ) {
            headers["Content-Type"] = setting.contentType;
        }
        headers["Accept"] =  setting.dataTypes[ 0 ] && setting.accepts[ setting.dataTypes[ 0 ] ] ?
                setting.accepts[ setting.dataTypes[ 0 ] ] +
                ( setting.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
                setting.accepts[ "*" ];

        // X-Requested-With header
        // For cross-domain requests, seeing as conditions for a preflight are
        // akin to a jigsaw puzzle, we simply never set it to be sure.
        // (it can always be set on a per-request basis or even using ajaxSetup)
        // For same-domain requests, won't change header if already provided.
        if (!setting.crossDomain && !headers["X-Requested-With"]) {
            headers["X-Requested-With"] = "XMLHttpRequest";
        }
        return headers;
    }
    function getXHR(options, complete) {
        var xhr = new XMLHttpRequest(),
        headers = getHeaders(options);

        xhr.open(
            options.type,
            options.url,
            options.async
        );
        // Override mime type if needed
        if (options.mimeType && xhr.overrideMimeType) {
            xhr.overrideMimeType(options.mimeType);
        }


        // Set headers
        for (var i in headers) {
            xhr.setRequestHeader(i, headers[i]);
        }
        xhr.onload = function (event) {
            complete(
                xhrSuccessStatus[ xhr.status ] || xhr.status,
                xhr.statusText,
                typeof xhr.responseText !== "string" ?
                    { binary: xhr.response } :
                    { text: xhr.responseText },
                xhr.getAllResponseHeaders()
            );
        };

        xhr.onabort = function (event) {
            complete(
                xhr.status,
                'abort'
            );
        };
        xhr.onerror = function (event) {
            complete(
                xhr.status,
                xhr.statusText
            );
        };

        return xhr;
    }
    function wrapXHR(xhr) {
        responseHeaders = {};
        var responseHeaders,
            fakeXHR = {
                readyState: 0,
                // Builds headers hashtable if needed
                getResponseHeader: function( key ) {
                    var match, responseHeadersString = xhr.getAllResponseHeaders();
                    if (!responseHeadersString) {
                        return null;
                    }
                    if ( !responseHeaders ) {
                        responseHeaders = {};
                        while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
                            responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
                        }
                    }
                    match = responseHeaders[ key.toLowerCase() ];
                    return match == null ? null : match;
                }
            };
        [
            'setRequestHeader', 'getAllResponseHeaders', 'overrideMimeType',
            'abort', 'send'
        ].forEach(function(method) {
            fakeXHR[method] = function() {
                return xhr[method].apply(xhr, arguments);
            }
        });
        return fakeXHR;
    }
    function parseXML(data) {
        var xml;
        if ( !data || typeof data !== "string" ) {
            return null;
        }
        try {
            xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
        } catch ( e ) {
            xml = undefined;
        }

        if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
            throw new Error( "Invalid XML: " + data );
        }
        return xml;
    }

    var _location = typeof location !== "undefined"?
            location:
            {href:"",protocol:"https"},
        rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
        rprotocol = /^\/\//,
        xhrSuccessStatus = {
            // File protocol always yields status code 0, assume 200
            0: 200
        },
        allTypes = "*/".concat( "*" ),
        ajaxSettings = {
            url: _location.href,
            type: "GET",
            isLocal: rlocalProtocol.test( _location.protocol ),
            global: true,
            processData: true,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",

            /*
            timeout: 0,
            data: null,
            dataType: null,
            username: null,
            password: null,
            cache: null,
            throws: false,
            traditional: false,
            headers: {},
            */

            accepts: {
                "*": allTypes,
                text: "text/plain",
                html: "text/html",
                xml: "application/xml, text/xml",
                json: "application/json, text/javascript"
            },

            contents: {
                xml: /\bxml\b/,
                html: /\bhtml/,
                json: /\bjson\b/
            },

            responseFields: {
                xml: "responseXML",
                text: "responseText",
                json: "responseJSON"
            },

            // Data converters
            // Keys separate source (or catchall "*") and destination types with a single space
            converters: {

                // Convert anything to text
                "* text": String,

                // Text to html (true = no transformation)
                "text html": true,

                // Evaluate text as a json expression
                "text json": JSON.parse,

                // Parse text as xml
                "text xml": parseXML
            },
            success: function(){},
            error: function(){}
        },
        rnoContent = /^(?:GET|HEAD)$/,
        rquery = ( /\?/ ),
        r20 = /%20/g,
        rhash = /#.*$/,
        rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g ),
        rantiCache = /([?&])_=[^&]*/,
        rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
        nonce = Date.now();

    /**
     *
     * @param {Options} options
     * @return {Settings & Options}
     */
    function ajaxSetup (options) {
        return Object.assign({}, ajaxSettings, options)
    }

    /**
     * @param {Options} options
     * @return {*}
     */
    function ajax(options) {

        var fakeXHR,
            // URL without anti-cache param
            cacheURL,

            // Response headers
            responseHeadersString,

            // Request state (becomes false upon send and true upon completion)
            completed,

            // uncached part of the url
            uncached,

            /**
             * @type {Settings & Options}
             */
            setting = ajaxSetup(options),
            urlAnchor,
            // Anchor tag for parsing the document origin
            originAnchor = document.createElement( "a" );

        originAnchor.href = _location.href;

        // Add protocol if not provided (prefilters might expect it)
        // Handle falsy url in the settings object (#10093: consistency with old signature)
        // We also use the url parameter if available
        setting.url = ( ( setting.url || loc_locationation.href ) + "" )
            .replace( rprotocol, _location.protocol + "//" );

        // Extract dataTypes list
        setting.dataTypes = ( setting.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

        // A cross-domain request is in order when the origin doesn't match the current origin.
        if ( setting.crossDomain == null ) {
            urlAnchor = document.createElement( "a" );

            // Support: IE <=8 - 11, Edge 12 - 13
            // IE throws exception on accessing the href property if url is malformed,
            // e.g. http://example.com:80x/
            try {
                urlAnchor.href = setting.url;

                // Support: IE <=8 - 11 only
                // Anchor's host property isn't correctly set when s.url is relative
                urlAnchor.href = urlAnchor.href;
                setting.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
                    urlAnchor.protocol + "//" + urlAnchor.host;
            } catch ( e ) {

                // If there is an error parsing the URL, assume it is crossDomain,
                // it can be rejected by the transport if it is invalid
                setting.crossDomain = true;
            }
        }

        // Uppercase the type
        setting.type = setting.type.toUpperCase();

        // Determine if request has content
        setting.hasContent = !rnoContent.test( setting.type );

        // Save the URL in case we're toying with the If-Modified-Since
        // and/or If-None-Match header later on
        // Remove hash to simplify url manipulation
        cacheURL = setting.url.replace( rhash, "" );

        // More options handling for requests with no content
        if ( !setting.hasContent ) {

            // Remember the hash so we can put it back
            uncached = setting.url.slice( cacheURL.length );

            // If data is available, append data to url
            if ( setting.data ) {
                cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + setting.data;

                // #9682: remove data so that it's not used in an eventual retry
                delete setting.data;
            }

            // Add or update anti-cache param if needed
            if ( setting.cache === false ) {
                cacheURL = cacheURL.replace( rantiCache, "$1" );
                uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce++ ) + uncached;
            }

            // Put hash and anti-cache on the URL that will be requested (gh-1732)
            setting.url = cacheURL + uncached;

            // Change '%20' to '+' if this is encoded form body content (gh-2658)
        } else if ( setting.data && setting.processData &&
            ( setting.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
            setting.data = setting.data.replace( r20, "+" );
        }

        fakeXHR = wrapXHR(getXHR(setting, done));
        // Allow custom headers/mimetypes and early abort
        if ( setting.beforeSend &&
            ( setting.beforeSend.call( null, fakeXHR, setting ) === false) ) {

            // Abort if not done already and return
            return fakeXHR.abort();
        }
        try {
            // Do send the request (this may raise an exception)
            fakeXHR.send( setting.hasContent && setting.data || null );
        } catch ( e ) {
            // Propagate others as results
            done( -1, e );
        }

        // Callback for when everything is done
        function done( status, nativeStatusText, responses, headers ) {
            var isSuccess, success, error, response,
                statusText = nativeStatusText;

            completed = true;

            // Cache response headers
            responseHeadersString = headers || "";

            // Determine if successful
            isSuccess = status >= 200 && status < 300 || status === 304;

            // Get response data
            if ( responses ) {
                response = ajaxHandleResponses( setting, fakeXHR, responses );
            }

            // Convert no matter what (that way responseXXX fields are always set)
            response = ajaxConvert( setting, response, fakeXHR, isSuccess );

            // If successful, handle type chaining
            if ( isSuccess ) {
                // if no content
                if ( status === 204 || setting.type === "HEAD" ) {
                    statusText = "nocontent";

                    // if not modified
                } else if ( status === 304 ) {
                    statusText = "notmodified";

                    // If we have data, let's convert it
                } else {
                    statusText = response.state;
                    success = response.data;
                    error = response.error;
                    isSuccess = !error;
                }
            } else {

                // Extract error from statusText and normalize for non-aborts
                error = statusText;
                if ( status || !statusText ) {
                    statusText = "error";
                    if ( status < 0 ) {
                        status = 0;
                    }
                }
            }
            Object.assign(fakeXHR, {
               statusText: statusText,
               status: status
            });
            // Success/Error
            if ( isSuccess ) {
                setting.success(success, statusText, fakeXHR);
            } else {
                setting.error(fakeXHR, statusText, error);
            }
        }

        return fakeXHR;
    }

    return ajax;
});
