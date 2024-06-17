import set from "set-value";
import queryString from "query-string";
import formatfns from "date-fns/format";
import { parseISO } from "date-fns";
import { processElementInfo } from "eam-components/dist/ui/components/inputs-ng/tools/input-tools";
import { get } from "lodash";

// clones an entity deeply
// 深拷贝实体对象，包括用户自定义字段和自定义字段数组
export const cloneEntity = entity => ({
    ...entity,
    userDefinedFields: {
        ...(entity.userDefinedFields || {})
    },
    customField: [
        ...(entity.customField || []).map(cf => ({...cf}))
    ]
});

// There are 3 kinds of entity assignments:
// 1. always copy from source to destination (FORCED)
//      - used when you wish to force an assignment
// 2. copy from source to destination if source is not empty (SOURCE_NOT_EMPTY)
//      - used when you wish to assign only if you have something to assign
//        (trying to assign an empty value to an existing one will not change it)
// 3. copy from source to destination if destination is empty (DESTINATION_EMPTY)
//      - used when you wish to assign only if what you are assigning to is empty
//        (trying to assign an existing value to another existing value will not change it)

// 定义三种实体字段赋值类型
export const AssignmentType = {
    FORCED: { // 强制赋值，不考虑源或目标是否为空
        sourceNotEmpty: false,
        destinationEmpty: false
    },
    SOURCE_NOT_EMPTY: { // 源不为空时赋值
        sourceNotEmpty: true,
        destinationEmpty: false
    },
    DESTINATION_EMPTY: { // 目标为空时赋值
        sourceNotEmpty: false,
        destinationEmpty: true
    }
    // Note: there is no combination where both sourceNotEmpty and destinationEmpty are true
    // because this is effectively the same as DESTINATION_EMPTY, as if the source is empty,
    // it will not change an empty destination anyway
    /**
     * 解释细节：
            1. sourceNotEmpty: 这个标志表示只有当源字段（即要从中复制数据的字段）不为空时，才进行赋值操作。
            2. destinationEmpty: 这个标志表示只有当目标字段（即要将数据复制到的字段）为空时，才进行赋值操作。

        如果同时设置这两个条件为true，理论上看似可以定义一个“只有当源不为空且目标为空时才赋值”的规则。然而，这种情况实际上已经被DESTINATION_EMPTY这个赋值类型覆盖了。因为如果源字段为空，那么不管目标字段是否为空，都不会进行赋值。所以，这种组合实际上并没有产生新的赋值逻辑，而是与DESTINATION_EMPTY重复。
     */
};

// 检查赋值类型是否有效
const throwIfInvalidAssignmentType = assignmentType => {
    if(!Object.values(AssignmentType).includes(assignmentType)) {
        throw new Error('You must specify a valid assigment type');
    }
};

// assigns the user defined fields from userDefinedFields to the entity
// 为实体赋值用户自定义字段
export const assignUserDefinedFields = (entity, userDefinedFields = {}, assignmentType) => {
    throwIfInvalidAssignmentType(assignmentType);
    const {sourceNotEmpty, destinationEmpty} = assignmentType;

    const newEntity = cloneEntity(entity);
    let expr = Object.entries(userDefinedFields);

    if(sourceNotEmpty) {
        expr = expr.filter(([, value]) => value);
    }

    if(destinationEmpty) {
        expr = expr.filter(([key]) => !newEntity.userDefinedFields[key])
    }

    expr.forEach(([key, value]) => newEntity.userDefinedFields[key] = value);
    return newEntity;
}

// assigns the custom fields from an object to the ones that are present in the entity
// if the specified custom fields are not present in the entity, nothing is done
// 为实体赋值自定义字段从一个对象
export const assignCustomFieldFromObject = (entity, object = {}, assignmentType) => {
    throwIfInvalidAssignmentType(assignmentType);
    const {sourceNotEmpty, destinationEmpty} = assignmentType;

    const newEntity = cloneEntity(entity);
    let expr = newEntity.customField.filter(cf => object[cf.code]);

    if(sourceNotEmpty) {
        expr = expr.filter(cf => object[cf.code]);
    }

    if(destinationEmpty) {
        expr = expr.filter(cf => !cf.value);
    }

    expr.forEach(cf => cf.value = object[cf.code]);
    return newEntity;
}

// assigns the custom fields from the customField object to the entity, merging old values
// 从另一个自定义字段对象合并赋值到实体的自定义字段
export const assignCustomFieldFromCustomField = (entity, customField = [], assignmentType) => {
    throwIfInvalidAssignmentType(assignmentType);
    const {sourceNotEmpty, destinationEmpty} = assignmentType;

    const newEntity = cloneEntity(entity);
    const oldCustomField = newEntity.customField;
    newEntity.customField = customField.map(cf => ({...cf})); // ensure custom field is not modified

    let expr = newEntity.customField;
    
    if(sourceNotEmpty) {
        expr = expr.filter(cf => !cf.value);
    }

    const getOldCustomFieldValue = ({code}) => {
        const field = oldCustomField.find(cf => code === cf.code);
        return field ? field.value : undefined;
    }

    if(destinationEmpty) {
        expr = expr.filter(cf => getOldCustomFieldValue(cf));
    }
    
    expr.forEach(cf => cf.value = getOldCustomFieldValue(cf));
    return newEntity;
}

// assigns the values in values to the entity
// values that do not exist in the entity are not copied
// if the entity has a non-empty value, that value is not copied, unless forced is truthy
// 为实体赋值，只有当目标字段为空或强制赋值时才进行
export const assignValues = (entity, values = {}, assignmentType) => {
    throwIfInvalidAssignmentType(assignmentType);
    const {sourceNotEmpty, destinationEmpty} = assignmentType;

    const newEntity = cloneEntity(entity);
    let expr = Object.keys(newEntity).filter(key => values.hasOwnProperty(key));

    if(destinationEmpty) {
        expr = expr.filter(key => !newEntity[key]);
    }

    if(sourceNotEmpty) {
        expr = expr.filter(key => values[key]);
    }

    expr.forEach(key => newEntity[key] = values[key]);
    return newEntity;
};

// 从URL查询参数赋值到实体
export const assignQueryParamValues = (entity, assignmentType = AssignmentType.FORCED) => {
    throwIfInvalidAssignmentType(assignmentType);
    let queryParams = queryString.parse(window.location.search);

    const caseSensitiveQueryParams = toSensitive(entity, queryParams);

    // delete values that we cannot touch
    // 删除我们不能触碰的值
    delete caseSensitiveQueryParams.userDefinedFields;
    delete caseSensitiveQueryParams.customField;

    entity = assignValues(entity, caseSensitiveQueryParams, assignmentType);
    entity = assignCustomFieldFromObject(entity, queryParams, assignmentType);

    const userDefinedFields = Object.assign({}, ...Object.entries(queryParams)
        .filter(([key]) => key.toLowerCase().startsWith("udf")) // only include keys prepended with udf  // 只包括以udf开头的键
        .map(([key, value]) => ({[key.toLowerCase()]: value}))); // remove udf substring at the beginning from key // 从键中移除udf前缀

    return assignUserDefinedFields(entity, userDefinedFields, assignmentType);
}

// 触发处理函数
export const fireHandlers = (entity, handlers) => {
    let queryParams = queryString.parse(window.location.search);
    const caseSensitiveQueryParams = toSensitive(entity, queryParams);
    for (const param in caseSensitiveQueryParams) {
        handlers?.[param]?.(caseSensitiveQueryParams[param])
    }
}

// this function converts an object with case insensitive keys to an object with
// case sensitive keys, based on a target object
// 将不区分大小写的键转换为区分大小写的键，基于目标对象
export const toSensitive = (target, insensitive) => {
    const mapping = Object.fromEntries(Object.entries(target)
        .map(([k]) => [k.toLowerCase(), k]));

    return Object.fromEntries(Object.entries(insensitive)
        .map(([key, value]) => [mapping[key.toLowerCase()], value])
        .filter(([key]) => key !== undefined));
}

// 为实体赋予默认值
export const assignDefaultValues = (entity, layout, layoutPropertiesMap, assignmentType = AssignmentType.FORCED) => {
    throwIfInvalidAssignmentType(assignmentType);

    // Create an entity-like object with the default values from the screen's layout
    // 创建一个带有屏幕布局默认值的实体对象
    let defaultValues = {};

    if (layout && layoutPropertiesMap) {
        defaultValues = Object.values(layout.fields)
            .filter(field => field.defaultValue && layoutPropertiesMap[field.elementId])
            .reduce((result, field) => set(result, layoutPropertiesMap[field.elementId], 
                    field.defaultValue === 'NULL' ? '' : field.defaultValue), {});
    }
    
    const userDefinedFields = defaultValues.userDefinedFields;
    delete defaultValues.userDefinedFields;

    entity = assignValues(entity, defaultValues, assignmentType);
    entity = assignUserDefinedFields(entity, userDefinedFields, assignmentType);

    return entity;
}

export const getTabAvailability = (tabs, tabCode) => {
    if(!tabs[tabCode]) return true;
    return tabs[tabCode].tabAvailable;
}

export const getTabInitialVisibility = (tabs, tabCode) => {
    if (!tabs[tabCode]) return true;
    return tabs[tabCode].alwaysDisplayed;
}


export const isDepartmentReadOnly = (departmentCode, userData) => {
    return userData.eamAccount.departmentalSecurity[departmentCode]?.readOnly;
}

// 格式化日期为 'dd-MMM-yyyy' 格式
export const formatDate = date => format(date, 'dd-MMM-yyyy');

// 格式化日期和时间为 'dd-MMM-yyyy HH:mm' 格式
export const formatDateTime = date => format(date, 'dd-MMM-yyyy HH:mm');

// Helper function to format date using date-fns library
const format = (date, dateFormat) => {
    try {
        return formatfns(parseISO(date), dateFormat)
    } catch(error) {
        console.error("formatDate error" + error);
    }

    return null;
}

// 从自定义字段中获取元素信息
export const getElementInfoFromCustomFields = (layoutKey, customFields) => {
    let customField = customFields.find(cf => cf.code === layoutKey) 

    return getElementInfoForCustomField(customField);
}

// 根据自定义字段获取元素信息，包括文本、XPath和字段类型
export const getElementInfoForCustomField = (customField) => {
    return {
        text: customField?.label,
        xpath: 'EAMID_' + customField?.code,
        fieldType: customField?.type === 'NUM' ? 'number' : 'text'
    }
}

// 注册自定义字段到实体，用于处理和显示
export const registerCustomField = entity => (layoutKey, valueKey, descKey) => {
    let data = processElementInfo(getElementInfoFromCustomFields(layoutKey, entity.customField))
    data.value = get(entity, valueKey);
    if (descKey) {
        data.desc = get(entity, descKey);
    }
    data.disabled = true;
    return data;
}

// 准备数据用于字段验证，根据屏幕布局和布局属性映射
export const prepareDataForFieldsValidator = (entity, screenLayout, layoutPropertiesMap) => {
    if (!entity) {
        return {}
    }
    
    const temp = Object.entries(layoutPropertiesMap).reduce(
        (acc, [layoutKey, fieldKey]) => {
            acc[fieldKey] = screenLayout.fields[layoutKey];
            return acc;
        }, {})

    entity.customField.reduce(
        (acc, customField, index) => {
            acc[`customField.${index}.value`] = getElementInfoForCustomField(customField)
            return acc;
        }, temp)

    return temp;
}

// 检查是否为多组织模式
export const isMultiOrg = process.env.REACT_APP_MULTI_ORG === 'TRUE';
