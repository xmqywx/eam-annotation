import React, { useState, useEffect } from 'react';
import WSWorkorders from "../../../../tools/WSWorkorders";
import EISTable from 'eam-components/dist/ui/components/table';
import Button from '@mui/material/Button';
import PartUsageDialog from "./PartUsageDialog";
import BlockUi from 'react-block-ui';

function PartUsage(props) {

    let headers = ['Transaction', 'Part', 'Activity', 'Store', 'Quantity']; // 表头数据，定义表格中显示的列名
    let propCodes = ['transType', 'partCode', 'activityDesc', 'storeCode', 'quantity']; // 属性代码，与headers对应，指定从数据对象中读取哪些属性来显示
    let linksMap = new Map([['partCode', {linkType: 'fixed', linkValue: 'part/', linkPrefix: '/'}]]); // 链接映射，用于定义表格中的链接行为

    let [data, setData] = useState([]); // 使用useState管理表格数据
    let [isDialogOpen, setIsDialogOpen] = useState(false); // 使用useState管理对话框的开关状态
    let [isLoading, setIsLoading] = useState(false); // 使用useState管理页面的加载状态

    useEffect(() => {
        fetchData(props.workorder.number) // 使用useEffect进行副作用操作，依赖于工单号的变化
    }, [props.workorder.number])

    let formatQuantity = (data) => { // 格式化数量，为每个部件的数量添加单位
        data.forEach(part =>
            part.quantity = part.quantity ? part.quantity + (part.partUoM ? " " + part.partUoM : "") : ""
        )
    }

    let fetchData = (workorder) => { // 定义fetchData函数，用于获取部件使用数据
        setIsLoading(true)
        if (workorder) {
            WSWorkorders.getPartUsageList(workorder).then(response => {
                formatQuantity(response.body.data);
                setData(response.body.data);
                setIsLoading(false);
            }).catch(error => {
                props.handleError(error);
                setIsLoading(false);
            });
        }
    };

    let successHandler = () => { // 定义successHandler函数，处理添加或编辑成功后的操作
        props.showNotification('Part usage created successfully'); // 显示成功通知
        setIsDialogOpen(false); // 关闭对话框
        fetchData(props.workorder.number); // 重新获取数据
    }

    return (
        isLoading
        ?
            <BlockUi tag="div" blocking={isLoading} style={{ width: '100%' }} /> // 如果正在加载，则显示加载状态
        :
        <>
            <div style={{ width: '100%', height: '100%' }}>
                {data?.length > 0 &&
                    <EISTable
                        data={data}
                        headers={headers}
                        propCodes={propCodes}
                        linksMap={linksMap} />
                }
                <div style={{height: 15}} />
                <Button onClick={() => setIsDialogOpen(true)} color="primary" 
                        disabled={props.disabled} variant="outlined">
                    Add Part Usage
                </Button>
            </div>
            <PartUsageDialog
                showNotification={props.showNotification}
                showError={props.showError}
                showWarning={props.showWarning}
                handleError={props.handleError}
                handleCancel={() => setIsDialogOpen(false)}
                tabLayout={props.tabLayout.fields}
                isDialogOpen={isDialogOpen}
                workorder={props.workorder}
                isLoading={isLoading}
                successHandler={successHandler}
                equipmentMEC={props.equipmentMEC}/>
        </>
    )
}

export default PartUsage;