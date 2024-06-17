import React from 'react';
import './BookLabours.css';
import EISTable from 'eam-components/dist/ui/components/table';
import { formatDate } from 'ui/pages/EntityTools';

const propCodes = ['employeeDesc', 'dateWorked', 'hoursWorked']; // 定义表格列的属性代码

/**
 * 显示劳动预订的详细信息
 */
function BookLabours(props) {

    const headers = [props.layout.employee.text, props.layout.datework.text, props.layout.hrswork.text]; // 定义表格头部，从props中获取显示文本

    if (props.bookLabours && props.bookLabours.length > 0) { // 检查是否有劳动预订数据
        return (
            <div className="booklabours">
                <EISTable data={props.bookLabours.map(bl => ({...bl, dateWorked: formatDate(bl.dateWorked)}))} 
                          headers={headers} propCodes={propCodes}  // 使用EISTable组件显示数据，数据中的日期通过formatDate进行格式化
                          />
            </div>
        );
    }

    else {
        return null; // 如果没有数据，不渲染任何内容
    }

}

export default BookLabours
