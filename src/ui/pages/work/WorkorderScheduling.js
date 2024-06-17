import React from 'react';
import EAMDateTimePicker from 'eam-components/dist/ui/components/inputs-ng/EAMDateTimePicker';
import EAMDatePicker from 'eam-components/dist/ui/components/inputs-ng/EAMDatePicker';
import EAMAutocomplete from 'eam-components/dist/ui/components/inputs-ng/EAMAutocomplete';
import WS from '../../../tools/WS';
import EAMUDF from 'ui/components/userdefinedfields/EAMUDF';

// 定义WorkorderScheduling组件，用于管理工单的调度信息
const WorkorderScheduling = (props) => {
    
    const { 
        // 这个对象包含了工单的布局信息，通常这些信息用于定义工单的各个字段是否显示、如何显示等。这是一个配置对象，用于控制工单表单的布局和行为。
        workOrderLayout, 
        // 这是一个函数，通常与表单库（如react-hook-form）一起使用，用于注册输入组件，以便表单库可以跟踪这些输入组件的值的变化、处理表单提交等。
        register 
    } = props;

    // 检查工单布局中的各个字段是否被设置为隐藏，如果全部隐藏则不渲染组件
    if (
        'H' === workOrderLayout.fields.reqstartdate.attribute &&
        'H' === workOrderLayout.fields.reqenddate.attribute &&
        'H' === workOrderLayout.fields.schedstartdate.attribute &&
        'H' === workOrderLayout.fields.schedenddate.attribute &&
        'H' === workOrderLayout.fields.datecompleted.attribute &&
        'H' === workOrderLayout.fields.startdate.attribute &&
        'H' === workOrderLayout.fields.reportedby.attribute &&
        'H' === workOrderLayout.fields.assignedto.attribute &&
        'H' === workOrderLayout.fields.udfchar17.attribute
    ) {
        return null;
    }

    return (
        <React.Fragment>
            
            <div style={{display: "flex", flex: "1 1 auto"}}>
                <EAMAutocomplete {...register('createdby','createdBy','createdByDesc')}/>
                <EAMDatePicker {...register('datecreated','createdDate')}/>
            </div>

            <EAMAutocomplete
                {...register('reportedby','reportedBy','reportedByDesc')}
                autocompleteHandler={WS.autocompleteEmployee}
            />

            <EAMAutocomplete
                {...register('assignedto','assignedTo','assignedToDesc')}
                barcodeScanner
                autocompleteHandler={WS.autocompleteEmployee}
            />

            <EAMAutocomplete
                {...register('schedgroup','assignedBy')}
                barcodeScanner
                autocompleteHandler={WS.autocompleteSupervisor}
            />

            <EAMDatePicker
                {...register('reqstartdate','requestedStartDate')}/>

            <EAMDatePicker
                {...register('reqenddate','requestedEndDate')}/>

            <EAMDatePicker
                {...register('schedstartdate','scheduledStartDate')}/>

            <EAMDatePicker
                {...register('schedenddate','scheduledEndDate')}/>

            <EAMDateTimePicker
                {...register('startdate','startDate')}/>

            <EAMDateTimePicker
                {...register('datecompleted','completedDate')}/>

            <EAMDateTimePicker
                {...register('datereported','reportedDate')}/>

            <EAMUDF
                {...register('udfchar17', `userDefinedFields.udfchar17`, `userDefinedFields.udfchar17Desc`)}/>

            <EAMUDF
                {...register('udfchar19', `userDefinedFields.udfchar19`, `userDefinedFields.udfchar19Desc`)}/>
        </React.Fragment>
    );
};

export default WorkorderScheduling;
