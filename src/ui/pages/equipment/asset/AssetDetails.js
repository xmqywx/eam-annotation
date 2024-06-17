import React from 'react';
import WSEquipment from "../../../../tools/WSEquipment";
import WS from "../../../../tools/WS";
import EAMDatePicker from 'eam-components/dist/ui/components/inputs-ng/EAMDatePicker';
import EAMAutocomplete from 'eam-components/dist/ui/components/inputs-ng/EAMAutocomplete';
import EAMSelect from 'eam-components/dist/ui/components/inputs-ng/EAMSelect';
import EAMTextField from 'eam-components/dist/ui/components/inputs-ng/EAMTextField';
import { onCategoryChange } from '../EquipmentTools';

// 定义资产详情组件，接收props作为参数
const AssetDetails = (props) => {
    
    const { equipment, updateEquipmentProperty, register } = props; // 从props中解构出equipment, updateEquipmentProperty, register

    return (
        <React.Fragment> {/* 使用React.Fragment包裹组件，避免额外的DOM元素 */}

            <EAMAutocomplete
                {...register('class', 'classCode', 'classDesc')} // 使用register函数注册字段，用于绑定和初始化
                autocompleteHandler={WS.autocompleteClass} // 设置自动完成处理函数，用于类的自动完成
                autocompleteHandlerParams={['OBJ']} // 设置自动完成处理函数的参数
            />

            <EAMAutocomplete
                {...register('category', 'categoryCode', 'categoryDesc', null,
                             categoryCode => onCategoryChange(categoryCode, updateEquipmentProperty))
                } // 使用register函数注册字段，并设置类别变更时的回调函数
                autocompleteHandler={WSEquipment.autocompleteEquipmentCategory} // 设置自动完成处理函数，用于设备类别的自动完成
                autocompleteHandlerParams={[equipment.classCode]} // 设置自动完成处理函数的参数，依赖于设备的类代码
            />

            <EAMAutocomplete
                {...register('costcode', 'costCode', 'costCodeDesc')} // 使用register函数注册成本代码字段
                autocompleteHandler={WSEquipment.autocompleteCostCode}  // 设置自动完成处理函数，用于成本代码的自动完成
                />

            <EAMDatePicker
                {...register('commissiondate', 'comissionDate')} // 使用register函数注册投入使用日期字段
            />

            <EAMAutocomplete
                {...register('assignedto', 'assignedTo', 'assignedToDesc')} // 使用register函数注册分配给字段
                autocompleteHandler={WS.autocompleteEmployee} // 设置自动完成处理函数，用于员工的自动完成
            />

            <EAMSelect
                {...register('criticality', 'criticality')} // 使用register函数注册关键性字段
                autocompleteHandler={WSEquipment.getEquipmentCriticalityValues} // 设置获取关键性值的函数
            />

            <EAMAutocomplete
                {...register('manufacturer', 'manufacturerCode', 'manufacturerDesc')} // 使用register函数注册制造商字段
                autocompleteHandler={WSEquipment.autocompleteManufacturer} // 设置自动完成处理函数，用于制造商的自动完成
            />

            <EAMTextField
                {...register('serialnumber', 'serialNumber')} // 使用register函数注册序列号字段
            />

            <EAMTextField
                {...register('model', 'model')} // 使用register函数注册模型字段
            />

            <EAMAutocomplete
                {...register('part', 'partCode', 'partDesc')} // 使用register函数注册部件代码字段
                autocompleteHandler={WSEquipment.autocompleteEquipmentPart} // 设置自动完成处理函数，用于设备部件的自动完成
                link={() => equipment.partCode ? "/part/" + equipment.partCode: null} // 设置链接，如果部件代码存在，则生成链接到部件的URL
            />

            <EAMAutocomplete
                {...register('store', 'storeCode', 'storeDesc')} // 使用register函数注册库存代码字段
                autocompleteHandler={WSEquipment.autocompleteEquipmentStore} // 设置自动完成处理函数，用于设备库存的自动完成
                disabled={true} // 设置为禁用状态
            />

            <EAMAutocomplete
                {...register('bin', 'bin', 'binDesc')} // 使用register函数注册仓位字段
                autocompleteHandler={WSEquipment.autocompleteEquipmentBin} // 设置自动完成处理函数，用于设备仓位的自动完成
                autocompleteHandlerParams={[equipment.storeCode]} // 设置自动完成处理函数的参数，依赖于设备的库存代码
                disabled={true} // 设置为禁用状态
            />

        </React.Fragment>
    )
}

export default AssetDetails;
