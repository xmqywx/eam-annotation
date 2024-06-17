import React, {useEffect, useState} from 'react';
import WSParts from "../../../tools/WSParts";
import EISTable from 'eam-components/dist/ui/components/table';

function PartWhereUsed(props) {

    let headers = ['Entity', 'Code', 'Description', 'Quantity']; // 表头数组，定义表格中显示的列名
    let propCodes = ['entity', 'code', 'description', 'quantity']; // 属性代码数组，与headers对应，指定每列数据的字段名
    let linksMap = new Map([['code', {linkType: 'prop', linkValue: 'link', linkPrefix: '/'}]]); // 链接映射，用于定义表格中的链接行为
    let [data, setData] = useState([]); // 使用useState Hook来创建data状态和其更新函数setData

    useEffect(() => {
        fetchData(props.part.code); // 使用useEffect Hook来处理副作用，这里是根据部件代码获取数据
    }, [props.part.code]) // 依赖数组，仅当props.part.code变化时，重新执行useEffect中的函数

    let fetchData = (partCode) => { // fetchData函数，用于根据部件代码获取数据
        if (partCode) {
            WSParts.getPartWhereUsed(partCode).then(response => {
                setData(response.body.data);
            }).catch(error => {
                console.log('Error loading data', error);
            });
        }
    };

    // 如果没有数据，则不渲染任何内容
    if (data.length === 0)
        return null;

    return (
        <EISTable
            data={data} // 表格数据
            headers={headers} // 表头
            propCodes={propCodes} // 数据字段名
            linksMap={linksMap} // 链接映射
        />
    );
}

export default PartWhereUsed;
