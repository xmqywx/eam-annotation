import React from 'react';
import WSEquipment from "../../../../tools/WSEquipment";
import StatusRow from "../../../components/statusrow/StatusRow"
import EAMTextField from 'eam-components/dist/ui/components/inputs-ng/EAMTextField';
import EAMAutocomplete from 'eam-components/dist/ui/components/inputs-ng/EAMAutocomplete';
import EAMSelect from 'eam-components/dist/ui/components/inputs-ng/EAMSelect';
import { isDepartmentReadOnly, isMonoOrg } from 'ui/pages/EntityTools';
import EAMUDF from 'ui/components/userdefinedfields/EAMUDF';

const AssetGeneral = (props) => {

    const {
        equipment,
        newEntity,
        statuses,
        register,
        userData,
        screenPermissions
    } = props;

    return (
        <React.Fragment>

            {!isMonoOrg && newEntity && <EAMTextField {...register('organization', 'organization')} uppercase/>}

            {newEntity && <EAMTextField {...register('equipmentno', 'code')} />}

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
