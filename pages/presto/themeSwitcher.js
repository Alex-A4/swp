function setBodyModifiers(theme) {
    var $html = $('html'),
        themeLinks = {
            carry: {
                CONTROLS_THEME: '/../components/themes/carry/carry'
            },
            presto: {
                CONTROLS_THEME: '/../components/themes/presto/presto'
            },
            carry_m: {
                CONTROLS_THEME: '/../components/themes/carry_medium/carry_medium'
            },
            presto_m: {
                CONTROLS_THEME: '/../components/themes/presto_medium/presto_medium'
            },
            online: {
                CONTROLS_THEME: '/../pages/presto/online'
            }
        },
        setCurrentThemeLinks = function (theme) {
            var createCSSLink = function (id, href) {
                var cssLink = document.createElement('link'),
                    headDOMElement = document.getElementsByTagName('head')[0],
                    element = document.getElementById(id),
                    onLoadHandler = function(){
                        headDOMElement.removeChild(element);
                        cssLink.removeEventListener('load',onLoadHandler);
                    };
                cssLink.id = id;
                cssLink.href = href + '.css';
                cssLink.rel='stylesheet';
                cssLink.type='text/css';
                if (element) {
                    if (cssLink.href === element.href) {
                        /*стиль актуальный, не обновляем*/
                        return;
                    } else {
                        cssLink.addEventListener('load', onLoadHandler);
                        headDOMElement.appendChild(cssLink);
                    }
                } else {
                    headDOMElement.appendChild(cssLink);
                }
            };
            createCSSLink('controlsThemeStyle', theme.CONTROLS_THEME);
            $('link').each(function(index, elem) {
                if (~elem.href.indexOf('components') && !~elem.href.indexOf('components/themes')) {
                    elem.remove();
                }
            });
        };
    setCurrentThemeLinks(themeLinks[theme]);
    $html.removeClass();
    $html.addClass(theme);
    if (~window.location.href.indexOf('theme=')){
        window.history.pushState({themeName:theme},"",  window.location.href.replace(/theme=(.*)($|&)/, 'theme=' + theme));
    }
}
function prepareBody() {
    $('<link class="beforeChange" rel="stylesheet" type="text/css" href="../../components/themes/carry/carry.css"/>').appendTo('head');
    $('<link class="beforeChange" rel="stylesheet" type="text/css" href="../../components/themes/presto/presto.css"/>').appendTo('head');
    if(!~document.location.search.indexOf('theme')) {
        window.setBodyModifiers('presto', '');
    }
    $('.beforeChange').remove();
    $('body').css('padding', ' 46px 10px 10px 10px')
        .addClass('controls-default-bg');
    $('<div style="z-index: 99999; position: fixed; top: 10px; right: 10px; width: 200px; border: 1px solid #ffcc99; color: #ffcc99; background-color: #1D2834 !important; text-align: center; cursor: pointer">presto</div>')
        .on('click',function(){window.setBodyModifiers('presto', '');})
        .appendTo('body');
    $('<div style="z-index: 99999; position: fixed; top: 10px; right: 214px; width: 200px; border: 1px solid #8991A9; color: #8991A9; background-color: #ffffff !important; text-align: center; cursor: pointer">carry</div>')
        .on('click',function(){window.setBodyModifiers('carry', '');})
        .appendTo('body');
    $('<div style="z-index: 99999; position: fixed; top: 10px; right: 418px; width: 200px; border: 1px solid #ffcc99; color: #ffcc99; background-color: #1D2834 !important; text-align: center; cursor: pointer">presto_m</div>')
        .on('click',function(){window.setBodyModifiers('presto_m', '');})
        .appendTo('body');
    $('<div style="z-index: 99999; position: fixed; top: 10px; right: 622px; width: 200px; border: 1px solid #8991A9; color: #8991A9; background-color: #ffffff !important; text-align: center; cursor: pointer">carry_m</div>')
        .on('click',function(){window.setBodyModifiers('carry_m', '');})
        .appendTo('body');
    $('<div style="z-index: 99999; position: fixed; top: 10px; right: 826px; width: 200px; border: 1px solid #8991A9; color: #8991A9; background-color: #ffffff !important; text-align: center; cursor: pointer">online</div>')
        .on('click',function(){window.setBodyModifiers('online', '');})
        .appendTo('body');
}
require(['Core/core-init'],function () {
    var old_load = require('css').load;
    require('css').load = function(name, require, load){
        if (name.indexOf('SBIS3.CONTROLS.Demo') === -1 &&  (name.indexOf('SBIS3.CONTROLS') !== -1 || name.indexOf('Controls/') !== -1))     {
            load(null); return;
        } else {
            old_load.apply(this, arguments)
        }
    };
    prepareBody();
});