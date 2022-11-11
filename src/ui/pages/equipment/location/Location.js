import React from "react";
import Comments from "eam-components/dist/ui/components/comments/Comments";
import LocationIcon from "@mui/icons-material/Room";
import BlockUi from "react-block-ui";
import "react-block-ui/style.css";
import WSLocation from "../../../../tools/WSLocation";
import {ENTITY_TYPE} from "../../../components/Toolbar";
import CustomFields from "../../../components/customfields/CustomFields";
import EDMSDoclightIframeContainer from "../../../components/iframes/EDMSDoclightIframeContainer";
import UserDefinedFields from "../../../components/userdefinedfields/UserDefinedFields";
import EquipmentHistory from "../components/EquipmentHistory.js";
import EquipmentWorkOrders from "../components/EquipmentWorkOrders";
import EamlightToolbarContainer from "./../../../components/EamlightToolbarContainer";
import LocationDetails from "./LocationDetails";
import LocationGeneral from "./LocationGeneral";
import LocationHierarchy from "./LocationHierarchy";
import EntityRegions from "../../../components/entityregions/EntityRegions";
import { isCernMode } from '../../../components/CERNMode';
import { TAB_CODES } from '../../../components/entityregions/TabCodeMapping';
import { getTabAvailability, getTabInitialVisibility } from '../../EntityTools';
import useEntity from "hooks/useEntity";

import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import FunctionsRoundedIcon from '@mui/icons-material/FunctionsRounded';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded'; 
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

export default Location = (props) => {

    const {screenLayout: locationLayout, entity: location, loading, readOnly, isModified,
        screenPermissions, screenCode, userData, applicationData, newEntity, commentsComponent,
        isHiddenRegion, getHiddenRegionState, getUniqueRegionID, showEqpTree, 
        toggleHiddenRegion, setRegionVisibility, setLayoutProperty,
        newHandler, saveHandler, deleteHandler, updateEntityProperty: updateEquipmentProperty, register} = useEntity({
            WS: {
                create: WSLocation.create,
                read: WSLocation.get,
                update: WSLocation.update,
                delete: WSLocation.remove,
                new:  WSLocation.init
            },
            postActions: {
                create: postCreate,
                read: postRead
            },
            entityCode: "LOC",
            entityDesc: "Location",
            entityURL: "/location/",
            entityCodeProperty: "code",
            screenProperty: "locationScreen",
            layoutProperty: "locationLayout"
        });


    function postRead() {
        setLayoutProperty("location", this.state.location);
    }

    function postCreate(location) {
        commentsComponent.current?.createCommentForNewEntity(location.code);
    }

    const getRegions = () => {
        const tabs = locationLayout.tabs; 

        const commonProps = {
            location,
            newEntity,
            locationLayout,
            updateEquipmentProperty,
            register
        }

        return [
            {
                id: 'GENERAL',
                label: 'General',
                isVisibleWhenNewEntity: true,
                maximizable: false,
                render: () => 
                    <LocationGeneral
                        {...commonProps}/>
                ,
                column: 1,
                order: 1,
                summaryIcon: DescriptionIcon,
                ignore: !getTabAvailability(tabs, TAB_CODES.RECORD_VIEW),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.RECORD_VIEW)
            },
            {
                id: 'DETAILS',
                label: 'Details',
                isVisibleWhenNewEntity: true,
                maximizable: false,
                render: () => 
                    <LocationDetails
                        {...commonProps} />
                ,
                column: 1,
                order: 2,
                summaryIcon: AssignmentIcon,
                ignore: !getTabAvailability(tabs, TAB_CODES.RECORD_VIEW),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.RECORD_VIEW)
            },
            {
                id: 'HIERARCHY',
                label: 'Hierarchy',
                isVisibleWhenNewEntity: true,
                maximizable: false,
                render: () => 
                    <LocationHierarchy
                        {...commonProps} />
                ,
                column: 1,
                order: 3,
                summaryIcon: AccountTreeRoundedIcon,
                ignore: !getTabAvailability(tabs, TAB_CODES.RECORD_VIEW),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.RECORD_VIEW)
            },
            {
                id: 'WORKORDERS',
                label: 'Work Orders',
                isVisibleWhenNewEntity: false,
                maximizable: true,
                render: ({ panelQueryParams }) => 
                    <EquipmentWorkOrders
                        equipmentcode={location.code}
                        defaultFilter={panelQueryParams.defaultFilter}
                        equipmenttype='L' />
                ,
                column: 1,
                order: 4,
                summaryIcon: ContentPasteIcon,
                ignore: !getTabAvailability(tabs, TAB_CODES.WORKORDERS),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.WORKORDERS)
            },
            {
                id: 'HISTORY',
                label: 'History',
                isVisibleWhenNewEntity: false,
                maximizable: true,
                render: () => 
                    <EquipmentHistory
                        equipmentcode={location.code} />
                ,
                column: 1,
                order: 5,
                summaryIcon: ManageHistoryIcon,
                ignore: !isCernMode || !getTabAvailability(tabs, TAB_CODES.WORKORDERS),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.WORKORDERS)
            },
            {
                id: 'EDMSDOCUMENTS',
                label: 'EDMS Documents',
                isVisibleWhenNewEntity: false,
                maximizable: true,
                render: () => 
                    <EDMSDoclightIframeContainer
                        objectType="L"
                        objectID={location.code} />
                ,
                RegionPanelProps: {
                    detailsStyle: { padding: 0 }
                },
                column: 2,
                order: 6,
                summaryIcon: FunctionsRoundedIcon,
                ignore: !isCernMode || !getTabAvailability(tabs, TAB_CODES.EDMS_DOCUMENTS_LOCATIONS),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.EDMS_DOCUMENTS_LOCATIONS)
            },
            // {
            //     id: 'NCRS',
            //     label: 'NCRs',
            //     isVisibleWhenNewEntity: false,
            //     maximizable: false,
            //     render: () => 
            //         <EDMSWidget
            //             objectID={location.code}
            //             objectType="L"
            //             creationMode="NCR"
            //             edmsDocListLink={applicationData.EL_EDMSL}
            //             showError={showError}
            //             showSuccess={showSuccess} />
            //     ,
            //     column: 2,
            //     order: 7
            // },
             {
                id: 'COMMENTS',
                label: 'Comments',
                isVisibleWhenNewEntity: true,
                maximizable: false,
                render: () => 
                    <Comments ref={comments => commentsComponent.current = comments}
                        entityCode="LOC"
                        entityKeyCode={!newEntity ? location.code : undefined}
                        userCode={userData.eamAccount.userCode}
                        allowHtml={true}
                        disabled={readOnly}/>
                ,
                RegionPanelProps: {
                    detailsStyle: { padding: 0 }
                },
                column: 2,
                order: 8,
                summaryIcon: DriveFileRenameOutlineIcon,
                ignore: !getTabAvailability(tabs, TAB_CODES.COMMENTS),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.COMMENTS)
            },
            {
                id: 'USERDEFINEDFIELDS',
                label: 'User Defined Fields',
                isVisibleWhenNewEntity: true,
                maximizable: false,
                render: () => 
                    <UserDefinedFields
                        entityLayout={locationLayout.fields}
                        {...commonProps} />
                ,
                column: 2,
                order: 9,
                summaryIcon: AssignmentIndIcon,
                ignore: !getTabAvailability(tabs, TAB_CODES.RECORD_VIEW),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.RECORD_VIEW)
            },
            {
                id: 'CUSTOMFIELDS',
                label: 'Custom Fields',
                isVisibleWhenNewEntity: true,
                maximizable: false,
                render: () => 
                    <CustomFields
                        entityCode='LOC'
                        entityKeyCode={location.code}
                        classCode={location.classCode}
                        customFields={location.customField}
                        updateEntityProperty={updateEquipmentProperty}
                        readonly={readOnly} />
                ,
                column: 2,
                order: 10,
                summaryIcon: ListAltIcon,
                ignore: !getTabAvailability(tabs, TAB_CODES.RECORD_VIEW),
                initialVisibility: getTabInitialVisibility(tabs, TAB_CODES.RECORD_VIEW)
            },
            // {
            //     id: 'EQUIPMENTGRAPH',
            //     label: 'Equipment Graph',
            //     isVisibleWhenNewEntity: false,
            //     maximizable: true,
            //     render: () => 
            //         <EquipmentGraphIframe
            //             equipmentCode={location.code} 
            //             equipmentGraphURL={applicationData.EL_EQGRH}
            //         />
            //     ,
            //     RegionPanelProps: {
            //         detailsStyle: { padding: 0 }
            //     },
            //     column: 2,
            //     order: 11,
            //     ignore: !isCernMode,
            //     initialVisibility: false
            // },
        ]

    }

    if (!location) {
        return React.Fragment;
    }

    return (
        <BlockUi tag="div" blocking={loading} style={{height: "100%", width: "100%"}}>
            <EamlightToolbarContainer 
                            isModified={isModified} 
                                newEntity={newEntity}
                                entityScreen={screenPermissions}
                                entityName="Location"
                                entityKeyCode={location.code}
                                saveHandler={saveHandler}
                                newHandler={newHandler}
                                deleteHandler={deleteHandler}
                                toolbarProps={{
                                entityDesc: "Location",
                                entity: location,
                                //postInit: this.postInit.bind(this),
                                //setLayout: this.setLayout.bind(this),
                                newEntity: newEntity,
                                applicationData: applicationData,
                                extendedLink: applicationData.EL_LOCLI,
                                screencode: screenCode,
                                //copyHandler: this.copyEntity.bind(this),
                                entityType: ENTITY_TYPE.LOCATION,
                                screens: userData.screens,
                                workorderScreencode: userData.workOrderScreen
                                }}
                                width={730}
                                entityIcon={<LocationIcon style={{height: 18}}/>}
                                toggleHiddenRegion={toggleHiddenRegion}
                                getUniqueRegionID={getUniqueRegionID}
                                regions={getRegions()}
                                isHiddenRegion={isHiddenRegion}
                                getHiddenRegionState={getHiddenRegionState}
                                />
            <EntityRegions
                showEqpTree={showEqpTree}
                regions={getRegions()}
                isNewEntity={newEntity} 
                isHiddenRegion={isHiddenRegion}
                setRegionVisibility={setRegionVisibility}
                getUniqueRegionID={getUniqueRegionID}
                getHiddenRegionState={getHiddenRegionState}/>
        </BlockUi>
    )
    
}
