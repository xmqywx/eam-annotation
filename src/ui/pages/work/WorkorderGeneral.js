import React from 'react';
import EAMCheckbox from 'eam-components/dist/ui/components/inputs-ng/EAMCheckbox'
import WS from '../../../tools/WS'
import WSWorkorders from "../../../tools/WSWorkorders"
import EAMAutocomplete from 'eam-components/dist/ui/components/inputs-ng/EAMAutocomplete';
import EAMSelect from 'eam-components/dist/ui/components/inputs-ng/EAMSelect';
import EAMTextField from 'eam-components/dist/ui/components/inputs-ng/EAMTextField';
import { isDepartmentReadOnly, isMultiOrg } from '../EntityTools';
import EAMUDF from 'ui/components/userdefinedfields/EAMUDF';
import { IconButton } from '@mui/material';
import { FileTree } from 'mdi-material-ui';

// WorkorderGeneral组件用于展示和编辑工单的基本信息。它提供了一系列表单元素，允许用户输入和修改工单的各种详细信息。
function WorkorderGeneral(props) {
    // 从props中解构所需的属性，这些属性提供了工单处理所需的各种数据和方法。
    const {
        workorder, // 当前工单的数据对象，包含了工单的所有信息，如设备代码、状态代码等。
        register, // 用于注册表单元素的函数，与表单状态管理库（如react-hook-form）配合使用。
        applicationData, // 应用程序的全局数据，可能包含配置信息、用户权限等。
        statuses, // 工单可能的状态列表，用于填充状态选择器。
        userGroup, // 当前用户所属的用户组信息，可能用于根据用户组定制UI或功能。
        equipment, // 当前工单关联的设备信息，可能用于自动填充或验证表单字段。
        userData, // 当前用户的详细信息，如用户ID、权限等。
        screenPermissions, // 当前屏幕的权限设置，用于控制用户对某些操作的访问权限。
        newEntity, // 布尔值，指示当前工单是否为新创建的工单。
        screenCode, // 当前屏幕的代码标识，可能用于请求特定屏幕的数据或配置。
        setLayoutProperty // 函数，用于设置布局属性，如显示或隐藏某些UI组件。
    } = props;
    console.log(register('equipment', 'equipmentCode', 'equipmentDesc', 'equipmentOrganization'));
    // rpawClassesList: 从applicationData中获取EL_TRPAC属性，该属性包含逗号分隔的字符串。
    // 这个字符串被分割成数组，用于后续的逻辑判断或处理。如果EL_TRPAC不存在，则默认为一个空数组。
    const rpawClassesList = (applicationData && applicationData.EL_TRPAC && applicationData.EL_TRPAC.split(',')) || [];

    // rpawLink: 从applicationData中获取EL_TRPAW属性，该属性通常包含一个URL或某种标识符，用于创建链接或进行导航。
    // 如果EL_TRPAW不存在，则此变量将为undefined。
    const rpawLink = applicationData && applicationData.EL_TRPAW;

    // 定义点击树形图标按钮的处理函数，用于在UI中显示设备树。
    const treeButtonClickHandler = (code) => {
        setLayoutProperty('equipment', {code: workorder.equipmentCode, organization: workorder.equipmentOrganization});
        setLayoutProperty('showEqpTree', true);
    }

    const testDisabled = undefined;
    // 组件返回的JSX，包含了多个表单元素，每个元素都通过register函数注册，以确保它们的值能被正确管理和提交。
    return (
        <React.Fragment>
            {/* 如果是多组织环境且为新工单，显示组织选择器 */}
            {isMultiOrg && newEntity && <EAMSelect {...register('organization', 'organization')}
            autocompleteHandler={WS.getOrganizations}
            autocompleteHandlerParams={[screenCode]}/>}

            {/* 工单描述输入框 */}
            <EAMTextField {...register('description', 'description')} />

            {/* 设备自动完成选择器，包括条形码扫描器和设备树图标按钮 */}
            <EAMAutocomplete {...register('equipment', 'equipmentCode', 'equipmentDesc', 'equipmentOrganization')}
                             barcodeScanner
                             
                             autocompleteHandler={WS.autocompleteEquipment}
                             autocompleteHandlerParams={[false]}
                             link={() => workorder.equipmentCode ? "/equipment/" + workorder.equipmentCode : null}
                             endAdornment={
                                <IconButton size="small" 
                                            onClick={treeButtonClickHandler} 
                                            disabled={!workorder.equipmentCode}>
                                    <FileTree/>
                                </IconButton>
                            }
                            />

            {/* 位置自动完成选择器 */}
            <EAMAutocomplete {...register('location', 'locationCode', 'locationDesc')}
             
                             autocompleteHandler={WS.autocompleteLocation}/>

            {/* 部门自动完成选择器 */}
            <EAMAutocomplete {...register('department', 'departmentCode', 'departmentDesc')}
             
                             autocompleteHandler={WS.autocompleteDepartment} validate/>

            {/* 工单类型选择器 */}
            <EAMSelect {...register('workordertype', 'typeCode', 'typeDesc')}
             
                    renderSuggestion={suggestion => suggestion.desc}
                    renderValue={value => value.desc || value.code}
                    autocompleteHandler={WSWorkorders.getWorkOrderTypeValues}
                    autocompleteHandlerParams = {[userGroup]}/>

            {/* 工单状态选择器，可根据部门和权限设置禁用 */}
            <EAMSelect
                {...register('workorderstatus', 'statusCode', 'statusDesc')}
                // disabled={isDepartmentReadOnly(workorder.departmentCode, userData) || 
                //                                !screenPermissions.updateAllowed || 
                //                                !workorder.jtAuthCanUpdate}
                
                renderSuggestion={suggestion => suggestion.desc}
                renderValue={value => value.desc || value.code}
                options={statuses} 
                />

            {/* 优先级选择器 */}
            <EAMSelect
                {...register('priority', 'priorityCode', 'priorityDesc')}  
                autocompleteHandler={WSWorkorders.getWorkOrderPriorities}/>

            {/* 工单类别自动完成选择器 */}
            <EAMAutocomplete 
                {...register('woclass', 'classCode', 'classDesc')}
                autocompleteHandler={WS.autocompleteClass}
                autocompleteHandlerParams={['EVNT']}
            />

            {/* 标准工单自动完成选择器 */}
            <EAMAutocomplete {...register('standardwo', 'standardWO', 'standardWODesc')}  
                             autocompleteHandler={WSWorkorders.autocompleteStandardWorkOrder}
                             autocompleteHandlerParams = {[userGroup, equipment?.classCode, equipment?.categoryCode]}/>

            {/* 成本代码自动完成选择器 */}
            <EAMAutocomplete  
                {...register('costcode', 'costCode', 'costCodeDesc')}
                autocompleteHandler={WSWorkorders.autocompleteCostCode}
            />

            {/* 目标值输入框 */}
            <EAMTextField {...register('targetvalue', 'targetValue')}  />

            {/* 父工单链接输入框，根据工单类别和配置链接 */}
            <EAMTextField {...register('parentwo', 'parentWO')}  
                          link={() => workorder.parentWO && rpawClassesList.includes(workorder.classCode) ? rpawLink + workorder.parentWO : null}/>

            {/* 用户定义字段输入框，链接到外部系统 */}
            <EAMTextField {...register('udfchar01', 'userDefinedFields.udfchar01','userDefinedFields.udfchar01Desc')}  
                          link={() => workorder.userDefinedFields?.udfchar01 ? "https://cern.service-now.com/task.do?sysparm_query=number=" + workorder.userDefinedFields.udfchar01 : null}/>

            {/* 更多用户定义字段输入框 */}
            <EAMTextField {...register('udfchar20', 'userDefinedFields.udfchar20','userDefinedFields.udfchar20Desc')}  />

            <EAMTextField {...register('udfchar24', 'userDefinedFields.udfchar24','userDefinedFields.udfchar24Desc')}  
                          link={() => workorder.userDefinedFields?.udfchar24 ? "https://its.cern.ch/jira/browse/" + workorder.userDefinedFields.udfchar24 : null}/>

            {/* 用户定义字段复选框 */}
            <EAMUDF {...register('udfchkbox01', `userDefinedFields.udfchkbox01`)}/>

            <EAMUDF {...register('udfchkbox02', `userDefinedFields.udfchkbox02`)}/>

            <EAMUDF {...register('udfchkbox03', `userDefinedFields.udfchkbox03`)}/>

            <EAMUDF {...register('udfchkbox04', `userDefinedFields.udfchkbox04`)}/>

            <EAMUDF {...register('udfchkbox05', `userDefinedFields.udfchkbox05`)}/>

            {/* 保修状态复选框 */}
            <EAMCheckbox {...register('warranty', 'warranty')}/>

            {/* 停机时间输入框 */}
            <EAMTextField {...register('downtimehours', 'downtimeHours')}/>

        </React.Fragment>
    )

}

export default WorkorderGeneral