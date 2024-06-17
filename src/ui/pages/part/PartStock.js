import React, {useEffect, useState} from 'react';
import WSParts from '../../../tools/WSParts'
import EISTable from 'eam-components/dist/ui/components/table';
import {Link} from 'react-router-dom';
import { isCernMode } from '../../components/CERNMode';
import queryString from 'query-string';

function PartStock(props) {

    let headers = ['Store', 'Description', 'Bin', 'Lot', 'Qty on Hand', 'Qty for Repair', 'Asset ID']; // 表头数据
    let propCodes = ['storeCode', 'storeDesc', 'bin', 'lot', 'qtyOnHand', 'repairQuantity', 'assetCode']; // 对应数据字段
    let [data, setData] = useState([]) // 使用useState Hook来管理表格数据状态

    let fetchData = (partCode) => { // 定义fetchData函数，用于加载特定零件的库存数据
        const userID = props.userData.eamAccount.employeeCode; // 获取用户ID
        if (partCode) {
            WSParts.getPartStock(partCode).then(response => { // 调用WSParts.getPartStock获取库存数据
                let stockData = response.body.data.map(line => { // 处理返回的库存数据
                    let linkValueAsset = '/asset/';
                    const linkValueStore = `${props.applicationData.EL_TEKLI}/${line.storeCode}/issue/employee?${queryString.stringify({employee: userID, partCode: partCode,})}`; // 构建商店链接

                    const storeCodeCell = line.storeCode ? // 根据是否为CERN模式，决定商店代码单元格的显示方式
                        isCernMode ? <a href={linkValueStore} rel="noopener noreferrer" target="_blank">{line.storeCode}</a> : line.storeCode
                        : ''
                    return {
                        ...line,
                        assetCode: line.assetCode ? <Link to={{pathname: linkValueAsset + line.assetCode}}>{line.assetCode}</Link> : '', // 构建资产链接
                        storeCode: storeCodeCell
                    }}
                );
                setData(stockData) // 更新表格数据状态
            }).catch(error => {
                console.log('Error loading data', error); // 打印错误信息
            });
        }
    };

    useEffect(() => { // 使用useEffect Hook来在组件加载后自动加载数据
       fetchData(props.part.code);
    },[props.part.code]) // 依赖项数组，当props.part.code变化时重新加载数据

    // 如果没有数据，则不渲染组件
    if (data.length === 0)
        return null;

    return (
        <EISTable data={data} headers={headers} propCodes={propCodes}/> // 渲染EISTable组件显示表格
    );

}

export default PartStock;
