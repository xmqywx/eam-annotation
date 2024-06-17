import React from 'react';
import queryString from "query-string";
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import SyncedQueryParamsEAMGridContext from "../../../tools/SyncedQueryParamsEAMGridContext";
import EAMGrid from 'eam-components/dist/ui/components/grids/eam/EAMGrid';
import { EAMCellField } from 'eam-components/dist/ui/components/grids/eam/utils';


const treatParamAsList = (param) => (param === undefined || param === null) ? []
    : Array.isArray(param) ? param
    : param.includes(",") ? param.split(",")
    : [param]  // 将参数处理为列表，如果参数是逗号分隔的字符串，则拆分为数组

const cellRenderer = userColumns => ({ column, value }) => {
    const userColumnToType = {
        equipmentColumns: 'equipment',
        locationColumns: 'location',
        workorderColumns: 'workorder',
        partColumns: 'part',
    };  // 定义列到类型的映射

    const typeToDefaultColumns = {
        equipment: ['equipmentno', 'obj_code', 'evt_object', 'equipment'],
        location: ['location'],
        workorder: ['workordernum', 'evt_code', 'parentwo'],
        part: ['part'],
    }  // 定义类型到默认列的映射

    const link = userColumnToType[Object.keys(userColumnToType)
                .find(userColumn => treatParamAsList(userColumns[userColumn]).includes(column.id))]
            || Object.keys(typeToDefaultColumns)
                .find(type => typeToDefaultColumns[type].includes(column.id));  // 根据列ID找到对应的链接类型

    return link === undefined ? EAMCellField({ column, value }) : getLink(`/${link}/`, value);  // 如果找不到链接类型，则返回普通单元格，否则返回链接
}

const getLink = (path, val) => <Typography>
        <Link to={path + encodeURIComponent(val)}>
            {val}
        </Link>
    </Typography>  // 定义一个函数，用于生成链接，将值作为URL的一部分，并进行编码

const Grid = () => {
    const values = queryString.parse(window.location.search);  // 解析当前URL的查询字符串
    return (
        <SyncedQueryParamsEAMGridContext
            gridName={values.gridName}
            cellRenderer={cellRenderer(values)}
            searchOnMount
            key={values.gridName}
        >
            <EAMGrid />
        </SyncedQueryParamsEAMGridContext>  // 使用SyncedQueryParamsEAMGridContext组件包裹EAMGrid，传递网格名称和单元格渲染器
    )

}

export default Grid;
