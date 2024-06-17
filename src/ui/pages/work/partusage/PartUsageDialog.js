import React, {useState, useEffect} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import BlockUi from 'react-block-ui';
import WSWorkorders from '../../../../tools/WSWorkorders';
import EAMSelect from 'eam-components/dist/ui/components/inputs-ng/EAMSelect';
import EAMAutocomplete from 'eam-components/dist/ui/components/inputs-ng/EAMAutocomplete';
import EAMTextField from 'eam-components/dist/ui/components/inputs-ng/EAMTextField';
import useFieldsValidator from 'eam-components/dist/ui/components/inputs-ng/hooks/useFieldsValidator';
import WSParts from '../../../../tools/WSParts';
import makeStyles from '@mui/styles/makeStyles';
import EAMRadio from 'eam-components/dist/ui/components/inputs-ng/EAMRadio';
import { createOnChangeHandler, processElementInfo, isHidden } from 'eam-components/dist/ui/components/inputs-ng/tools/input-tools';
import WSEquipment from "tools/WSEquipment";

const overflowStyle = {
    overflowY: 'visible' // 设置样式，使得Y轴溢出可见
}

const useStyles = makeStyles({
    paper: overflowStyle // 使用makeStyles创建样式，应用于对话框
});

const ISSUE = 'ISSUE'; // 定义常量ISSUE
const RETURN = 'RETURN'; // 定义常量RETURN
const transactionTypes = [{code: ISSUE, desc: 'Issue'}, {code: RETURN, desc: 'Return'}]; // 定义交易类型数组

// 定义表单字段常量
const FORM = {
    ACTIVITY: 'activityCode',
    STORE: 'storeCode',
    TRANSACTION_TYPE: 'transactionType',
    ASSET: 'assetIDCode',
    ASSET_DESC: 'assetIDDesc',
    BIN: 'bin',
    PART: 'partCode',
    PART_DESC: 'partDesc',
    TRANSACTION_QTY: 'transactionQty',
    LOT: 'lot',
};

function PartUsageDialog(props) {
    const {
        isDialogOpen, // 对话框是否打开
        handleError, // 错误处理函数
        showError, // 显示错误信息的函数
        showNotification, // 显示通知的函数
        showWarning, // 显示警告的函数
        equipmentMEC, // 设备MEC数据
        successHandler, // 成功处理函数
        handleCancel, // 取消处理函数
        isLoading, // 是否正在加载
        tabLayout, // 标签布局信息
        workorder // 工作订单数据
    } = props;

    const [binList, setBinList] = useState([]); // 状态：存储bin列表
    const [lotList, setLotList] = useState([]); // 状态：存储lot列表
    const [activityList, setActivityList] = useState([]); // 状态：存储活动列表
    const [loading, setLoading] = useState(false); // 状态：是否正在加载
    const [uom, setUoM] = useState(''); // 状态：单位
    const [isTrackedByAsset, setIsTrackedByAsset] = useState(); // 状态：是否按资产跟踪
    const [formData, setFormData] = useState({}); // 状态：表单数据
    const [initPartUsageWSData, setInitPartUsageWSData] = useState({}); // 状态：初始化部分使用的Web服务数据

    const fieldsData = {
        transactionType: tabLayout.transactiontype,
        storeCode: tabLayout.storecode,
        activityCode: tabLayout.activity,
        partCode: tabLayout.partcode,
        assetIDCode: tabLayout.assetid,
        bin: tabLayout.bincode,
        lot: tabLayout.lotcode,
        transactionQty: tabLayout.transactionquantity,
    };

    const { errorMessages, validateFields, resetErrorMessages } =
        useFieldsValidator(fieldsData, formData); // 使用字段验证钩子

    const updateFormDataProperty = (key, value) => {
        setFormData((oldFormData) => ({
            ...oldFormData,
            [key]: value,
        }));
    };

    const runUiBlockingFunction = async (blockingFunction) => {
        try {
            setLoading(true); // 设置加载状态为true
            await blockingFunction(); // 执行阻塞函数
        } catch (error) {
            handleError(error); // 处理错误
        } finally {
            setLoading(false); // 设置加载状态为false
        }
    }

    // 设置初始表单状态
    const assignInitialFormState = (response) => {
        const transactionLines = response.transactionlines[0];
        updateFormDataProperty(FORM.ACTIVITY, response.activityCode);
        updateFormDataProperty(FORM.STORE, response.storeCode);
        updateFormDataProperty(FORM.TRANSACTION_TYPE, response.transactionType);
        updateFormDataProperty(FORM.ASSET, transactionLines.assetIDCode);
        updateFormDataProperty(FORM.ASSET_DESC, transactionLines.assetIDDesc);
        updateFormDataProperty(FORM.BIN, transactionLines.bin);
        updateFormDataProperty(FORM.PART, transactionLines.partCode);
        updateFormDataProperty(FORM.PART_DESC, transactionLines.partDesc);
        updateFormDataProperty(FORM.TRANSACTION_QTY, transactionLines.transactionQty);
        updateFormDataProperty(FORM.LOT, transactionLines.lot);
    };

    useEffect(() => {
        if (isDialogOpen) {
            runUiBlockingFunction(initNewPartUsage);
        } else {
            resetFormTransactionLinesAndRelatedStates();
            updateFormDataProperty(FORM.ACTIVITY, null);
            updateFormDataProperty(FORM.STORE, null);
            resetErrorMessages();
        }
    }, [isDialogOpen]);

    const initNewPartUsage = async () => {
        try {
            // 获取部分使用对象
            const response = await WSWorkorders.getInitNewPartUsage(workorder);
            const defaultTransactionData = response.body.data;
            setInitPartUsageWSData(defaultTransactionData);
            assignInitialFormState(defaultTransactionData);
            // 加载列表
            await loadLists();
        } catch (error) {
            handleError(error);
        }
    };

    const loadLists = async () => {
        try {
            const response = await WSWorkorders.getWorkOrderActivities(
                workorder.number
            );
            setActivityList(transformActivities(response.body.data));
        } catch (error) {
            handleError(error);
        }
        setBinList([]);
        setLotList([]);
    };

    const resetFieldWithDesc = (fieldValueKey, fieldDescKey) => {
        updateFormDataProperty(fieldValueKey, '');
        updateFormDataProperty(fieldDescKey, '');
    }

    const resetFieldWithList = (fieldValueKey, listSetterFunction) => {
        updateFormDataProperty(fieldValueKey, '');
        listSetterFunction([]);
    }

    const resetFormTransactionLinesAndRelatedStates = () => {
        // 重置'transactionlines'属性（包括相关选项列表）
        resetFieldWithDesc(FORM.ASSET, FORM.ASSET_DESC);
        resetFieldWithDesc(FORM.PART, FORM.PART_DESC);
        resetFieldWithList(FORM.BIN, setBinList);
        resetFieldWithList(FORM.LOT, setLotList);

        // 重置其他
        setUoM('');
        setIsTrackedByAsset(false);
    };

    const handleTransactionChange = () => {
        resetFormTransactionLinesAndRelatedStates();
    };

    const handleStoreChange = () => {
        resetFormTransactionLinesAndRelatedStates();
    };

    /* 此函数处理至少3种情况:
     * 1) 资产ID字段被清除，仅包含空白或为假值。
     * 2) 用户在未选择部件或从历史记录中选择部件时搜索资产ID
     *    （因此我们需要更新相关状态：部件、bin和lot）。
     * 3) 已经选择了部件（因此我们只需要更新bin和lot状态）。
     */
    const handleAssetChange = async (assetIDCode) => {
        const { transactionType, partCode } = formData;

        // 重置相关字段
        updateFormDataProperty(FORM.BIN, '');
        if (transactionType === ISSUE) {
            // 在返回交易中，当选择部件时会加载bin列表，因此无需重置
            resetFieldWithList(FORM.BIN, setBinList);
        }
        resetFieldWithList(FORM.LOT, setLotList);

        // 资产字段绝对不是资产代码
        if (!assetIDCode || assetIDCode.trim() === '') {
            // 重置可能不反映字段中显示的值的状态
            resetFieldWithDesc(FORM.ASSET, FORM.ASSET_DESC);
            return;
        }

        try {
            const assetData = await getAssetData(assetIDCode);

            // 明确重置资产字段，因为选择的资产无效
            if (!assetData) {
                resetFieldWithDesc(FORM.ASSET, FORM.ASSET_DESC);
                return;
            }

            // 选择资产时未选择部件或与不同部件关联（如果从历史记录中选择）
            if (!partCode || partCode !== assetData.partCode) {
                await handleAssetDifferentOrNoPart(assetData);
            // 已选择资产且已选择部件
            } else {
                await handleAssetSelectedWithPart(assetData);
            }
        } catch (error) {
            handleError(error);
        }
    };

    const getAssetData = async (assetIDCode) => {
        try {
            const response = await WSEquipment.getEquipment(assetIDCode);
            const equipmentData = response.body.data;

            const responseStoreCode = equipmentData.storeCode;
            const assetData = {
                bin: equipmentData.bin,
                partCode: equipmentData.partCode,
                lot: equipmentData.lot,
            }

            // 如果用户选择了意外的设备（例如"A"），可能会发生这种情况
            if (Object.values(assetData).includes(null)) {
                showError('Unexpected asset selected.');
                return undefined;
            }

            const { transactionType, storeCode } = formData;

            if (transactionType === ISSUE) {
                if (!responseStoreCode) {
                    showError(`Asset "${assetIDCode}" is not available in any store.`);
                    return undefined;
                }

                // 资产在与所选不同的商店中（通过从输入历史中选择资产时可能发生）
                if (responseStoreCode !== storeCode) {
                    showError(`Asset "${assetIDCode}" is in a different store (${responseStoreCode}) than the selected.`);
                    return undefined;
                }

                return assetData;

            } else if (transactionType === RETURN) {
                if (responseStoreCode) {
                    showError(`Asset "${assetIDCode}" is already in a store (${responseStoreCode}).`);
                    return undefined;
                }

                return assetData;
            }

            // 如果到达这里，说明出了问题（用户输入或代码相关）
            showError(`Asset "${assetIDCode}" does not follow business rules.`);
            return undefined;

        } catch (error){
            handleError(error);
        }
    };

    const handleAssetSelectedWithPart = async (assetData) => {
        const { bin, partCode, lot } = assetData;
        const { transactionType } = formData;

        // 在发行交易中，bin加载也将加载lot列表
        // 因为资产有一个单一的bin（触发lot加载）。
        await Promise.all([
            loadBinList(bin, partCode),
            transactionType === RETURN
                ? loadLotList(transactionType, lot, '', partCode, '')
                : null,
        ]);
    };

    const handleAssetDifferentOrNoPart = async (assetData) => {
        const { partCode } = assetData;

        // 清除部件字段，以便用户知道选择的资产与不同的部件关联
        resetFieldWithDesc(FORM.PART, FORM.PART_DESC);

        const [ partData ] = await Promise.all([
            loadPartData(partCode),
            handleAssetSelectedWithPart(assetData),
        ]);

        updateFormDataProperty(FORM.PART_DESC, partData?.description);
        updateFormDataProperty(FORM.PART, partCode);
    };

    const handleBinChange = async (bin) => {
        const { transactionType, partCode, storeCode, assetIDCode, lot } = formData;

        // 在返回交易中，lot可以在bin之前填写（我们期望已经有一个lot列表），
        // 因此我们不应清除lot字段，我们可以避免重新加载lot列表。

        // 如果部件按资产跟踪，lot应该已经自动填写，
        // 因此我们不应清除lot字段，也不需要加载lot列表。
        if (isTrackedByAsset && assetIDCode && lot) {
            return;
        }

        if (transactionType === ISSUE) {
            resetFieldWithList(FORM.LOT, setLotList);
            await loadLotList(transactionType, '', bin, partCode, storeCode);
        }
    }

    const handlePartChange = async (partCode) => {
        // 我们原则上应该清除相关状态，因为数据加载/字段更改的副作用（例如当只有一个可能的bin时自动选择bin），
        // 以及因为用户可能已经填写了相关字段，然后更改了选择的部件。
        resetFieldWithDesc(FORM.ASSET, FORM.ASSET_DESC);
        resetFieldWithList(FORM.BIN, setBinList);
        resetFieldWithList(FORM.LOT, setLotList);
        setIsTrackedByAsset(false);

        if (!partCode || partCode?.trim() === '') {
            resetFieldWithDesc(FORM.PART, FORM.PART_DESC); // 清除可能不反映字段中显示的值的状态
            return;
        }

        const { transactionType, storeCode } = formData;

        // 验证部件是否在所选商店中（当从历史记录中选择部件时需要）。
        // 这只在发行交易中需要，因为在返回交易中部件可以返回到任何商店。
        if (transactionType === ISSUE) {
            try {
                const partStockResponse = await WSParts.getPartStock(partCode);
                const partStock = partStockResponse.body.data;

                // 如果不在所选商店中，明确重置部件字段，因为在这种情况下部件代码将无效。
                if (
                    !partStock.some(
                        (stockEntry) => stockEntry.storeCode === storeCode
                    )
                ) {
                    resetFieldWithDesc(FORM.PART, FORM.PART_DESC);
                    showError(
                        `Part "${partCode}" is not in the selected store.`
                    );
                    return;
                }
            } catch (error) {
                handleError(error);
            }
        }

        const partData = await loadPartData(partCode);

        if (partData?.trackByAsset === 'true') {
            showNotification(`Selected part "${partCode}" is tracked by asset.`);
             // Bin加载稍后在用户选择资产时完成。

        } else if (partData?.trackByAsset === 'false') {

            await Promise.all([
                loadBinList('', partCode),
                transactionType === RETURN
                    ? loadLotList(transactionType, '', '', partCode, '')
                    : null,
            ]);
        }
    };

    const loadLotList = async (transactionType, lot, bin, partCode, storeCode) => {
        try {
            let response;
            if (transactionType === ISSUE) {
                response = await WSWorkorders.getPartUsageLotIssue(
                    lot,
                    bin,
                    partCode,
                    storeCode
                );
            } else { // RETURN
                response = await WSWorkorders.getPartUsageLotReturn(
                    lot,
                    partCode,
                );
            }
            const lots = response.body.data;

            if (lots.length === 0) {
                showWarning('No lots found (likely no available quantity).');
            } else if (lots.length === 1) {
                updateFormDataProperty(FORM.LOT, lots[0].code);
            }

            if (isHidden(tabLayout['lotcode']) && lots.length >= 1) {
                updateFormDataProperty(FORM.LOT, '*');
            }

            setLotList(lots);
        } catch (error) {
            handleError(error);
            setLotList([]);
        }
    };

    const loadBinList = async (binCode, partCode) => {
        if (!partCode) return;

        const { transactionType, storeCode } = formData;

        try {
            const response = await WSWorkorders.getPartUsageBin(
                transactionType,
                binCode,
                partCode,
                storeCode
            );
            const binList = response.body.data;

            setBinList(binList);

            if (binList.length === 1) {
                const availableBin = binList[0].code;
                updateFormDataProperty(FORM.BIN, availableBin);

                await loadLotList(transactionType, '', availableBin, partCode, storeCode);
            }

        } catch (error) {
            handleError(error);
            setBinList([]);
        }
    };

    const loadPartData = async (partCode) => {
        if (!partCode || partCode.trim() === '') {
            return;
        }

        try {
            const response = await WSParts.getPart(partCode);
            const partData = response.body.data;

            setIsTrackedByAsset(partData?.trackByAsset === 'true');
            setUoM(partData?.uom);

            return partData;
        } catch (error) {
            handleError(error);
        }
    };

    const handleSave = async () => {
        if (!validateFields()) {
            return;
        }

        const relatedWorkOrder =
            equipmentMEC?.length > 0 ? workorder.number : null;

        // 提取用户可通过交互修改的状态属性
        const {
            activityCode,
            storeCode,
            transactionType,
            assetIDCode,
            assetIDDesc,
            bin,
            partCode,
            partDesc,
            transactionQty,
            lot,
        } = formData;

        // 更新部分使用对象的上层属性
        let partUsageSubmitData = {
            ...initPartUsageWSData,
            activityCode,
            storeCode,
            relatedWorkOrder,
            transactionType,
        };

        // 更新部分使用对象的'transactionlines'属性
        partUsageSubmitData.transactionlines = [
            {
                ...initPartUsageWSData.transactionlines[0],
                assetIDCode,
                assetIDDesc,
                bin,
                lot,
                partCode,
                partDesc,
                transactionQty,
            },
        ];

        // 删除原始的'transactionInfo'属性
        delete partUsageSubmitData.transactionInfo;

        // 提交新的部分使用
        try {
            await WSWorkorders.createPartUsage(partUsageSubmitData);
            successHandler();
        } catch (error) {
            handleError(error);
        }
    };

    const transformActivities = (activities) => {
        return activities.map((activity) => ({
            code: activity.activityCode,
            desc: activity.tradeCode,
        }));
    };

    const classes = useStyles();

    return (
        <div>
            <Dialog
                fullWidth
                id="addPartUsageDialog"
                open={isDialogOpen}
                onClose={handleCancel}
                aria-labelledby="form-dialog-title"
                classes={{
                    paper: classes.paper,
                }}
            >
                <DialogTitle id="form-dialog-title">Add Part Usage</DialogTitle>

                <DialogContent id="content" style={overflowStyle}>
                    <div>
                        <BlockUi
                            tag="div"
                            blocking={loading || isLoading}
                        >
                            <EAMRadio
                                {...processElementInfo(tabLayout['transactiontype'])}
                                values={transactionTypes}
                                value={formData.transactionType}
                                onChange={createOnChangeHandler(FORM.TRANSACTION_TYPE, null, null, updateFormDataProperty, handleTransactionChange)}
                            />

                            <EAMSelect
                                {...processElementInfo(tabLayout['storecode'])}
                                required
                                value={formData.storeCode}
                                onChange={createOnChangeHandler(FORM.STORE, null, null, updateFormDataProperty, handleStoreChange)}
                                autocompleteHandler={
                                    WSWorkorders.getPartUsageStores
                                }
                                errorText={errorMessages?.storeCode}
                            />

                            <EAMSelect
                                {...processElementInfo(tabLayout['activity'])}
                                disabled={!formData.storeCode}
                                options={activityList}
                                value={formData.activityCode}
                                onChange={createOnChangeHandler(FORM.ACTIVITY, null, null, updateFormDataProperty, null)}
                                errorText={errorMessages?.activityCode}
                            />

                            <EAMAutocomplete
                                {...processElementInfo(tabLayout['partcode'])}
                                disabled={
                                    !formData.storeCode ||
                                    !formData.activityCode
                                }
                                value={formData.partCode}
                                desc={formData.partDesc}
                                autocompleteHandler={
                                    WSWorkorders.getPartUsagePart
                                }
                                autocompleteHandlerParams={[
                                    workorder.number,
                                    formData.storeCode,
                                ]}
                                onChange={createOnChangeHandler(FORM.PART, FORM.PART_DESC, null, updateFormDataProperty,
                                    (part) =>
                                        runUiBlockingFunction(
                                            () => handlePartChange(part)
                                        )
                                )}
                                renderDependencies={[formData.transactionType]}
                                errorText={errorMessages?.partCode}
                                barcodeScanner
                            />

                            <EAMAutocomplete
                                {...processElementInfo(tabLayout['assetid'])}
                                disabled={
                                    !formData.storeCode ||
                                    !formData.activityCode ||
                                    (formData.partCode?.trim() !== '' && !isTrackedByAsset)
                                }
                                value={formData.assetIDCode}
                                desc={formData.assetIDDesc}
                                autocompleteHandler={
                                    WSWorkorders.getPartUsageAsset
                                }
                                autocompleteHandlerParams={[
                                    formData.transactionType,
                                    formData.storeCode,
                                    formData.partCode
                                ]}
                                onChange={createOnChangeHandler(FORM.ASSET, FORM.ASSET_DESC, null, updateFormDataProperty,
                                    (asset) =>
                                        runUiBlockingFunction(
                                            () => handleAssetChange(asset)
                                        )
                                )}
                                barcodeScanner
                                renderDependencies={[formData.partCode]}
                                errorText={errorMessages?.assetIDCode}
                            />

                            <EAMSelect
                                {...processElementInfo(tabLayout['bincode'])}
                                disabled={
                                    !formData.storeCode ||
                                    !formData.activityCode ||
                                    (isTrackedByAsset && (
                                        formData.transactionType === ISSUE ||
                                        (formData.transactionType === RETURN && !formData.assetIDCode))
                                    )
                                }
                                valueKey={FORM.BIN}
                                options={binList}
                                value={formData.bin}
                                onChange={createOnChangeHandler(FORM.BIN, null, null, updateFormDataProperty,
                                    (bin) =>
                                        runUiBlockingFunction(
                                            () => handleBinChange(bin)
                                        )
                                )}
                                suggestionsPixelHeight={200}
                                renderDependencies={[
                                    formData.transactionType,
                                    formData.partCode,
                                    formData.storeCode,
                                    formData.assetIDCode,
                                    formData.lot,
                                    isTrackedByAsset,
                                ]}
                                errorText={errorMessages?.bin}
                            />

                            <EAMSelect
                                {...processElementInfo(tabLayout['lotcode'])}
                                disabled={
                                    !formData.storeCode ||
                                    !formData.activityCode ||
                                    isTrackedByAsset
                                }
                                valueKey={FORM.LOT}
                                options={lotList}
                                value={formData.lot}
                                onChange={createOnChangeHandler(FORM.LOT, null, null, updateFormDataProperty)}
                                errorText={errorMessages?.lot}
                            />

                            <EAMTextField
                                {...processElementInfo(tabLayout['transactionquantity'])}
                                disabled={
                                    !formData.storeCode ||
                                    !formData.partCode ||
                                    isTrackedByAsset
                                }
                                endTextAdornment={uom}
                                value={formData.transactionQty}
                                onChange={createOnChangeHandler(FORM.TRANSACTION_QTY, null, null, updateFormDataProperty)}
                                renderDependencies={uom}
                                errorText={errorMessages?.transactionQty}
                            />
                        </BlockUi>
                    </div>
                </DialogContent>

                <DialogActions>
                    <div>
                        <Button
                            onClick={handleCancel}
                            color="primary"
                            disabled={loading || isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => runUiBlockingFunction(handleSave)}
                            color="primary"
                            disabled={loading || isLoading}
                        >
                            Save
                        </Button>
                    </div>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default PartUsageDialog;