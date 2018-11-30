let exports1 = {};
var guid = generateGUID();
let modules = Object.create(null);
modules["require"] = req;
modules["exports"] = exports1;
exports1["getGUID"] = function () {
    return guid;
};
function generateGUID() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}
const paths = {
    'Lib/ServerEvent/native/': '../native/',
    'Lib/ServerEvent/worker/': './'
};
/**
 * Заглушка define для поддержки AMD в worker
 * @param name
 * @param dependences <strong>Не поддерживаем зависимости</strong>
 * @param module
 */
self['define'] = function (name, dependences, module) {
    name = name.toLocaleLowerCase();
    let deps = [];
    if (dependences instanceof Array) {
        deps = self['require'](dependences);
    }
    modules[name] = module.apply(self, deps);
};
function requireOne(name) {
    let regName = name.toLocaleLowerCase();
    if (regName in modules) {
        return modules[regName];
    }
    let path = name;
    for (let tmpl in paths) {
        if (!paths.hasOwnProperty(tmpl)) {
            return;
        }
        path = path.replace(tmpl, paths[tmpl]);
    }
    importScripts(`${path}.js`);
    if (regName in modules) {
        return modules[regName];
    }
    console.error(`Module ${name} is not imported yet. (${path})`); // eslint-disable-line no-console
}
self['require'] = req;
function req(arg) {
    if (typeof arg == "string") {
        return requireOne(arg);
    }
    if (!(arg instanceof Array)) {
        console.error(`Wrong argument ${arg}`); // eslint-disable-line no-console
        return;
    }
    let result = [];
    for (let name of arg) {
        result.push(requireOne(name));
    }
    return result;
}
