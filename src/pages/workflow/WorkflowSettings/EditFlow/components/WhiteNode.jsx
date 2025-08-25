import React from 'react';
import cx from 'classnames';

export default ({
  className,
  IconElement,
  nodeId,
  nodeName,
  nodeDesc,
  isComplete,
  isCopy,
  hasError,
  isActive,
  onClick = () => {},
}) => {
  return (
    <div className="flexColumn">
      <section className="workflowBox" data-id={nodeId}>
        <div
          className={cx(
            'workflowItem',
            className,
            { workflowItemDisabled: isCopy },
            { errorShadow: hasError },
            { active: isActive },
          )}
          onMouseDown={onClick}
        >
          {IconElement && <div className="workflowAvatars flexRow">{IconElement}</div>}
          <div className="workflowContent TxtCenter">
            <div className="Font15 bold mTop15">{nodeName}</div>
            <div
              className={cx(
                'Font14 bold mTop5 flexRow alignItemsCenter justifyContentCenter',
                IconElement ? 'mBottom5' : 'mBottom15',
              )}
              style={{ color: isComplete ? '#4CAF50' : '#1677ff' }}
            >
              {isComplete && <i className="icon-done Font16 mRight8" />}
              {nodeDesc}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
