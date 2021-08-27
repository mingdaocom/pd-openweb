import React from 'react';
import PropTypes from 'prop-types';
import DiscussLogFile from '../../components/DiscussLogFile';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';

export default function RecordInfoRight(props) {
  const { className, recordbase, workflow, sheetSwitchPermit, onFold, projectId } = props;
  const { isSubList, appId, viewId, appSectionId, worksheetId, recordId, recordTitle } = recordbase;
  let hiddenTabs = [];
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
  if ([...new Set(hiddenTabs)].length >= 3) {
    return '';
  }
  return (
    <div className={`recordInfoInfo ${className || ''}`}>
      <DiscussLogFile
        workflow={workflow}
        hiddenTabs={hiddenTabs}
        appId={appId}
        appSectionId={appSectionId}
        viewId={viewId}
        title={recordTitle}
        rowId={recordId}
        worksheetId={worksheetId}
        onFold={onFold}
        projectId={projectId}
      />
    </div>
  );
}

RecordInfoRight.propTypes = {
  className: PropTypes.string,
  workflow: PropTypes.element,
  recordbase: PropTypes.shape({}),
  sheetSwitchPermit: PropTypes.arrayOf(PropTypes.shape({})),
  onFold: PropTypes.func,
};
