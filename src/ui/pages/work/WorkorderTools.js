import { assignCustomFieldFromCustomField, AssignmentType, assignUserDefinedFields, assignValues } from "../EntityTools";
import { get } from "lodash";

// MAPPING BETWEEN ENTITY KEYS AND LAYOUT ID
// 定义实体键与布局ID之间的映射关系。这个映射用于将工单的不同属性映射到对应的字段代码。
export const layoutPropertiesMap =  {
        description: "description",
        equipment: "equipmentCode",
        location: "locationCode",
        workorderstatus: "statusCode",
        workordertype: "typeCode",
        woclass: "classCode",
        department: "departmentCode",
        parentwo: "parentWO",
        priority: "priorityCode",
        downtimehours: "downtimeHours",
        reportedby: "reportedBy",
        assignedto: "assignedTo",
        reqstartdate: "requestedStartDate",
        reqenddate: "requestedEndDate",
        schedstartdate: "scheduledStartDate",
        schedenddate: "scheduledEndDate",
        startdate: "startDate",
        datecompleted: "completedDate",
        problemcode: "problemCode",
        failurecode: "failureCode",
        causecode: "causeCode",
        actioncode: "actionCode",
        costcode: "costCode",
        udfchar01:	"userDefinedFields.udfchar01",
        udfchar02:	"userDefinedFields.udfchar02",
        udfchar03:	"userDefinedFields.udfchar03",
        udfchar04:	"userDefinedFields.udfchar04",
        udfchar05:	"userDefinedFields.udfchar05",
        udfchar06:	"userDefinedFields.udfchar06",
        udfchar07:	"userDefinedFields.udfchar07",
        udfchar08:	"userDefinedFields.udfchar08",
        udfchar09:	"userDefinedFields.udfchar09",
        udfchar10:	"userDefinedFields.udfchar10",
        udfchar11:	"userDefinedFields.udfchar11",
        udfchar12:	"userDefinedFields.udfchar12",
        udfchar13:	"userDefinedFields.udfchar13",
        udfchar14:	"userDefinedFields.udfchar14",
        udfchar15:	"userDefinedFields.udfchar15",
        udfchar16:	"userDefinedFields.udfchar16",
        udfchar17:	"userDefinedFields.udfchar17",
        udfchar18:	"userDefinedFields.udfchar18",
        udfchar19:	"userDefinedFields.udfchar19",
        udfchar20:	"userDefinedFields.udfchar20",
        udfchar21:	"userDefinedFields.udfchar21",
        udfchar22:	"userDefinedFields.udfchar22",
        udfchar23:	"userDefinedFields.udfchar23",
        udfchar24:	"userDefinedFields.udfchar24",
        udfchar25:	"userDefinedFields.udfchar25",
        udfchar26:	"userDefinedFields.udfchar26",
        udfchar27:	"userDefinedFields.udfchar27",
        udfchar28:	"userDefinedFields.udfchar28",
        udfchar29:	"userDefinedFields.udfchar29",
        udfchar30:	"userDefinedFields.udfchar30",
        udfchar40:	"userDefinedFields.udfchar40",
        udfnum01:	"userDefinedFields.udfnum01",
        udfnum02:	"userDefinedFields.udfnum02",
        udfnum03:	"userDefinedFields.udfnum03",
        udfnum04:	"userDefinedFields.udfnum04",
        udfnum05:	"userDefinedFields.udfnum05",
        udfnum06:	"userDefinedFields.udfnum06",
        udfnum07:	"userDefinedFields.udfnum07",
        udfnum08:	"userDefinedFields.udfnum08",
        udfnum09:	"userDefinedFields.udfnum09",
        udfnum10:	"userDefinedFields.udfnum10"
    }

    // 检查工单是否只读的自定义处理函数
export function isReadOnlyCustomHandler(workOrder) {
    // 如果工单的系统状态代码为'C'或者没有更新权限，则返回true，表示只读
    return workOrder.systemStatusCode === 'C' || !workOrder.jtAuthCanUpdate;
}

// 检查特定区域是否可用的函数
export function isRegionAvailable(regionCode, workOrderLayout) {
    //Fields and tabs
    const {fields} = workOrderLayout;  // 从工单布局中获取字段信息
    //Check according to the case
    switch (regionCode) {
        case 'CUSTOM_FIELDS_EQP':
            //Is button viewequipcustomfields
            // 检查设备自定义字段按钮是否可操作
            return fields.viewequipcustomfields && fields.viewequipcustomfields.attribute === 'O';
        case 'CUSTOM_FIELDS_PART':
            //Is button viewequipcustomfields
            // 检查部件自定义字段按钮是否可操作
            return fields.viewequipcustomfields && fields.viewequipcustomfields.attribute === 'O';
        default:
            return true; // 默认情况下，区域可用
    }
}

// 将标准工单的值分配给工单的函数
export const assignStandardWorkOrderValues = (workOrder, standardWorkOrder) => {
    const swoToWoMap = ([k, v]) => [k, standardWorkOrder[v]];  // 映射函数，用于从标准工单获取值

    // 分配不为空的源值
    workOrder = assignValues(workOrder, Object.fromEntries([
        ['classCode', 'woClassCode'],
        ['typeCode', 'workOrderTypeCode'],
        ['problemCode', 'problemCode'],
        ['priorityCode', 'priorityCode']
    ].map(swoToWoMap)), AssignmentType.SOURCE_NOT_EMPTY);

    // 分配目标为空的值
    workOrder = assignValues(workOrder, Object.fromEntries([
        ['description', 'desc'],
    ].map(swoToWoMap)), AssignmentType.DESTINATION_EMPTY);

    // 分配用户定义字段
    workOrder = assignUserDefinedFields(workOrder, standardWorkOrder.userDefinedFields, AssignmentType.DESTINATION_EMPTY);
    workOrder = assignCustomFieldFromCustomField(workOrder, standardWorkOrder.customField, AssignmentType.DESTINATION_EMPTY);

    return workOrder; // 返回更新后的工单
};
