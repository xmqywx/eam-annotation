import WS from './WS';

/**
 * 处理所有对REST Api的调用
 */
class WSEquipment {

    //
    // 设备
    //
    // 获取设备历史记录
    getEquipmentHistory(equipmentCode, config = {}) {
        return WS._get('/equipment/history?c=' + equipmentCode, config);
    }

    // 获取设备工作订单
    getEquipmentWorkOrders(equipmentCode, config = {}) {
        return WS._get('/equipment/workorders?c=' + equipmentCode, config);
    }

    // 获取设备事件
    getEquipmentEvents(equipmentCode, equipmentType, config = {}) {
        return WS._get(`/equipment/events?c=${equipmentCode}&t=${equipmentType}`, config);
    }

    // 获取设备信息
    getEquipment(equipmentCode, config = {}) {
        return WS._get('/equipment?c=' + equipmentCode, config);
    }

    // 更新设备信息
    updateEquipment(equipment, config = {}) {
        return WS._put('/equipment/', equipment, config);
    }

    // 创建新设备
    createEquipment(equipment, config = {}) {
        return WS._post('/equipment/', equipment, config);
    }

    // 删除设备
    deleteEquipment(equipment, config = {}) {
        return WS._delete('/equipment/' + equipment, config);
    }

    // 获取设备类型
    getEquipmentType(equipmentCode, config = {}) {
        return WS._get('/equipment/type', { ...config, params: { c: equipmentCode }});
    }

    // 初始化设备
    initEquipment(eqpType, config = {}) {
        return WS._get(`/equipment/init/${eqpType}`, config);
    }

    // 获取设备状态值
    getEquipmentStatusValues(userGroup, neweqp, oldStatusCode, config = {}) {
        return WS._get(`/eqplists/statuscodes?userGroup=${encodeURIComponent(userGroup)}&neweqp=${neweqp}&oldStatusCode=${oldStatusCode}`, config);
    }

    // 获取设备重要性值
    getEquipmentCriticalityValues(config = {}) {
        return WS._get('/eqplists/criticalitycodes', config);
    }

    // 获取设备状态值
    getEquipmentStateValues(config = {}) {
        return WS._get('/eqplists/statecodes', config);
    }

    // 自动完成制造商名称
    autocompleteManufacturer(filter, config = {}) {
        filter = encodeURIComponent(filter);
        return WS._get('/autocomplete/eqp/manufacturer/' + filter, config);
    }

    // 自动完成设备部件名称
    autocompleteEquipmentPart(filter, config = {}) {
        filter = encodeURIComponent(filter);
        return WS._get('/autocomplete/eqp/part/' + filter, config);
    }

    // 自动完成设备存储位置
    autocompleteEquipmentStore(filter, config = {}) {
        filter = encodeURIComponent(filter);
        return WS._get('/autocomplete/eqp/store/' + filter, config);
    }

    // 自动完成设备存储箱位置
    autocompleteEquipmentBin(store, filter, config = {}) {
        return WS._get(`/autocomplete/eqp/bin?code=${filter}&store=${store}`, config);
    }

    // 自动完成设备类别
    autocompleteEquipmentCategory(eqpClass, filter, config = {}) {
        filter = encodeURIComponent(filter);
        eqpClass = eqpClass === null ? '' : eqpClass;
        return WS._get(`/autocomplete/eqp/category/${filter}`, {
            ...config,
            params: {
                class: eqpClass,
                ...config.params
            }
        });
    }

    // 自动完成设备部门
    autocompleteEquipmentDepartment(filter, config = {}) {
        filter = encodeURIComponent(filter);
        return WS._get(`/autocomplete/department/${filter}`, config);
    }
    // 自动完成成本代码
    autocompleteCostCode = (filter, config = {}) => {
        filter = encodeURIComponent(filter);
        return WS._get('/autocomplete/equipment/costcode/' + filter, config);
    };

    //
    // 层级结构
    //
    // 自动完成资产父级
    autocompleteAssetParent(filter, config = {}) {
        filter = encodeURIComponent(filter);
        return WS._get(`/autocomplete/eqp/parent/A?code=${filter}`, config);
    }

    // 自动完成位置父级
    autocompletePositionParent(filter, config = {}) {
        filter = encodeURIComponent(filter);
        return WS._get(`/autocomplete/eqp/parent/P?code=${filter}`, config);
    }

    // 自动完成主系统父级
    autocompletePrimarySystemParent(filter, config = {}) {
        filter = encodeURIComponent(filter);
        return WS._get(`/autocomplete/eqp/parent/S?code=${filter}`, config);
    }

    // 自动完成位置
    autocompleteLocation = (filter, config = {}) => {
        filter = encodeURIComponent(filter);
        return WS._get(`/autocomplete/eqp/location/?s=${filter}`, config);
    };

    //
    //
    //

    // 获取关联设备部件
    getEquipmentPartsAssociated(equipment, parentScreen, config = {}) {
        equipment = encodeURIComponent(equipment);
        return WS._get(`/equipment/partsassociated/${parentScreen}/${equipment}`, config);
    }

    // 获取类别信息
    getCategory(categoryCode, config = {}) {
        return WS._get(`/autocomplete/eqp/categorydata/${categoryCode}`, config);
    }

    //
    // 设备更换
    //
    // 自动完成设备更换
    autocompleteEquipmentReplacement = (code, config = {}) => {
        code = encodeURIComponent(code);
        return WS._get(`/autocomplete/eqp/eqpreplace/${code}`, config);
    };

    // 更换设备
    replaceEquipment(equipmentRpl, config = {}) {
        return WS._post('/equipment/replace', equipmentRpl, config);
    }

    // 收集可拆卸设备
    collectDetachableEquipment(oldEquipment, config = {}) {
        oldEquipment = encodeURIComponent(oldEquipment);
        return WS._get(`/equipment/collectdetachables/${oldEquipment}`, config);
    }

    // 获取设备子项
    getEquipmentChildren(equipment, config = {}) {
        equipment = encodeURIComponent(equipment);
        return WS._get(`/equipment/children/${equipment}`, config);
    }

    //
    //EQUIPMENT STRUCTURE
    //
    // 安装设备
    installEquipment(equipmentStructure, config = {}) {
        return WS._post('/eqstructure/attach', equipmentStructure, config);
    }

    // 分离设备
    detachEquipment(equipmentStructure, config = {}) {
        return WS._post('/eqstructure/detach', equipmentStructure, config);
    }
}

export default new WSEquipment();