import React from 'react';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import EAMGrid from 'eam-components/dist/ui/components/grids/eam/EAMGrid';
import { EAMCellField } from 'eam-components/dist/ui/components/grids/eam/utils';
import SyncedQueryParamsEAMGridContext from "../../../../../tools/SyncedQueryParamsEAMGridContext";

// 自定义单元格渲染器，用于处理特定列的显示方式
const cellRenderer = ({ column, value, row }) => {
    // 当列ID为'equipmentno'时，渲染为链接
    if (column.id === 'equipmentno') {
        return (
            <Typography>
                <Link to={"/position/" + value + (row.values.organization ? '%23' + row.values.organization : '')}>
                    {value}
                </Link>
            </Typography>
        )   
    }
    // 默认情况下使用EAMCellField进行渲染
    return EAMCellField({ column, value });
}

// PositionSearch组件，用于展示位置搜索页面
const PositionSearch = (props) => {
    const { positionScreen, handleError } = props;
    return (
        // 使用SyncedQueryParamsEAMGridContext来同步查询参数和处理错误
        <SyncedQueryParamsEAMGridContext
            gridName={positionScreen.screenCode} // 使用屏幕代码作为网格名称
            handleError={handleError} // 错误处理函数
            searchOnMount={positionScreen.startupAction !== "N"} // 根据启动动作决定是否加载
            cellRenderer={cellRenderer} // 使用自定义的单元格渲染器
            key={positionScreen.screenCode} // 使用屏幕代码作为key
        >
            <EAMGrid /> // 渲染EAMGrid组件
        </SyncedQueryParamsEAMGridContext>
    );
}

export default PositionSearch;
