/**
 * Миксин используют для пометки компонента, что для него применеяется {@link Core/WindowManager} для получения zIndex.
 * Подобные компоненты являются самостоятельной областью на веб-странице и могут накладываться друг на друга в определенном порядке. Это подобно третьему измерению, перпендикулярному экрану.
 *
 * Использование миксина позволяет установить поведение, при котором подобные компоненты при получении фокуса не закрывали {@link Lib/Control/FloatArea/FloatArea}, потерявшую фокус.
 * FloatArea в третьем измерении располагается ниже, чем такие компоненты.
 * Компоненты могут располагаться снаружи верстки компонентов, из которых они были вызваны.
 * Например, диалоговое окно сохранения может быть вызвано из стековой панели, и будет располагаться в body веб-страницы,
 * однако логически такие компоненты являются дочерними по отношению к вызвавшим их компонентам.
 *
 * Если для диалогового окна произвести клик на кнопку "Ок", фокус передастся со стековой панели диалоговому окну (происходит событие {@link Core/WindowManager#onAreaFocus}).
 * При переносе фокуса для FloatArea происходит проверка: может ли она быть закрыта, никто ли не удерживает ее (метод {@link Lib/Control/FloatArea/FloatArea#_shouldHideByFocusMoveTo}).
 * Чтобы FloatArea была закрыта, должны быть выполнены следующие условия:
 * <ul>
 *    <li>FloatArea должна быть видимой;<li>
 *    <li>Для FloatArea должна быть установлена опция {@link Lib/Control/FloatArea/FloatArea#autoHide};</li>
 *    <li>Компонент, в который был передан фокус, не должен вести по цепочке связей между компонентами к FloatArea и должен находиться не выше в третьем измерении относительно FloatArea.</li>
 * </ul>
 *
 * Цепочка связей между компонентами определяется опцией компонента opener, либо вложенностью разметки компонента в верстке веб-страницы (метод {@link Lib/Control/Control#getParent}).
 *
 * У компонента, функционал которого расширяется миксином, должен быть рабочий метод getZIndex. Он возвращает актуальную координату третьего измерения, чтобы можно было определить, находится ли компонент выше FloatArea.
 * @public
 * @class Lib/Mixins/LikeWindowMixin
 * @author Бегунов А.В.
 * @deprecated
 */
define('Lib/Mixins/LikeWindowMixin', ['Core/CommandDispatcher', "Core/IoC"], function(CommandDispatcher, IoC) {

   return /** @lends Lib/Mixins/LikeWindowMixin.prototype */ {
      $protected: {
         _options: {
            /**
             * @cfg {Boolean} В контроле, у которого есть миксин LikeWindowMixin, переход по табам идёт циклично:
             * когда фокус переходит на последний контрол, следующее нажатие на Tab активирует контрол, первый в порядке обхода.
             */
            ignoreTabCycles: false
         }
      },
      $constructor: function() {
         if (!this.getParent()) {
            //Панель располагается в body, который на определенных страницах является частью компонента OnlineBaseInnerMinCoreView.
            //Физически этот компонент является parent'ом FloatArea, указываем его. Нужно для поддержания существующей логики
            //активации (setActive) компонента, перехода фокуса.
            this._parent = $('body').wsControl();
            this._options.parent = this._parent;
         }
         // на resizeYourself команду перерисовываем только себя, не трогая children.
         // Сейчас команда отправляется только из ListView когда его items изменились (а значит могли измениться размеры)
         CommandDispatcher.declareCommand(this, 'resizeYourself', function () {
            this._resizeInner && this._resizeInner();
            if (!this._resizeInner) {
               IoC.resolve('ILogger').error('LikeWindowMixin::_resizeInner', 'Необходимо реализовать метод перерисовки _resizeInner, вызываемый на команду resizeYourself');
            }
            return true; //останавливаю всплытие выше likeWindowMixin'a
         }.bind(this));
      }
   };
});