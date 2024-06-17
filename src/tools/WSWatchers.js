import WS from './WS';

/**
 * Handles all calls to REST Api
 * 处理所有对REST Api的调用
 */
class WSWatchers {

    //
    // WATCHERS Support
    //

    // 获取工作订单的观察者
    getWatchersForWorkOrder(woCode, config = {}) {
        // 使用GET方法从服务器获取指定工作订单的观察者列表
        return WS._get(`/workorders/${woCode}/watchers`, config);
    }

    // 向工作订单添加观察者
    addWatchersToWorkOrder(woCode, users, config = {}) {
        // 使用POST方法向服务器添加观察者到指定的工作订单
        return WS._post(`/workorders/${woCode}/watchers`, users, config);
    }

    // 从工作订单移除观察者
    removeWatchersFromWorkOrder(woCode, users, config = {}) {
        // 使用PUT方法从服务器的指定工作订单中移除观察者
        return WS._put(`/workorders/${woCode}/watchers/remove`, users, config);
    }
}

export default new WSWatchers();
