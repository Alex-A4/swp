define('View/Builder/Tmpl/modules/utils/conditional', [
   'View/Builder/Tmpl/expressions/process',
   'View/Builder/Tmpl/handlers/error'
], function (processExpressions, errorHandling) {
   /**
    * Retrieving value from tag constructions
    */
   return function challenge(tag, property, isText, data) {
      var source, fromAttr, tagData;
      try {
         fromAttr = tag.attribs.hasOwnProperty(property);
         tagData = fromAttr ? tag.attribs[property].data : tag.attribs.data.data;
         if (!isText) {
            tagData[0].noEscape = true;
         }

         source = {
            fromAttr: fromAttr,
            value: isText ? tagData.value.trim() : processExpressions(tagData[0], data, this.calculators, this.filename)
         };
      } catch (err) {
         errorHandling('There is no data for "' + property + '" module to use. Tag: <' + tag.name + '>', this.filename, err);
      }
      return source;
   };
});