var root = process.cwd(),
   fs = require('fs');

var fullCode = '';
var ignore = ['Lib', 'Ext', 'Controls-demo', 'SBIS3.CONTROLS', 'WS.Core', 'requirejs', 'polyfill'];
var ignoreFiles = ['sw.min.js'];
var regexp1 = /(.*).min.js$/;
var regexp2 = /(.*).min.wml$/;
var themes = [/(.*)_desktop.css$/, /(.*)_mobile.css$/];
var fullCss = ['', ''];
var fullCssNames = ['all_desktop.css', 'all_mobile.css'];


function getFullCode(src){
    var stats = fs.statSync(src);
    var isDirectory = stats.isDirectory();
    if (isDirectory) {
        fs.readdirSync(src).forEach(function(childItemName) {
            if (!ignore.includes(childItemName)){
                getFullCode(src + '/' + childItemName);
            }
        });
    } else {
        if (regexp1.test(src) || regexp2.test(src)) {
            var nameFile = src.split('/');
            if(!ignoreFiles.includes(nameFile.pop())){
                fullCode += '\n' + fs.readFileSync(src, 'utf8');
            }
        }
        themes.forEach((item, index) => {
            if (item.test(src)){
                fullCss[index] += fs.readFileSync(src, 'utf8');
            }
        })
    }
}

getFullCode('application');

fs.writeFileSync("application/w.js", fullCode);

fullCssNames.forEach((item, index) => {
    fs.writeFileSync('application/' + item, fullCss[index]);
});