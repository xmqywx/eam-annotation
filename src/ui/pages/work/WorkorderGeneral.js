import React from 'react';
import EAMCheckbox from 'eam-components/dist/ui/components/inputs-ng/EAMCheckbox'
import WS from '../../../tools/WS'
import WSWorkorders from "../../../tools/WSWorkorders"
import EAMAutocomplete from 'eam-components/dist/ui/components/inputs-ng/EAMAutocomplete';
import EAMSelect from 'eam-components/dist/ui/components/inputs-ng/EAMSelect';
import EAMTextField from 'eam-components/dist/ui/components/inputs-ng/EAMTextField';
import { isDepartmentReadOnly, isMultiOrg } from '../EntityTools';
import EAMUDF from 'ui/components/userdefinedfields/EAMUDF';

function WorkorderDetails(props) {

    const {workorder, register, applicationData, statuses, userGroup, userData, screenPermissions, newEntity, screenCode } = props; 
    const rpawClassesList = (applicationData && applicationData.EL_TRPAC && applicationData.EL_TRPAC.split(',')) || [];
    const rpawLink = applicationData && applicationData.EL_TRPAW;

    return (
        <React.Fragment>

            <EAMSelect {...register('organization', 'organization')}
            hidden={!isMultiOrg || !newEntity}
            autocompleteHandler={WS.getOrganizations}
            autocompleteHandlerParams={[screenCode]}/>

            <EAMTextField {...register('description', 'description')}/>

            <EAMAutocomplete {...register('equipment', 'equipmentCode', 'equipmentDesc', 'equipmentOrganization')}
                             barcodeScanner
                             autocompleteHandler={WS.autocompleteEquipment}
                             autocompleteHandlerParams={[false]}
                             link={() => workorder.equipmentCode ? "/equipment/" + workorder.equipmentCode : null}/>
  
            <EAMAutocomplete {...register('location', 'locationCode', 'locationDesc')}
                             autocompleteHandler={WS.autocompleteLocation}/>

            <EAMAutocomplete {...register('department', 'departmentCode', 'departmentDesc')}
                             autocompleteHandler={WS.autocompleteDepartment}/>

            <EAMSelect {...register('workordertype', 'typeCode', 'typeDesc')}
                    renderSuggestion={suggestion => suggestion.desc}
                    renderValue={value => value.desc || value.code}
                    autocompleteHandler={WSWorkorders.getWorkOrderTypeValues}
                    autocompleteHandlerParams = {[userGroup]}/>

            <EAMSelect
                {...register('workorderstatus', 'statusCode', 'statusDesc')}
                disabled={isDepartmentReadOnly(workorder.departmentCode, userData) || !screenPermissions.updateAllowed}
                renderSuggestion={suggestion => suggestion.desc}
                renderValue={value => value.desc || value.code}
                options={statuses} 
                />

            <EAMSelect
                {...register('priority', 'priorityCode', 'priorityDesc')}
                autocompleteHandler={WSWorkorders.getWorkOrderPriorities}/>

            <EAMAutocomplete 
                {...register('woclass', 'classCode', 'classDesc')}
                autocompleteHandler={WS.autocompleteClass}
                autocompleteHandlerParams={['EVNT']}
            />

            <EAMAutocomplete {...register('standardwo', 'standardWO', 'standardWODesc')}
                             autocompleteHandler={WSWorkorders.autocompleteStandardWorkOrder.bind(null, userGroup)}/>

            <EAMTextField {...register('targetvalue', 'targetValue')}/>

            <EAMTextField {...register('parentwo', 'parentWO')}
                          link={() => workorder.parentWO && rpawClassesList.includes(workorder.classCode) ? rpawLink + workorder.parentWO : null}/>

            <EAMTextField {...register('udfchar01', 'userDefinedFields.udfchar01','userDefinedFields.udfchar01Desc')}
                          link={() => workorder.userDefinedFields?.udfchar01 ? "https://cern.service-now.com/task.do?sysparm_query=number=" + workorder.userDefinedFields.udfchar01 : null}/>

            <EAMTextField {...register('udfchar20', 'userDefinedFields.udfchar20','userDefinedFields.udfchar20Desc')}/>

            <EAMTextField {...register('udfchar24', 'userDefinedFields.udfchar24','userDefinedFields.udfchar24Desc')}
                          link={() => workorder.userDefinedFields?.udfchar24 ? "https://its.cern.ch/jira/browse/" + workorder.userDefinedFields.udfchar24 : null}/>

            <EAMUDF {...register('udfchkbox01', `userDefinedFields.udfchkbox01`)}/>

            <EAMUDF {...register('udfchkbox02', `userDefinedFields.udfchkbox02`)}/>

            <EAMUDF {...register('udfchkbox03', `userDefinedFields.udfchkbox03`)}/>

            <EAMUDF {...register('udfchkbox04', `userDefinedFields.udfchkbox04`)}/>

            <EAMUDF {...register('udfchkbox05', `userDefinedFields.udfchkbox05`)}/>

            <EAMCheckbox {...register('warranty', 'warranty')}/>

            <EAMTextField {...register('downtimehours', 'downtimeHours')}/>

        </React.Fragment>
    )

}

export default WorkorderDetails