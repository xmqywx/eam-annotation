import React from "react";
import releaseNotesFile from "../../../CHANGELOG.md";
import ReleaseNotes from "eam-components/dist/ui/components/releasenotes/ReleaseNotes";

// 定义ReleaseNotesPage组件，此组件用于在页面上展示发布说明
const ReleaseNotesPage = () => {
    // 使用ReleaseNotes组件，并传入releaseNotesFile作为file属性
    return <ReleaseNotes file={releaseNotesFile} />;
};

export default ReleaseNotesPage;

