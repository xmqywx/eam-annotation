import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import BlockUi from 'react-block-ui'; // 用于在加载时阻塞用户界面
import './AddActivityDialog.css';
import WSWorkorders from '../../../../../tools/WSWorkorders'; // 工单服务工具
import KeyCode from 'eam-components/dist/enums/KeyCode'; // 键盘代码枚举
import EAMTextField from 'eam-components/dist/ui/components/inputs-ng/EAMTextField';
import EAMAutocomplete from 'eam-components/dist/ui/components/inputs-ng/EAMAutocomplete';
import EAMDatePicker from 'eam-components/dist/ui/components/inputs-ng/EAMDatePicker';
import useFieldsValidator from 'eam-components/dist/ui/components/inputs-ng/hooks/useFieldsValidator';
import { createOnChangeHandler, processElementInfo } from 'eam-components/dist/ui/components/inputs-ng/tools/input-tools';
import LightDialog from 'ui/components/LightDialog';

/**
 * Display detail of an activity
 * 添加或编辑活动的对话框
 */
function AddActivityDialog(props) {
    let [loading, setLoading] = useState(false);// 控制加载状态
    let [formValues, setFormValues] = useState({}); // 表单值状态

    // Passing an 'activityToEdit' object indicates that we are editing an existing activity
    // 解构props中的activityToEdit和layout对象
    const { activityToEdit, layout } = props;

    // 定义表单字段数据
    const fieldsData = {
        activityCode: layout.activity,
        activityNote: layout.activitynote,
        taskCode: layout.task,
        materialList: layout.matlcode,
        tradeCode: layout.trade,
        peopleRequired: layout.personsreq,
        estimatedHours: layout.esthrs,
        startDate: layout.actstartdate,
        endDate: layout.actenddate,
    };

    // 使用自定义钩子进行字段验证
    const { errorMessages, validateFields, resetErrorMessages } =
        useFieldsValidator(fieldsData, formValues);

    // 副作用处理对话框打开和关闭的逻辑
    useEffect(() => {
        if (props.open) {
            if (activityToEdit) {
                setFormValues(activityToEdit); // 编辑模式，加载活动数据
            } else {
                init(); // 新增模式，初始化表单
            }
        } else {
            resetErrorMessages(); // 重置错误信息
        }
    }, [props.open]);

    // 初始化表单数据
    let init = () => {
        setLoading(true);
        WSWorkorders.initWorkOrderActivity(props.workorderNumber).then((response) => {
            setFormValues({
                ...response.body.data,
                "workOrderNumber": props.workorderNumber,
                "activityCode": props.newActivityCode,
                "peopleRequired": 1,
                "estimatedHours": 1,
                "startDate": new Date(),
                "endDate": new Date(),
            });
            setLoading(false);
        }).catch((error) => {
            setLoading(false);
            props.handleError(error);
        });
    };

    // 处理关闭对话框
    let handleClose = () => {
        props.onClose();
    };

    // 处理保存行为
    let handleSave = () => {
        if (!validateFields()) {
            return;
        }

        let activity = { ...formValues };
        delete activity.taskDesc; // 删除不需要保存的描述字段
        delete activity.tradeDesc;
        delete activity.materialListDesc;

        setLoading(true);
        (
            activityToEdit
                ? WSWorkorders.updateWorkOrderActivity(activity) // 更新活动
                : WSWorkorders.createWorkOrderActivity(activity) // 创建新活动
        ).then(() => {
            props.postAddActivityHandler();
            setLoading(false);
            props.showNotification(`Activity successfully ${activityToEdit ? 'updated' : 'created'}`);
            handleClose();
            props.onChange();
        })
            .catch((error) => {
                setLoading(false);
                props.handleError(error);
            });
    };

    // 更新表单值
    let updateFormValues = (key, value) => {
        if (key === 'taskCode' && value) {
            onTaskCodeChanged(value);
        }
        setFormValues((prevFormValues) => ({
            ...prevFormValues,
            [key]: value,
        }));
    };

    // onTaskCodeChanged函数：当任务代码发生变化时调用
    let onTaskCodeChanged = (taskcode) => {
        // 设置加载状态为true，表示开始加载数据
        setLoading(true);

        // 调用WSWorkorders服务的getTaskPlan方法，传入任务代码，获取任务计划详情
        WSWorkorders.getTaskPlan(taskcode)
            .then((response) => {
                // 从响应中提取任务计划数据
                const taskPlan = response.body.data;

                // 更新表单值：任务描述和活动备注设置为任务计划的描述
                updateFormValues('taskDesc', taskPlan.description);
                updateFormValues('activityNote', taskPlan.description);

                // 如果任务计划中包含人员需求信息，则更新表单中的人员需求字段
                if (taskPlan.peopleRequired) {
                    updateFormValues('peopleRequired', taskPlan.peopleRequired);
                }
                
                // 如果任务计划中包含预计小时数，则更新表单中的预计小时数字段
                if (taskPlan.estimatedHours) {
                    updateFormValues('estimatedHours', taskPlan.estimatedHours);
                }

                // 如果任务计划中包含材料列表，则更新表单中的材料列表字段
                if (taskPlan.materialList) {
                    updateFormValues('materialList', taskPlan.materialList);
                }

                // 如果任务计划中包含交易代码，则更新表单中的交易代码字段
                if (taskPlan.tradeCode) {
                    updateFormValues('tradeCode', taskPlan.tradeCode);
                }
            })
            .catch(console.error) // 如果请求失败，打印错误信息到控制台
            .finally(() => setLoading(false)); // 请求完成后，无论成功或失败，都将加载状态设置为false
    };

    // 处理键盘事件，如回车键保存
    let onKeyDown = (e) => {
        if (e.keyCode === KeyCode.ENTER) {
            e.stopPropagation();
            handleSave();
        }
    };

    return (
        // 包裹对话框的div元素，监听键盘事件
        <div onKeyDown={onKeyDown}>
            {/* LightDialog组件用于显示模态对话框 */}
            <LightDialog
                fullWidth // 对话框宽度占满容器
                id="addActivityDialog"
                open={props.open} // 控制对话框的显示与隐藏
                onClose={handleClose}
                aria-labelledby="form-dialog-title" // 辅助技术用于识别对话框的标题
                >
                {/* 对话框标题 */}
                <DialogTitle id="form-dialog-title">Add Activity</DialogTitle>

                {/* 对话框内容区域 */}
                <DialogContent id="content">
                    <div>
                        {/* BlockUi组件用于在加载时显示加载指示器，阻止用户交互 */}
                        <BlockUi tag="div" blocking={loading}>
                            <EAMTextField
                                {...processElementInfo(layout.activity)} // 传入活动代码的字段信息
                                value={formValues['activityCode']} // 绑定表单状态中的活动代码值
                                onChange={createOnChangeHandler("activityCode", null, null, updateFormValues)} // 输入变化时的处理函数
                                disabled={activityToEdit} // 如果是编辑模式，则禁用输入
                                errorText={errorMessages?.activityCode} // 显示活动代码字段的错误信息
                            />

                            <EAMTextField
                                {...processElementInfo(layout.activitynote)}
                                value={formValues['activityNote']}
                                onChange={createOnChangeHandler("activityNote", null, null, updateFormValues)}
                                errorText={errorMessages?.activityNote}
                            />

                            <EAMAutocomplete
                                autocompleteHandler={WSWorkorders.autocompleteACTTask}
                                {...processElementInfo(layout.task)}
                                value={formValues['taskCode']}
                                desc={formValues['taskDesc']}
                                onChange={createOnChangeHandler("taskCode", "taskDesc", null, updateFormValues)}
                                errorText={errorMessages?.taskCode}
                            />

                            <EAMAutocomplete
                                autocompleteHandler={WSWorkorders.autocompleteACTMatList}
                                {...processElementInfo(layout.matlcode)}
                                value={formValues['materialList']}
                                desc={formValues['materialListDesc']}
                                onChange={createOnChangeHandler("materialList", "materialListDesc", null, updateFormValues)}
                                maxHeight={200}
                                errorText={errorMessages?.materialList}
                            />

                            <EAMAutocomplete
                                autocompleteHandler={WSWorkorders.autocompleteACTTrade}
                                {...processElementInfo(layout.trade)}
                                value={formValues['tradeCode']}
                                desc={formValues['tradeDesc']}
                                onChange={createOnChangeHandler("tradeCode", "tradeDesc", null, updateFormValues)}
                                errorText={errorMessages?.tradeCode}
                            />

                            <EAMTextField
                                {...processElementInfo(layout.personsreq)}
                                value={formValues['peopleRequired']}
                                onChange={createOnChangeHandler("peopleRequired", null, null, updateFormValues)}
                                errorText={errorMessages?.peopleRequired}
                            />

                            <EAMTextField
                                {...processElementInfo(layout.esthrs)}
                                valueKey="estimatedHours"
                                value={formValues['estimatedHours']}
                                onChange={createOnChangeHandler("estimatedHours", null, null, updateFormValues)}
                                errorText={errorMessages?.estimatedHours}
                            />

                            <EAMDatePicker
                                {...processElementInfo(layout.actstartdate)}
                                valueKey="startDate"
                                value={formValues['startDate']}
                                onChange={createOnChangeHandler("startDate", null, null, updateFormValues)}
                                errorText={errorMessages?.startDate}
                            />

                            <EAMDatePicker
                                {...processElementInfo(layout.actenddate)}
                                valueKey="endDate"
                                value={formValues['endDate']}
                                onChange={createOnChangeHandler("endDate", null, null, updateFormValues)}
                                errorText={errorMessages?.endDate}
                            />
                        </BlockUi>
                    </div>
                </DialogContent>

                <DialogActions>
                    <div>
                        <Button onClick={handleClose} color="primary" disabled={loading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} color="primary" disabled={loading} autoFocus>
                            Save
                        </Button>
                    </div>
                </DialogActions>
            </LightDialog>
        </div>
    );
}

export default AddActivityDialog;
