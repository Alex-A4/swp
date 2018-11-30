define('Core/helpers/Hcontrol/replaceContainer', [
    'Core/helpers/Hcontrol/mergeAttributes',
    'Core/helpers/Object/find'

], function (mergeAttributes, objectFind) {
    /**
     *
     * Модуль, в котором описана функция <b>replaceContainer(container, markup)</b>.
     * Помещает xhtml разметку файла в контейнер создаваемого компонента
     *
     * Зовётся с браузера, либо с препроцессора; заполнит нужным содержимым компонент при создании.
     *
     * <h2>Параметры функции</h2>
     * <ul>
     *     <li><b>container</b> {HTML|jQuery} - контейнер.</li>
     *     <li><b>markup</b> {HTML} - xhtml разметка файла.</li>
     * </ul>
     *
     * <h2>Возвращает</h2>
     * {Node}
     *
     * @class Core/helpers/Hcontrol/replaceContainer
     * @public
     * @author Шипин А.А.
     */

    return function (container, markup) {
        var
            attributes,
            rCounter = 0,
            wsControl;

        markup = markup.replace(/(<\/?)option/g, function (str, bkt) {
            rCounter++;
            return bkt + 'opt';
        });

        if ("jquery" in container) { // from browser
            markup = $(markup);

            var foundNode = $(objectFind(markup, function(elem) {
                return elem.nodeType === 1
            }));

            // get unique class names
            var mergingClass = mergeAttributes(container.attr('class'), foundNode.attr('class'));

            attributes = {};
            // copy all the attributes to the shell
            $.each(container.get(0).attributes, function (index, attribute) {
                attributes[attribute.name] = attribute.value;
            });

            attributes['class'] = mergingClass.join(' ');// merge attribute "class"

            // assign attributes
            foundNode.attr(attributes);
            // copy wsControl
            wsControl = container[0].wsControl;
            // copy the data
            foundNode.data(container.data());
            // copy the handlers
            var events = jQuery._data(container[0], 'events');
            for (var type in events) {
                if (events.hasOwnProperty(type)) {
                    for (var handler in events[type]) {
                        if (events[type].hasOwnProperty(handler)) {
                            foundNode.on(type, events[type][handler].handler);
                        }
                    }
                }
            }
            container.off();
            // replace
            container.replaceWith(markup);

            if (markup.length > 0) {
                // emtpy jQuery collection
                container.length = 0;
                // add markup into empty collection
                container.push(foundNode.get(0));
                // copy wsControl
                container[0].wsControl = wsControl;
            }

            return container;
        }
        else { // from preprocessor
            var
                document = container.ownerDocument,
                id = container.getAttribute('id'),
                element = document.createElement('div'),
                attrsToMerge, firstElt, values, result;

            attrsToMerge = {
                'class': 1
            };

            element.innerHTML = markup;
            firstElt = element.firstChild;

            while (firstElt && firstElt.nodeType != 1) {
                firstElt = firstElt.nextSibling;
            }

            if (firstElt) {
                attributes = container.attributes;
                for (var i = 0, l = attributes.length; i < l; i++) {
                    var attr = attributes[i], attrname = attr.nodeName;
                    if (attrname in attrsToMerge) {
                        values = mergeAttributes(attr.nodeValue, firstElt.getAttribute(attrname));
                        firstElt.setAttribute(attrname, values.join(' '));
                    } else {
                        if (!firstElt.hasAttribute(attrname)) {
                            firstElt.setAttribute(attrname, attr.nodeValue);
                        }
                    }
                }

                result = firstElt;
                container.parentNode.replaceChild(result, container);
                result.setAttribute('hasMarkup', 'true');
            } else {
                result = container;
            }

            result.setAttribute("hasMarkup", "true");
            return result;
        }
    };
});