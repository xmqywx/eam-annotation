import React, {Component} from 'react';
import EAMSelect from 'eam-components/dist/ui/components/inputs-ng/EAMSelect';
import EAMTextField from 'eam-components/dist/ui/components/inputs-ng/EAMTextField';
import EAMDatePicker from 'eam-components/dist/ui/components/inputs-ng/EAMDatePicker'
import EAMAutocomplete from 'eam-components/dist/ui/components/inputs-ng/EAMAutocomplete';
import WS from "../../../../tools/WS";
import WSEquipment from "../../../../tools/WSEquipment";
import { onCategoryChange } from '../EquipmentTools';

const PositionDetails = (props) => {

    const { equipment, updateEquipmentProperty, register } = props;

    return (
        <React.Fragment>

            <EAMAutocomplete
                {...register('class', 'classCode', 'classDesc')}
                autocompleteHandler={WS.autocompleteClass}
                autocompleteHandlerParams={['OBJ']}
            />

            <EAMAutocomplete
                {...register('category', 'categoryCode', 'categoryDesc')}
                autocompleteHandler={WSEquipment.autocompleteEquipmentCategory}
                autocompleteHandlerParams={[equipment.classCode]}
                onChangeValue={(categoryCode) =>
                    onCategoryChange(categoryCode, updateEquipmentProperty)
                }
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
                {...register('manufacturer', 'manufacturerCode', 'manufacturerDesc')}
                autocompleteHandler={WSEquipment.autocompleteManufacturer}
            />

            <EAMTextField {...register('serialnumber', 'serialNumber')} />

            <EAMTextField {...register('model', 'model')} />

        </React.Fragment>
    );
}

export default PositionDetails;
