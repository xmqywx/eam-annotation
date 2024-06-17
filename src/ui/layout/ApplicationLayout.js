import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {setLayoutProperty} from '../../actions/uiActions'
import {Link} from 'react-router-dom'
import IconButton from '@mui/material/IconButton';
import Menu from 'mdi-material-ui/Menu'
import './ApplicationLayout.css'
import UserInfoContainer from './UserInfoContainer'
import {FileTree, FormatHorizontalAlignLeft, FormatHorizontalAlignRight} from 'mdi-material-ui';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import withStyles from '@mui/styles/withStyles';
import clsx from 'clsx';
import ScanUser from '../../ui/components/servicelogin/ScanUser';
import Footer from './Footer';
import GridTools from 'tools/GridTools';

const styles = {
    topBarLink: {
        color: 'white',
        textDecoration: 'none',
        fontWeight: '900',
        fontSize:'18px'
    },
    topBarSpan: {
        fontSize: '12px',
    }
}; // 定义顶部导航栏的样式

export default withStyles(styles)(function ApplicationLayout(props) {
    const { classes, applicationData, userData, scannedUser, updateScannedUser, handleError, showNotification } = props;

    const environment = applicationData.EL_ENVIR; // 获取应用环境变量

    const [menuCompacted, setMenuCompacted] = useState(false) // 定义状态变量menuCompacted，用于控制菜单是否压缩
    const [mobileMenuActive, setMobileMenuActive] = useState(false) // 定义状态变量mobileMenuActive，用于控制移动菜单是否激活
    const theme = useTheme(); // 获取当前主题
    const dispatch = useDispatch(); // 获取dispatch函数，用于发送Redux actions
    const showEqpTree = useSelector(state => state.ui.layout.showEqpTree) // 从Redux状态中获取showEqpTree值
    const equipment = useSelector(state => state.ui.layout.equipment) // 从Redux状态中获取equipment值
    const location = useLocation() // 获取当前URL的location对象

    const menuIconStyle = {
        color: "white",
        fontSize: 18
    } // 定义菜单图标的样式

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        searchParams.get('maximize') && setMenuCompacted(true);
    }, []) // 使用useEffect钩子监听URL参数变化，控制菜单压缩状态

    const topbar = (
        <div id="topbar" style={{backgroundColor: theme.palette.primary.main}}>
            <div id="topbar-left">
                <Link to="/" className={clsx(classes.topBarLink)}>EAM Light</Link>
                {environment !== 'PROD' && <span className={clsx(classes.topBarSpan)}>{environment}</span>}
            </div>

            <div id="topbar-right">
                <div id="menu-resize-btn">
                    <IconButton onClick={() => setMenuCompacted(!menuCompacted)} size="large">
                        {(menuCompacted) ? (
                            <FormatHorizontalAlignRight style={menuIconStyle}/>
                        ) : (
                            <FormatHorizontalAlignLeft style={menuIconStyle}/>
                        )}
                    </IconButton>
                </div>
                <div id="mobile-menu-btn">
                    <IconButton onClick={() => setMobileMenuActive(!mobileMenuActive)} size="large">
                        <Menu style={menuIconStyle}/>
                    </IconButton>
                </div>

                {equipment &&
                <div id="eqp-tree-btn">
                    <div style={{borderLeft: "1px solid rgba(255, 255, 255, 0.8)", height: 22}}/>
                    <IconButton
                        onClick={() => dispatch(setLayoutProperty('showEqpTree', !showEqpTree))}
                        size="large">
                        <FileTree style={menuIconStyle}/>
                    </IconButton>
                </div>}

                <UserInfoContainer/>
            </div>
        </div>
    ); // 定义顶部导航栏的JSX结构

    const isInsideIframe = window.self !== window.top; // 判断当前页面是否在iframe中
    const isInsideAllowedURL = document.referrer.match('^' + applicationData.EL_IFURL); // 判断来源URL是否允许
    const showTopBar = !(isInsideAllowedURL && isInsideIframe); // 根据条件判断是否显示顶部导航栏

    const loadAfterLogin = GridTools.getURLParameterByName("loadAfterLogin") === 'true'; // 判断URL参数中是否有loadAfterLogin=true

    const showScan = applicationData.serviceAccounts && applicationData.serviceAccounts.includes( userData.eamAccount.userCode) && (!scannedUser || !scannedUser.userCode)
        && <ScanUser
                updateScannedUser={updateScannedUser}
                showNotification={showNotification}
                handleError={handleError}
            />; // 根据条件判断是否显示扫描用户组件

    return (
        <div id="maindiv" className={(menuCompacted) ? 'SlimMenu' : ''} onClick={() => !menuCompacted && mobileMenuActive && setMobileMenuActive(false)}>
            {showTopBar && topbar}
            {showScan && loadAfterLogin ? null
                : <div id="layout-container" >
                    {props.children[0] && <div id="layout-menu-cover" className={(mobileMenuActive) ? 'active' : ''} onClick={(event) => event.stopPropagation()}>
                        {props.children[0]}
                    </div>}
                    <div id="layout-portlets-cover">
                        {props.children[1]}
                        <Footer applicationData={applicationData}/>
                    </div>
                </div>
            }

        </div>

    )
})