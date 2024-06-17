import React from "react";
import { useTheme } from '@mui/material/styles';
import { isCernMode } from "ui/components/CERNMode";
import {version} from '../../../package.json'
import EAMFooter from 'eam-components/dist/ui/components/footer/Footer';
import { releaseNotesPath } from "Eamlight";

const Footer = props => {

    const {applicationData} = props;

    const theme = useTheme(); // 使用useTheme钩子获取当前主题

    const style = { // 定义style对象，用于设置页脚样式
        backgroundColor: theme.palette.primary.main, // 背景颜色设置为主题的主要颜色
        height: 30, // 高度设置为30
        color: "white", // 文字颜色设置为白色
        display: "flex", // 显示方式设置为flex布局
        justifyContent: "end", // 主轴对齐方式设置为末端对齐
        alignItems: "center", // 交叉轴对齐方式设置为居中对齐
        zIndex: 1250 // z-index设置为1250，snackbar的z-index为1400
    }

    return (
      <div style={style}>
        <EAMFooter
          appName={ // 设置应用名称
            "EAM Light " + // 基础名称为"EAM Light"
            (applicationData.EL_ENVIR !== "PROD" // 如果环境不是"PROD"，则添加环境标识
              ? applicationData.EL_ENVIR
              : "")
          }
          version={version} // 设置版本号
          supportEmail={isCernMode && "eam.support@cern.ch"} // 如果是CERN模式，则设置支持邮箱
          releaseNotesPath={releaseNotesPath} // 设置发布说明的路径
        />
      </div>
    );
}

export default Footer
