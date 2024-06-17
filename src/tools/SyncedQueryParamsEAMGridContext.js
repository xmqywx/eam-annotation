import React from 'react'
import { useHistory } from "react-router";
import GridTools from "./GridTools";
import StatusIcon from '../ui/layout/StatusIcon';
import { EAMGridContextProvider } from "eam-components/dist/ui/components/grids/eam/EAMGridContext";

const SyncedQueryParamsEAMGridContext = (props) => {
    const { children, ...otherProps } = props; // 从props中解构出children和其他属性
    console.log(props);
    const history = useHistory(); // 使用useHistory钩子获取history对象，用于导航
    const filters = GridTools.parseGridFilters(GridTools.getURLParameterByName('gridFilters')); // 解析URL中的gridFilters参数，用于初始化过滤器
    const initialDataspyID = GridTools.getURLParameterByName('gridDataspyID'); // 从URL获取gridDataspyID参数，用于初始化数据间谍ID

    const cellRenderer = (cellRendererProps) => { // 定义cellRenderer函数，用于自定义单元格渲染
        const { column, value } = cellRendererProps; // 从cellRendererProps中解构出column和value
        if (column.id === 'statusicon' || column.id === 'priorityicon') { // 判断列ID是否为statusicon或priorityicon
            return <StatusIcon column={column} value={value} /> // 如果是，使用StatusIcon组件渲染
        }
    
        return props.cellRenderer(cellRendererProps); // 否则，调用传入的cellRenderer函数
    }

    return (
        <EAMGridContextProvider
            initialFilters={filters} // 设置初始过滤器
            onChangeFilters={(newFilters) => { // 定义过滤器变更时的回调函数
                const params = GridTools.replaceUrlParam('gridFilters', GridTools.stringifyGridFilters(newFilters)); // 将新的过滤器转换为字符串并更新URL参数
                history.push(params); // 使用history.push导航到新的URL
            }}
            initialDataspyID={initialDataspyID} // 设置初始数据间谍ID
            onChangeDataspy={(newDataspy) => { // 定义数据间谍变更时的回调函数
                const params = GridTools.replaceUrlParam('gridDataspyID', newDataspy.code); // 更新gridDataspyID URL参数
                history.push(params); // 使用history.push导航到新的URL
            }}
            {...otherProps} // 传递其他props到EAMGridContextProvider
            cellRenderer={cellRenderer} // 传递cellRenderer函数
        >
            {children  // 渲染子组件
            }
        </EAMGridContextProvider>
    );
}

export default SyncedQueryParamsEAMGridContext
