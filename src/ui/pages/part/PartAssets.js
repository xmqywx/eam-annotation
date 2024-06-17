import React from 'react'
import EAMTable from "eam-components/dist/ui/components/eamtable/EAMTable";
import EAMTableDataAdapter from "eam-components/dist/ui/components/eamtable/EAMTableDataAdapter";
import { Link } from 'react-router-dom';
import WSParts from "../../../tools/WSParts";


const customCellRenderer = ({ row, columnMetadata, getDisplayValue, CellComponent }) => {
    // 定义一个对象，包含不同列的自定义渲染逻辑
    const customRenders = {
        // 对于"last_repeated_status_color"列，设置单元格背景颜色
        "last_repeated_status_color": (
            <CellComponent
                style={{ backgroundColor: getDisplayValue() }}
            />
        ),
        // 对于"equipmentno"列，渲染一个链接，指向对应的资产页面
        "equipmentno": (
            <CellComponent >
                <Link
                    to={{ pathname: `/asset/${row[columnMetadata.id]}` }}
                >
                    {getDisplayValue()}
                </Link>
            </CellComponent>
        ),
        // 对于"location"列，渲染一个链接，指向对应的位置页面
        "location": (
            <CellComponent >
                <Link
                    to={{ pathname: `/location/${row[columnMetadata.id]}` }}
                >
                    {getDisplayValue()}
                </Link>
            </CellComponent>
        )
    }
    // 返回对应列的自定义渲染内容
    return customRenders[columnMetadata.id];
}

// 定义表格列的元数据
const columnsMetadata = [
    {
        id: "equipmentno", // 列ID
        header: "Asset" // 列头显示文本
    },
    {
        id: "equipmentdesc",
        header: "Description"
    },
    {
        id: "assetstatus_display",
        header: "Status"
    },
    {
        id: "department",
        header: "Department"
    },
    {
        id: "location",
        header: "Location"
    }
]

// 将响应体中的数据转换为行数据
const convertRowData = (responseBody) => responseBody.data || [];

// 返回列的元数据
const convertColumnMetadata = () => columnsMetadata;

const PartAssets = (props) => {
    const { partCode } = props

    return (
        // 使用EAMTableDataAdapter组件来适配数据
        <EAMTableDataAdapter
            fetchData={async () => WSParts.getAssetsList(partCode)} // 定义获取数据的方法
            convertRowData={convertRowData} // 定义行数据转换方法
            convertColumnMetadata={convertColumnMetadata}> // 定义列元数据转换方法
            {({ loading, requestError, rows, columnsMetadata }) =>
                // 使用EAMTable组件来显示表格
                <EAMTable
                    loading={loading} // 传递加载状态
                    rows={rows} // 传递行数据
                    columnsMetadata={columnsMetadata} // 传递列元数据
                    isSortEnabled={() => true} // 启用排序功能
                    cellRenderer={customCellRenderer} // 传递自定义单元格渲染器
                    extraBodyRender={() =>
                        <>
                            {/* 如果没有加载且没有请求错误且没有行数据，显示“无资产可显示” */}
                            {!loading && !requestError && !rows.length && <caption>No Assets to show.</caption>}
                            {/* 如果没有加载且有请求错误，显示“加载资产失败” */}
                            {!loading && requestError && <caption>Failed to load Assets</caption>}
                        </>
                    } />
                }
        </EAMTableDataAdapter>
    )
}

export default PartAssets
