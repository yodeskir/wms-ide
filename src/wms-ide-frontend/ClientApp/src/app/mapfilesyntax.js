CodeMirror.defineMode("mapfile", function( _config, parserConfig ) {
    var keywords = parserConfig.keywords,
        builtins = parserConfig.builtins,
        types = parserConfig.types,
        multiLineStrings = parserConfig.multiLineStrings;

    var isOperatorChar = /[*+\-%<>=&?:\/!|]/;

    function chain( stream, state, f ) {
        state.tokenize = f;
        return f(stream, state);
    }

    var type;

    function ret( tp, style ) {
        type = tp;
        return style;
    }

    function tokenComment( stream, state ) {
        var isEnd = false;
        var ch;
        while ( ch = stream.next() ) {
            if ( ch == "/" && isEnd ) {
                state.tokenize = tokenBase;
                break;
            }
            isEnd = (ch == "*");
        }
        return ret("comment", "comment");
    }

    function tokenString( quote ) {
        return function( stream, state ) {
            var escaped = false, next, end = false;
            while ( (next = stream.next()) != null ) {
                if ( next == quote && !escaped ) {
                    end = true;
                    break;
                }
                escaped = !escaped && next == "\\";
            }
            if ( end || !(escaped || multiLineStrings) ) state.tokenize = tokenBase;
            return ret("string", "error");
        };
    }

    function tokenBase( stream, state ) {
        var ch = stream.next();

        // is a start of string?
        if ( ch == '"' || ch == "'" ) return chain(stream, state, tokenString(ch));
            // is it one of the special chars
        else if ( /[\[\]{}\(\),;\.]/.test(ch) ) return ret(ch);
            // is it a number?
        else if ( /\d/.test(ch) ) {
            stream.eatWhile(/[\w\.]/);
            return ret("number", "number");
        }
            // single line comment or operator
        else if ( ch == "#" ) {
            stream.skipToEnd();
            return ret("comment", "comment");
            /*else {
				stream.eatWhile(isOperatorChar);
				return ret("operator", "operator");
			}*/
        }
            // is it an operator
        else if ( isOperatorChar.test(ch) ) {
            stream.eatWhile(isOperatorChar);
            return ret("operator", "operator");
        }
        else {
            // get the while word
            stream.eatWhile(/[\w\$_]/);
            // is it one of the listed keywords?
            if ( keywords && keywords.propertyIsEnumerable(stream.current().toUpperCase()) ) {
                if ( stream.eat(")") || stream.eat(".") ) {
                    //keywords can be used as variables like flatten(group), group.$0 etc..
                }
                else return ("keyword", "keyword");
            }
            // is it one of the builtin functions?
            if ( builtins && builtins.propertyIsEnumerable(stream.current().toUpperCase()) ) return ("keyword", "variable-2");
            // is it one of the listed types?
            if ( types && types.propertyIsEnumerable(stream.current().toUpperCase()) ) return ("keyword", "variable-3");
            // default is a 'variable'
            return ret("variable", "pig-word");
        }
    }

    // Interface
    return {
        startState: function() {
            return {
                tokenize: tokenBase,
                startOfLine: true
            };
        },

        token: function( stream, state ) {
            if ( stream.eatSpace() ) return null;
            var style = state.tokenize(stream, state);
            return style;
        }
    };
});

(function() {

    function keywords( str ) {
        var obj = { }, words = str.split(" ");
        for ( var i = 0; i < words.length; ++i ) obj[words[i]] = true;
        return obj;
    }

    // builtin funcs taken from trunk revision 1303237
    var pBuiltins = "CLASS END FEATURE JOIN LABEL LAYER LEADER LEGEND MAP METADATA OUTPUTFORMAT " +
        "PATTERN POINTS PROJECTION QUERYMAP REFERENCE SCALEBAR STYLE SYMBOL VALIDATION WEB";

    var pKeywords = "NAME ALIGN ALPHACOLOR ANCHORPOINT ANGLE BACKGROUNDCOLOR BUFFER " +
        "CENTER CHARACTER CLASSGROUP CLASSITEM COLOR COLORRANGE CONFIG CONNECTION CONNECTIONTYPE " +
        "DATA DATAPATTERN DATARANGE DEBUG DEFRESOLUTION DRIVER " +
        "EMPTY ENCODING ERROR EXPRESSION EXTENSION EXTENT " +
        "FILLED FILTER FILTERITEM FONT FONTSET FOOTER FORCE FORMATOPTION FROM " +
        "GAP GEOMTRANSFORM GRATICULE GRID GRIDSTEP GROUP HEADER " +
        "IMAGE IMAGECOLOR IMAGEMODE IMAGEPATH IMAGEQUALITY IMAGETYPE IMAGEURL INCLUDE INDEX INITIALGAP INTERVALS ITEMS " +
        "KEYIMAGE KEYSIZE KEYSPACING " +
        "LABELCACHE_MAP_EDGE_BUFFER LABELCACHE LABELFORMAT LABELITEM LABELMAXSCALEDENOM LABELMINSCALEDENOM LABELREQUIRES LABELSIZEITEM LATLON LINECAP LINEJOIN LINEJOINMAXSIZE LOG " +
        "MARKER MARKERSIZE MASK MAXARCS MAXBOXSIZE MAXDISTANCE MAXFEATURES MAXINTERVAL MAXLENGTH MAXOVERLAPANGLE MAXSCALE MAXSCALEDENOM MAXSIZE MAXSUBDIVIDE MAXTEMPLATE MAXWIDTH MIMETYPE " +
        "MINARCS MINBOXSIZE MINDISTANCE MINFEATURESIZE MININTERVAL MINSCALE MINSCALEDENOM MINSIZE MINSUBDIVIDE MINTEMPLATE MINWIDTH " +
        "OFFSET OFFSITE OPACITY OUTLINECOLOR OUTLINEWIDTH  " +
        "PARTIALS POLAROFFSET POSITION POSTLABELCACHE PRIORITY PROCESSING " +
        "QUERYFORMAT TRANSPARENT " +
        "REPEATDISTANCE REQUIRES RESOLUTION " +
        "SCALE SHADOWCOLOR SHADOWSIZE SHAPEPATH SIZE SIZEUNITS STATUS STYLEITEM SYMBOLSCALE SYMBOLSCALEDENOM SYMBOLSET " +
        "TABLE TEMPLATE TEMPLATEPATTERN TEXT TILEINDEX TILEITEM TITLE TO TOLERANCE TOLERANCEUNITS TRANSFORM TRANSPAREN TYPE " +
        "UNITS WIDTH WRAP";

    // data types
    var pTypes = "BOOLEAN INT LONG FLOAT DOUBLE CHARARRAY BYTEARRAY BAG TUPLE ";

    var pConstants = "true false ON OFF";

    CodeMirror.defineMIME("text/mapfile", {
        name: "mapfile",
        builtins: keywords(pBuiltins),
        keywords: keywords(pKeywords),
        types: keywords(pTypes)
    });
}());