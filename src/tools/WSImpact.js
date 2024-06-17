import ajax from 'eam-components/dist/tools/ajax';

/**
 * 处理与影响集成相关的所有REST API调用
 */
class WSImpact {

    // 获取数据的方法，可接受一个配置对象作为参数
    getData(config = {}) {
        return ajax.get(process.env.REACT_APP_BACKEND.replace('/eamlightws/rest', '/cern-eam-services/rest') + `/impact/data`, config);
    }

    // 获取布局信息的方法，接受设施和活动类型作为参数，并可接受一个配置对象
    getLayoutInfo(facility, activityType, config = {}) {
        facility = encodeURIComponent(facility);  // 对设施参数进行URL编码
        activityType = encodeURIComponent(activityType);  // 对活动类型参数进行URL编码
        return ajax.get(process.env.REACT_APP_BACKEND.replace('/eamlightws/rest', '/cern-eam-services/rest') + `/impact/layout/${facility}/${activityType}`, config);
    }

    // 获取影响活动的方法，接受活动ID作为参数，并可接受一个配置对象
    getImpactActivity(activityId, config = {}) {
        activityId = encodeURIComponent(activityId);  // 对活动ID进行URL编码
        return ajax.get(process.env.REACT_APP_BACKEND.replace('/eamlightws/rest', '/cern-eam-services/rest') + `/impact/activities/${activityId}`, config);
    }

    // 获取工单信息的方法，接受工单编号作为参数，并可接受一个配置对象
    getWorkorderInfo(workorderNumber, config = {}) {
        workorderNumber = encodeURIComponent(workorderNumber);  // 对工单编号进行URL编码
        return ajax.get(process.env.REACT_APP_BACKEND.replace('/eamlightws/rest', '/cern-eam-services/rest') + `/impact/workorders/${workorderNumber}`, config);
    }

    // 获取具有相同活动ID的所有工单信息的方法，接受活动ID作为参数，并可接受一个配置对象
    getWorkorderInfosWithSameActivity(activityId, config = {}) {
        activityId = encodeURIComponent(activityId);  // 对活动ID进行URL编码
        return ajax.get(process.env.REACT_APP_BACKEND.replace('/eamlightws/rest', '/cern-eam-services/rest') + `/impact/workorderswithactivity/${activityId}`, config);
    }

    // 获取影响设施的方法，接受位置代码作为参数，并可接受一个配置对象
    getImpactFacilities(locationCode, config = {}) {
        locationCode = encodeURIComponent(locationCode);  // 对位置代码进行URL编码
        return ajax.get(process.env.REACT_APP_BACKEND.replace('/eamlightws/rest', '/cern-eam-services/rest') + `/impact/location/facilities?locationCode=${locationCode}`, config);
    }

    // 创建影响活动的方法，接受影响活动对象作为参数，并可接受一个配置对象
    createImpactActivity(impactActivity, config = {}) {
        return ajax.post(process.env.REACT_APP_BACKEND.replace('/eamlightws/rest', '/cern-eam-services/rest') + '/impact/', impactActivity, config);
    }

    // 将工单链接到影响活动的方法，接受工单编号和活动ID作为参数，并可接受一个配置对象
    linkWorkorderToImpactActivity(workordernum, activityid, config = {}) {
        return ajax.post(process.env.REACT_APP_BACKEND.replace('/eamlightws/rest', '/cern-eam-services/rest') + `/impact/workorders/${workordernum}/activities/${activityid}`, config);
    }

    // 将多个工单链接到一个影响活动的方法，接受影响活动ID和工单数组作为参数
    linkWorkordersToImpactActivity(impactActivity, workorders, config = {}) {
        return ajax.put(process.env.REACT_APP_BACKEND.replace('/eamlightws/rest', '/cern-eam-services/rest') + `/impact/activities/${impactActivity}`, workorders);
    }

    // 解除工单与影响活动的链接的方法，接受工单编号作为参数，并可接受一个配置对象
    unlinkWorkorder(workorder, config = {}) {
        return ajax.delete(process.env.REACT_APP_BACKEND.replace('/eamlightws/rest', '/cern-eam-services/rest') + `/impact/workorders/${workorder}/activity`);
    }
}

export default new WSImpact();
