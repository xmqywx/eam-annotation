import {connect} from 'react-redux'
import {handleError, showError, showNotification, showWarning} from '../../../../actions/uiActions'
import PartUsage from "./PartUsage";

// mapStateToProps 函数用于从 Redux store 中提取数据，将其转换为组件的 props
function mapStateToProps(state) {
    return {
        // 提取用户数据并传递给 PartUsage 组件
        userData: state.application.userData
    }
}

// 使用 connect 方法将 mapStateToProps 和一系列 action 创建函数连接到 PartUsage 组件
const PartUsageContainer = connect(mapStateToProps, {
        // 连接 showNotification, showError, showWarning, handleError 这些方法到 PartUsage 组件
        showNotification,
        showError,
        showWarning,
        handleError
    }
)(PartUsage);

export default PartUsageContainer;