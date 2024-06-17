import React from 'react';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import IconButton from '@mui/material/IconButton';

// 依赖关系组件，用于在UI中切换和显示依赖状态。
const Dependency = (props) => {

    const { value, valueKey, updateProperty, disabled, dependencyKeysMap } = props;

    /**
     * 检查传入的值是否为真。
     * 
     * @param {string|boolean} value 需要检查的值
     * @returns {boolean} 如果值为 'true'（字符串），则返回 true，否则返回 false。
     */
    const isTrue = (value) => {
        const checkedTextValue = value || '';
        return checkedTextValue.toLowerCase() === true.toString();
    };

    /**
     * 取消设置与当前依赖相关的其他依赖。
     * 当一个依赖被激活时，相关的依赖将被设置为 'false'。
     */
    const unsetRelatedDependencies = () => {
        const relatedDependencies = Object.values(
            dependencyKeysMap
        ).filter((depKey) => {
            return depKey !== valueKey;
        });

        relatedDependencies.forEach((relatedDependency) => {
            updateProperty(relatedDependency, false.toString());
        });
    };

    /**
     * 处理点击事件，根据当前依赖的值更新状态。
     * 如果当前依赖为 'false'，则先取消设置相关依赖，然后切换当前依赖的值。
     */
    const onClickHandler = () => {
        // A 'value' of 'false' means the dependency will be set to 'true' afterwards
        if (dependencyKeysMap && value === 'false') {
            unsetRelatedDependencies();
        }

        isTrue(value)
            ? updateProperty(valueKey, 'false')
            : updateProperty(valueKey, 'true');
    };

    return (
        <>
            <IconButton disabled={disabled} onClick={onClickHandler}>
                {isTrue(value) ? <LinkIcon /> : <LinkOffIcon />}
            </IconButton>
        </>
    );
}

export default Dependency;
