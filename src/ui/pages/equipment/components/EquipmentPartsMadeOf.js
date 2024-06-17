import React from "react";
import EAMTable from "eam-components/dist/ui/components/eamtable/EAMTable";
import { Link } from 'react-router-dom';
import EAMTableGridRequestAdapter from "eam-components/dist/ui/components/eamtable/EAMTableGridRequestAdapter";

const customCellStyle = {
    whiteSpace: "nowrap",
    padding: 4
}

const customCellRenderer = ({ row, columnMetadata, getDisplayValue, CellComponent }) => {  // 自定义单元格渲染函数
    const customRenders = {  // 定义不同列的渲染方式
        "part": (  // 针对“part”列的渲染
            <CellComponent style={customCellStyle}>
                <Link
                    to={{ pathname: `/part/${row["part"]}` }}  // 使用Link组件进行路由跳转，路径为/part/加上当前行的part值
                >
                      {/*显示单元格的值 */}
                    {getDisplayValue()}
                </Link>
            </CellComponent>
        ),
        "child_equipment": (  // 针对“child_equipment”列的渲染
            <CellComponent style={customCellStyle}>
                <Link
                    to={{ pathname: `/equipment/${row["child_equipment"]}` }}  // 使用Link组件进行路由跳转，路径为/equipment/加上当前行的child_equipment值
                >
                      {/*显示单元格的值 */}
                    {getDisplayValue()}
                </Link>
            </CellComponent>
        ),
        "description": (  // 针对“description”列的渲染
            <CellComponent style={{ minWidth: 150, padding: 4 }}>{getDisplayValue()}</CellComponent>  // 设置最小宽度和内边距，显示单元格的值
        )
    }
    return customRenders[columnMetadata.id] || <CellComponent style={customCellStyle}>{getDisplayValue()}</CellComponent>;  // 返回对应列的渲染组件，如果没有特定渲染则返回默认样式
}

const headers = {  // 表头定义
    child_equipment: "Equipment",  // 设备列
    part: "Part",  // 部件列
    description: "Description",  // 描述列
    lot: "Lot",  // 批次列
    quantity: "Quantity",  // 数量列
    uom: "UOM"  // 单位列
};


const EquipmentPartsMadeOf = props => {
    const { equipmentcode } = props;

    const gridRequest = {  // 表格请求参数
        rowCount: 10000,  // 请求行数
        cursorPosition: 1,  // 游标位置
        params: {
            obj_code: equipmentcode  // 请求参数，设备代码
        },
        gridName: "OSOBJA_XAP",  // 表格名称
        useNative: true,  // 使用原生处理
        includeMetadata: true  // 包含元数据
    };

    return (
        // 使用EAMTableGridRequestAdapter处理表格请求
        <EAMTableGridRequestAdapter gridRequest={gridRequest} headers={headers}>
            {({ loading, requestError, rows, columnsMetadata }) =>
                <EAMTable
                    loading={loading}  // 加载状态
                    rows={rows}  // 行数据
                    columnsMetadata={columnsMetadata}  // 列元数据
                    isSortEnabled={() => true}  // 启用排序
                    cellRenderer={customCellRenderer}  // 使用自定义单元格渲染器
                    extraBodyRender={() =>
                        <>
                            {!loading && !requestError && !rows.length && <caption>No data to show.</caption>}
                            {!loading && requestError && <caption>Failed to load data</caption>}
                        </>
                    } />
            }
        </EAMTableGridRequestAdapter>
    )
};

export default EquipmentPartsMadeOf;
