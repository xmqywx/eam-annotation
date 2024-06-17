// 导入react-redux的connect函数，用于连接React组件与Redux store
import {connect} from 'react-redux'
// 导入WorkorderToolbar组件，这是一个展示组件，用于显示工单的工具栏
import WorkorderToolbar from './WorkorderToolbar'

// mapStateToProps函数用于从Redux store中提取数据，并将这些数据作为props传递给连接的组件
const mapStateToProps = (state, ownProps) => {
  return {
      // 从Redux store中提取applicationData，这通常包含了应用程序级别的状态或配置数据
      applicationData: state.application.applicationData,
      // 从Redux store中提取screencode，这是工单屏幕的代码，可能用于控制屏幕的显示或行为
      screencode: state.application.userData.workOrderScreen.screenCode
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
  }
};

// 使用connect函数连接WorkorderToolbar组件与Redux store
// mapStateToProps将store中的数据映射到组件的props
// mapDispatchToProps将dispatch函数映射到组件的props
const WorkorderToolbarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(WorkorderToolbar);

export default WorkorderToolbarContainer
