/**
 * 主要的 React 组件，设置应用的路由和主题。它处理用户认证、加载状态，并路由到应用的不同部分，如设备搜索、工单搜索等。
 */

// 引入 CSS 样式文件
import './Eamlight.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// 引入 React 和相关库
import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';

// 引入应用内部的组件
import ApplicationLayoutContainer from './ui/layout/ApplicationLayoutContainer';
import EamlightMenuContainer from './ui/layout/menu/EamlightMenuContainer';
import WorkorderSearchContainer from './ui/pages/work/search/WorkorderSearchContainer';
import PartSearchContainer from './ui/pages/part/search/PartSearchContainer';
import AssetSearchContainer from './ui/pages/equipment/asset/search/AssetSearchContainer';
import PositionSearchContainer from './ui/pages/equipment/position/search/PositionSearchContainer';
import SystemSearchContainer from './ui/pages/equipment/system/search/SystemSearchContainer';
import LocationSearchContainer from './ui/pages/equipment/location/search/LocationSearchContainer';
import BlockUi from 'react-block-ui';
import InfoPage from './ui/components/infopage/InfoPage';
import Part from "./ui/pages/part/Part";
import SearchContainer from "./ui/pages/search/SearchContainer";
import ReplaceEqpContainer from "./ui/pages/equipment/replaceeqp/ReplaceEqpContainer";
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import EquipmentRedirect from "./ui/pages/equipment/EquipmentRedirect";
import MeterReadingContainer from './ui/pages/meter/MeterReadingContainer';
import LoginContainer from "./ui/pages/login/LoginContainer";
import Grid from "./ui/pages/grid/Grid";
import EqpTree from "./ui/components/eqtree/EqpTree";
import Themes from 'eam-components/dist/ui/components/theme';
import config from './config';
import Equipment from 'ui/pages/equipment/Equipment';
import Report from 'ui/pages/report/Report';
import ReleaseNotesPage from "./ui/pages/releaseNotes/ReleaseNotes";
import TestContainer from 'ui/pages/test/testContainer';

export const releaseNotesPath = "/releasenotes";

class Eamlight extends Component {
// 定义 BlockUI 组件的样式
    blockUiStyle = {
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    };

    blockUiStyleDiv = {
        display: "flex",
        height: 60, alignItems: "flex-end"
    };

    render() {
        // Display login screen
        // 如果用户未登录且登录方式为标准方式，则显示登录界面
        if (!this.props.inforContext && process.env.REACT_APP_LOGIN_METHOD === 'STD') {
            return (
              <ThemeProvider theme={Themes[config.theme.DEFAULT]}>
                <LoginContainer/>
              </ThemeProvider>
            )
        }

        // 如果用户数据存在但账户无效或屏幕布局加载失败，则显示错误信息页面
        if (this.props.userData) {
            if (this.props.userData.invalidAccount) {
                return (
                    <InfoPage
                        title="Access Denied"
                        message="You don't have valid EAM account. "
                    />
                );
            }
            if (this.props.userData.screenLayoutFetchingFailed) {
                return (
                    <InfoPage
                        title="Unable to initialize EAM Light"
                        message="Something went wrong while loading the screen layouts, please retry or contact the support at eam.support@cern.ch."
                    />
                );
            }
        }

        // User data still not there, display loading page
        // 如果用户数据或应用数据不存在，显示加载界面
        if (!this.props.userData || !this.props.applicationData) {
            this.props.initializeApplication();
            return (
                <BlockUi tag="div" blocking={true} style={this.blockUiStyle}>
                    <div style={this.blockUiStyleDiv}>Loading EAM Light ...</div>
                </BlockUi>
            )
        }

        // 定义路由路径正则表达式
        const eqpRegex = ["/asset", "/position", "/system", "/location", "/workorder", "/installeqp"].map(e => `${e}/:code(.+)?`)

        // 选择主题
        const selectedTheme = Themes[config.theme[this.props.applicationData.EL_ENVIR] || config.theme.DEFAULT] || Themes.DANGER;

        // Render real application once user data is there and user has an EAM account
        // 渲染应用主界面
        return (
               <StyledEngineProvider injectFirst>
                     <ThemeProvider theme={selectedTheme}>
                         <Router basename={process.env.PUBLIC_URL}>
                            <Switch>
                                   <Route path="/eqptree" component={EqpTree}/>

                                   <ApplicationLayoutContainer>
                                          <EamlightMenuContainer/>
                                          <div style={{height: "calc(100% - 30px)"}}>
                                                 <Route exact path="/"
                                                        component={SearchContainer}/>

                                                 <Route path="/wosearch"
                                                        component={WorkorderSearchContainer}/>

                                                 <Route path="/part/:code?"
                                                        component={Part}/>

                                                 <Route path="/partsearch"
                                                 component={PartSearchContainer}/>

                                                 <Route path="/assetsearch"
                                                        component={AssetSearchContainer}/>

                                                 <Route path="/positionsearch"
                                                        component={PositionSearchContainer}/>

                                                 <Route path="/systemsearch"
                                                        component={SystemSearchContainer}/>

                                                 <Route path="/locationsearch"
                                                        component={LocationSearchContainer}/>

                                                 <Route path="/equipment/:code?"
                                                        component={EquipmentRedirect}/>

                                                 <Route path="/replaceeqp"
                                                        component={ReplaceEqpContainer}/>

                                                 <Route path="/meterreading"
                                                        component={MeterReadingContainer}/>

                                                 <Route path="/grid"
                                                        component={Grid}/>

                                                 <Route path="/report"
                                                        component={Report}/>

                                                 <Route path="/test"
                                                        component={TestContainer}/>

                                                 <Route path={eqpRegex}
                                                        component={Equipment}/>

                                                 <Route path={releaseNotesPath}
                                                        component={ReleaseNotesPage}/>
                                          </div>
                                   </ApplicationLayoutContainer>
                            </Switch>
                         </Router>
                    </ThemeProvider>
               </StyledEngineProvider>
        );
    }
}

export default Eamlight
