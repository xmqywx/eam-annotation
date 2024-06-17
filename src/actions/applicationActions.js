import WS from "../tools/WS";
import queryString from "query-string"
import { 
        TAB_CODES, 
        TAB_CODES_ASSETS, 
        TAB_CODES_LOCATIONS, 
        TAB_CODES_POSITIONS, 
        TAB_CODES_SYSTEMS, 
        TAB_CODES_WORK_ORDERS, 
        TAB_CODES_PARTS 
    } from "../ui/components/entityregions/TabCodeMapping"
export const UPDATE_APPLICATION = 'UPDATE_APPLICATION';

export function updateApplication(value) {
    return {
        type: UPDATE_APPLICATION,
        value: value
    }
}

const RETRIES_ALLOWED = 5;

/**
 * 获取用户信息并更新应用状态。
 * 此函数首先从URL中解析用户屏幕代码和当前屏幕路径，然后请求用户数据。
 * 成功获取用户数据后，会请求相关屏幕的布局信息，并将这些信息更新到应用状态中。
 * 如果在任何步骤中遇到错误，会根据错误类型进行处理，例如403错误会标记账户为无效。
 *
 * @returns {Function} 返回一个函数，该函数接受dispatch作为参数，用于在Redux中派发actions。
 */
export function getUserInfo() {
    return (dispatch) => {
        let retriesDone = 0; // 已重试次数

        // 获取用户数据的函数
        const fetchUserData = () => {
            // 获取URL参数
            const values = queryString.parse(window.location.search);
            console.log(values);
            const screenCode = values.screen; // 屏幕代码
            const currentScreen = window.location.pathname
                .replace(process.env.PUBLIC_URL, '')
                .split('/')[1]; // 当前屏幕路径
            return WS.getUserData(currentScreen, screenCode); // 调用WS服务获取用户数据
        };

        // 处理获取用户数据失败的函数
        const handleUserDataResponseError = (error) => {
            if (error?.response?.status === 403) {
                dispatch(
                    updateApplication({ userData: { invalidAccount: true } }) // 账户无效
                );
            } else {
                dispatch(updateApplication({ userData: {} })); // 清空用户数据
            }
        };

        // 获取屏幕布局的函数
        const fetchScreenLayout = (response) => {
            let userdata = response.body.data; // 用户数据

            // 将获取到的数据权限进行更改
            // userdata.assetScreen = "OSOBJA";
            // userdata.screens.OSOBJA = {
            //     "screenCode": "OSOBJA",
            //     "startupAction": "D",
            //     "parentScreen": "OSOBJA",
            //     "screenDesc": "Assets",
            //     "readAllowed": true,
            //     "creationAllowed": false,
            //     "deleteAllowed": false,
            //     "updateAllowed": false,
            //     "tab": "",
            //     "tabAlwaysDisplayed": true,
            //     "tabAvailable": true
            // }
            // userdata.locationScreen = "OSOBJL";
            // userdata.screens.OSOBJL = {
            //     "screenCode": "OSOBJL",
            //     "startupAction": "D",
            //     "parentScreen": "OSOBJL",
            //     "screenDesc": "Location",
            //     "readAllowed": true,
            //     "creationAllowed": false,
            //     "deleteAllowed": false,
            //     "updateAllowed": false,
            //     "tab": "",
            //     "tabAlwaysDisplayed": true,
            //     "tabAvailable": true
            // }
            // userdata.partScreen = "SSPART";
            // userdata.screens.SSPART = {
            //     "screenCode": "SSPART",
            //     "startupAction": "D",
            //     "parentScreen": "SSPART",
            //     "screenDesc": "Part",
            //     "readAllowed": true,
            //     "creationAllowed": false,
            //     "deleteAllowed": false,
            //     "updateAllowed": false,
            //     "tab": "",
            //     "tabAlwaysDisplayed": true,
            //     "tabAvailable": true
            // }
            // userdata.systemScreen = "OSOBJS";
            // userdata.screens.OSOBJS = {
            //     "screenCode": "OSOBJS",
            //     "startupAction": "D",
            //     "parentScreen": "OSOBJS",
            //     "screenDesc": "System",
            //     "readAllowed": true,
            //     "creationAllowed": false,
            //     "deleteAllowed": false,
            //     "updateAllowed": false,
            //     "tab": "",
            //     "tabAlwaysDisplayed": true,
            //     "tabAvailable": true
            // }

            
            // userdata.screens.WSJOBS = {
            //     "screenCode": "WSJOBS",
            //     "startupAction": "D",
            //     "parentScreen": "WSJOBS",
            //     "screenDesc": "Work Orders",
            //     "readAllowed": true,
            //     "creationAllowed": true,
            //     "deleteAllowed": true,
            //     "updateAllowed": true,
            //     "tab": "",
            //     "tabAlwaysDisplayed": true,
            //     "tabAvailable": true
            // }

            // 当所有promise完成，并行请求屏幕布局数据
            Promise.all(createPromiseArray(userdata))
                .then((values) => {
                    console.log(values);
                    let serviceAccounts;
                    try {
                        serviceAccounts =
                            values[0].body.data.EL_SERVI &&
                            Object.keys(
                                JSON.parse(values[0].body.data.EL_SERVI) // 解析服务账户数据
                            );
                    } catch (err) {
                        serviceAccounts = []; // 解析失败则为空数组
                    }
                    // 当数据获取到时，更新状态数据
                    dispatch(
                        updateApplication({
                            userData: response.body.data,
                            applicationData: {
                                ...values[0].body.data,
                                serviceAccounts,
                            },
                            assetLayout: values[1] ? values[1].body.data : null,
                            positionLayout: values[2] ? values[2].body.data : null,
                            systemLayout: values[3] ? values[3].body.data : null,
                            partLayout: values[4] ? values[4].body.data : null,
                            workOrderLayout: values[5] ? values[5].body.data : null,
                            locationLayout: values[6] ? values[6].body.data : null,
                        }) // 更新应用状态
                    );
                })
                .catch((error) => {
                    if (retriesDone++ < RETRIES_ALLOWED) {
                        console.error(
                            `Error fetching screen layouts, retrying (attempt number ${retriesDone})...` // 错误重试
                        );
                        fetchScreenLayout(response);
                    } else {
                        console.error(
                            `Error fetching screen layouts, maximum number of retries reached: ${RETRIES_ALLOWED}` // 达到最大重试次数
                        );
                        dispatch(
                            updateApplication({
                                userData: {
                                    screenLayoutFetchingFailed: true,
                                },
                            })
                        );
                    }
                });
        };

        return fetchUserData()
            .then(fetchScreenLayout)
            .catch(handleUserDataResponseError);
    };
}

/**
 * 定义一个通用的 Redux thunk action creator，用于更新屏幕布局。
 * 它接收实体标识、描述、系统功能、用户功能和标签页代码作为参数。
 * @param {*} entity 
 * @param {*} entityDesc 
 * @param {*} systemFunction 
 * @param {*} userFunction 
 * @param {*} tabs 
 * @returns 
 */
export function updateScreenLayout(entity, entityDesc, systemFunction, userFunction, tabs) {
    return (dispatch, getState) => {
        // 从 Redux store 中获取当前的用户数据
        let userData = getState().application.userData;
        // 调用 WS 服务的 getScreenLayout 方法获取屏幕布局数据
        WS.getScreenLayout(userData.eamAccount.userGroup, entity, systemFunction, userFunction, tabs)
            .then(response => {
                 // 成功获取数据后，派发 updateApplication action 更新 Redux store
                dispatch(updateApplication({
                    [entityDesc + 'Layout']: response.body.data,  // 更新对应实体的布局数据
                    userData: {
                        ...userData,
                        [entityDesc + 'Screen']: userFunction // 更新用户数据中关于当前屏幕的信息
                    }
                }))
            }).catch(console.error);
    }
}

// 以下函数是特定实体屏幕布局更新的封装，每个函数都调用 updateScreenLayout 并传入特定参数。
export function updateWorkOrderScreenLayout(screenCode) {
    return updateScreenLayout('EVNT', 'workOrder', 'WSJOBS', screenCode, TAB_CODES_WORK_ORDERS)
}

export function updateAssetScreenLayout(screenCode) {
    return updateScreenLayout('OBJ', 'asset', 'OSOBJA', screenCode, TAB_CODES_ASSETS);
}

export function updatePositionScreenLayout(screenCode) {
    return updateScreenLayout('OBJ', 'position', 'OSOBJP', screenCode, TAB_CODES_POSITIONS);
}

export function updateSystemScreenLayout(screenCode) {
    return updateScreenLayout('OBJ', 'system', 'OSOBJS', screenCode, TAB_CODES_SYSTEMS);
}

export function updatePartScreenLayout(screenCode) {
    return updateScreenLayout('PART', 'part', 'SSPART', screenCode, TAB_CODES_PARTS);
}

export function updateLocationScreenLayout(screenCode) {
    return updateScreenLayout('OBJ', 'location', 'OSOBJL', screenCode, TAB_CODES_LOCATIONS)
}


/**
 * 根据用户数据创建一个包含屏幕布局信息的Promise数组。
 * 这个数组用于并行请求各个屏幕的布局数据，根据用户的屏幕配置和账户信息来确定需要请求的屏幕。
 * 每个屏幕布局请求都是一个Promise，这些Promise可以并行处理。
 *
 * @param userdata 用户数据，包含用户的屏幕配置和账户信息。
 * @returns {Promise[]} 返回一个Promise数组，每个Promise对应一个屏幕布局的请求。
 *                      数组中的每个元素都是一个Promise，它们分别对应于应用数据、资产、位置、系统、部件、工单和位置屏幕的布局请求。
 */
function createPromiseArray(userdata) {
    // 请求应用级数据的Promise
    let applicationDataPromise = WS.getApplicationData();

    // 资产屏幕布局请求
    let assetScreenPromise = Promise.resolve(false);
    // 如果用户数据中包含资产屏幕配置，则请求资产屏幕布局数据
    if (userdata.assetScreen) {
        assetScreenPromise = WS.getScreenLayout(userdata.eamAccount.userGroup, 'OBJ', 'OSOBJA',
            userdata.assetScreen, TAB_CODES_ASSETS);
    }

    // 定位屏幕布局请求
    let positionScreenPromise = Promise.resolve(false);
    if (userdata.positionScreen) {
        positionScreenPromise = WS.getScreenLayout(userdata.eamAccount.userGroup, 'OBJ', 'OSOBJP',
            userdata.positionScreen, TAB_CODES_POSITIONS);
    }

    // 系统屏幕布局请求
    let systemScreenPromise = Promise.resolve(false);
    if (userdata.systemScreen) {
        systemScreenPromise = WS.getScreenLayout(userdata.eamAccount.userGroup, 'OBJ', 'OSOBJS',
            userdata.systemScreen, TAB_CODES_SYSTEMS);
    }

    // 部件屏幕布局请求
    let partScreenPromise = Promise.resolve(false);
    if (userdata.partScreen) {
        partScreenPromise = WS.getScreenLayout(userdata.eamAccount.userGroup, 'PART', 'SSPART',
            userdata.partScreen, TAB_CODES_PARTS);
    }

    // 工单屏幕布局请求
    let woScreenPromise = Promise.resolve(false);
    if (userdata.workOrderScreen) {
        woScreenPromise = WS.getScreenLayout(userdata.eamAccount.userGroup, 'EVNT', 'WSJOBS',
            userdata.workOrderScreen, TAB_CODES_WORK_ORDERS);
    }

    // 位置屏幕布局请求
    let locationScreenPromise = Promise.resolve(false);
    if (userdata.locationScreen) {
        locationScreenPromise = WS.getScreenLayout(userdata.eamAccount.userGroup, 'LOC', 'OSOBJL',
            userdata.locationScreen, TAB_CODES_LOCATIONS);
    }

    // 返回包含所有屏幕布局请求的Promise数组
    return [
        applicationDataPromise,
        assetScreenPromise,
        positionScreenPromise,
        systemScreenPromise,
        partScreenPromise,
        woScreenPromise,
        locationScreenPromise
    ];
}
