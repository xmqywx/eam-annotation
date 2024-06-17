import React from "react";
import { DATA_GRID_SORT_TYPES, DATA_GRID_SORT_DIRECTIONS } from "eam-components/dist/ui/components/datagrid/Constants";
import EAMTable from "eam-components/dist/ui/components/eamtable/EAMTable";
import { Link } from 'react-router-dom';
import EAMTableGridRequestAdapter from "eam-components/dist/ui/components/eamtable/EAMTableGridRequestAdapter";
import compareAsc from 'date-fns/compareAsc'
import parse from 'date-fns/parse'
import { withCernMode } from '../../../components/CERNMode';

const DATE_FORMAT = "dd-LLL-yyyy"; // 定义日期格式

const customCellStyle = {
    whiteSpace: "nowrap" // 自定义单元格样式，防止内容换行
}

/**
 * 自定义单元格渲染器，根据列的元数据来渲染不同的单元格内容。
 * 
 * @param {Object} params 包含行数据、列元数据、获取显示值的函数和单元格组件的对象
 * @returns {JSX.Element} 返回渲染的单元格组件
 */
const customCellRenderer = ({ row, columnMetadata, getDisplayValue, CellComponent }) => {
    const customRenders = {
        "last_repeated_status_color": (
            <CellComponent
                style={{ backgroundColor: getDisplayValue() }} // 根据状态颜色改变背景色
            />
        ),
        "mtf_step": (
            <CellComponent>
                <Link
                    to={{ pathname: `/workorder/${row["evt_code"]}` }} // 创建链接到工作订单的路由
                >
                    {getDisplayValue()}
                </Link>
            </CellComponent>
        ),
        "evt_desc": (
            <CellComponent>{getDisplayValue()}</CellComponent> // 默认渲染
        )
    }
    return customRenders[columnMetadata.id] || <CellComponent style={customCellStyle}>{getDisplayValue()}</CellComponent>;
}

const headers = {
    mtf_step: "Step",
    evt_status_desc: "Status",
    mtf_step_result: "Result",
    last_repeated_status_color: "NC",
    evt_desc: "Description",
    evt_completed: "Completed On",
    evt_updatedby: "Updated By"
};

const sortTypesMap = {
    "mtf_step": DATA_GRID_SORT_TYPES.NUMERIC // 定义排序类型为数字
}

const comparatorsMap = {
    "evt_completed": ({ direction, property }) => {
        return (a, b) => (direction === DATA_GRID_SORT_DIRECTIONS.DESC ? 1 : -1) * compareAsc(parse(a[property], DATE_FORMAT, new Date()), parse(b[property], DATE_FORMAT, new Date()))   
    }
}

/**
 * 计算列元数据，添加排序类型和比较器。
 * 
 * @param {Object} params 包含列元数据的对象
 * @returns {Array} 返回更新后的列元数据数组
 */
const getComputedColumnsMetadata = ({ columnsMetadata }) => {
    const availableHeaders = Object.keys(headers);
    return columnsMetadata.filter(e => availableHeaders.includes(e.id))
        .map(c => ({
            ...c,
            sortType: sortTypesMap[c.id],
            comparator: comparatorsMap[c.id]
        }));
}

/**
 * 设备MTF工作订单组件，用于展示设备的维护和修理工作订单。
 * 
 * @param {Object} props 组件属性
 * @returns {JSX.Element} 返回渲染的组件
 */
const EquipmentMTFWorkOrders = props => {
    const { equipmentcode } = props;

    const gridRequest = {
        rowCount: 1000, // 请求的行数
        cursorPosition: 1, // 游标位置
        params: {
            obj_code: equipmentcode // 设备代码
        },
        gridName: "OSOBJA_XTF", // 网格名称
        useNative: true, // 使用原生功能
        includeMetadata: true // 包含元数据
    };

    return (
        <EAMTableGridRequestAdapter gridRequest={gridRequest} headers={headers}>
            {({ loading, requestError, rows, columnsMetadata }) =>
                <EAMTable
                    loading={loading} // 加载状态
                    rows={rows} // 行数据
                    columnsMetadata={getComputedColumnsMetadata({ columnsMetadata })} // 列元数据
                    isSortEnabled={columnMetadata => !["last_repeated_status_color", "checkbox"].includes(columnMetadata.id)} // 启用排序
                    sortBy={{ columnID: "mtf_step" }} // 默认排序列
                    cellRenderer={customCellRenderer} // 单元格渲染器
                    extraBodyRender={() =>
                        <>
                            {!loading && !requestError && !rows.length && <caption>No MTF Work Orders to show.</caption>}
                            {!loading && requestError && <caption>Failed to load MTF Work Orders</caption>}
                        </>
                    } />
            }
        </EAMTableGridRequestAdapter>
    )
};

export default withCernMode(EquipmentMTFWorkOrders); // 使用CERN模式增强组件
