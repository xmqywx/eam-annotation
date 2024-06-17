import React from 'react';
import EISPanel from 'eam-components/dist/ui/components/panel';
import EAMAutocomplete from 'eam-components/dist/ui/components/inputs-ng/EAMAutocomplete';
import WSMeters from "../../../tools/WSMeters";
import { createOnChangeHandler } from "eam-components/dist/ui/components/inputs-ng/tools/input-tools";

class MeterReadingSearch extends React.Component {
    render() { 
        // 从props中解构出parentProps，用于后续访问父组件传递的属性和方法
        const {parentProps} = this.props;
        // 从parentProps中解构出searchCriteria，这是一个对象，包含搜索条件的各种参数
        const {searchCriteria} = parentProps;

        // 定义一个常量idPrefix，用于给组件内的元素ID添加前缀，以确保ID的唯一性
        const idPrefix = "EAMID_MeterReadingSearch_";

        return (
            // 使用EISPanel组件构建一个面板，设置标题为"SEARCH PANEL"，并设置始终展开
            <EISPanel heading="SEARCH PANEL" alwaysExpanded={true}>
                <div style={{width: "100%", marginTop: 0}}>
                    {/* 使用EAMAutocomplete组件创建一个自动完成输入框，用于输入和选择"Meter Code" */}
                    <EAMAutocomplete
                        label={"Meter Code"}  // 设置输入框的标签为"Meter Code"
                        value={searchCriteria.meterCode}  // 将输入框的值绑定到searchCriteria对象的meterCode属性
                        autocompleteHandler={WSMeters.autocompleteMeterCode}  // 设置自动完成的处理函数，用于获取建议的meterCode
                        onChange={createOnChangeHandler("meterCode", "meterDesc", null, parentProps.updateSearchProperty, parentProps.onChangeMeterCode)}  // 设置输入值变化时的处理函数
                        desc={searchCriteria.meterDesc}  // 设置输入框的描述文本为searchCriteria对象的meterDesc属性
                        barcodeScanner  // 启用条形码扫描器功能
                        id={`${idPrefix}METERCODE`}
                    />
                    {/* 使用EAMAutocomplete组件创建另一个自动完成输入框，用于输入和选择"Equipment Code" */}
                    <EAMAutocomplete
                        label={"Equipment Code"}  // 设置输入框的标签为"Equipment Code"
                        value={searchCriteria.equipmentCode}  // 将输入框的值绑定到searchCriteria对象的equipmentCode属性
                        autocompleteHandler={WSMeters.autocompleteMeterEquipment}  // 设置自动完成的处理函数，用于获取建议的equipmentCode
                        onChange={createOnChangeHandler("equipmentCode", "equipmentDesc", null, parentProps.updateSearchProperty, parentProps.onChangeEquipmentCode)}  // 设置输入值变化时的处理函数
                        desc={searchCriteria.equipmentDesc}  // 设置输入框的描述文本为searchCriteria对象的equipmentDesc属性
                        barcodeScanner  // 启用条形码扫描器功能
                        id={`${idPrefix}EQUIPMENTCODE`}
                    />
                </div>
            </EISPanel>
        );
    }
}

export default MeterReadingSearch;