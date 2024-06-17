import React, {Component} from 'react';
import SearchResults from './SearchResults'
import './Search.css'
import InfiniteScroll from 'react-infinite-scroll-component';
import WS from '../../../tools/WS'
import SearchHeader from "./SearchHeader";
import {Redirect} from "react-router-dom";
import LinearProgress from "@mui/material/LinearProgress";
import KeyCode from 'eam-components/dist/enums/KeyCode'
import ErrorTypes from "eam-components/dist/enums/ErrorTypes";
import Ajax from 'eam-components/dist/tools/ajax'

const INITIAL_STATE = {  // 定义组件的初始状态
    results: [],  // 搜索结果数组
    searchBoxUp: false,  // 搜索框是否展开的状态
    keyword: '',  // 当前搜索关键词
    isFetching: false,  // 是否正在获取数据的状态
    redirectRoute: '',  // 重定向路由
}

class Search extends Component {  // 定义Search组件

    state = INITIAL_STATE;  // 初始化组件状态

    componentDidUpdate(prevProps) {  // 组件更新后的生命周期方法
        this.scrollWindowIfNecessary();  // 调用方法，确保选中项在视图中
        if (prevProps.location !== this.props.location) {  // 如果路由位置发生变化
            this.setState(INITIAL_STATE);  // 重置状态
            this.cancelSource && this.cancelSource.cancel();  // 取消正在进行的请求
        }
    }

    render() {  // 渲染方法
        if (!!this.state.redirectRoute) {  // 如果有重定向路由
            return (
                <Redirect to={this.state.redirectRoute}/>  // 执行重定向
            );
        }

        return (
            <div id="searchContainer"
                    className={this.state.searchBoxUp ? "searchContainer searchContainerSearch" : "searchContainer searchContainerHome"}>
                <SearchHeader keyword={this.state.keyword} searchBoxUp={this.state.searchBoxUp}
                                fetchDataHandler={this.fetchNewData.bind(this)}
                                onKeyDown={this.onKeyDown.bind(this)}
                                tryToGoToResult={this.tryToGoToResult.bind(this)}
                                showTypes={this.state.searchBoxUp}
                />
                <div id="searchResults"
                        className={this.state.searchBoxUp ? "searchResultsSearch" : "searchResultsHome"}>
                    <div className="linearProgressBox">
                        {this.state.isFetching && <LinearProgress className="linearProgress"/>}
                    </div>
                    <div className="searchScrollBox">
                        {(!this.state.isFetching && this.state.results.length === 0 && this.state.keyword) ?
                            <div className="searchNoResults">No results found.</div> :
                            <InfiniteScroll height="calc(100vh - 180px)">
                                <SearchResults data={this.state.results} keyword={this.state.keyword}
                                                selectedItemCode={!!this.state.results[this.state.selectedItemIndex] ? this.state.results[this.state.selectedItemIndex].code : null}/>
                            </InfiniteScroll>
                        }

                    </div>
                </div>
            </div>
        )
    }

    /**
     * 处理键盘事件的方法
     * @param event 键盘事件对象
     */
    onKeyDown(event) {
        switch (event.keyCode) {  // 根据按键代码执行不同操作
            case KeyCode.DOWN: {  // 向下箭头
                this.handleSearchArrowDown();  // 调用向下选择方法
                break;
            }

            case KeyCode.UP: {  // 向上箭头
                this.handleSearchArrowUp();  // 调用向上选择方法
                break;
            }

            case KeyCode.ENTER: {  // 回车键
                this.tryToGoToResult();  // 尝试执行结果跳转
                break;
            }
        }
    }

    tryToGoToResult() {  // 尝试跳转到结果的方法
        // 如果只有一个结果，回车键跳转到该结果
        if (this.state.results.length === 1) {
            this.setState({
                redirectRoute: this.state.results[0].link
            });

            return;
        }

        // 如果有选中的结果，跳转到选中的结果
        if (this.state.selectedItemIndex >= 0 && this.state.selectedItemIndex < this.state.results.length) {
            this.setState({
                redirectRoute: this.state.results[this.state.selectedItemIndex].link
            });

            return;
        }

        // 如果输入的关键词完全匹配某个结果的代码，跳转到该结果
        if (this.state.results.length > 0) {
            this.state.results.forEach(result => {
                if (result.code === this.state.keyword) {
                    this.setState({
                        redirectRoute: result.link
                    });

                    return;
                }
            })
        }

        if (this.state.keyword) {
            // 尝试获取单个结果
            WS.getSearchSingleResult(this.state.keyword)
                .then(response => {
                    if (response.body && response.body.data) {
                        this.setState({
                            redirectRoute: response.body.data.link
                        });
                    }
                }).catch(console.error);
        }
    }

    handleSearchArrowDown() {  // 处理向下箭头选择的方法
        if (this.state.selectedItemIndex !== this.state.results.length - 1) {  // 如果不是最后一个结果
            this.setState({
                selectedItemIndex: ++this.state.selectedItemIndex  // 选中下一个结果
            });
        } else {
            this.setState({
                selectedItemIndex: 0  // 回到第一个结果
            });
        }
    }

    handleSearchArrowUp() {  // 处理向上箭头选择的方法
        if (this.state.selectedItemIndex > 0) {  // 如果不是第一个结果
            this.setState(() => ({
                selectedItemIndex: --this.state.selectedItemIndex  // 选中上一个结果
            }));
        } else {
            this.setState(() => ({
                selectedItemIndex: this.state.results.length - 1  // 跳到最后一个结果
            }));
        }
    }

    scrollWindowIfNecessary() {  // 如果必要，滚动窗口以确保选中项可见
        let selectedRow = document.getElementsByClassName("selectedRow")[0];  // 获取选中的行元素

        if (!selectedRow) {
            return;
        }

        let rect = selectedRow.getBoundingClientRect();  // 获取元素的位置和尺寸
        const margin = 230;  // 定义视窗边缘的边距
        const isInViewport = rect.top >= margin &&
            rect.bottom <= ((window.innerHeight || document.documentElement.clientHeight) - margin);  // 判断元素是否在视窗中

        if (!isInViewport) {
            selectedRow.scrollIntoView();  // 如果不在视窗中，滚动到视窗中
        }
    }

    fetchNewData(keyword, entityTypes) {  // 获取新数据的方法
        if (!!this.cancelSource) {
            this.cancelSource.cancel();  // 取消之前的请求
        }

        if (!keyword) {  // 如果关键词为空
            this.setState({
                results: [],
                keyword,
                isFetching: false
            })
            return;
        }

        this.cancelSource = Ajax.getAxiosInstance().CancelToken.source();  // 创建一个新的取消令牌

        this.setState({
            searchBoxUp: true,
            keyword,
            isFetching: true
        });


        clearTimeout(this.timeout);  // 清除之前的延时
        this.timeout = setTimeout(() =>
            (WS.getSearchData(this.prepareKeyword(keyword), entityTypes, {
                cancelToken: this.cancelSource.token
            }).then(response => {
                this.cancelSource = null;

                this.setState({
                    results: response.body.data,
                    selectedItemIndex: -1,
                    isFetching: false
                });


            }).catch(error => {
                if (error.type !== ErrorTypes.REQUEST_CANCELLED) {
                    this.setState({
                        isFetching: false
                    });

                    this.props.handleError(error);
                }
            })), 200);
    }

    prepareKeyword(keyword) {  // 准备关键词的方法，处理特殊字符
        return keyword.replace("_", "\\_").replace("%", "\\%").toUpperCase();  // 替换特殊字符并转换为大写
    }

}

export default Search
