import React from 'react';
import { EAMCellField } from 'eam-components/dist/ui/components/grids/eam/utils';

// 定义颜色映射表，将颜色名称映射到具体的颜色代码
const colorMap = {
  amber: '#f2bc41',
  amethyst: '#a38db7',
  azure: '#69b5dd',
  citrine: '#feeb70',
  cobalt: '#297af1',
  coral: '#eb8444',
  emerald: '#89c064',
  graphite: '#999999',
  jade: '#b7d675',
  ruby: '#c65f5f',
  sapphire: '#5967c9',
  topaz: '#7dd6f2',
  tourmaline: '#ff80a2',
  turquoise: '#7cc0b5'
}

// StatusIcon组件，接收column和value作为属性
const StatusIcon = ({ column, value }) => {
    const [name, color] = value.split('@') // 将value按'@'分割，分别得到名称和颜色

    // 如果color不存在或为空，则直接返回EAMCellField组件
    if(!color || !color.length) {
        return EAMCellField({ column, value });
    }

    const colorValue = color.toLowerCase().trim(); // 将color转为小写并去除两端空格

    // 如果处理后的colorValue为空或colorMap中不存在该颜色，则返回EAMCellField组件
    if(!colorValue.length || !colorMap[colorValue]) {
        return EAMCellField({ column, value });
    }

    // 返回一个包含颜色图标和名称的React片段
    return (
        <>
            <span
                style={{
                    width: '1rem',
                    height: '1rem',
                    position: 'relative',
                    top: '2px',
                    borderRadius: '1rem',
                    display: 'inline-block',
                    marginRight: '2px',
                    background: colorMap[colorValue]
                }}
            />
            {name}
        </>
    )
}

export default StatusIcon;
