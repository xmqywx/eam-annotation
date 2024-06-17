import React from 'react';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { EAMCellField } from 'eam-components/dist/ui/components/grids/eam/utils';
import EAMGrid from 'eam-components/dist/ui/components/grids/eam/EAMGrid';
import SyncedQueryParamsEAMGridContext from "../../../../tools/SyncedQueryParamsEAMGridContext";

// 根据列的ID定制化渲染单元格。特别是对于工单编号（workordernum），它创建一个链接，允许用户点击跳转到相应的工单详情页面
const cellRenderer = ({ column, value }) => {
    // 如果列ID是'workordernum'，则为该值创建一个链接
    if (column.id === 'workordernum') {
        return (
            <Typography>
                <Link to={"/workorder/" + value}>
                    {value}
                </Link>
            </Typography>
        )
    }

    // 对于其他列，使用默认的EAMCellField渲染
    return EAMCellField({ column, value });
}

// 使用 SyncedQueryParamsEAMGridContext 来同步查询参数，并使用 EAMGrid 组件来展示工单数据。它利用 cellRenderer 来自定义单元格的显示。
const WorkorderSearch = (props) => {
    const { 
        // 包含工单屏幕的配置信息，如屏幕代码（用于标识网格的唯一性）和启动动作（决定是否在组件挂载时自动执行搜索）。
        workOrderScreen, 
        handleError 
    } = props;
    return (
        <SyncedQueryParamsEAMGridContext
            gridName={workOrderScreen.screenCode} // 网格名称，使用屏幕代码，用于标识这个网格的唯一性
            handleError={handleError} // 错误处理函数，用于处理网格操作中发生的错误
            searchOnMount={workOrderScreen.startupAction !== "N"} // 如果启动动作不是"N"，则加载时执行搜索
            cellRenderer={cellRenderer} // 使用自定义的单元格渲染器
            key={workOrderScreen.screenCode}
        >
            <EAMGrid />
        </SyncedQueryParamsEAMGridContext>
    );
}

export default WorkorderSearch;
