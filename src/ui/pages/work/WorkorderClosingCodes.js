import React, {Component} from 'react';
import WSWorkorders from "../../../tools/WSWorkorders";
import EAMSelect from 'eam-components/dist/ui/components/inputs-ng/EAMSelect';
import EAMAutocomplete from 'eam-components/dist/ui/components/inputs-ng/EAMAutocomplete';

// 定义WorkorderClosingCodes组件
const WorkorderClosingCodes = props => {
    // 从props中解构所需的属性
    let {workOrderLayout, workorder, equipment, register} = props;
    
    // 如果所有关闭代码字段的属性都是"H"，则不渲染任何内容
    if ("H" === workOrderLayout.fields.problemcode.attribute
        && "H" === workOrderLayout.fields.failurecode.attribute
        && "H" === workOrderLayout.fields.causecode.attribute
        && "H" === workOrderLayout.fields.actioncode.attribute
        && "H" === workOrderLayout.fields.costcode.attribute) {
        return null;
    }

    return (
        <React.Fragment>
            {/* 问题代码选择器 */}
            <EAMSelect 
                {...register('problemcode', 'problemCode')}
                autocompleteHandler={WSWorkorders.getWorkOrderProblemCodeValues}
                autocompleteHandlerParams={[workorder.classCode, equipment?.classCode, workorder.equipmentCode]}/>

            {/* 故障代码选择器 */}
            <EAMSelect 
                {...register('failurecode', 'failureCode')}
                autocompleteHandler={WSWorkorders.getWorkOrderFailureCodeValues}
                autocompleteHandlerParams={[equipment?.classCode, workorder.problemCode, workorder.equipmentCode]}/>

            {/* 原因代码选择器 */}
            <EAMSelect 
                {...register('causecode', 'causeCode')}
                autocompleteHandler={WSWorkorders.getWorkOrderCauseCodeValues}
                autocompleteHandlerParams={[equipment?.classCode, workorder.failureCode, workorder.problemCode, workorder.equipmentCode]}/>

            {/* 行动代码选择器 */}
            <EAMSelect 
                {...register('actioncode', 'actionCode')}
                autocompleteHandler={WSWorkorders.getWorkOrderActionCodeValues}
                autocompleteHandlerParams={[equipment?.classCode,  workorder.failureCode, workorder.problemCode, workorder.causeCode, workorder.equipmentCode]}/>

        </React.Fragment>
    )
    
}

export default WorkorderClosingCodes;