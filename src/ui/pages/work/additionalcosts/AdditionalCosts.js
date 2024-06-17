import React, { useState, useEffect } from 'react';
import WSWorkorders from "../../../../tools/WSWorkorders";
import EISTable from 'eam-components/dist/ui/components/table';
import Button from '@mui/material/Button';
import AdditionalCostDialog from "./AdditionalCostDialog";
import BlockUi from 'react-block-ui';

// 定义按钮的样式
const buttonStyle = {
    //position: 'relative',
    //float: 'left',
    //bottom: '-13px',
   // left: '5px',
   padding: 10
};

// 定义AdditionalCosts组件，接收props作为参数
const AdditionalCosts = (props) => {
    // 定义表头数据
    const headers = ['Activity', 'Cost Description', 'Cost Type', 'Quantity', 'Cost', 'Date'];
    // 定义对应数据的属性名
    const propCodes = ['activitytrade_display', 'costdescription', 'costtype_display', 'quantity', 'cost', 'additionalcostsdate'];

    // 使用useState管理数据数组
    const [data, setData] = useState([]);
    // 使用useState管理对话框的开关状态
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    // 使用useState管理加载状态
    const [isLoading, setIsLoading] = useState([]);

    // 使用useEffect钩子处理组件挂载和更新
    useEffect(() => {
        fetchData(props.workorder.number); // 根据工作订单号获取数据
    }, [props.workorder.number]); // 依赖项为工作订单号

    // 定义调整数据的方法
    const adjustData = (data) => {
        return data.map((additionalCost) => ({
            ...additionalCost,
            activitytrade_display: additionalCost.activitytrade_display.split(' ')[0], // 取第一个单词
            additionalcostsdate: additionalCost.additionalcostsdate.split(' ')[0], // 取日期部分
        }));
    };

    // 定义获取数据的方法
    const fetchData = (workorder) => {
        setIsLoading(true) // 开始加载
        if (workorder) {
            WSWorkorders.getAdditionalCostsList(workorder).then((response) => {
                const data = adjustData(response.body.data); // 调整数据
                setData(data); // 设置数据
                setIsLoading(false); // 结束加载
            }).catch((error) => {
                console.log(error); // 打印错误
                setIsLoading(false); // 结束加载
            });
        }
    };

    // 定义创建成功后的处理方法
    const successHandler = () => {
        props.showNotification('Additional cost created successfully'); // 显示成功通知
        setIsDialogOpen(false); // 关闭对话框
        fetchData(props.workorder.number); // 重新获取数据
    }

    // 渲染组件
    return (
        isLoading
        ?
            <BlockUi tag="div" blocking={isLoading} style={{ width: '100%' }} /> // 显示加载状态
        :
        <>
            <div style={{ width: '100%', height: '100%' }}>
                {data?.length > 0 &&
                    <EISTable
                        data={data}
                        headers={headers}
                        propCodes={propCodes} />
                }
                <div style={{height: 15}} />
                <Button onClick={() => setIsDialogOpen(true)} color="primary" 
                        disabled={props.disabled} variant="outlined">
                    Add Additional Cost
                </Button>
            </div>
            <AdditionalCostDialog
                handleError={props.handleError}
                handleCancel={() => setIsDialogOpen(false)}
                tabLayout={props.tabLayout.fields}
                isDialogOpen={isDialogOpen}
                workorder={props.workorder}
                isLoading={isLoading}
                successHandler={successHandler}/>
        </>
    )
}

export default AdditionalCosts;