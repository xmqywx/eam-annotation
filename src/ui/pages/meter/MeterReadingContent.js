import React, {useEffect, useState} from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Save from '@mui/icons-material/Save';
import './MeterReading.css';
import EAMTextField from 'eam-components/dist/ui/components/inputs-ng/EAMTextField';
import { formatDateTime } from '../EntityTools';

function MeterReadingContent(props) {
    const { reading, disabled, parentProps } = props;
    // 使用useState钩子管理读数值的状态
    const [readingValue, setReadingValue] = useState('');

    // 使用useEffect钩子处理输入字段的清理逻辑
    useEffect(() => {
        // 如果当前的读数值与最后的读数值相同，则清空输入字段
        if (reading.lastValue == readingValue) {
           setReadingValue('');
        }
    }, [reading.lastValue]);  // 依赖项为reading.lastValue，当它变化时重新执行

    // 定义创建新读数的函数
    const createNewReading = () => {
        // 判断是否为翻转值，即当前读数值小于最后的读数值
        const isRollover = reading.rolloverValue && reading.rolloverValue < readingValue;
        // 创建新的读数对象
        const newReading = {
            uom: reading.uom,  // 单位
            equipmentCode: reading.equipmentCode,  // 设备代码
            actualValue: readingValue  // 实际读数值
        };
        // 调用父组件的保存处理函数，传入新的读数对象和是否翻转的标志
        parentProps.saveHandler(newReading, isRollover);
    };

    // 如果没有读数信息，则不渲染任何内容
    if (!reading) {
        return null;
    }

    // 渲染组件
    return (
        <div style={{width: '100%', height: '100%'}}>
            <Accordion defaultExpanded>
                <AccordionSummary>
                    <div className={`meterContentDetails`}>
                        <div className={`meterContentDetail`}>
                            <div className={`meterContentTitleContentH`}>Equipment:</div>
                            <div className={`meterContentTitleContentC`}>{reading.equipmentCode}</div>
                        </div>
                        {reading.meterName &&
                        <div className={`meterContentDetail`}>
                            <div className={`meterContentTitleContentH`}>Meter Name:</div>
                            <div className={`meterContentTitleContentC`}>{reading.meterName}</div>
                        </div>
                        }
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <div className={`meterContentDetails`}>
                        <div className={`meterContentDetail`}>
                            <div className={`meterContentTitleContentH`}>Last Reading Date:</div>
                            <div className={`meterContentTitleContentC`}>{formatDateTime(reading.lastUpdateDate)}</div>
                        </div>
                        <div className={`meterContentDetail`}>
                            <div className={`meterContentTitleContentH`}>Last Value:</div>
                            <div className={`meterContentTitleContentC`}>{reading.lastValue} [{reading.uomDesc}]
                            </div>
                        </div>
                    </div>
                </AccordionDetails>
                <Divider/>
                <AccordionActions>
                    <EAMTextField
                        value={readingValue}
                        disabled={disabled}
                        onChange={setReadingValue}
                        onChangeInput={setReadingValue}
                        endTextAdornment={reading.uomDesc}
                        endAdornment={
                            <Button
                                size="small"
                                onClick={createNewReading}
                                disabled={!readingValue}
                            >
                                <Save /> Save
                            </Button>
                        }
                    />
                </AccordionActions>
            </Accordion>
        </div>
    );
}

export default MeterReadingContent;