import React, { Fragment } from 'react';
import { Radio } from 'ming-ui';

export default ({ executeType, switchExecuteType, allowAdd = false }) => {
  const EXECUTE_TYPE = [
    { text: _l('继续执行'), value: 2, desc: _l('之后节点在使用本节点对象或数据时将跳过执行') },
    { text: _l('在工作表中新增记录后继续执行'), value: 1 },
    { text: _l('中止流程，或继续执行查找结果分支'), value: 0 },
  ];

  if (!allowAdd) {
    _.remove(EXECUTE_TYPE, item => item.value === 1);
  }

  return (
    <Fragment>
      <div className="mTop20 bold">{_l('未获取到数据时')}</div>
      {EXECUTE_TYPE.map(item => (
        <div className="mTop15" key={item.value}>
          <Radio text={item.text} checked={executeType === item.value} onClick={() => switchExecuteType(item.value)} />
          {item.desc && <div className="mTop5 mLeft30 Gray_9e">{item.desc}</div>}
        </div>
      ))}
    </Fragment>
  );
};
