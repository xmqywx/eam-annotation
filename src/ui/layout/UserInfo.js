import React, { Component } from 'react';
import {Account, Logout} from "mdi-material-ui"
import {IconButton} from "@material-ui/core";

export default class UserInfo extends Component {

    userInfoStyle = {
       color: "rgba(255, 255, 255, 0.8)",
       width: "100%",
       height: 48,
       display: "flex",
       alignItems: "center",
       justifyContent: 'flex-end',
       backgroundColor: "rgba(40, 40, 40, 0.06)"
   }

   accountIcon = {
       fontSize: 20,
       margin: 5
   }

   logoutIcon = {
       color: "rgba(255, 255, 255, 0.8)",
       height: 22,
       paddingLeft: 9,
       paddingRight: 9,
       borderLeft: "1px solid rgba(255, 255, 255, 0.8)",
       marginLeft: 14,
       fontSize: 18,
       lineHeight: '22px'
   }

    logoutHandler() {
        if (process.env.REACT_APP_LOGIN_METHOD === 'STD') {
            this.props.updateInforContext(null);
            sessionStorage.removeItem('inforContext');
        }
        if (process.env.REACT_APP_LOGIN_METHOD === 'CERNSSO') {
            window.location.href = "https://espace.cern.ch/authentication/_layouts/15/SignOut.aspx";
        }
    }

    render() {
        return (
            <div style={this.userInfoStyle}>
                <Account style={this.accountIcon}/>
                {this.props.userData.eamAccount.userCode}
                <IconButton onClick={this.logoutHandler.bind(this)}>
                    <Logout style={{fontSize: 20}}/>
                </IconButton>
            </div>
        )
    }
}