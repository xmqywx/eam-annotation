import { connect } from 'react-redux';
import { handleError, showNotification } from "../../actions/uiActions";
import { updateScannedUser } from '../../actions/scannedUserActions';
import ApplicationLayout from './ApplicationLayout';

const mapStateToProps = (state) => { // 定义 mapStateToProps 函数，用于从 Redux state 中提取数据并传递给 React 组件
    return {
        applicationData: state.application.applicationData, // 从 state 中提取 applicationData，并将其作为 props 传递给组件
        scannedUser: state.scannedUser, // 从 state 中提取 scannedUser，并将其作为 props 传递给组件
        userData: state.application.userData // 从 state 中提取 userData，并将其作为 props 传递给组件
    }
};

const ApplicationLayoutContainer = connect(mapStateToProps, {updateScannedUser, showNotification, handleError})(ApplicationLayout);

export default ApplicationLayoutContainer;
