import React from "react";
import EISPanel from "eam-components/dist/ui/components/panel";
import EAMInput from "eam-components/dist/ui/components/muiinputs/EAMInput";
import EAMAutocomplete from "eam-components/dist/ui/components/muiinputs/EAMAutocomplete";

const AssetGeneral = props => {
    const {
        location,
        children,
        locationLayout,
        updateEquipmentProperty,
        layout
    } = props;

    return (
        <EISPanel heading="GENERAL">
            <div style={{ width: "100%", marginTop: 0 }}>
                {layout.newEntity && (
                    <EAMInput
                        children={children}
                        elementInfo={locationLayout.fields["equipmentno"]}
                        value={location.code}
                        updateProperty={updateEquipmentProperty}
                        valueKey="code"
                    />
                )}

                <EAMInput
                    children={children}
                    elementInfo={locationLayout.fields["udfchar45"]}
                    value={location.userDefinedFields.udfchar45}
                    updateProperty={updateEquipmentProperty}
                    valueKey="userDefinedFields.udfchar45"
                />

                <EAMInput
                    children={children}
                    elementInfo={locationLayout.fields["equipmentdesc"]}
                    value={location.description}
                    updateProperty={updateEquipmentProperty}
                    valueKey="description"
                />

                <EAMAutocomplete
                    children={children}
                    elementInfo={locationLayout.fields["department"]}
                    value={location.departmentCode}
                    valueDesc={location.departmentDesc}
                    updateProperty={updateEquipmentProperty}
                    valueKey="departmentCode"
                    descKey="departmentDesc"
                />
            </div>
        </EISPanel>
    );
};

export default AssetGeneral;
