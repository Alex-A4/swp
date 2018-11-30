define('Core/markup/parse', [
    'require',
    'Core/Serializer',
    'Core/ConsoleLogger',
    'Core/detection',
    'Core/core-merge',
    'Core/helpers/Hcontrol/configStorage',
    'Core/helpers/Hcontrol/variableStorage',
    'Core/IoC'
], function (
    require,
    Serializer,
    ConsoleLogger,
    detection,
    coreMerge,
    configStorage,
    variableStorage
) {
    var
        reOpt = /^(option|opt)$/i,
        reOpts = /^(options|opts)$/i,
        reOptsIgnoreAttrNames = /^name|bind|nonexistent|type|direction$/i,
        reArray = /^array$/i,
        varStorage = variableStorage.getValue(),
        configDelimeter = ',';

    function lcFirst(str) {
        return str.substr(0, 1).toLowerCase() + str.substr(1);
    }

    function getDataSourceFromDeclaration(declaration) {
        var parts = declaration.split(':'),
            result;
        try {
            result = require(parts[0]);
            if (parts[1]) {
                var data = result.contents && result.contents[parts[1]];
                result = {
                    readerParams: {
                        adapterType: "TransportAdapterStatic",
                        adapterParams: {
                            data: data
                        }
                    }
                };
            }
        }
        catch (e) {
            throw new Error('Parsing datasource declaration "' + declaration + '" failed. Message:' + e.massage);
        }
        return result;
    }

    function getHTML(where, what) {
        var property = what + 'HTML';
        if (typeof where[property] == 'function') {
            return where[property]();
        } else {
            return where[property];
        }
    }

    function containsElementNodes(node) {
        var child;
        if (node.childNodes.length > 0) {
            for (var i = 0, l = node.childNodes.length; i < l; i++) {
                child = node.childNodes[i];
                if (child.nodeType !== 3) {
                    return true;
                }
            }
        }
        return false;
    }

    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function parseElem(elem) {
        var result;

        function parseValue(valueAttr, valTypeAttr, content) {
            var
                ok, value, rawValue, key;

            if (content && content.length) {
                rawValue = content.trim();
            }
            else if (valueAttr !== null) {
                rawValue = valueAttr;
            } else {
                rawValue = undefined;
            }

            ok = rawValue !== undefined;

            switch (valTypeAttr) {
                case 'function':
                    if (ok) {
                        value = Serializer.getFuncFromDeclaration(rawValue);
                    }
                    break;

                case 'ref':
                    if (ok) {
                        key = rawValue;
                        value = varStorage.storage[key];
                        delete varStorage.storage[key];
                    }
                    break;

                case 'null':
                {
                    value = null;
                    ok = true;
                }
                    break;

                case 'date':
                {
                    /* Все старые IE до EDGE не могут распарсить дату в SQL формате,
                     поэтому для IE парсим даты через наш Date.formSQL */
                    if (typeof(rawValue) === 'string') {
                        value = new Date(rawValue);
                        if (value.toString() === 'Invalid Date' && detection.isIE) {
                            value = Date.fromSQL(rawValue);
                        }
                    }
                    ok = true;
                }
                    break;

                case 'undefined':
                {
                    value = undefined;
                    ok = true;
                }
                    break;

                case 'string':
                    if (ok) {
                        value = rawValue;
                    }
                    break;

                default:
                    if (ok) {
                        if (isNumber(rawValue)) {
                            //is number
                            //проверяем наличие лидирующих нулей (строка 0001234 - не должна быть преобразована в число)
                            value = rawValue.length > 1 && rawValue[0] === '0' && rawValue.indexOf('.') === -1 ?
                                rawValue :
                                parseFloat(rawValue);
                        }
                        else if (rawValue === 'false') {
                            //is boolean "false"
                            value = false;
                        }
                        else if (rawValue === 'true') {
                            //is boolean "true"
                            value = true;
                        }
                        else if (rawValue === 'null') {
                            value = null;
                        }
                        else if (rawValue === 'undefined') {
                            value = undefined;
                        }
                        else if (/^datasource!/.test(rawValue)) {
                            value = getDataSourceFromDeclaration(rawValue);
                        } else {
                            value = rawValue;
                        }
                    }
            }

            return {
                ok: ok,
                value: value
            };
        }

        function setBinding(elem, result, subBindings) {
            var
                bindTo = elem.getAttribute('bind'),
                nonexistentAttr = elem.getAttribute('nonexistent'),
                nonexistentTypeAttr = elem.getAttribute('nonexistentType'),
                nonExistent;
            if (bindTo || subBindings.length > 0) {
                nonExistent = parseValue(nonexistentAttr, nonexistentTypeAttr, undefined);

                var oneWay = elem.getAttribute('oneWay') === 'true';
                if (!oneWay) {
                    if (elem.getAttribute('oneway') !== null) {
                        /**
                         * Когда берут верстку и оборачивают ее в jQuery все атрибуты становятся нижним регистром!
                         * Такое прилетает когда есть кнопка с атрибутом и ее вставляют в кнопку с меню
                         */
                        /**
                         * Убрал ошибку в логах, потому что умеем корректно отрабатывать агрумент написанный
                         * маленькими буквами и от текущих биндов отказываемся. Этот артефакт будет
                         * удален как класс
                         */
                        oneWay = elem.getAttribute('oneway') === 'true';
                    }
                }
                result.binding = {
                    fieldName: bindTo,
                    nonExistentValue: nonExistent.ok ? nonExistent.value : undefined,
                    bindNonExistent: nonExistent.ok,
                    propName: result.name,
                    oneWay: oneWay,
                    direction: elem.getAttribute('direction') || 'fromContext'
                };

                if (subBindings.length > 0) {
                    result.binding.subBindings = subBindings;
                }
            }
        }

        if (elem.nodeType === 3) { //TEXT_NODE
            //если это любой непробельный символ - считаем, что это часть контента, иначе скорее всего перевод строки - пропускаем
            result = /\S/.test(elem.text || elem.textContent) ? {
                name: 'content',
                value: (elem.text || elem.textContent)
            } : false;
        }
        else if (reOpt.test(elem.nodeName)) {
            var
                obj = {},
                content,
                val = elem.getAttribute('value'),
                valType = elem.getAttribute('type'),
                spreadOptions = elem.getAttribute('spreadOptions'),
                parsed;

            content = getHTML(elem, 'inner');

            obj.name = elem.getAttribute('name');
            parsed = parseValue(val, valType, content);
            if (parsed.ok) {
                obj.value = parsed.value;
            }
            obj.spread = spreadOptions === 'true';

            setBinding(elem, obj, []);

            result = obj;
        }
        else if (reOpts.test(elem.nodeName)) {
            var
                isArray = reArray.test(elem.getAttribute('type')),
                res = isArray ? [] : {},
                attr,
                bindings = [],
                childRes,
                childNodes = elem.childNodes;

            // считаем атрибуты свойствами объекта только если у него нет дочерних нод (исключая текстовые)
            if (!isArray && !containsElementNodes(elem)) {
                for (var aI = 0, attrs = elem.attributes, aL = attrs.length; aI < aL; aI++) {
                    attr = attrs[aI];
                    if (!reOptsIgnoreAttrNames.test(attr.name)) {
                        res[attr.name] = attr.value;
                    }
                }
            }

            var bindingsCount = 0;
            for (var i = 0, l = childNodes.length; i < l; i++) {
                childRes = parseElem(childNodes[i]);
                if (childRes) {
                    if (isArray) {
                        if (childRes.binding) {
                            // вычисляя индекс учитываем как количество опций, так и количество биндингов без value
                            childRes.binding.index = res.length + bindingsCount;
                            bindings.push(childRes.binding);
                        }
                        if ('value' in childRes) {
                            res.push(childRes.value);
                        } else {
                            // сохраняем количество биндингов без атрибута value
                            bindingsCount++;
                        }
                    }
                    else if (childRes.name == 'content' && res.content) {
                        res.content += childRes.value;
                    }
                    else {
                        if ('value' in childRes) {
                            res[childRes.name] = childRes.value;
                        }

                        if (childRes.binding) {
                            bindings.push(childRes.binding);
                        }
                    }
                }
            }

            result = {
                name: elem.getAttribute('name') || 'Object',
                value: res,
                spread: elem.getAttribute('spreadOptions') === 'true'
            };

            setBinding(elem, result, bindings);
        }
        else if ('outerHTML' in elem) {
            result = {name: "content", value: getHTML(elem, 'outer')};
        }

        return result;
    }

    function getOldStyleBindings(node) {
        var
            parserModule = 'Lib/Control/AttributeCfgParser/AttributeCfgParser',
            attributeCfgParser = require.defined(parserModule) ? require(parserModule) : null,
            attr = attributeCfgParser && node.getAttribute("data-bind"),
            result;

        if (attr) {
            var
                afterparse = attributeCfgParser(attr);
            result = Object.keys(afterparse).map(function(propName) {
                return {
                    fieldName: afterparse[propName],
                    propName: lcFirst(propName),
                    oneWay: false
                };
            });
        } else {
            result = [];
        }
        return result;
    }

    function parseConfigFromDOM(cfg, node) {

        var
            childNodes = node.childNodes,
            bindings = [],
            oldStyleBindings = getOldStyleBindings(node),
            outerHTML;

        if (childNodes.length) {
            for (var i = 0, l = childNodes.length; i < l; i++) {
                var field = parseElem(childNodes[i]);
                if (field) {
                    if (field.name === 'content') {
                        /**
                         * Если content описан в новом стиле и это функция,
                         * то ничего никуда прибавлять не надо. Это просто опция,
                         * которую выводят через ws:partial
                         * */
                        if (typeof cfg.content !== 'function') {
                           /**
                            * А теперь content может быть массивом функций
                            */
                           if (cfg.content && typeof cfg.content[0] === 'function') {
                              continue;
                           }
                           cfg.content = cfg.content || '';
                           cfg.content += field.value;
                        }
                    }
                    else {
                        if (field.hasOwnProperty('value')) {
                            if (field.spread) {
                                coreMerge(cfg, field.value);
                            }
                            else {
                                cfg[field.name] = field.value;
                            }
                        }

                        if (field.binding) {
                            if (!field.spread) {
                                bindings.push(field.binding);
                            } else {
                                outerHTML = childNodes[i].outerHTML;
                                if (typeof outerHTML === 'function') {
                                    outerHTML = childNodes[i].outerHTML();
                                }
                                ConsoleLogger.error('markup-helpers', 'Атрибут binding нельзя использовать вместе с атрибутом spreadOptions: ' + outerHTML);
                            }
                        }
                    }
                }
            }
        }

        if (bindings.length + oldStyleBindings.length > 0) {
            //Если вешать старые data-bind на тег component то в итоге падает ошибка, т.к. в bindings ожитаются объекты
            //у которых name это строка, а у старых биндингов это объект. Андрей Шипин сказал закоментировать данный код.
            cfg.bindings = bindings.concat(oldStyleBindings);
            //cfg.bindings = bindings;
        }

        return cfg;
    }

    function getConfigObject(config, node) {
        var cfg = configStorage.getValue(config), name;
        // если есть атрибут name, занесем его в конфиг
        if (!('name' in cfg)) {
            name = node.getAttribute('name');
            if (name) {
                cfg.name = name;
            }
        }
        return cfg;
    }

    function getConfigByNode(node) {
        var
            config = node.getAttribute('config'),
            confResult,
            resultConfig;
        if (config) {
            confResult = config.split(configDelimeter);
            if (confResult.length > 1) {
                resultConfig = confResult.map(function (cfg) {
                    return getConfigObject(cfg, node);
                });
                resultConfig.__doubleconfig = true;
                return resultConfig;
            }
        }
        return getConfigObject(config, node);
    }

    /**
     * Модуль, в котором описана функция <b>parse(node)</b>.
     *
     * Превращает переданный контейнер в конфиг компонента, содержащий ссылку на элемент DOM дерева
     * Возвращает объект.
     *
     * @class Core/markup/parse
     * @public
     * @author Мальцев А.А.
     */
    return function(node) {
        // Попробуем получить конфиг с самой ноды
        var cfg = getConfigByNode(node);

        if (node.cloneNode) {
            // Если работает с настоящей DOM-нодой
            if (node.getAttribute('hasMarkup') != 'true') {
                // И у нее нет разметки, попробуем дополнить конфиг из разметки
                cfg = parseConfigFromDOM(cfg, node);
            }
            // Заполним свойство element текущей нодой, на которой проводим разбор
            if (cfg) {
                if (cfg.length) {
                    cfg = cfg.map(function (conf) {
                        conf.element = node;
                        return conf;
                    });
                    cfg.__doubleconfig = true;
                } else {
                    cfg.element = node;
                }
            }
        } else {
            // Если это не настоящая нода (ParserUtilities-нода) - просто считаем конфиг
            cfg = parseConfigFromDOM(cfg, node);
        }

        return cfg;
    };
});