define('Core/helpers/Hcontrol/showHoverFloatArea', [
   'Core/helpers/Hcontrol/showFloatArea'
], function (
   showFloatArea
) {
   'use strict';

  return function (element, hovered, config) {
     var
        hover = hovered || false,
        block = $(element).bind('mouseenter.wsShowHoverFloatArea', function () {
           hover = true;
        }).bind('mouseleave.wsShowHoverFloatArea', function () {
           hover = false;
        });

     config.autoShow = false;
     config.hoverTarget = element;

     return showFloatArea(config).addCallback(function (area) {
        block.unbind('.wsShowHoverFloatArea');
        if (hover) {
           area.show();
        }
        return area;
     });
  };
});
