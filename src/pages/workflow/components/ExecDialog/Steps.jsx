import React, { Fragment, useLayoutEffect } from 'react';
import _ from 'lodash';
import { usePreviewAttachments } from 'src/components/previewAttachments/previewAttachments';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import StepItem from './components/StepItem';

export default ({
  worksheetId,
  rowId,
  currentWork,
  currentType,
  works,
  status,
  currents = [],
  onChangeCurrentWork = () => {},
  appId,
  projectId,
  controls,
}) => {
  const { open: openPreviewAttachments, holder: previewAttachmentsHolder } = usePreviewAttachments();

  useLayoutEffect(() => {
    if (currentWork && !browserIsMobile()) {
      const $el = $(`#workflowStep_${currentWork.workId}`);

      if ($el[0]) $el[0].scrollIntoView();
    }
  }, []);

  return (
    <Fragment>
      {previewAttachmentsHolder}
      {works.map((item, index) => (
        <StepItem
          key={index}
          appId={appId}
          projectId={projectId}
          controls={controls}
          openPreviewAttachments={openPreviewAttachments}
          isLast={index === works.length - 1}
          data={item}
          currentWork={currentWork}
          currentType={currentType}
          worksheetId={worksheetId}
          rowId={rowId}
          status={status}
          currents={currents}
          onChangeCurrentWork={onChangeCurrentWork}
        />
      ))}
      {_.includes([2, 3, 4, 6], status) && (
        <div className="TxtCenter textSecondary mTop5" style={{ marginLeft: 34 }}>
          {_l('流程结束')}
        </div>
      )}
    </Fragment>
  );
};
