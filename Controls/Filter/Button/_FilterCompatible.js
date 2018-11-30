/**
 * Created by am.gerasimov on 21.02.2018.
 */
define('Controls/Filter/Button/_FilterCompatible',
   [
      'Core/core-extend',
      'SBIS3.CONTROLS/Filter/Button/Utils/FilterToStringUtil',
      'Controls/Filter/Button/OldPanelOpener',
      'Controls/Filter/Button/converterFilterStructure'
   ],
   
   function(extend, stringTransformer, OldPanelOpener, converterFilterStructure) {
      
      'use strict';
      
      var _private = {
         
         notifyOnFilterChange: function(self, filter) {
            self._filterButton._notify('filterChanged', [filter]);
         },
         
         oldPanelChangeHandler: function(self) {
            var filterStructure = self._oldPanelOpener.getFilterStructure();
            self._filterButton._text = stringTransformer.string(filterStructure, 'itemTemplate');
            self._filterButton._items = converterFilterStructure.convertToSourceData(filterStructure);
            _private.notifyOnFilterChange(self, self._oldPanelOpener.getFilter());
            self._filterButton._forceUpdate();
         },
         
         getOldPanelConfig: function(self) {
            return {
               element: self._filterButton._container.querySelector('.controls-FilterButton__oldTemplate'),
               template: self._options.filterTemplate,
               filterStructure: converterFilterStructure.convertToFilterStructure(self._options.items) || self._options.filterStructure,
               filterAlign: self._options.filterAlign === 'left' ? 'right' : 'left',
               pickerClassName: self._options.pickerClassName || '',
               internalContextFilterName: self._options.internalContextFilterName || 'sbis3-controls-filter-button',
               pickerConfig: self._options.pickerConfig || {},
               componentOptions: self._options.componentOptions || {}
            };
         },
         
         getOldPanelOpener: function(self) {
            if (!self._oldPanelOpener) {
               self._oldPanelOpener = new OldPanelOpener(_private.getOldPanelConfig(self));
               self._oldPanelOpener.subscribe('onApplyFilter', function() {
                  _private.oldPanelChangeHandler(self);
               });
               self._oldPanelOpener.subscribe('onResetFilter', function(event, internal) {
                  if (!internal) {
                     _private.oldPanelChangeHandler(self);
                  }
               });
            }
            return self._oldPanelOpener;
         }
         
      };
      
      var FilterCompatible = extend({
         
         _oldPanelOpener: null,
         _filterButton: null,
         
         constructor: function(options) {
            FilterCompatible.superclass.constructor.call(this, options);
            this._filterButton = options.filterButton;
            this._options = options.filterButtonOptions;
         },
         
         clearFilter: function() {
            _private.getOldPanelOpener(this).sendCommand('reset-filter');
         },
         
         showFilterPanel: function() {
            _private.getOldPanelOpener(this).showPicker();
         },

         updateFilterStructure: function(items) {
            if (this._oldPanelOpener) {
               this._oldPanelOpener.setFilterStructure(converterFilterStructure.convertToFilterStructure(items));
            }
         }
         
      });
      
      return FilterCompatible;
   });
