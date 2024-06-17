import React, {useState, useEffect} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import BlockUi from 'react-block-ui';
import WSWorkorders from "../../../../tools/WSWorkorders";
import EAMSelect from "eam-components/dist/ui/components/inputs-ng/EAMSelect";
import EAMDatePicker from 'eam-components/dist/ui/components/inputs-ng/EAMDatePicker';
import EAMTextField from 'eam-components/dist/ui/components/inputs-ng/EAMTextField';
import { createOnChangeHandler, processElementInfo } from 'eam-components/dist/ui/components/inputs-ng/tools/input-tools';

const AdditionalCostDialog = (props) => {
    const [additionalCost, setAdditionalCost] = useState({ 
        costType: "MISC" , 
        date: new Date()}); // 使用useState管理额外成本的状态
    const [activityList, setActivityList] = useState([]); // 使用useState管理活动列表的状态
    const [loading, setLoading] = useState(false); // 使用useState管理加载状态

    useEffect(() => {
        if (props.isDialogOpen) {
            loadActivities(props.workorder);
        }
    }, [props.isDialogOpen]); // 使用useEffect处理对话框打开时的副作用

    const loadActivities = (workorder) => {
        WSWorkorders.getWorkOrderActivities(workorder.number).then((response) => {
            setActivityList(transformActivities(response.body.data));
        }).catch((error) => {
            props.handleError(error);
        });
    }; // 定义加载活动的函数

    const transformActivities = (activities) => {
        return activities.map((activity) => ({
            code: activity.activityCode,
            desc: activity.tradeCode
        }));
    } // 定义转换活动数据的函数

    const updateAdditionalCostProperty = (key, value) => {
        setAdditionalCost((prevAdditionalCost) => ({
            ...prevAdditionalCost,
            [key]: value,
        }));
    }; // 定义更新额外成本属性的函数

    const handleSave = () => {
        setLoading(true);
        WSWorkorders.createAdditionalCost({...additionalCost }, props.workorder.number)
            .then(props.successHandler)
            .catch(props.handleError)
            .finally(() => setLoading(false));
    }; // 定义处理保存操作的函数

    return (
        <Dialog
            fullWidth
            id="addAdditionalCostDialog"
            open={props.isDialogOpen}
            onClose={props.handleCancel}
            aria-labelledby="form-dialog-title">

            <DialogTitle id="form-dialog-title">Add Additional Cost</DialogTitle>

            <DialogContent id="content" style={{ overflowY: 'visible' }}>
                <BlockUi tag="div" blocking={loading || props.isLoading}>
                    <EAMSelect 
                        {...processElementInfo(props.tabLayout['activitytrade'])}
                        options={activityList}
                        value={additionalCost.activityCode}
                        onChange={createOnChangeHandler("activityCode", null, null, updateAdditionalCostProperty)}
                    />

                    <EAMTextField 
                        {...processElementInfo(props.tabLayout['costdescription'])}
                        value={additionalCost.costDescription}
                        onChange={createOnChangeHandler("costDescription", null, null, updateAdditionalCostProperty)}
                    />

                    <EAMTextField 
                        {...processElementInfo(props.tabLayout['costtype'])}
                        disabled
                        value="Parts/Services"
                        onChange={createOnChangeHandler("costType", null, null, updateAdditionalCostProperty)}
                    />

                    <EAMTextField 
                        {...processElementInfo(props.tabLayout['cost'])}
                        value={additionalCost.cost}
                        onChange={createOnChangeHandler("cost", null, null, updateAdditionalCostProperty)}
                    />

                    <EAMDatePicker 
                        {...processElementInfo(props.tabLayout['additionalcostsdate'])}
                        value={additionalCost.date}
                        onChange={createOnChangeHandler("date", null, null, updateAdditionalCostProperty)}
                    />
                </BlockUi>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.handleCancel} color="primary" disabled={loading || props.isLoading}>
                    Cancel
                </Button>
                <Button onClick={handleSave} color="primary" disabled={loading || props.isLoading}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );

}

export default AdditionalCostDialog;