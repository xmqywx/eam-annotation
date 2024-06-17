import {useState, useEffect, useRef, useMemo} from "react"
import { useSelector, useDispatch } from "react-redux";
import { isHiddenRegion, getHiddenRegionState, getUniqueRegionID } from '../selectors/uiSelectors'
import {useParams, useHistory, useLocation} from "react-router-dom"
import ErrorTypes from "eam-components/dist/enums/ErrorTypes";
import queryString from "query-string";
import set from "set-value";
import { assignDefaultValues, assignQueryParamValues, assignCustomFieldFromCustomField, assignCustomFieldFromObject, AssignmentType, fireHandlers, isDepartmentReadOnly, isMultiOrg, getElementInfoFromCustomFields, prepareDataForFieldsValidator } from "ui/pages/EntityTools";
import { setLayoutProperty, showError, showNotification, handleError, toggleHiddenRegion,
    setRegionVisibility,
    showWarning} from "actions/uiActions";
import WSCustomFields from "eam-components/dist/tools/WSCustomFields"
import { createOnChangeHandler, processElementInfo } from "eam-components/dist/ui/components/inputs-ng/tools/input-tools";
import { get } from "lodash";
import useFieldsValidator from "eam-components/dist/ui/components/inputs-ng/hooks/useFieldsValidator";

/**
 * useEntity 是一个自定义 React 钩子，用于管理实体（如设备、位置等）的 CRUD（创建、读取、更新、删除）操作和状态。
 * 这个钩子封装了与实体相关的逻辑，使得组件可以更简洁地处理实体数据。
 * 
 * @param {Object} params - 配置参数对象，包含以下属性:
 *   - {Object} WS - 包含 CRUD 方法的 Web 服务对象。
 *   - {Object} postActions - 包含 CRUD 操作后的回调函数。
 *   - {Object} handlers - 包含特定字段或操作的处理函数。
 *   - {string} entityCode - 实体的代码。
 *   - {string} entityDesc - 实体的描述。
 *   - {string} entityURL - 实体的基础 URL。
 *   - {string} entityCodeProperty - 实体代码的属性名。
 *   - {string} screenProperty - 屏幕属性名，用于从 Redux store 获取屏幕代码。
 *   - {string} layoutProperty - 布局属性名，用于从 Redux store 获取布局设置。
 *   - {Object} layoutPropertiesMap - 布局属性映射。
 *   - {Function} isReadOnlyCustomHandler - 自定义只读状态处理函数。
 *   - {Function} onMountHandler - 挂载时的处理函数。
 *   - {Function} onUnmountHandler - 卸载时的处理函数。
 *   - {string} codeQueryParamName - 代码查询参数名称。
 * 
 * @returns {Object} 包含以下属性和方法的对象:
 *   - {string} screenCode - 屏幕代码。
 *   - {Object} screenLayout - 屏幕布局设置。
 *   - {Object} screenPermissions - 屏幕权限。
 *   - {Object} entity - 当前实体对象。
 *   - {boolean} newEntity - 是否为新建实体。
 *   - {Function} setEntity - 设置实体对象的函数。
 *   - {boolean} loading - 加载状态。
 *   - {boolean} readOnly - 只读状态。
 *   - {boolean} isModified - 实体是否被修改。
 *   - {Object} userData - 用户数据。
 *   - {Object} applicationData - 应用程序数据。
 *   - {Function} isHiddenRegion - 判断区域是否隐藏的函数。
 *   - {Function} getHiddenRegionState - 获取隐藏区域状态的函数。
 *   - {Function} getUniqueRegionID - 获取唯一区域ID的函数。
 *   - {Object} commentsComponent - 评论组件的引用。
 *   - {Function} setLayoutProperty - 设置布局属性的函数。
 *   - {boolean} showEqpTree - 是否显示设备树。
 *   - {Function} showError - 显示错误的函数。
 *   - {Function} showNotification - 显示通知的函数。
 *   - {Function} handleError - 处理错误的函数。
 *   - {Function} showWarning - 显示警告的函数。
 *   - {Function} toggleHiddenRegion - 切换隐藏区域的函数。
 *   - {Function} setRegionVisibility - 设置区域可见性的函数。
 *   - {Function} newHandler - 新建处理函数。
 *   - {Function} saveHandler - 保存处理函数。
 *   - {Function} deleteHandler - 删除处理函数。
 *   - {Function} copyHandler - 复制处理函数。
 *   - {Function} updateEntityProperty - 更新实体属性的函数。
 *   - {Function} register - 注册函数。
 *   - {Function} setNewEntity - 设置新实体状态的函数。
 *   - {Function} setLoading - 设置加载状态的函数。
 *   - {Function} setReadOnly - 设置只读状态的函数。
 *   - {Function} createEntity - 创建实体的函数。
 */
const useEntity = (params) => {

    const {WS, postActions, handlers, entityCode, entityDesc, entityURL, entityCodeProperty, screenProperty, layoutProperty, layoutPropertiesMap,
        isReadOnlyCustomHandler, onMountHandler, onUnmountHandler, codeQueryParamName} = params;

    const [loading, setLoading] = useState(false);
    const [entity, setEntity] = useState(null);
    const [newEntity, setNewEntity] = useState(true);
    const [readOnly, setReadOnly] = useState(false);
    const [isModified, setIsModified] = useState(false);
    const {code} = useParams();
    const codeQueryParam = queryString.parse(window.location.search)[codeQueryParamName]; //TODO add equipment and part identifiers
    const history = useHistory();
    const abortController = useRef(null);
    const commentsComponent = useRef(null);

    // Init dispatchers
    const dispatch = useDispatch();
    const setLayoutPropertyConst = (...args) => dispatch(setLayoutProperty(...args));
    const showNotificationConst = (...args) => dispatch(showNotification(...args));
    const showErrorConst = (...args) => dispatch(showError(...args));
    const showWarningConst = (...args) => dispatch(showWarning(...args));
    const handleErrorConst = (...args) => dispatch(handleError(...args));
    const toggleHiddenRegionConst = (...args) => dispatch(toggleHiddenRegion(...args));
    const setRegionVisibilityConst = (...args) => dispatch(setRegionVisibility(...args));

    // Fetch data from the redux store
    const screenCode = useSelector(state => state.application.userData[screenProperty]);
    const screenLayout = useSelector(state => state.application[layoutProperty]);
    const screenPermissions = useSelector(state => state.application.userData.screens[screenCode]);
    const userData = useSelector(state =>  state.application.userData);
    const applicationData = useSelector(state =>  state.application.applicationData);
    const showEqpTree = useSelector(state =>  state.ui.layout.showEqpTree);

    const { errorMessages, validateFields, generateErrorMessagesFromException, resetErrorMessages } = useFieldsValidator(useMemo(() => prepareDataForFieldsValidator(entity, screenLayout, layoutPropertiesMap), [screenCode, entity?.customField]), entity);

    // HIDDEN REGIONS
    const isHiddenRegionConst = useSelector(state => isHiddenRegion(state)(screenCode))
    const getHiddenRegionStateConst = useSelector(state => getHiddenRegionState(state)(screenCode))
    const getUniqueRegionIDConst =  useSelector(state => getUniqueRegionID(state)(screenCode))

    useEffect( () => {
        if (!code && codeQueryParam) {
            history.push(process.env.PUBLIC_URL + entityURL + codeQueryParam + window.location.search);
            return;
        }
        code ? readEntity(code) : initNewEntity();
        // Reset window title when unmounting
        return () => document.title = "EAM Light";
    }, [code])

    useEffect( () => {
        onMountHandler?.();
        return () => onUnmountHandler?.();
    }, [])

    //
    // CRUD
    //
    const createEntity = (entityToCreate = entity) => {
        if (!validateFields()) {
            return;
        }
        setLoading(true);

        WS.create(entityToCreate)
            .then(response => {
                const entityCode = response.body.data;
                showNotificationConst(entityDesc + ' ' + entityCode + ' has been successfully created.');
                commentsComponent.current?.createCommentForNewEntity(entityCode);
                // Read after the creation (and append the organization in multi-org mode)
                history.push(process.env.PUBLIC_URL + entityURL + encodeURIComponent(entityCode + (isMultiOrg && entityToCreate.organization ? '#' + entityToCreate.organization : '')));
            })
            .catch(error => {
                generateErrorMessagesFromException(error?.response?.body?.errors);
                handleErrorConst(error)

            })
            .finally( () => setLoading(false))
    }

    const readEntity = (code) => {
        setLoading(true);

        // Cancel the old request in the case it was still active
        abortController.current?.abort();
        abortController.current = new AbortController();
        //
        WS.read(code, { signal: abortController.current.signal })
            .then(response => {
                resetErrorMessages(); setIsModified(false); setNewEntity(false);

                const readEntity = response.body.data;
                setEntity(readEntity);

                document.title = entityDesc + ' ' + readEntity[entityCodeProperty];

                // Render as read-only depending on screen rights, department security or custom handler
                setReadOnly(!screenPermissions.updateAllowed ||
                            isDepartmentReadOnly(readEntity.departmentCode, userData) ||
                            isReadOnlyCustomHandler?.(readEntity))

                // Invoke entity specific logic
                postActions.read(readEntity)
            })
            .catch(error => {
                if (error.type !== ErrorTypes.REQUEST_CANCELLED) {
                    handleErrorConst(error)
                }
            })
            .finally( () => setLoading(false))
    }

    const updateEntity = () => {
        if (!validateFields()) {
            return;
        }

        setLoading(true);

        WS.update(entity)
            .then(response => {
                resetErrorMessages(); setIsModified(false);

                commentsComponent.current?.createCommentForNewEntity(entityCode);
                showNotificationConst(`${entityDesc} ${entity[entityCodeProperty]} has been successfully updated.`);
                readEntity(code);
            })
            .catch(error => {
                generateErrorMessagesFromException(error?.response?.body?.errors);
                handleErrorConst(error)
            })
            .finally( () => setLoading(false))
    }

    const deleteEntity = () => {
        setLoading(true);

        WS.delete(code)
            .then(response => {
                showNotificationConst(`${entityDesc} ${entity[entityCodeProperty]} has been successfully deleted.`);
                history.push(process.env.PUBLIC_URL + entityURL);
            })
            .catch(error => {
                generateErrorMessagesFromException(error?.response?.body?.errors);
                handleErrorConst(error)
            })
            .finally( () => setLoading(false))
    }

    const initNewEntity = () => {
        setLoading(true);

        WS.new()
            .then(response => {
                resetErrorMessages();
                setNewEntity(true);
                setIsModified(false);
                setReadOnly(!screenPermissions.creationAllowed);

                let newEntity = response.body.data;
                newEntity = assignDefaultValues(newEntity, screenLayout, layoutPropertiesMap);
                newEntity = assignQueryParamValues(newEntity);
                setEntity(newEntity);
                fireHandlers(newEntity, getHandlers());
                document.title = 'New ' + entityDesc;
                postActions.new(newEntity);
            })
            .catch(error => {
                handleErrorConst(error)
            })
            .finally( () => setLoading(false))
    }

    const copyEntity = () => {
        let code = entity[entityCodeProperty];

        resetErrorMessages();
        setNewEntity(true);
        setIsModified(false);
        setReadOnly(!screenPermissions.creationAllowed);

        setEntity( oldEntity => ({
            ...assignDefaultValues(oldEntity,
                screenLayout,
                layoutPropertiesMap),
            copyFrom: code
        }))
        window.history.pushState({}, '', process.env.PUBLIC_URL + entityURL);
        document.title = 'New ' + entityDesc;
        postActions?.copy?.();
    }

    //
    // BUTTON HANDLERS
    //
    const saveHandler = () => newEntity ? createEntity() : updateEntity();

    const newHandler = () => history.push(entityURL);

    const deleteHandler = () => deleteEntity();

    const copyHandler = () => copyEntity();

    //
    // HELPER METHODS
    //
    const onChangeClass = newClass => {
        return WSCustomFields.getCustomFields(entityCode, newClass)
        .then(response => {
            setEntity(prevEntity => {
                const newCustomFields = response.body.data;
                let entity = assignCustomFieldFromCustomField(prevEntity, newCustomFields, AssignmentType.SOURCE_NOT_EMPTY);

                // replace custom fields with ones in query parameters if we have just created the entity
                if(newEntity) {
                    const queryParams = queryString.parse(window.location.search);
                    entity = assignCustomFieldFromObject(entity, queryParams, AssignmentType.SOURCE_NOT_EMPTY);
                }
                return entity;
            });
        })
        .catch(console.error)
    }

    const updateEntityProperty = (key, value) => {
        setEntity(prevEntity => set({...prevEntity}, key, value));
        // Fire handler for the 'key'
        getHandlers()[key]?.(value);
        //
        if (!key.endsWith("Desc")) {
            setIsModified(true);
        }
    };

    const register = (layoutKey, valueKey, descKey, orgKey, onChange) => {
        let data = processElementInfo(screenLayout.fields[layoutKey] ?? getElementInfoFromCustomFields(layoutKey, entity.customField))

        data.onChange = createOnChangeHandler(valueKey, descKey, orgKey, updateEntityProperty, onChange);

        data.disabled = data.disabled || readOnly; // It should remain disabled
        data.elementInfo = screenLayout.fields[layoutKey]; // Return elementInfo as it is still needed in some cases (for example for UDFs)

        // Value
        data.value = get(entity, valueKey);

        // Description
        if (descKey) {
            data.desc = get(entity, descKey);
        }

        // Errors
        data.errorText = errorMessages[valueKey]

        return data;
    }

    const getHandlers = () => ({...handlers, "classCode": onChangeClass});

    //
    //
    //
    console.log({screenCode, screenLayout, screenPermissions,
        entity, newEntity, setEntity, loading, readOnly, isModified,
        userData, applicationData,
        isHiddenRegion: isHiddenRegionConst,
        getHiddenRegionState: getHiddenRegionStateConst,
        getUniqueRegionID: getUniqueRegionIDConst,
        commentsComponent,
        setLayoutProperty: setLayoutPropertyConst,
        showEqpTree,
        // Dispatchers
        showError: showErrorConst, showNotification: showNotificationConst, handleError: handleErrorConst, showWarning: showWarningConst,
        toggleHiddenRegion: toggleHiddenRegionConst, setRegionVisibility: setRegionVisibilityConst,
        //
        newHandler, saveHandler, deleteHandler, copyHandler, updateEntityProperty, register,
        setNewEntity, setLoading, setReadOnly, createEntity,
    });
    return {screenCode, screenLayout, screenPermissions,
        entity, newEntity, setEntity, loading, readOnly, isModified,
        userData, applicationData,
        isHiddenRegion: isHiddenRegionConst,
        getHiddenRegionState: getHiddenRegionStateConst,
        getUniqueRegionID: getUniqueRegionIDConst,
        commentsComponent,
        setLayoutProperty: setLayoutPropertyConst,
        showEqpTree,
        // Dispatchers
        showError: showErrorConst, showNotification: showNotificationConst, handleError: handleErrorConst, showWarning: showWarningConst,
        toggleHiddenRegion: toggleHiddenRegionConst, setRegionVisibility: setRegionVisibilityConst,
        //
        newHandler, saveHandler, deleteHandler, copyHandler, updateEntityProperty, register,
        setNewEntity, setLoading, setReadOnly, createEntity,
    };

}

export default useEntity;