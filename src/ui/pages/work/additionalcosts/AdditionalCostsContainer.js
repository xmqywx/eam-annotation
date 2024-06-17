import { connect } from 'react-redux';
// 引入 uiActions 中的三个方法：handleError, showError, showNotification
// handleError - 用于处理错误
// showError - 用于显示错误信息
// showNotification - 用于显示通知
import { handleError, showError, showNotification } from '../../../../actions/uiActions';
import AdditionalCosts from "./AdditionalCosts";

// mapStateToProps 函数用于从 Redux store 中提取数据并将其作为 props 传递给 React 组件
function mapStateToProps(state) {
    // 返回一个对象，包含 userData 属性，该属性从 Redux store 的 application.userData 中获取
    return {
        userData: state.application.userData
    }
}

// 使用 connect 方法创建 AdditionalCostsContainer 组件
// connect 方法第一个参数是 mapStateToProps，用于指定如何从 Redux store 提取数据
// 第二个参数是一个对象，包含三个 action 创建函数，用于在组件中可以被调用以触发对应的 actions
const AdditionalCostsContainer = connect(mapStateToProps, {
        showNotification, // 显示通知的函数
        showError,        // 显示错误的函数
        handleError       // 处理错误的函数
    }
)(AdditionalCosts); // 将这些功能连接到 AdditionalCosts 组件

export default AdditionalCostsContainer;