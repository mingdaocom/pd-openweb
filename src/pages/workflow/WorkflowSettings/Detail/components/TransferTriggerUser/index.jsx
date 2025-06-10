import React, { Fragment } from 'react';
import { Checkbox } from 'ming-ui';
import { NODE_TYPE } from '../../../enum';

export default ({ selectNodeType, data, updateSource }) => {
  const TEXT = {
    [NODE_TYPE.SUB_PROCESS]: _l('将子流程的触发者设置为本流程的触发者'),
    [NODE_TYPE.PBC]: _l('将业务流程的触发者设置为本流程的触发者'),
    [NODE_TYPE.LOOP]: _l('将循环流程的触发者设置为本流程的触发者'),
  };

  return (
    <Fragment>
      <div className="Font13 bold mTop20">{_l('传递触发者')}</div>
      <div className="mTop5">
        <Checkbox
          checked={data.fromTrigger}
          text={TEXT[selectNodeType]}
          onClick={checked => updateSource({ fromTrigger: !checked })}
        />
      </div>
    </Fragment>
  );
};
