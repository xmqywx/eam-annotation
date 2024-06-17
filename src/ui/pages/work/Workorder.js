// 导入用于工单页面的各种UI组件和工具
import Checklists from 'eam-components/dist/ui/components/checklists/Checklists'; // 检查列表组件
import Comments from 'eam-components/dist/ui/components/comments/Comments'; // 评论组件
import { useHistory } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import BlockUi from 'react-block-ui'; // UI阻塞组件，用于加载时显示遮罩
import WSEquipment from "../../../tools/WSEquipment";
import WSWorkorder from "../../../tools/WSWorkorders";
import {ENTITY_TYPE} from "../../components/Toolbar";
import CustomFields from 'eam-components/dist/ui/components/customfields/CustomFields';
import EDMSDoclightIframeContainer from "../../components/iframes/EDMSDoclightIframeContainer";
import NCRIframeContainer from "../../components/iframes/NCRIframeContainer";
import EamlightToolbarContainer from './../../components/EamlightToolbarContainer';
import Activities from './activities/Activities';
import AdditionalCostsContainer from "./additionalcosts/AdditionalCostsContainer";
import WorkorderChildren from "./childrenwo/WorkorderChildren";
import MeterReadingContainerWO from './meter/MeterReadingContainerWO';
import WorkorderMultiequipment from "./multiequipmentwo/WorkorderMultiequipment";
import PartUsageContainer from "./partusage/PartUsageContainer";
import WorkorderClosingCodes from './WorkorderClosingCodes';
import WorkorderGeneral from './WorkorderGeneral';
import WorkorderScheduling from './WorkorderScheduling';
import { assignStandardWorkOrderValues, isReadOnlyCustomHandler, isRegionAvailable, layoutPropertiesMap } from "./WorkorderTools";
import EntityRegions from '../../components/entityregions/EntityRegions';
import IconButton from '@mui/material/IconButton';
import PrintIcon from '@mui/icons-material/Print';
import TuneIcon from '@mui/icons-material/Tune';
import {IconSlash} from 'eam-components/dist/ui/components/icons/index';
import { isCernMode } from '../../components/CERNMode';
import { TAB_CODES } from '../../components/entityregions/TabCodeMapping';
import { getTabAvailability, getTabInitialVisibility, registerCustomField } from '../EntityTools';
import WSParts from '../../../tools/WSParts';
import WSWorkorders from '../../../tools/WSWorkorders';
import useEntity from "hooks/useEntity";
import { updateMyWorkOrders } from '../../../actions/workorderActions'
import { useDispatch } from 'react-redux';
import UserDefinedFields from 'ui/components/userdefinedfields/UserDefinedFields';
import { isHidden } from 'eam-components/dist/ui/components/inputs-ng/tools/input-tools';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import ConstructionIcon from '@mui/icons-material/Construction';
import SpeedIcon from '@mui/icons-material/Speed';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import SegmentRoundedIcon from '@mui/icons-material/SegmentRounded';
import { PendingActions } from '@mui/icons-material';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { PartIcon } from 'eam-components/dist/ui/components/icons';
import FunctionsRoundedIcon from '@mui/icons-material/FunctionsRounded';
import HardwareIcon from '@mui/icons-material/Hardware';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';

// 定义一个异步函数，用于获取指定设备和标准工作订单的最大步骤信息
const getEquipmentStandardWOMaxStep = async (eqCode, swoCode) => {
    // 检查设备代码和标准工作订单代码是否存在，如果任一不存在，则函数返回，不执行后续操作
    if (!eqCode || !swoCode) {
        return;
    }
    // 使用WSWorkorder服务的getEquipmentStandardWOMaxStep方法，传入设备代码和标准工作订单代码，从服务器获取数据
    const response = await WSWorkorder.getEquipmentStandardWOMaxStep(eqCode, swoCode);
    // 返回从服务器获取的数据中的主体部分
    return response.body.data;
}

// 定义Workorder组件
const Workorder = () => {
    const history = useHistory(); // 用于导航历史
    const [equipmentMEC, setEquipmentMEC] = useState(); // 状态：设备MEC信息
    const [equipment, setEquipment] = useState(); // 状态：设备信息
    const [equipmentPart, setEquipmentPart] = useState(); // 状态：设备部件信息
    const [statuses, setStatuses] = useState([]); // 状态：状态列表
    const [otherIdMapping, setOtherIdMapping] = useState({}) // 状态：其他ID映射
    const [expandChecklistsOptions, setExpandChecklistsOptions] = useState(false) // 状态：是否展开检查列表选项
    const checklists = useRef(null); // Ref：检查列表组件的引用
    const dispatch = useDispatch();
    const updateMyWorkOrdersConst = (...args) => dispatch(updateMyWorkOrders(...args)); // 封装dispatch的函数

    // useEntity 是一个自定义 React 钩子，用于管理实体（如设备、位置等）的 CRUD（创建、读取、更新、删除）操作和状态。这个钩子封装了与实体相关的逻辑，使得组件可以更简洁地处理实体数据
    const {
        screenLayout: workOrderLayout, // 工单的屏幕布局
        entity: workorder, // 当前工单实体
        setEntity: setWorkOrder, // 设置工单实体的函数
        loading, // 加载状态
        readOnly, // 只读状态
        isModified, // 工单是否被修改
        screenPermissions, // 屏幕权限
        screenCode, // 屏幕代码
        userData, // 用户数据
        applicationData, // 应用程序数据
        newEntity, // 是否为新建实体
        commentsComponent, // 评论组件的引用
        isHiddenRegion, // 是否隐藏区域
        getHiddenRegionState, // 获取隐藏区域状态的函数
        getUniqueRegionID, // 获取唯一区域ID的函数
        toggleHiddenRegion, // 切换隐藏区域的函数
        setRegionVisibility, // 设置区域可见性的函数
        setLayoutProperty, // 设置布局属性的函数
        newHandler, // 新建处理函数
        saveHandler, // 保存处理函数
        deleteHandler, // 删除处理函数
        copyHandler, // 复制处理函数
        updateEntityProperty: updateWorkorderProperty, // 更新工单属性的函数
        register, // 注册函数
        handleError, // 处理错误的函数
        showError, // 显示错误的函数
        showNotification, // 显示通知的函数
        showWarning, // 显示警告的函数
        createEntity, // 创建实体的函数
        setLoading, // 设置加载状态的函数
        setReadOnly // 设置只读状态的函数
    } = useEntity({
        WS: {
            create: WSWorkorder.createWorkOrder, // 创建工单的Web服务
            read: WSWorkorder.getWorkOrder, // 读取工单的Web服务
            update: WSWorkorder.updateWorkOrder, // 更新工单的Web服务
            delete: WSWorkorder.deleteWorkOrder, // 删除工单的Web服务
            new:  WSWorkorder.initWorkOrder, // 初始化新工单的Web服务
        },
        postActions: {
            read: postRead, // 读取后的操作
            new: postInit, // 新建后的初始化操作
            copy: postCopy // 复制后的操作
        },
        handlers: {
            standardWO: onChangeStandardWorkOrder, // 标准工单更改处理
            equipmentCode: onChangeEquipment // 设备代码更改处理
        },
        isReadOnlyCustomHandler: isReadOnlyCustomHandler, // 自定义只读状态处理函数
        entityCode: "EVNT", // 实体代码
        entityDesc: "Work Order", // 实体描述
        entityURL: "/workorder/", // 实体URL
        entityCodeProperty: "number", // 实体代码属性
        screenProperty: "workOrderScreen", // 屏幕属性
        layoutProperty: "workOrderLayout", // 布局属性
        layoutPropertiesMap, // 布局属性映射
        onMountHandler: mountHandler, // 挂载时的处理函数
        onUnmountHandler: unmountHandler, // 卸载时的处理函数
        codeQueryParamName: "workordernum" // 代码查询参数名称
    });

    // 使用useEffect钩子来处理设备信息的加载
    useEffect(() => {
        // 初始化时清空设备和设备部件的状态
        setEquipment(null);
        setEquipmentPart(null);

        // 如果当前工单没有设备代码，则不执行任何操作
        if (!workorder?.equipmentCode) {
            return;
        }

        // 使用WSEquipment服务获取指定设备的详细信息
        WSEquipment.getEquipment(workorder.equipmentCode)
        .then(response => {
            const equipmentResponse = response.body.data; // 从响应中提取设备数据
            setEquipment(equipmentResponse); // 设置设备状态

            // 如果设备有部件代码，进一步获取部件信息
            if (equipmentResponse.partCode) {
                WSParts.getPart(equipmentResponse.partCode)
                .then(response => setEquipmentPart(response.body.data)) // 设置设备部件状态
                .catch(console.error); // 处理获取部件信息的错误
            }
        })
        .catch(console.error); // 处理获取设备信息的错误

    }, [workorder?.equipmentCode]); // 依赖项：当工单的设备代码变化时，重新执行此逻辑

    // 定义一个函数，用于处理设备代码的变更
    function onChangeEquipment(equipmentCode) {
        // 如果设备代码为空，则不执行任何操作
        if(!equipmentCode) {
            return;
        }

        // 同时获取设备的详细信息和设备的线性详情
        Promise.all([
            WSEquipment.getEquipment(equipmentCode), // 获取设备详细信息
            WSWorkorders.getWOEquipLinearDetails(equipmentCode), // 获取设备的线性详情
        ]).then(response => {
            const equipment = response[0].body.data; // 设备详细信息
            const linearDetails = response[1].body.data; // 设备的线性详情

            // 更新工单状态，包括部门代码、位置代码、成本代码和保修状态
            setWorkOrder(oldWorkOrder => ({
                ...oldWorkOrder,
                departmentCode: equipment.departmentCode,
                departmentDesc: equipment.departmentDesc,
                locationCode: equipment.hierarchyLocationCode,
                locationDesc: equipment.hierarchyLocationDesc,
                costCode: equipment.costCode,
                costCodeDesc: equipment.costCodeDesc,
                warranty: linearDetails.ISWARRANTYACTIVE
            }))

            // 如果设备处于保修期，显示警告信息
            if (linearDetails.ISWARRANTYACTIVE === 'true') {
                showWarning('This equipment is currently under warranty.');
            }
        })
        .catch(console.error); // 处理任何错误
    };

    // 定义一个函数，用于处理标准工作订单代码的变更
    function onChangeStandardWorkOrder(standardWorkOrderCode) {
        // 如果标准工作订单代码存在
        if (standardWorkOrderCode) {
            // 获取标准工作订单的详细信息
            WSWorkorder.getStandardWorkOrder(standardWorkOrderCode)
            .then(response => {
                // 更新工单状态，根据标准工作订单的详细信息
                setWorkOrder(oldWorkOrder => assignStandardWorkOrderValues(oldWorkOrder, response.body.data))
            })
            .catch(console.error); // 处理任何错误
        }
    }

    // 定义一个函数，用于获取工单页面的各个区域配置
    const getRegions = () => {
        const { tabs } = workOrderLayout; // 从工单布局中获取标签信息

        // 定义常用的属性，以便在多个区域中重用
        const commonProps = {
            workorder,
            newEntity,
            workOrderLayout,
            userGroup: userData.eamAccount.userGroup,
            updateWorkorderProperty,
            register
        };
        console.log("screenPermissions", screenPermissions, register)

        // 返回一个数组，包含所有区域的配置
        return [
            {
                id: 'DETAILS', // 区域标识符
                label: 'Details', // 区域标签
                isVisibleWhenNewEntity: true, // 新实体时是否可见
                maximizable: false, // 是否可以最大化
                render: () =>
                    <WorkorderGeneral
                        {...commonProps}
                        applicationData={applicationData}
                        userData={userData}
                        equipment={equipment}
                        statuses={statuses}
                        newEntity={newEntity}
                        screenCode={screenCode}
                        screenPermissions={screenPermissions}
                        setLayoutProperty={setLayoutProperty}/>
                ,
                column: 1, // 所在列
                order: 1, // 排序顺序
                summaryIcon: AssignmentIcon, // 摘要图标
                ignore: !getTabAvailability(tabs, TAB_CODES.RECORD_VIEW), // 是否忽略此区域
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.RECORD_VIEW) // 初始可见性
            },
            {
                id: 'SCHEDULING',
                label: 'Scheduling',
                isVisibleWhenNewEntity: true,
                maximizable: false,
                customVisibility: () => isRegionAvailable('SCHEDULING', commonProps.workOrderLayout),
                render: () =>
                    <WorkorderScheduling {...commonProps} />
                ,
                column: 1,
                order: 2,
                summaryIcon: CalendarMonthIcon,
                ignore: !getTabAvailability(tabs, TAB_CODES.RECORD_VIEW),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.RECORD_VIEW)
            },
            {
                id: 'CLOSINGCODES',
                label: 'Closing Codes',
                isVisibleWhenNewEntity: true,
                maximizable: false,
                customVisibility: () => isRegionAvailable('CLOSING_CODES', commonProps.workOrderLayout),
                render: () =>
                    <WorkorderClosingCodes {...commonProps} equipment={equipment} />
                ,
                column: 1,
                order: 3,
                summaryIcon: SportsScoreIcon,
                ignore: !getTabAvailability(tabs, TAB_CODES.CLOSING_CODES),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.CLOSING_CODES)
            },
            {
                id: 'PARTUSAGE',
                label: 'Part Usage',
                isVisibleWhenNewEntity: false,
                maximizable: false,
                customVisibility: () => isRegionAvailable('PAR', commonProps.workOrderLayout),
                render: () =>
                    <PartUsageContainer
                        workorder={workorder}
                        tabLayout={tabs.PAR}
                        equipmentMEC={equipmentMEC}
                        disabled={readOnly} />
                ,
                column: 1,
                order: 4,
                summaryIcon: PartIcon,
                ignore: !getTabAvailability(tabs, TAB_CODES.PART_USAGE),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.PART_USAGE)
            },
            {
                id: 'ADDITIONALCOSTS',
                label: 'Additional Costs',
                isVisibleWhenNewEntity: false,
                maximizable: false,
                customVisibility: () => isRegionAvailable('ACO', commonProps.workOrderLayout),
                render: () =>
                    <AdditionalCostsContainer
                        workorder={workorder}
                        tabLayout={tabs.ACO}
                        equipmentMEC={equipmentMEC}
                        disabled={readOnly} />
                ,
                column: 1,
                order: 4,
                summaryIcon: MonetizationOnRoundedIcon,
                ignore: !getTabAvailability(tabs, TAB_CODES.ADDITIONAL_COSTS),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.ADDITIONAL_COSTS)
            },
            {
                id: 'CHILDRENWOS',
                label: 'Child Work Orders',
                isVisibleWhenNewEntity: false,
                maximizable: false,
                customVisibility: () => isRegionAvailable('CWO', commonProps.workOrderLayout),
                render: () => <WorkorderChildren workorder={workorder.number} />,
                column: 1,
                order: 4,
                summaryIcon: SegmentRoundedIcon,
                ignore: !getTabAvailability(tabs, TAB_CODES.CHILD_WO),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.CHILD_WO)
            },
            {
                id: 'EDMSDOCUMENTS',
                label: 'EDMS Documents',
                isVisibleWhenNewEntity: false,
                maximizable: true,
                render: () =>
                    <EDMSDoclightIframeContainer
                        objectType="J"
                        objectID={workorder.number} />
                ,
                RegionPanelProps: {
                    detailsStyle: { padding: 0 }
                },
                column: 2,
                order: 5,
                summaryIcon: FunctionsRoundedIcon,
                ignore: !isCernMode && !getTabAvailability(tabs, TAB_CODES.EDMS_DOCUMENTS_WORK_ORDERS),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.EDMS_DOCUMENTS_WORK_ORDERS)
            },
            {
                id: 'NCRS',
                label: 'NCRs',
                isVisibleWhenNewEntity: false,
                maximizable: true,
                render: () =>
                    <NCRIframeContainer
                        objectType="J"
                        objectID={workorder.number}
                        mode='NCR'
                    />
                ,
                RegionPanelProps: {
                    detailsStyle: { padding: 0 }
                },
                column: 2,
                order: 6,
                summaryIcon: BookmarkBorderRoundedIcon,
                ignore: !isCernMode && !getTabAvailability(tabs, TAB_CODES.EDMS_DOCUMENTS_WORK_ORDERS),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.EDMS_DOCUMENTS_WORK_ORDERS)
            },
            {
                id: 'COMMENTS',
                label: 'Comments',
                isVisibleWhenNewEntity: true,
                maximizable: false,
                render: () =>
                    <Comments
                        ref={comments => commentsComponent.current = comments}
                        entityCode='EVNT'
                        entityKeyCode={!newEntity ? workorder.number : undefined}
                        userCode={userData.eamAccount.userCode}
                        handleError={handleError}
                        allowHtml={true}
                        //entityOrganization={workorder.organization}
                        disabled={readOnly} />
                ,
                RegionPanelProps: {
                    detailsStyle: { padding: 0 }
                },
                column: 2,
                order: 7,
                summaryIcon: DriveFileRenameOutlineIcon,
                ignore: !getTabAvailability(tabs, TAB_CODES.COMMENTS),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.COMMENTS)
            },
            {
                id: 'ACTIVITIES',
                label: 'Activities and Booked Labor',
                isVisibleWhenNewEntity: false,
                maximizable: true,
                render: () =>
                    <Activities
                        workorder={workorder.number}
                        department={workorder.departmentCode}
                        departmentDesc={workorder.departmentDesc}
                        layout={tabs}
                        defaultEmployee={userData.eamAccount.employeeCode}
                        defaultEmployeeDesc={userData.eamAccount.employeeDesc}
                        postAddActivityHandler={postAddActivityHandler}
                        updateEntityProperty={updateWorkorderProperty}
                        updateCount={workorder.updateCount}
                        startDate={workorder.startDate}
                        disabled={readOnly}
                        handleError={handleError}
                    />
                ,
                column: 2,
                order: 8,
                summaryIcon: PendingActions,
                ignore: !getTabAvailability(tabs, TAB_CODES.ACTIVITIES) && !getTabAvailability(tabs, TAB_CODES.BOOK_LABOR),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.ACTIVITIES) || getTabInitialVisibility(tabs, TAB_CODES.BOOK_LABOR)
            },
            {
                id: 'CHECKLISTS',
                label: 'Checklists',
                isVisibleWhenNewEntity: false,
                maximizable: true,
                render: ({panelQueryParams}) =>  (
                    <Checklists
                        workorder={workorder.number}
                        eqpToOtherId={otherIdMapping}
                        printingChecklistLinkToAIS={applicationData.EL_PRTCL}
                        maxExpandedChecklistItems={Math.abs(parseInt(applicationData.EL_MCHLS)) || 50}
                        getWoLink={wo => '/workorder/' + wo}
                        ref={checklists}
                        showSuccess={showNotification}
                        showError={showError}
                        handleError={handleError}
                        userCode={userData.eamAccount.userCode}
                        disabled={readOnly}
                        hideFollowUpProp={isHidden(
                            commonProps.workOrderLayout.tabs.ACK.fields.createfollowupwo
                        )}
                        expandChecklistsOptions={expandChecklistsOptions}
                        showFilledItems={panelQueryParams.CHECKLISTSshowFilledItems === 'true' || panelQueryParams.CHECKLISTSshowFilledItems === undefined}
                        activity={panelQueryParams.CHECKLISTSactivity}
                        register={register}
                        />
                )
                ,
                RegionPanelProps: {
                    customHeadingBar:
                    applicationData.EL_PRTCL && <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                                        <IconButton
                                            onClick={() => window.open(applicationData.EL_PRTCL + workorder.number, '_blank', 'noopener noreferrer')}>
                                            <PrintIcon fontSize='small' />
                                        </IconButton>
                                        <IconButton
                                            onClick={(e) => { e.stopPropagation(); setExpandChecklistsOptions(!expandChecklistsOptions); }}>
                                            <TuneIcon fontSize='small'/> { expandChecklistsOptions ? <IconSlash backgroundColor='#fafafa' iconColor='#737373'/> : null }
                                        </IconButton>
                                      </div>
    
                },
                column: 2,
                order: 9,
                summaryIcon: PlaylistAddCheckIcon,
                ignore: !getTabAvailability(tabs, TAB_CODES.CHECKLIST),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.CHECKLIST)
            },
            {
                id: 'CUSTOMFIELDS',
                label: 'Custom Fields',
                isVisibleWhenNewEntity: true,
                maximizable: false,
                render: () =>
                    <CustomFields
                        entityCode='EVNT'
                        entityKeyCode={workorder.number}
                        classCode={workorder.classCode}
                        customFields={workorder.customField}
                        register={register} />
                ,
                column: 2,
                order: 10,
                summaryIcon: ListAltIcon,
                ignore: workOrderLayout.fields.block_5.attribute === 'H',
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.RECORD_VIEW)
            },
            {
                id: 'CUSTOMFIELDSEQP',
                label: 'Custom Fields Equipment',
                isVisibleWhenNewEntity: true,
                maximizable: false,
                render: () =>
                    <CustomFields
                        entityCode='OBJ'
                        entityKeyCode={equipment?.code}
                        classCode={equipment?.classCode}
                        customFields={equipment?.customField}
                        register={registerCustomField(equipment)}/>
                ,
                column: 2,
                order: 11,
                summaryIcon: ConstructionIcon,
                ignore: !isRegionAvailable('CUSTOM_FIELDS_EQP', commonProps.workOrderLayout),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.RECORD_VIEW)
            },
            {
                id: 'CUSTOMFIELDSPART',
                label: 'Custom Fields Part',
                isVisibleWhenNewEntity: true,
                maximizable: false,
                render: () => (
                    <CustomFields
                        entityCode="PART"
                        entityKeyCode={equipmentPart?.Code}
                        classCode={equipmentPart?.classCode}
                        customFields={equipmentPart?.customField}
                        register={registerCustomField(equipmentPart)}/>
                ),
                column: 2,
                order: 12,
                summaryIcon: HardwareIcon,
                ignore: !isRegionAvailable('CUSTOM_FIELDS_PART', commonProps.workOrderLayout),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.PARTS_ASSOCIATED),
            },
            {
                id: 'METERREADINGS',
                label: 'Meter Readings',
                isVisibleWhenNewEntity: false,
                maximizable: true,
                render: () =>
                    <MeterReadingContainerWO equipment={workorder.equipmentCode} disabled={readOnly} />
                ,
                column: 2,
                order: 12,
                summaryIcon: SpeedIcon,
                ignore: !getTabAvailability(tabs, TAB_CODES.METER_READINGS),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.METER_READINGS)
            },
            {
                id: 'MULTIPLEEQUIPMENT',
                label: 'Equipment',
                isVisibleWhenNewEntity: false,
                customVisibility: () => isRegionAvailable('MEC', commonProps.workOrderLayout),
                maximizable: false,
                render: () =>
                    <WorkorderMultiequipment workorder={workorder.number} setEquipmentMEC={setEquipmentMEC}/>
                ,
                column: 2,
                order: 13,
                summaryIcon: PrecisionManufacturingIcon,
                ignore: !getTabAvailability(tabs, TAB_CODES.EQUIPMENT_TAB_WO_SCREEN),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.EQUIPMENT_TAB_WO_SCREEN)
            },
            {
                id: 'USERDEFINEDFIELDS',
                label: 'User Defined Fields',
                isVisibleWhenNewEntity: true,
                maximizable: false,
                render: () =>
                    <UserDefinedFields
                        {...commonProps}
                        entityLayout={workOrderLayout.fields}
                    />
                ,
                column: 2,
                order: 10,
                summaryIcon: AssignmentIndIcon,
                ignore: !getTabAvailability(tabs, TAB_CODES.RECORD_VIEW),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.RECORD_VIEW)
            },
        ];
    }

    // 定义一个函数，用于计算下一个步骤的编号
    const getNextStep = (n) => n ? (([integ, deci]) => +(integ + "." + (+(deci || 0) + 1)))(n.split(".")) : "";

    // 定义一个异步函数，用于处理重复步骤的逻辑
    const repeatStepHandler = async () => {
        setLoading(true); // 设置加载状态为true
        const fields = workOrderLayout.fields;
        const { customField, number, equipmentCode, standardWO, parentWO, departmentCode, locationCode } = workorder;
        try {
            let value;

            try {
                const maxSWO = await getEquipmentStandardWOMaxStep(equipmentCode, standardWO);
                value = getNextStep(maxSWO.step);
            } catch (err) {
                value = "";
            }

            const newCustomFields = [{code: 'MTFEVP1', value }];
            const newWorkOrder = {
                standardWO,
                equipmentCode,
                customField: newCustomFields,
                statusCode: "R",
                systemStatusCode: "R",
                parentWO,
                departmentCode,
                locationCode,
                classCode: 'MTF2',
            }

            createEntity(newWorkOrder);

        } catch (err) {
            showError(JSON.stringify(err), "Could not repeat step.");
        }
    }
    //
    // CALLBACKS FOR ENTITY CLASS
    // 回调函数，用于实体类的初始化
    function postInit() {
        readStatuses('', '', true);
    }

    // 回调函数，用于读取工单后的处理
    function postRead(workorder) {
        setLayoutProperty('equipment', {code: workorder.equipmentCode, organization: workorder.equipmentOrganization});
        updateMyWorkOrdersConst(workorder);
        readStatuses(workorder.statusCode, workorder.typeCode, false);
        readOtherIdMapping(workorder.number);
    }

    // 回调函数，用于复制工单后的处理
    function postCopy() {
        readStatuses('', '', true);
        let fields = workOrderLayout.fields;
        isCernMode && updateWorkorderProperty("statusCode", fields.workorderstatus.defaultValue ? fields.workorderstatus.defaultValue : "R")
        isCernMode && updateWorkorderProperty("systemStatusCode", "R")
        isCernMode && updateWorkorderProperty("typeCode", fields.workordertype.defaultValue ? fields.workordertype.defaultValue : "CD")
        isCernMode && updateWorkorderProperty("completedDate", "");
    }

    //
    // DROP DOWN VALUES
    // 读取工单状态值
    const readStatuses = (status, type, newwo) => {
        WSWorkorder.getWorkOrderStatusValues(userData.eamAccount.userGroup, status, type, newwo)
            .then(response => setStatuses(response.body.data))
            .catch(console.error);
    }

    // 添加活动后的处理器
    const postAddActivityHandler = () => {
        //Refresh the activities in the checklist
        checklists.current && checklists.current.readActivities(workorder.number);
    };

    // 读取其他ID映射
    const readOtherIdMapping = (number) => {
        WSWorkorder.getWOEquipToOtherIdMapping(number)
            .then(response => setOtherIdMapping(response.body.data))
            .catch(error => console.error('readOtherIdMapping', error))
    }

    // 挂载处理器
    function mountHandler() {
        setLayoutProperty('eqpTreeMenu', [{
            desc: "Use for this Work Order",
            icon: <ContentPasteIcon/>,
            handler: (rowInfo) => {
                updateWorkorderProperty('equipmentCode', rowInfo.node.id)
                updateWorkorderProperty('equipmentDesc', rowInfo.node.name)
            }
        }])
    }

    // 卸载处理器
    function unmountHandler() {
        setLayoutProperty('eqpTreeMenu', null);
    }

    // 如果没有工单数据，不渲染任何内容
    if (!workorder) {
        return React.Fragment;
    }

    // 主渲染部分，包括工具栏和实体区域
    return (
        // 工单的主容器
        <div className="entityContainer">
            {/* BlockUi组件用于在数据加载时显示遮罩层，防止用户操作 */}
            <BlockUi tag="div" blocking={loading} style={{height: "100%", width: "100%"}}>
                {/* 工具栏容器，包含工单的操作按钮和信息 */}
                <EamlightToolbarContainer
                    isModified={isModified} // 是否修改过，用于控制保存按钮的启用状态
                    newEntity={newEntity} // 是否为新建的实体
                    entityScreen={screenPermissions} // 实体的权限信息
                    entityName="Work Order" // 实体名称
                    entityKeyCode={workorder.number} // 工单编号
                    organization={workorder.organization} // 组织信息
                    saveHandler={saveHandler} // 保存操作的处理函数
                    newHandler={newHandler} // 新建操作的处理函数
                    deleteHandler={deleteHandler} // 删除操作的处理函数
                    width={790} // 工具栏的宽度
                    toolbarProps={{
                        entity: workorder, // 当前的工单对象
                        equipment: equipment, // 相关的设备对象
                        // postInit: this.postInit.bind(this),
                        // setLayout: this.setLayout.bind(this),
                        newEntity, // 是否为新建的实体
                        applicationData: applicationData, // 应用程序数据
                        userGroup: userData.eamAccount.userGroup, // 用户组信息
                        screencode: screenCode, // 屏幕代码
                        copyHandler: copyHandler, // 复制操作的处理函数
                        repeatStepHandler: repeatStepHandler, // 重复步骤操作的处理函数
                        entityDesc: "Work Order", // 实体描述
                        entityType: ENTITY_TYPE.WORKORDER, // 实体类型
                        screens: userData.screens, // 用户的屏幕信息
                        workorderScreencode: userData.workOrderScreen, // 工单屏幕代码
                        departmentalSecurity: userData.eamAccount.departmentalSecurity, // 部门安全信息
                    }}
                    entityIcon={<ContentPasteIcon style={{height: 18}}/>} // 实体图标
                    toggleHiddenRegion={toggleHiddenRegion} // 切换隐藏区域的函数
                    regions={getRegions()} // 获取区域的函数
                    getUniqueRegionID={getUniqueRegionID} // 获取唯一区域ID的函数
                    getHiddenRegionState={getHiddenRegionState} // 获取隐藏区域状态的函数
                    isHiddenRegion={isHiddenRegion} // 是否为隐藏区域
                />
                {/* 实体区域组件，用于显示和管理工单的不同区域 */}
                <EntityRegions
                    regions={getRegions()} // 获取区域的函数
                    isNewEntity={newEntity} // 是否为新建的实体
                    getUniqueRegionID={getUniqueRegionID} // 获取唯一区域ID的函数
                    getHiddenRegionState={getHiddenRegionState} // 获取隐藏区域状态的函数
                    setRegionVisibility={setRegionVisibility} // 设置区域可见性的函数
                    isHiddenRegion={isHiddenRegion}  // 是否为隐藏区域
                />
            </BlockUi>
        </div>
    )
}

export default Workorder;
