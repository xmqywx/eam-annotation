import React from 'react';
import WSEquipment from "../../../../tools/WSEquipment";
import WS from "../../../../tools/WS";
import StatusRow from "../../../components/statusrow/StatusRow"
import EAMTextField from 'eam-components/dist/ui/components/inputs-ng/EAMTextField';
import EAMAutocomplete from 'eam-components/dist/ui/components/inputs-ng/EAMAutocomplete';
import EAMSelect from 'eam-components/dist/ui/components/inputs-ng/EAMSelect';
import { isDepartmentReadOnly, isMultiOrg } from 'ui/pages/EntityTools';
import EAMUDF from 'ui/components/userdefinedfields/EAMUDF';

const AssetGeneral = (props) => {

    const {
        equipment,  // 设备对象
        newEntity,  // 是否为新实体的标志
        statuses,  // 状态选项列表
        register,  // 注册函数，用于连接表单字段
        userData,  // 用户数据
        screenCode,  // 屏幕代码
        screenPermissions  // 屏幕权限
    } = props;  // 从props中解构出各个属性

    return (
        <React.Fragment>

            {isMultiOrg && newEntity && <EAMSelect {...register('organization', 'organization')}
            autocompleteHandler={WS.getOrganizations}
            autocompleteHandlerParams={[screenCode]}/>}

            {newEntity && <EAMTextField {...register('equipmentno', 'code')}/>}

            <EAMTextField {...register('alias', 'alias')} barcodeScanner/>

            <EAMUDF
                {...register('udfchar45','userDefinedFields.udfchar45')}/>

            <EAMTextField {...register('equipmentdesc', 'description')} />

            <EAMAutocomplete
                {...register('department', 'departmentCode', 'departmentDesc')}
                autocompleteHandler={
                    WSEquipment.autocompleteEquipmentDepartment
                }
            />

            <EAMSelect
                {...register('assetstatus', 'statusCode')}
                disabled={isDepartmentReadOnly(equipment.departmentCode, userData) || !screenPermissions.updateAllowed}
                options={statuses}
            />
            
            <EAMSelect
                {...register('state', 'stateCode')}
                autocompleteHandler={WSEquipment.getEquipmentStateValues}
            />

            <StatusRow
                entity={equipment}
                entityType={"equipment"}
                style={{marginTop: "10px", marginBottom: "-10px"}}
            />
        </React.Fragment>
    )
}

export default AssetGeneral;
