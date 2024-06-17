import React from 'react';
import TableCell from '@mui/material/TableCell';
import SearchHighlighter from "./SearchHighlighter";
import EntityCode from '../../../enums/EntityCode'

export default class SearchResult extends React.Component {

    // 定义getSearchItemLabel方法，根据传入的code返回对应的标签文本
    getSearchItemLabel(code) {
        switch(code) {
            case EntityCode.ASSET: {  // 资产类型
                return "Asset:";
            }
            case EntityCode.POSITION: {  // 位置类型
                return "Position:"
            }
            case EntityCode.SYSTEM: {  // 系统类型
                return "System:";
            }
            case EntityCode.WORKORDER: {  // 工作订单类型
                return "Work Order:";
            }
            case EntityCode.PART: {  // 零件类型
                return "Part:"
            }
            case EntityCode.LOCATION: {  // 位置类型
                return "Location: "
            }
            default: {  // 默认设备类型
                return "Equipment:"
            }
        }
    }
    
    // 定义render方法，用于渲染组件
    render() {
        return (
            <TableCell>  // 使用Material-UI的TableCell组件作为容器
                <table className={this.props.selected ? "searchResultTableCell selectedRow" : "searchResultTableCell"}  // 根据props.selected决定表格的类名
                > 
                    <tbody className="searchResultRowCell"  // 表格主体部分
                    > 
                        <tr>  // 表格行
                            <td>{this.getSearchItemLabel(this.props.data.type)  // 显示实体类型标签
                            }</td> 
                            <td><SearchHighlighter
                                style={{color: "#1a0dab", fontWeight: "bold"}}  // 设置高亮样式
                                data={this.props.data.code}  // 显示数据代码
                                keyword={this.props.keyword}  // 高亮关键词
                                link={this.props.data.link}  // 链接地址
                                type={this.props.data.type}  // 数据类型
                            /></td>
                        </tr>
                        {this.props.data.serial &&  // 如果有序列号数据
                        (
                            <tr>
                                <td 
                                     // 显示序列号标签
                                >Serial number:</td>  // 显示序列号标签
                                <SearchHighlighter data={this.props.data.serial} keyword={this.props.keyword} // 高亮显示序列号
                                />
                            </tr>
                        )
                        }
                        {this.props.data.alias &&  // 如果有别名数据
                        (
                            <tr>
                                <td>Alias:</td>  // 显示别名标签
                                <SearchHighlighter data={this.props.data.alias} keyword={this.props.keyword}  // 高亮显示别名
                                />
                            </tr>
                        )
                        }
                        <tr>
                            <td // 显示描述标签
                            >Description:</td> 
                            <td // 显示描述数据
                            >{this.props.data.description}</td>
                        </tr>
                        <tr>
                            <td // 显示部门标签
                            >Department:</td> 
                            <td // 显示部门数据
                            >{this.props.data.mrc}</td> 
                        </tr>
                    </tbody>
                </table>
            </TableCell>
        );
    }
}
