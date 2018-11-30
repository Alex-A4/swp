define('Lib/Mixins/BreakClickBySelectMixin', [
   'Core/detection'
], function(detection) {
    /**
     * Миксин, предотвращающий вызов обработчика клика, при выделении текста внутри контрола.
     * @mixin Lib/Mixins/BreakClickBySelectMixin
     * @public
     * @author Крайнов Д.О.
     * @deprecated
     */

    var BreakClickBySelectMixin = /**@lends Lib/Mixins/BreakClickBySelectMixin.prototype  */{
        _hasSelectionInContainer: function() {
            var selection = this._getSelection();

            if (detection.firefox) {
               // костыль. Так случилось, что если кликаем на элемент, который display=flex, находится selection типа Range, будто бы есть выделение, а его нет
               // https://jsfiddle.net/xz54ngvy/3/ - если убрать флексы, и кликать на область справа от текста, все будет ок
               if (selection && selection.focusNode instanceof Element) {
                  if ($(selection.focusNode).css('display') && selection.type === 'Range' && selection.toString().trim() === '') {
                     return false;
                  }
               }
            }

            return selection && !selection.isCollapsed && !!this._container.find(selection.focusNode).length;
        },
        _getSelection: function() {
            return window.getSelection ? window.getSelection() : null;
        },
        around: {
            _onClickHandler: function(parentFunc, event) {
                // Вызываем обработчик клика, только если нет выделения в контейнере контрола или на кликнутом
                // элементе висит user-select: none, так как в таком случае выделение не сбрасывается по
                // mousedown в Chrome и Firefox
                if (!this._hasSelectionInContainer() || $(event.target).css('user-select') === 'none') {
                   parentFunc.call(this, event);
                }
            }
        }
    };

    return BreakClickBySelectMixin;
});