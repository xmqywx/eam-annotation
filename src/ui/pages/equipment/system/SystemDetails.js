import React, {Component} from 'react';
import EISPanel from 'eam-components/dist/ui/components/panel';
import EAMSelect from 'eam-components/dist/ui/components/muiinputs/EAMSelect'
import EAMInput from 'eam-components/dist/ui/components/muiinputs/EAMInput'
import EAMDatePicker from 'eam-components/dist/ui/components/muiinputs/EAMDatePicker'
import EAMAutocomplete from 'eam-components/dist/ui/components/muiinputs/EAMAutocomplete'
import WS from "../../../../tools/WS";
import WSEquipment from "../../../../tools/WSEquipment";

class SystemDetails extends Component {

    onChangeCategoryCode = (code) => {
        const {updateEquipmentProperty} = this.props;
        //Fetch the category data
        if (code) {
            WSEquipment.getCategoryData(code).then(response => {
                const categoryData = response.body.data;
                if (categoryData && categoryData.length > 2) {
                    //Set the class and manufacturer
                    const classCode = categoryData[2];
                    const classDesc = categoryData[3];
                    const manufacturerCode = categoryData[4];
                    //Update fields
                    if (classCode) {
                        updateEquipmentProperty('classCode', classCode);
                    }
                    if (classDesc) {
                        updateEquipmentProperty('classDesc', classDesc);
                    }
                    if (manufacturerCode) {
                        updateEquipmentProperty('manufacturerCode', manufacturerCode);
                        updateEquipmentProperty('manufacturerDesc', '');
                    }
                }
            }).catch(error => {
                console.log(error);
            })
        }
    };

    render() {
        let {equipment, children, systemLayout, updateEquipmentProperty, layout} = this.props;

        return (
            <EISPanel heading="DETAILS">
                <div style={{width: "100%", marginTop: 0}}>

                    <EAMAutocomplete
                        children={children}
                        elementInfo={systemLayout.fields['class']}
                        value={equipment.classCode}
                        valueDesc={equipment.classDesc}
                        updateProperty={updateEquipmentProperty}
                        valueKey="classCode"
                        descKey="classDesc"
                        autocompleteHandler={(filter, config) => WS.autocompleteClass('OBJ', filter, config)}
                    />

                    <EAMAutocomplete
                        children={children}
                        elementInfo={systemLayout.fields['category']}
                        value={equipment.categoryCode}
                        valueDesc={equipment.categoryDesc}
                        updateProperty={updateEquipmentProperty}
                        valueKey="categoryCode"
                        descKey="categoryDesc"
                        autocompleteHandler={WSEquipment.autocompleteEquipmentCategory}
                        onChangeValue={this.onChangeCategoryCode}/>

                    <EAMDatePicker
                        children={children}
                        elementInfo={systemLayout.fields['commissiondate']}
                        value={equipment.comissionDate}
                        updateProperty={updateEquipmentProperty}
                        valueKey="comissionDate"/>

                    <EAMAutocomplete children={children}
                                     elementInfo={systemLayout.fields['assignedto']}
                                     value={equipment.assignedTo}
                                     updateProperty={updateEquipmentProperty}
                                     valueKey="assignedTo"
                                     valueDesc={equipment.assignedToDesc}
                                     descKey="assignedToDesc"
                                     autocompleteHandler={WS.autocompleteEmployee}/>

                    <EAMSelect
                        children={children}
                        elementInfo={systemLayout.fields['criticality']}
                        value={equipment.criticality}
                        values={layout.criticalityValues}
                        updateProperty={updateEquipmentProperty}
                        valueKey="criticality"/>

                    <EAMAutocomplete elementInfo={systemLayout.fields['manufacturer']}
                                     updateProperty={updateEquipmentProperty}
                                     value={equipment.manufacturerCode}
                                     valueKey="manufacturerCode"
                                     valueDesc={equipment.manufacturerDesc}
                                     descKey="manufacturerDesc"
                                     autocompleteHandler={WSEquipment.autocompleteManufacturer}/>

                    <EAMInput
                        children={children}
                        elementInfo={systemLayout.fields['serialnumber']}
                        value={equipment.serialNumber}
                        updateProperty={updateEquipmentProperty}
                        valueKey="serialNumber"/>

                    <EAMInput
                        children={children}
                        elementInfo={systemLayout.fields['model']}
                        value={equipment.model}
                        updateProperty={updateEquipmentProperty}
                        valueKey="model"/>

                </div>
            </EISPanel>
        )
    }
}

export default SystemDetails;