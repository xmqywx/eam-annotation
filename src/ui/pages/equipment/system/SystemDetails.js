import React from 'react';
import EAMSelect from 'eam-components/dist/ui/components/inputs-ng/EAMSelect';
import EAMTextField from 'eam-components/dist/ui/components/inputs-ng/EAMTextField';
import EAMDatePicker from 'eam-components/dist/ui/components/inputs-ng/EAMDatePicker.js'
import EAMAutocomplete from 'eam-components/dist/ui/components/inputs-ng/EAMAutocomplete';
import WS from "../../../../tools/WS";
import WSEquipment from "../../../../tools/WSEquipment";
import { onCategoryChange } from '../EquipmentTools';

const SystemDetails = (props) => {

    const { equipment, register, updateEquipmentProperty } = props;

    return (
        <React.Fragment>

            <EAMAutocomplete
                {...register('class', 'classCode', 'classDesc')}
                autocompleteHandler={WS.autocompleteClass}
                autocompleteHandlerParams={['OBJ']}
            />

            <EAMAutocomplete
                {...register('category', 'categoryCode', 'categoryDesc',
                categoryCode => onCategoryChange(categoryCode, updateEquipmentProperty))}
                autocompleteHandler={WSEquipment.autocompleteEquipmentCategory}
                autocompleteHandlerParams={[equipment.classCode]}
            />

            <EAMDatePicker {...register('commissiondate', 'comissionDate')} />

            <EAMAutocomplete
                {...register('assignedto', 'assignedTo', 'assignedToDesc')}
                autocompleteHandler={WS.autocompleteEmployee}
            />

            <EAMSelect
                {...register('criticality', 'criticality')}
                autocompleteHandler={WSEquipment.getEquipmentCriticalityValues}
            />

            <EAMAutocomplete
                // TODO: manufacturerDesc comes 'null' in initial response
                {...register('manufacturer', 'manufacturerCode', 'manufacturerDesc')}
                autocompleteHandler={WSEquipment.autocompleteManufacturer}
            />

            <EAMTextField {...register('serialnumber', 'serialNumber')} />

            <EAMTextField {...register('model', 'model')} />

        </React.Fragment>
    )
}

export default SystemDetails;