import {connect} from 'react-redux'  // 从'react-redux'库中导入connect函数，用于连接React组件与Redux store
import MeterReadingWO from './MeterReadingWO'  // 导入MeterReadingWO组件，用于展示水表读数的工作订单
import {handleError, showError, showNotification} from '../../../../actions/uiActions'  // 导入uiActions中的三个方法：处理错误、显示错误和显示通知

// 定义mapStateToProps函数，用于从Redux store中提取数据并传递给React组件
function mapStateToProps(state) {
    return {
        userData: state.application.userData  // 从state中获取application模块下的userData，并将其作为props传递给组件
    }
}

// 使用connect函数连接Redux store和MeterReadingWO组件，同时绑定action creators
const MeterReadingContainerWO = connect(mapStateToProps, {
        showNotification,  // 绑定showNotification action，用于显示通知
        showError,  // 绑定showError action，用于显示错误信息
        handleError  // 绑定handleError action，用于处理错误
    }
)(MeterReadingWO);  // 将上述配置应用到MeterReadingWO组件

export default MeterReadingContainerWO;
