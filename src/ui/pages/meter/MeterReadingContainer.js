import {connect} from 'react-redux'
import MeterReading from './MeterReading'
import {handleError, showError, showNotification} from '../../../actions/uiActions'

// 定义 mapStateToProps 函数，用于将 redux store 中的数据映射到 React 组件的 props
function mapStateToProps(state) {
    // 返回一个对象，包含 userData 属性，该属性从 redux state 的 application.userData 中获取
    return {
        userData: state.application.userData
    }
}

// 使用 connect 函数创建一个新的组件，称为 MeterReadingContainer
// connect 的第一个参数是 mapStateToProps 函数，用于连接 Redux store 中的数据到 MeterReading 组件
// 第二个参数是一个对象，包含三个 action 创建函数：showNotification, showError, handleError
// 这些函数将被作为 props 传递给 MeterReading 组件，以便在组件内部可以调用这些函数
const MeterReadingContainer = connect(mapStateToProps, {
        showNotification,
        showError,
        handleError
    }
)(MeterReading); // 将 MeterReading 组件作为 connect 的目标组件

export default MeterReadingContainer;