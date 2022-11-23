import React from 'react';
import PropTypes from 'prop-types';
import DiscussLogFile from '../../components/DiscussLogFile';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';

export default function RecordInfoRight(props) {
  const { className, recordbase, workflow, approval, sheetSwitchPermit, onFold, projectId, formFlag, formdata } = props;
  const { isSubList, appId, viewId, appSectionId, worksheetId, recordId, recordTitle } = recordbase;
  let hiddenTabs = [];
  if (isSubList) {
    hiddenTabs.push('discuss', 'discussPortal', 'files');
  }
  // 查看讨论和文件权限 默认true
  if (!isOpenPermit(permitList.recordDiscussSwitch, sheetSwitchPermit, viewId)) {
    hiddenTabs.push('discuss', 'discussPortal', 'files');
  }
  // 查看日志权限
  if (!isOpenPermit(permitList.recordLogSwitch, sheetSwitchPermit, viewId)) {
    hiddenTabs.push('logs');
  }
  // 审批权限 || 流程详情不需要显示表审批
  if (!isOpenPermit(permitList.approveDetailsSwitch, sheetSwitchPermit, viewId) || workflow) {
    hiddenTabs.push('approval');
  }
  if (!workflow) {
    hiddenTabs.push('workflow');
  }


  if (md.global.Account.isPortal) {
    //外部门户 需要判断当前是否开始讨论
    hiddenTabs.push('logs', 'files'); //外部门户不可见日志和文件
    if (!props.allowExAccountDiscuss) {
      return '';
    } else {
      if (props.exAccountDiscussEnum === 0) {
        hiddenTabs.push('discussPortal'); //允许外部门户参与讨论，且全部可见 不显示外部门户讨论
      } else {
        hiddenTabs.push('discuss'); //允许外部门户参与讨论，且全部可见 不显示内部讨论
      }
    }
  } else {
    if (props.allowExAccountDiscuss) {
      if (props.exAccountDiscussEnum === 0) {
        hiddenTabs.push('discussPortal'); //允许外部门户参与讨论，且全部可见 不单独显示外部门户讨论
      }
    } else {
      hiddenTabs.push('discussPortal'); //不允许外部门户参与讨论，不显示外部门户讨论
    }
  }
  if ([...new Set(hiddenTabs)].length >= 6) {
    return '';
  }
  return (
    <div className={`recordInfoInfo ${className || ''}`}>
      <DiscussLogFile
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
      />
    </div>
  );
}

RecordInfoRight.propTypes = {
  className: PropTypes.string,
  workflow: PropTypes.element,
  approval: PropTypes.element,
  recordbase: PropTypes.shape({}),
  sheetSwitchPermit: PropTypes.arrayOf(PropTypes.shape({})),
  onFold: PropTypes.func,
};
