import React from 'react';
import EAMSelect from 'eam-components/dist/ui/components/inputs-ng/EAMSelect';
import EAMAutocomplete from 'eam-components/dist/ui/components/inputs-ng/EAMAutocomplete';
import WSParts from "../../../tools/WSParts";
import EAMCheckbox from 'eam-components/dist/ui/components/inputs-ng/EAMCheckbox'
import WS from "../../../tools/WS";
import StatusRow from "../../components/statusrow/StatusRow"
import EAMTextField from 'eam-components/dist/ui/components/inputs-ng/EAMTextField';
// 导入判断是否为多组织结构的函数
import { isMultiOrg } from '../EntityTools';

const PartGeneral = (props) => {

    const { part, newEntity, register, screenCode } = props;

    return (
        <React.Fragment>

            {/* 如果是多组织结构且为新实体，则显示组织选择组件 */}
            {isMultiOrg && newEntity && <EAMSelect {...register('organization', 'organization')}
            autocompleteHandler={WS.getOrganizations}
            autocompleteHandlerParams={[screenCode]}/>}

            {/* 如果为新实体，则显示零件代码输入框 */}
            {newEntity && <EAMTextField {...register('partcode', 'code')}/>}

            {/* 显示零件描述输入框 */}
            <EAMTextField {...register('description', 'description')} />

            {/* 显示零件分类自动完成输入框 */}
            <EAMAutocomplete
                {...register('class', 'classCode', 'classDesc')}
                autocompleteHandler={WS.autocompleteClass}
                autocompleteHandlerParams={['PART']}
            />

            {/* 显示零件类别自动完成输入框 */}
            <EAMAutocomplete
                {...register('category', 'categoryCode', 'categoryDesc')}
                autocompleteHandler={WSParts.autocompletePartCategory}
            />

            {/* 显示单位自动完成输入框 */}
            <EAMAutocomplete
                {...register('uom', 'uom', 'uomdesc')}
                autocompleteHandler={WSParts.autocompletePartUOM}
            />

            {/* 显示跟踪类型选择组件 */}
            <EAMSelect
                {...register('trackingtype', 'trackingMethod')}
                autocompleteHandler={WSParts.getPartTrackingMethods}
            />

            {/* 显示商品代码自动完成输入框 */}
            <EAMAutocomplete
                {...register('commoditycode', 'commodityCode', 'commodityDesc')}
                autocompleteHandler={WSParts.autocompletePartCommodity}
            />

            {/* 显示按资产跟踪复选框 */}
            <EAMCheckbox {...register('trackbyasset', 'trackByAsset')} />

            {/* 显示可修复备件跟踪复选框 */}
            <EAMCheckbox {...register('repairablespare', 'trackCores')} />

            {/* 显示零件状态信息 */}
            <StatusRow
                entity={part}
                entityType={"part"}
                style={{marginTop: "10px", marginBottom: "-10px"}}
            />
            
        </React.Fragment>
    );
}

export default PartGeneral;
