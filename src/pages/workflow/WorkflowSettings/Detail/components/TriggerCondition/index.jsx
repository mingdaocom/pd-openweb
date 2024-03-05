import React, { Fragment } from 'react';
import './index.less';
import Condition from './Condition';

export default props => {
  const updateConditions = (conditions, i) => {
    let newData;

    if (conditions.length) {
      newData = props.data.map((item, index) => {
        if (i === index) {
          item.conditions = conditions;
        }

        return item;
      });
    } else {
      newData = props.data.filter((item, index) => i !== index);
    }

    props.updateSource(newData);
  };

  if (props.openNewFilter) {
    return props.data.map((item, i) => (
      <Fragment key={i}>
        <Condition
          {...props}
          data={item.conditions}
          updateSource={conditions => updateConditions(conditions, i)}
          isLast={i === props.data.length - 1}
          addConditions={() =>
            props.updateSource(props.data.concat({ conditions: [[{}]], spliceType: props.data[0].spliceType }))
          }
        />

        {i !== props.data.length - 1 && (
          <div className="flowDetailTrigger">
            <div className="Font14 triggerConditionSplit mTop15">
              <span>{props.data[0].spliceType === 1 ? _l('且') : _l('或')}</span>
            </div>
          </div>
        )}
      </Fragment>
    ));
  }

  return <Condition {...props} />;
};
