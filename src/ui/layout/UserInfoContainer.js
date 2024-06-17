import {connect} from 'react-redux'
import UserInfo from './UserInfo'
import {updateInforContext} from "../../actions/inforContextActions";
import {updateApplication} from "../../actions/applicationActions";
import { updateScannedUser } from "../../actions/scannedUserActions";

// mapStateToProps函数，用于将Redux store中的数据映射到React组件的props
const mapStateToProps = (state) => {
    return {
        userData: state.application.userData,  // 映射application中的userData到组件的props
        scannedUser: state.scannedUser,  // 映射scannedUser到组件的props
    }
};

// 使用connect函数连接Redux store与UserInfo组件，同时绑定action creators
const UserInfoContainer = connect(mapStateToProps, {
    updateInforContext,  // 绑定updateInforContext动作到props
    updateApplication,  // 绑定updateApplication动作到props
    updateScannedUser,  // 绑定updateScannedUser动作到props
})(UserInfo);

export default UserInfoContainer
