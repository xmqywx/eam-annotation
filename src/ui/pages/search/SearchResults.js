import React from 'react';
import SearchResult from "./SearchResult";
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';

export default class SearchResults extends React.Component {

    render() {
        return (
            <div style={{fontSize: "16px"}}>
            <Table>
                <TableBody   // 将传入的data数组中的每个元素通过mapItemToSearchResult方法转换为表格行
                >
                    {this.props.data.map(this.mapItemToSearchResult.bind(this))}
                </TableBody>
            </Table>
        </div>
        );
    }

    mapItemToSearchResult(item, number) {
        // mapItemToSearchResult方法，用于将单个数据项映射为表格行
        let isSelected = item.code === this.props.selectedItemCode;  // 判断当前项是否被选中，通过比较item的code属性和selectedItemCode属性

        return (
            <TableRow   // 创建TableRow组件，设置key和selected属性，根据是否选中设置背景色
             key={number} selected={isSelected} style={isSelected ? {backgroundColor : "#def4fa"} : {}}>
                <SearchResult  // 创建SearchResult组件，传入数据和关键词，以及是否选中的状态
                 data={item} keyword={this.props.keyword} selected={isSelected} /> 
            </TableRow>
        );
    }
}
