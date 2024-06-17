import React, {Component} from 'react';
import {Account, Logout} from "mdi-material-ui"
import {IconButton} from "@mui/material";
import { logout } from "../../AuthWrapper";

export default class UserInfo extends Component { // 定义并导出UserInfo类

    userInfoStyle = { // 定义用户信息区域的样式
       color: "rgba(255, 255, 255, 0.8)",
       flexGrow: 1,
       height: 48,
       display: "flex",
       alignItems: "center",
       justifyContent: 'flex-end'
   }

   accountIcon = { // 定义账户图标的样式
       fontSize: 20,
       margin: 5
   }

   logoutIcon = { // 定义登出图标的样式
       color: "rgba(255, 255, 255, 0.8)",
       paddingRight: 9,
       fontSize: 18,
       lineHeight: '22px'
   }

   separatorStyle = { // 定义分隔线的样式
       borderLeft: "1px solid rgba(255, 255, 255, 0.8)",
       width: 1,
       height: 22,
       marginLeft: 14
   }

    logoutHandler() { // 定义登出处理函数
        if (this.props.scannedUser) { // 如果存在扫描的用户
            this.props.updateScannedUser(null); // 清除扫描的用户信息
            return; // 提前返回，不继续执行后面的代码
        }
        if (process.env.REACT_APP_LOGIN_METHOD === 'STD') { // 如果登录方式为标准方式
            this.props.updateInforContext(null); // 清除信息上下文
            this.props.updateApplication({userData: null}) // 更新应用程序状态，清除用户数据
            sessionStorage.removeItem('inforContext'); // 从会话存储中移除信息上下文
        }
        logout(); // 调用logout方法执行登出
    }

    render() {
        const { scannedUser } = this.props;

        const usernameDisplay = this.props.userData.eamAccount.userCode + (scannedUser ? ` (${scannedUser.userCode})` : ''); // 构造用户名显示字符串

        return (
            <div style={this.userInfoStyle} //应用用户信息区域的样式
            >
                <Account style={this.accountIcon}/>
                <span className='user-name'>{usernameDisplay}</span>
                <span style={this.separatorStyle}/>
                <IconButton
                    onClick={this.logoutHandler.bind(this)} // 绑定点击事件到logoutHandler函数
                    style={this.logoutIcon} 
                    size="large">
                     {/*显示登出图标 */}
                    <Logout style={{fontSize: 20}}/>
                </IconButton>
            </div>
        );
    }
}