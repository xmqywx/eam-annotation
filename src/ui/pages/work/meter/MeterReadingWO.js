import React from 'react';
import WSMeters from '../../../../tools/WSMeters';
import MeterReadingContent from "../../meter/MeterReadingContent";
import EAMConfirmDialog from "../../../components/EAMConfirmDialog";
import SimpleEmptyState from 'eam-components/dist/ui/components/emptystates/SimpleEmptyState';
import BlockUi from 'react-block-ui';

/**
 * Meter Readings inside the work order number (workorder).
 * Receive as properties the work order
 * 在工作订单中的表计读数组件。
 * 通过属性接收工作订单信息
 */
const defaultMessageCreate = 'Are you sure you want to create this reading?'; // 默认创建读数时的确认消息
const rollOverMessageCreate = 'Value is less than the Last Reading, which indicates the meter has rolled over. Is this correct?'; // 表计回滚时的确认消息

class MeterReadingWO extends React.Component {

    state = {
        blocking: true, // 控制BlockUi组件是否激活，阻塞用户界面
        meterReadings: [], // 存储从后端获取的表计读数数组
        dialogOpen: false, // 控制确认对话框是否打开
        createMessage: defaultMessageCreate // 当前显示在确认对话框中的消息
    };

    //Meter reading to be saved
    meterReading = {}; // 将要保存的表计读数对象

    componentWillMount() {
        //If there is work order, then read
        if (this.props.equipment) {
            this.loadMeterReadings(this.props.equipment); // 如果有设备信息，则加载表计读数
        }
    }

    componentWillReceiveProps(nextProps) {
        //Reload if the work order change
        if (nextProps.equipment && nextProps.equipment !== this.props.equipment) {
            this.loadMeterReadings(nextProps.equipment); // 如果设备信息改变，则重新加载表计读数
        } else if (!nextProps.equipment) {
            //No work order, so clear readings
            this.setState(() => ({meterReadings: []})); // 如果没有设备信息，则清空读数数组
        }
    }


    saveHandler = (meterReading, isRollover) => {
        this.meterReading = meterReading; // 设置将要保存的表计读数
        this.setState(() => ({
            dialogOpen: true, // 打开确认对话框
            createMessage: isRollover ? rollOverMessageCreate : defaultMessageCreate // 根据是否回滚设置对话框消息
        }));
    };


    /**
     * This method will create the meter reading after the check of rollover
     * @param meterReading Meter reading to be created
     * 创建表计读数的方法，会在回滚检查后调用
     */
    createMeterReadingHandler = () => {
        //Blocking
        this.setState(() => ({blocking: true})); // 激活用户界面阻塞
        //Call service to create the reading
        WSMeters.createMeterReading(this.meterReading).then(response => {
            //Close the dialog
            this.closeDialog(); // 关闭对话框
            //Reload the data
            this.loadMeterReadings(this.props.equipment); // 重新加载表计读数
            //Message
            this.props.showNotification('Meter Reading created successfully'); // 显示创建成功的通知
        }).catch(error => {
            this.props.handleError(error); // 处理错误
            this.setState(() => ({blocking: false})); // 解除用户界面阻塞
        });
    };

    /**
     * To load the meter reading
     * 加载表计读数的方法
     */
    loadMeterReadings = (equipment) => {
        //Loading
        this.setState(() => ({blocking: true})); // 激活用户界面阻塞
        WSMeters.getReadingsByEquipment(equipment).then(response => {
            //Readings
            const meterReadings = response.body.data ? response.body.data : [];
            //Set readings
            this.setState(() => ({meterReadings})); // 设置表计读数数组
            //Not Loading
            this.setState(() => ({blocking: false})); // 解除用户界面阻塞
        }).catch(error => {
            this.props.handleError(error); // 处理错误
            this.setState(() => ({blocking: false})); // 解除用户界面阻塞
        });
    };

    closeDialog = () => {
        this.setState(() => ({
            dialogOpen: false, // 关闭对话框
        }));
    };

    renderMetersList = () => {
        const { disabled } = this.props;

        //Properties to pass to the children
        const parentProps = {
            saveHandler: this.saveHandler // 将saveHandler方法传递给子组件
        };

        const meterReadings = this.state.meterReadings; // 从state中获取表计读数数组
        //There are meter readings
        return (
            meterReadings.map((reading, index) => {
                return (
                    <div key={`meter_${index}`}>
                        <MeterReadingContent
                            reading={reading}
                            parentProps={parentProps}
                            disabled={disabled} />
                    </div>);
            }));
    };

    render() {
        const { blocking, meterReadings } = this.state;
        const isEmptyState = !blocking && meterReadings.length === 0; // 判断是否显示空状态组件
        return (
            isEmptyState
            ? (
                <SimpleEmptyState message="No Meter Readings to show"/> // 显示没有读数的空状态
            )
            : (
                <BlockUi blocking={blocking} style={{width: "100%", marginTop: 0}}  // 显示表计读数列表和确认对话框
                >
                    {this.renderMetersList()}
                    <EAMConfirmDialog isOpen={this.state.dialogOpen} title={`Create Meter Reading`}
                                    message={this.state.createMessage} cancelHandler={this.closeDialog}
                                    confirmHandler={this.createMeterReadingHandler}
                                    blocking={this.state.blocking}
                    />
                </BlockUi>
            )
        )
    }
}

export default MeterReadingWO;