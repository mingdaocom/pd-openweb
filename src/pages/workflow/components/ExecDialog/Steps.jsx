import React, { Fragment, useLayoutEffect } from 'react';
import _ from 'lodash';
import { browserIsMobile } from 'src/utils/common';
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
  useLayoutEffect(() => {
    if (currentWork && !browserIsMobile()) {
      const $el = $(`#workflowStep_${currentWork.workId}`);

      if ($el[0]) $el[0].scrollIntoView();
    }
  }, []);

  return (
    <Fragment>
      {works.map((item, index) => (
        <StepItem
          key={index}
          appId={appId}
          projectId={projectId}
          controls={controls}
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
        <div className="TxtCenter Gray_75 mTop5" style={{ marginLeft: 34 }}>
          {_l('流程结束')}
        </div>
      )}
    </Fragment>
  );
};
