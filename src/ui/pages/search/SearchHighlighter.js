import React from 'react';
import {Link} from 'react-router-dom';

// 定义一个名为SearchHighlighter的React组件，用于高亮显示搜索关键词
export default class SearchHighlighter extends React.Component {

    // render方法负责渲染组件到页面上
    render() {
        // 根据this.props.link的值决定渲染Link组件还是td元素
        return (
            !!this.props.link ?
                // 如果this.props.link存在，则渲染一个Link组件
                <Link to={{pathname: this.props.link}}>
                    {/* 使用span标签包裹内容，并使用dangerouslySetInnerHTML属性插入HTML，
                        调用replace方法处理this.props.data和this.props.keyword.toUpperCase() */}
                    <span dangerouslySetInnerHTML={{__html: this.replace(this.props.data, this.props.keyword.toUpperCase())}}
                          style={this.props.style}/>
                </Link>
                : // 如果this.props.link不存在，则渲染一个td元素
                <td dangerouslySetInnerHTML={{__html: this.replace(this.props.data, this.props.keyword.toUpperCase())}}
                    style={this.props.style}></td>
        );
    }

    // replace方法用于替换文本中的关键词为高亮显示
    replace(text, keyword) {
        // 如果传入的text为空，则直接返回空字符串
        if (!text) {
            return "";
        }
        // 使用字符串的replace方法替换关键词为带有<mark>标签的关键词，以实现高亮效果
        return text.replace(keyword, "<mark>" + keyword + "</mark>");
    }

}
