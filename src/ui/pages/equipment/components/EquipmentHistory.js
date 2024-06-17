import React, {useState, useEffect} from 'react';
import WSEquipment from '../../../../tools/WSEquipment';
import EISTable, {TRANSFORM_KEYS} from 'eam-components/dist/ui/components/table';
import SimpleEmptyState from 'eam-components/dist/ui/components/emptystates/SimpleEmptyState'
import BlockUi from 'react-block-ui';
import { withCernMode } from '../../../components/CERNMode';
import Constants from 'eam-components/dist/enums/Constants';
import { formatDateTime } from 'ui/pages/EntityTools';

/**
 * 组件用于展示设备的历史记录。
 * 
 * @param {Object} props 组件属性
 * @param {string} props.equipmentcode 设备的唯一代码，用于查询设备历史。
 */
function EquipmentHistory(props)  {
    const headers = ['Date', 'Type', 'Related Value', 'Done By']; // 表格头部信息
    const propCodes = ['completedDate', 'desc', 'relatedObject', 'enteredBy']; // 对应于数据模型的属性键
    const [historyData, setHistoryData] = useState([]); // 存储设备历史数据的状态
    const [blocking, setBlocking] = useState(true); // 控制加载状态的显示

    // 用于在设备代码变更时重新获取数据
    useEffect(() => {
        if (props.equipmentcode) {
            fetchData(props.equipmentcode);
        } else {
            setHistoryData([])
        }
    },[props.equipmentcode])

    /**
     * 根据设备代码获取设备的历史记录。
     * 
     * @param {string} equipmentcode 设备的代码
     */
    const fetchData = (equipmentcode) => {
            WSEquipment.getEquipmentHistory(equipmentcode)
                .then(response => {
                    setHistoryData(response.body.data.map(line => ({
                        ...line,
                        completedDate: formatDateTime(line.completedDate), // 格式化日期时间
                        relatedObject: (line.jobType === 'EDH') // 根据工作类型处理相关对象的显示
                        ? (
                            <a
                                target="_blank"
                                href={"https://edh.cern.ch/Document/" + line.relatedObject}
                                rel="noopener noreferrer">
                                {line.relatedObject}
                            </a>
                        )
                        : line.relatedObject
                    })))
                })
                .catch(error => console.error("Couldn't fetch the history for this equipment", error))
                .finally(() => setBlocking(false)); // 完成请求后取消加载状态
    }

    const isEmptyState = !blocking && historyData.length === 0; // 判断是否显示空状态

    const keyMap = {
        completedDate: TRANSFORM_KEYS.DATE_DD_MMM_YYYY_HH_MM // 日期格式化键
    }

    return (
        isEmptyState
        ? (
            <SimpleEmptyState message="No History to show." />
        )
        : (
            // 显示加载状态和数据表格
            <BlockUi blocking={blocking} style={{ width: "100%" }}>
                <EISTable data={historyData}
                    headers={headers}
                    propCodes={propCodes}
                    keyMap={keyMap}
                />
            </BlockUi>
        )
    );
}

// 使用CERN模式增强组件并进行性能优化
export default withCernMode(React.memo(EquipmentHistory));
