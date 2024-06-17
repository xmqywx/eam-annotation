import React from 'react'; // 引入React库，用于构建组件
import queryString from 'query-string'; // 引入queryString库，用于解析URL中的查询字符串
import ResizableIFrame from 'ui/components/iframes/ResizableIframe'; // 引入ResizableIFrame组件，用于创建可调整大小的iframe

// iframe的样式对象
const iframeStyle = {
    width: "1px", // 宽度设置为1px，但会通过minWidth覆盖
    minWidth: "100%", // 最小宽度100%，确保iframe宽度与容器宽度相同
    border: "none", // 无边框
    height: "100%", // 高度100%
}

// Report组件定义
const Report = () => {
    const urlParameters = queryString.parse(window.location.search); // 解析当前URL的查询参数
    const reportUrl = urlParameters.url; // 从查询参数中获取报告的URL

    return (
        <ResizableIFrame
            iframeResizerOptions={{
                scrolling: true, // 允许滚动
                checkOrigin: false, // 检查来源，此处设置为false，建议修改以增强安全性
            }}
            src={reportUrl} // iframe的源URL设置为报告的URL
            style={iframeStyle} // 应用上面定义的样式
        />
    );
};

export default Report;

