import React from 'react';
import { pick } from 'lodash';
import PropTypes from 'prop-types';
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
    onFold,
    projectId,
    formFlag,
    formdata,
    hiddenTabs = [],
    instanceId,
    workId,
    isCharge,
    updatePayConfig = () => {},
    updateDiscussCount = () => {},
    worksheetOperationLogPermission,
  } = props;
  const { appId, viewId, viewType, appSectionId, worksheetId, recordId, recordTitle, roleType } = recordbase;

  const recordLogPermissionProps = worksheetOperationLogPermission
    ? pick(worksheetOperationLogPermission, ['allowExport', 'showRequestTypeFilter', 'showOperatorFilter'])
    : {};

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
        viewType={viewType}
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
        {...recordLogPermissionProps}
        instanceId={instanceId}
        workId={workId}
        isCharge={isCharge}
        updatePayConfig={updatePayConfig}
        updateDiscussCount={updateDiscussCount}
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
  hiddenTabs: PropTypes.arrayOf(PropTypes.string),
  onFold: PropTypes.func,
};
