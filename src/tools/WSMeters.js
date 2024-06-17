import WS from './WS';

/**
 * 处理与仪表读数相关的所有REST Api调用
 */
class WSMeters {

    // 根据工单号获取读数
    getReadingsByWorkOrder(workorder, config = {}) {
        return WS._get(`/meters/read/wo/${workorder}`, config);
    }

    // 根据设备代码获取读数
    getReadingsByEquipment(equipmentCode, config = {}) {
        equipmentCode = encodeURIComponent(equipmentCode); // 对设备代码进行URL编码
        return WS._get(`/meters/read/eqp/${equipmentCode}`, config);
    }

    // 根据仪表代码获取读数
    getReadingsByMeterCode(meterCode, config = {}) {
        meterCode = encodeURIComponent(meterCode); // 对仪表代码进行URL编码
        return WS._get(`/meters/read/meter/${meterCode}`, config);
    }

    // 检查值是否滚动
    checkValueRollOver(equipment, uom, actualValue, config = {}) {
        equipment = encodeURIComponent(equipment); // 对设备进行URL编码
        uom = encodeURIComponent(uom); // 对单位进行URL编码
        return WS._get(`/meters/check?equipment=${equipment}&uom=${uom}&actualValue=${actualValue}`, config);
    }

    // 创建仪表读数
    createMeterReading(meterReading, config = {}) {
        return WS._post('/meters/', meterReading);
    }

    // 自动完成设备代码
    autocompleteMeterEquipment = (code, config = {}) => {
        code = encodeURIComponent(code); // 对代码进行URL编码
        return WS._get(`/autocomplete/meters/equipment/${code}`, config);
    };

    // 自动完成仪表代码
    autocompleteMeterCode = (code, config = {}) => {
        code = encodeURIComponent(code); // 对代码进行URL编码
        return WS._get(`/autocomplete/meters/meter/${code}`, config);
    };
}

export default new WSMeters();
