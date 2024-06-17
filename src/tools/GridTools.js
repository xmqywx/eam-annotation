import queryString from 'query-string';  // 引入queryString库，用于解析和字符串化URL查询字符串

const FILTER_SEPARATOR = ':::';  // 定义过滤器之间的分隔符
const VALUE_SEPARATOR = ':';  // 定义字段值的分隔符
const OPERATOR_SEPARATOR = '|||';  // 定义操作符的分隔符

// 解析网格过滤器字符串，返回过滤器对象数组
const parseGridFilters = (gridFiltersString) => {
    // 将过滤器字符串适配为过滤器对象
    const adaptGridFilters = ([code, value]) => {
        const [val, operator] = value && value.split(OPERATOR_SEPARATOR);  // 分割值和操作符
        return {
            fieldName: code,  // 字段名
            fieldValue: val,  // 字段值
            operator: operator || 'EQUALS',  // 操作符，默认为'EQUALS'
            joiner: 'AND',  // 连接符，默认为'AND'
        }
    }

    try {
        return gridFiltersString ?
            gridFiltersString.split(FILTER_SEPARATOR)  // 按过滤器分隔符分割字符串
                .map(gridFilter => gridFilter.split(VALUE_SEPARATOR))  // 按值分隔符分割每个过滤器
                .map(adaptGridFilters)  // 将每个分割后的数组适配为过滤器对象
            : [];
    } catch (err) {
        return [];  // 发生错误时返回空数组
    }
}

// 将单个过滤器对象转换为字符串
const stringifyGridFilter = gridFilter => {
    return gridFilter.fieldName + VALUE_SEPARATOR + (gridFilter.fieldValue || '') + OPERATOR_SEPARATOR + gridFilter.operator
}

// 将过滤器对象数组转换为字符串
const stringifyGridFilters = (gridFilters = []) => {
    return gridFilters.map(stringifyGridFilter).join(FILTER_SEPARATOR)  // 将每个过滤器字符串化后用过滤器分隔符连接
}

// const replaceUrlParam = (key, val) => {
//     const params = window.location.href
//             .replace(/[^?]*/, '')
//             .split(/[&?]/)
//             .filter(el => el[0])
//             .map(c => c.split("="))
//             .reduce((acc, el) => {acc[el[0]] = el[1]; return acc;}, {})
//             ;
//     params[key] = encodeURIComponent(val);
//     return '?' +
//         Object.entries(params)
//             .map(el => el[0] + '=' + el[1])
//             .reduce((acc, el) => acc ? (acc + '&' + el ) : el, '')
//         ;
// }

// 替换url中的参数
const replaceUrlParam = (key, val) => {
    const params = queryString.parse(window.location.search);  // 解析当前URL的查询字符串
    params[key] = val;  // 设置或更新参数
    return '?' + queryString.stringify(params);  // 字符串化参数并返回新的查询字符串
}

// 根据名称获取URL参数的值
const getURLParameterByName = name => queryString.parse(window.location.search)[name] || '';

export default {
    parseGridFilters,
    getURLParameterByName,
    replaceUrlParam,
    stringifyGridFilters,
}