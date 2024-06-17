import React from 'react';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import EAMGrid from 'eam-components/dist/ui/components/grids/eam/EAMGrid';
import { EAMCellField } from 'eam-components/dist/ui/components/grids/eam/utils';
import SyncedQueryParamsEAMGridContext from "../../../../../tools/SyncedQueryParamsEAMGridContext";

const cellRenderer = ({ column, value, row }) => {  // 定义cellRenderer函数，用于自定义网格单元格的渲染逻辑
    if (column.id === 'equipmentno') {
        return (
            // 使用Typography组件显示文本
            <Typography>
                {/*使用Link组件创建链接，链接到具体的资产页面 */}
                <Link to={"/asset/" + value + (row.values.organization ? '%23' + row.values.organization : '')}>
                    {/* 显示资产编号 */}
                    {value}
                </Link>
            </Typography>
        )   
    }
    return EAMCellField({ column, value });  // 对于其他列，使用EAMCellField进行渲染
}

const AssetSearch = (props) => {  // 定义AssetSearch组件
    const { assetScreen, handleError } = props;  // 从props中解构出assetScreen和handleError
    return (
        <SyncedQueryParamsEAMGridContext  // 使用SyncedQueryParamsEAMGridContext组件包裹EAMGrid，用于处理网格的查询参数同步
            gridName={assetScreen.screenCode}  // 设置网格名称为资产屏幕的代码
            handleError={handleError}  // 传递错误处理函数
            searchOnMount={assetScreen.startupAction !== "N"}  // 设置是否在组件挂载时执行搜索
            cellRenderer={cellRenderer}  // 设置自定义的单元格渲染函数
            key={assetScreen.screenCode}  // 设置组件的key为资产屏幕的代码
        >
            {/* 渲染EAMGrid组件 */}
            <EAMGrid />
        </SyncedQueryParamsEAMGridContext>
    );
}

export default AssetSearch;
