import React, {Component} from 'react';
import WSWorkorders from '../../../../tools/WSWorkorders';
import EISTable from 'eam-components/dist/ui/components/table';
import SimpleEmptyState from 'eam-components/dist/ui/components/emptystates/SimpleEmptyState'
export default class WorkorderChildren extends Component {

    headers = ['Child WO', 'Description', 'Equipment', 'Status', 'Type']; // 表头数据，定义显示在表格中的列名
    propCodes = ['number', 'description', 'equipment', 'status', 'type']; // 对应于headers的属性名，用于从数据对象中提取值
    linksMap = new Map([['number', {linkType: 'fixed', linkValue: 'workorder/', linkPrefix: '/'}],
        ['equipment', {linkType: 'fixed', linkValue: 'equipment/', linkPrefix: '/'}]
    ]); // 定义链接映射，用于在表格中创建链接

    state = {
        data: [] // 组件状态中的数据数组，用于存储工单子项
    };

    componentWillMount() {
        this.fetchData(this.props); // 组件将要挂载时，调用fetchData方法加载数据
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.workorder && nextProps.workorder !== this.props.workorder)
            this.fetchData(nextProps); // 当接收到新的props时，如果工单变化，则重新加载数据
        else if (!nextProps.workorder) {
            this.setState(() => ({
                data: [] // 如果新的props中没有工单信息，则清空数据
            }));
        }
    }

    fetchData = (props) => {
        WSWorkorders.getChildrenWorkOrder(props.workorder) // 调用服务获取子工单数据
            .then(response => {
                //Assign data
                this.setState(() => ({data: response.body.data})); // 将获取到的数据设置到状态中
            })
            .catch(console.error); // 处理可能出现的错误
    };

    render() {
        const isEmptyState = this.state.data.length === 0; // 判断当前数据是否为空

        return (
            isEmptyState
            ? <SimpleEmptyState message="No Child Work Orders to show."/> // 如果数据为空，显示空状态组件
            : (
                <EISTable
                    data={this.state.data} // 传递数据到表格组件
                    headers={this.headers} // 传递表头数据到表格组件
                    propCodes={this.propCodes} // 传递属性代码到表格组件
                    linksMap={this.linksMap} // 传递链接映射到表格组件
                />
            )
        )
    }
}
