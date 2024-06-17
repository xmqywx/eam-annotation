import React, {Component} from 'react';
import WSWorkorders from '../../../../tools/WSWorkorders';
import EISTable from 'eam-components/dist/ui/components/table';
import SimpleEmptyState from 'eam-components/dist/ui/components/emptystates/SimpleEmptyState'
import BlockUi from 'react-block-ui';

export default class WorkorderMultiequipment extends Component {  // 多设备工作订单组件

    headers = ['Equipment', 'Description', 'Type'];  // 表格头部标题
    propCodes = ['equipmentCode', 'equipmentDesc', 'equipmentTypeCD'];  // 对应数据的属性名
    linksMap = new Map([['equipmentCode', {linkType: 'fixed', linkValue: 'equipment/', linkPrefix: '/'}]]);  // 链接映射，用于表格中的链接生成

    state = {
        data: [],  // 表格数据
        blocking: true,  // 是否阻塞UI
    };

    componentWillMount() {
        this.fetchData(this.props);  // 获取数据
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.workorder && nextProps.workorder !== this.props.workorder)
            this.fetchData(nextProps);  // 如果工作订单变化，重新获取数据
        else if (!nextProps.workorder) {
            this.setState(() => ({
                data: []  // 如果没有工作订单，清空数据
            }));
        }
    }

    fetchData = (props) => {  // 获取数据的方法
        this.setState({ blocking: true });  // 开始获取数据时，设置UI阻塞
        WSWorkorders.getWorkOrderEquipmentMEC(props.workorder)  // 调用API获取数据
            .then(response => {
                // 在单一字段中设置类型
                const data = response.body.data.map(elem => ({
                    ...elem,
                    equipmentTypeCD: `${elem.equipmentType} - ${elem.equipmentTypeDesc}`  // 合并设备类型和描述
                }));
                // 分配数据到状态
                this.setState(() => ({data}));
                if (props.setEquipmentMEC) {
                    props.setEquipmentMEC(data);  // 如果有设置设备MEC的方法，调用它
                }
            })
            .catch(console.error)  // 错误处理
            .finally(() => {
                this.setState({ blocking: false })  // 结束数据获取，解除UI阻塞
            });
    };

    render() {  // 渲染方法
        const { blocking, data } = this.state;  // 从状态中获取阻塞状态和数据
        const isEmptyState = !blocking && data.length === 0;  // 判断是否显示空状态

        return (
            isEmptyState
            ? (
                <SimpleEmptyState message="No Equipment to show." />  // 显示无设备的空状态信息
            )
            : (
                <BlockUi blocking={blocking} style={{ width: "100%" }  // 显示表格，如果正在加载则显示阻塞UI
                }> 
                    <EISTable
                        data={this.state.data}
                        headers={this.headers}
                        propCodes={this.propCodes}
                        linksMap={this.linksMap} />
                </BlockUi>
            )
        )
    }
}
