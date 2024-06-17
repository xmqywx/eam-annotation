import React, {Component} from 'react';
import WSEquipment from '../../../../tools/WSEquipment';
import EISTable from 'eam-components/dist/ui/components/table';
import SimpleEmptyState from 'eam-components/dist/ui/components/emptystates/SimpleEmptyState'
import BlockUi from 'react-block-ui';

/**
 * 组件用于展示与设备相关联的部件信息。
 */
export default class EquipmentPartsAssociated extends Component {

    headers = ['Code', 'Description', 'Quantity', 'UOM']; // 表格头部标题
    propCodes = ['partCode', 'partDesc', 'quantity', 'uom']; // 对应数据的属性名
    linksMap = new Map([['partCode', {linkType: 'fixed', linkValue: 'part/', linkPrefix: '/'}]]); // 链接映射，用于构建部件代码的链接

    state = {
        data: [], // 存储部件数据
        blocking: true, // 控制加载遮罩的显示
    };

    /**
     * 组件挂载前调用，用于初次获取数据。
     */
    componentWillMount() {
        this.fetchData(this.props);
    }

    /**
     * 组件接收新的props时调用，用于根据设备代码的变更重新获取数据。
     * 
     * @param {Object} nextProps 新的属性对象
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.equipmentcode && nextProps.equipmentcode !== this.props.equipmentcode)
            this.fetchData(nextProps);
        else if (!nextProps.equipmentcode) {
            this.setState(() => ({
                data: [] // 清空数据
            }));
        }
    }

    /**
     * 根据设备代码获取与设备相关联的部件数据。
     * 
     * @param {Object} props 包含设备代码和父屏幕信息的对象
     */
    fetchData = (props) => {
        this.setState({ blocking: true });
        WSEquipment.getEquipmentPartsAssociated(props.equipmentcode, props.parentScreen)
            .then(response => {
                this.setState(() => ({
                    data: response.body.data // 更新部件数据
                }))
            })
            .catch(console.error)
            .finally(() => {
                this.setState({ blocking: false }) // 取消加载遮罩
            });
    };

    render() {
        const { blocking, data } = this.state;
         // 判断是否显示空状态
        const isEmptyState = !blocking && data.length === 0;

        return (
            isEmptyState
            ? (
                // 显示无部件信息状态
                <SimpleEmptyState message="No Parts to show." />
            )
            : (
                // 显示加载遮罩和部件信息表格
                <BlockUi blocking={blocking} style={{ width: "100%" }}>
                    <EISTable
                        data={this.state.data}
                        headers={this.headers}
                        propCodes={this.propCodes}
                        linksMap={this.linksMap}
                    />
                </BlockUi>
            )
        )
    }
}