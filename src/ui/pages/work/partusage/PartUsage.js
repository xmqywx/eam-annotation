import React, { useState, useEffect } from 'react';
import WSWorkorders from "../../../../tools/WSWorkorders";
import EISTable from 'eam-components/dist/ui/components/table';
import Button from '@material-ui/core/Button';
import PartUsageDialog from "./PartUsageDialog";
import BlockUi from 'react-block-ui';


const buttonStyle = {
    position: 'relative',
    float: 'left',
    bottom: '-13px',
    left: '5px',
};

function PartUsage(props) {

    let headers = ['Transaction', 'Part', 'Activity', 'Store', 'Quantity'];
    let propCodes = ['transType', 'partCode', 'activityDesc', 'storeCode', 'quantity'];
    let linksMap = new Map([['partCode', {linkType: 'fixed', linkValue: 'part/', linkPrefix: '/'}]]);

    let [data, setData] = useState([]);
    let [isDialogOpen, setIsDialogOpen] = useState(false);
    let [isLoading, setIsLoading] = useState([]);

    useEffect(() => {
        fetchData(props.workorder.number)
    }, [props.workorder.number])

    let formatQuantity = (data) => {
        data.forEach(part => 
            part.quantity = part.quantity ? part.quantity + (part.partUoM ? " " + part.partUoM : "") : ""
        )
    }

    let fetchData = (workorder) => {
        setIsLoading(true)
        if (workorder) {
            WSWorkorders.getPartUsageList(workorder).then(response => {
                formatQuantity(response.body.data);
                setData(response.body.data);
                setIsLoading(false);
            }).catch(error => {
                props.handleError(error);
                setIsLoading(false);
            });
        }
    };

    let successHandler = () => {
        props.showNotification('Part usage created successfully');
        //Close dialog
        setIsDialogOpen(false);
        //Init the list of part usage again
        fetchData(props.workorder.number);
    }

    return (
        isLoading
        ?   
            <BlockUi tag="div" blocking={isLoading} style={{ width: '100%' }} />
        :
        <>
            <div style={{ width: '100%', height: '100%' }}>
                <EISTable
                    data={data}
                    headers={headers}
                    propCodes={propCodes}
                    linksMap={linksMap} />
                <Button onClick={() => setIsDialogOpen(true)} color="primary" style={buttonStyle}>
                    Add Part Usage
                </Button>
            </div>
            <PartUsageDialog
                showNotification={props.showNotification}
                handleError={props.handleError}
                handleCancel={() => setIsDialogOpen(false)}
                tabLayout={props.tabLayout}
                isDialogOpen={isDialogOpen}
                workorder={props.workorder}
                isLoading={isLoading}
                successHandler={successHandler}/>
        </>
    )
}

export default PartUsage;