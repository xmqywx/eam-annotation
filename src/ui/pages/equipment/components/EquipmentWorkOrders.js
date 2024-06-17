import React, {useState, useEffect} from 'react';
import {format} from 'date-fns'
import WSEquipment from '../../../../tools/WSEquipment';
import EISTable, {TRANSFORM_KEYS} from 'eam-components/dist/ui/components/table';
import EISTableFilter from 'eam-components/dist/ui/components/table/EISTableFilter';
import EquipmentMTFWorkOrders from "./EquipmentMTFWorkOrders"
import BlockUi from 'react-block-ui';
import { isCernMode } from '../../../components/CERNMode';
import Constants from 'eam-components/dist/enums/Constants';
import useLocalStorage from '../../../../hooks/useLocalStorage';

// 定义工作订单过滤类型
const WO_FILTER_TYPES = {
    ALL: 'All',
    OPEN: 'Open',
    MTF: 'MTF',
    THIS: 'This Eqp'
}

// 定义工作订单过滤逻辑
const WO_FILTERS = {
    [WO_FILTER_TYPES.ALL]: {
        text: WO_FILTER_TYPES.ALL,
        process: (data) => {
            return [...data];
        }
    },
    [WO_FILTER_TYPES.OPEN]: {
        text: WO_FILTER_TYPES.OPEN,
        process: (data) => {
            return data.filter((workOrder) => workOrder.status && ['T', 'C'].every(statusCode => !workOrder.status.startsWith(statusCode)));
        }
    },
    ...(isCernMode ? {[WO_FILTER_TYPES.MTF]: {
        text: WO_FILTER_TYPES.MTF,
        process: (data) => {
            return data.filter((workOrder) => {
                return workOrder.mrc && (workOrder.mrc.startsWith("ICF") || workOrder.mrc.startsWith("MTF"));
            })
        }
    }} : {}),
    [WO_FILTER_TYPES.THIS]: {
        text: WO_FILTER_TYPES.THIS,
        process: data => [...data]
    }
}

const LOCAL_STORAGE_FILTER_KEY = 'filters:workorders'; // 定义本地存储中过滤器的键名

// 定义EquipmentWorkOrders组件
function EquipmentWorkOrders(props) {
    const { defaultFilter, equipmentcode, equipmenttype } = props; // 从props中解构出默认过滤器、设备代码和设备类型

    let [events, setEvents] = useState([]); // 定义events状态，用于存储事件数据
    let [workorders, setWorkorders] = useState([]); // 定义workorders状态，用于存储工作订单数据
    const [loadingData, setLoadingData] = useState(true); // 定义loadingData状态，用于控制数据加载状态

    const [workOrderFilter, setWorkOrderFilter] = useLocalStorage(LOCAL_STORAGE_FILTER_KEY, WO_FILTER_TYPES.ALL, defaultFilter); // 使用本地存储钩子管理工作订单过滤器状态
    let headers = ['Work Order', 'Equipment', 'Description', 'Status', 'Creation Date']; // 定义表格头部
    let propCodes = ['number', 'object','desc', 'status', 'createdDate']; // 定义表格属性代码

    if (workOrderFilter === WO_FILTER_TYPES.THIS) {
        headers = ['Work Order', 'Description', 'Status', 'Creation Date']; // 如果过滤器为THIS，调整表格头部
        propCodes = ['number', 'desc', 'status', 'createdDate']; // 调整表格属性代码
    }

    // 将表格头部中的空格替换为不间断空格，防止头部换行
    headers = headers.map(string => string.replaceAll(' ', '\u00a0'));

    // 定义链接映射
    const linksMap = new Map([
        ['number', {
            linkType: 'fixed',
            linkValue: 'workorder/',
            linkPrefix: '/'
        }],
        ['object', {
            linkType: 'dynamic',
            linkValue: 'objectUrl',
            linkPrefix: '/'
        }]
    ]);

    // 定义样式映射
    const stylesMap = {
        number: {
            overflowWrap: 'anywhere'
        }
    };

    // 定义键映射
    const keyMap = {
        createdDate: TRANSFORM_KEYS.DATE_DD_MMM_YYYY
    }

    // 定义获取过滤后的工作订单列表的函数
    let getFilteredWorkOrderList = (workOrders) => {
        return WO_FILTERS[workOrderFilter].process(workOrders)
    }

    // 使用useEffect钩子处理组件挂载和更新逻辑
    useEffect(() => {
        if (equipmentcode) {
            fetchData(equipmentcode, equipmenttype);
        } else {
            setWorkorders([]);
            setEvents([]);
        }
    }, [equipmentcode, equipmenttype])

    // 定义获取数据的函数
    const fetchData = (equipmentCode, equipmentType) => {
        Promise.all([WSEquipment.getEquipmentWorkOrders(equipmentCode), WSEquipment.getEquipmentEvents(equipmentCode, equipmentType)])
            .then(responses => {
                const formatResponse = response => response.body.data.map(element => ({
                    ...element,
                    createdDate: element.createdDate && format(new Date(element.createdDate),'dd-MMM-yyyy'),
                    objectUrl: `equipment/${encodeURIComponent(element?.object || '')}`
                }));

                const [workorders, events] = responses.map(formatResponse);
                setWorkorders(workorders);
                setEvents(events);
            })
            .catch(console.error)
            .finally(() => setLoadingData(false));
    }

    // 组件渲染逻辑
    return (
        <div style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
            <EISTableFilter
                filters={WO_FILTERS}
                handleFilterChange={(newFilter) =>
                    setWorkOrderFilter(newFilter)
                }
                activeFilter={workOrderFilter}
                />
                
            {workOrderFilter === WO_FILTER_TYPES.MTF ?
                <EquipmentMTFWorkOrders equipmentcode={equipmentcode} />
                :
                <BlockUi blocking={loadingData} style={{overflowX: 'auto'}}>
                    <EISTable
                    data={getFilteredWorkOrderList(workOrderFilter === WO_FILTER_TYPES.THIS ? workorders : events)}
                    headers={headers}
                    propCodes={propCodes}
                    linksMap={linksMap}
                    stylesMap={stylesMap}
                    keyMap={keyMap}
                    defaultOrderBy='createdDate'
                    defaultOrder={Constants.SORT_DESC}
                    />
                </BlockUi>
            }
        </div>
    )

}
// 使用React.memo优化组件性能
export default React.memo(EquipmentWorkOrders)
