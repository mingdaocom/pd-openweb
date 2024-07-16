import React, { useLayoutEffect, Fragment } from 'react';
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
    if (currentWork) {
      const $el = $(`#workflowStep_${currentWork.workId}`);

      $el.closest('.nano').nanoScroller({ scrollTo: $el });
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
