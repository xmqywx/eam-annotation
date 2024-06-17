import React from 'react';
import {useEffect} from "react"
import { useSelector, useDispatch } from "react-redux";
import {Route, Switch} from 'react-router-dom';
import EquipmentTree from './components/tree/EquipmentTree'
import Position from "./position/Position";
import Asset from "./asset/Asset";
import System from "./system/System";
import Split from 'react-split'
import Location from './location/Location';
import Workorder from '../work/Workorder';
import { setLayoutProperty } from 'actions/uiActions';
import InstallEqpContainer from './installeqp/InstallEqpContainer';

const Equipment = props => {

    const showEqpTree = useSelector(state =>  state.ui.layout.showEqpTree);  // 从 Redux 状态中获取 showEqpTree，决定是否显示设备树
    const equipment = useSelector(state =>  state.ui.layout.equipment);  // 从 Redux 状态中获取 equipment，存储设备信息
    const renderEqpTree = equipment && showEqpTree  // 计算是否渲染设备树
    const dispatch = useDispatch();  // 获取 dispatch 方法，用于发送 Redux 动作
    const setLayoutPropertyConst = (...args) => dispatch(setLayoutProperty(...args));  // 创建函数，用于发送设置布局属性的动作

    useEffect(() => {
        return () => {
                    setLayoutPropertyConst('equipment', null);  // 组件卸载时，清除 equipment 状态
                    setLayoutPropertyConst('showEqpTree', false);  // 组件卸载时，设置 showEqpTree 为 false
                    setLayoutPropertyConst('eqpTreeMenu', null);}  // 组件卸载时，清除 eqpTreeMenu 状态
    }, [])

    return (
        <div className="entityContainer">

            <Split sizes={renderEqpTree ? [25, 75] : [0, 100]}  // 根据是否渲染设备树设置分割面板的大小
                    minSize={renderEqpTree ? [120, 200] : [0, 300]}  // 根据是否渲染设备树设置分割面板的最小尺寸
                    gutterSize={renderEqpTree ? 5 : 0}  // 根据是否渲染设备树设置分割面板的沟槽大小
                    gutterAlign="center"  // 设置分割面板的沟槽对齐方式为居中
                    snapOffset={0}  // 设置分割面板的捕捉偏移量为 0
                    style={{display: "flex", width: "100%"}}  // 设置分割面板的样式
            >

                <div style={{height: "100%", flexDirection: "column"}}>
                    {renderEqpTree && <EquipmentTree />}
                </div>

                {/* 设置右侧面板的样式 */}
                <div style={{backgroundColor: "white", height: "100%", width: "100%"}}>
                    {/* 使用 Switch 组件来选择显示的路由 */}
                    <Switch>
                        <Route path={"/asset/:code(.+)?"}
                                component={Asset}/>

                        <Route path={"/position/:code(.+)?"}
                                component={Position}/>

                        <Route path={"/system/:code(.+)?"}
                                component={System}/>

                        <Route path={"/location/:code(.+)?"}
                                component={Location}/>

                        <Route path="/workorder/:code(.+)?"
                                component={Workorder}/>

                        <Route path="/installeqp"
                                component={InstallEqpContainer}/>
                    </Switch>
                </div>

            </Split>

        </div>
    )
    

}

export default Equipment;