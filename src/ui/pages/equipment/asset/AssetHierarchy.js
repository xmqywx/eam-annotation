import React from 'react';
import WSEquipment from "../../../../tools/WSEquipment";
import EAMAutocomplete from 'eam-components/dist/ui/components/inputs-ng/EAMAutocomplete';
import Dependency from '../components/Dependency';
import EAMUDF from 'ui/components/userdefinedfields/EAMUDF';
import { onChangeDependentInput, isDependencySet, COST_ROLL_UP_CODES, updateCostRollUpProperty } from '../EquipmentTools';

// 定义依赖关系的键
const DEPENDENCY_KEYS = {
    asset: 'hierarchyAssetDependent',  // 资产依赖键
    position: 'hierarchyPositionDependent',  // 位置依赖键
    primarySystem: 'hierarchyPrimarySystemDependent'  // 主系统依赖键
}

// 定义资产层级组件
const AssetHierarchy = (props) => {
    const { equipment, updateEquipmentProperty, register, readOnly, showWarning } = props;

    // 为依赖输入准备依赖项数组
    const renderDependenciesForDependencyInputs = [
        equipment[DEPENDENCY_KEYS.asset],
        equipment[DEPENDENCY_KEYS.position],
        equipment[DEPENDENCY_KEYS.primarySystem],
    ];

    return (
        <React.Fragment>  // 使用React.Fragment包裹组件，避免额外的DOM元素

            <EAMUDF
                {...register('udfchar13','userDefinedFields.udfchar13')}/>  // 用户定义字段组件，注册字段udfchar13

            <EAMUDF
                {...register('udfchar11','userDefinedFields.udfchar11')}/>  // 用户定义字段组件，注册字段udfchar11

            <EAMAutocomplete
                {...register('parentasset', 'hierarchyAssetCode', 'hierarchyAssetDesc', 'hierarchyAssetOrg',
                value => {
                    onChangeDependentInput(
                        value,
                        DEPENDENCY_KEYS.asset,
                        DEPENDENCY_KEYS,
                        equipment,
                        updateEquipmentProperty,
                        showWarning
                    );
                    updateCostRollUpProperty(
                        COST_ROLL_UP_CODES.asset,
                        value,
                        updateEquipmentProperty
                    );
                })}
                barcodeScanner  // 启用条形码扫描器
                autocompleteHandler={WSEquipment.autocompleteAssetParent}  // 设置自动完成处理函数
                renderDependencies={renderDependenciesForDependencyInputs}  // 设置渲染依赖
                endAdornment={  // 设置尾部装饰组件
                    <Dependency
                        updateProperty={updateEquipmentProperty}
                        value={equipment[DEPENDENCY_KEYS.asset]}
                        valueKey={DEPENDENCY_KEYS.asset}
                        disabled={!equipment.hierarchyAssetCode}
                        dependencyKeysMap={DEPENDENCY_KEYS}
                    />
                }
            />
            
            <EAMAutocomplete
                {...register('position', 'hierarchyPositionCode', 'hierarchyPositionDesc', 'hierarchyPositionOrg',
                value => {
                    onChangeDependentInput(
                        value,
                        DEPENDENCY_KEYS.position,
                        DEPENDENCY_KEYS,
                        equipment,
                        updateEquipmentProperty,
                        showWarning
                    );
                    updateCostRollUpProperty(
                        COST_ROLL_UP_CODES.position,
                        value,
                        updateEquipmentProperty
                    );
                })}
                barcodeScanner  // 启用条形码扫描器
                autocompleteHandler={WSEquipment.autocompletePositionParent}  // 设置自动完成处理函数
                renderDependencies={renderDependenciesForDependencyInputs}  // 设置渲染依赖
                endAdornment={  // 设置尾部装饰组件
                    <Dependency
                        updateProperty={updateEquipmentProperty}
                        value={equipment[DEPENDENCY_KEYS.position]}
                        valueKey={DEPENDENCY_KEYS.position}
                        disabled={!equipment.hierarchyPositionCode}
                        dependencyKeysMap={DEPENDENCY_KEYS}
                    />
                }
            />
            
            <EAMAutocomplete
                {...register('primarysystem', 'hierarchyPrimarySystemCode', 'hierarchyPrimarySystemDesc', 'hierarchyPrimarySystemOrg',
                value => {
                    onChangeDependentInput(
                        value,
                        DEPENDENCY_KEYS.primarySystem,
                        DEPENDENCY_KEYS,
                        equipment,
                        updateEquipmentProperty,
                        showWarning
                    );
                    updateCostRollUpProperty(
                        COST_ROLL_UP_CODES.primarySystem,
                        value,
                        updateEquipmentProperty
                    );
                })}
                barcodeScanner  // 启用条形码扫描器
                autocompleteHandler={WSEquipment.autocompletePrimarySystemParent}  // 设置自动完成处理函数
                renderDependencies={renderDependenciesForDependencyInputs}  // 设置渲染依赖
                endAdornment={  // 设置尾部装饰组件
                    <Dependency
                        updateProperty={updateEquipmentProperty}
                        value={equipment[DEPENDENCY_KEYS.primarySystem]}
                        valueKey={DEPENDENCY_KEYS.primarySystem}
                        disabled={!equipment.hierarchyPrimarySystemCode}
                        dependencyKeysMap={DEPENDENCY_KEYS}
                    />
                }
            />
                
            <EAMAutocomplete
                {...register('location', 'hierarchyLocationCode', 'hierarchyLocationDesc')}
                autocompleteHandler={WSEquipment.autocompleteLocation}  // 设置自动完成处理函数
                disabled={readOnly || isDependencySet(equipment, DEPENDENCY_KEYS)}  // 根据只读状态或依赖设置禁用输入
            />
        </React.Fragment>
    )
}

export default AssetHierarchy;
