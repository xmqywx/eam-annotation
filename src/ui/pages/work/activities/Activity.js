import React, { useState } from 'react';
import WSWorkorders from "../../../../tools/WSWorkorders";
import BookLabours from "./BookLabours";
import { Grid, IconButton, Divider, Typography, Card, Stack, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { formatDate } from 'ui/pages/EntityTools';
import AddActivityDialogContainer from './dialogs/AddActivityDialogContainer';
import { CalendarStart } from 'mdi-material-ui';
import { MoreVert, EditOutlined, DeleteOutline, Groups } from '@mui/icons-material';
import './Activity.css'

/**
 * 显示活动的详细信息的组件
 */
function Activity(props) {

    const { activity, bookLabours, layout, readActivities, postAddActivityHandler, handleError } = props;

    // 使用useState管理编辑模态框的开关状态
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    // 使用useState管理加载状态
    const [loading, setLoading] = useState(false);
    // 使用useState管理菜单锚点元素
    const [anchorEl, setAnchorEl] = useState(null);
    // 计算菜单是否打开
    const open = Boolean(anchorEl);

    // 计算总工时
    const totalHours = bookLabours?.map(({ hoursWorked }) => hoursWorked)
        .map(Number)
        .reduce((a, b) => a + b, 0) ?? 0

    // 根据活动的tradeCode生成显示字符串
    const tradeString = activity.tradeCode === '*' ? '' : ` - ${activity.tradeCode}`

    // 处理菜单打开的事件
    const handleOptionsOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // 处理菜单关闭的事件
    const handleOptionsClose = () => {
        setAnchorEl(null);
    };

    // 处理编辑操作
    const handleEdit = (params) => {
        handleOptionsClose();
        setIsEditModalOpen(true);
    };

    // 处理删除操作
    const handleDelete = async (params) => {
        handleOptionsClose();
        try {
            setLoading(true);
            await WSWorkorders.deleteWorkOrderActivity({ data: activity });
            readActivities();
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    // 渲染选项菜单
    const renderOptionsMenu = (params) => {
        return (
            <>
                <IconButton
                    aria-label="more"
                    id="options-button"
                    aria-controls={open ? 'options-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-haspopup="true"
                    onClick={handleOptionsOpen}
                >
                    <MoreVert />
                </IconButton>
                <Menu
                    id="options-menu"
                    MenuListProps={{
                        'aria-labelledby': 'options-button',
                    }}
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleOptionsClose}
                >
                    <MenuItem
                        key="Edit"
                        onClick={handleEdit}
                        disabled={!layout.ACT.updateAllowed || loading}
                    >
                        <ListItemIcon>
                            <EditOutlined fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Edit</ListItemText>
                    </MenuItem>
                    <MenuItem
                        key="Delete"
                        onClick={handleDelete}
                        disabled={!layout.ACT.deleteAllowed || loading}
                    >
                        <ListItemIcon>
                            <DeleteOutline
                                fontSize="small"
                            />
                        </ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </MenuItem>
                </Menu>
            </>
        );
    };

    return (
        <>
            <Card className="activity" variant="outlined">
                <Grid className="content" container direction="column">
                    <Grid className="activityHeader" item container spacing={1}>
                        <Grid item direction="row" container justifyContent="space-between" flexWrap="nowrap">
                            <Grid item container direction="row" alignItems='center'>
                                <Typography variant="subtitle1" className="activityTitle">
                                    {activity.activityCode}{tradeString}
                                </Typography>
                            </Grid>
                            {renderOptionsMenu()}
                        </Grid>
                        {activity.activityNote &&
                            <Grid item>
                                <Typography variant="subtitle2" color="black" sx={{
                                    wordBreak: 'break-all',
                                }}>
                                    {activity.activityNote}
                                </Typography>
                            </Grid>}
                    </Grid>
                    <Stack
                        className="activityDetails"
                        spacing={1}
                        direction="row"
                        justifyContent="space-between"
                        flexWrap="wrap"
                    >
                        <Grid item xs={5} sm={2} md={5} lg={2} container className='activityDetailsTile'>
                            <Typography variant='caption' color='gray'>
                                {layout.ACT.fields.task.text}
                            </Typography>
                            <Typography noWrap>
                                {activity.taskCode ? activity.taskCode : '—'}
                            </Typography>
                        </Grid>

                        <Grid item xs={5} sm={2} md={5} lg={2} container className='activityDetailsTile'>
                            <Typography variant='caption' color='gray'>
                                {layout.ACT.fields.matlcode.text}
                            </Typography>
                            <Typography noWrap>
                                {activity.materialList ? activity.materialList : '—'}
                            </Typography>
                        </Grid>

                        <Grid item xs={5} sm={2} md={5} lg={2} container className='activityDetailsTile'>
                            <Typography variant='caption' color='gray'>
                                {<Groups />}
                            </Typography>
                            <Typography>
                                {activity.peopleRequired}
                            </Typography>
                        </Grid>

                        <Grid item xs={5} sm={2} md={5} lg={2} container className='activityDetailsTile'>
                            <Typography variant='caption' color='gray'>
                                Hrs. Worked<br />(Estimated)
                            </Typography>
                            <Typography>
                                {totalHours} <span className='estmtd'>({activity.estimatedHours})</span>
                            </Typography>
                        </Grid>

                        <Grid item xs={5} sm={2} md={5} lg={3} xl={2} container className='activityDetailsTile'>
                            <Typography variant='caption' color='gray'>
                                {<CalendarStart />}
                            </Typography>
                            <Typography noWrap>
                                {formatDate(activity.startDate)}
                            </Typography>
                        </Grid>

                    </Stack>

                    {bookLabours && bookLabours.length > 0 &&
                        <BookLabours
                            bookLabours={bookLabours}
                            layout={layout.BOO.fields} />}

                </Grid>
            </Card>

            <Divider />

            <AddActivityDialogContainer
                open={isEditModalOpen}
                onChange={readActivities}
                onClose={() => setIsEditModalOpen(false)}
                postAddActivityHandler={postAddActivityHandler}
                activityToEdit={activity} />
        </>
    )

}

export default React.memo(Activity);