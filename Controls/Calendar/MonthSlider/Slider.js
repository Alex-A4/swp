define('Controls/Calendar/MonthSlider/Slider', [
   'Core/Control',
   'Core/core-merge',
   'WS.Data/Type/descriptor',
   'wml!Controls/Calendar/MonthSlider/Slider/Slider',
   'css!theme?Controls/Calendar/MonthSlider/Slider/Slider'
], function(
   BaseControl,
   coreMerge,
   types,
   tmpl//,
   // IMonth
) {

   'use strict';

   /**
    * Slider. Renders the element by template. Redraws with animation when changing data.
    * For example, the previous element leaves to the left, and the next one floats to the right.
    *
    * @class Controls/Calendar/MonthSlider/Slider
    * @extends Core/Control
    * @control
    * @public
    * @author Миронов А.Ю.
    * @noShow
    */

   // Компонент можно сделать публичным, но надо придумать более подходящее название. Данный компонент не листает
   // переданные ему контейнеры как это делает класический слайдер, а анимирует смену данных используя один и тот же шаблон.
   // Приватные методы и константы, возможно, можно выделить в отдельный слой абстракции для анимаций и
   // переиспользовать в других компонентах.

   var
      ANIMATIONS_DATA = {
         slideRight: {
            preAnimationInClasses: 'controls-MonthSlider-Slider__slideLeftRight-left',
            preAnimationOutClasses: 'controls-MonthSlider-Slider__slideLeftRight-center',
            animationInClasses: 'controls-MonthSlider-Slider__slideLeftRight-animate controls-MonthSlider-Slider__slideLeftRight-center',
            animationOutClasses: 'controls-MonthSlider-Slider__slideLeftRight-animate controls-MonthSlider-Slider__slideLeftRight-right'
         },
         slideLeft: {
            preAnimationInClasses: 'controls-MonthSlider-Slider__slideLeftRight-right',
            preAnimationOutClasses: 'controls-MonthSlider-Slider__slideLeftRight-center',
            animationInClasses: 'controls-MonthSlider-Slider__slideLeftRight-animate controls-MonthSlider-Slider__slideLeftRight-center',
            animationOutClasses: 'controls-MonthSlider-Slider__slideLeftRight-animate controls-MonthSlider-Slider__slideLeftRight-left'
         }
      },
      ANIMATIONS = {
         slideRight: 'slideRight',
         slideLeft: 'slideLeft'
      };

   var _private = {
      _prepareAnimation: function(self, itemData) {
         var item = _private._getDisplayedItem(self);

         // Обновлем данные в новом представлении
         item.data = itemData;

         // Перед анимацией новое представление невидимо.
         // Устанавливаем классы подготавливающие его к анимации. Но класс анимации не устанавливаем.
         item.transitionClasses = ANIMATIONS_DATA[self._inAnimation].preAnimationInClasses;

         // У старого представления сбрасываем класс анимации, оставляем только классы устанавливающие его текущее состояние.
         item = _private.getNotDisplayedItem(self);
         item.transitionClasses = ANIMATIONS_DATA[self._outAnimation].preAnimationOutClasses;
      },

      _animate: function(self) {
         var month;

         // Применим класс анимации к новому представлению что бы оно плавно появилось.
         month = _private._getDisplayedItem(self);
         month.transitionClasses = ANIMATIONS_DATA[self._inAnimation].animationInClasses;

         // Применим класс анимации и нового состояния к старому представлению что бы оно плавно исчезло.
         month = _private.getNotDisplayedItem(self);
         month.transitionClasses = ANIMATIONS_DATA[self._outAnimation].animationOutClasses;
      },

      _getDisplayedItem: function(self) {
         return self._items[self._currentItem];
      },

      getNotDisplayedItem: function(self) {
         return self._items[(self._currentItem + 1) % 2];
      }
   };

   var Component = BaseControl.extend({
      _template: tmpl,

      _items: null,
      _currentItem: 0,
      _inAnimation: null,
      _outAnimation: null,
      _animationState: 0,

      _beforeMount: function(options) {
         this._items = [{
            data: options.data,
            transitionClasses: ''
         }, {
            data: options.data,
            transitionClasses: ''
         }];
      },

      _beforeUpdate: function(options) {
         this._inAnimation = options.inAnimation || options.animation;
         this._outAnimation = options.outAnimation || options.animation;
         if (this._options.data !== options.data) {
            this._currentItem = (this._currentItem + 1) % 2;

            // Подготавливаем контролы к анимации. Vdom применит модель чуть позже.
            // Анимацию начнем после это в _afterUpdate.
            _private._prepareAnimation(this, options.data);
            this._animationState = 1;
            this._forceUpdate();
         }
      },

      _afterUpdate: function() {
         // Запускаем анимацию после вызова _prepareAnimation.
         // При других обновлениях интерфейса анимацию запускать не надо.
         if (this._animationState === 1) {
            // Хак. Эта функция вызывается синхронно после того как vdom применил классы установленные в _prepareAnimation.
            // Необходимо что бы браузер пересчитал верстку, что бы контейнеры переместились в нужные позиции.
            // В тестах нет dom и соответсвенно ссылок на контейнеры
            if (this._children.container0 && this._children.container1) {
               this._children.container0.offsetWidth;
               this._children.container1.offsetWidth;
            }

            _private._animate(this);

            this._animationState = 2;
            this._forceUpdate();
         }
      }

   });

   Component.ANIMATIONS = ANIMATIONS;

   Component.getDefaultOptions = function() {
      return coreMerge({
         animation: ANIMATIONS.slideRight,
         inAnimation: undefined,
         outAnimation: undefined,
         data: undefined
      });
   };

   /**
    * @typedef {String} AnimationType
    * @variant 'slideRight' Move the animated element to the right.
    * @variant 'slideLeft' Move the animated element to the left.
    */

   Component.getOptionTypes = function() {
      return coreMerge({

         /**
          * @name Controls/Calendar/MonthSlider/Slider#animation
          * @cfg {AnimationType} The type of animation used to turn the items.
          * @see inAnimation
          * @see outAnimation
          */
         animation: types(String).required(),

         /**
          * @name Controls/Calendar/MonthSlider/Slider#inAnimation
          * @cfg {AnimationType} The type of animation used when the item appears.
          * @see animation
          * @see outAnimation
          */
         inAnimation: types(String),

         /**
          * @name Controls/Calendar/MonthSlider/Slider#outAnimation
          * @cfg {AnimationType} The type of animation used when the item disappears.
          * @see animation
          * @see inAnimation
          */
         outAnimation: types(String),

         /**
          * @name Controls/Calendar/MonthSlider/Slider#data
          * @cfg {Object} When this option changes, the content disappears smoothly, and in its place the new content drawn with this data smoothly appears.
          * @see animation
          * @see inAnimation
          * @see outAnimation
          */
         data: types(Object)

         /**
          * @name Controls/Calendar/MonthSlider/Slider#content
          * @cfg {Content} Template of displayed content.
          */
      });
   };

   return Component;
});
