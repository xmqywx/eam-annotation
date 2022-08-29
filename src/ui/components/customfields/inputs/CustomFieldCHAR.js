import React from 'react';
import tools from '../CustomFieldTools'
import EAMSelect from 'eam-components/dist/ui/components/inputs-ng/EAMSelect';
import EAMTextField from 'eam-components/dist/ui/components/inputs-ng/EAMTextField';
import { processElementInfo } from 'eam-components/dist/ui/components/inputs-ng/tools/input-tools';

function CustomFieldCHAR(props) {

    let {customField, updateCustomFieldValue, elementInfo, lookupValues, UoM} = props;
    elementInfo = {...elementInfo, readonly: props.readonly};

    if (tools.isLookupCustomField(customField)) {
        return <EAMSelect
            {...processElementInfo(elementInfo)}
            valueKey="value"
            options={lookupValues && lookupValues[customField.code]}
            value={customField.value}
            updateProperty={updateCustomFieldValue}
            endTextAdornment={UoM}
        />
    } else {
        return (
            <EAMTextField
                {...processElementInfo(elementInfo)}
                value={customField.value}
                updateProperty={updateCustomFieldValue}
                valueKey="value"
                readonly={props.readonly}
                endTextAdornment={UoM}/>
        )
    }

}

export default React.memo(CustomFieldCHAR);