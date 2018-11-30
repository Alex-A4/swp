define('Core/htmlparser2', [
], function() {

	return (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ }) ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Tokenizer = __webpack_require__(1);

	/*
		Options:

		xmlMode: Disables the special behavior for script/style tags (false by default)
		lowerCaseAttributeNames: call .toLowerCase for each attribute name (true if xmlMode is `false`)
		lowerCaseTags: call .toLowerCase for each tag name (true if xmlMode is `false`)
	*/

	/*
		Callbacks:

		oncdataend,
		oncdatastart,
		onclosetag,
		oncomment,
		oncommentend,
		onerror,
		onopentag,
		onprocessinginstruction,
		onreset,
		ontext
	*/

	var formTags = {
		input: true,
		option: true,
		optgroup: true,
		select: true,
		button: true,
		datalist: true,
		textarea: true
	};

	var openImpliesClose = {
		tr      : { tr:true, th:true, td:true },
		th      : { th:true },
		td      : { thead:true, th:true, td:true },
		body    : { head:true, link:true, script:true },
		li      : { li:true },
		p       : { p:true },
		h1      : { p:true },
		h2      : { p:true },
		h3      : { p:true },
		h4      : { p:true },
		h5      : { p:true },
		h6      : { p:true },
		select  : formTags,
		input   : formTags,
		output  : formTags,
		button  : formTags,
		datalist: formTags,
		textarea: formTags,
		optgroup: { optgroup:true }
	};

	function includeOptionImpliesClose(tagName, isClose) {
		if (tagName && tagName.toLowerCase() === 'select') {
			if (!isClose) {
				openImpliesClose.option = {option: true};
			} else {
				delete openImpliesClose.option;
			}
		}
	}

	var voidElements = {
		__proto__: null,
		area: true,
		base: true,
		basefont: true,
		br: true,
		col: true,
		command: true,
		embed: true,
		frame: true,
		hr: true,
		img: true,
		input: true,
		isindex: true,
		keygen: true,
		link: true,
		meta: true,
		param: true,
		source: true,
		track: true,
		wbr: true,

		//common self closing svg elements
		path: true,
		circle: true,
		ellipse: true,
		line: true,
		rect: true,
		use: true,
		stop: true,
		polyline: true,
		polygon: true
	};

	var re_nameEnd = /\s|\//;

	function Parser(cbs, options){
		this._options = options || {};
		this._cbs = cbs || {};

		this._tagname = "";
		this._attribname = "";
		this._attribvalue = "";
		this._attribs = null;
		this._attribssequence = null;
		this._attribsquotes = null;
		this._stack = [];

		this.startIndex = 0;
		this.endIndex = null;

		this._lowerCaseTagNames = "lowerCaseTags" in this._options ?
										!!this._options.lowerCaseTags :
										!this._options.xmlMode;
		this._lowerCaseAttributeNames = "lowerCaseAttributeNames" in this._options ?
										!!this._options.lowerCaseAttributeNames :
										!this._options.xmlMode;
		if(!!this._options.Tokenizer) {
			Tokenizer = this._options.Tokenizer;
		}
		this._tokenizer = new Tokenizer(this._options, this);

		if(this._cbs.onparserinit) this._cbs.onparserinit(this);
	}

	//require("inherits")(Parser, require("events").EventEmitter);

	Parser.prototype._updatePosition = function(initialOffset){
		if(this.endIndex === null){
			if(this._tokenizer._sectionStart <= initialOffset){
				this.startIndex = 0;
			} else {
				this.startIndex = this._tokenizer._sectionStart - initialOffset;
			}
		}
		else this.startIndex = this.endIndex + 1;
		this.endIndex = this._tokenizer.getAbsoluteIndex();
	};

	//Tokenizer event handlers
	Parser.prototype.ontext = function(data){
		this._updatePosition(1);
		this.endIndex--;

		if(this._cbs.ontext) this._cbs.ontext(data);
	};

	Parser.prototype.onopentagname = function(name){
		if(this._lowerCaseTagNames){
			name = name.toLowerCase();
		}

		this._tagname = name;

		if(!this._options.xmlMode && name in openImpliesClose) {
			for(
				var el;
				(el = this._stack[this._stack.length - 1]) in openImpliesClose[name];
				this.onclosetag(el)
			);
		}

		if(this._options.xmlMode || !(name in voidElements)){
			this._stack.push(name);
		}

		if(this._cbs.onopentagname) this._cbs.onopentagname(name);
		if(this._cbs.onopentag) {
			this._attribs = {};
			this._attribssequence = [];
			this._attribsquotes = {};
		}
	};

	Parser.prototype.onopentagend = function(isSelfClosed){
		this._updatePosition(1);

		if(this._attribs){
			if(this._cbs.onopentag) this._cbs.onopentag(this._tagname, this._attribs, this._attribsquotes, this._attribssequence, isSelfClosed);
			includeOptionImpliesClose(this._tagname, false);
			this._attribs = null;
			this._attribssequence = null;
			this._attribsquotes = null;
		}

		if(!this._options.xmlMode && this._cbs.onclosetag && this._tagname in voidElements){
			this._cbs.onclosetag(this._tagname, true);
		}

		this._tagname = "";
	};

	Parser.prototype.onclosetag = function(name){
		var lowerName = name.toLowerCase();

		this._updatePosition(1);

		if(this._lowerCaseTagNames){
			name = lowerName;
		}

		// если тег option в select, то закрытие тега необязательно, иначе обязательно
		includeOptionImpliesClose(name, true);

		if(this._stack.length && (!(name in voidElements) || this._options.xmlMode)){
			var pos = this._stack.length - 1;
			while (pos >= 0 && this._stack[pos].toLowerCase() !== lowerName) {
				pos--;
			}
			if(pos !== -1){
				if(this._cbs.onclosetag){
					pos = this._stack.length - pos;
					while(pos--) {
						var popped = this._stack.pop();
						if (popped.toLowerCase() === lowerName) {
                     this._cbs.onclosetag(name);
						} else {
							if (this._tokenizer.generateTagErrors) {
                        this._cbs.onerror(new Error('Тег "' + name + '" пытается закрыть последний открытый тег "' + popped + '", названия этих тегов не совпадают.'));
                     }
                     this._cbs.onclosetag(null);
						}
               }
				}
				else {
					this._stack.length = pos;
            }
			} else {
            if (this._tokenizer.generateTagErrors) {
               this._cbs.onerror(new Error('Тег "' + name + '" пытается закрыть последний открытый тег "' + this._stack[pos] + '", названия этих тегов не совпадают.'));
            }
			}
		} else if(!this._options.xmlMode && (name === "br" || name === "p")){
			this.onopentagname(name);
			this._closeCurrentTag();
		}
	};

	Parser.prototype.onselfclosingtag = function(){
		if(this._options.xmlMode || this._options.recognizeSelfClosing){
			this._closeCurrentTag(true);
		} else {
			this.onopentagend();
		}
	};

	Parser.prototype._closeCurrentTag = function(isSelfClosed){
		var name = this._tagname;

		this.onopentagend(isSelfClosed);

		//self-closing tags will be on the top of the stack
		//(cheaper check than in onclosetag)
		if(this._stack[this._stack.length - 1] === name){
			if(this._cbs.onclosetag){
				this._cbs.onclosetag(name, false, isSelfClosed);
			}
			this._stack.pop();
		}
	};

	Parser.prototype.onattribname = function(name){
		if(this._lowerCaseAttributeNames){
			name = name.toLowerCase();
		}
		this._attribname = name;
	};

	Parser.prototype.onattribdata = function(value){
		this._attribvalue += value;
	};

	Parser.prototype.onattribend = function(quote){
		if(this._cbs.onattribute) this._cbs.onattribute(this._attribname, this._attribvalue);
		if(this._attribs){
			if (quote !== '"' && quote !== '\'') {
				quote = '';
			}
			this._attribssequence.push(this._attribname);
			this._attribs[this._attribname] = this._attribvalue;
			this._attribsquotes[this._attribname] = quote;
		}
		this._attribname = "";
		this._attribvalue = "";
	};

	Parser.prototype.ondotattributeend = function(dotCode) {
		this._attribssequence.push(dotCode);
	};

	Parser.prototype._getInstructionName = function(value){
		var idx = value.search(re_nameEnd),
		    name = idx < 0 ? value : value.substr(0, idx);

		if(this._lowerCaseTagNames){
			name = name.toLowerCase();
		}

		return name;
	};

	Parser.prototype.ondeclaration = function(value){
		if(this._cbs.onprocessinginstruction){
			var name = this._getInstructionName(value);
			this._cbs.onprocessinginstruction("!" + name, "!" + value);
		}
	};

	Parser.prototype.onprocessinginstruction = function(value){
		if(this._cbs.onprocessinginstruction){
			var name = this._getInstructionName(value);
			this._cbs.onprocessinginstruction("?" + name, "?" + value);
		}
	};

	Parser.prototype.oncomment = function(value){
		this._updatePosition(4);

		if(this._cbs.oncomment) this._cbs.oncomment(value);
		if(this._cbs.oncommentend) this._cbs.oncommentend();
	};

	Parser.prototype.onerror = function(err){
		if(this._cbs.onerror) this._cbs.onerror(err);
	};

	Parser.prototype.onend = function(){
		if(this._cbs.onclosetag){
			// Обрубаем незакрытые теги
			var i = this._stack.length;
			while (i--) {
				this._cbs.onclosetag(null);
			}
		}
		if(this._cbs.onend) this._cbs.onend();
	};


	//Resets the parser to a blank state, ready to parse a new HTML document
	Parser.prototype.reset = function(){
		if(this._cbs.onreset) this._cbs.onreset();
		this._tokenizer.reset();

		this._tagname = "";
		this._attribname = "";
		this._tmplDepth = 0;
		this._attribs = null;
		this._attribssequence = null;
		this._attribsquotes = null;
		this._stack = [];

		if(this._cbs.onparserinit) this._cbs.onparserinit(this);
	};

	//Parses a complete HTML document and pushes it to the handler
	Parser.prototype.parseComplete = function(data){
		this.reset();
		this.end(data);
	};

	Parser.prototype.write = function(chunk){
		this._tokenizer.write(chunk);
	};

	Parser.prototype.end = function(chunk){
		this._tokenizer.end(chunk);
	};

	Parser.prototype.pause = function(){
		this._tokenizer.pause();
	};

	Parser.prototype.resume = function(){
		this._tokenizer.resume();
	};

	//alias for backwards compat
	Parser.prototype.parseChunk = Parser.prototype.write;
	Parser.prototype.done = Parser.prototype.end;

	module.exports = Parser;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = Tokenizer;

	var
	    i = 0,

	    TEXT                      = i++,
	    BEFORE_TAG_NAME           = i++, //after <
	    IN_TAG_NAME               = i++,
	    IN_SELF_CLOSING_TAG       = i++,
	    BEFORE_CLOSING_TAG_NAME   = i++,
	    IN_CLOSING_TAG_NAME       = i++,
	    AFTER_CLOSING_TAG_NAME    = i++,

	    //attributes
	    BEFORE_ATTRIBUTE_NAME     = i++,
	    IN_ATTRIBUTE_NAME         = i++,
	    AFTER_ATTRIBUTE_NAME      = i++,
	    BEFORE_ATTRIBUTE_VALUE    = i++,
	    IN_ATTRIBUTE_VALUE_DQ     = i++, // "
	    IN_ATTRIBUTE_VALUE_SQ     = i++, // '
	    IN_ATTRIBUTE_VALUE_NQ     = i++,

	    //declarations
	    BEFORE_DECLARATION        = i++, // !
	    IN_DECLARATION            = i++,

	    //processing instructions
	    IN_PROCESSING_INSTRUCTION = i++, // ?

	    //comments
	    BEFORE_COMMENT            = i++,
	    IN_COMMENT                = i++,
	    IN_WS_EXPERT_COMMENT      = i++,
	    AFTER_COMMENT_1           = i++,
	    AFTER_COMMENT_2           = i++,

	    //special tags
	    BEFORE_SPECIAL            = i++, //S
	    BEFORE_SPECIAL_END        = i++,   //S

	    BEFORE_SCRIPT_1           = i++, //C
	    BEFORE_SCRIPT_2           = i++, //R
	    BEFORE_SCRIPT_3           = i++, //I
	    BEFORE_SCRIPT_4           = i++, //P
	    BEFORE_SCRIPT_5           = i++, //T
	    AFTER_SCRIPT_1            = i++, //C
	    AFTER_SCRIPT_2            = i++, //R
	    AFTER_SCRIPT_3            = i++, //I
	    AFTER_SCRIPT_4            = i++, //P
	    AFTER_SCRIPT_5            = i++, //T

		BEFORE_TMPL						= i++,
		IN_TMPL							= i++,
		AFTER_TMPL						= i++,

	    BEFORE_STYLE_1            = i++, //T
	    BEFORE_STYLE_2            = i++, //Y
	    BEFORE_STYLE_3            = i++, //L
	    BEFORE_STYLE_4            = i++, //E
	    AFTER_STYLE_1             = i++, //T
	    AFTER_STYLE_2             = i++, //Y
	    AFTER_STYLE_3             = i++, //L
	    AFTER_STYLE_4             = i++, //E

	    j = 0,

	    SPECIAL_NONE              = j++,
	    SPECIAL_SCRIPT            = j++,
	    SPECIAL_STYLE             = j++;

	function whitespace(c){
		return c === " " || c === "\n" || c === "\t" || c === "\f" || c === "\r";
	}

	function ifElseState(upper, SUCCESS, FAILURE){
		var lower = upper.toLowerCase();

		if(upper === lower){
			return function(c){
				if(c === lower){
					this._state = SUCCESS;
				} else {
					this._state = FAILURE;
					this._index--;
				}
			};
		} else {
			return function(c){
				if(c === lower || c === upper){
					this._state = SUCCESS;
				} else {
					this._state = FAILURE;
					this._index--;
				}
			};
		}
	}

	function consumeSpecialNameChar(upper, NEXT_STATE){
		var lower = upper.toLowerCase();

		return function(c){
			if(c === lower || c === upper){
				this._state = NEXT_STATE;
			} else {
				this._state = IN_TAG_NAME;
				this._index--; //consume the token again
			}
		};
	}

   /**
    * Для того чтобы в структуру тегов не попадали кривые имена
    * например <=, <:wawf, <.a! etc.
    * @param tagName
    * @returns {boolean}
    */
   function checkTagName(tagName) {
      return /(^[\wА-я]([\wА-я.:\-]?)+$)/gi.test(tagName);
   }

	function Tokenizer(options, cbs){
		this._state = TEXT;
		this._returnToState = TEXT;
		this._buffer = "";
		this._sectionStart = 0;
		this._index = 0;
		this._tmplDepth = 0;
		this._bufferOffset = 0; //chars removed from _buffer
		this._special = SPECIAL_NONE;
		this._cbs = cbs;
		this._running = true;
		this._ended = false;
		this._ignoreAttrib = false;
		this._xmlMode = !!(options && options.xmlMode);
		this._decodeEntities = !!(options && options.decodeEntities);
		this.failOnInnerCurlyBrace = options.failOnInnerCurlyBrace;
		this.generateTagErrors = options.generateTagErrors;
	}

	Tokenizer.prototype.ignoreAttrib = function(val) {
		this._ignoreAttrib = val;
	};

	Tokenizer.prototype._stateText = function(c){
		if(c === "<"){
			if(this._index > this._sectionStart){
				this._cbs.ontext(this._getSection());
			}
			this._state = BEFORE_TAG_NAME;
			this._sectionStart = this._index;
		} else if (c === '{') {
			this._state = BEFORE_TMPL;
			this._returnToState = TEXT;
		}
	};

	Tokenizer.prototype._stateBeforeTagName = function(c){
		if(c === "/"){
			this._state = BEFORE_CLOSING_TAG_NAME;
		} else if(c === "<"){
			this._cbs.ontext(this._getSection());
			this._sectionStart = this._index;
		} else if(c === ">" || this._special !== SPECIAL_NONE || whitespace(c)) {
			this._state = TEXT;
		} else if(c === "!"){
			this._state = BEFORE_DECLARATION;
			this._sectionStart = this._index + 1;
		} else if(c === "?"){
			this._state = IN_PROCESSING_INSTRUCTION;
			this._sectionStart = this._index + 1;
		} else {
			this._state = (!this._xmlMode && (c === "s" || c === "S")) ?
							BEFORE_SPECIAL : IN_TAG_NAME;
			this._sectionStart = this._index;
		}
	};

	Tokenizer.prototype._stateInTagName = function(c){
		if(c === "/" || c === ">" || c === "{" || whitespace(c)){
			if (checkTagName(this._getSection())) {
            this._emitToken("onopentagname");
            this._state = BEFORE_ATTRIBUTE_NAME;
            this._index--;
			} else {
            this._state = TEXT;
            this._sectionStart = this._sectionStart - 1;
			}
		}
	};

	Tokenizer.prototype._stateBeforeCloseingTagName = function(c){
		if(whitespace(c));
		else if(c === ">"){
			this._state = TEXT;
		} else if(this._special !== SPECIAL_NONE){
			if(c === "s" || c === "S"){
				this._state = BEFORE_SPECIAL_END;
			} else {
				this._state = TEXT;
				this._index--;
			}
		} else {
			this._state = IN_CLOSING_TAG_NAME;
			this._sectionStart = this._index;
		}
	};

	Tokenizer.prototype._stateInCloseingTagName = function(c){
		if(c === ">" || whitespace(c)){
			this._emitToken("onclosetag");
			this._state = AFTER_CLOSING_TAG_NAME;
			this._index--;
		}
	};

	Tokenizer.prototype._stateAfterCloseingTagName = function(c){
		//skip everything until ">"
		if(c === ">"){
			this._state = TEXT;
			this._sectionStart = this._index + 1;
		}
	};

	Tokenizer.prototype._stateBeforeAttributeName = function(c){
		if(c === ">"){
			this._cbs.onopentagend();
			this._state = TEXT;
			this._sectionStart = this._index + 1;
		} else if(c === "/") {
			this._state = IN_SELF_CLOSING_TAG;
		} else if (c === '{') {
			this._returnToState = BEFORE_ATTRIBUTE_NAME;
			this._state = BEFORE_TMPL;
			this._sectionStart = this._index;
		} else if (c === '}' && this._buffer[this._sectionStart] === '{') { // Вернулись из doT в аттрибутах
			this._cbs.ondotattributeend(this._buffer.substring(this._sectionStart, this._index + 1));
		} else if(!whitespace(c)){
			this._state = IN_ATTRIBUTE_NAME;
			this._sectionStart = this._index;
		}
	};

	Tokenizer.prototype._stateInSelfClosingTag = function(c){
		if(c === ">"){
			this._cbs.onselfclosingtag();
			this._state = TEXT;
			this._sectionStart = this._index + 1;
		} else if(!whitespace(c)){
			this._state = BEFORE_ATTRIBUTE_NAME;
			this._index--;
		}
	};

	Tokenizer.prototype._stateInAttributeName = function(c){
		if(c === "=" || c === "/" || c === ">" || whitespace(c)){
			this._cbs.onattribname(this._getSection());
			this._sectionStart = -1;
			this._state = AFTER_ATTRIBUTE_NAME;
			this._index--;
		}
	};

	Tokenizer.prototype._stateAfterAttributeName = function(c){
		if(c === "="){
			this._state = BEFORE_ATTRIBUTE_VALUE;
		} else if(c === "/" || c === ">"){
			this._cbs.onattribend();
			this._state = BEFORE_ATTRIBUTE_NAME;
			this._index--;
		} else if(!whitespace(c)){
			this._cbs.onattribend();
			this._state = IN_ATTRIBUTE_NAME;
			this._sectionStart = this._index;
		}
	};

	Tokenizer.prototype._stateBeforeAttributeValue = function(c){
		if(c === "\""){
			this._state = IN_ATTRIBUTE_VALUE_DQ;
			this._sectionStart = this._index + 1;
		} else if(c === "'"){
			this._state = IN_ATTRIBUTE_VALUE_SQ;
			this._sectionStart = this._index + 1;
		} else if(!whitespace(c)){

			var bufferPart = this._buffer.slice(Math.max(this._index - 100, 0), Math.min(this._index + 100, this._buffer.length));
         this._cbs.onerror(new Error('Quotes are missing in the attribute value. Error was found here: ' + bufferPart));
			this._state = IN_ATTRIBUTE_VALUE_NQ;
			this._sectionStart = this._index;
			this._index--; //reconsume token
		}
	};

	Tokenizer.prototype._stateInAttributeValueDoubleQuotes = function(c){
		if(c === "\""){
			!this._ignoreAttrib && this._emitToken("onattribdata");
			this._cbs.onattribend(c);
			this._state = BEFORE_ATTRIBUTE_NAME;
		} else if (c === '{') {
			this._state = BEFORE_TMPL;
			this._returnToState = IN_ATTRIBUTE_VALUE_DQ;
		}
	};

	Tokenizer.prototype._stateInAttributeValueSingleQuotes = function(c){
		if(c === "'"){
			!this._ignoreAttrib && this._emitToken("onattribdata");
			this._cbs.onattribend(c);
			this._state = BEFORE_ATTRIBUTE_NAME;
		} else if (c === '{') {
			this._state = BEFORE_TMPL;
			this._returnToState = IN_ATTRIBUTE_VALUE_SQ;
		}
	};

	// Expecting attribute value (quotes were omitted)
	Tokenizer.prototype._stateInAttributeValueNoQuotes = function(c) {
		if(whitespace(c) || c === ">") {
			!this._ignoreAttrib && this._emitToken("onattribdata");
			this._cbs.onattribend(c);
			this._state = BEFORE_ATTRIBUTE_NAME;
			this._index--;
		} else if (c === '{') {
			this._state = BEFORE_TMPL;
			this._returnToState = IN_ATTRIBUTE_VALUE_NQ;
		}
	};

	Tokenizer.prototype._stateBeforeDeclaration = function(c){
		this._state = c === "-" ? BEFORE_COMMENT : IN_DECLARATION;
	};

	Tokenizer.prototype._stateInDeclaration = function(c){
		if(c === ">"){
			this._cbs.ondeclaration(this._getSection());
			this._state = TEXT;
			this._sectionStart = this._index + 1;
		}
	};

	Tokenizer.prototype._stateInProcessingInstruction = function(c){
		if(c === ">"){
			this._cbs.onprocessinginstruction(this._getSection());
			this._state = TEXT;
			this._sectionStart = this._index + 1;
		}
	};

	Tokenizer.prototype._stateBeforeComment = function(c){
		if(c === "-"){
			this._state = IN_COMMENT;
			this._sectionStart = this._index + 1;
		} else {
			this._state = IN_DECLARATION;
		}
	};

	Tokenizer.prototype._stateInComment = function(c){
		if (this._index - this._sectionStart === 9 && this._buffer.substring(this._sectionStart, this._index) == 'WS-EXPERT') {
			this._state = IN_WS_EXPERT_COMMENT;
		}
		else if(c === "-") {
			this._returnToState = IN_COMMENT;
			this._state = AFTER_COMMENT_1;
		}
	};

	Tokenizer.prototype._stateInWsExpertComment = function(c) {
		if (c === '-' && this._buffer.substring(this._index - 10, this._index) === 'WS-EXPERT-') {
			this._returnToState = IN_WS_EXPERT_COMMENT;
			this._state = AFTER_COMMENT_2;
		}
	};

	Tokenizer.prototype._stateAfterComment1 = function(c){
		if(c === "-"){
			this._state = AFTER_COMMENT_2;
		} else {
			this._state = this._returnToState;
		}
	};

	Tokenizer.prototype._stateAfterComment2 = function(c){
		if(c === ">"){
			//remove 2 trailing chars
			this._cbs.oncomment(this._buffer.substring(this._sectionStart, this._index - 2));
			this._state = TEXT;
			this._sectionStart = this._index + 1;
		} else if(c !== "-"){
			this._state = this._returnToState;
		}
		// else: stay in AFTER_COMMENT_2 (`--->`)
	};

	Tokenizer.prototype._stateBeforeSpecial = function(c){
		if(c === "c" || c === "C"){
			this._state = BEFORE_SCRIPT_1;
		} else if(c === "t" || c === "T"){
			this._state = BEFORE_STYLE_1;
		} else {
			this._state = IN_TAG_NAME;
			this._index--; //consume the token again
		}
	};

	Tokenizer.prototype._stateBeforeSpecialEnd = function(c){
		if(this._special === SPECIAL_SCRIPT && (c === "c" || c === "C")){
			this._state = AFTER_SCRIPT_1;
		} else if(this._special === SPECIAL_STYLE && (c === "t" || c === "T")){
			this._state = AFTER_STYLE_1;
		}
		else this._state = TEXT;
	};

	Tokenizer.prototype._stateBeforeScript1 = consumeSpecialNameChar("R", BEFORE_SCRIPT_2);
	Tokenizer.prototype._stateBeforeScript2 = consumeSpecialNameChar("I", BEFORE_SCRIPT_3);
	Tokenizer.prototype._stateBeforeScript3 = consumeSpecialNameChar("P", BEFORE_SCRIPT_4);
	Tokenizer.prototype._stateBeforeScript4 = consumeSpecialNameChar("T", BEFORE_SCRIPT_5);

	Tokenizer.prototype._stateBeforeScript5 = function(c){
		if(c === "/" || c === ">" || whitespace(c)){
			this._special = SPECIAL_SCRIPT;
		}
		this._state = IN_TAG_NAME;
		this._index--; //consume the token again
	};

	Tokenizer.prototype._stateAfterScript1 = ifElseState("R", AFTER_SCRIPT_2, TEXT);
	Tokenizer.prototype._stateAfterScript2 = ifElseState("I", AFTER_SCRIPT_3, TEXT);
	Tokenizer.prototype._stateAfterScript3 = ifElseState("P", AFTER_SCRIPT_4, TEXT);
	Tokenizer.prototype._stateAfterScript4 = ifElseState("T", AFTER_SCRIPT_5, TEXT);

	Tokenizer.prototype._stateAfterScript5 = function(c){
		if(c === ">" || whitespace(c)){
			this._special = SPECIAL_NONE;
			this._state = IN_CLOSING_TAG_NAME;
			this._sectionStart = this._index - 6;
			this._index--; //reconsume the token
		}
		else this._state = TEXT;
	};

	Tokenizer.prototype._stateBeforeTmpl = function(c) {
		if (c === '{') {
			this._state = IN_TMPL;
         this._expressionStart = this._index - 6;
		} else {
			this._state = this._returnToState;
			this._index--;
		}
	};

	Tokenizer.prototype._stateInTmpl = function(c) {
		if (c === '{' && this._buffer[this._index - 1] === '{') {
			this._tmplDepth++;
			if (this.failOnInnerCurlyBrace) {
            this._cbs.onerror(new Error(
            	"You haven't closed curly brace expression. " + this._buffer.slice(this._expressionStart, this._index)),
					this._state
				);
			}
		} else if (c === '}') {
			this._state = AFTER_TMPL;
		}
	};

	Tokenizer.prototype._stateAfterTmpl = function(c) {
		if (c === '}') {
			if (this._tmplDepth === 0) {
				this._state = this._returnToState;
				if (this._returnToState === BEFORE_ATTRIBUTE_NAME) {
					this._index--; // Дать состоянию понять, что мы прочитали doT
				}
			} else {
				this._tmplDepth--;
				this._state = IN_TMPL;
			}
		} else {
			this._state = IN_TMPL;
			this._index--;
		}
	};

	Tokenizer.prototype._stateBeforeStyle1 = consumeSpecialNameChar("Y", BEFORE_STYLE_2);
	Tokenizer.prototype._stateBeforeStyle2 = consumeSpecialNameChar("L", BEFORE_STYLE_3);
	Tokenizer.prototype._stateBeforeStyle3 = consumeSpecialNameChar("E", BEFORE_STYLE_4);

	Tokenizer.prototype._stateBeforeStyle4 = function(c){
		if(c === "/" || c === ">" || whitespace(c)){
			this._special = SPECIAL_STYLE;
		}
		this._state = IN_TAG_NAME;
		this._index--; //consume the token again
	};

	Tokenizer.prototype._stateAfterStyle1 = ifElseState("Y", AFTER_STYLE_2, TEXT);
	Tokenizer.prototype._stateAfterStyle2 = ifElseState("L", AFTER_STYLE_3, TEXT);
	Tokenizer.prototype._stateAfterStyle3 = ifElseState("E", AFTER_STYLE_4, TEXT);

	Tokenizer.prototype._stateAfterStyle4 = function(c){
		if(c === ">" || whitespace(c)){
			this._special = SPECIAL_NONE;
			this._state = IN_CLOSING_TAG_NAME;
			this._sectionStart = this._index - 5;
			this._index--; //reconsume the token
		}
		else this._state = TEXT;
	};

	Tokenizer.prototype._cleanup = function (){
		if(this._sectionStart < 0){
			this._buffer = "";
			this._index = 0;
			this._bufferOffset += this._index;
		} else if(this._running){
			if(this._state === TEXT){
				if(this._sectionStart !== this._index){
					this._cbs.ontext(this._buffer.substr(this._sectionStart));
				}
				this._buffer = "";
				this._index = 0;
				this._bufferOffset += this._index;
			} else if(this._sectionStart === this._index){
				//the section just started
				this._buffer = "";
				this._index = 0;
				this._bufferOffset += this._index;
			} else {
				//remove everything unnecessary
				this._buffer = this._buffer.substr(this._sectionStart);
				this._index -= this._sectionStart;
				this._bufferOffset += this._sectionStart;
			}

			this._sectionStart = 0;
		}
	};

	//TODO make events conditional
	Tokenizer.prototype.write = function(chunk){
		if(this._ended) this._cbs.onerror(Error(".write() after done!"));

		this._buffer += chunk;
		this._parse();
	};

			var typeFnMap = {};
			typeFnMap[TEXT] = Tokenizer.prototype._stateText;
			typeFnMap[BEFORE_TAG_NAME] = Tokenizer.prototype._stateBeforeTagName;
			typeFnMap[IN_TAG_NAME] = Tokenizer.prototype._stateInTagName;
			typeFnMap[BEFORE_CLOSING_TAG_NAME] = Tokenizer.prototype._stateBeforeCloseingTagName;
			typeFnMap[IN_CLOSING_TAG_NAME] = Tokenizer.prototype._stateInCloseingTagName;
			typeFnMap[AFTER_CLOSING_TAG_NAME] = Tokenizer.prototype._stateAfterCloseingTagName;
			typeFnMap[IN_SELF_CLOSING_TAG] = Tokenizer.prototype._stateInSelfClosingTag;

			typeFnMap[BEFORE_ATTRIBUTE_NAME] = Tokenizer.prototype._stateBeforeAttributeName;
			typeFnMap[IN_ATTRIBUTE_NAME] = Tokenizer.prototype._stateInAttributeName;
			typeFnMap[AFTER_ATTRIBUTE_NAME] = Tokenizer.prototype._stateAfterAttributeName;
			typeFnMap[BEFORE_ATTRIBUTE_VALUE] = Tokenizer.prototype._stateBeforeAttributeValue;
			typeFnMap[IN_ATTRIBUTE_VALUE_DQ] = Tokenizer.prototype._stateInAttributeValueDoubleQuotes;
			typeFnMap[IN_ATTRIBUTE_VALUE_SQ] = Tokenizer.prototype._stateInAttributeValueSingleQuotes;
			typeFnMap[IN_ATTRIBUTE_VALUE_NQ] = Tokenizer.prototype._stateInAttributeValueNoQuotes;

			typeFnMap[BEFORE_DECLARATION] = Tokenizer.prototype._stateBeforeDeclaration;
			typeFnMap[IN_DECLARATION] = Tokenizer.prototype._stateInDeclaration;

			typeFnMap[IN_PROCESSING_INSTRUCTION] = Tokenizer.prototype._stateInProcessingInstruction;

			typeFnMap[BEFORE_COMMENT] = Tokenizer.prototype._stateBeforeComment;
			typeFnMap[IN_COMMENT] = Tokenizer.prototype._stateInComment;
			typeFnMap[IN_WS_EXPERT_COMMENT] = Tokenizer.prototype._stateInWsExpertComment;
			typeFnMap[AFTER_COMMENT_1] = Tokenizer.prototype._stateAfterComment1;
			typeFnMap[AFTER_COMMENT_2] = Tokenizer.prototype._stateAfterComment2;

			typeFnMap[BEFORE_SPECIAL] = Tokenizer.prototype._stateBeforeSpecial;
			typeFnMap[BEFORE_SPECIAL_END] = Tokenizer.prototype._stateBeforeSpecialEnd;

			typeFnMap[BEFORE_SCRIPT_1] = Tokenizer.prototype._stateBeforeScript1;
			typeFnMap[BEFORE_SCRIPT_2] = Tokenizer.prototype._stateBeforeScript2;
			typeFnMap[BEFORE_SCRIPT_3] = Tokenizer.prototype._stateBeforeScript3;
			typeFnMap[BEFORE_SCRIPT_4] = Tokenizer.prototype._stateBeforeScript4;
			typeFnMap[BEFORE_SCRIPT_5] = Tokenizer.prototype._stateBeforeScript5;

			typeFnMap[AFTER_SCRIPT_1] = Tokenizer.prototype._stateAfterScript1;
			typeFnMap[AFTER_SCRIPT_2] = Tokenizer.prototype._stateAfterScript2;
			typeFnMap[AFTER_SCRIPT_3] = Tokenizer.prototype._stateAfterScript3;
			typeFnMap[AFTER_SCRIPT_4] = Tokenizer.prototype._stateAfterScript4;
			typeFnMap[AFTER_SCRIPT_5] = Tokenizer.prototype._stateAfterScript5;

			typeFnMap[BEFORE_TMPL] = Tokenizer.prototype._stateBeforeTmpl;
			typeFnMap[IN_TMPL] = Tokenizer.prototype._stateInTmpl;
			typeFnMap[AFTER_TMPL] = Tokenizer.prototype._stateAfterTmpl;

			typeFnMap[BEFORE_STYLE_1] = Tokenizer.prototype._stateBeforeStyle1;
			typeFnMap[BEFORE_STYLE_2] = Tokenizer.prototype._stateBeforeStyle2;
			typeFnMap[BEFORE_STYLE_3] = Tokenizer.prototype._stateBeforeStyle3;
			typeFnMap[BEFORE_STYLE_4] = Tokenizer.prototype._stateBeforeStyle4;

			typeFnMap[AFTER_STYLE_1] = Tokenizer.prototype._stateAfterStyle1;
			typeFnMap[AFTER_STYLE_2] = Tokenizer.prototype._stateAfterStyle2;
			typeFnMap[AFTER_STYLE_3] = Tokenizer.prototype._stateAfterStyle3;
			typeFnMap[AFTER_STYLE_4] = Tokenizer.prototype._stateAfterStyle4;

	Tokenizer.prototype._parse = function(){
		while(this._index < this._buffer.length && this._running){
			var c = this._buffer.charAt(this._index),
				fn = typeFnMap[this._state];

			if (fn) {
				fn.call(this, c);
			} else {
				this._cbs.onerror(Error("unknown _state"), this._state);
			}

			this._index++;
		}

		this._cleanup();
	};

	Tokenizer.prototype.pause = function(){
		this._running = false;
	};
	Tokenizer.prototype.resume = function(){
		this._running = true;

		if(this._index < this._buffer.length){
			this._parse();
		}
		if(this._ended){
			this._finish();
		}
	};

	Tokenizer.prototype.end = function(chunk){
		if(this._ended) this._cbs.onerror(Error(".end() after done!"));
		if(chunk) this.write(chunk);

		this._ended = true;

		if(this._running) this._finish();
	};

	Tokenizer.prototype._finish = function(){
		//if there is remaining data, emit it in a reasonable way
		if(this._sectionStart < this._index){
			this._handleTrailingData();
		}

		this._cbs.onend();
	};

	Tokenizer.prototype._handleTrailingData = function(){
		var data = this._buffer.substr(this._sectionStart);

		if(this._state === IN_COMMENT || this._state === AFTER_COMMENT_1 || this._state === AFTER_COMMENT_2){
			this._cbs.oncomment(data);
		} else if(
			this._state !== IN_TAG_NAME &&
			this._state !== BEFORE_ATTRIBUTE_NAME &&
			this._state !== BEFORE_ATTRIBUTE_VALUE &&
			this._state !== AFTER_ATTRIBUTE_NAME &&
			this._state !== IN_ATTRIBUTE_NAME &&
			this._state !== IN_ATTRIBUTE_VALUE_SQ &&
			this._state !== IN_ATTRIBUTE_VALUE_DQ &&
			this._state !== IN_ATTRIBUTE_VALUE_NQ &&
			this._state !== IN_CLOSING_TAG_NAME
		){
			// Вырезаем </maintag>, если попал в остаток
			var
				searchFor = '</maintag>',
				indexBeforeMaintag = data.indexOf(searchFor);
			if (indexBeforeMaintag >= 0) {
				data = data.substring(0, indexBeforeMaintag);
			}

			this._cbs.ontext(data);
		}
		//else, ignore remaining data
		//TODO add a way to remove current tag
	};

	Tokenizer.prototype.reset = function(){
		Tokenizer.call(this, {xmlMode: this._xmlMode, decodeEntities: this._decodeEntities}, this._cbs);
	};

	Tokenizer.prototype.getAbsoluteIndex = function(){
		return this._bufferOffset + this._index;
	};

	Tokenizer.prototype._getSection = function(){
		return this._buffer.substring(this._sectionStart, this._index);
	};

	Tokenizer.prototype._emitToken = function(name){
		this._cbs[name](this._getSection());
		this._sectionStart = -1;
	};

/***/ }
/******/ ]);
});