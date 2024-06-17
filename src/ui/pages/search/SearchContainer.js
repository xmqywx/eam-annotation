import {connect} from 'react-redux'
import Search from './Search'
import {handleError} from "../../../actions/uiActions";

// mapStateToProps 是一个函数，它定义了如何将 Redux store 中的状态映射到我们的组件的 props 上
const mapStateToProps = (state, ownProps) => {
  return {

  }
};

// 使用 connect 方法创建 SearchContainer 组件。
// connect 方法第一个参数是 mapStateToProps 函数，用于订阅 Redux store 的更新。
// 第二个参数是一个对象，其中包含可以被组件使用的动作创建函数。
const SearchContainer = connect(
  mapStateToProps, {
      handleError // 将 handleError 动作连接到 Search 组件，使其可以通过 props.handleError 调用
    }
)(Search);

export default SearchContainer

