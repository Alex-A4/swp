/// <amd-module name="Data/source" />
/**
 * Data sources library
 * @library Data/source
 * @includes Base Data/_source/Base
 * @includes DataSet Data/_source/DataSet
 * @includes HierarchicalMemory Data/_source/HierarchicalMemory
 * @includes ICrud Data/_source/ICrud
 * @includes ICrudPlus Data/_source/ICrudPlus
 * @includes IData Data/_source/IData
 * @includes IProvider Data/_source/IProvider
 * @includes IRpc Data/_source/IRpc
 * @includes Local Data/_source/Local
 * @includes Memory Data/_source/Memory
 * @includes PrefetchProxy Data/_source/PrefetchProxy
 * @includes Query Data/_source/Query
 * @includes Remote Data/_source/Remote
 * @includes Rpc Data/_source/Rpc
 * @includes SbisService Data/_source/SbisService
 * @author Мальцев А.А.
 */
define('Data/source', [
    'require',
    'exports',
    'Data/_source/Base',
    'Data/_source/DataSet',
    'Data/_source/HierarchicalMemory',
    'Data/_source/ICrud',
    'Data/_source/ICrudPlus',
    'Data/_source/IData',
    'Data/_source/IProvider',
    'Data/_source/IRpc',
    'Data/_source/Local',
    'Data/_source/Memory',
    'Data/_source/PrefetchProxy',
    'Data/_source/provider',
    'Data/_source/Query',
    'Data/_source/Remote',
    'Data/_source/Rpc',
    'Data/_source/SbisService',
    'Data/_source/Query',
    'Data/_source/SbisService'
], function (require, exports, Base_1, DataSet_1, HierarchicalMemory_1, ICrud_1, ICrudPlus_1, IData_1, IProvider_1, IRpc_1, Local_1, Memory_1, PrefetchProxy_1, provider, Query_1, Remote_1, Rpc_1, SbisService_1, QueryExt, SbisServiceExt) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.Base = Base_1.default;
    exports.DataSet = DataSet_1.default;
    exports.HierarchicalMemory = HierarchicalMemory_1.default;
    exports.ICrud = ICrud_1.default;
    exports.ICrudPlus = ICrudPlus_1.default;
    exports.IData = IData_1.default;
    exports.IProvider = IProvider_1.default;
    exports.IRpc = IRpc_1.default;
    exports.Local = Local_1.default;
    exports.Memory = Memory_1.default;
    exports.PrefetchProxy = PrefetchProxy_1.default;
    exports.provider = provider;
    exports.Query = Query_1.default;
    exports.Remote = Remote_1.default;
    exports.Rpc = Rpc_1.default;
    exports.SbisService = SbisService_1.default;
    exports.QueryExt = QueryExt;
    exports.SbisServiceExt = SbisServiceExt;
});