import ajax from 'eam-components/dist/tools/ajax';

/**
 * Handles all calls to REST Api
 * 处理所有对REST Api的调用
 */
class WS {

    //
    // GENERAL
    //
    /**
     * 获取用户数据。
     * 根据当前屏幕和屏幕代码从后端API获取用户相关数据。
     * 
     * @param {string} currentScreen 当前用户所在的屏幕
     * @param {string} screenCode 屏幕代码
     * @param {Object} config 额外的配置选项
     * @returns {Promise} 返回一个Promise对象，解析为从后端获取的用户数据。
     */
    getUserData(currentScreen, screenCode, config = {}) {
        return this._get(`/users?currentScreen=${currentScreen ? currentScreen : ""}&screenCode=${screenCode ? screenCode : ""}`, config);
    }

    getUserDataToImpersonate(userId, mode, config = {}) {
        return this._get(`/users/impersonate?userId=${userId}&mode=${mode}`, config);

    }
    getApplicationData(config = {}) {
        return this._get('/application/applicationdata', config);
    }

    refreshCache(config = {}) {
        return this._get('/application/refreshCache', config);
    }

    /**
     * 获取指定用户组、实体和系统功能的屏幕布局。
     * 构造一个URL，通过调用WS的_get方法来获取数据。
     * 
     * @param {string} userGroup 用户组标识，用于确定请求的数据属于哪个用户组。
     * @param {string} entity 实体标识，指定请求的屏幕布局关联的实体类型。
     * @param {string} systemFunction 系统功能标识，用于进一步细化请求的屏幕布局。
     * @param {string} userFunction 用户功能标识，通常用于指定特定的用户操作或视图。
     * @param {Array} tabs 标签数组，可选，用于指定需要获取布局的特定标签页。
     * @param {Object} config 配置对象，可包含额外的请求配置如超时时间等，默认超时时间为60000毫秒。
     * @returns {Promise} 返回一个Promise对象
     */
    getScreenLayout(userGroup, entity, systemFunction, userFunction, tabs, config = {timeout: 60000}) {
        // 如果提供了tabs参数，将其转换为URL查询参数格式
        if (tabs) {
            tabs = 'tabname=' + tabs.join('&tabname=');
        }
        // 构造请求的URL，包括用户组、实体、系统功能和用户功能作为路径参数
        // 如果有tabs，则将其作为查询字符串附加到URL上
        return this._get(`/users/screenlayout/${userGroup}/${entity}/${systemFunction}/${userFunction}?${tabs}`, config);
    }

    getGISLink(workorderNumber, locationCode, config = {}) {
        return this._get('/workordersmisc/gislink?workorder=' + workorderNumber + "&location=" + locationCode, config);
    }

    /**
     * 登录
     * @param {*} username 用户名
     * @param {*} password 密码
     * @param {*} organization 组织
     * @param {*} tenant 租户
     * @param {*} config 配置信息
     * @returns 
     */
    login(username, password, organization, tenant, config = {}) {
        return this._get('/login', {
            headers: {
                INFOR_USER: username,
                INFOR_PASSWORD: password,
                INFOR_ORGANIZATION: organization,
                INFOR_TENANT: tenant
            }
        });
    }

    getOrganizations = (userFunctionName, config = {}) => {
        return this._get(`/users/organizations/${userFunctionName}`, config)
    }

    //
    //
    //
    getMyOpenWorkOrders(config = {}) {
        return this._get('/myworkorders/my', config)
    }

    getMyTeamWorkOrders(config = {}) {
        return this._get('/myworkorders/myteam', config)
    }

    getSearchData(keyword, entityTypes, config = {}) {
        keyword = encodeURIComponent(keyword);
        return ajax.get(process.env.REACT_APP_BACKEND + `/index?s=${keyword}&entityTypes=${entityTypes}`, config);
    }

    getSearchSingleResult(keyword, config = {}) {
        return ajax.get(process.env.REACT_APP_BACKEND + '/index/singleresult?s=' + keyword, config);
    }

    //
    //COMMON AUTOCOMPLETES
    //

    autocompleteEmployee = (filter, config = {}) => {
        return this._get('/autocomplete/employee/' + filter, config);
    };

    autocompleteSupervisor = (filter, config = {}) => {
        return this._get('/autocomplete/supervisor/' + filter, config);
    };

    autocompleteUsers = (filter, config = {}) => {
        return this._get(`/autocomplete/users/${filter}`, config);
    };

    autocompleteClass = (entity, filter, config = {}) => {
        return this._get(`/autocomplete/class/${entity}/${filter}`, config);
    };

    autocompleteDepartment = (filter, config = {}) => {
        filter = encodeURIComponent(filter);
        return this._get(`/autocomplete/department/${filter}`, config);
    };

    autocompleteLocation = (filter, config = {}) => {
        filter = encodeURIComponent(filter);
        return this._get(`/autocomplete/location?s=${filter}`, config);
    };

    autocompleteEquipment = (hideLocations = false, filter, config = {timeout: 0}) => {
        filter = encodeURIComponent(filter);
        return this._get(`/autocomplete/eqp?s=${filter.toUpperCase()}&filterL=${hideLocations}`, config);
    };

    autocompleteEquipmentSelected = (filter, config) => {
        filter = encodeURIComponent(filter);
        return this._get('/autocomplete/eqp/selected?code=' + filter, config);
    };

    /**
     * 发送 GET/POST/PUT/DELETE 请求到指定的 URL。
     * @param {string} url - 请求的 URL，将会被添加到环境变量指定的基础 URL 后。
     * @param {Object} config - 请求的配置对象，可以包含请求头和其他请求选项。
     * @returns {Promise} 返回一个 Promise 对象，它在请求成功时解析为响应数据。
     */
    _get(url, config = {}) {
        return ajax.get(process.env.REACT_APP_BACKEND + url, config);
    }
    _post(url, data, config = {}) {
        return ajax.post(process.env.REACT_APP_BACKEND + url, data, config);
    }
    _put(url, data, config = {}) {
        return ajax.put(process.env.REACT_APP_BACKEND + url, data, config);
    }
    _delete(url, config = {}) {
        return ajax.delete(process.env.REACT_APP_BACKEND + url, config);
    }

}

export default new WS();
