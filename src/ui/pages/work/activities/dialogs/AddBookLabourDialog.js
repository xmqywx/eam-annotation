import React, {useEffect, useState} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import BlockUi from 'react-block-ui'
import './AddActivityDialog.css'
import WSWorkorders from "../../../../../tools/WSWorkorders";
import KeyCode from "eam-components/dist/enums/KeyCode";
import EAMTextField from 'eam-components/dist/ui/components/inputs-ng/EAMTextField';
import EAMAutocomplete from 'eam-components/dist/ui/components/inputs-ng/EAMAutocomplete';
import EAMDatePicker from 'eam-components/dist/ui/components/inputs-ng/EAMDatePicker';
import EAMSelect from 'eam-components/dist/ui/components/inputs-ng/EAMSelect';
import { createOnChangeHandler, processElementInfo } from 'eam-components/dist/ui/components/inputs-ng/tools/input-tools';

/**
 * Display detail of an activity
 */
function AddActivityDialog(props) {

    let [loading, setLoading] = useState(false);
    let [formValues, setFormValues] = useState({});

    useEffect(() => {
        if (props.open) {
            init()
        }
    }, [props.open])

    let init = () => {
        setFormValues({
            workOrderNumber: props.workorderNumber,
            departmentCode: props.department,
            departmentDesc: props.departmentDesc,
            employeeCode: props.defaultEmployee,
            employeeDesc: props.defaultEmployeeDesc,
            activityCode: props.activities.length === 1 ? '5' : null,
            typeOfHours: 'N',
            dateWorked: new Date()
        });
    };

    let handleClose = () => {
        props.onClose();
    };

    let handleSave = () => {
        // Populate trade code
        let tradeCode = "";
        let filteredActivities = props.activities.filter(activity => activity.activityCode === formValues.activityCode);
        if (filteredActivities.length === 1) {
            tradeCode = filteredActivities[0].tradeCode;
        }

        let bookingLabour = {
            ...formValues,
            tradeCode
        }
        delete bookingLabour.departmentDesc;

        setLoading(true);
        WSWorkorders.createBookingLabour(bookingLabour)
            .then(WSWorkorders.getWorkOrder.bind(null, props.workorderNumber))
            .then(result => {
                setLoading(false);

                const workorder = result.body.data;
                if (props.updateCount + 1 === workorder.updateCount
                        && props.startDate === null) {
                    props.updateEntityProperty('startDate', workorder.startDate);
                    props.updateEntityProperty('updateCount', props.updateCount + 1);
                } else if (props.updateCount !== workorder.updateCount
                        || props.startDate !== workorder.startDate) {
                    // an unexpected situation has happened, reload the page
                    window.location.reload();
                }

                props.showNotification("Booking labour successfully created")
                handleClose();
                props.onChange();
            })
            .catch(error => {
                setLoading(false)
                props.handleError(error)
            });
    };

    let updateFormValues = (key, value) => {
        setFormValues(prevFormValues => ({
            ...prevFormValues,
            [key]: value
        }))
    };

    let onKeyDown = (e) => {
        if (e.keyCode === KeyCode.ENTER) {
            e.stopPropagation();
            handleSave();
        }
    }
    
    return (
        <div onKeyDown={onKeyDown}>
            <Dialog
                fullWidth
                id="addBookLabourDialog"
                open={props.open}
                onClose={handleClose}
                aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Book Labor</DialogTitle>

                <DialogContent id="content">
                    <div>
                        <BlockUi tag="div" blocking={loading}>
                            <EAMSelect
                                {...processElementInfo(props.layout.booactivity)}
                                value={formValues['activityCode'] || ''}
                                options={props.activities.map(activity => {
                                    return {
                                        code: activity.activityCode,
                                        desc: activity.tradeCode
                                    }
                                })}
                                onChange={createOnChangeHandler("activityCode", null, updateFormValues)}
                            />

                            <EAMAutocomplete
                                autocompleteHandler={WSWorkorders.autocompleteBOOEmployee}
                                {...processElementInfo(props.layout.employee)}
                                value={formValues['employeeCode'] || ''}
                                desc={formValues['employeeDesc']}
                                onChange={createOnChangeHandler("employeeCode", "employeeDesc", updateFormValues)}
                            />

                            <EAMAutocomplete
                                autocompleteHandler={WSWorkorders.autocompleteBOODepartment}
                                {...processElementInfo(props.layout.department)}
                                value={formValues['departmentCode'] || ''}
                                desc={formValues['departmentDesc']}
                                onChange={createOnChangeHandler("departmentCode", "departmentDesc", updateFormValues)}
                            />

                            <EAMDatePicker
                                {...processElementInfo(props.layout.datework)}
                                value={formValues['dateWorked']}
                                onChange={createOnChangeHandler("dateWorked", null, updateFormValues)}
                            />

                            <EAMSelect
                                {...processElementInfo(props.layout.octype)}
                                value={formValues['typeOfHours'] || ''}
                                autocompleteHandler={WSWorkorders.getTypesOfHours}
                                onChange={createOnChangeHandler("typeOfHours", null, updateFormValues)}
                            />

                            <EAMTextField
                                {...processElementInfo(props.layout.hrswork)}
                                value={formValues['hoursWorked']}
                                onChange={createOnChangeHandler("hoursWorked", null, updateFormValues)}
                            />
                        </BlockUi>
                    </div>
                </DialogContent>

                <DialogActions>
                    <div>
                        <Button onClick={handleClose} color="primary" disabled={loading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} color="primary" disabled={loading}>
                            Save
                        </Button>
                    </div>
                </DialogActions>

            </Dialog>
        </div>
    );
}

export default AddActivityDialog;