import React, {useEffect, useState} from 'react';
import WSWorkorders from "../../../../tools/WSWorkorders";
import Activity from "./Activity";
import './Activities.css';
import Button from '@mui/material/Button';
import AddActivityDialogContainer from "./dialogs/AddActivityDialogContainer";
import AddBookLabourDialogContainer from "./dialogs/AddBookLabourDialogContainer";
import { Stack } from '@mui/material';

/**
 * Panel Activities and Book labor
 * 主组件，用于展示和管理活动及劳动预订
 */
function Activities(props) {
    // 状态管理
    let [activities, setActivities] = useState([]); // 活动列表
    let [bookLaboursByActivity, setBookLaboursByActivity] = useState({}); // 按活动分类的劳动预订
    let [isActivityModalOpen, setIsActivityModalOpen] = useState(false); // 控制添加活动对话框的显示
    let [isBookLaborModalOpen, setIsBookLaborModalOpen] = useState(false); // 控制添加劳动预订对话框的显示
    let [loading, setLoading] = useState(false); // 加载状态

    let {workorder, layout, disabled, handleError} = props;

    useEffect(() => {
        // 在工单变更时重新加载活动和劳动预订
        readActivities(workorder);
        readBookLabours(workorder);
    }, [workorder])

    /**
     * Load all activities
     * 加载所有活动
     * @param workOrderNumber 工单编号
     */
    let readActivities = workOrderNumber => {
        setLoading(true)
        WSWorkorders.getWorkOrderActivities(workOrderNumber)
            .then(result => {
                setActivities(result.body.data);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                console.error(error);
            });
    }

    /**
     * Load all book labours
     * 加载所有劳动预订
     * @param workOrderNumber 工单编号
     */
    let readBookLabours = workOrderNumber => {
        WSWorkorders.getBookingLabours(workOrderNumber)
            .then(result => {

                // Creation of a "map" to store book labours by activity
                let bookLaboursByActivity = {};
                result.body.data.forEach(bookLabour => {
                    if (bookLaboursByActivity[bookLabour.activityCode] === undefined) {
                        bookLaboursByActivity[bookLabour.activityCode] = [];
                    }
                    bookLaboursByActivity[bookLabour.activityCode].push(bookLabour);
                });

                setBookLaboursByActivity(bookLaboursByActivity);
            })
            .catch(console.error);
    }

     // 如果正在加载或工单不存在，显示空元素
    if (loading || !workorder) {
        return (
            <div></div>
        );
    }

    return (
        <div id="activities">
            {/* 显示所有活动 */}
            {activities.map((activity, index) => {
                return <Activity
                    key={activity.activityCode}
                    activity={activity}
                    bookLabours={bookLaboursByActivity[activity.activityCode]}
                    layout={layout}
                    postAddActivityHandler={props.postAddActivityHandler}
                    readActivities={() => readActivities(workorder)}
                    handleError={handleError}
                    />
            })}

            {/* 操作按钮 */}
            <Stack direction="row" spacing={2} style={{marginTop: 15}}>
                <Button onClick={() => setIsActivityModalOpen(true)} color="primary" 
                        disabled={disabled || !layout.ACT.insertAllowed} variant="outlined">
                    Add activity
                </Button>

                <Button onClick={() => setIsBookLaborModalOpen(true)} color="primary" 
                        disabled={disabled || !layout.BOO.insertAllowed} variant="outlined">
                    Book Labor
                </Button>
            </Stack>

            {/* 添加活动对话框 */}
            <AddActivityDialogContainer
                open={isActivityModalOpen}
                workorderNumber={workorder}
                onChange={() => readActivities(workorder)}
                onClose={() => setIsActivityModalOpen(false)}
                postAddActivityHandler={props.postAddActivityHandler}
                newActivityCode={activities[activities.length - 1] ? parseInt(activities[activities.length - 1].activityCode) + 5 : 5} />

            {/* 添加劳动预订对话框 */}
            <AddBookLabourDialogContainer
                open={isBookLaborModalOpen}
                activities={activities}
                workorderNumber={workorder}
                department={props.department}
                departmentDesc={props.departmentDesc}
                defaultEmployee={props.defaultEmployee}
                defaultEmployeeDesc={props.defaultEmployeeDesc}
                updateCount={props.updateCount}
                updateEntityProperty={props.updateEntityProperty}
                startDate={props.startDate}
                onChange={() => readBookLabours(workorder)}
                onClose={() => setIsBookLaborModalOpen(false)}/>
        </div>
    )
}

// 使用React.memo优化性能
export default React.memo(Activities);