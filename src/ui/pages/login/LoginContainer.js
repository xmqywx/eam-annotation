/**
 *  Redux 的 connect 函数创建的。容器组件的主要作用是连接 React 组件（在这个例子中是 Login 组件）到 Redux store，使得组件可以访问到 Redux 管理的状态（state）和操作状态的函数（actions）
 */
// 引入 connect 函数，用于连接 React 组件和 Redux store
import {connect} from 'react-redux'
// 引入 Login 组件，这是一个展示组件，负责 UI 的呈现
import Login from './Login'
// 引入需要用到的 action creators
import {handleError, showError, showNotification} from '../../../actions/uiActions'
import {updateInforContext} from "../../../actions/inforContextActions";

// mapStateToProps 是一个函数，它定义了如何从 Redux store 的 state 中提取数据并传递给组件的 props
function mapStateToProps(state) {
    return {
        inforContext: state.inforContext // 从 state 中提取 inforContext 并作为 prop 
    }
}

// connect 函数用于创建容器组件。第一个参数是 mapStateToProps，定义了组件订阅哪些 store 的数据
// 第二个参数是一个对象，包含了组件可以用来修改 store 的 action creators
const LoginContainer = connect(mapStateToProps, {
        showNotification,
        showError,
        handleError,
        updateInforContext
    }
)(Login) // 这里将 Login 组件连接到 Redux store

export default LoginContainer
