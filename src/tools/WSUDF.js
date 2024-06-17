import WS from './WS';

/**
 * Handles all calls to REST Api
 * 处理所有对REST Api的调用
 */
class WSUDF {

    //
    //USER DEFINED FIELDS Support
    // 用户定义字段支持
    //

    // 自动完成用户定义字段的方法
    // 参数 entity 表示实体
    // 参数 filter 表示过滤条件
    // 参数 config 是一个可选的配置对象，默认为空对象
    autocompleteUserDefinedField = (entity, filter, config = {}) => {
        filter = encodeURIComponent(filter); // 对filter进行URL编码
        return WS._get(`/userdefinedfields/complete/${entity}/${filter}`, config); // 发送GET请求
    };

    // 获取用户定义字段的代码值
    // 参数 entity 表示实体
    // 参数 fieldId 表示字段ID
    // 参数 config 是一个可选的配置对象，默认为空对象
    getUDFCodeValues(entity, fieldId, config = {}) {
        return WS._get(`/userdefinedfields/code/${entity}/${fieldId}`, config);
    }

    // 获取用户定义字段的代码描述值
    // 参数 entity 表示实体
    // 参数 fieldId 表示字段ID
    // 参数 config 是一个可选的配置对象，默认为空对象
    getUDFCodeDescValues(entity, fieldId, config = {}) {
        return WS._get(`/userdefinedfields/codedesc/${entity}/${fieldId}`, config);
    }

}

export default new WSUDF();
