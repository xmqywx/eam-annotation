import WS from './WS';

/**
 * 处理所有对REST Api的调用
 */
class WSParts {

    //
    // PARTS
    //

    // 初始化零件配置
    initPart(config = {}) {
        return WS._get(`/parts/init`, config);
    }

    // 根据代码获取零件信息
    getPart(code, config = {}) {
        return WS._get('/parts/' + code, config);
    }

    // 创建新的零件
    createPart(part, config = {}) {
        return WS._post('/parts/', part, config);
    }

    // 更新零件信息
    updatePart(part, config = {}) {
        return WS._put('/parts/', part, config);
    }

    // 删除指定代码的零件
    deletePart(code, config = {}) {
        return WS._delete('/parts/' + code, config);
    }

    //
    // AUTOCOMPLETE PARTS
    //
    // 自动完成零件类别
    autocompletePartCategory = (filter, config = {}) => {
        filter = encodeURIComponent(filter);
        return WS._get('/autocomplete/part/category/' + filter, config);
    };

    // 自动完成零件商品
    autocompletePartCommodity = (filter, config = {}) => {
        filter = encodeURIComponent(filter);
        return WS._get('/autocomplete/part/commodity/' + filter, config);
    };

    // 自动完成零件单位
    autocompletePartUOM = (filter, config = {}) => {
        filter = encodeURIComponent(filter);
        return WS._get('/autocomplete/part/uom/' + filter, config);
    };

    //
    // DROPDOWNS PARTS
    //

    // 获取零件跟踪方法
    getPartTrackingMethods(config = {}) {
        return WS._get('/partlists/trackMethods', config);
    }

    //
    //WHERE USED PARTS
    //

    // 获取零件的使用情况
    getPartWhereUsed(partCode, config = {}) {
        partCode = encodeURIComponent(partCode);
        return WS._get('/partlists/partsassociated/' + partCode, config);
    }

    //
    // PART STOCK
    //

    // 获取零件库存信息
    getPartStock(partCode, config = {}) {
        partCode = encodeURIComponent(partCode);
        return WS._get('/parts/partstock/' + partCode);
    }


    //
    // ASSETS LIST
    //

    // 获取与零件相关的资产列表
    getAssetsList(partCode, config = {}) {
        partCode = encodeURIComponent(partCode);
        return WS._get('/partlists/assets/' + partCode, config)
    }

}

export default new WSParts();
