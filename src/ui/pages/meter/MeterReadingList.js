import React from 'react';
import EISPanel from 'eam-components/dist/ui/components/panel';
import MeterReadingContent from "./MeterReadingContent";
import './MeterReading.css';

class MeterReadingList extends React.Component {
    // 定义一个方法用于渲染表计读数列表
    renderMetersList = () => {
        // 从props中获取meterReadings数组，包含所有表计读数数据
        const meterReadings = this.props.meterReadings;
        // 判断meterReadings是否为空或长度为0，或第一个元素是否存在
        if (!meterReadings || meterReadings.length === 0 || !meterReadings[0]) {
            // 如果条件为真，返回一个段落元素显示没有找到表计读数
            return (<p style={{marginLeft: '23px'}}>
                No meter readings were found for the current search criteria.
            </p>);
        }
        // 如果有表计读数，返回一个div元素列表
        return (
            // 使用map方法遍历meterReadings数组
            meterReadings.map((reading, index) => {
                // 返回一个div元素，包含MeterReadingContent组件
                return (
                    <div key={`meter_${index}`}>
                        <MeterReadingContent key={`meter_${index}`} reading={reading}  // MeterReadingContent组件，传入reading和parentProps
                                             parentProps={this.props.parentProps}/>
                    </div>
                );
            })
        );
    };

    render() {
        // parentProps，用于访问父组件传递的属性
        const {parentProps} = this.props;
        // 包含搜索条件的详细信息
        const {searchCriteria} = parentProps;
        // 判断searchCriteria中的meterCode和equipmentCode是否都不存在
        if (!searchCriteria.meterCode && !searchCriteria.equipmentCode) {
            // 如果都不存在，返回一个空的div元素
            return <div/>;
        }
        // 如果存在搜索条件，返回一个EISPanel组件
        return (
            <EISPanel heading="METER READINGS" alwaysExpanded={true}  // EISPanel组件，标题为"METER READINGS"，始终展开
                      detailsStyle={{padding: '0'}}> 
                <div style={{width: "100%", marginTop: 0}}> 
                    {this.renderMetersList()   // 调用renderMetersList方法渲染表计读数列表
                    }
                </div>
            </EISPanel>
        );
    }
}

export default MeterReadingList;