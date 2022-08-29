import React from 'react';
import tools from '../CustomFieldTools'
import EAMSelect from 'eam-components/dist/ui/components/inputs-ng/EAMSelect';
import EAMTextField from 'eam-components/dist/ui/components/inputs-ng/EAMTextField';

function CustomFieldNUM({customField, lookupValues, UoM, register, index}) {

    if (tools.isLookupCustomField(customField)) {
        return <EAMSelect {...register(customField.code, `customField.${index}.value`)}
                          options={lookupValues && lookupValues[customField.code]}
                          endTextAdornment={UoM}/>
    } else {
        return (
            <EAMTextField {...register(customField.code, `customField.${index}.value`)}
                          endTextAdornment={UoM}/>
        )
    }

}

export default CustomFieldNUM;