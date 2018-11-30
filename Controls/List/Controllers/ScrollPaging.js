/**
 * Created by kraynovdo on 13.11.2017.
 */
define('Controls/List/Controllers/ScrollPaging',
   [
      'Core/core-simpleExtend'
   ],
   function(cExtend) {
      /**
       *
       * @author Авраменко А.С.
       * @public
       */
      
      var _private = {
         getStateByHasMoreData: function(hasMoreData) {
            return hasMoreData ? 'normal' : 'disabled';
         }
      };

      var Paging = cExtend.extend({
         _curState: null,

         constructor: function(cfg) {
            this._options = cfg;
            Paging.superclass.constructor.apply(this, arguments);

            this.handleScrollTop();
         },


         handleScroll: function() {
            if (!(this._curState === 'middle')) {
               this._options.pagingCfgTrigger({
                  stateBegin: 'normal',
                  statePrev: 'normal',
                  stateNext: 'normal',
                  stateEnd: 'normal'
               });
               this._curState = 'middle';
            }
         },

         handleScrollTop: function(hasMoreData) {
            var statePrev = _private.getStateByHasMoreData(hasMoreData);
            if (!(this._curState === 'top')) {
               this._options.pagingCfgTrigger({
                  stateBegin: statePrev,
                  statePrev: statePrev,
                  stateNext: 'normal',
                  stateEnd: 'normal'
               });
               this._curState = 'top';
            }
         },

         handleScrollBottom: function(hasMoreData) {
            var stateNext =  _private.getStateByHasMoreData(hasMoreData);
            if (!(this._curState === 'bottom')) {
               this._options.pagingCfgTrigger({
                  stateBegin: 'normal',
                  statePrev: 'normal',
                  stateNext: stateNext,
                  stateEnd: stateNext
               });
               this._curState = 'bottom';
            }

         },

         handleScrollEdge: function(direction, hasMoreData) {
            switch (direction) {
               case 'up': this.handleScrollTop(hasMoreData.up); break;
               case 'down': this.handleScrollBottom(hasMoreData.down); break;
            }
         },


         destroy: function() {
            this._options = {};
         }

      });

      Paging._private = _private;
      
      return Paging;
   });
