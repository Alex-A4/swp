/**
 * Created by Яковлев В.В. on 15.04.14.
 */

// doT.js
// 2011, Laura Doktorova, https://github.com/olado/doT
//
// doT.js is an open source component of http://bebedo.com
// Licensed under the MIT license.
//
define('Core/js-template-doT', ['Core/IoC', 'Core/helpers/Number/randomId'], function(IoC) {
   "use strict";

   var doT = {
      version: '0.2.0',
      templateSettings: null,
      template: undefined, //fn, compile template
      compile:  undefined,  //fn, for express
      getSettings: function() {
         // to create a "clone" of settings and don't touch default config
         return {
            evaluate:    /\{\{([\s\S]+?(\}?)+)\}\}/g,
            interpolate: /\{\{=([\s\S]+?)\}\}/g,
            translate:   /\{\[([\s\S]+?)\]\}/g,
            encode:      /\{\{!([\s\S]+?)\}\}/g,
            use:         /\{\{#([\s\S]+?)\}\}/g,
            define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
            conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
            iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
            expertMode:  /<!--WS-EXPERT([\s\S]+?)WS-EXPERT-->/g,
            ref:         /\{\{@([\s\S]+?)\}\}/g,
            varname: 'it',
            strip: true,
            append: true,
            selfcontained: true
         }
      }
   };

   doT.templateSettings = doT.getSettings();

   var global = (function(){ return this || (0,eval)('this'); }());
   global.doT = doT;
   if (typeof window !=='undefined'){
      window.global =  global;
   }

   function initVarStorage() {
      if (!global.wsDotVarStorage) {
         global.wsDotVarStorage = { storage: {} };
      }
   }
   
   function encodeHTMLSource() {
      var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': '&#34;', "'": '&#39;', "/": '&#47;' },
          matchHTML = /&(?!#?\w+;)|<|>|"|'|\//g;
      return function dotEH(code) {
         return code ? code.toString().replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : code;
      };
   }

   /* Здесь речь идет о контентных опциях. Когда внутри TMPL вставляют компонент,
    который заверстан в XHTML, то контентные опции в XHTML вставляются просто как строки.
    У нас контентные опции стали массивами. Каждый корень - своя функция построения верстки
    toString от массива расставит запятые между элементами у которых вызовет toString
    поэтому массивы склеим через join*/
   function getStringPresentation(obj) {
      return obj.join ? obj.join(""): obj.toString();
   }

   function wrapUndefinedSource() {
      return function dotWU(str) {
         return str === undefined ? '' : (
            str && typeof str === 'object' ? getStringPresentation(str) : '' + str
         );
      };
   }

   function encodeEvalSource() {
      var reEncodeEval = /\{\{([\s\S]+?)\}\}/g, replacement = '&#123;&#123;$1&#125;&#125;';
      return function dotEE(str) {
         while (reEncodeEval.test(str)) {
            str = str.replace(reEncodeEval, replacement);
         }
         return str;
      }
   }

   global.encodeHTML = encodeHTMLSource();
   global.wrapUndefined = wrapUndefinedSource();
   global.encodeEval = encodeEvalSource();

   var startend = {
      append: { start: "'+(encodeEval(wrapUndefined(",     end: ")))+'",      startencode: "'+encodeEval(wrapUndefined(encodeHTML(" },
      split:  { start: "';out+=(", end: ");out+='", startencode: "';out+=encodeHTML("}
   }, skip = /$^/;

   function resolveDefs(c, block, def) {
      return ((typeof block === 'string') ? block : block.toString())
            .replace(c.define || skip, function(m, code, assign, value) {
               if (code.indexOf('def.') === 0) {
                  code = code.substring(4);
               }
               if (!(code in def)) {
                  if (assign === ':') {
                     def[code]= value;
                  } else {
                     eval("def['"+code+"']=" + value);
                  }
               }
               return '';
            })
            .replace(c.use || skip, function(m, code) {
               var v = eval(code);
               return v ? resolveDefs(c, v, def) : v;
            });
   }

   function unescape(code) {
      return code.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, ' ');
   }

   doT.template = function(tmpl, c, def, silent) {
      c = c || doT.templateSettings;
      var cse = c.append ? startend.append : startend.split, str, needhtmlencode, sid=0, indv;

      if (c.use || c.define) {
         var olddef = global.def; global.def = def || {}; // workaround minifiers
         str = resolveDefs(c, tmpl, global.def);
         global.def = olddef;
      } else str = tmpl;

      str = ("var randomId = (typeof _randomId !== 'undefined' ? _randomId : undefined) || (function(){return this || (0, eval)('this')})().requirejs('Core/helpers/Number/randomId');" +
            "function escapeHtml(str) {return typeof str == \"string\" ? str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;') : str;}" +
            "var storage = (function() { return this || (0,eval)('this') })().wsDotVarStorage.storage;" +
            " var out='" + (c.strip ? str.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g,' ')
            .replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g,''): str)
            .replace(/'|\\/g, '\\$&')
            .replace(c.expertMode || skip, function(m, code) {
               return unescape(code);
            })
            .replace(c.translate || skip, function(m, code) {
               // экранируем апострофы
               return cse.start + "escapeHtml(rk('"+unescape(code.replace(/'/g, "\\'"))+"'))" + cse.end;
            })
            .replace(c.ref || skip, function (m, code) {
               return cse.start + '(function setRefValue(s, v){var k = randomId(); s[k] = v; return k;}(storage, ' + unescape(code) + '))' + cse.end;
            })
            .replace(c.encode || skip, function(m, code) {
               needhtmlencode = true;
               return cse.startencode + unescape(code) + cse.end;
            })
            .replace(c.interpolate || skip, function(m, code) {
               return cse.start + unescape(code) + cse.end;
            })
            .replace(c.conditional || skip, function(m, elsecase, code) {
               return elsecase ?
                     (code ? "';}else if(" + unescape(code) + "){out+='" : "';}else{out+='") :
                     (code ? "';if(" + unescape(code) + "){out+='" : "';}out+='");
            })
            .replace(c.iterate || skip, function(m, iterate, vname, iname) {
               if (!iterate) return "';} } out+='";
               sid+=1; indv=iname || "i"+sid; iterate=unescape(iterate);
               return "';var arr"+sid+"="+iterate+";if(arr"+sid+"){var "+vname+","+indv+"=-1,l"+sid+"=arr"+sid+".length-1;while("+indv+"<l"+sid+"){"
                     +vname+"=arr"+sid+"["+indv+"+=1];out+='";
            })
            .replace(c.evaluate || skip, function(m, code) {
               return "';" + unescape(code) + "out+='";
            })
            + "'; out = encodeEval(out); return out + (pp && out.indexOf('{{') !== -1 ? String.fromCharCode(8203,8203) : '');")
            .replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r')
            .replace(/\u2028/g, '\\n').replace(/\u2029/g, '\\n')
            .replace(/(\s|;|}|^|{)out\+='';/g, '$1').replace(/\+''/g, '')
            .replace(/(\s|;|}|^|{)out\+=''\+/g,'$1out+=');

      str = "var encodeEval=(" + encodeEvalSource.toString() + "());" +
            "var getStringPresentation=" + getStringPresentation.toString() + ";" +
            "var wrapUndefined=(" + wrapUndefinedSource.toString() + "());" +
            "var pp = typeof process !== 'undefined';" + str;
      if (needhtmlencode && c.selfcontained) {
         str = "var encodeHTML=(" + encodeHTMLSource.toString() + "());" + str;
      }
      try {
         return new Function(c.varname, str);
      } catch (e) {
         if (!silent) {
            IoC.resolve('ILogger').error("doT", "Could not create template function: " + str, e);
            throw e;
         }
      }
   };

   doT.compile = function(tmpl, def) {
      return doT.template(tmpl, null, def);
   };
   
   initVarStorage();
   
   return doT;
});
