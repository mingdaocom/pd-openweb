import React from 'react';
import PropTypes from 'prop-types';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import DiscussLogFile from '../../components/DiscussLogFile';

export default function RecordInfoRight(props) {
  const {
    loading,
    workflowStatus,
    className,
    style,
    discussCount,
    recordbase,
    workflow,
    approval,
    isOpenNewAddedRecord,
    sheetSwitchPermit,
    onFold,
    projectId,
    formFlag,
    formdata,
    payConfig,
    instanceId,
    workId,
    isCharge,
    updatePayConfig = () => {},
  } = props;
  const { isSubList, appId, viewId, appSectionId, worksheetId, recordId, recordTitle, roleType } = recordbase;
  let hiddenTabs = [];
  const noApproved =
    !isOpenPermit(permitList.approveDetailsSwitch, sheetSwitchPermit, viewId) ||
    (md.global.Account.isPortal && !props.approved);
  if (!payConfig.rowDetailIsShowOrder) {
    hiddenTabs.push('pay');
  }
  if (isSubList) {
    hiddenTabs.push('discuss', 'files');
  }
  // 查看讨论和文件权限 默认true
  if (!isOpenPermit(permitList.recordDiscussSwitch, sheetSwitchPermit, viewId)) {
    hiddenTabs.push('discuss', 'files');
  }
  // 查看日志权限
  if (!isOpenPermit(permitList.recordLogSwitch, sheetSwitchPermit, viewId)) {
    hiddenTabs.push('logs');
  }
  // 审批权限 || 流程详情不需要显示表审批
  if (noApproved || workflow) {
    hiddenTabs.push('approval');
  }
  if (!workflow) {
    hiddenTabs.push('workflow');
  }

  if (md.global.Account.isPortal) {
    //外部门户 需要判断当前是否开始讨论
    hiddenTabs.push('logs', 'files'); //外部门户不可见日志和文件
    if (!props.allowExAccountDiscuss) {
      hiddenTabs.push('discuss');
    }
  }
  if ([...new Set(hiddenTabs)].length >= 6) {
    return '';
  }

  return (
    <div className={`recordInfoInfo ${className || ''}`} style={style}>
      <DiscussLogFile
        discussCount={discussCount}
        configLoading={loading}
        workflowStatus={workflowStatus}
        isOpenNewAddedRecord={isOpenNewAddedRecord}
        workflow={workflow}
        approval={approval}
        hiddenTabs={hiddenTabs}
        appId={appId}
        appSectionId={appSectionId}
        viewId={viewId}
        title={recordTitle}
        rowId={recordId}
        worksheetId={worksheetId}
        onFold={onFold}
        projectId={projectId}
        controls={props.controls}
        forReacordDiscussion={true}
        formFlag={formFlag}
        formdata={formdata}
        allowExAccountDiscuss={props.allowExAccountDiscuss}
        exAccountDiscussEnum={props.exAccountDiscussEnum}
        approved={props.approved}
        roleType={roleType}
        instanceId={instanceId}
        workId={workId}
        isCharge={isCharge}
        updatePayConfig={updatePayConfig}
        isHide={props.isHide}
      />
    </div>
  );
}

RecordInfoRight.propTypes = {
  isOpenNewAddedRecord: PropTypes.bool,
  className: PropTypes.string,
  workflow: PropTypes.element,
  approval: PropTypes.element,
  recordbase: PropTypes.shape({}),
  sheetSwitchPermit: PropTypes.arrayOf(PropTypes.shape({})),
  onFold: PropTypes.func,
};
