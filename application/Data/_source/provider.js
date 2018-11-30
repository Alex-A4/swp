/// <amd-module name="Data/_source/provider" />
/**
 * Data providers library
 * @library Data/source:provider
 * @includes IAbstract Data/_source/provider/IAbstract
 * @includes IChannel Data/_source/provider/IChannel
 * @includes INotify Data/_source/provider/INotify
 * @includes SbisBusinessLogic Data/_source/provider/SbisBusinessLogic
 * @author Мальцев А.А.
 */
define('Data/_source/provider', [
    'require',
    'exports',
    'Data/_source/provider/IAbstract',
    'Data/_source/provider/IChannel',
    'Data/_source/provider/INotify',
    'Data/_source/provider/SbisBusinessLogic'
], function (require, exports, IAbstract_1, IChannel_1, INotify_1, SbisBusinessLogic_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.IAbstract = IAbstract_1.default;
    exports.IChannel = IChannel_1.default;
    exports.INotify = INotify_1.default;
    exports.SbisBusinessLogic = SbisBusinessLogic_1.default;
});